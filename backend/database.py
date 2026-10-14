import sqlite3
import os
import uuid
import secrets
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

DB_PATH = os.path.join(os.path.dirname(__file__), "banktoqbo.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

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

        conn.commit()

def generate_license_key() -> str:
    """Generates an intuitive, professional license key like LSNAP-8F2A-94B1-67C3."""
    part1 = secrets.token_hex(2).upper()
    part2 = secrets.token_hex(2).upper()
    part3 = secrets.token_hex(2).upper()
    return f"LSNAP-{part1}-{part2}-{part3}"

def create_license(email: str, plan: str = "pro_monthly") -> Dict[str, Any]:
    """Creates a new license in the database (called by webhook or checkout)."""
    license_key = generate_license_key()
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
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM licenses 
            WHERE license_key = ? AND status = 'active'
        """, (clean_key,))
        row = cursor.fetchone()

        if row:
            # Check credits
            if row["credits_remaining"] <= 0:
                return None
            return dict(row)
    return None

def verify_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Allows user to restore their license on a new device using just their email."""
    if not email:
        return None
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

def check_or_record_free_usage(client_id: str, ip_address: str) -> Tuple[bool, int]:
    """
    Checks if client has free conversions left.
    Default policy: 1 full free statement conversion per user.
    Returns: (is_allowed, conversions_used)
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT conversions_count FROM free_usage WHERE client_id = ?", (client_id,))
        row = cursor.fetchone()

        if row is None:
            # First time user
            cursor.execute("""
                INSERT INTO free_usage (client_id, ip_address, conversions_count)
                VALUES (?, ?, 1)
            """, (client_id, ip_address))
            conn.commit()
            return True, 1
        else:
            used = row["conversions_count"]
            if used < 1:
                cursor.execute("""
                    UPDATE free_usage 
                    SET conversions_count = conversions_count + 1, last_used_at = CURRENT_TIMESTAMP
                    WHERE client_id = ?
                """, (client_id,))
                conn.commit()
                return True, used + 1
            else:
                return False, used

def deduct_credit_if_needed(license_key: str):
    """Decrements 1 credit if the user is on a single-use plan."""
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
