import asyncio
import json
import os
import tempfile
import time
import unittest
import urllib.parse
from pathlib import Path
from unittest.mock import patch

# Isolate tests completely from production Postgres before importing backend modules
_TMP_DIR = tempfile.mkdtemp(prefix="ledgersnap_api_tests_")
os.environ["DATABASE_URL"] = ""
os.environ["SQLITE_DB_PATH"] = os.path.join(_TMP_DIR, "test_api.db")

import sys  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import backend.database as db  # noqa: E402
import backend.main as app_main  # noqa: E402


SAMPLE_PARSED_TXNS = [
    {"date": "10/01/2026", "description": "STRIPE TRANSFER PPD", "amount": 1250.00, "type": "Credit", "balance": 6250.00},
    {"date": "10/02/2026", "description": "AWS CLOUD BILLING", "amount": -120.50, "type": "Debit", "balance": 6129.50},
]


class _AsgiResponse:
    def __init__(self, status_code: int, headers: dict, body: bytes):
        self.status_code = status_code
        self.headers = headers
        self.body = body
        self.text = body.decode("utf-8", errors="replace")

    def json(self):
        return json.loads(self.text)


def _call_asgi(method: str, path: str, params=None, headers=None, json_body=None, multipart=None) -> _AsgiResponse:
    query_str = urllib.parse.urlencode(params or {}).encode("latin-1")
    req_headers = {k.lower(): v for k, v in (headers or {}).items()}

    if json_body is not None:
        body_bytes = json.dumps(json_body).encode("utf-8")
        req_headers.setdefault("content-type", "application/json")
    elif multipart is not None:
        boundary = b"----LedgerSnapTestBoundary7e12a"
        parts = []
        for field_name, field_val in multipart.get("data", {}).items():
            parts.append(
                b"--" + boundary + b"\r\n"
                + f'Content-Disposition: form-data; name="{field_name}"\r\n\r\n'.encode("utf-8")
                + str(field_val).encode("utf-8")
                + b"\r\n"
            )
        for field_name, (filename, file_bytes, content_type) in multipart.get("files", {}).items():
            parts.append(
                b"--" + boundary + b"\r\n"
                + f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'.encode("utf-8")
                + f"Content-Type: {content_type}\r\n\r\n".encode("utf-8")
                + file_bytes
                + b"\r\n"
            )
        parts.append(b"--" + boundary + b"--\r\n")
        body_bytes = b"".join(parts)
        req_headers["content-type"] = f"multipart/form-data; boundary={boundary.decode('ascii')}"
    else:
        body_bytes = b""

    req_headers["content-length"] = str(len(body_bytes))
    asgi_headers = [(k.encode("latin-1"), v.encode("latin-1")) for k, v in req_headers.items()]

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": method.upper(),
        "scheme": "https",
        "path": path,
        "raw_path": path.encode("latin-1"),
        "query_string": query_str,
        "headers": asgi_headers,
        "client": ("127.0.0.1", 54321),
        "server": ("testserver", 443),
    }

    sent_status = 500
    sent_headers = {}
    body_chunks = []
    body_sent = False

    async def receive():
        nonlocal body_sent
        if not body_sent:
            body_sent = True
            return {"type": "http.request", "body": body_bytes, "more_body": False}
        return {"type": "http.disconnect"}

    async def send(message):
        nonlocal sent_status, sent_headers
        if message["type"] == "http.response.start":
            sent_status = message["status"]
            sent_headers = {k.decode("latin-1").lower(): v.decode("latin-1") for k, v in message.get("headers", [])}
        elif message["type"] == "http.response.body":
            body_chunks.append(message.get("body", b""))

    asyncio.run(app_main.app(scope, receive, send))
    return _AsgiResponse(sent_status, sent_headers, b"".join(body_chunks))


class TestApiFreeTierAndPrivacy(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        info = db.get_db_info()
        assert info.get("engine") == "sqlite", f"Expected sqlite test DB, got {info}"

    def setUp(self):
        app_main.CONVERSIONS_DB.clear()

    def test_free_tier_status_fast_and_path_aware(self):
        res = _call_asgi(
            "GET",
            "/api/free-tier/status",
            params={"client_id": "cid_fast_check", "path": "/convert/chase-statement-to-qbo"},
            headers={"cf-connecting-ip": "198.51.100.10", "cf-ipcity": "Tel Aviv", "cf-ipcountry": "IL"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["allowed"])
        self.assertEqual(data["conversions_used"], 0)
        self.assertNotIn("location", data)

    def test_convert_unparseable_pdf_returns_422_without_fake_data_or_credit_burn(self):
        headers = {"cf-connecting-ip": "198.51.100.11", "cf-ipcountry": "US"}
        with patch.object(app_main, "extract_transactions_from_pdf", return_value=([], "Unknown Bank", {})):
            res = _call_asgi(
                "POST",
                "/api/convert",
                multipart={
                    "files": {"file": ("scan.pdf", b"%PDF-1.4\n%%EOF", "application/pdf")},
                    "data": {"client_id": "cid_unparseable"},
                },
                headers=headers,
            )
        self.assertEqual(res.status_code, 422)
        self.assertIn("Could not extract transaction rows", res.json()["detail"])

        allowed, used = db.get_free_usage_status("cid_unparseable", "198.51.100.11")
        self.assertTrue(allowed)
        self.assertEqual(used, 0)

    def test_free_trial_full_flow_convert_then_export_then_block_second_pdf(self):
        headers = {"cf-connecting-ip": "198.51.100.12", "cf-ipcountry": "IL"}
        summary = {"count": 2, "currency": "USD", "account_id": "999888", "bank_id": "021000021"}

        with patch.object(
            app_main,
            "extract_transactions_from_pdf",
            return_value=(SAMPLE_PARSED_TXNS, "JPMorgan Chase", summary),
        ):
            conv = _call_asgi(
                "POST",
                "/api/convert",
                multipart={
                    "files": {"file": ("chase_oct.pdf", b"%PDF-1.4\nstatement\n%%EOF", "application/pdf")},
                    "data": {"client_id": "cid_trial_flow"},
                },
                headers=headers,
            )

        self.assertEqual(conv.status_code, 200, conv.text)
        payload = conv.json()
        file_id = payload["file_id"]
        self.assertEqual(payload["total_count"], 2)

        # Must NOT persist transaction data to database
        self.assertIsNone(db.get_conversion_record(file_id))

        # Must NOT consume free trial on preview before download/export
        allowed_mid, used_mid = db.get_free_usage_status("cid_trial_flow", "198.51.100.12")
        self.assertTrue(allowed_mid)
        self.assertEqual(used_mid, 0)

        # First export of the converted statement succeeds and consumes free trial credit
        exp_qbo = _call_asgi(
            "POST",
            "/api/export",
            json_body={
                "transactions": SAMPLE_PARSED_TXNS,
                "currency": "USD",
                "account_id": "999888",
                "bank_id": "021000021",
                "account_type": "CHECKING",
                "intu_bid": "10898",
                "format": "qbo",
                "filename": "chase_oct.pdf",
                "file_id": file_id,
                "client_id": "cid_trial_flow",
            },
            headers=headers,
        )
        self.assertEqual(exp_qbo.status_code, 200, exp_qbo.text)
        self.assertIn("OFXHEADER:100", exp_qbo.text)

        allowed_after, used_after = db.get_free_usage_status("cid_trial_flow", "198.51.100.12")
        self.assertFalse(allowed_after)
        self.assertEqual(used_after, 1)

        # Re-exporting the SAME converted file in another format is allowed
        exp_csv = _call_asgi(
            "POST",
            "/api/export",
            json_body={
                "transactions": SAMPLE_PARSED_TXNS,
                "format": "csv_3col",
                "filename": "chase_oct.pdf",
                "file_id": file_id,
                "client_id": "cid_trial_flow",
            },
            headers=headers,
        )
        self.assertEqual(exp_csv.status_code, 200, exp_csv.text)

        # Uploading a SECOND statement without a paid license is blocked with 402
        with patch.object(
            app_main,
            "extract_transactions_from_pdf",
            return_value=(SAMPLE_PARSED_TXNS, "JPMorgan Chase", summary),
        ):
            second = _call_asgi(
                "POST",
                "/api/convert",
                multipart={
                    "files": {"file": ("chase_nov.pdf", b"%PDF-1.4\n%%EOF", "application/pdf")},
                    "data": {"client_id": "cid_trial_flow"},
                },
                headers=headers,
            )
        self.assertEqual(second.status_code, 402)

    def test_download_get_also_enforces_same_free_trial_rules(self):
        headers = {"cf-connecting-ip": "198.51.100.13", "cf-ipcountry": "US"}
        summary = {"count": 2, "currency": "USD", "account_id": "555111", "bank_id": "121000247"}
        with patch.object(
            app_main,
            "extract_transactions_from_pdf",
            return_value=(SAMPLE_PARSED_TXNS, "Wells Fargo", summary),
        ):
            conv = _call_asgi(
                "POST",
                "/api/convert",
                multipart={
                    "files": {"file": ("wf.pdf", b"%PDF-1.4\n%%EOF", "application/pdf")},
                    "data": {"client_id": "cid_get_dl"},
                },
                headers=headers,
            )
        self.assertEqual(conv.status_code, 200, conv.text)
        file_id = conv.json()["file_id"]

        dl = _call_asgi(
            "GET",
            f"/api/download/{file_id}",
            params={"format": "qbo", "client_id": "cid_get_dl"},
            headers=headers,
        )
        self.assertEqual(dl.status_code, 200, dl.text)
        allowed, used = db.get_free_usage_status("cid_get_dl", "198.51.100.13")
        self.assertFalse(allowed)
        self.assertEqual(used, 1)

    def test_ram_ttl_eviction_removes_stale_sessions(self):
        app_main.CONVERSIONS_DB["stale-file-id"] = {
            "filename": "old.pdf",
            "bank_name": "Chase",
            "transactions": SAMPLE_PARSED_TXNS,
            "summary": {},
            "client_id": "cid_stale",
            "ip": "198.51.100.14",
            "created_at": time.time() - 3600,
        }
        res = _call_asgi(
            "GET",
            "/api/download/stale-file-id",
            params={"client_id": "cid_stale"},
            headers={"cf-connecting-ip": "198.51.100.14", "cf-ipcountry": "US"},
        )
        self.assertEqual(res.status_code, 404)
        self.assertNotIn("stale-file-id", app_main.CONVERSIONS_DB)

    def test_sitemap_serves_canonical_urls(self):
        res = _call_asgi("GET", "/sitemap.xml")
        self.assertEqual(res.status_code, 200)
        self.assertIn("application/xml", res.headers.get("content-type", ""))
        self.assertIn("https://ledger-snap.com/convert/chase-statement-to-qbo", res.text)
        self.assertIn("https://ledger-snap.com/convert/bank-hapoalim-statement-to-qbo", res.text)
        self.assertNotIn("chase-pdf-to-qbo", res.text)


if __name__ == "__main__":
    unittest.main()
