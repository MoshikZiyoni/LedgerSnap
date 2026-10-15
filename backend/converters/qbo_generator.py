import re
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional

# Standard dictionary mapping common Israeli & International banking terms to clean English for Desktop ASCII mode
BANKING_TRANSLATIONS = {
    # Banking Operations
    "העברה בנקאית": "Bank Transfer",
    "העברה": "Transfer",
    "העברה לחשבון": "Transfer to Account",
    "העברה מחשבון": "Transfer from Account",
    "העברה יזומה": "Online Transfer",
    "העברת זהב": "RTGS Wire Transfer",
    "עמלת פעולה": "Bank Fee",
    "עמלת שורה": "Ledger Entry Fee",
    "עמלת ניהול": "Management Fee",
    "עמלה": "Fee",
    "עמלות": "Fees",
    "דמי כרטיס": "Card Annual Fee",
    "חיוב כרטיס אשראי": "Credit Card Charge",
    "חיוב כרטיס": "Card Charge",
    "כרטיס אשראי": "Credit Card",
    "הפקדת שיק": "Check Deposit",
    "הפקדת שק": "Check Deposit",
    "פרעון שיק": "Check Payment",
    "שיק": "Check",
    "שק": "Check",
    "משכורת": "Salary Payroll",
    "משכורות": "Payroll",
    "שכר": "Salary",
    "מס הכנסה": "Income Tax",
    "מע\"מ": "VAT Tax",
    "מעמ": "VAT Tax",
    "ביטוח לאומי": "National Insurance",
    "הוראת קבע": "Standing Order",
    "הוראת קבע כרטיס": "Auto-Pay Card",
    "משיכת מזומן": "ATM Withdrawal",
    "משיכה בכספומט": "ATM Withdrawal",
    "משיכה": "Withdrawal",
    "הפקדה": "Deposit",
    "הפקדת מזומן": "Cash Deposit",
    "זיכוי": "Credit Refund",
    "זיכוי שגוי": "Credit Correction",
    "חיוב": "Debit Charge",
    "חיוב ריבית": "Interest Charge",
    "זכות ריבית": "Interest Earned",
    "ריבית": "Interest",
    "הלוואה": "Loan Payment",
    "פרעון הלוואה": "Loan Repayment",
    "ארנונה": "Municipal Tax",
    "חשמל": "Electricity Utility",
    "מים": "Water Utility",
    "בזק": "Telecom Bezeq",
    "גז": "Gas Utility",
    "סלקום": "Cellcom Telecom",
    "פרטנר": "Partner Telecom",
    "פלאפון": "Pelephone Telecom",
    "הוט": "HOT Telecom",
    "יס": "YES TV Satellite",
    "דלק": "Fuel Gas Station",
    "סופרמרקט": "Supermarket",
    "שופרסל": "Shufersal",
    "רמי לוי": "Rami Levy",
    "יוחננוף": "Yohananof",
    "ויקטורי": "Victory Supermarket",
    "סופר פארם": "Super-Pharm",
    "בי": "Be Drugstore",
    "מקס": "MAX IT Finance",
    "ישראכרט": "Isracard",
    "כאל": "Cal Credit Cards",
    "ויזה": "Visa",
    "מאסטרקארד": "Mastercard",
    "אמריקן אקספרס": "Amex",
}

# Phonetic Hebrew transliteration table for unmapped Hebrew payees
HEBREW_PHONETIC_MAP = {
    'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H',
    'ו': 'V', 'ז': 'Z', 'ח': 'Ch', 'ט': 'T', 'י': 'Y',
    'כ': 'K', 'ך': 'K', 'ל': 'L', 'מ': 'M', 'ם': 'M',
    'נ': 'N', 'ן': 'N', 'ס': 'S', 'ע': 'A', 'פ': 'P',
    'ף': 'F', 'צ': 'Tz', 'ץ': 'Tz', 'ק': 'K', 'ר': 'R',
    'ש': 'Sh', 'ת': 'T'
}

def transliterate_hebrew_to_ascii(text: str) -> str:
    """
    Translates common Israeli banking terms and transliterates remaining
    Hebrew characters into clean, readable ASCII Latin text for QuickBooks Desktop Legacy mode.
    """
    if not text:
        return "Transaction"
    
    cleaned = text.strip()

    # 1. Check direct translation dictionary (longest matches first)
    for term, translation in sorted(BANKING_TRANSLATIONS.items(), key=lambda x: len(x[0]), reverse=True):
        if term in cleaned:
            cleaned = cleaned.replace(term, translation)

    # 2. Transliterate any remaining Hebrew characters phonetically
    out_chars = []
    for ch in cleaned:
        if ch in HEBREW_PHONETIC_MAP:
            out_chars.append(HEBREW_PHONETIC_MAP[ch])
        else:
            out_chars.append(ch)
    
    result = "".join(out_chars)
    # Strip any remaining non-ASCII characters for strict ASCII 1252
    result = re.sub(r'[^\x20-\x7E]', '', result)
    result = re.sub(r'\s+', ' ', result).strip()
    return result or "Transaction"

def escape_ofx_xml(text: str) -> str:
    """Escapes special characters that break OFX/SGML/XML parsers and strips control chars."""
    if not text:
        return ""
    # Strip non-printable ASCII control characters (0x00 to 0x1F, except \n which we also strip)
    cleaned = re.sub(r'[\x00-\x1F\x7F]', ' ', str(text))
    # Replace XML entities
    cleaned = cleaned.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return re.sub(r'\s+', ' ', cleaned).strip()

def sanitize_ofx_name(text: str, max_len: int = 32, allow_unicode: bool = True) -> str:
    """
    Sanitizes description for <NAME> tag (QuickBooks strict 32-character limit).
    Preserves Unicode letters/Hebrew in UTF-8 mode, cleanly cuts at word boundary.
    """
    if not text:
        return "Transaction"

    text = escape_ofx_xml(text)

    if not allow_unicode:
        text = transliterate_hebrew_to_ascii(text)
    
    if len(text) <= max_len:
        return text.strip() or "Transaction"

    # Truncate cleanly without slicing mid-word if possible
    truncated = text[:max_len]
    last_space = truncated.rfind(' ')
    if last_space > 16:  # Only trim to word boundary if reasonable length remains
        truncated = truncated[:last_space]
    
    return truncated.strip() or text[:max_len].strip() or "Transaction"

def sanitize_payee_name(text: str, max_len: int = 32, export_mode: str = "utf8") -> str:
    """Wrapper for sanitize_ofx_name respecting export_mode ('utf8' vs 'ascii')."""
    allow_unicode = (export_mode.lower() == "utf8")
    return sanitize_ofx_name(text, max_len=max_len, allow_unicode=allow_unicode)

def sanitize_ofx_memo(text: str, max_len: int = 255, allow_unicode: bool = True) -> str:
    """
    Sanitizes full original description for <MEMO> tag (up to 255 characters).
    """
    if not text:
        return "Transaction"

    text = escape_ofx_xml(text)

    if not allow_unicode:
        text = transliterate_hebrew_to_ascii(text)

    return text[:max_len].strip() or "Transaction"

def parse_date_to_qbo(date_str: str, preferred_format: str = "DD/MM/YYYY") -> str:
    """
    Converts various date strings to QuickBooks standard 14-digit timestamp: YYYYMMDD120000.
    Respects preferred_format (DD/MM/YYYY vs MM/DD/YYYY).
    """
    if not date_str:
        return datetime.now().strftime("%Y%m%d120000")

    date_str = str(date_str).strip()

    # If already in YYYYMMDD or YYYYMMDD120000 format
    if re.match(r'^\d{8}$', date_str):
        return f"{date_str}120000"
    if re.match(r'^\d{14}$', date_str):
        return date_str

    # Clean punctuation separators
    normalized = date_str.replace('.', '/').replace('-', '/')

    if preferred_format == "DD/MM/YYYY":
        formats = [
            "%d/%m/%Y", "%d/%m/%y", "%Y/%m/%d", "%Y-%m-%d",
            "%d %b %Y", "%d %B %Y", "%m/%d/%Y", "%m/%d/%y"
        ]
    else:
        formats = [
            "%m/%d/%Y", "%m/%d/%y", "%Y/%m/%d", "%Y-%m-%d",
            "%b %d, %Y", "%b %d %Y", "%d/%m/%Y", "%d/%m/%y"
        ]

    for fmt in formats:
        try:
            dt = datetime.strptime(normalized, fmt)
            # Sanity check for 2-digit years: assume 2000s
            if dt.year < 1970:
                dt = dt.replace(year=dt.year + 100)
            return dt.strftime("%Y%m%d120000")
        except ValueError:
            continue

    # Regex fallback for D/M/YYYY or M/D/YYYY
    parts = re.findall(r'\d+', normalized)
    if len(parts) >= 3:
        p1, p2, p3 = int(parts[0]), int(parts[1]), int(parts[2])
        # Determine year
        if p3 < 100:
            p3 += 2000
        elif p1 > 1000:
            # Format is YYYY/MM/DD
            try:
                dt = datetime(p1, p2, p3)
                return dt.strftime("%Y%m%d120000")
            except ValueError:
                pass

        if preferred_format == "DD/MM/YYYY":
            day, month, year = p1, p2, p3
        else:
            month, day, year = p1, p2, p3

        # Auto-correct if day/month inverted
        if month > 12 and day <= 12:
            day, month = month, day

        try:
            dt = datetime(year, month, day)
            return dt.strftime("%Y%m%d120000")
        except ValueError:
            pass

    return datetime.now().strftime("%Y%m%d120000")

def generate_fitid(account_id: str, dt_str: str, amount: float, description: str, intra_day_idx: int = 1) -> str:
    """
    Generates a deterministic <FITID> based on transaction content.
    Guarantees that importing overlapping statement periods produces identical <FITID>s,
    allowing QuickBooks to automatically deduplicate without creating duplicates.
    """
    clean_desc = re.sub(r'[^a-zA-Z0-9]', '', description).upper()[:16]
    amt_str = f"{amount:.2f}"
    date_part = dt_str[:8]
    acct_part = account_id[-6:] if account_id else "9999"

    # Deterministic hash of immutable transaction attributes
    raw_key = f"{acct_part}:{date_part}:{amt_str}:{clean_desc}:{intra_day_idx}"
    hash_digest = hashlib.md5(raw_key.encode('utf-8')).hexdigest()[:12].upper()
    return f"{date_part}-{hash_digest}"

def detect_statement_currency(transactions: List[Dict[str, Any]], default: str = "USD") -> str:
    """Detects currency ISO code from transaction strings or bank signatures."""
    for t in transactions:
        desc = str(t.get("description", ""))
        if any(sym in desc for sym in ["₪", "ש\"ח", "שח", "ILS", "NIS"]):
            return "ILS"
        if any(sym in desc for sym in ["€", "EUR"]):
            return "EUR"
        if any(sym in desc for sym in ["£", "GBP"]):
            return "GBP"
        if "CAD" in desc or "C$" in desc:
            return "CAD"
        if "AUD" in desc or "A$" in desc:
            return "AUD"
    return default

def generate_qbo(
    transactions: List[Dict[str, Any]],
    bank_name: str = "CHASE",
    account_id: str = "123456789",
    bank_id: str = "123456789",
    currency: str = "USD",
    account_type: str = "CHECKING",
    export_mode: str = "utf8",
    intu_bid: str = "3000",
    date_format: str = "auto",
    opening_balance: Optional[float] = None,
    ending_balance: Optional[float] = None
) -> str:
    """
    Generates a certified, standard-compliant QuickBooks Online/Desktop (.QBO / OFX 102) Web Connect file.
    
    Supports:
    - QuickBooks Online UTF-8 Mode (clean Hebrew/Unicode descriptions)
    - QuickBooks Desktop Legacy ASCII Mode (smart Israeli/Intl banking terms translation + phonetic transliteration)
    - Bank Account (<BANKMSGSRSV1>) vs Credit Card (<CREDITCARDMSGSRSV1>) specifications
    - Deterministic <FITID> deduplication
    - Chronologically sorted <DTSTART>, <DTEND>, <DTASOF>
    """
    if not transactions:
        transactions = []

    # Detect date format if auto
    if date_format == "auto":
        # If Hebrew detected or currency is ILS/EUR/GBP, use DD/MM/YYYY
        has_hebrew = any(re.search(r'[\u0590-\u05FF]', str(t.get("description", ""))) for t in transactions)
        if has_hebrew or currency in ["ILS", "EUR", "GBP", "AUD"]:
            date_format = "DD/MM/YYYY"
        else:
            date_format = "MM/DD/YYYY"

    # Pre-parse dates and sort chronologically
    sorted_txns = []
    for t in transactions:
        d_parsed = parse_date_to_qbo(str(t.get("date", "")), preferred_format=date_format)
        amt = float(t.get("amount", 0.0))
        sorted_txns.append({
            **t,
            "_parsed_date": d_parsed,
            "_amount": amt
        })

    # Sort strictly chronologically (oldest to newest)
    sorted_txns.sort(key=lambda x: x["_parsed_date"])

    # Determine date bounds consistently formatted as 14 digits YYYYMMDD120000
    now_str = datetime.now().strftime("%Y%m%d120000")
    if sorted_txns:
        start_date = sorted_txns[0]["_parsed_date"]
        end_date = sorted_txns[-1]["_parsed_date"]
        as_of_date = end_date
    else:
        start_date = now_str
        end_date = now_str
        as_of_date = now_str

    # Calculate balance
    if ending_balance is not None:
        final_balance = float(ending_balance)
    elif sorted_txns and sorted_txns[-1].get("balance") is not None:
        final_balance = float(sorted_txns[-1]["balance"])
    else:
        final_balance = sum(t["_amount"] for t in sorted_txns)
        if opening_balance is not None:
            final_balance += float(opening_balance)

    # Determine account type: CHECKING, SAVINGS, CREDITCARD
    acct_type_clean = account_type.upper().strip()
    is_credit_card = acct_type_clean in ["CREDITCARD", "CC", "CREDIT_CARD", "CREDIT CARD"]

    # Header configuration based on export_mode (UTF-8 vs USASCII)
    allow_unicode = (export_mode.lower() != "ascii")
    if allow_unicode:
        encoding_hdr = "ENCODING:UTF-8\nCHARSET:NONE"
    else:
        encoding_hdr = "ENCODING:USASCII\nCHARSET:1252"

    clean_acct_id = re.sub(r'[^a-zA-Z0-9]', '', str(account_id or "123456789"))[:22] or "123456789"
    clean_bank_id = re.sub(r'[^a-zA-Z0-9]', '', str(bank_id or "123456789"))[:9] or "123456789"
    clean_intu_bid = str(intu_bid or "3000")
    clean_currency = str(currency or "USD").upper().strip()

    # Build OFX Header
    qbo_header = f"""OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
{encoding_hdr}
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>{now_str}
<LANGUAGE>ENG
<INTU.BID>{clean_intu_bid}
</SONRS>
</SIGNONMSGSRSV1>
"""

    # Message container based on Account Type (Bank vs Credit Card)
    if is_credit_card:
        qbo_account_block = f"""<CREDITCARDMSGSRSV1>
<CCSTMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<CCSTMTRS>
<CURDEF>{clean_currency}
<CCACCTFROM>
<ACCTID>{clean_acct_id}
</CCACCTFROM>
<BANKTRANLIST>
<DTSTART>{start_date}
<DTEND>{end_date}
"""
    else:
        qbo_account_block = f"""<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>{clean_currency}
<BANKACCTFROM>
<BANKID>{clean_bank_id}
<ACCTID>{clean_acct_id}
<ACCTTYPE>{acct_type_clean if acct_type_clean in ['CHECKING', 'SAVINGS'] else 'CHECKING'}
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>{start_date}
<DTEND>{end_date}
"""

    # Track intra-day occurrences for identical transactions
    day_counts: Dict[str, int] = {}
    txn_blocks = []

    for t in sorted_txns:
        dt = t["_parsed_date"]
        amt = t["_amount"]
        txn_type = "CREDIT" if amt >= 0 else "DEBIT"
        raw_desc = str(t.get("description", "Transaction"))
        raw_memo = str(t.get("memo") or t.get("raw_description") or raw_desc)

        # Format payee name (max 32 chars) and memo (max 255 chars)
        name = sanitize_ofx_name(raw_desc, max_len=32, allow_unicode=allow_unicode)
        memo = sanitize_ofx_memo(raw_memo, max_len=255, allow_unicode=allow_unicode)

        # Intra-day key for deterministic FITID
        day_key = f"{dt[:8]}:{amt:.2f}:{name}"
        occurrence = day_counts.get(day_key, 0) + 1
        day_counts[day_key] = occurrence

        fitid = generate_fitid(clean_acct_id, dt, amt, raw_desc, intra_day_idx=occurrence)

        txn_blocks.append(f"""<STMTTRN>
<TRNTYPE>{txn_type}
<DTPOSTED>{dt}
<TRNAMT>{amt:.2f}
<FITID>{fitid}
<NAME>{name}
<MEMO>{memo}
</STMTTRN>""")

    # Footer
    if is_credit_card:
        qbo_footer = f"""</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>{final_balance:.2f}
<DTASOF>{as_of_date}
</LEDGERBAL>
</CCSTMTRS>
</CCSTMTTRNRS>
</CREDITCARDMSGSRSV1>
</OFX>
"""
    else:
        qbo_footer = f"""</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>{final_balance:.2f}
<DTASOF>{as_of_date}
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
"""

    return qbo_header + qbo_account_block + "\n".join(txn_blocks) + "\n" + qbo_footer
