import re
from datetime import datetime
from typing import List, Dict, Any

def sanitize_text(text: str) -> str:
    """Removes special characters that break OFX/QBO parsers."""
    if not text:
        return "Transaction"
    # QBO only allows alphanumeric and basic punctuation up to 32 chars for NAME
    cleaned = re.sub(r'[^a-zA-Z0-9\s\.\,\-\_]', '', text)
    return cleaned.strip()[:32] or "Transaction"

def parse_date_to_qbo(date_str: str) -> str:
    """Converts common date formats to QBO format: YYYYMMDD120000"""
    date_str = date_str.strip()
    formats = [
        "%m/%d/%Y", "%m/%d/%y", "%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", 
        "%b %d, %Y", "%b %d %Y", "%d %b %Y", "%m-%d-%Y"
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%Y%m%d120000")
        except ValueError:
            continue
    # Fallback to today if unparseable
    return datetime.now().strftime("%Y%m%d120000")

def generate_qbo(transactions: List[Dict[str, Any]], bank_name: str = "CHASE", account_id: str = "123456789") -> str:
    """
    Generates a valid, standard-compliant QuickBooks Online/Desktop (.QBO / OFX 102) Web Connect file.
    """
    now_str = datetime.now().strftime("%Y%m%d120000")
    
    # Sort or determine date range
    start_date = now_str[:8]
    end_date = now_str[:8]
    if transactions:
        first_dt = parse_date_to_qbo(transactions[0].get("date", ""))[:8]
        last_dt = parse_date_to_qbo(transactions[-1].get("date", ""))[:8]
        start_date = min(first_dt, last_dt)
        end_date = max(first_dt, last_dt)

    # Calculate balance if not provided
    total_balance = 0.0
    for t in transactions:
        total_balance += float(t.get("amount", 0.0))

    qbo_header = f"""OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
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
<INTU.BID>3000
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>USD
<BANKACCTFROM>
<BANKID>123456789
<ACCTID>{account_id[-10:] if account_id else '123456789'}
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>{start_date}
<DTEND>{end_date}
"""

    txn_blocks = []
    for idx, t in enumerate(transactions, 1):
        dt = parse_date_to_qbo(t.get("date", ""))
        amt = float(t.get("amount", 0.0))
        txn_type = "CREDIT" if amt >= 0 else "DEBIT"
        name = sanitize_text(t.get("description", "Transaction"))
        fitid = f"{dt[:8]}{idx:04d}"

        txn_blocks.append(f"""<STMTTRN>
<TRNTYPE>{txn_type}
<DTPOSTED>{dt}
<TRNAMT>{amt:.2f}
<FITID>{fitid}
<NAME>{name}
<MEMO>{name}
</STMTTRN>""")

    qbo_footer = f"""</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>{total_balance:.2f}
<DTASOF>{now_str}
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
"""

    return qbo_header + "\n".join(txn_blocks) + "\n" + qbo_footer
