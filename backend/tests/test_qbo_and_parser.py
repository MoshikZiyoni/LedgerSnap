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
    extract_account_number,
    extract_transactions_from_pdf,
    validate_balance_transitions,
    normalize_rtl_text
)
from converters.qbo_generator import (
    generate_qbo,
    generate_ofx,
    generate_fitid,
    sanitize_payee_name,
    transliterate_hebrew_to_ascii,
    BANKING_TRANSLATIONS,
    classify_transaction,
    validate_qbo_string,
    BANK_INTU_PRESETS,
    normalize_rtl_text as qbo_normalize_rtl
)
from converters.excel_generator import (
    generate_excel,
    generate_qbo_csv_3col,
    generate_qbo_csv_4col,
    generate_hashavshevet_excel,
    generate_hashavshevet_csv,
    generate_hashavshevet_dat
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
        
        # Formatted as 14-digit YYYYMMDD120000[0:GMT]
        self.assertIn("<DTSTART>20260812120000[0:GMT]", qbo, "DTSTART must be earliest transaction")
        self.assertIn("<DTEND>20261011120000[0:GMT]", qbo, "DTEND must be latest transaction")
        self.assertIn("<DTASOF>20261011120000[0:GMT]", qbo, "DTASOF must be closing date")


class TestFiBlockAndIntuBid(unittest.TestCase):
    """Phase 1.1: Complete <FI> Institution Block and Configurable <INTU.BID>"""

    def test_fi_block_present_inside_sonrs_paired_with_intu_bid(self):
        transactions = [{"date": "2026-09-14", "description": "Deposit", "amount": 1000.0}]
        qbo = generate_qbo(transactions, bank_id="10898", intu_bid="10898", bank_name="JPMorgan Chase")
        self.assertIn("<FI>", qbo)
        self.assertIn("<ORG>JPMorgan Chase", qbo)
        self.assertIn("<FID>10898", qbo)
        self.assertIn("</FI>", qbo)
        self.assertIn("<INTU.BID>10898", qbo)

    def test_unknown_bank_falls_back_to_wells_fargo_3000(self):
        transactions = [{"date": "2026-09-14", "description": "Deposit", "amount": 1000.0}]
        qbo = generate_qbo(transactions, intu_bid="3000")
        self.assertIn("<ORG>Wells Fargo", qbo)
        self.assertIn("<FID>3000", qbo)
        self.assertIn("<INTU.BID>3000", qbo)


class TestDeterministicFitidSha256(unittest.TestCase):
    """Phase 1.2: Deterministic SHA-256 <FITID> Generation"""

    def test_fitid_format_and_determinism(self):
        fitid1 = generate_fitid("acct123", "2026-10-16", 150.25, "Office Depot", intra_day_idx=0)
        fitid2 = generate_fitid("acct123", "2026-10-16", 150.25, "Office Depot", intra_day_idx=0)
        self.assertEqual(fitid1, fitid2)
        # Must start with YYYYMMDD-
        self.assertTrue(fitid1.startswith("20261016-"))
        # Must have 12 hex chars after hyphen
        parts = fitid1.split("-")
        self.assertEqual(len(parts), 2)
        self.assertEqual(len(parts[1]), 12)
        self.assertTrue(parts[1].isalnum())

    def test_same_day_identical_tx_index_yields_unique_fitids(self):
        fitid_idx0 = generate_fitid("acct123", "2026-10-16", 10.0, "Coffee Shop", intra_day_idx=0)
        fitid_idx1 = generate_fitid("acct123", "2026-10-16", 10.0, "Coffee Shop", intra_day_idx=1)
        self.assertNotEqual(fitid_idx0, fitid_idx1)


class TestRtlVisualParenthesesBug(unittest.TestCase):
    """Phase 1.3: Fix Visual RTL Parentheses Bug in Hebrew / Bidirectional Text"""

    def test_broken_israeli_bank_parentheses_repaired(self):
        broken1 = "אוצר-חיל/ציפל ערן/)שירותי דיגיטל ("
        fixed1 = normalize_rtl_text(broken1)
        self.assertIn("(שירותי דיגיטל)", fixed1)

        broken2 = "אוצר-חיל/ציפל ערן/)יולי )הערת ל"
        fixed2 = normalize_rtl_text(broken2)
        self.assertIn("(יולי (הערת ל))", fixed2)

    def test_normal_hebrew_unchanged(self):
        normal = "העברה בנקאית - סניף ראשי"
        self.assertEqual(normalize_rtl_text(normal), normal)


class TestContextAwareTrntypeAndChecknum(unittest.TestCase):
    """Phase 1.4: Context-Aware <TRNTYPE> Classification & <CHECKNUM> Support"""

    def test_check_classification_and_checknum_extracted(self):
        trntype, check_num = classify_transaction("פירעון שיק 0045812 לטובת ספק", -4500.0)
        self.assertEqual(trntype, "CHECK")
        self.assertEqual(check_num, "0045812")

        trntype_en, check_num_en = classify_transaction("Check # 98124 Vendor Pmt", -250.0)
        self.assertEqual(trntype_en, "CHECK")
        self.assertEqual(check_num_en, "98124")

    def test_fee_classification(self):
        trntype, _ = classify_transaction("עמלת עריכת מסמכים ודמי ניהול", -18.50)
        self.assertEqual(trntype, "FEE")

    def test_transfer_classification(self):
        trntype, _ = classify_transaction("העברה מחשבון 987654 ביט", 500.0)
        self.assertEqual(trntype, "XFER")

    def test_interest_classification(self):
        trntype, _ = classify_transaction("זיכוי ריבית זכות חודשית", 42.10)
        self.assertEqual(trntype, "INT")


class TestCreditCardLiabilityConventions(unittest.TestCase):
    """Phase 1.5: Credit Card Account Type (<CCSTMTRS>) and Sign Conventions"""

    def test_credit_card_omits_bankid_and_accttype(self):
        transactions = [
            {"date": "2026-10-01", "description": "Office Supplies", "amount": -120.0, "classification": "DEBIT"},
            {"date": "2026-10-05", "description": "Payment Received - Thank You", "amount": 500.0, "classification": "CREDIT"}
        ]
        qbo = generate_qbo(transactions, account_type="CREDITLINE", account_id="998877665544")
        self.assertIn("<CREDITCARDMSGSRSV1>", qbo)
        self.assertIn("<CCSTMTRS>", qbo)
        self.assertIn("<CCACCTFROM>", qbo)
        self.assertIn("<ACCTID>998877665544", qbo)
        # Strict OFX spec: <BANKID> and <ACCTTYPE> NOT allowed in <CCACCTFROM>
        self.assertNotIn("<BANKID>", qbo)
        self.assertNotIn("<ACCTTYPE>", qbo)
        self.assertNotIn("<BANKMSGSRSV1>", qbo)

    def test_card_purchases_negative_payments_positive(self):
        transactions = [
            {"date": "2026-10-01", "description": "Purchase at Supermarket", "amount": 85.00}
        ]
        qbo = generate_qbo(transactions, account_type="CREDITLINE")
        self.assertIn("<TRNAMT>-85.00", qbo)
        self.assertIn("<TRNTYPE>DEBIT", qbo)


class TestStrictTruncationAndNoonGmtTimestamps(unittest.TestCase):
    """Phase 1.6: Strict Field Truncation, Escaping & Noon GMT Timestamps"""

    def test_noon_gmt_timestamps(self):
        transactions = [{"date": "2026-10-16", "description": "Deposit", "amount": 100.0}]
        qbo = generate_qbo(transactions)
        self.assertIn("<DTPOSTED>20261016120000[0:GMT]", qbo)
        self.assertIn("<DTSTART>20261016120000[0:GMT]", qbo)
        self.assertIn("<DTEND>20261016120000[0:GMT]", qbo)

    def test_name_truncated_to_32_chars_and_memo_to_255(self):
        long_name = "Super Long Payee Name Exceeding Thirty Two Characters Length Limit"
        long_memo = "M" * 300
        transactions = [{"date": "2026-10-16", "description": long_name, "memo": long_memo, "amount": 50.0}]
        qbo = generate_qbo(transactions)
        import re
        names = re.findall(r"<NAME>(.*?)(?:\r?\n|$)", qbo)
        for n in names:
            self.assertLessEqual(len(n), 32)
        memos = re.findall(r"<MEMO>(.*?)(?:\r?\n|$)", qbo)
        for m in memos:
            self.assertLessEqual(len(m), 255)


class TestIsraeliSampleStatementRegression(unittest.TestCase):
    """Phase 5: Israeli Statement Regression Test with 59-Transaction Sample"""

    @classmethod
    def setUpClass(cls):
        fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "israeli_sample_59_txns.pdf")
        if not os.path.exists(fixture_path):
            raise unittest.SkipTest(f"Fixture {fixture_path} not found")
        with open(fixture_path, "rb") as f:
            pdf_bytes = f.read()
        cls.transactions, cls.bank, cls.summary = extract_transactions_from_pdf(pdf_bytes)

    def test_59_transactions_net_movement_and_balances(self):
        self.assertEqual(len(self.transactions), 59)
        self.assertEqual(self.summary["count"], 59)
        # Credits: +356,754.81
        self.assertAlmostEqual(self.summary["total_credits"], 356754.81, places=2)
        # Debits: -331,141.07
        self.assertAlmostEqual(self.summary["total_debits"], 331141.07, places=2)
        # Net movement: +25,613.74 ILS
        self.assertAlmostEqual(self.summary["net_change"], 25613.74, places=2)
        # Reconciled status
        self.assertTrue(self.summary["is_reconciled"])

    def test_deterministic_fitids_across_repeated_runs(self):
        qbo_run1 = generate_qbo(self.transactions, bank_name=self.bank, currency="ILS")
        qbo_run2 = generate_qbo(self.transactions, bank_name=self.bank, currency="ILS")
        self.assertEqual(qbo_run1, qbo_run2, "Repeated generation must be 100% identical")

        # In-memory round-trip validation
        val = validate_qbo_string(qbo_run1)
        self.assertTrue(val["valid"], f"QBO validation errors: {val.get('errors')}")
        self.assertEqual(val["transaction_count"], 59)
        self.assertEqual(len(val["fitids"]), 59, "All 59 FITIDs must be unique")
        for name in val["names"]:
            self.assertLessEqual(len(name), 32, f"Name '{name}' exceeds 32 characters")

    def test_rtl_reversed_parentheses_repaired_in_output(self):
        qbo = generate_qbo(self.transactions, bank_name=self.bank, currency="ILS")
        self.assertNotIn(")שירותי דיגיטל (", qbo)
        self.assertNotIn(")יולי )הערת ל (", qbo)


class TestReconciliationDiscrepancyDetection(unittest.TestCase):
    """Phase 2 & 5: Automated Reconciliation Engine Discrepancy Flagging"""

    def test_modifying_transaction_by_one_cent_flags_discrepancy(self):
        sample_rows = [
            {"date": "2026-10-01", "description": "Deposit A", "amount": 1000.00, "balance": 1000.00},
            {"date": "2026-10-02", "description": "Payment B", "amount": -200.00, "balance": 800.00},
            {"date": "2026-10-03", "description": "Payment C", "amount": -300.00, "balance": 500.00},
        ]
        validated, is_rec, discrepant = validate_balance_transitions(sample_rows, opening_balance=0.0)
        self.assertTrue(is_rec)
        self.assertEqual(len(discrepant), 0)

        # Tamper row 2 by 0.01
        tampered_rows = [
            {"date": "2026-10-01", "description": "Deposit A", "amount": 1000.00, "balance": 1000.00},
            {"date": "2026-10-02", "description": "Payment B", "amount": -200.01, "balance": 800.00},
            {"date": "2026-10-03", "description": "Payment C", "amount": -300.00, "balance": 500.00},
        ]
        tampered_val, tampered_rec, tampered_disc = validate_balance_transitions(tampered_rows, opening_balance=0.0)
        self.assertFalse(tampered_rec, "Must detect 0.01 balance discrepancy")
        self.assertGreater(len(tampered_disc), 0, "Must identify discrepant rows")
        flagged = [idx for idx, row in enumerate(tampered_val) if row.get("transition_error")]
        self.assertIn(1, flagged)


class TestMultiFormatExporters(unittest.TestCase):
    """Phase 4: US/Global & Israeli Multi-Format Exporters"""

    def setUp(self):
        self.txns = [
            {"date": "2026-10-01", "description": "Client Pmt", "memo": "Wire In", "amount": 1200.00, "balance": 5200.00, "type": "Credit"},
            {"date": "2026-10-02", "description": "AWS Cloud", "memo": "Hosting Fee", "amount": -150.00, "balance": 5050.00, "type": "Debit"}
        ]

    def test_qbo_csv_3col(self):
        csv_out = generate_qbo_csv_3col(self.txns)
        lines = csv_out.strip().split("\n")
        self.assertEqual(lines[0], "Date,Description,Amount")
        self.assertIn("1200.00", lines[1])
        self.assertIn("-150.00", lines[2])

    def test_qbo_csv_4col(self):
        csv_out = generate_qbo_csv_4col(self.txns)
        lines = csv_out.strip().split("\n")
        self.assertEqual(lines[0], "Date,Description,Credit,Debit")
        self.assertIn("1200.00", lines[1])
        self.assertIn("150.00", lines[2])

    def test_hashavshevet_csv_utf8_bom(self):
        csv_bytes = generate_hashavshevet_csv(self.txns)
        self.assertTrue(csv_bytes.startswith(b"\xef\xbb\xbf"), "Must start with UTF-8 BOM for Excel/Hashavshevet")
        content = csv_bytes.decode("utf-8-sig")
        self.assertIn("תאריך ערך", content)
        self.assertIn("חובה", content)
        self.assertIn("זכות", content)

    def test_hashavshevet_dat(self):
        dat_content = generate_hashavshevet_dat(self.txns)
        self.assertTrue(len(dat_content) > 0)

    def test_accountant_audit_workbook_2_sheets(self):
        summary = {"opening_balance": 4000.0, "total_credits": 1200.0, "total_debits": 150.0, "net_change": 1050.0, "ending_balance": 5050.0}
        xlsx_bytes = generate_excel(self.txns, "Test Bank", summary=summary)
        self.assertTrue(xlsx_bytes.startswith(b"PK"), "Must be a valid ZIP/XLSX file")


if __name__ == '__main__':
    unittest.main()
