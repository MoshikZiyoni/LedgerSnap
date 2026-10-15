"""
Unit Tests for LedgerSnap Persistent Database Layer
Tests licenses, free trial tracking, admin VIP access, and conversion session caching.
"""

import unittest
import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import database

class TestDatabasePersistence(unittest.TestCase):
    def setUp(self):
        database.init_db()

    def test_admin_recognition_and_license(self):
        self.assertTrue(database.is_admin_email("moshiktm1994@gmail.com"))
        self.assertTrue(database.is_admin_email("  MOSHIKTM1994@GMAIL.COM  "))
        self.assertFalse(database.is_admin_email("random_user@gmail.com"))

        admin_lic = database.get_admin_license()
        self.assertEqual(admin_lic["email"], "moshiktm1994@gmail.com")
        self.assertEqual(admin_lic["plan"], "firm")
        self.assertEqual(admin_lic["credits_remaining"], 999999)

        # Verify by admin email
        recovered = database.verify_by_email("moshiktm1994@gmail.com")
        self.assertIsNotNone(recovered)
        self.assertEqual(recovered["plan"], "firm")

    def test_license_creation_and_verification(self):
        customer_email = "test_cpa_client@firm.com"
        created = database.create_license(customer_email, plan="pro_monthly")
        self.assertTrue(created["license_key"].startswith("LSNAP-"))
        self.assertEqual(created["plan"], "pro_monthly")

        # Verify by key
        verified = database.verify_license(created["license_key"])
        self.assertIsNotNone(verified)
        self.assertEqual(verified["email"], customer_email)

        # Verify by email
        by_email = database.verify_by_email(customer_email)
        self.assertIsNotNone(by_email)
        self.assertEqual(by_email["license_key"], created["license_key"])

    def test_free_usage_limit_and_ip_locking(self):
        client_id = "test-client-unique-998877"
        ip_addr = "192.168.1.100"

        # Reset before test
        database.reset_free_usage(client_id, ip_addr)

        # First check - should have free access
        allowed, used = database.get_free_usage_status(client_id, ip_addr)
        self.assertTrue(allowed)
        self.assertEqual(used, 0)

        # Consume 1 free statement
        success, count = database.record_free_usage_download(client_id, ip_addr)
        self.assertTrue(success)
        self.assertEqual(count, 1)

        # Second attempt - MUST be blocked
        allowed_again, used_again = database.get_free_usage_status(client_id, ip_addr)
        self.assertFalse(allowed_again)
        self.assertEqual(used_again, 1)

        success_again, count_again = database.record_free_usage_download(client_id, ip_addr)
        self.assertFalse(success_again)
        self.assertEqual(count_again, 1)

        # Reset and verify it works again
        database.reset_free_usage(client_id, ip_addr)
        allowed_reset, used_reset = database.get_free_usage_status(client_id, ip_addr)
        self.assertTrue(allowed_reset)
        self.assertEqual(used_reset, 0)

    def test_conversion_cache_persistence(self):
        file_id = "test-session-persistent-uuid-123"
        record = {
            "filename": "Hapoalim_Statement_Sep2026.pdf",
            "bank_name": "Bank Hapoalim",
            "transactions": [
                {"date": "2026-09-14", "description": "SUPER PHARM", "amount": -140.50, "type": "Debit", "balance": 12500.0}
            ],
            "summary": {
                "count": 1,
                "currency": "ILS",
                "bank_detected": "Bank Hapoalim"
            },
            "client_id": "test-client-123",
            "ip": "203.0.113.195"
        }

        database.save_conversion_record(file_id, record)

        recovered = database.get_conversion_record(file_id)
        self.assertIsNotNone(recovered)
        self.assertEqual(recovered["filename"], "Hapoalim_Statement_Sep2026.pdf")
        self.assertEqual(recovered["bank_name"], "Bank Hapoalim")
        self.assertEqual(len(recovered["transactions"]), 1)
        self.assertEqual(recovered["transactions"][0]["amount"], -140.50)
        self.assertEqual(recovered["summary"]["currency"], "ILS")

if __name__ == "__main__":
    unittest.main()
