/**
 * Client-Side QuickBooks OFX / QBO Specification Engine
 * Supports OFX 102 / 200, Error OL-222 Diagnosis & Repair,
 * UTF-8 and Desktop Legacy Transliteration, and Deterministic FITID Generation.
 */

// Banking translations for Hebrew / International banking terms
export const BANKING_TRANSLATIONS = {
  "העברה בנקאית": "Bank Transfer",
  "העברה": "Transfer",
  "העברה לחשבון": "Transfer to Account",
  "העברה מחשבון": "Transfer from Account",
  "עמלת פעולה": "Bank Fee",
  "עמלת שורה": "Ledger Entry Fee",
  "עמלה": "Fee",
  "חיוב כרטיס אשראי": "Credit Card Charge",
  "כרטיס אשראי": "Credit Card",
  "הפקדת שיק": "Check Deposit",
  "שיק": "Check",
  "משכורת": "Salary Payroll",
  "מס הכנסה": "Income Tax",
  "מע\"מ": "VAT Tax",
  "מעמ": "VAT Tax",
  "ביטוח לאומי": "National Insurance",
  "הוראת קבע": "Standing Order",
  "משיכת מזומן": "ATM Withdrawal",
  "משיכה": "Withdrawal",
  "הפקדה": "Deposit",
  "זיכוי": "Credit Refund",
  "חיוב": "Debit Charge",
  "ריבית": "Interest",
  "הלוואה": "Loan Payment",
  "ארנונה": "Municipal Tax",
  "חשמל": "Electricity Utility",
  "מים": "Water Utility",
  "בזק": "Telecom Bezeq",
  "דלק": "Fuel Gas Station",
  "סופרמרקט": "Supermarket",
  "שופרסל": "Shufersal",
  "רמי לוי": "Rami Levy",
  "סופר פארם": "Super-Pharm",
  "מקס": "MAX Finance",
  "ישראכרט": "Isracard",
  "כאל": "Cal Credit Cards"
};

const HEBREW_PHONETIC_MAP = {
  'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H',
  'ו': 'V', 'ז': 'Z', 'ח': 'Ch', 'ט': 'T', 'י': 'Y',
  'כ': 'K', 'ך': 'K', 'ל': 'L', 'מ': 'M', 'ם': 'M',
  'נ': 'N', 'ן': 'N', 'ס': 'S', 'ע': 'A', 'פ': 'P',
  'ף': 'F', 'צ': 'Tz', 'ץ': 'Tz', 'ק': 'K', 'ר': 'R',
  'ש': 'Sh', 'ת': 'T'
};

export function transliterateHebrew(text = '') {
  let cleaned = text.trim();
  for (const [term, trans] of Object.entries(BANKING_TRANSLATIONS)) {
    if (cleaned.includes(term)) {
      cleaned = cleaned.replaceAll(term, trans);
    }
  }
  let out = '';
  for (const ch of cleaned) {
    out += HEBREW_PHONETIC_MAP[ch] || ch;
  }
  return out.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim() || 'Transaction';
}

export function escapeOfxXml(str = '') {
  return String(str)
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * AI Payee Cleanup & Smart Truncation:
 * Cleans noisy card codes, transaction reference strings, terminal IDs, trailing store numbers
 * while preserving full raw text in <MEMO>.
 */
export function cleanPayeeName(rawDesc = '', maxLen = 32) {
  if (!rawDesc) return 'Transaction';

  let cleaned = String(rawDesc).trim();

  // Strip leading card / wire prefixes
  cleaned = cleaned.replace(/^(?:DEBIT CARD PURCHASE|CHECKCARD|POS PURCHASE|POS DEBIT|VISA DDA PUR|PURCHASE WITH PIN|ACH DEBIT|ACH CREDIT|WIRE OUT|WIRE IN|DIRECT DEPOSIT)\s*[-:]?\s*/i, '');
  cleaned = cleaned.replace(/^(?:TST\s*\*\s*|SQ\s*\*\s*|PYPL\s*\*\s*|PAYPAL\s*\*\s*|SP\s*\*\s*|AMZN\s+Mktp\s+US\s*\*)/i, '');

  // Strip trailing reference numbers / store numbers like #1234 or ID: 99482
  cleaned = cleaned.replace(/(?:#\d+|\bSTORE\s*\d+|\bLOC\s*\d+|\bTERMINAL\s*\d+|\bREF\s*[:#]?\s*\d+).*/i, '');
  // Strip trailing city/state codes like 'SEATTLE WA 98101'
  cleaned = cleaned.replace(/\b[A-Z\s]{2,18}\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?$/i, '');
  // Clean stray reference numbers glued to currency
  cleaned = cleaned.replace(/(\d+)(?:ILS|ש\"ח|שח|₪)(\d*)/g, '$1 $2');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (!cleaned) cleaned = rawDesc.trim();

  if (cleaned.length <= maxLen) {
    return cleaned;
  }

  // Truncate cleanly at word boundary
  const sub = cleaned.slice(0, maxLen);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > 16) {
    return sub.slice(0, lastSpace).trim();
  }
  return sub.trim();
}

export function formatOfxDate(dateStr = '', preferredFormat = 'DD/MM/YYYY') {
  if (!dateStr) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}120000`;
  }

  const s = String(dateStr).trim().replace(/[.-]/g, '/');
  // Check if already YYYYMMDD
  if (/^\d{8}$/.test(s)) return `${s}120000`;
  if (/^\d{14}$/.test(s)) return s;

  const parts = s.match(/\d+/g);
  if (parts && parts.length >= 3) {
    let p1 = parseInt(parts[0], 10);
    let p2 = parseInt(parts[1], 10);
    let p3 = parseInt(parts[2], 10);

    let year = p3 < 100 ? 2000 + p3 : p3;
    let day = p1;
    let month = p2;

    if (p1 > 1000) {
      year = p1;
      month = p2;
      day = p3;
    } else if (preferredFormat === 'MM/DD/YYYY') {
      month = p1;
      day = p2;
    }

    if (month > 12 && day <= 12) {
      const temp = day;
      day = month;
      month = temp;
    }

    return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}120000`;
  }

  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}120000`;
}

/**
 * Deterministic FITID generation
 */
export function generateFitid(accountId, dtStr, amount, description, intraDayIdx = 1) {
  const cleanDesc = (description || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 16);
  const amtStr = Number(amount || 0).toFixed(2);
  const datePart = (dtStr || '').slice(0, 8);
  const acctPart = String(accountId || '9999').replace(/[^0-9]/g, '').slice(-6) || '9999';

  // Simple deterministic hash
  const key = `${acctPart}:${datePart}:${amtStr}:${cleanDesc}:${intraDayIdx}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `${datePart}-${hex}`;
}

/**
 * Parse any QBO or OFX file text client-side
 */
export function parseQboText(qboText = '') {
  const result = {
    intuBid: null,
    hasSignon: false,
    hasBankMsg: false,
    hasCreditCardMsg: false,
    currency: 'USD',
    accountId: null,
    bankId: null,
    accountType: 'CHECKING',
    dtStart: null,
    dtEnd: null,
    ledgerBal: null,
    transactions: [],
    errors: [],
    warnings: [],
    rawText: qboText
  };

  if (!qboText || qboText.trim().length === 0) {
    result.errors.push('File is empty.');
    return result;
  }

  // Check INTU.BID
  const bidMatch = qboText.match(/<INTU\.BID>(\d+)/i);
  if (bidMatch) {
    result.intuBid = bidMatch[1];
  } else {
    result.errors.push('Missing <INTU.BID> tag (Triggers QuickBooks Web Connect Error OL-222).');
  }

  // Check Currency
  const curMatch = qboText.match(/<CURDEF>([A-Za-z]{3})/i);
  if (curMatch) {
    result.currency = curMatch[1].toUpperCase();
  }

  // Check Account Type
  if (/<CREDITCARDMSGSRSV1>/i.test(qboText) || /<CCACCTFROM>/i.test(qboText)) {
    result.hasCreditCardMsg = true;
    result.accountType = 'CREDITCARD';
  } else if (/<BANKMSGSRSV1>/i.test(qboText)) {
    result.hasBankMsg = true;
    result.accountType = 'CHECKING';
  }

  const acctMatch = qboText.match(/<ACCTID>([^<\r\n]+)/i);
  if (acctMatch) {
    result.accountId = acctMatch[1].trim();
  } else {
    result.warnings.push('Missing <ACCTID> tag.');
  }

  const bankIdMatch = qboText.match(/<BANKID>([^<\r\n]+)/i);
  if (bankIdMatch) {
    result.bankId = bankIdMatch[1].trim();
  }

  const startMatch = qboText.match(/<DTSTART>([^<\r\n]+)/i);
  if (startMatch) result.dtStart = startMatch[1].trim();

  const endMatch = qboText.match(/<DTEND>([^<\r\n]+)/i);
  if (endMatch) result.dtEnd = endMatch[1].trim();

  const balMatch = qboText.match(/<BALAMT>([^<\r\n]+)/i);
  if (balMatch) result.ledgerBal = parseFloat(balMatch[1].trim());

  // Check unescaped ampersands outside of entities
  if (/&(?!(amp|lt|gt|quot|apos);)/i.test(qboText)) {
    result.errors.push('Contains unescaped \'&\' characters (Causes XML/SGML parse failure in QuickBooks).');
  }

  // Parse STMTTRN blocks
  const txnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;
  let rowIdx = 0;

  while ((match = txnRegex.exec(qboText)) !== null) {
    rowIdx++;
    const block = match[1];

    const typeMatch = block.match(/<TRNTYPE>([^<\r\n]+)/i);
    const dateMatch = block.match(/<DTPOSTED>([^<\r\n]+)/i);
    const amtMatch = block.match(/<TRNAMT>([^<\r\n]+)/i);
    const fitidMatch = block.match(/<FITID>([^<\r\n]+)/i);
    const nameMatch = block.match(/<NAME>([^<\r\n]+)/i);
    const memoMatch = block.match(/<MEMO>([^<\r\n]+)/i);

    const rawName = nameMatch ? nameMatch[1].trim() : 'Transaction';
    const rawDate = dateMatch ? dateMatch[1].trim() : '';
    const amt = amtMatch ? parseFloat(amtMatch[1].trim()) : 0;
    const fitid = fitidMatch ? fitidMatch[1].trim() : '';

    if (rawName.length > 32) {
      result.warnings.push(`Row ${rowIdx}: <NAME> exceeds 32 characters ("${rawName.slice(0, 36)}...").`);
    }

    if (!fitid) {
      result.warnings.push(`Row ${rowIdx}: Missing <FITID> identifier.`);
    }

    result.transactions.push({
      id: rowIdx,
      type: typeMatch ? typeMatch[1].trim() : (amt >= 0 ? 'CREDIT' : 'DEBIT'),
      date: rawDate,
      amount: amt,
      fitid: fitid,
      name: rawName,
      memo: memoMatch ? memoMatch[1].trim() : rawName
    });
  }

  if (result.transactions.length === 0) {
    result.warnings.push('No <STMTTRN> transactions found in file.');
  }

  return result;
}

/**
 * Repairs a broken QBO/OFX file to fix QuickBooks Error OL-222
 */
export function fixQboErrorOL222(qboText = '') {
  let fixed = qboText;
  const repairs = [];

  // 1. Inject or fix INTU.BID
  if (!/<INTU\.BID>/i.test(fixed)) {
    if (/<SONRS>/i.test(fixed)) {
      fixed = fixed.replace(/<SONRS>/i, '<SONRS>\n<INTU.BID>3000');
      repairs.push('Injected valid <INTU.BID>3000 into sign-on header.');
    } else {
      fixed = `<OFX>\n<SIGNONMSGSRSV1>\n<SONRS>\n<STATUS><CODE>0<SEVERITY>INFO</STATUS>\n<DTSERVER>${formatOfxDate()}</DTSERVER>\n<LANGUAGE>ENG\n<INTU.BID>3000\n</SONRS>\n</SIGNONMSGSRSV1>\n` + fixed;
      repairs.push('Created standard <SIGNONMSGSRSV1> with <INTU.BID>3000.');
    }
  }

  // 2. Escape XML entities in transaction names and memos
  fixed = fixed.replace(/<NAME>([^<\r\n]+)/gi, (m, name) => {
    let clean = escapeOfxXml(name);
    if (clean.length > 32) {
      clean = cleanPayeeName(clean, 32);
      repairs.push(`Truncated <NAME> to 32 chars: "${clean}"`);
    }
    return `<NAME>${clean}`;
  });

  fixed = fixed.replace(/<MEMO>([^<\r\n]+)/gi, (m, memo) => {
    return `<MEMO>${escapeOfxXml(memo).slice(0, 255)}`;
  });

  // 3. Fix unescaped ampersands in other tags
  fixed = fixed.replace(/&(?!(amp|lt|gt|quot|apos);)/gi, '&amp;');

  return {
    fixedContent: fixed,
    repairsApplied: repairs
  };
}

/**
 * Builds a certified QuickBooks (.QBO) file from structured transactions
 */
export function generateClientQbo({
  transactions = [],
  bankName = 'Bank Statement',
  accountId = '123456789',
  bankId = '3000',
  currency = 'USD',
  accountType = 'CHECKING',
  exportMode = 'utf8',
  intuBid = '3000',
  dateFormat = 'DD/MM/YYYY',
  openingBalance = null,
  endingBalance = null
}) {
  const allowUnicode = exportMode.toLowerCase() !== 'ascii';
  const cleanCurrency = String(currency || 'USD').toUpperCase().trim();
  const cleanAcctId = String(accountId || '123456789').replace(/[^a-zA-Z0-9]/g, '').slice(-10) || '123456789';
  const cleanBankId = String(bankId || '3000').replace(/[^a-zA-Z0-9]/g, '').slice(0, 9) || '3000';
  const cleanBid = String(intuBid || '3000').trim();
  const isCreditCard = ['CREDITCARD', 'CC', 'CREDIT_CARD'].includes(String(accountType).toUpperCase().trim());

  // Sort chronologically
  const sorted = [...transactions].map(t => {
    const dStr = formatOfxDate(t.date, dateFormat);
    const amt = parseFloat(t.amount || 0);
    return { ...t, _d: dStr, _amt: amt };
  }).sort((a, b) => a._d.localeCompare(b._d));

  const nowStr = formatOfxDate();
  const startDate = sorted.length > 0 ? sorted[0]._d : nowStr;
  const endDate = sorted.length > 0 ? sorted[sorted.length - 1]._d : nowStr;

  let totalBal = endingBalance !== null && endingBalance !== undefined
    ? parseFloat(endingBalance)
    : (openingBalance !== null ? parseFloat(openingBalance) : 0) + sorted.reduce((sum, t) => sum + t._amt, 0);

  const encodingHeader = allowUnicode
    ? 'ENCODING:UTF-8\nCHARSET:NONE'
    : 'ENCODING:USASCII\nCHARSET:1252';

  const header = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
${encodingHeader}
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
<DTSERVER>${nowStr}
<LANGUAGE>ENG
<INTU.BID>${cleanBid}
</SONRS>
</SIGNONMSGSRSV1>
`;

  const acctBlock = isCreditCard
    ? `<CREDITCARDMSGSRSV1>
<CCSTMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<CCSTMTRS>
<CURDEF>${cleanCurrency}
<CCACCTFROM>
<ACCTID>${cleanAcctId}
</CCACCTFROM>
<BANKTRANLIST>
<DTSTART>${startDate}
<DTEND>${endDate}
`
    : `<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>${cleanCurrency}
<BANKACCTFROM>
<BANKID>${cleanBankId}
<ACCTID>${cleanAcctId}
<ACCTTYPE>${['CHECKING', 'SAVINGS'].includes(accountType.toUpperCase()) ? accountType.toUpperCase() : 'CHECKING'}
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${startDate}
<DTEND>${endDate}
`;

  const dayOccurrences = {};
  const txnBlocks = [];

  for (const t of sorted) {
    const dt = t._d;
    const amt = t._amt;
    const type = amt >= 0 ? 'CREDIT' : 'DEBIT';
    const rawDesc = String(t.description || t.name || 'Transaction');

    let name = cleanPayeeName(rawDesc, 32);
    let memo = rawDesc.slice(0, 255);

    if (!allowUnicode) {
      name = transliterateHebrew(name);
      memo = transliterateHebrew(memo);
    }

    name = escapeOfxXml(name).slice(0, 32) || 'Transaction';
    memo = escapeOfxXml(memo).slice(0, 255) || name;

    const dayKey = `${dt.slice(0, 8)}:${amt.toFixed(2)}:${name}`;
    dayOccurrences[dayKey] = (dayOccurrences[dayKey] || 0) + 1;
    const fitid = generateFitid(cleanAcctId, dt, amt, rawDesc, dayOccurrences[dayKey]);

    txnBlocks.push(`<STMTTRN>
<TRNTYPE>${type}
<DTPOSTED>${dt}
<TRNAMT>${amt.toFixed(2)}
<FITID>${fitid}
<NAME>${name}
<MEMO>${memo}
</STMTTRN>`);
  }

  const footer = isCreditCard
    ? `</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>${totalBal.toFixed(2)}
<DTASOF>${endDate}
</LEDGERBAL>
</CCSTMTRS>
</CCSTMTTRNRS>
</CREDITCARDMSGSRSV1>
</OFX>
`
    : `</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>${totalBal.toFixed(2)}
<DTASOF>${endDate}
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
`;

  return header + acctBlock + txnBlocks.join('\n') + '\n' + footer;
}
