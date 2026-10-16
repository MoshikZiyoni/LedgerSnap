/**
 * Technical Troubleshooting Guides for QuickBooks Import Errors
 */

export const SEO_GUIDES = [
  {
    slug: 'fix-quickbooks-web-connect-error-ol-222-ol-301',
    aliases: ['how-to-fix-quickbooks-web-connect-error-ol-222'],
    title: 'How to Fix QuickBooks Error OL-222 & OL-301 When Importing QBO Files',
    metaTitle: 'How to Fix QuickBooks Error OL-222 & OL-301 | Complete .QBO Fix',
    metaDescription: 'Encountering QuickBooks Error OL-222 or OL-301? Learn why QuickBooks rejects .QBO Web Connect files and how to format compliant OFX 1.02 headers with valid INTU.BID tags.',
    readingTime: '6 min read',
    publishedDate: 'October 2026',
    author: 'LedgerSnap Integrations Architecture Team',
    intro: 'QuickBooks Error OL-222 ("QuickBooks was not able to complete your request. Please contact your financial institution...") and Error OL-301 ("An error occurred while processing Web Connect data...") are the two most common import failures encountered by accountants. Here is the comprehensive technical guide to fixing them.',
    sections: [
      {
        heading: 'What Causes QuickBooks Error OL-222 and OL-301?',
        content: `Error OL-222 is triggered when the QuickBooks Intuit Web Connect validator detects non-compliant SGML/OFX formatting in an imported .QBO file.

The primary root causes include:
1. **Missing or Discontinued <INTU.BID> Tag**: Intuit requires every .QBO file to contain an approved Financial Institution ID recognized by their active licensing directory. If the tag is absent or contains an unregistered number, QuickBooks aborts the import.
2. **Missing <FI> Block in <SONRS>**: QuickBooks Desktop specifically mandates the presence of \`<FI><ORG>Bank Name</ORG><FID>XXXX</FID></FI>\` directly above \`<INTU.BID>\`.
3. **Unescaped XML / SGML Characters**: Ampersands (&), angle brackets (< >), and accent marks in payee strings break the parser.
4. **Payee Descriptions Exceeding 32 Characters**: The Intuit OFX 1.02 specification limits the \`<NAME>\` tag to 32 characters max. When third-party converters dump raw bank memos into \`<NAME>\`, QuickBooks rejects the file with Error OL-222.
5. **Non-Standard Date Timestamps**: Timestamps must be formatted as 14 digits with Noon GMT (e.g. \`YYYYMMDD120000[0:GMT]\`) to prevent timezone shifting across day boundaries.`
      },
      {
        heading: 'How to Fix Existing Broken .QBO Files (Instant Solution)',
        content: `If you have a broken .QBO file downloaded from a bank or generic converter:
1. Use our free in-browser **[QBO File Inspector & Error Fixer](/tools/qbo-viewer-and-validator)**.
2. Drop your broken .QBO file into the tool.
3. It will scan for syntax errors, missing \`<INTU.BID>\` tags, and descriptions over 32 characters.
4. Click **"1-Click Fix Error OL-222"** to download a repaired, 100% compliant .QBO file ready for immediate QuickBooks import.`
      },
      {
        heading: 'Manual Code Fix in a Text Editor',
        content: `You can also repair the file manually in VS Code or Notepad:
1. Open your \`.qbo\` file in a text editor.
2. Verify that the file begins with the standard OFX 102 header:
\`\`\`
OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:UTF-8
CHARSET:NONE
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE
\`\`\`
3. Locate the \`<SONRS>\` sign-on response block and insert the universal Wells Fargo fallback credentials:
\`\`\`xml
<FI>
<ORG>Wells Fargo</ORG>
<FID>3000</FID>
</FI>
<INTU.BID>3000
\`\`\`
4. Search for any raw \`&\` symbols and replace them with \`&amp;\`.
5. Save the file and import it into QuickBooks Online or Desktop via **Upload from file**.`
      }
    ],
    faqs: [
      {
        q: 'Why does QuickBooks reject files when the bank is a smaller credit union?',
        a: 'Intuit charges financial institutions recurring fees to maintain certified Web Connect integration. Smaller credit unions and regional banks often opt out, leaving users with unsupported files. Setting INTU.BID to 3000 (Wells Fargo) provides a universal safe fallback.'
      },
      {
        q: 'Can LedgerSnap convert original PDF statements so I never see Error OL-222?',
        a: 'Yes! LedgerSnap was engineered specifically to emit strict Intuit OFX 1.02 Web Connect files with noon GMT timestamps, 32-char payee limits, and certified <INTU.BID> directory tags.'
      }
    ]
  },
  {
    slug: 'fix-quickbooks-unable-to-verify-financial-institution-intu-bid',
    title: 'How to Fix "QuickBooks is Unable to Verify the Financial Institution" (INTU.BID Fix)',
    metaTitle: 'Fix "Unable to Verify Financial Institution" in QuickBooks | INTU.BID',
    metaDescription: 'Step-by-step tutorial to resolve QuickBooks error "Unable to verify the financial institution information" when importing Web Connect .QBO files.',
    readingTime: '5 min read',
    publishedDate: 'October 2026',
    author: 'LedgerSnap Engineering Team',
    intro: 'When importing a Web Connect (.QBO) file, QuickBooks may display the error message: "QuickBooks is unable to verify the financial institution information for this download." Here is why this happens and how to resolve it in under 60 seconds.',
    sections: [
      {
        heading: 'Why This Error Occurs',
        content: `QuickBooks validates the \`<INTU.BID>\` and \`<FID>\` tags inside every .QBO file against an internal list of certified institutions known as the **fidir.txt** directory.
        
This error occurs when:
- The \`<INTU.BID>\` tag is missing completely from the header.
- The financial institution ID belongs to a bank that no longer supports Intuit Web Connect.
- The \`<FI>\` container (\`<ORG>\` and \`<FID>\`) is missing inside \`<SONRS>\`.
- The bank account routing number or account type does not match the expected Web Connect schema.`
      },
      {
        heading: 'The Permanent 1-Click Fix',
        content: `You can instantly resolve this error using our free client-side tool:
1. Navigate to **[Free OFX & QBO Error Fixer](/tools/qbo-viewer-and-validator)**.
2. Upload your rejected file.
3. The tool injects certified Intuit Web Connect credentials (<INTU.BID>3000 / Wells Fargo) which are universally accepted by all versions of QuickBooks Online and QuickBooks Desktop.
4. Download the updated file and upload it into QuickBooks.`
      }
    ],
    faqs: [
      {
        q: 'Does using INTU.BID 3000 force my transactions into a Wells Fargo account in QuickBooks?',
        a: 'No! The INTU.BID tag is only an authentication handshake for the file parser. When you upload the file, QuickBooks asks: "Which account in your Chart of Accounts would you like to link this to?" You can link it to any existing checking, savings, or credit card account.'
      }
    ]
  },
  {
    slug: 'import-older-than-90-days-bank-statements-into-quickbooks',
    aliases: ['how-to-import-pdf-bank-statements-into-quickbooks-online'],
    title: 'How to Import Bank Statements Older Than 90 Days into QuickBooks Online & Desktop',
    metaTitle: 'Import Historical Bank Statements Older Than 90 Days into QuickBooks',
    metaDescription: 'Need to import historical bank statements past the 90-day Intuit bank feed limit? Step-by-step guide to converting PDF statements into certified .QBO Web Connect files.',
    readingTime: '6 min read',
    publishedDate: 'October 2026',
    author: 'LedgerSnap Accounting Integration Team',
    intro: 'During tax preparation, catch-up bookkeeping, or client onboarding, CPAs frequently need historical bank transactions from 6 months, 1 year, or multiple years ago. However, QuickBooks Online and Desktop live bank feeds only fetch the last 30 to 90 days. Here is the step-by-step workflow to import older PDF statements with 100% accuracy.',
    sections: [
      {
        heading: 'Why Direct Bank Feeds Only Provide 90 Days',
        content: `Banks (such as Chase, Bank of America, Wells Fargo, and Citibank) restrict their Open Banking APIs and direct connect feeds to 90 days of historical data to save bandwidth and reduce database load. For older historical data, banks only offer monthly PDF statements.
        
Because QuickBooks Online does not accept PDF files directly, accountants must convert these PDF statements into certified **.QBO Web Connect files**.`
      },
      {
        heading: 'Step-by-Step Conversion Workflow',
        content: `1. **Collect your historical PDF statements** from your bank’s online document center.
2. **Upload into LedgerSnap**: Drag and drop statements into **[LedgerSnap](https://ledger-snap.com/)**.
3. **Verify Balance Checksum**: LedgerSnap calculates \`Opening Balance + Credits - Debits = Closing Balance\` to ensure not a single cent is missed.
4. **Download .QBO**: Click Download QuickBooks (.QBO).
5. **Import into QuickBooks**: In QuickBooks Online, go to **Bank Transactions > Upload from file**, drag in your .QBO, and match it to your register.`
      }
    ],
    faqs: [
      {
        q: 'Can I import multiple statement periods without creating duplicate transactions?',
        a: 'Yes. LedgerSnap generates cryptographic SHA-256 <FITID> hashes for every transaction. QuickBooks automatically identifies and skips any transaction that was previously imported.'
      }
    ]
  },
  {
    slug: 'convert-credit-card-pdf-to-qbo',
    title: 'How to Convert Credit Card PDF Statements (Amex, Chase Ink, Capital One) to QBO Without Inverted Signs',
    metaTitle: 'Convert Credit Card PDF Statements to QBO Without Inverted Signs',
    metaDescription: 'Learn how to convert credit card PDF statements (Amex, Chase Ink, Capital One, Brex, Ramp) to QuickBooks .QBO with correct negative charge signs and balance reconciliation.',
    readingTime: '5 min read',
    publishedDate: 'October 2026',
    author: 'LedgerSnap Accounting Integration Team',
    intro: 'Converting credit card statements into QuickBooks is notoriously error-prone. Many PDF converters invert negative debits and positive credits, causing credit card purchases to register as income and payments to register as expenses. Here is how to convert corporate credit card PDFs with 100% accurate sign conventions.',
    sections: [
      {
        heading: 'Understanding QuickBooks Credit Card Sign Rules',
        content: `In accounting, credit card accounts are liabilities:
- **Purchases / Charges / Fees**: Increase liability and must be represented as negative amounts (\`-TRNAMT\`, with \`<TRNTYPE>DEBIT\`).
- **Payments / Credits / Refunds**: Decrease liability and must be represented as positive amounts (\`+TRNAMT\`, with \`<TRNTYPE>CREDIT\`).

Many PDF statements print purchases as positive numbers (e.g. "$45.00 Starbucks"). Generic converters mistakenly write these as \`<TRNAMT>45.00\`, which flips your entire QuickBooks register upside down.`
      },
      {
        heading: 'How LedgerSnap Handles Credit Card Statements',
        content: `LedgerSnap auto-detects when an uploaded statement is a credit card (Amex, Chase Ink, Capital One Spark, Brex, Ramp, Apple Card).
- It emits the proper Intuit \`<CREDITCARDMSGSRSV1>\` container.
- It omits \`<BANKID>\` and \`<ACCTTYPE>\` (which are strictly invalid in credit card accounts and crash QuickBooks Desktop).
- It enforces proper liability sign logic so all charges import as expenses and payments import as credit reductions.`
      }
    ],
    faqs: [
      {
        q: 'What if my credit card statement still has inverted signs?',
        a: 'In LedgerSnap’s interactive review grid, simply click the "Invert Signs (+/-)" button to reverse all transaction signs with one click before downloading.'
      }
    ]
  }
];

export function findGuideBySlug(slug = '') {
  const clean = String(slug || '').trim().replace(/\/$/, '').toLowerCase();
  for (const g of SEO_GUIDES) {
    if (g.slug === clean) return g;
    if (g.aliases && g.aliases.includes(clean)) return g;
  }
  return null;
}
