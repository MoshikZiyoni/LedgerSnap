/**
 * Client-Side QuickBooks OFX / QBO Specification Engine
 * Supports OFX 102 / 200, Error OL-222 Diagnosis & Repair,
 * UTF-8 and Desktop Legacy Transliteration, Context-Aware TRNTYPE,
 * Deterministic FITID Generation, and Multi-Format Exports.
 */

// Banking translations for Hebrew / International banking terms
export const BANKING_TRANSLATIONS = {
  "העברה בנקאית": "Bank Transfer",
  "העברה": "Transfer",
  "העברה לחשבון": "Transfer to Account",
  "העברה מחשבון": "Transfer from Account",
  "עמלת פעולה": "Bank Fee",
  "עמלת שורה": "Ledger Entry Fee",
  "עמלת ניהול": "Management Fee",
  "עמלה": "Fee",
  "עמלות": "Fees",
  "חיוב כרטיס אשראי": "Credit Card Charge",
  "כרטיס אשראי": "Credit Card",
  "הפקדת שיק": "Check Deposit",
  "שיק": "Check",
  "שק": "Check",
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
  "מקס": "MAX IT Finance",
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

export const BANK_INTU_PRESETS = {
  "3000": { org: "Wells Fargo", fid: "3000", bid: "3000", routing: "121000247", label: "Wells Fargo (3000 - Universal Safe Fallback)" },
  "10898": { org: "JPMorgan Chase Bank", fid: "10898", bid: "10898", routing: "021000021", label: "JPMorgan Chase Bank (10898)" },
  "6812": { org: "Bank of America", fid: "6812", bid: "6812", routing: "026009593", label: "Bank of America (6812)" },
  "24909": { org: "Citibank", fid: "24909", bid: "24909", routing: "021000089", label: "Citibank (24909)" },
  "15688": { org: "Capital One", fid: "15688", bid: "15688", routing: "051405515", label: "Capital One (15688)" },
  "3101": { org: "AMEX", fid: "3101", bid: "3101", routing: "000000000", label: "American Express (3101)" },
  "1001": { org: "American Express", fid: "1001", bid: "1001", routing: "000000000", label: "American Express (1001 Legacy)" },
  "1465": { org: "US Bank", fid: "1465", bid: "1465", routing: "091000022", label: "U.S. Bank (1465)" },
  "4332": { org: "PNC Bank", fid: "4332", bid: "4332", routing: "043000096", label: "PNC Bank (4332)" },
  "10912": { org: "TD Bank", fid: "10912", bid: "10912", routing: "011103093", label: "TD Bank (10912)" },
  "12811": { org: "Truist", fid: "12811", bid: "12811", routing: "053000196", label: "Truist (12811)" },
  "1007": { org: "Regions Bank", fid: "1007", bid: "1007", routing: "062000019", label: "Regions Bank (1007)" },
  "1011": { org: "Fifth Third Bank", fid: "1011", bid: "1011", routing: "042000314", label: "Fifth Third Bank (1011)" },
  "2440": { org: "Citizens Bank", fid: "2440", bid: "2440", routing: "011500120", label: "Citizens Bank (2440)" },
  "1014": { org: "Huntington National Bank", fid: "1014", bid: "1014", routing: "044000024", label: "Huntington Bank (1014)" },
  "1016": { org: "KeyBank", fid: "1016", bid: "1016", routing: "041001039", label: "KeyBank (1016)" },
  "2490": { org: "Navy Federal", fid: "2490", bid: "2490", routing: "256074974", label: "Navy Federal Credit Union (2490)" },
  "6781": { org: "USAA", fid: "6781", bid: "6781", routing: "314074269", label: "USAA Federal Savings Bank (6781)" },
  "1018": { org: "Charles Schwab", fid: "1018", bid: "1018", routing: "121202211", label: "Charles Schwab (1018)" },
  "1019": { org: "Fidelity", fid: "1019", bid: "1019", routing: "101205681", label: "Fidelity Investments (1019)" },
  "24001": { org: "Citibank", fid: "24001", bid: "24001", routing: "021000089", label: "Citibank (24001)" }
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
 * Sanitizes Hebrew / RTL text where visual extraction inverted symmetrical punctuation
 * such as parentheses and brackets (e.g. אוצר-חיל/ציפל ערן/)שירותי דיגיטל ( -> אוצר-חיל/ציפל ערן/(שירותי דיגיטל)).
 */
export function normalizeRtlText(text = '') {
  if (!text) return '';
  let s = String(text).trim();
  if (!/[\u0590-\u05FF]/.test(s)) return s;

  // 1. Clean trailing orphan opening paren preceded by closing paren
  if (s.includes(')') && (s.endsWith('(') || s.endsWith(' ('))) {
    s = s.replace(/\s*\(\s*$/, ')');
  }

  // 2. Repair explicit inverted pairs: )phrase( -> (phrase)
  s = s.replace(/\)([^\(\)]+?)\s*\(/g, '($1)');
  s = s.replace(/\]([^\[\]]+?)\s*\[/g, '[$1]');

  // 3. Segment level fixes
  const fixSlashSegment = (seg) => {
    let trimmed = seg.trim();
    if (!trimmed) return seg;

    if (trimmed.startsWith('(') && trimmed.endsWith(')') && (trimmed.match(/\(/g) || []).length === (trimmed.match(/\)/g) || []).length) {
      return seg.startsWith(' ') ? ' ' + trimmed : trimmed;
    }

    if (trimmed.startsWith(')') && !trimmed.includes('(')) {
      const inner = trimmed.slice(1).trim();
      if (inner.includes(')')) {
        const parts = inner.split(')').map(p => p.trim()).filter(Boolean);
        let nested = '';
        parts.forEach((p, idx) => {
          nested += (idx === 0 ? `(${p}` : ` (${p}`);
        });
        nested += ')'.repeat(parts.length);
        return seg.startsWith(' ') ? ' ' + nested : nested;
      } else {
        const res = `(${inner})`;
        return seg.startsWith(' ') ? ' ' + res : res;
      }
    }

    if (trimmed.includes(')') && trimmed.includes('(')) {
      const firstClose = trimmed.indexOf(')');
      const firstOpen = trimmed.indexOf('(');
      if (firstClose < firstOpen && (trimmed.match(/\(/g) || []).length === (trimmed.match(/\)/g) || []).length) {
        trimmed = trimmed.replace(/\)/g, '\x00').replace(/\(/g, ')').replace(/\x00/g, '(');
      }
    }

    const openCount = (trimmed.match(/\(/g) || []).length;
    const closeCount = (trimmed.match(/\)/g) || []).length;
    if (openCount > closeCount) {
      trimmed += ')'.repeat(openCount - closeCount);
    } else if (closeCount > openCount) {
      while (trimmed.startsWith(')')) {
        trimmed = '(' + trimmed.slice(1);
      }
      const curOpen = (trimmed.match(/\(/g) || []).length;
      const curClose = (trimmed.match(/\)/g) || []).length;
      if (curClose > curOpen) {
        trimmed = '('.repeat(curClose - curOpen) + trimmed;
      }
    }

    return seg.startsWith(' ') ? ' ' + trimmed : trimmed;
  };

  if (s.includes('/')) {
    s = s.split('/').map(fixSlashSegment).join('/');
  } else {
    s = fixSlashSegment(s);
  }

  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  return s;
}

/**
 * AI Payee Cleanup & Smart Truncation:
 * Cleans noisy card codes, terminal IDs, trailing store numbers while preserving full raw text in <MEMO>.
 */
export function cleanPayeeName(rawDesc = '', maxLen = 32) {
  if (!rawDesc) return 'Transaction';

  let cleaned = normalizeRtlText(String(rawDesc)).trim();

  // Known Smart Merchant Overrides
  const upper = cleaned.toUpperCase();
  if (upper.includes('WOLT') || upper.includes('וואלט')) return 'Wolt Payout';
  if (upper.includes('AMAZON') || upper.includes('AMZN')) return 'Amazon Marketplace';
  if (upper.includes('STRIPE')) return 'Stripe Payments';
  if (upper.includes('PAYPAL') || upper.includes('PYPL')) return 'PayPal';
  if (upper.includes('GOOGLE')) return 'Google Workspace';
  if (upper.includes('APPLE')) return 'Apple Store';
  if (upper.includes('MICROSOFT')) return 'Microsoft 365';
  if (upper.includes('GUSTO')) return 'Gusto Payroll';
  if (upper.includes('UBER')) return 'Uber Trip';
  if (upper.includes('מקס איט')) return 'מקס איט פיננסים';
  if (upper.includes('אלטשולר')) return 'אלטשולר שחם';
  if (upper.includes('ביטוח לאומי') || upper.includes('בטוח לאומי')) return 'ביטוח לאומי';
  if (upper.includes('ציפל ערן')) return 'ציפל ערן';

  // Strip leading card / wire / payment prefixes & bank noise
  cleaned = cleaned.replace(/^(?:DEBIT CARD PURCHASE|CHECKCARD \d+|CHECKCARD|POS PURCHASE|POS DEBIT VISA \*\d+|POS DEBIT|VISA DDA PUR|VISADDA|PURCHASE WITH PIN|ACH DEBIT|ACH CREDIT|WIRE OUT|WIRE IN|DIRECT DEPOSIT|ORIG CO NAME:)\s*[-:*]?\s*/i, '');
  cleaned = cleaned.replace(/^(?:TST\s*\*\s*|SQ\s*\*\s*|PP\s*\*\s*|PYPL\s*\*\s*|PAYPAL\s*\*\s*|SP\s*\*\s*|AMZN\s+Mktp\s+US\s*\*|AMZN\s+MKTP\s*\*)/i, '');

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
    return `${y}${m}${day}120000[0:GMT]`;
  }

  const s = String(dateStr).trim().replace(/[.-]/g, '/');
  if (/^\d{8}$/.test(s)) return `${s}120000[0:GMT]`;
  if (/^\d{14}$/.test(s)) return `${s}[0:GMT]`;
  if (/^\d{14}\[0:GMT\]$/i.test(s)) return s;

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

    return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}120000[0:GMT]`;
  }

  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}120000[0:GMT]`;
}

/**
 * 100% Deterministic FITID generation
 */
export function generateFitid(accountId, dtStr, amount, description, sameDayIndex = 0) {
  const cleanAcct = String(accountId || '123456789').replace(/[^a-zA-Z0-9]/g, '');
  const datePart = String(dtStr || '').slice(0, 8);
  const amtStr = Number(amount || 0).toFixed(2);
  const normDesc = String(description || '').replace(/\s+/g, ' ').trim();
  const rawKey = `${cleanAcct}|${datePart}|${amtStr}|${normDesc}|${sameDayIndex}`;

  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < rawKey.length; i++) {
    const ch = rawKey.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).toUpperCase().padStart(12, '0').slice(0, 12);
  return `${datePart}-${hex}`;
}

export function classifyTransaction(description = '', amount = 0, checkNum = null) {
  const desc = String(description || '').trim();
  const descUpper = desc.toUpperCase();
  let extractedCheck = checkNum;

  // 1. CHECK detection
  if (!extractedCheck) {
    const m = desc.match(/(?:שיק|המחאה|check|chk)\s*[:#\-]?\s*(\d{2,10})/i);
    if (m) extractedCheck = m[1];
  }

  const isCheck = extractedCheck !== null ||
    ['שיק', 'המחאה', 'פרעון שיק', 'הפקדת שיק', 'הפקדת שק'].some(k => desc.includes(k)) ||
    ['CHECK #', 'CHECK#', 'CHK #', 'CHK#', 'CHECK DEPOSIT', 'CHECK PAYMENT'].some(k => descUpper.includes(k));

  if (isCheck) return { type: 'CHECK', checkNum: extractedCheck };

  // 2. FEE detection
  if (amount < 0 && (
    ['עמלה', 'עמלות', 'עמלת', 'דמי ניהול', 'דמי כרטיס'].some(k => desc.includes(k)) ||
    ['SERVICE FEE', 'MONTHLY FEE', 'WIRE FEE', 'BANK FEE', 'ANNUAL FEE', 'OVERDRAFT FEE', 'NSF FEE', 'MAINTENANCE FEE', 'MONTHLY SERVICE FEE', 'SERVICE CHARGE'].some(k => descUpper.includes(k))
  )) {
    return { type: 'FEE', checkNum: null };
  }

  // 3. ATM detection
  if (
    ['משיכת מזומן', 'משיכה בכספומט', 'כספומט'].some(k => desc.includes(k)) ||
    ['ATM WITHDRAWAL', 'ATM DEPOSIT', 'ATM CASH', 'ATM ', 'CASH DISPENSE'].some(k => descUpper.includes(k))
  ) {
    return { type: 'ATM', checkNum: null };
  }

  // 4. POS detection
  if (
    ['כרטיס אשראי', 'חיוב כרטיס', 'דביט'].some(k => desc.includes(k)) ||
    ['POS PURCHASE', 'POS DEBIT', 'DEBIT CARD PURCHASE', 'CHECKCARD', 'VISA DDA', 'VISADDA', 'PURCHASE WITH PIN'].some(k => descUpper.includes(k))
  ) {
    return { type: 'POS', checkNum: null };
  }

  // 5. XFER detection
  if (
    ['העברה', 'העברת זהב', 'העברה בנקאית', 'ביט'].some(k => desc.includes(k)) ||
    ['BIT', 'ZELLE', 'VENMO', 'WIRE TRANSFER', 'ACH TRANSFER', 'ACH', 'RTGS', 'ONLINE TRANSFER'].some(k => descUpper.includes(k))
  ) {
    return { type: 'XFER', checkNum: null };
  }

  // 6. INT detection
  if (desc.includes('ריבית') || descUpper.includes('INTEREST')) {
    return { type: 'INT', checkNum: null };
  }

  // 7. PAYMENT detection
  if (
    ['חיוב כרטיס אשראי', 'תשלום כרטיס', 'הוראת קבע כרטיס'].some(k => desc.includes(k)) ||
    ['CREDIT CARD PAYMENT', 'CARD PAYMENT', 'AUTOPAY', 'PAYMENT THANK YOU', 'ONLINE PAYMENT'].some(k => descUpper.includes(k))
  ) {
    return { type: 'PAYMENT', checkNum: null };
  }

  return { type: amount >= 0 ? 'CREDIT' : 'DEBIT', checkNum: null };
}

/**
 * Parse any QBO or OFX file text client-side
 */
export function parseQboText(qboText = '') {
  const result = {
    intuBid: null,
    hasSignon: false,
    hasFi: false,
    org: null,
    fid: null,
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

  const bidMatch = qboText.match(/<INTU\.BID>(\d+)/i);
  if (bidMatch) {
    result.intuBid = bidMatch[1];
  } else {
    result.errors.push('Missing <INTU.BID> tag (Triggers QuickBooks Web Connect Error OL-222).');
  }

  if (/<FI>/i.test(qboText)) {
    result.hasFi = true;
    const orgM = qboText.match(/<ORG>([^<\r\n]+)/i);
    const fidM = qboText.match(/<FID>([^<\r\n]+)/i);
    if (orgM) result.org = orgM[1].trim();
    if (fidM) result.fid = fidM[1].trim();
  } else {
    result.warnings.push('Missing <FI> institution block in <SONRS>. Required for strict QuickBooks Desktop imports.');
  }

  const curMatch = qboText.match(/<CURDEF>([A-Za-z]{3})/i);
  if (curMatch) {
    result.currency = curMatch[1].toUpperCase();
  }

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
  if (bankIdMatch) result.bankId = bankIdMatch[1].trim();

  const startMatch = qboText.match(/<DTSTART>([^<\r\n]+)/i);
  if (startMatch) result.dtStart = startMatch[1].trim();

  const endMatch = qboText.match(/<DTEND>([^<\r\n]+)/i);
  if (endMatch) result.dtEnd = endMatch[1].trim();

  const balMatch = qboText.match(/<BALAMT>([^<\r\n]+)/i);
  if (balMatch) result.ledgerBal = parseFloat(balMatch[1].trim());

  if (/&(?!(amp|lt|gt|quot|apos);)/i.test(qboText)) {
    result.errors.push("Contains unescaped '&' characters (Causes XML/SGML parse failure in QuickBooks).");
  }

  const txnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;
  let rowIdx = 0;
  const fitidSet = new Set();

  while ((match = txnRegex.exec(qboText)) !== null) {
    rowIdx++;
    const block = match[1];

    const typeMatch = block.match(/<TRNTYPE>([^<\r\n]+)/i);
    const dateMatch = block.match(/<DTPOSTED>([^<\r\n]+)/i);
    const amtMatch = block.match(/<TRNAMT>([^<\r\n]+)/i);
    const fitidMatch = block.match(/<FITID>([^<\r\n]+)/i);
    const nameMatch = block.match(/<NAME>([^<\r\n]+)/i);
    const memoMatch = block.match(/<MEMO>([^<\r\n]+)/i);
    const checkMatch = block.match(/<CHECKNUM>([^<\r\n]+)/i);

    const rawName = nameMatch ? nameMatch[1].trim() : 'Transaction';
    const rawDate = dateMatch ? dateMatch[1].trim() : '';
    const amt = amtMatch ? parseFloat(amtMatch[1].trim()) : 0;
    const fitid = fitidMatch ? fitidMatch[1].trim() : '';
    const checkNum = checkMatch ? checkMatch[1].trim() : null;

    if (rawName.length > 32) {
      result.warnings.push(`Row ${rowIdx}: <NAME> exceeds 32 characters ("${rawName.slice(0, 36)}...").`);
    }

    if (!fitid) {
      result.warnings.push(`Row ${rowIdx}: Missing <FITID> identifier.`);
    } else if (fitidSet.has(fitid)) {
      result.errors.push(`Row ${rowIdx}: Duplicate <FITID> "${fitid}" detected!`);
    } else {
      fitidSet.add(fitid);
    }

    result.transactions.push({
      id: rowIdx,
      type: typeMatch ? typeMatch[1].trim() : (amt >= 0 ? 'CREDIT' : 'DEBIT'),
      date: rawDate,
      amount: amt,
      fitid: fitid,
      name: rawName,
      memo: memoMatch ? memoMatch[1].trim() : rawName,
      checkNum: checkNum
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

  // Inject FI block and INTU.BID
  if (!/<INTU\.BID>/i.test(fixed) || !/<FI>/i.test(fixed)) {
    const fiBlock = `<FI>\n<ORG>Wells Fargo\n<FID>3000\n</FI>\n<INTU.BID>3000`;
    if (/<SONRS>/i.test(fixed)) {
      fixed = fixed.replace(/<SONRS>/i, `<SONRS>\n${fiBlock}`);
      repairs.push('Injected valid <FI> institution block and <INTU.BID>3000 into sign-on header.');
    } else {
      fixed = `<OFX>\n<SIGNONMSGSRSV1>\n<SONRS>\n<STATUS><CODE>0<SEVERITY>INFO</STATUS>\n<DTSERVER>${formatOfxDate()}</DTSERVER>\n<LANGUAGE>ENG\n${fiBlock}\n</SONRS>\n</SIGNONMSGSRSV1>\n` + fixed;
      repairs.push('Created standard <SIGNONMSGSRSV1> with <FI> and <INTU.BID>3000.');
    }
  }

  fixed = fixed.replace(/<NAME>([^<\r\n]+)/gi, (m, name) => {
    let clean = normalizeRtlText(escapeOfxXml(name));
    if (clean.length > 32) {
      clean = cleanPayeeName(clean, 32);
      repairs.push(`Truncated <NAME> to 32 chars: "${clean}"`);
    }
    return `<NAME>${clean}`;
  });

  fixed = fixed.replace(/<MEMO>([^<\r\n]+)/gi, (m, memo) => {
    return `<MEMO>${normalizeRtlText(escapeOfxXml(memo)).slice(0, 255)}`;
  });

  fixed = fixed.replace(/&(?!(amp|lt|gt|quot|apos);)/gi, '&amp;');

  return {
    fixedContent: fixed,
    repairsApplied: repairs
  };
}

/**
 * Builds a certified QuickBooks (.QBO) file with full specifications
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
  const cleanBid = String(intuBid || '3000').trim();
  const isCreditCard = ['CREDITCARD', 'CC', 'CREDIT_CARD', 'CREDITLINE'].includes(String(accountType).toUpperCase().trim());

  const preset = BANK_INTU_PRESETS[cleanBid] || {
    org: cleanBid === '3000' ? 'Wells Fargo' : (bankName || 'Wells Fargo'),
    fid: cleanBid,
    routing: '000000000'
  };

  const defaultRouting = preset.routing || '000000000';
  const rawBankId = String(bankId || '').replace(/[^0-9]/g, '');
  const cleanBankId = rawBankId.length === 9 
    ? rawBankId 
    : (!rawBankId || rawBankId === '0' || rawBankId === '000000000' || (rawBankId === '3000' && defaultRouting !== '000000000'))
      ? defaultRouting
      : rawBankId.padStart(9, '0').slice(0, 9);

  const sorted = [...transactions].map(t => {
    const dStr = formatOfxDate(t.date, dateFormat);
    let amt = parseFloat(t.amount || 0);
    if (isCreditCard) {
      const typeStr = String(t.type || '').toUpperCase();
      if (['DEBIT', 'WITHDRAWAL', 'PURCHASE', 'CHARGE'].includes(typeStr) || (amt > 0 && !['CREDIT', 'DEPOSIT', 'PAYMENT', 'REFUND'].includes(typeStr))) {
        amt = -Math.abs(amt);
      } else {
        amt = Math.abs(amt);
      }
    }
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
<FI>
<ORG>${preset.org}
<FID>${preset.fid}
</FI>
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
    const rawDesc = String(t.description || t.name || 'Transaction');
    const { type: trnType, checkNum } = classifyTransaction(rawDesc, amt, t.checkNum || t.check_num);
    const checkTag = checkNum ? `<CHECKNUM>${checkNum}\n` : '';

    let name = cleanPayeeName(rawDesc, 32);
    let memo = normalizeRtlText(rawDesc).slice(0, 255);

    if (!allowUnicode) {
      name = transliterateHebrew(name);
      memo = transliterateHebrew(memo);
    }

    name = escapeOfxXml(name).slice(0, 32) || 'Transaction';
    memo = escapeOfxXml(memo).slice(0, 255) || name;

    const normRaw = rawDesc.replace(/\s+/g, ' ').trim();
    const dayKey = `${dt.slice(0, 8)}|${amt.toFixed(2)}|${normRaw}`;
    const occ = dayOccurrences[dayKey] || 0;
    dayOccurrences[dayKey] = occ + 1;

    const fitid = generateFitid(cleanAcctId, dt, amt, rawDesc, occ);

    txnBlocks.push(`<STMTTRN>
<TRNTYPE>${trnType}
<DTPOSTED>${dt}
<TRNAMT>${amt.toFixed(2)}
<FITID>${fitid}
${checkTag}<NAME>${name}
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

export function generateClientCsv3Col(transactions = []) {
  const lines = ['Date,Description,Amount'];
  for (const t of transactions) {
    const d = String(t.date || '');
    const desc = '"' + normalizeRtlText(String(t.description || '')).replace(/"/g, '""').trim() + '"';
    const amt = Number(t.amount || 0).toFixed(2);
    lines.push(`${d},${desc},${amt}`);
  }
  return lines.join('\n');
}

export function generateClientCsv4Col(transactions = []) {
  const lines = ['Date,Description,Credit,Debit'];
  for (const t of transactions) {
    const d = String(t.date || '');
    const desc = '"' + normalizeRtlText(String(t.description || '')).replace(/"/g, '""').trim() + '"';
    const amt = Number(t.amount || 0);
    const cr = amt > 0 ? amt.toFixed(2) : '';
    const dr = amt < 0 ? Math.abs(amt).toFixed(2) : '';
    lines.push(`${d},${desc},${cr},${dr}`);
  }
  return lines.join('\n');
}

export function generateClientHashavshevetCsv(transactions = []) {
  const lines = ['תאריך ערך,תאריך תנועה,אסמכתא,פרטים,חובה,זכות,יתרה'];
  transactions.forEach((t, idx) => {
    const d = String(t.date || '');
    const ref = String(t.checkNum || t.check_num || idx + 1);
    const desc = '"' + normalizeRtlText(String(t.description || '')).replace(/"/g, '""').trim() + '"';
    const amt = Number(t.amount || 0);
    const bal = t.balance !== null && t.balance !== undefined ? Number(t.balance).toFixed(2) : '';
    const hova = amt < 0 ? Math.abs(amt).toFixed(2) : '';
    const zchut = amt > 0 ? amt.toFixed(2) : '';
    lines.push(`${d},${d},${ref},${desc},${hova},${zchut},${bal}`);
  });
  return lines.join('\n');
}

export function generateClientQfx(params = {}) {
  return generateClientQbo(params);
}

export function generateClientOfx(params = {}) {
  return generateClientQbo({ ...params, intuBid: '3000' });
}

