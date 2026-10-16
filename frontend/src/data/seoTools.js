/**
 * Programmatic Micro-Tools Data for High-Intent Zero-Cost In-Browser Tools
 */

export const SEO_TOOLS = [
  {
    slug: 'csv-to-qbo',
    title: 'Free CSV & Excel to QuickBooks (.QBO) Web Connect Converter',
    metaTitle: 'Free CSV to QBO Converter | Convert Excel to QuickBooks Web Connect',
    metaDescription: 'Convert bank CSV and Excel spreadsheets into certified QuickBooks Web Connect (.QBO) files in your browser. Auto-detects dates, formats INTU.BID #3000, and enables 1-click import.',
    heading: 'Free CSV / Excel to QuickBooks (.QBO) Web Connect Converter',
    subheading: 'Turn raw CSV bank exports and Excel sheets into certified Intuit Web Connect (.QBO) files. 1-click import into QuickBooks Online & Desktop with zero column mapping errors.',
    features: [
      'Smart column mapper for Date, Payee, and Amount / Debit / Credit',
      'Injects certified INTU.BID #3000 Web Connect headers (<FI> block included)',
      'Generates unique deterministic FITID hashes (SHA-256) to eliminate duplicate transactions',
      'Supports US (MM/DD/YYYY) and International (DD/MM/YYYY) date structures',
      'Zero server upload — 100% secure client-side conversion running in browser RAM'
    ],
    faqs: [
      {
        q: 'Why convert CSV to .QBO instead of uploading CSV directly to QuickBooks?',
        a: 'QuickBooks CSV uploads require tedious manual column mapping for every statement, frequently scramble negative signs on debits and credits, and cause reconciliation discrepancies. .QBO Web Connect files import automatically with one click without any manual column mapping.'
      },
      {
        q: 'How do I import the converted .QBO into QuickBooks Online?',
        a: 'In QuickBooks Online, navigate to Bookkeeping > Transactions > Bank transactions. Click the arrow next to "Link account", select "Upload from file", and select your downloaded .QBO file.'
      },
      {
        q: 'Does this CSV to QBO tool work with credit card statements?',
        a: 'Yes. You can select either Bank Account (CHECKING) or Credit Card (CREDITLINE) in the conversion options. It formats the required <CREDITCARDMSGSRSV1> blocks automatically.'
      },
      {
        q: 'Is there a limit on how many rows I can convert for free?',
        a: 'No! This in-browser tool runs 100% client-side in your web browser with zero server compute costs. You can convert unlimited CSV files without an account or credit card.'
      },
      {
        q: 'Can I convert original PDF statements directly?',
        a: 'Yes! If you have a PDF statement instead of a CSV, LedgerSnap provides an intelligent in-memory PDF converter that verifies balance reconciliation to the exact penny.'
      }
    ]
  },
  {
    slug: 'ofx-to-qbo',
    aliases: ['ofx-qfx-to-qbo'],
    title: 'Free OFX to QuickBooks (.QBO) Web Connect Converter',
    metaTitle: 'Free OFX to QBO Converter | Inject Missing Intuit Web Connect Headers',
    metaDescription: 'Convert generic Open Financial Exchange (.OFX) files into QuickBooks Online & Desktop Web Connect (.QBO). Injects missing INTU.BID tags and <FI> block in 1 click.',
    heading: 'Free OFX to QuickBooks (.QBO) Converter',
    subheading: 'Convert generic bank .OFX files into certified QuickBooks Web Connect (.QBO) format. Injects valid <FI> and <INTU.BID> headers with 1 click so QuickBooks never rejects your file.',
    features: [
      'Injects missing Intuit Web Connect headers (<FI><ORG>Wells Fargo</ORG><FID>3000</FID></FI>)',
      'Adds certified <INTU.BID>3000 to eliminate QuickBooks Error OL-222',
      'Sanitizes vendor <NAME> tags to conform with Intuit 32-character limits',
      'Escapes unescaped XML ampersands (&) and control characters',
      '100% private in-browser conversion with instant download'
    ],
    faqs: [
      {
        q: 'Why does QuickBooks reject standard .OFX files with Error OL-222?',
        a: 'QuickBooks requires proprietary Intuit Web Connect tags inside the <SONRS> block (<INTU.BID> and <FI> tags). Standard OFX files from international banks or credit unions lack these tags, causing QuickBooks to throw Error OL-222 or "QuickBooks is unable to verify the financial institution".'
      },
      {
        q: 'Will my transactions map to my existing QuickBooks register?',
        a: 'Yes. When importing the converted .QBO file, QuickBooks will prompt you to select the matching bank account from your Chart of Accounts.'
      },
      {
        q: 'Does this tool support both QuickBooks Online and QuickBooks Desktop?',
        a: 'Yes! The injected OFX 1.02 SGML headers are fully compatible with both QuickBooks Online and QuickBooks Desktop (Windows and Mac).'
      },
      {
        q: 'Is my financial data uploaded to any server?',
        a: 'No. The conversion logic runs 100% in your local web browser. Your financial transactions never leave your machine.'
      },
      {
        q: 'What if I need to convert a scanned PDF bank statement?',
        a: 'Use LedgerSnap’s primary PDF converter to extract transactions directly from PDF statements with automated balance reconciliation.'
      }
    ]
  },
  {
    slug: 'qfx-to-qbo',
    title: 'Free Quicken QFX to QuickBooks (.QBO) Converter',
    metaTitle: 'Free QFX to QBO Converter | Convert Quicken Files to QuickBooks Web Connect',
    metaDescription: 'Many smaller US banks and credit unions only offer Quicken (.QFX) downloads. Convert Quicken .QFX files to QuickBooks .QBO Web Connect format in 1 click.',
    heading: 'Free Quicken QFX to QuickBooks (.QBO) Converter',
    subheading: 'Convert Quicken Web Connect (.QFX) files into QuickBooks Online & Desktop Web Connect (.QBO) format. Injects valid Intuit BID headers with 1-click.',
    features: [
      'Converts Quicken (.QFX) files to QuickBooks Online & Desktop (.QBO)',
      'Injects certified <INTU.BID>3000 and <FI> blocks recognized by QuickBooks',
      'Repairs non-standard SGML header tags and XML control characters',
      'Supports Checking, Savings, and Credit Card accounts',
      'Instant client-side download with zero server cost'
    ],
    faqs: [
      {
        q: 'Why can’t QuickBooks import Quicken (.QFX) files directly?',
        a: 'Although Quicken (.QFX) and QuickBooks (.QBO) share OFX heritage, Quicken files use Quicken-specific application identifiers (<APPID>QWIN) and bank codes that QuickBooks rejects as an unrecognized format.'
      },
      {
        q: 'How does this converter adapt .QFX for QuickBooks?',
        a: 'It rewrites the sign-on block to include Intuit Web Connect credentials (<INTU.BID>3000, <ORG>Wells Fargo</ORG>, <FID>3000</FID>) and structures the message blocks according to Intuit OFX 1.02 specifications.'
      },
      {
        q: 'Can I use this for credit card .QFX files?',
        a: 'Yes. The converter detects <CCSTMTRS> blocks and retains the valid credit card structure without corrupting negative liability signs.'
      },
      {
        q: 'Does it cost anything to use this tool?',
        a: 'No, this tool is 100% free and runs completely inside your web browser.'
      },
      {
        q: 'What if my bank only offers PDF statements?',
        a: 'Upload your bank or credit card PDF statement to LedgerSnap, and our OCR engine will generate certified .QBO and Excel files in seconds.'
      }
    ]
  },
  {
    slug: 'qbo-viewer-and-validator',
    aliases: ['qbo-viewer-checker'],
    title: 'Free QBO File Viewer & Error Fixer (Error OL-222 & OL-301 Validator)',
    metaTitle: 'Free QBO File Viewer & Error OL-222 Fixer | LedgerSnap',
    metaDescription: 'Inspect, validate, and repair QuickBooks .QBO and OFX files client-side. Check 32-character <NAME> limits, validate <INTU.BID>, and fix QuickBooks Error OL-222 with 1-click.',
    heading: 'Free QBO File Inspector & Error Fixer',
    subheading: 'Inspect transaction tags, validate financial institution INTU.BID codes, check 32-character payee limits, and fix import errors with 1-click. 100% private in-browser tool.',
    features: [
      'Validates financial institution <INTU.BID> and <FI> compatibility',
      'Detects unescaped XML characters (&, <, >) that cause QuickBooks parser crashes',
      'Checks strict 32-character limit on payee <NAME> tags and highlights violations',
      'Instant 1-click "Fix Error OL-222" and download repaired .QBO file',
      'Export parsed transactions into clean CSV spreadsheet'
    ],
    faqs: [
      {
        q: 'What causes QuickBooks Error OL-222 and OL-301?',
        a: 'QuickBooks Error OL-222 occurs when a .QBO Web Connect file contains malformed SGML/XML syntax, an unrecognized or missing financial institution <INTU.BID> tag, unescaped ampersands (&), or vendor descriptions exceeding 32 characters.'
      },
      {
        q: 'How does the 1-Click Fix Error OL-222 work?',
        a: 'The fixer automatically injects a verified active <INTU.BID>3000 and <FI> block, truncates <NAME> descriptions cleanly to 32 characters, escapes invalid XML entities, and ensures proper Noon GMT date formatting.'
      },
      {
        q: 'Does this tool upload my sensitive financial records to any server?',
        a: 'No. The QBO Viewer & Error Fixer executes 100% locally in your browser’s JavaScript memory. Your transactions never touch an external server.'
      },
      {
        q: 'Can I export the parsed transactions to Excel or CSV?',
        a: 'Yes! Click the "Export to CSV" button to download all transactions from any .QBO file as a clean, structured spreadsheet.'
      },
      {
        q: 'Can LedgerSnap convert original PDF bank statements directly?',
        a: 'Yes. LedgerSnap turns PDF bank and credit card statements directly into certified .QBO Web Connect files with full mathematical balance reconciliation.'
      }
    ]
  }
];

export function findToolBySlug(slug = '') {
  const clean = String(slug || '').trim().replace(/\/$/, '').toLowerCase();
  for (const t of SEO_TOOLS) {
    if (t.slug === clean) return t;
    if (t.aliases && t.aliases.includes(clean)) return t;
  }
  return null;
}
