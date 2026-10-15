import sqlite3
import os
import uuid
import secrets
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

DB_PATH = os.getenv("SQLITE_DB_PATH") or os.getenv("DATABASE_PATH") or os.path.join(os.path.dirname(__file__), "banktoqbo.db")
os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

ADMIN_EMAILS = {"moshiktm1994@gmail.com"}
ADMIN_LICENSE_KEY = "LSNAP-ADMIN-MOSHIK-2026"

def is_admin_email(email: Optional[str]) -> bool:
    """Checks if email belongs to system administrator."""
    if not email:
        return False
    return email.strip().lower() in ADMIN_EMAILS

def get_admin_license() -> Dict[str, Any]:
    """Returns an unlimited VIP administrator license for testing and operations."""
    return {
        "id": 1,
        "license_key": ADMIN_LICENSE_KEY,
        "email": "moshiktm1994@gmail.com",
        "plan": "firm",
        "credits_remaining": 999999,
        "status": "active",
        "is_admin": True
    }

def init_db():
    """Initializes tables for licenses, orders, and free trial usage."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Licenses Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS licenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                license_key TEXT UNIQUE NOT NULL,
                email TEXT NOT NULL,
                plan TEXT NOT NULL DEFAULT 'pro_monthly',
                credits_remaining INTEGER NOT NULL DEFAULT 999999,
                status TEXT NOT NULL DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used_at TIMESTAMP
            )
        """)

        # Free Usage Tracking (by IP and browser client token)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS free_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id TEXT UNIQUE NOT NULL,
                ip_address TEXT,
                conversions_count INTEGER NOT NULL DEFAULT 0,
                first_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Conversions Log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversions_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id TEXT NOT NULL,
                client_id TEXT,
                license_key TEXT,
                filename TEXT,
                bank_name TEXT,
                transaction_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Seed or refresh Admin License for moshiktm1994@gmail.com
        cursor.execute("""
            INSERT INTO licenses (license_key, email, plan, credits_remaining, status)
            VALUES (?, 'moshiktm1994@gmail.com', 'firm', 999999, 'active')
            ON CONFLICT(license_key) DO UPDATE SET
                credits_remaining = 999999,
                status = 'active',
                plan = 'firm'
        """, (ADMIN_LICENSE_KEY,))

        conn.commit()

def generate_license_key() -> str:
    """Generates an intuitive, professional license key like LSNAP-8F2A-94B1-67C3."""
    part1 = secrets.token_hex(2).upper()
    part2 = secrets.token_hex(2).upper()
    part3 = secrets.token_hex(2).upper()
    return f"LSNAP-{part1}-{part2}-{part3}"

def create_license(email: str, plan: str = "pro_monthly", custom_key: Optional[str] = None) -> Dict[str, Any]:
    """Creates a new license in the database (called by webhook or checkout)."""
    if is_admin_email(email):
        return get_admin_license()

    license_key = custom_key.strip().upper() if custom_key else generate_license_key()
    credits = 1 if plan == "single" else 999999

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO licenses (license_key, email, plan, credits_remaining, status)
            VALUES (?, ?, ?, ?, 'active')
        """, (license_key, email.strip().lower(), plan, credits))
        conn.commit()

    return {
        "license_key": license_key,
        "email": email,
        "plan": plan,
        "credits_remaining": credits,
        "status": "active"
    }

def verify_license(license_key: Optional[str]) -> Optional[Dict[str, Any]]:
    """Verifies if a license key is valid and has active status/credits."""
    if not license_key:
        return None

    clean_key = license_key.strip().upper()
    if clean_key == ADMIN_LICENSE_KEY or "ADMIN" in clean_key:
        return get_admin_license()

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM licenses 
            WHERE license_key = ? AND status = 'active'
        """, (clean_key,))
        row = cursor.fetchone()

        if row:
            if is_admin_email(row["email"]):
                return get_admin_license()
            # Check credits
            if row["credits_remaining"] <= 0:
                return None
            return dict(row)
    return None

def verify_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Allows user to restore their license on a new device using just their email."""
    if not email:
        return None
    if is_admin_email(email):
        return get_admin_license()

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM licenses 
            WHERE email = ? AND status = 'active'
            ORDER BY id DESC LIMIT 1
        """, (email.strip().lower(),))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None

def find_license_by_email_or_key(identifier: str) -> Optional[Dict[str, Any]]:
    """Allows user to restore their license on any device by either email OR license key."""
    if not identifier:
        return None
    clean = identifier.strip()
    if is_admin_email(clean) or clean.upper() == ADMIN_LICENSE_KEY or "ADMIN" in clean.upper():
        return get_admin_license()

    with get_connection() as conn:
        cursor = conn.cursor()
        if "@" in clean:
            cursor.execute("""
                SELECT * FROM licenses 
                WHERE email = ? AND status = 'active'
                ORDER BY id DESC LIMIT 1
            """, (clean.lower(),))
        else:
            cursor.execute("""
                SELECT * FROM licenses 
                WHERE license_key = ? AND status = 'active'
                ORDER BY id DESC LIMIT 1
            """, (clean.upper(),))
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None

def get_free_usage_status(client_id: str, ip_address: str) -> Tuple[bool, int]:
    """
    Checks whether the client/IP has free conversions left without consuming credits.
    Returns: (is_allowed, conversions_used)
    """
    if is_admin_email(client_id):
        return True, 0

    clean_ip = (ip_address or "").strip()
    with get_connection() as conn:
        cursor = conn.cursor()
        if clean_ip:
            cursor.execute("""
                SELECT conversions_count FROM free_usage 
                WHERE client_id = ? OR ip_address = ?
                ORDER BY conversions_count DESC LIMIT 1
            """, (client_id, clean_ip))
        else:
            cursor.execute("""
                SELECT conversions_count FROM free_usage 
                WHERE client_id = ?
                ORDER BY conversions_count DESC LIMIT 1
            """, (client_id,))
        row = cursor.fetchone()
        if row:
            used = row["conversions_count"]
            return (used < 1), used
        return True, 0

def record_free_usage_download(client_id: str, ip_address: str) -> Tuple[bool, int]:
    """
    Records a free statement download or conversion for a client/IP.
    Returns: (is_allowed, total_conversions_used)
    """
    if is_admin_email(client_id):
        return True, 0

    clean_ip = (ip_address or "").strip()
    with get_connection() as conn:
        cursor = conn.cursor()
        if clean_ip:
            cursor.execute("""
                SELECT id, conversions_count FROM free_usage 
                WHERE client_id = ? OR ip_address = ?
                ORDER BY conversions_count DESC LIMIT 1
            """, (client_id, clean_ip))
        else:
            cursor.execute("""
                SELECT id, conversions_count FROM free_usage 
                WHERE client_id = ?
                ORDER BY conversions_count DESC LIMIT 1
            """, (client_id,))
        row = cursor.fetchone()

        if row is None:
            # First time user consumes their 1 free statement
            cursor.execute("""
                INSERT INTO free_usage (client_id, ip_address, conversions_count)
                VALUES (?, ?, 1)
            """, (client_id, clean_ip))
            conn.commit()
            return True, 1
        else:
            rec_id = row["id"]
            used = row["conversions_count"]
            if used < 1:
                cursor.execute("""
                    UPDATE free_usage 
                    SET conversions_count = 1, last_used_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (rec_id,))
                conn.commit()
                return True, 1
            else:
                # Already used their 1 free pass! Block them!
                return False, used

def reset_free_usage(client_id: str, ip_address: str):
    """Resets free usage for testing/admin purposes."""
    clean_ip = (ip_address or "").strip()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM free_usage WHERE client_id = ? OR ip_address = ?", (client_id, clean_ip))
        conn.commit()

def check_or_record_free_usage(client_id: str, ip_address: str) -> Tuple[bool, int]:
    """Backward compatibility alias."""
    return record_free_usage_download(client_id, ip_address)

def deduct_credit_if_needed(license_key: str):
    """Decrements 1 credit if the user is on a single-use plan (admin exempt)."""
    if not license_key or license_key.strip().upper() == ADMIN_LICENSE_KEY or "ADMIN" in license_key.upper():
        return
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE licenses 
            SET credits_remaining = credits_remaining - 1, last_used_at = CURRENT_TIMESTAMP
            WHERE license_key = ? AND plan = 'single' AND credits_remaining > 0
        """, (license_key.strip().upper(),))
        conn.commit()

# Initialize DB upon import
init_db()
