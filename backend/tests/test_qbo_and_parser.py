"""
Unit Tests for LedgerSnap .QBO Generator and PDF Parser Date/Encoding Logic
Verifies all 6 Critical Production Bug Fixes:
1. DD/MM/YYYY vs MM/DD/YYYY Date Format Locking
2. Hebrew/Unicode Text Preservation (UTF-8) & Smart Transliteration (ASCII)
3. Dynamic Currency (<CURDEF>) Detection & Override
4. Deterministic Account/Bank ID (<ACCTID>, <BANKID>, Credit Card vs Bank Msg)
5. Deterministic Content-Hashed <FITID> Deduplication
6. Chronological Timestamps (<DTSTART>, <DTEND>, <DTASOF>)
"""

import unittest
import os
import sys

# Ensure backend directory is in python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from converters.pdf_parser import (
    detect_statement_date_format,
    parse_date,
    clean_currency_glued_suffixes,
    extract_account_number
)
from converters.qbo_generator import (
    generate_qbo,
    generate_fitid,
    sanitize_payee_name,
    transliterate_hebrew_to_ascii,
    BANKING_TRANSLATIONS
)


class TestDateFormatLocking(unittest.TestCase):
    """Test 1: DD/MM/YYYY vs MM/DD/YYYY Date Inversion Fix"""

    def test_document_level_detection_locks_to_dd_mm_yyyy(self):
        # Sample text representing an Israeli/International statement with Hebrew and dates
        statement_sample = """
        דף חשבון לתקופה: 01/08/2026 - 15/10/2026
        בנק הפועלים בע"מ - סניף 612
        14/09/2026 העברה בנקאית זכות 5,400.00
        11/09/2026 עמלת פעולה חובה 12.50
        10/09/2026 סופר פארם חובה 240.80
        01/09/2026 משכורת זכות 18,200.00
        11/10/2026 ביטוח לאומי חובה 450.00
        12/08/2026 מקס איט פיננסים חובה 1,230.00
        """
        detected_fmt = detect_statement_date_format(statement_sample)
        self.assertEqual(detected_fmt, 'DD/MM/YYYY', "Should lock statement to DD/MM/YYYY")

    def test_multi_month_israeli_dates_remain_in_correct_months(self):
        # Target dates that previously suffered inverted month/day
        test_cases = [
            ("14/09/2026", "2026-09-14", 9, 14),
            ("11/09/2026", "2026-09-11", 9, 11),  # MUST NOT become Nov 9 (2026-11-09)
            ("10/09/2026", "2026-09-10", 9, 10),  # MUST NOT become Oct 9 (2026-10-09)
            ("01/09/2026", "2026-09-01", 9, 1),   # MUST NOT become Jan 9 (2026-01-09)
            ("11/10/2026", "2026-10-11", 10, 11), # MUST NOT become Nov 10 (2026-11-10)
            ("12/08/2026", "2026-08-12", 8, 12),  # MUST NOT become Dec 8 (2026-12-08)
        ]

        for date_str, expected_iso, expected_month, expected_day in test_cases:
            parsed = parse_date(date_str, format_preference='DD/MM/YYYY')
            self.assertEqual(parsed, expected_iso, f"Failed for {date_str}: got {parsed}, expected {expected_iso}")
            year, month, day = [int(p) for p in parsed.split('-')]
            self.assertEqual(month, expected_month, f"Month flipped for {date_str}!")
            self.assertEqual(day, expected_day, f"Day flipped for {date_str}!")


class TestHebrewPreservationAndTransliteration(unittest.TestCase):
    """Test 2: Non-ASCII / Hebrew Text Stripping Fix"""

    def test_utf8_mode_preserves_hebrew_payee_and_memo(self):
        transactions = [
            {
                "date": "2026-09-14",
                "description": "העברה בנקאית למשה כהן בע\"מ",
                "memo": "העברה בנקאית לחשבון 12345 משה כהן בע\"מ אסמכתא 998877",
                "amount": 5400.00
            },
            {
                "date": "2026-09-11",
                "description": "עמלת פעולה בערוץ ישיר",
                "memo": "עמלת פעולה בערוץ ישיר תעריפון יולי 2026",
                "amount": -12.50
            }
        ]

        qbo = generate_qbo(
            transactions,
            bank_name="Bank Hapoalim",
            currency="ILS",
            export_mode="utf8"
        )

        # Verify OFX Header specifies UTF-8
        self.assertIn("ENCODING:UTF-8", qbo)
        self.assertIn("CHARSET:NONE", qbo)

        # Verify Hebrew payee is preserved in <NAME>
        self.assertIn("<NAME>העברה בנקאית למשה כהן בע\"מ", qbo)
        self.assertIn("<NAME>עמלת פעולה בערוץ ישיר", qbo)

        # Verify <MEMO> contains full description
        self.assertIn("<MEMO>העברה בנקאית לחשבון 12345 משה כהן בע\"מ אסמכתא 998877", qbo)

        # Verify NEVER replaced with generic "Transaction" or "-"
        self.assertNotIn("<NAME>Transaction", qbo)
        self.assertNotIn("<NAME>-", qbo)

    def test_ascii_mode_transliterates_hebrew_cleanly(self):
        raw_hebrew = "חיוב כרטיס אשראי מקס"
        clean_ascii = sanitize_payee_name(raw_hebrew, export_mode="ascii")
        self.assertIn("Credit Card Charge", clean_ascii)
        self.assertTrue(all(ord(c) < 128 for c in clean_ascii), "ASCII mode must contain only ASCII characters")

    def test_xml_control_characters_escaped(self):
        desc_with_specials = "AT&T <Wireless> & Apple Store"
        sanitized = sanitize_payee_name(desc_with_specials, export_mode="utf8")
        self.assertIn("&amp;", sanitized)
        self.assertNotIn("<", sanitized)
        self.assertNotIn(">", sanitized)


class TestCurrencyAndAccountDetection(unittest.TestCase):
    """Test 3 & 4: Currency and Bank/Account ID Fixes"""

    def test_currency_set_to_ils(self):
        transactions = [
            {"date": "2026-09-14", "description": "Deposit", "amount": 1000.0}
        ]
        qbo = generate_qbo(transactions, currency="ILS")
        self.assertIn("<CURDEF>ILS", qbo)
        self.assertNotIn("<CURDEF>USD", qbo)

    def test_currency_glued_suffixes_cleaned(self):
        dirty_raw = "223366-7598275-15140918214043ILS"
        cleaned = clean_currency_glued_suffixes(dirty_raw)
        self.assertEqual(cleaned, "223366-7598275-15140918214043")

    def test_credit_card_switches_to_creditcard_message_set(self):
        transactions = [
            {"date": "2026-09-14", "description": "Starbucks Coffee", "amount": -15.50}
        ]
        qbo = generate_qbo(
            transactions,
            account_type="CREDITCARD",
            account_id="5555444433332222"
        )
        self.assertIn("<CREDITCARDMSGSRSV1>", qbo)
        self.assertIn("<CCACCTFROM>", qbo)
        self.assertIn("<ACCTID>5555444433332222", qbo)
        self.assertNotIn("<BANKMSGSRSV1>", qbo)


class TestDeterministicFitidDeduplication(unittest.TestCase):
    """Test 5: Deterministic FITID Generator"""

    def test_identical_transactions_produce_identical_fitid_across_batches(self):
        t1 = {"date": "2026-09-14", "description": "Payroll Gusto Inc", "amount": 5400.0}
        
        # Batch A (First statement upload)
        fitid_a = generate_fitid("987654321", t1["date"], t1["amount"], t1["description"], intra_day_idx=0)
        
        # Batch B (Overlapping statement uploaded weeks later)
        fitid_b = generate_fitid("987654321", t1["date"], t1["amount"], t1["description"], intra_day_idx=0)
        
        self.assertEqual(fitid_a, fitid_b, "FITID must be identical for identical transactions to deduplicate")

    def test_intraday_identical_rows_have_unique_indices(self):
        t1 = {"date": "2026-09-14", "description": "Uber Trip", "amount": -25.0}
        fitid_trip_1 = generate_fitid("123", t1["date"], t1["amount"], t1["description"], intra_day_idx=0)
        fitid_trip_2 = generate_fitid("123", t1["date"], t1["amount"], t1["description"], intra_day_idx=1)
        
        self.assertNotEqual(fitid_trip_1, fitid_trip_2, "Same-day identical transactions must have distinct FITIDs")


class TestChronologicalTimestamps(unittest.TestCase):
    """Test 6: Chronological Sorting and Timestamps"""

    def test_dtstart_dtend_dtasof_format_and_order(self):
        # Deliberately out-of-order transactions
        transactions = [
            {"date": "2026-09-14", "description": "Middle Date", "amount": 100.0},
            {"date": "2026-10-11", "description": "Latest Date", "amount": 200.0},
            {"date": "2026-08-12", "description": "Earliest Date", "amount": 50.0},
        ]
        
        qbo = generate_qbo(transactions)
        
        # Formatted as 14-digit YYYYMMDD120000
        self.assertIn("<DTSTART>20260812120000", qbo, "DTSTART must be earliest transaction")
        self.assertIn("<DTEND>20261011120000", qbo, "DTEND must be latest transaction")
        self.assertIn("<DTASOF>20261011120000", qbo, "DTASOF must be closing date")


if __name__ == '__main__':
    unittest.main()
