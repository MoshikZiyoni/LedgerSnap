import re
import pdfplumber
import io
import os
import json
import base64
import requests
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
try:
    from backend.converters.qbo_generator import normalize_rtl_text
except ImportError:
    try:
        from converters.qbo_generator import normalize_rtl_text
    except ImportError:
        def normalize_rtl_text(t: str) -> str:
            return t
# Regex patterns for common dates
DATE_PATTERNS = [
    r'(\d{1,2}/\d{1,2}/\d{4})',
    r'(\d{1,2}/\d{1,2}/\d{2})',
    r'(\d{4}-\d{1,2}-\d{1,2})',
    r'(\d{1,2}-\d{1,2}-\d{4})',
    r'(\d{1,2}\.\d{1,2}\.\d{4})',
    r'(\d{1,2}\.\d{1,2}\.\d{2})',
    r'([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})',
    r'(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})',
    r'(\d{1,2}/\d{1,2})'
]

# Amount pattern: $1,234.56, 42,371.05, ₪1,644.27, -120.00, (50.00), 123.45-
AMOUNT_REGEX = r'[\$₪€£]?\s*[\(]?\s*[\-]?[0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}\s*[\-]?\s*[\)]?'

def clean_amount(val_str: str) -> float:
    """Converts strings like '$1,234.56', '42,371.05', '₪70.00', '(50.00)', '-12.00', '12.00-' to float."""
    if not val_str:
        return 0.0
    s = str(val_str).strip()
    s = s.replace('$', '').replace('₪', '').replace('€', '').replace('£', '').replace(',', '').replace('\n', ' ')
    is_negative = False
    if '(' in s and ')' in s:
        is_negative = True
        s = s.replace('(', '').replace(')', '')
    if s.endswith('-'):
        is_negative = True
        s = s[:-1].strip()
    elif s.startswith('-'):
        is_negative = True
        s = s[1:].strip()

    try:
        val = float(s)
        return -val if is_negative else val
    except ValueError:
        return 0.0

def clean_currency_glued_suffixes(text: str) -> str:
    """
    Cleans stray currency suffixes that get glued to reference numbers in Israeli RTL text
    (e.g., '223366-7598275-15140918214043ILS' -> '223366-7598275-15140918214043', '10.0ILS0' -> '10.00').
    """
    if not text:
        return ""
    # Fix glued ILS / ש"ח / ₪ suffixes on numbers
    cleaned = re.sub(r'(\d+)(?:ILS|ש\"ח|שח|₪)(\d*)', r'\1 \2', text)
    # Fix glued currency followed by decimal
    cleaned = re.sub(r'(\d+\.\d+)(?:ILS|ש\"ח|שח|₪)', r'\1', cleaned)
    # Normalize excessive spaces
    return re.sub(r'\s+', ' ', cleaned).strip()

def reverse_visual_hebrew(text: str) -> str:
    """
    Properly reverses visual-order Hebrew text extracted from Israeli bank PDFs.
    Handles mixed English words, numbers, slashes, and Hebrew words.
    """
    if not text:
        return ""
    
    text = clean_currency_glued_suffixes(" ".join(str(text).split()))
    # If no hebrew characters, return as is
    if not re.search(r'[\u0590-\u05FF]', text):
        return text

    # If text is slash-separated (common in Israeli bank transaction memos)
    parts = text.split('/')
    fixed_parts = []
    for part in parts:
        words = part.split()
        fixed_words = []
        for w in words:
            if re.search(r'[\u0590-\u05FF]', w):
                fixed_words.append(w[::-1])
            else:
                fixed_words.append(w)
        fixed_parts.append(" ".join(reversed(fixed_words)))
    
    return "/".join(reversed(fixed_parts))

def detect_bank_and_account_info(full_text: str) -> Dict[str, Any]:
    """
    Detects bank name, account number, branch ID, currency, and account type from statement text.
    """
    lower = full_text.lower()
    res = {
        "bank_name": "Commercial Bank Statement",
        "account_id": None,
        "bank_id": "3000",
        "currency": "USD",
        "currency_symbol": "$",
        "account_type": "CHECKING"
    }

    # 1. Israeli Banks & Cards
    if any(k in full_text for k in ['יהב', 'בהי', '04-131', '04-']) or 'yahav' in lower:
        res["bank_name"] = "Bank Yahav"
        res["bank_id"] = "04"
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
    elif any(k in full_text for k in ['פועלים', 'םילעופה']) or 'hapoalim' in lower:
        res["bank_name"] = "Bank Hapoalim"
        res["bank_id"] = "12"
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
    elif any(k in full_text for k in ['לאומי', 'ימואל']) or 'leumi' in lower:
        res["bank_name"] = "Bank Leumi"
        res["bank_id"] = "10"
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
    elif any(k in full_text for k in ['דיסקונט', 'טנוקסיד']) or 'discount' in lower:
        res["bank_name"] = "Israel Discount Bank"
        res["bank_id"] = "11"
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
    elif any(k in full_text for k in ['מזרחי', 'יחרזמ']) or 'tefahot' in lower or 'mizrahi' in lower:
        res["bank_name"] = "Mizrahi Tefahot Bank"
        res["bank_id"] = "20"
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
    elif any(k in full_text for k in ['בינלאומי', 'ימואלניב']) or 'fibi' in lower:
        res["bank_name"] = "First International Bank of Israel (FIBI)"
        res["bank_id"] = "31"
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
    elif any(k in full_text for k in ['מקס', 'סקמ']) or 'max it' in lower or 'max' in lower:
        res["bank_name"] = "MAX IT Finance"
        res["bank_id"] = "MAX"
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
        res["account_type"] = "CREDITCARD"
    elif any(k in full_text for k in ['ישראכרט', 'טרכארשי']) or 'isracard' in lower:
        res["bank_name"] = "Isracard"
        res["bank_id"] = "ISRA"
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
        res["account_type"] = "CREDITCARD"
    elif any(k in full_text for k in ['כאל', 'לאכ']) or 'cal credit' in lower or 'cal' in lower:
        res["bank_name"] = "Cal Credit Cards"
        res["bank_id"] = "CAL"
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
        res["account_type"] = "CREDITCARD"

    # US / UK / Global Banks
    elif 'chase' in lower or 'jpmorgan' in lower:
        res["bank_name"] = "JPMorgan Chase"
        res["bank_id"] = "021000021"
        res["currency"] = "USD"
        res["currency_symbol"] = "$"
    elif 'bank of america' in lower or 'bofa' in lower:
        res["bank_name"] = "Bank of America"
        res["bank_id"] = "026009593"
        res["currency"] = "USD"
        res["currency_symbol"] = "$"
    elif 'wells fargo' in lower:
        res["bank_name"] = "Wells Fargo"
        res["bank_id"] = "121000248"
        res["currency"] = "USD"
        res["currency_symbol"] = "$"
    elif 'citibank' in lower or 'citi' in lower:
        res["bank_name"] = "Citibank"
        res["bank_id"] = "021000089"
        res["currency"] = "USD"
        res["currency_symbol"] = "$"
    elif 'capital one' in lower:
        res["bank_name"] = "Capital One"
        res["bank_id"] = "051405515"
        res["currency"] = "USD"
        res["currency_symbol"] = "$"
    elif 'barclays' in lower:
        res["bank_name"] = "Barclays Bank"
        res["bank_id"] = "200000"
        res["currency"] = "GBP"
        res["currency_symbol"] = "£"
    elif 'td bank' in lower:
        res["bank_name"] = "TD Bank"
        res["bank_id"] = "011103093"
        res["currency"] = "USD"
        res["currency_symbol"] = "$"
    elif 'pnc' in lower:
        res["bank_name"] = "PNC Bank"
        res["bank_id"] = "043000096"
        res["currency"] = "USD"
        res["currency_symbol"] = "$"
    elif 'us bank' in lower or 'u.s. bank' in lower:
        res["bank_name"] = "U.S. Bank"
        res["bank_id"] = "091000022"
        res["currency"] = "USD"
        res["currency_symbol"] = "$"

    # Currency overrides based on text signals
    if any(k in full_text for k in ['₪', 'ש"ח', 'שח', 'ILS', 'NIS']):
        res["currency"] = "ILS"
        res["currency_symbol"] = "₪"
    elif any(k in full_text for k in ['€', 'EUR']):
        res["currency"] = "EUR"
        res["currency_symbol"] = "€"
    elif any(k in full_text for k in ['£', 'GBP']):
        res["currency"] = "GBP"
        res["currency_symbol"] = "£"
    elif 'CAD' in full_text or 'C$' in full_text:
        res["currency"] = "CAD"
        res["currency_symbol"] = "C$"
    elif 'AUD' in full_text or 'A$' in full_text:
        res["currency"] = "AUD"
        res["currency_symbol"] = "A$"

    # Credit card detection
    if any(k in lower for k in ['credit card', 'כרטיס אשראי', 'mastercard', 'visa', 'american express', 'amex']):
        res["account_type"] = "CREDITCARD"

    # Account Number Extraction
    # Hebrew patterns: חשבון: 123456, מס' חשבון: 123456, סניף 123 / חשבון 456789
    acct_match = re.search(r'(?:מספר\s+חשבון|מס[\'"]?\s*חשבון|חשבון|ןובשח)[\s:]*([0-9]{4,12})', full_text)
    if not acct_match:
        # Branch-Account: 04-123456 or 12/345678
        acct_match = re.search(r'\b\d{2,3}[-/](\d{5,9})\b', full_text)
    if not acct_match:
        # English patterns: Account Number: 123456789, Account #: ...
        acct_match = re.search(r'(?:Account\s*(?:Number|#|No\.?)|Checking\s*(?:Account)?|Card\s*(?:Ending\s*in)?)[\s:]*([0-9X\*\-]{4,16})', full_text, re.IGNORECASE)

    if acct_match:
        raw_acct = acct_match.group(1).replace('-', '').replace('X', '').replace('*', '').strip()
        if len(raw_acct) >= 4:
            res["account_id"] = raw_acct[-10:]

    if not res["account_id"]:
        # Deterministic 8-digit hash from bank name and statement text header
        hdr_sample = full_text[:200]
        hash_val = abs(hash(res["bank_name"] + hdr_sample)) % 100000000
        res["account_id"] = f"{hash_val:08d}"

    return res

def detect_document_date_format(full_text: str, detected_bank: str, currency: str) -> str:
    """
    Document-Level Date Format Detection before parsing individual rows.
    
    Rules:
    1. Scan all dates in the statement.
    2. If ANY date has its first token > 12 (e.g. 13/07/2026 to 31/08/2026),
       lock the date parser for the entire document to DD/MM/YYYY.
    3. If ANY date has its second token > 12 (e.g. 07/13/2026),
       lock to MM/DD/YYYY.
    4. If Hebrew/RTL text, ILS/GBP/EUR/AUD/CAD, or non-US bank is detected,
       lock the document to DD/MM/YYYY.
    5. Default to MM/DD/YYYY only for verified US statements without conflicting dates.
    """
    has_hebrew = bool(re.search(r'[\u0590-\u05FF]', full_text))
    is_non_us_bank = any(b in (detected_bank or "") for b in [
        "Yahav", "Hapoalim", "Leumi", "Discount", "Mizrahi", "FIBI",
        "MAX", "Isracard", "Cal", "Barclays"
    ])
    is_non_us_currency = currency in ["ILS", "EUR", "GBP", "AUD", "CAD"]

    # Extract all candidate dates formatted as A/B/C or A-B-C or A.B.C
    candidates = re.findall(r'\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b', full_text)
    
    first_token_gt_12 = False
    second_token_gt_12 = False

    for c in candidates:
        t1, t2 = int(c[0]), int(c[1])
        if t1 > 12 and t2 <= 12:
            first_token_gt_12 = True
            break
        elif t2 > 12 and t1 <= 12:
            second_token_gt_12 = True

    # Definitive signal from first token > 12
    if first_token_gt_12:
        return "DD/MM/YYYY"
    
    # Definitive signal from second token > 12
    if second_token_gt_12:
        return "MM/DD/YYYY"

    # Contextual signals
    if has_hebrew or is_non_us_bank or is_non_us_currency:
        return "DD/MM/YYYY"

    return "MM/DD/YYYY"

def normalize_date_string(date_raw: str, doc_format: str) -> str:
    """
    Normalizes an extracted date string to DD/MM/YYYY or MM/DD/YYYY
    consistently according to the document-level format.
    """
    date_raw = date_raw.strip().replace('.', '/').replace('-', '/')
    parts = re.findall(r'\d+', date_raw)
    if len(parts) >= 3:
        p1, p2, p3 = int(parts[0]), int(parts[1]), int(parts[2])
        # Check if year is first
        if p1 > 1000:
            year = p1
            if doc_format == "DD/MM/YYYY":
                month = p2
                day = p3
            else:
                month = p2
                day = p3
        else:
            year = p3 if p3 > 1000 else p3 + 2000
            if doc_format == "DD/MM/YYYY":
                day = p1
                month = p2
            else:
                month = p1
                day = p2

        # Inversion safety
        if month > 12 and day <= 12:
            day, month = month, day

        if doc_format == "DD/MM/YYYY":
            return f"{day:02d}/{month:02d}/{year:04d}"
        else:
            return f"{month:02d}/{day:02d}/{year:04d}"

    return date_raw

def detect_statement_date_format(full_text: str, detected_bank: str = "", currency: str = "") -> str:
    """Convenience alias for detect_document_date_format."""
    return detect_document_date_format(full_text, detected_bank, currency)

def parse_date(date_raw: str, format_preference: str = "DD/MM/YYYY") -> str:
    """
    Parses a raw date string into an ISO YYYY-MM-DD date using the format_preference.
    Guarantees that DD/MM/YYYY dates never invert into MM/DD/YYYY.
    """
    date_raw = str(date_raw).strip().replace('.', '/').replace('-', '/')
    parts = re.findall(r'\d+', date_raw)
    if len(parts) >= 3:
        p1, p2, p3 = int(parts[0]), int(parts[1]), int(parts[2])
        if p1 > 1000:
            year = p1
            month = p2
            day = p3
        else:
            year = p3 if p3 > 1000 else (p3 + 2000 if p3 < 100 else p3)
            if format_preference == "DD/MM/YYYY":
                day = p1
                month = p2
            else:
                month = p1
                day = p2

        # Inversion safety
        if month > 12 and day <= 12:
            day, month = month, day

        return f"{year:04d}-{month:02d}-{day:02d}"
    return str(date_raw)

def extract_account_number(text: str) -> Optional[str]:
    """Extracts account number or ID from statement text."""
    info = detect_bank_and_account_info(text)
    return info.get("account_id")

def parse_with_gemini_vision(pdf_bytes: bytes) -> Optional[List[Dict[str, Any]]]:
    """
    Attempts to perform AI OCR on scanned/image-based PDFs using Google Gemini Flash Vision free tier.
    Uses GEMINI_API_KEY or GOOGLE_API_KEY from environment if available.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    try:
        # Check endpoint
        b64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        prompt = """You are a bank statement OCR specialist. Extract all transactions from this bank statement PDF into a clean JSON array of objects with the following schema:
[
  {
    "date": "DD/MM/YYYY",
    "description": "Clean description/payee",
    "amount": -50.00 (negative for debits/expenses, positive for deposits/credits),
    "type": "Debit" or "Credit",
    "balance": 12500.00 (or null)
  }
]
Output ONLY valid raw JSON with no markdown wrapping or code blocks."""

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "application/pdf",
                                "data": b64_pdf
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }

        resp = requests.post(url, json=payload, timeout=45)
        if resp.status_code == 200:
            res_json = resp.json()
            cand_text = res_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if cand_text:
                parsed = json.loads(cand_text)
                if isinstance(parsed, list) and len(parsed) > 0:
                    return parsed
    except Exception as e:
        print(f"[Gemini Vision OCR Error] {e}")

    return None

def validate_balance_transitions(
    transactions: List[Dict[str, Any]], 
    opening_balance: Optional[float] = None, 
    doc_date_format: str = "DD/MM/YYYY"
) -> Tuple[List[Dict[str, Any]], bool, List[int]]:
    """
    Validates row-by-row running balance transitions and overall statement reconciliation.
    Detects chronological direction (descending or ascending) and checks:
    - If descending (newest first): curr_row['balance'] - curr_row['amount'] == next_row['balance']
    - If ascending (oldest first): curr_row['balance'] + next_row['amount'] == next_row['balance']
    Returns (validated_transactions, is_reconciled, discrepant_row_indices)
    """
    discrepant_rows = []
    has_balances = [t for t in transactions if t.get("balance") is not None]
    is_descending = True
    if len(has_balances) >= 2:
        try:
            d0_str = transactions[0].get("date", "")
            d1_str = transactions[-1].get("date", "")
            if d0_str and d1_str:
                d0_iso = parse_date(d0_str, doc_date_format)
                d1_iso = parse_date(d1_str, doc_date_format)
                is_descending = (d0_iso >= d1_iso)
        except Exception:
            pass

        for i in range(len(transactions) - 1):
            curr_row = transactions[i]
            next_row = transactions[i + 1]
            if curr_row.get("balance") is not None and next_row.get("balance") is not None:
                if is_descending:
                    expected_next = round(curr_row["balance"] - curr_row["amount"], 2)
                    diff = round(abs(expected_next - next_row["balance"]), 2)
                    if diff >= 0.01:
                        curr_row["transition_error"] = True
                        curr_row["expected_balance"] = expected_next
                        curr_row["diff"] = diff
                        discrepant_rows.append(i)
                else:
                    expected_next = round(curr_row["balance"] + next_row["amount"], 2)
                    diff = round(abs(expected_next - next_row["balance"]), 2)
                    if diff >= 0.01:
                        next_row["transition_error"] = True
                        next_row["expected_balance"] = expected_next
                        next_row["diff"] = diff
                        discrepant_rows.append(i + 1)

    total_credits = sum(t["amount"] for t in transactions if t.get("amount", 0) > 0)
    total_debits = sum(abs(t["amount"]) for t in transactions if t.get("amount", 0) < 0)
    net_change = total_credits - total_debits

    balances = [t["balance"] for t in transactions if t.get("balance") is not None]
    if is_descending:
        latest_balance = balances[0] if balances else None
    else:
        latest_balance = balances[-1] if balances else None

    calculated_ending = round((opening_balance or 0.0) + total_credits - total_debits, 2) if opening_balance is not None else round(net_change, 2)
    target_ending = latest_balance if latest_balance is not None else calculated_ending
    balance_discrepancy = round(abs(calculated_ending - target_ending), 2)
    is_reconciled = (balance_discrepancy < 0.01) and (len(discrepant_rows) == 0)

    return transactions, is_reconciled, discrepant_rows

def extract_transactions_from_pdf(pdf_bytes: bytes) -> Tuple[List[Dict[str, Any]], str, Dict[str, Any]]:
    """
    Parses a bank statement PDF and extracts structured transactions.
    Supports English & Hebrew column headers, RTL/LTR layouts,
    document-level date format locking, currency & account detection.
    """
    transactions: List[Dict[str, Any]] = []
    full_text_buffer = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        num_pages = len(pdf.pages)
        for page in pdf.pages:
            t = page.extract_text() or ""
            if t:
                full_text_buffer.append(t)

        all_doc_text = "\n".join(full_text_buffer)
        info = detect_bank_and_account_info(all_doc_text)
        detected_bank = info["bank_name"]
        currency = info["currency"]
        doc_date_format = detect_document_date_format(all_doc_text, detected_bank, currency)

        # Iterate pages to parse tables
        for page_idx, page in enumerate(pdf.pages):
            page_text = page.extract_text() or ""
            tables = page.extract_tables()
            table_extracted = False

            for table in tables:
                if not table or len(table) < 2:
                    continue

                header_row_idx = -1
                date_col = -1
                desc_col = -1
                debit_col = -1
                credit_col = -1
                amt_col = -1
                bal_col = -1

                for r_idx in range(min(5, len(table))):
                    row_cells = [str(c or '').strip() for c in table[r_idx]]

                    for col_idx, cell_text in enumerate(row_cells):
                        c_text = cell_text.lower().replace('\n', ' ')
                        c_rev = reverse_visual_hebrew(cell_text).lower().replace('\n', ' ')
                        combined = f"{c_text} {c_rev}"

                        # Date
                        if any(k in combined for k in ['תאריך', 'ךיראת', 'date', 'posted']):
                            if date_col == -1 or ('ערך' not in combined and 'ךרע' not in combined):
                                date_col = col_idx
                        # Description
                        elif any(k in combined for k in ['תיאור', 'פעולה', 'רואית', 'הלועפ', 'detail', 'desc', 'payee', 'memo', 'פירוט']):
                            desc_col = col_idx
                        # Debit / Outgoing
                        elif any(k in combined for k in ['חובה', 'הבוח', 'debit', 'withdrawal', 'חיוב', 'משיכה']):
                            debit_col = col_idx
                        # Credit / Incoming
                        elif any(k in combined for k in ['זכות', 'תוכז', 'credit', 'deposit', 'זיכוי', 'הפקדה']):
                            credit_col = col_idx
                        # Balance
                        elif any(k in combined for k in ['יתרה', 'הרתי', 'תכרעושמ', 'משוערכת', 'balance']):
                            bal_col = col_idx
                        # Single Amount
                        elif any(k in combined for k in ['סכום', 'מוכס', 'amount']):
                            amt_col = col_idx

                    # If we found at least a date and an amount/debit/credit column
                    if date_col != -1 and (debit_col != -1 or credit_col != -1 or amt_col != -1):
                        header_row_idx = r_idx
                        break

                if header_row_idx != -1:
                    # Process data rows
                    for row in table[header_row_idx + 1:]:
                        if not row:
                            continue

                        # Extract Date
                        raw_date = str(row[date_col] or '').strip().replace('\n', ' ') if date_col != -1 and date_col < len(row) else ''
                        date_match = None
                        for pat in DATE_PATTERNS:
                            m = re.search(pat, raw_date)
                            if m:
                                date_match = m.group(1)
                                break
                        
                        if not date_match:
                            continue

                        norm_date = normalize_date_string(date_match, doc_date_format)

                        # Extract Description & fix visual Hebrew & clean glued currency suffixes & normalize RTL parentheses
                        raw_desc = str(row[desc_col] or '').strip().replace('\n', ' ') if desc_col != -1 and desc_col < len(row) else "Bank Transaction"
                        desc_val = reverse_visual_hebrew(raw_desc)
                        desc_val = clean_currency_glued_suffixes(desc_val)
                        desc_val = normalize_rtl_text(desc_val)

                        # Extract Amounts
                        amount = 0.0
                        if debit_col != -1 and debit_col < len(row):
                            deb_val = clean_amount(row[debit_col])
                            if deb_val > 0:
                                amount = -deb_val
                        if credit_col != -1 and credit_col < len(row) and amount == 0.0:
                            cred_val = clean_amount(row[credit_col])
                            if cred_val > 0:
                                amount = cred_val
                        if amount == 0.0 and amt_col != -1 and amt_col < len(row):
                            amount = clean_amount(row[amt_col])

                        # Extract Balance
                        bal_val = None
                        if bal_col != -1 and bal_col < len(row) and row[bal_col]:
                            bal_val = clean_amount(str(row[bal_col]))

                        if amount != 0.0 or bal_val is not None:
                            transactions.append({
                                "date": norm_date,
                                "description": desc_val or "Bank Transaction",
                                "amount": round(amount, 2),
                                "type": "Credit" if amount > 0 else "Debit",
                                "balance": round(bal_val, 2) if bal_val is not None else None
                            })
                            table_extracted = True

            # 2. Text fallback if table extraction missed rows
            if not table_extracted and page_text:
                lines = page_text.splitlines()
                for line in lines:
                    line = line.strip()
                    date_match = None
                    for pat in DATE_PATTERNS:
                        m = re.search(pat, line)
                        if m:
                            date_match = m.group(1)
                            break
                    if not date_match:
                        continue

                    norm_date = normalize_date_string(date_match, doc_date_format)

                    amounts = re.findall(AMOUNT_REGEX, line)
                    if len(amounts) >= 1:
                        parsed_amts = [clean_amount(a) for a in amounts if clean_amount(a) != 0.0]
                        if parsed_amts:
                            amt = parsed_amts[0]
                            bal = parsed_amts[-1] if len(parsed_amts) > 1 else None

                            desc_part = line.replace(date_match, "")
                            for a in amounts:
                                desc_part = desc_part.replace(a, "")
                            desc_part = reverse_visual_hebrew(desc_part.strip())
                            desc_part = clean_currency_glued_suffixes(desc_part)
                            desc_part = normalize_rtl_text(desc_part)

                            transactions.append({
                                "date": norm_date,
                                "description": desc_part or "Bank Transaction",
                                "amount": round(amt, 2),
                                "type": "Credit" if amt > 0 else "Debit",
                                "balance": round(bal, 2) if bal is not None else None
                            })

    # If 0 transactions were extracted and text is sparse, try Gemini Flash Vision OCR
    if not transactions and len(all_doc_text.strip()) < 100:
        ai_txns = parse_with_gemini_vision(pdf_bytes)
        if ai_txns:
            transactions = ai_txns

    total_credits = sum(t["amount"] for t in transactions if t["amount"] > 0)
    total_debits = sum(abs(t["amount"]) for t in transactions if t["amount"] < 0)
    net_change = sum(t["amount"] for t in transactions)

    # Determine Ending Balance & Opening Balance from transactions
    latest_balance = next((t["balance"] for t in transactions if t["balance"] is not None), None)
    oldest_txn = next((t for t in reversed(transactions) if t["balance"] is not None), None)
    opening_balance = None
    if oldest_txn and oldest_txn["balance"] is not None:
        opening_balance = round(oldest_txn["balance"] - oldest_txn["amount"], 2)

    # Search for explicit Opening / Closing balances printed in the document header/footer
    open_match = re.search(r'(?:יתרת\s*פתיחה|יתרה\s*קודמת|Opening\s*Balance|Beginning\s*Balance|Starting\s*Balance|Previous\s*Balance)[\s:]*([\$₪€£]?\s*[\-]?[0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})', all_doc_text, re.IGNORECASE)
    if open_match:
        parsed_open = clean_amount(open_match.group(1))
        if parsed_open != 0.0:
            opening_balance = round(parsed_open, 2)

    close_match = re.search(r'(?:יתרת\s*סגירה|יתרה\s*(?:לסוף|בסוף|לתום)\s*תקופה|Ending\s*Balance|Closing\s*Balance|New\s*Balance)[\s:]*([\$₪€£]?\s*[\-]?[0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})', all_doc_text, re.IGNORECASE)
    if close_match:
        parsed_close = clean_amount(close_match.group(1))
        if parsed_close != 0.0:
            latest_balance = round(parsed_close, 2)

    # Row-by-row balance transition validation and reconciliation
    transactions, is_reconciled, discrepant_rows = validate_balance_transitions(
        transactions, 
        opening_balance=opening_balance, 
        doc_date_format=doc_date_format
    )
    calculated_ending = round((opening_balance or 0.0) + total_credits - total_debits, 2) if opening_balance is not None else round(net_change, 2)
    target_ending = latest_balance if latest_balance is not None else calculated_ending
    balance_discrepancy = round(abs(calculated_ending - target_ending), 2)

    # Date range
    dates = [t["date"] for t in transactions if t.get("date")]
    start_date = dates[-1] if dates else None
    end_date = dates[0] if dates else None
    date_range = f"{start_date} - {end_date}" if start_date and end_date else "Recent Transactions"

    # Monthly breakdown
    from collections import defaultdict
    months_dict = defaultdict(list)
    for t in transactions:
        parts = t["date"].split("/") if "/" in t["date"] else t["date"].split("-")
        if len(parts) == 3:
            if doc_date_format == "DD/MM/YYYY":
                m_key = f"{parts[1]}/{parts[2]}"
            else:
                m_key = f"{parts[0]}/{parts[2]}"
        else:
            m_key = "General"
        months_dict[m_key].append(t)

    month_names = {
        "01": "January", "02": "February", "03": "March",
        "04": "April", "05": "May", "06": "June",
        "07": "July", "08": "August", "09": "September",
        "10": "October", "11": "November", "12": "December"
    }
    months_summary = []
    for m_key, items in sorted(months_dict.items(), reverse=True):
        m_num = m_key.split("/")[0] if "/" in m_key else "01"
        m_year = m_key.split("/")[1] if "/" in m_key else ""
        friendly_name = f"{month_names.get(m_num, m_num)} {m_year}".strip()
        m_credits = sum(x["amount"] for x in items if x["amount"] > 0)
        m_debits = sum(abs(x["amount"]) for x in items if x["amount"] < 0)
        months_summary.append({
            "key": m_key,
            "label": friendly_name,
            "count": len(items),
            "credits": round(m_credits, 2),
            "debits": round(m_debits, 2),
            "net": round(m_credits - m_debits, 2)
        })

    summary = {
        "count": len(transactions),
        "total_credits": round(total_credits, 2),
        "total_debits": round(total_debits, 2),
        "net_change": round(net_change, 2),
        "ending_balance": round(latest_balance, 2) if latest_balance is not None else None,
        "opening_balance": opening_balance,
        "calculated_ending_balance": calculated_ending,
        "target_ending_balance": target_ending,
        "balance_discrepancy": balance_discrepancy,
        "is_reconciled": is_reconciled,
        "discrepant_rows_count": len(discrepant_rows),
        "discrepant_row_indices": discrepant_rows,
        "start_date": start_date,
        "end_date": end_date,
        "date_range": date_range,
        "months": months_summary,
        "bank_detected": detected_bank,
        "account_id": info["account_id"],
        "bank_id": info["bank_id"],
        "currency": currency,
        "currency_symbol": info["currency_symbol"],
        "account_type": info["account_type"],
        "detected_date_format": doc_date_format,
        "total_pages": num_pages
    }

    return transactions, detected_bank, summary
