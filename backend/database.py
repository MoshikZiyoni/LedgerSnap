import os
import json
import uuid
import secrets
from datetime import datetime
from typing import Optional, Dict, Any, Tuple, List
from contextlib import contextmanager

# Detect Database Mode: Cloud PostgreSQL vs Local SQLite
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("SUPABASE_DB_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    # Fix Render/Heroku postgres:// schema to standard postgresql://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

USE_POSTGRES = bool(DATABASE_URL)

DB_PATH = os.getenv("SQLITE_DB_PATH") or os.getenv("DATABASE_PATH") or os.path.join(os.path.dirname(__file__), "banktoqbo.db")

if USE_POSTGRES:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    # Log database connection target (sanitized)
    host_target = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "cloud"
    print(f"[Database] Active: Persistent Cloud PostgreSQL ({host_target})")
else:
    import sqlite3
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    print(f"[Database] Active: Local SQLite ({DB_PATH}). Set DATABASE_URL for cloud persistent database.")

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

def get_db_info() -> Dict[str, Any]:
    """Returns diagnostic database engine metadata."""
    if USE_POSTGRES:
        host = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "postgresql-cloud"
        return {
            "engine": "postgresql",
            "persistent": True,
            "target": host
        }
    return {
        "engine": "sqlite",
        "persistent": False,
        "target": DB_PATH
    }

@contextmanager
def get_db():
    """Provides a managed database connection with automatic commit and rollback."""
    if USE_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    else:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

def get_connection():
    """Legacy compatibility helper."""
    if USE_POSTGRES:
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def run_query(cursor, sql: str, params: tuple = ()):
    """Executes SQL query adapting placeholders for PostgreSQL (%s) or SQLite (?)."""
    if USE_POSTGRES:
        sql = sql.replace("?", "%s")
    cursor.execute(sql, params)
    return cursor

def init_db():
    """Initializes tables for licenses, orders, free trial usage, and conversions cache."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        if USE_POSTGRES:
            # PostgreSQL Schema
            run_query(cursor, """
                CREATE TABLE IF NOT EXISTS licenses (
                    id SERIAL PRIMARY KEY,
                    license_key VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    plan VARCHAR(50) NOT NULL DEFAULT 'pro_monthly',
                    credits_remaining INTEGER NOT NULL DEFAULT 999999,
                    status VARCHAR(50) NOT NULL DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used_at TIMESTAMP
                );
            """)

            run_query(cursor, """
                CREATE TABLE IF NOT EXISTS free_usage (
                    id SERIAL PRIMARY KEY,
                    client_id VARCHAR(255) UNIQUE NOT NULL,
                    ip_address VARCHAR(100),
                    conversions_count INTEGER NOT NULL DEFAULT 0,
                    first_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            run_query(cursor, """
                CREATE TABLE IF NOT EXISTS conversions_log (
                    id SERIAL PRIMARY KEY,
                    file_id VARCHAR(100) NOT NULL,
                    client_id VARCHAR(255),
                    license_key VARCHAR(100),
                    filename VARCHAR(255),
                    bank_name VARCHAR(100),
                    transaction_count INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            run_query(cursor, """
                CREATE TABLE IF NOT EXISTS conversions_cache (
                    file_id VARCHAR(100) PRIMARY KEY,
                    filename VARCHAR(255),
                    bank_name VARCHAR(100),
                    transactions_json TEXT,
                    summary_json TEXT,
                    client_id VARCHAR(255),
                    ip_address VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

        else:
            # SQLite Schema
            run_query(cursor, """
                CREATE TABLE IF NOT EXISTS licenses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    license_key TEXT UNIQUE NOT NULL,
                    email TEXT NOT NULL,
                    plan TEXT NOT NULL DEFAULT 'pro_monthly',
                    credits_remaining INTEGER NOT NULL DEFAULT 999999,
                    status TEXT NOT NULL DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used_at TIMESTAMP
                );
            """)

            run_query(cursor, """
                CREATE TABLE IF NOT EXISTS free_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_id TEXT UNIQUE NOT NULL,
                    ip_address TEXT,
                    conversions_count INTEGER NOT NULL DEFAULT 0,
                    first_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            run_query(cursor, """
                CREATE TABLE IF NOT EXISTS conversions_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_id TEXT NOT NULL,
                    client_id TEXT,
                    license_key TEXT,
                    filename TEXT,
                    bank_name TEXT,
                    transaction_count INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            run_query(cursor, """
                CREATE TABLE IF NOT EXISTS conversions_cache (
                    file_id TEXT PRIMARY KEY,
                    filename TEXT,
                    bank_name TEXT,
                    transactions_json TEXT,
                    summary_json TEXT,
                    client_id TEXT,
                    ip_address TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

        # Seed or refresh Admin License for moshiktm1994@gmail.com
        run_query(cursor, """
            INSERT INTO licenses (license_key, email, plan, credits_remaining, status)
            VALUES (?, 'moshiktm1994@gmail.com', 'firm', 999999, 'active')
            ON CONFLICT(license_key) DO UPDATE SET
                credits_remaining = 999999,
                status = 'active',
                plan = 'firm';
        """, (ADMIN_LICENSE_KEY,))

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

    with get_db() as conn:
        cursor = conn.cursor()
        run_query(cursor, """
            INSERT INTO licenses (license_key, email, plan, credits_remaining, status)
            VALUES (?, ?, ?, ?, 'active')
        """, (license_key, email.strip().lower(), plan, credits))

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

    with get_db() as conn:
        cursor = conn.cursor()
        run_query(cursor, """
            SELECT * FROM licenses 
            WHERE license_key = ? AND status = 'active'
        """, (clean_key,))
        row = cursor.fetchone()

        if row:
            if is_admin_email(row["email"]):
                return get_admin_license()
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

    with get_db() as conn:
        cursor = conn.cursor()
        run_query(cursor, """
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

    with get_db() as conn:
        cursor = conn.cursor()
        if "@" in clean:
            run_query(cursor, """
                SELECT * FROM licenses 
                WHERE email = ? AND status = 'active'
                ORDER BY id DESC LIMIT 1
            """, (clean.lower(),))
        else:
            run_query(cursor, """
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
    with get_db() as conn:
        cursor = conn.cursor()
        if clean_ip:
            run_query(cursor, """
                SELECT conversions_count FROM free_usage 
                WHERE client_id = ? OR ip_address = ?
                ORDER BY conversions_count DESC LIMIT 1
            """, (client_id, clean_ip))
        else:
            run_query(cursor, """
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
    with get_db() as conn:
        cursor = conn.cursor()
        if clean_ip:
            run_query(cursor, """
                SELECT id, conversions_count FROM free_usage 
                WHERE client_id = ? OR ip_address = ?
                ORDER BY conversions_count DESC LIMIT 1
            """, (client_id, clean_ip))
        else:
            run_query(cursor, """
                SELECT id, conversions_count FROM free_usage 
                WHERE client_id = ?
                ORDER BY conversions_count DESC LIMIT 1
            """, (client_id,))
        row = cursor.fetchone()

        if row is None:
            # First time user consumes their 1 free statement
            run_query(cursor, """
                INSERT INTO free_usage (client_id, ip_address, conversions_count)
                VALUES (?, ?, 1)
            """, (client_id, clean_ip))
            return True, 1
        else:
            rec_id = row["id"]
            used = row["conversions_count"]
            if used < 1:
                run_query(cursor, """
                    UPDATE free_usage 
                    SET conversions_count = 1, last_used_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (rec_id,))
                return True, 1
            else:
                # Already used their 1 free pass! Block them!
                return False, used

def reset_free_usage(client_id: str, ip_address: str):
    """Resets free usage for testing/admin purposes."""
    clean_ip = (ip_address or "").strip()
    with get_db() as conn:
        cursor = conn.cursor()
        run_query(cursor, "DELETE FROM free_usage WHERE client_id = ? OR ip_address = ?", (client_id, clean_ip))

def check_or_record_free_usage(client_id: str, ip_address: str) -> Tuple[bool, int]:
    """Backward compatibility alias."""
    return record_free_usage_download(client_id, ip_address)

def deduct_credit_if_needed(license_key: str):
    """Decrements 1 credit if the user is on a single-use plan (admin exempt)."""
    if not license_key or license_key.strip().upper() == ADMIN_LICENSE_KEY or "ADMIN" in license_key.upper():
        return
    with get_db() as conn:
        cursor = conn.cursor()
        run_query(cursor, """
            UPDATE licenses 
            SET credits_remaining = credits_remaining - 1, last_used_at = CURRENT_TIMESTAMP
            WHERE license_key = ? AND plan = 'single' AND credits_remaining > 0
        """, (license_key.strip().upper(),))

def save_conversion_record(file_id: str, record: Dict[str, Any]):
    """Persists a parsed statement session into database cache so it survives deployments."""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            tx_json = json.dumps(record.get("transactions", []))
            sum_json = json.dumps(record.get("summary", {}))
            fname = str(record.get("filename", ""))
            bname = str(record.get("bank_name", ""))
            cid = str(record.get("client_id", ""))
            ip = str(record.get("ip", ""))

            run_query(cursor, """
                INSERT INTO conversions_cache (file_id, filename, bank_name, transactions_json, summary_json, client_id, ip_address)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(file_id) DO UPDATE SET
                    filename = EXCLUDED.filename,
                    bank_name = EXCLUDED.bank_name,
                    transactions_json = EXCLUDED.transactions_json,
                    summary_json = EXCLUDED.summary_json;
            """, (file_id, fname, bname, tx_json, sum_json, cid, ip))
    except Exception as e:
        print(f"[Database Cache Error] Failed to persist conversion {file_id}: {e}")

def get_conversion_record(file_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a cached statement session from the database."""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            run_query(cursor, "SELECT * FROM conversions_cache WHERE file_id = ?", (file_id,))
            row = cursor.fetchone()
            if row:
                return {
                    "file_id": row["file_id"],
                    "filename": row["filename"],
                    "bank_name": row["bank_name"],
                    "transactions": json.loads(row["transactions_json"] or "[]"),
                    "summary": json.loads(row["summary_json"] or "{}"),
                    "client_id": row["client_id"],
                    "ip": row["ip_address"]
                }
    except Exception as e:
        print(f"[Database Cache Error] Failed to retrieve conversion {file_id}: {e}")
    return None

# Initialize tables upon module import
try:
    init_db()
except Exception as e:
    print(f"[Database Init Warning] Table initialization deferred: {e}")
