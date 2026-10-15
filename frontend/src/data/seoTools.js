export const SEO_TOOLS = [
  {
    slug: 'qbo-viewer-checker',
    title: 'Free QBO File Viewer & Error OL-222 Checker',
    metaTitle: 'Free QBO File Viewer & Error OL-222 Validator | LedgerSnap',
    metaDescription: 'Inspect, validate, and repair QuickBooks .QBO and OFX files client-side. Detect missing INTU.BID tags, syntax errors, and fix QuickBooks Error OL-222 with 1-click.',
    heading: 'Free QBO File Viewer & QuickBooks Error OL-222 Checker',
    subheading: 'Inspect transaction tags, validate financial institution INTU.BID codes, and fix import errors with 1-click. 100% private in-browser tool.',
    features: [
      'Validates financial institution <INTU.BID> compatibility',
      'Detects unescaped XML characters and illegal & symbols',
      'Checks 32-character limit on payee <NAME> tags',
      'Instant 1-click Fix Error OL-222 & Clean QBO download',
      'Export parsed transactions to clean CSV'
    ],
    faqs: [
      {
        q: 'What causes QuickBooks Error OL-222?',
        a: 'QuickBooks Error OL-222 occurs when a .QBO Web Connect file contains malformed XML syntax, invalid or missing financial institution INTU.BID identifiers, unescaped ampersands (&), or payee descriptions exceeding 32 characters.'
      },
      {
        q: 'Does this tool upload my QBO file to any server?',
        a: 'No. The QBO Viewer & OL-222 Checker runs 100% locally in your web browser. Your financial transactions never leave your machine.'
      },
      {
        q: 'Can I convert my original PDF bank statements directly?',
        a: 'Yes! LedgerSnap specializes in converting PDF statements directly to certified .QBO files with guaranteed balance reconciliation.'
      }
    ]
  },
  {
    slug: 'csv-to-qbo',
    title: 'Free CSV & Excel to QuickBooks (.QBO) Web Connect Converter',
    metaTitle: 'Free CSV to QBO Converter | Convert Excel to QuickBooks Web Connect',
    metaDescription: 'Convert bank CSV and Excel spreadsheets into certified QuickBooks Web Connect (.QBO) files in your browser. Auto-detects dates, formats INTU.BID #3000, and enables 1-click import.',
    heading: 'Free CSV / Excel to QuickBooks (.QBO) Web Connect Converter',
    subheading: 'Turn raw CSV bank exports and Excel sheets into certified Intuit Web Connect (.QBO) files. 1-click import into QuickBooks Online & Desktop with zero column mapping errors.',
    features: [
      'Smart column mapper for Date, Payee, and Amount / Debit / Credit',
      'Injects certified INTU.BID #3000 Web Connect headers',
      'Generates unique deterministic FITID hashes to eliminate duplicates',
      'Supports US (MM/DD/YYYY) and International (DD/MM/YYYY) dates',
      'Zero server upload — 100% secure client-side conversion'
    ],
    faqs: [
      {
        q: 'Why convert CSV to .QBO instead of uploading CSV to QuickBooks?',
        a: 'QuickBooks CSV imports require tedious manual column mapping for every upload, frequently scramble negative signs, and cause reconciliation mismatches. .QBO Web Connect files import automatically with 1-click.'
      },
      {
        q: 'How do I import the converted .QBO into QuickBooks Online?',
        a: 'In QuickBooks Online, go to Bookkeeping > Transactions > Bank transactions. Click the arrow next to "Link account", select "Upload from file", and select your downloaded .QBO file.'
      }
    ]
  },
  {
    slug: 'ofx-qfx-to-qbo',
    title: 'Free OFX / QFX to QuickBooks (.QBO) Web Connect Converter',
    metaTitle: 'Free OFX & QFX to QBO Converter | Fix Unrecognized Bank Files',
    metaDescription: 'Convert generic Open Financial Exchange (.OFX) and Quicken (.QFX) files into QuickBooks Online & Desktop Web Connect (.QBO) with certified INTU.BID #3000 bank headers.',
    heading: 'Free OFX / QFX to QuickBooks (.QBO) Converter',
    subheading: 'Convert generic OFX and Quicken QFX files into certified QuickBooks Web Connect (.QBO) format. Injects valid INTU.BID #3000 headers in 1 click.',
    features: [
      'Converts Quicken (.QFX) and Open Financial Exchange (.OFX) to .QBO',
      'Injects certified INTU.BID #3000 financial institution signature',
      'Repairs missing headers and non-standard SGML tags',
      'Supports Checking, Savings, and Credit Card account statements',
      'Instant client-side download with zero server cost'
    ],
    faqs: [
      {
        q: 'Why does QuickBooks reject my .OFX or .QFX file?',
        a: 'QuickBooks specifically looks for QuickBooks Web Connect tags, including INTU.BID financial institution credentials. Standard OFX or Quicken QFX files lack these proprietary tags and get rejected.'
      },
      {
        q: 'Will my bank account match properly in QuickBooks?',
        a: 'Yes! The converted .QBO file allows you to map to your existing bank or credit card register inside QuickBooks without creating duplicate accounts.'
      }
    ]
  }
];
