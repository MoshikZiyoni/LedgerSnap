"""
Comprehensive Unit Tests for US QuickBooks Integrations Architecture & Reconciliation Engine
Verifies compliance with Phase 1 - 6 specifications:
1. Complete <FI> block + <INTU.BID> across US Banks Directory
2. 9-digit safe routing number placeholder (never empty)
3. Deterministic SHA-256 <FITID> ({YYYYMMDD}-{HEX[:12]})
4. Checking/Savings vs Credit Card (<CREDITCARDMSGSRSV1> / <CCSTMTRS>) omitting <BANKID> and <ACCTTYPE>
5. Credit Card liability signs (charges negative, payments positive)
6. Context-aware <TRNTYPE> and <CHECKNUM> extraction
7. Noon GMT timestamps (YYYYMMDD120000[0:GMT])
8. Max 32 chars <NAME>, 255 chars <MEMO>, RTL normalization
9. Statement balance reconciliation & transition error pinpointing
10. Round-trip QBO string parser verification
11. Quicken QFX generation
"""

import unittest
import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from data.us_banks_directory import US_BANKS_DIRECTORY, detect_us_bank
from converters.qbo_generator import (
    generate_qbo,
    generate_qfx,
    generate_fitid,
    sanitize_payee_name,
    classify_transaction,
    validate_qbo_string
)
from converters.pdf_parser import validate_balance_transitions


class TestUsBanksDirectoryAndFiBlock(unittest.TestCase):
    def test_top_us_banks_present_in_directory(self):
        target_bids = {
            'chase': '10898',
            'wells-fargo': '3000',
            'bank-of-america': '6812',
            'citi': '24909',
            'capital-one': '15688',
            'amex': '3101',
            'us-bank': '1465',
            'pnc': '4332',
            'td-bank': '10912',
            'truist': '12811'
        }
        all_insts = list(US_BANKS_DIRECTORY.values())
        for bank_id, expected_bid in target_bids.items():
            matching = [b for b in all_insts if b['id'] == bank_id]
            self.assertTrue(len(matching) > 0, f"Missing bank with id {bank_id} in US_BANKS_DIRECTORY")
            info = matching[0]
            self.assertEqual(info['bid'], expected_bid)
            self.assertEqual(info['fid'], expected_bid)
            self.assertTrue(len(info['org']) > 0)
            self.assertTrue(len(info['routing']) == 9)

    def test_fi_block_and_intu_bid_emitted_in_sonrs(self):
        txns = [{"date": "2026-10-16", "description": "OFFICE SUPPLIES", "amount": -120.50}]
        qbo_str = generate_qbo(
            transactions=txns,
            bank_name="JPMorgan Chase",
            intu_bid="10898",
            account_type="CHECKING",
            account_id="987654321",
            bank_id="021000021"
        )
        self.assertIn("<FI>", qbo_str)
        self.assertIn("<ORG>JPMorgan Chase Bank", qbo_str)
        self.assertIn("<FID>10898", qbo_str)
        self.assertIn("</FI>", qbo_str)
        self.assertIn("<INTU.BID>10898", qbo_str)

    def test_safe_9_digit_routing_number_when_missing(self):
        txns = [{"date": "2026-10-16", "description": "PAYROLL DEPOSIT", "amount": 2500.00}]
        # Pass empty bank_id
        qbo_str = generate_qbo(
            transactions=txns,
            bank_name="Unknown Credit Union",
            intu_bid="3000",
            bank_id="",
            account_type="CHECKING",
            account_id="123456"
        )
        self.assertIn("<BANKID>121000247", qbo_str, "Should use universal Wells Fargo routing default")
        self.assertNotIn("<BANKID></BANKID>", qbo_str)


class TestDeterministicFitidAndZeroDuplicates(unittest.TestCase):
    def test_re_converting_produces_identical_fitid(self):
        fitid1 = generate_fitid("ACCT_9988", "2026-10-16", -85.00, "AMAZON MKTPLACE", 0)
        fitid2 = generate_fitid("ACCT_9988", "2026-10-16", -85.00, "AMAZON MKTPLACE", 0)
        self.assertEqual(fitid1, fitid2)
        self.assertTrue(fitid1.startswith("20261016-"))
        self.assertEqual(len(fitid1), 8 + 1 + 12)  # YYYYMMDD-XXXXXXXXXXXX

    def test_same_day_identical_txns_have_unique_fitids(self):
        fitid_a = generate_fitid("ACCT_9988", "2026-10-16", -5.00, "STARBUCKS", 0)
        fitid_b = generate_fitid("ACCT_9988", "2026-10-16", -5.00, "STARBUCKS", 1)
        self.assertNotEqual(fitid_a, fitid_b)


class TestCheckingVsCreditCardOfxSpecs(unittest.TestCase):
    def test_credit_card_omits_bankid_and_accttype(self):
        txns = [
            {"date": "2026-10-16", "description": "ADOBE CREATIVE CLOUD", "amount": -54.99},
            {"date": "2026-10-17", "description": "AUTOPAY PAYMENT THANK YOU", "amount": 54.99}
        ]
        qbo_str = generate_qbo(
            transactions=txns,
            bank_name="American Express",
            intu_bid="3101",
            account_type="CREDITCARD",
            account_id="371234567890123"
        )
        self.assertIn("<CREDITCARDMSGSRSV1>", qbo_str)
        self.assertIn("<CCSTMTRS>", qbo_str)
        self.assertIn("<CCACCTFROM>", qbo_str)
        self.assertIn("<ACCTID>371234567890123", qbo_str)
        self.assertIn("</CCACCTFROM>", qbo_str)
        # MUST NOT contain BANKID or ACCTTYPE inside CCACCTFROM or CREDITCARDMSGSRSV1
        self.assertNotIn("<BANKID>", qbo_str)
        self.assertNotIn("<ACCTTYPE>", qbo_str)
        self.assertNotIn("<BANKMSGSRSV1>", qbo_str)

    def test_credit_card_liability_signs(self):
        txns = [
            {"date": "2026-10-16", "description": "DELTA AIR LINES", "amount": -450.00},
            {"date": "2026-10-17", "description": "PAYMENT - THANK YOU", "amount": 450.00}
        ]
        qbo_str = generate_qbo(
            transactions=txns,
            bank_name="Chase Ink Card",
            intu_bid="10898",
            account_type="CREDITCARD",
            account_id="4111222233334444"
        )
        # Purchase must be negative (DEBIT)
        self.assertIn("<TRNTYPE>DEBIT", qbo_str)
        self.assertIn("<TRNAMT>-450.00", qbo_str)
        # Payment must be positive (CREDIT)
        self.assertIn("<TRNTYPE>CREDIT", qbo_str)
        self.assertIn("<TRNAMT>450.00", qbo_str)


class TestContextAwareTrntypeAndCheckNum(unittest.TestCase):
    def test_check_extraction_and_checknum_tag(self):
        txns = [{"date": "2026-10-16", "description": "CHECK # 1042 TO CONTRACTOR", "amount": -1500.00}]
        qbo_str = generate_qbo(
            transactions=txns,
            bank_name="Wells Fargo",
            intu_bid="3000",
            account_type="CHECKING",
            account_id="11223344"
        )
        self.assertIn("<TRNTYPE>CHECK", qbo_str)
        self.assertIn("<CHECKNUM>1042", qbo_str)

    def test_fee_atm_pos_xfer_classification(self):
        self.assertEqual(classify_transaction("MONTHLY SERVICE FEE", -15.00)[0], "FEE")
        self.assertEqual(classify_transaction("ATM WITHDRAWAL 5TH AVE", -100.00)[0], "ATM")
        self.assertEqual(classify_transaction("POS PURCHASE TARGET #1402", -45.12)[0], "POS")
        self.assertEqual(classify_transaction("ZELLE TRANSFER TO JOHN DOE", -200.00)[0], "XFER")
        self.assertEqual(classify_transaction("INTEREST PAYMENT", 4.15)[0], "INT")


class TestNoonGmtTimestampsAndStrictLengths(unittest.TestCase):
    def test_noon_gmt_timestamps(self):
        txns = [{"date": "2026-10-16", "description": "OFFICE RENT", "amount": -2000.00}]
        qbo_str = generate_qbo(transactions=txns, intu_bid="10898")
        self.assertIn("<DTPOSTED>20261016120000[0:GMT]", qbo_str)
        self.assertIn("<DTSTART>20261016120000[0:GMT]", qbo_str)
        self.assertIn("<DTEND>20261016120000[0:GMT]", qbo_str)

    def test_name_max_32_and_memo_max_255(self):
        long_payee = "A" * 60
        long_memo = "M" * 300
        txns = [{"date": "2026-10-16", "description": long_payee, "memo": long_memo, "amount": -10.00}]
        qbo_str = generate_qbo(transactions=txns, intu_bid="10898")
        self.assertIn(f"<NAME>{'A'*32}", qbo_str)
        self.assertIn(f"<MEMO>{'M'*255}", qbo_str)


class TestReconciliationMathAndRoundTripValidator(unittest.TestCase):
    def test_row_by_row_transition_error_pinpointing(self):
        # 3 transactions where 2nd row has balance corruption (descending order)
        txns = [
            {"date": "16/10/2026", "description": "TX 3", "amount": 30.00, "balance": 1050.00},
            {"date": "15/10/2026", "description": "TX 2", "amount": -50.00, "balance": 1020.00},  # Discrepancy!
            {"date": "14/10/2026", "description": "TX 1", "amount": 100.00, "balance": 1100.00}
        ]
        opening_balance = 1000.00
        validated_txns, is_reconciled, discrepant_rows = validate_balance_transitions(txns, opening_balance)
        self.assertTrue(len(discrepant_rows) > 0, "Discrepancy must be pinpointed")

    def test_round_trip_qbo_string_validator(self):
        txns = [
            {"date": "2026-10-01", "description": "TX 1", "amount": 500.00},
            {"date": "2026-10-02", "description": "TX 2", "amount": -150.00}
        ]
        qbo_str = generate_qbo(transactions=txns, intu_bid="10898", opening_balance=1000.00, ending_balance=1350.00)
        validation = validate_qbo_string(qbo_str)
        self.assertTrue(validation['valid'])
        self.assertEqual(validation['transaction_count'], 2)
        self.assertEqual(validation['unique_fitids_count'], 2)
        self.assertEqual(len(validation['fitids']), 2)


class TestQuickenQfxGeneration(unittest.TestCase):
    def test_qfx_contains_quicken_header_and_tags(self):
        txns = [{"date": "2026-10-16", "description": "GROCERIES", "amount": -75.40}]
        qfx_str = generate_qfx(transactions=txns, intu_bid="3000", bank_name="Wells Fargo")
        self.assertIn("OFXHEADER:100", qfx_str)
        self.assertIn("<INTU.BID>3000", qfx_str)
        self.assertIn("<TRNAMT>-75.40", qfx_str)


if __name__ == '__main__':
    unittest.main()
