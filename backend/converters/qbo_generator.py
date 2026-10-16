import re
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

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
    Preserves Unicode letters/Hebrew in UTF-8 mode, fixes reversed visual parentheses,
    and cleanly cuts at word boundary.
    """
    if not text:
        return "Transaction"

    text = normalize_rtl_text(str(text))
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
    Fixes reversed visual RTL parentheses and preserves complete information.
    """
    if not text:
        return "Transaction"

    text = normalize_rtl_text(str(text))
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

def normalize_rtl_text(text: str) -> str:
    """
    Sanitizes Hebrew / RTL text where visual extraction inverted symmetrical punctuation
    such as parentheses and brackets (e.g. אוצר-חיל/ציפל ערן/)שירותי דיגיטל ( -> אוצר-חיל/ציפל ערן/(שירותי דיגיטל)).
    """
    if not text:
        return ""
    
    s = str(text).strip()
    if not re.search(r'[\u0590-\u05FF]', s):
        return s

    # 1. Clean trailing orphan opening paren preceded by closing paren
    s = re.sub(r'\s*\(\s*$', ')', s) if ')' in s and (s.rstrip().endswith('(') or ' (' in s) else s

    # 2. Repair explicit inverted pairs: )phrase( -> (phrase) or ]phrase[ -> [phrase]
    s = re.sub(r'\)([^\(\)]+?)\s*\(', r'(\1)', s)
    s = re.sub(r'\]([^\[\]]+?)\s*\[', r'[\1]', s)

    # 3. Handle segments after '/' or in isolated blocks
    def fix_slash_segment(seg: str) -> str:
        trimmed = seg.strip()
        if not trimmed:
            return seg
        
        # If segment is already well-formed with balanced parentheses, leave it
        if trimmed.startswith('(') and trimmed.endswith(')') and trimmed.count('(') == trimmed.count(')'):
            return " " + trimmed if seg.startswith(' ') else trimmed

        # Case: starts with ')' and has no '('
        if trimmed.startswith(')') and '(' not in trimmed:
            inner = trimmed[1:].strip()
            # If inner contains another ')' e.g. "יולי )הערת ל"
            if ')' in inner:
                sub_parts = [p.strip() for p in inner.split(')') if p.strip()]
                nested = ""
                for idx, p in enumerate(sub_parts):
                    if idx == 0:
                        nested += f"({p}"
                    else:
                        nested += f" ({p}"
                nested += ")" * len(sub_parts)
                res = nested
            else:
                res = f"({inner})"
            return " " + res if seg.startswith(' ') else res

        # Case: inverted single pair within trimmed e.g. "foo )bar(" -> "foo (bar)"
        if ')' in trimmed and '(' in trimmed:
            first_close = trimmed.find(')')
            first_open = trimmed.find('(')
            if first_close < first_open and trimmed.count('(') == trimmed.count(')'):
                trimmed = trimmed.replace(')', '\x00').replace('(', ')').replace('\x00', '(')

        # Balance check: if more '(' than ')'
        open_c = trimmed.count('(')
        close_c = trimmed.count(')')
        if open_c > close_c:
            trimmed += ')' * (open_c - close_c)
        elif close_c > open_c:
            while trimmed.startswith(')'):
                trimmed = '(' + trimmed[1:]
                close_c -= 1
                open_c += 1
            if close_c > open_c:
                trimmed = '(' * (close_c - open_c) + trimmed

        return " " + trimmed if seg.startswith(' ') else trimmed

    if '/' in s:
        parts = s.split('/')
        fixed_parts = [fix_slash_segment(p) for p in parts]
        s = "/".join(fixed_parts)
    else:
        s = fix_slash_segment(s)

    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\(\s+', '(', s)
    s = re.sub(r'\s+\)', ')', s)
    return s

def ensure_gmt_timestamp(dt_str: str) -> str:
    """Ensures timestamp is formatted as YYYYMMDD120000[0:GMT]."""
    s = str(dt_str or "").strip()
    if not s:
        s = datetime.now().strftime("%Y%m%d120000")
    if "[0:GMT]" in s:
        return s
    s = re.sub(r'\[.*?\]', '', s)
    if len(s) == 8:
        s = f"{s}120000"
    elif len(s) < 14:
        s = s.ljust(14, '0')
    return f"{s[:14]}[0:GMT]"

BANK_INTU_PRESETS = {
    "3000": {"org": "Wells Fargo", "fid": "3000", "bid": "3000", "routing": "121000247", "label": "Wells Fargo (3000 - Universal Safe Fallback)"},
    "10898": {"org": "JPMorgan Chase Bank", "fid": "10898", "bid": "10898", "routing": "021000021", "label": "JPMorgan Chase Bank (10898)"},
    "6812": {"org": "Bank of America", "fid": "6812", "bid": "6812", "routing": "026009593", "label": "Bank of America (6812)"},
    "24909": {"org": "Citibank", "fid": "24909", "bid": "24909", "routing": "021000089", "label": "Citibank (24909)"},
    "15688": {"org": "Capital One", "fid": "15688", "bid": "15688", "routing": "051405515", "label": "Capital One (15688)"},
    "3101": {"org": "AMEX", "fid": "3101", "bid": "3101", "routing": "000000000", "label": "American Express (3101)"},
    "1001": {"org": "American Express", "fid": "1001", "bid": "1001", "routing": "000000000", "label": "American Express (1001 Legacy)"},
    "1465": {"org": "US Bank", "fid": "1465", "bid": "1465", "routing": "091000022", "label": "U.S. Bank (1465)"},
    "4332": {"org": "PNC Bank", "fid": "4332", "bid": "4332", "routing": "043000096", "label": "PNC Bank (4332)"},
    "10912": {"org": "TD Bank", "fid": "10912", "bid": "10912", "routing": "011103093", "label": "TD Bank (10912)"},
    "12811": {"org": "Truist", "fid": "12811", "bid": "12811", "routing": "053000196", "label": "Truist (12811)"},
    "1007": {"org": "Regions Bank", "fid": "1007", "bid": "1007", "routing": "062000019", "label": "Regions Bank (1007)"},
    "1011": {"org": "Fifth Third Bank", "fid": "1011", "bid": "1011", "routing": "042000314", "label": "Fifth Third Bank (1011)"},
    "2440": {"org": "Citizens Bank", "fid": "2440", "bid": "2440", "routing": "011500120", "label": "Citizens Bank (2440)"},
    "1014": {"org": "Huntington National Bank", "fid": "1014", "bid": "1014", "routing": "044000024", "label": "Huntington Bank (1014)"},
    "1016": {"org": "KeyBank", "fid": "1016", "bid": "1016", "routing": "041001039", "label": "KeyBank (1016)"},
    "2490": {"org": "Navy Federal", "fid": "2490", "bid": "2490", "routing": "256074974", "label": "Navy Federal Credit Union (2490)"},
    "6781": {"org": "USAA", "fid": "6781", "bid": "6781", "routing": "314074269", "label": "USAA Federal Savings Bank (6781)"},
    "1018": {"org": "Charles Schwab", "fid": "1018", "bid": "1018", "routing": "121202211", "label": "Charles Schwab (1018)"},
    "1019": {"org": "Fidelity", "fid": "1019", "bid": "1019", "routing": "101205681", "label": "Fidelity Investments (1019)"},
    "24001": {"org": "Citibank", "fid": "24001", "bid": "24001", "routing": "021000089", "label": "Citibank (24001)"},
}

def generate_fitid(
    account_id: str,
    dt_str: str,
    amount: float,
    description: str,
    same_day_identical_tx_index: int = 0,
    intra_day_idx: Optional[int] = None
) -> str:
    """
    Generates a 100% deterministic <FITID> based on SHA-256 hash of immutable transaction attributes.
    Format: {dtposted_yyyymmdd}-{sha256_hex[:12].upper()}
    Zero duplicate guarantee across repeated runs, overlapping dates, and partial statement exports.
    """
    if intra_day_idx is not None:
        same_day_identical_tx_index = intra_day_idx

    clean_acct = re.sub(r'[^a-zA-Z0-9]', '', str(account_id or "123456789"))
    clean_date = re.sub(r'\D', '', str(dt_str))[:8]
    if len(clean_date) < 8:
        clean_date = datetime.now().strftime("%Y%m%d")
    amt_str = f"{amount:.2f}"
    norm_desc = re.sub(r'\s+', ' ', str(description or '')).strip()

    raw_key = f"{clean_acct}|{clean_date}|{amt_str}|{norm_desc}|{same_day_identical_tx_index}"
    sha256_hex = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()
    return f"{clean_date}-{sha256_hex[:12].upper()}"

def classify_transaction(description: str, amount: float, check_num: Optional[str] = None) -> Tuple[str, Optional[str]]:
    """
    Context-Aware <TRNTYPE> classification and check number extraction.
    OFX 1.02 valid values: CHECK, FEE, XFER, ATM, POS, INT, PAYMENT, DEBIT, CREDIT.
    """
    desc = str(description or "").strip()
    desc_upper = desc.upper()
    extracted_check_num = check_num

    # 1. CHECK detection
    if not extracted_check_num:
        chk_match = re.search(r'(?:שיק|המחאה|check|chk)\s*[:#\-]?\s*(\d{2,10})', desc, re.IGNORECASE)
        if chk_match:
            extracted_check_num = chk_match.group(1)

    is_check = (
        extracted_check_num is not None or
        any(k in desc for k in ["שיק", "המחאה", "פרעון שיק", "הפקדת שיק", "הפקדת שק"]) or
        any(k in desc_upper for k in ["CHECK #", "CHECK#", "CHK #", "CHK#", "CHECK DEPOSIT", "CHECK PAYMENT", "CHECK WITHDRAWAL"])
    )
    if is_check:
        return "CHECK", extracted_check_num

    # 2. FEE detection (Bank fees, commissions on debit)
    if amount < 0 and (
        any(k in desc for k in ["עמלה", "עמלות", "עמלת", "דמי ניהול", "דמי כרטיס"]) or
        any(k in desc_upper for k in [
            "SERVICE FEE", "MONTHLY FEE", "WIRE FEE", "BANK FEE", "LEDGER ENTRY FEE", 
            "ANNUAL FEE", "OVERDRAFT FEE", "TRANSACTION FEE", "MAINTENANCE FEE", 
            "NSF FEE", "MONTHLY SERVICE FEE", "SERVICE CHARGE"
        ])
    ):
        return "FEE", None

    # 3. ATM detection
    if any(k in desc_upper for k in [
        "ATM WITHDRAWAL", "ATM DEPOSIT", "ATM TRANSACTION", "ATM FEE", 
        "CASH WITHDRAWAL ATM", "ATM CASH"
    ]) or "משיכת מזומן" in desc:
        return "ATM", None

    # 4. POS detection (Point of sale debit card charges)
    if any(k in desc_upper for k in [
        "POS PURCHASE", "DEBIT CARD PURCHASE", "VISADDA", "POINT OF SALE", 
        "POS DEBIT", "PURCHASE WITH PIN", "CHECKCARD", "CHECK CARD PURCHASE"
    ]):
        return "POS", None

    # 5. XFER detection (Transfers, wires, P2P, ACH)
    if (
        any(k in desc for k in ["העברה", "העברת זהב", "העברה בנקאית", "ביט", "העברה לחשבון", "העברה מחשבון"]) or
        any(k in desc_upper for k in [
            "BIT", "ZELLE", "WIRE TRANSFER", "ACH TRANSFER", "RTGS", "WIRE OUT", 
            "WIRE IN", "ONLINE TRANSFER", "TRANSFER TO", "TRANSFER FROM", "VENMO", 
            "INTERNAL TRANSFER", "FUNDS TRANSFER", "DIRECT DEPOSIT"
        ])
    ):
        return "XFER", None

    # 6. INT detection (Interest earned or charged)
    if any(k in desc for k in ["ריבית", "חיוב ריבית", "זכות ריבית"]) or any(k in desc_upper for k in [
        "INTEREST", "INTEREST PAID", "INTEREST CHARGE", "INTEREST PAYMENT", "INTEREST EARNED"
    ]):
        return "INT", None

    # 7. PAYMENT detection (Credit card payments)
    if (
        any(k in desc for k in ["חיוב כרטיס אשראי", "חיוב כרטיס", "תשלום כרטיס", "הוראת קבע כרטיס"]) or
        any(k in desc_upper for k in [
            "CREDIT CARD PAYMENT", "CARD PAYMENT", "AUTOPAY CARD", "AUTO-PAY CARD", 
            "PAYMENT THANK YOU", "CC PAYMENT", "ONLINE PAYMENT", "AUTOMATIC PAYMENT", "BILL PAYMENT"
        ])
    ):
        return "PAYMENT", None

    # 8. Fallback based on sign
    return ("CREDIT" if amount >= 0 else "DEBIT"), None

def clean_payee_name(raw_desc: str, max_len: int = 32) -> str:
    """
    US Smart Payee Cleanup:
    Strips noisy US bank and merchant prefixes from <NAME> such as:
    POS DEBIT VISA *4412, CHECKCARD 0814, ACH DEBIT, ORIG CO NAME:, SQ *, TST*, PP*, AMZN Mktp US*
    while preserving the core merchant name and keeping full raw string for <MEMO>.
    """
    if not raw_desc:
        return "Transaction"
    
    s = str(raw_desc).strip()
    
    # 1. Strip leading payment method / processor codes
    s = re.sub(r'^(?:POS DEBIT VISA\s*\*\d+|CHECKCARD\s*\d+|POS PURCHASE|POS DEBIT|DEBIT CARD PURCHASE|DEBIT CARD|VISA DDA PUR|PURCHASE WITH PIN|ACH DEBIT|ACH CREDIT|WIRE OUT|WIRE IN|DIRECT DEPOSIT|ORIG CO NAME:|RECURRING PAYMENT|PREAUTHORIZED DEBIT)\s*[-:]?\s*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^(?:TST\s*\*\s*|SQ\s*\*\s*|PP\s*\*\s*|PYPL\s*\*\s*|PAYPAL\s*\*\s*|SP\s*\*\s*|AMZN\s+Mktp\s+US\s*\*|AMZN\s+MKTP\s*\*|AMAZON\.COM\s*\*)\s*', '', s, flags=re.IGNORECASE)
    
    # 2. Known US vendor canonical mapping
    s_upper = s.upper()
    if "AMAZON" in s_upper or "AMZN" in s_upper:
        s = "Amazon"
    elif "STARBUCKS" in s_upper:
        s = "Starbucks"
    elif "GUSTO" in s_upper:
        s = "Gusto Payroll"
    elif "STRIPE" in s_upper:
        s = "Stripe Transfer"
    elif "UBER" in s_upper:
        s = "Uber"
    elif "LYFT" in s_upper:
        s = "Lyft"
    elif "GOOGLE" in s_upper or "GSUITE" in s_upper:
        s = "Google Workspace"
    elif "MICROSOFT" in s_upper or "MSFT" in s_upper:
        s = "Microsoft 365"
    elif "AWS" in s_upper or "AMAZON WEB SERVICES" in s_upper:
        s = "Amazon Web Services"
    elif "VERIZON" in s_upper:
        s = "Verizon Wireless"
    elif "INTUIT" in s_upper or "QUICKBOOKS" in s_upper:
        s = "Intuit QuickBooks"
    else:
        # Strip trailing store / terminal / location numbers like #1042, STORE 994, WA 98101
        s = re.sub(r'(?:#\d+|\bSTORE\s*\d+|\bLOC\s*\d+|\bTERMINAL\s*\d+|\bREF\s*[:#]?\s*\d+).*', '', s, flags=re.IGNORECASE)
        s = re.sub(r'\b[A-Z\s]{2,18}\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?$', '', s, flags=re.IGNORECASE)
        s = re.sub(r'\s+', ' ', s).strip()
    
    if not s:
        s = str(raw_desc).strip()
    
    return s[:max_len].strip() or "Transaction"

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

    # Determine account type: CHECKING, SAVINGS, CREDITLINE/CREDITCARD
    acct_type_clean = account_type.upper().strip()
    is_credit_card = acct_type_clean in ["CREDITCARD", "CC", "CREDIT_CARD", "CREDIT CARD", "CREDITLINE"]

    # Header configuration based on export_mode (UTF-8 vs USASCII)
    allow_unicode = (export_mode.lower() != "ascii")
    if allow_unicode:
        encoding_hdr = "ENCODING:UTF-8\nCHARSET:NONE"
    else:
        encoding_hdr = "ENCODING:USASCII\nCHARSET:1252"

    clean_acct_id = re.sub(r'[^a-zA-Z0-9]', '', str(account_id or "123456789"))[:22] or "123456789"
    clean_intu_bid = str(intu_bid or "3000")
    clean_currency = str(currency or "USD").upper().strip()

    # Bank Institution block (<FI>) matching <INTU.BID>
    preset = BANK_INTU_PRESETS.get(clean_intu_bid)
    if preset:
        bank_org = preset["org"]
        bank_fid = preset["fid"]
        default_routing = preset.get("routing") or "000000000"
    else:
        # Safe universal fallback if bank is not in presets or is an Israeli/local bank
        bank_org = "Wells Fargo" if clean_intu_bid == "3000" else (bank_name or "Wells Fargo")
        bank_fid = clean_intu_bid
        default_routing = "000000000"

    raw_bank_id = re.sub(r'[^0-9]', '', str(bank_id or ""))
    if len(raw_bank_id) == 9:
        clean_bank_id = raw_bank_id
    elif not raw_bank_id or raw_bank_id in ["0", "000000000"]:
        clean_bank_id = default_routing
    elif raw_bank_id == "123456789" and default_routing != "000000000":
        clean_bank_id = default_routing
    else:
        clean_bank_id = raw_bank_id.zfill(9)[:9] if raw_bank_id else default_routing

    # Build OFX Header with complete <FI> container and Noon GMT DTSERVER
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
<DTSERVER>{ensure_gmt_timestamp(now_str)}
<LANGUAGE>ENG
<FI>
<ORG>{bank_org}
<FID>{bank_fid}
</FI>
<INTU.BID>{clean_intu_bid}
</SONRS>
</SIGNONMSGSRSV1>
"""

    start_date_gmt = ensure_gmt_timestamp(start_date)
    end_date_gmt = ensure_gmt_timestamp(end_date)
    as_of_date_gmt = ensure_gmt_timestamp(as_of_date)

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
<DTSTART>{start_date_gmt}
<DTEND>{end_date_gmt}
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
<DTSTART>{start_date_gmt}
<DTEND>{end_date_gmt}
"""

    # Track intra-day occurrences for identical transactions
    day_counts: Dict[str, int] = {}
    txn_blocks = []

    for t in sorted_txns:
        dt = ensure_gmt_timestamp(t["_parsed_date"])
        amt = t["_amount"]
        raw_desc = str(t.get("description", "Transaction"))
        raw_memo = str(t.get("memo") or t.get("raw_description") or raw_desc)

        # Enforce Credit Card liability sign convention: purchases are negative, payments/refunds positive
        if is_credit_card:
            t_type = str(t.get("type", "")).upper()
            is_payment = t_type in ["CREDIT", "PAYMENT", "REFUND", "DEPOSIT"] or any(k in raw_desc.lower() for k in ["payment", "thank you", "refund", "זיכוי", "תשלום"])
            if not is_payment and amt > 0:
                amt = -amt
            elif is_payment and amt < 0:
                amt = abs(amt)

        # Context-aware TRNTYPE and check number
        txn_type, check_num = classify_transaction(raw_desc, amt, t.get("check_num") or t.get("check_number"))
        check_tag = f"<CHECKNUM>{check_num}\n" if check_num else ""

        # Format payee name (max 32 chars) and memo (max 255 chars)
        name = sanitize_ofx_name(raw_desc, max_len=32, allow_unicode=allow_unicode)
        memo = sanitize_ofx_memo(raw_memo, max_len=255, allow_unicode=allow_unicode)

        # Intra-day occurrence for 100% deterministic SHA-256 FITID
        norm_raw_desc = re.sub(r'\s+', ' ', raw_desc).strip()
        day_key = f"{dt[:8]}|{amt:.2f}|{norm_raw_desc}"
        occurrence = day_counts.get(day_key, 0)
        day_counts[day_key] = occurrence + 1

        fitid = generate_fitid(clean_acct_id, dt, amt, raw_desc, same_day_identical_tx_index=occurrence)

        txn_blocks.append(f"""<STMTTRN>
<TRNTYPE>{txn_type}
<DTPOSTED>{dt}
<TRNAMT>{amt:.2f}
<FITID>{fitid}
{check_tag}<NAME>{name}
<MEMO>{memo}
</STMTTRN>""")

    # Footer
    if is_credit_card:
        qbo_footer = f"""</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>{final_balance:.2f}
<DTASOF>{as_of_date_gmt}
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
<DTASOF>{as_of_date_gmt}
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
"""

    return qbo_header + qbo_account_block + "\n".join(txn_blocks) + "\n" + qbo_footer

def validate_qbo_string(
    qbo_text: str,
    expected_count: Optional[int] = None,
    expected_net_change: Optional[float] = None
) -> Dict[str, Any]:
    """
    Round-trip parser validation for generated QBO content.
    Verifies transaction count, net amount sum, uniqueness of FITID,
    and <= 32 character limit for <NAME>.
    """
    errors = []
    warnings = []
    
    # 1. Parse STMTTRN blocks
    stmttrns = re.findall(r'<STMTTRN>.*?</STMTTRN>', qbo_text, re.DOTALL)
    actual_count = len(stmttrns)

    if expected_count is not None and actual_count != expected_count:
        errors.append(f"Transaction count mismatch: generated {actual_count}, expected {expected_count}")

    fitids = []
    amounts = []
    names = []

    for idx, block in enumerate(stmttrns, start=1):
        fitid_match = re.search(r'<FITID>([^<\r\n]+)', block)
        if fitid_match:
            fid = fitid_match.group(1).strip()
            fitids.append(fid)
            if not fid:
                errors.append(f"Row {idx}: <FITID> is empty")
        else:
            errors.append(f"Row {idx}: Missing <FITID> tag")

        amt_match = re.search(r'<TRNAMT>([-\d\.]+)', block)
        if amt_match:
            amounts.append(float(amt_match.group(1)))
        else:
            errors.append(f"Row {idx}: Missing <TRNAMT> tag")

        name_match = re.search(r'<NAME>([^<\r\n]+)', block)
        if name_match:
            n = name_match.group(1).strip()
            names.append(n)
            if len(n) > 32:
                errors.append(f"Row {idx}: <NAME> exceeds 32 characters ({len(n)} chars): '{n[:36]}...'")
        else:
            errors.append(f"Row {idx}: Missing <NAME> tag")

    # FITID Uniqueness
    unique_fitids = set(fitids)
    if len(unique_fitids) != len(fitids):
        duplicates = [fid for fid in fitids if fitids.count(fid) > 1]
        errors.append(f"Duplicate <FITID>s detected ({len(fitids) - len(unique_fitids)} duplicates): {list(set(duplicates))[:5]}")

    # Net change
    actual_net = round(sum(amounts), 2)
    if expected_net_change is not None and round(expected_net_change, 2) != actual_net:
        errors.append(f"Net change mismatch: generated {actual_net:.2f}, expected {expected_net_change:.2f}")

    # Header check (<FI> and <INTU.BID>)
    if "<FI>" not in qbo_text or "<FID>" not in qbo_text:
        warnings.append("Missing <FI>/<FID> institution block in <SONRS>")
    if "<INTU.BID>" not in qbo_text:
        errors.append("Missing <INTU.BID> in signon block")

    return {
        "valid": len(errors) == 0,
        "is_valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "transaction_count": actual_count,
        "net_amount": actual_net,
        "unique_fitids_count": len(unique_fitids),
        "fitids": fitids,
        "names": names
    }

def generate_ofx(
    transactions: List[Dict[str, Any]],
    bank_name: str = "Bank Statement",
    account_id: str = "123456789",
    bank_id: str = "123456789",
    currency: str = "USD",
    account_type: str = "CHECKING",
    export_mode: str = "utf8",
    date_format: str = "auto",
    opening_balance: Optional[float] = None,
    ending_balance: Optional[float] = None
) -> str:
    """
    Generates standard OFX 1.02 for Xero, Sage, MYOB, and Wave.
    """
    return generate_qbo(
        transactions=transactions,
        bank_name=bank_name,
        account_id=account_id,
        bank_id=bank_id,
        currency=currency,
        account_type=account_type,
        export_mode=export_mode,
        intu_bid="3000",
        date_format=date_format,
        opening_balance=opening_balance,
        ending_balance=ending_balance
    )

def generate_qfx(
    transactions: List[Dict[str, Any]],
    bank_name: str = "Quicken Bank",
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
    Generates standard Quicken Web Connect (.QFX / OFX 1.02) file.
    Compatible with Quicken for Windows and Quicken for Mac.
    """
    return generate_qbo(
        transactions=transactions,
        bank_name=bank_name,
        account_id=account_id,
        bank_id=bank_id,
        currency=currency,
        account_type=account_type,
        export_mode=export_mode,
        intu_bid=intu_bid,
        date_format=date_format,
        opening_balance=opening_balance,
        ending_balance=ending_balance
    )

