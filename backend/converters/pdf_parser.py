import re
import pdfplumber
import io
from typing import List, Dict, Any, Tuple

# Regex patterns for common dates (supports US MM/DD/YYYY, ISO YYYY-MM-DD, and Israeli DD/MM/YYYY)
DATE_PATTERNS = [
    r'(\d{1,2}/\d{1,2}/\d{4})',
    r'(\d{1,2}/\d{1,2}/\d{2})',
    r'(\d{4}-\d{1,2}-\d{1,2})',
    r'(\d{1,2}-\d{1,2}-\d{4})',
    r'([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})',
    r'(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})',
    r'(\d{1,2}/\d{1,2})'
]

# Amount pattern: $1,234.56, 42,371.05, 1,644.27, -120.00, (50.00)
AMOUNT_REGEX = r'[\$₪]?\s*[\(]?\s*[\-]?[0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}\s*[\)]?'

def clean_amount(val_str: str) -> float:
    """Converts strings like '$1,234.56', '42,371.05', '₪70.00', '(50.00)', '-12.00' to float."""
    if not val_str:
        return 0.0
    s = str(val_str).strip().replace('$', '').replace('₪', '').replace(',', '').replace('\n', ' ')
    is_negative = False
    if '(' in s and ')' in s:
        is_negative = True
        s = s.replace('(', '').replace(')', '')
    if '-' in s:
        is_negative = True
        s = s.replace('-', '')
    try:
        val = float(s)
        return -val if is_negative else val
    except ValueError:
        return 0.0

def reverse_visual_hebrew(text: str) -> str:
    """
    Properly reverses visual-order Hebrew text extracted from Israeli bank PDFs.
    Handles mixed English words, numbers, slashes, and Hebrew words.
    """
    if not text:
        return ""
    
    text = " ".join(str(text).split())
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

def detect_bank(text: str) -> str:
    """Detects bank name from statement header text (US & Israeli banks)."""
    lower = text.lower()
    
    # Israeli Banks (handles normal & visual-reversed Hebrew tokens)
    if 'יהב' in text or 'בהי' in text or '04-131' in text or '04-' in text or 'yahav' in lower:
        return "Bank Yahav"
    elif 'פועלים' in text or 'םילעופה' in text or 'hapoalim' in lower:
        return "Bank Hapoalim"
    elif 'לאומי' in text or 'ימואל' in text or 'leumi' in lower:
        return "Bank Leumi"
    elif 'דיסקונט' in text or 'טנוקסיד' in text or 'discount' in lower:
        return "Israel Discount Bank"
    elif 'מזרחי' in text or 'יחרזמ' in text or 'tefahot' in lower or 'mizrahi' in lower:
        return "Mizrahi Tefahot Bank"
    elif 'בינלאומי' in text or 'ימואלניב' in text or 'fibi' in lower:
        return "First International Bank of Israel (FIBI)"
    elif 'מקס' in text or 'סקמ' in text or 'max' in lower:
        return "MAX IT Finance"
    elif 'ישראכרט' in text or 'טרכארשי' in text or 'isracard' in lower:
        return "Isracard"
    elif 'כאל' in text or 'לאכ' in text or 'cal' in lower:
        return "Cal Credit Cards"

    # US / UK Banks
    elif 'chase' in lower or 'jpmorgan' in lower:
        return "JPMorgan Chase"
    elif 'bank of america' in lower or 'bofa' in lower:
        return "Bank of America"
    elif 'wells fargo' in lower:
        return "Wells Fargo"
    elif 'citibank' in lower or 'citi' in lower:
        return "Citibank"
    elif 'capital one' in lower:
        return "Capital One"
    elif 'barclays' in lower:
        return "Barclays"
    elif 'td bank' in lower:
        return "TD Bank"
    elif 'pnc' in lower:
        return "PNC Bank"
    elif 'us bank' in lower:
        return "U.S. Bank"
    
    return "Commercial Bank Statement"

def extract_transactions_from_pdf(pdf_bytes: bytes) -> Tuple[List[Dict[str, Any]], str, Dict[str, Any]]:
    """
    Parses a bank statement PDF and extracts structured transactions.
    Supports English & Hebrew column headers, RTL/LTR layouts.
    """
    transactions: List[Dict[str, Any]] = []
    detected_bank = "Commercial Bank Statement"

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        if len(pdf.pages) > 0:
            first_page_text = pdf.pages[0].extract_text() or ""
            detected_bank = detect_bank(first_page_text)

        for page_idx, page in enumerate(pdf.pages):
            page_text = page.extract_text() or ""
            
            # 1. Try table extraction with pdfplumber
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

                        # Extract Description & fix visual Hebrew
                        raw_desc = str(row[desc_col] or '').strip().replace('\n', ' ') if desc_col != -1 and desc_col < len(row) else "Bank Transaction"
                        desc_val = reverse_visual_hebrew(raw_desc)

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
                                "date": date_match,
                                "description": desc_val or "Transaction",
                                "amount": round(amount, 2),
                                "type": "Credit" if amount > 0 else "Debit",
                                "balance": round(bal_val, 2) if bal_val is not None else None
                            })
                            table_extracted = True

            # 2. Text fallback if table extraction missed rows
            if not table_extracted:
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

                            transactions.append({
                                "date": date_match,
                                "description": desc_part or "Bank Transaction",
                                "amount": round(amt, 2),
                                "type": "Credit" if amt > 0 else "Debit",
                                "balance": round(bal, 2) if bal is not None else None
                            })

    total_credits = sum(t["amount"] for t in transactions if t["amount"] > 0)
    total_debits = sum(abs(t["amount"]) for t in transactions if t["amount"] < 0)
    net_change = sum(t["amount"] for t in transactions)

    # Determine Ending Balance (latest balance in statement)
    latest_balance = next((t["balance"] for t in transactions if t["balance"] is not None), None)
    
    # Determine Starting Balance (balance before oldest transaction)
    oldest_txn = next((t for t in reversed(transactions) if t["balance"] is not None), None)
    opening_balance = None
    if oldest_txn:
        opening_balance = round(oldest_txn["balance"] - oldest_txn["amount"], 2)

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
            if len(parts[0]) == 4:
                m_key = f"{parts[1]}/{parts[0]}"
            else:
                m_key = f"{parts[1]}/{parts[2]}"
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
        "start_date": start_date,
        "end_date": end_date,
        "date_range": date_range,
        "months": months_summary,
        "bank_detected": detected_bank,
        "currency": "ILS" if any(b in (detected_bank or "") for b in ["Yahav", "Hapoalim", "Leumi", "Discount", "Mizrahi", "FIBI", "MAX", "Isracard", "Cal"]) else "USD",
        "currency_symbol": "₪" if any(b in (detected_bank or "") for b in ["Yahav", "Hapoalim", "Leumi", "Discount", "Mizrahi", "FIBI", "MAX", "Isracard", "Cal"]) else "$"
    }

    return transactions, detected_bank, summary
