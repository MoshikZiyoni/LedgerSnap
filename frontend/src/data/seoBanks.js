export const SEO_BANKS = [
  {
    slug: 'chase-pdf-to-qbo',
    name: 'JPMorgan Chase',
    fullName: 'JPMorgan Chase Bank, N.A.',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Multi-page checking/credit card PDFs & old statements beyond 90-day Bank Feed limit',
    metaTitle: 'Convert Chase PDF Statements to QuickBooks (.QBO) & Excel | LedgerSnap',
    metaDescription: 'Convert multi-page JPMorgan Chase bank and credit card PDF statements into certified QuickBooks (.QBO) and Excel. Bypass the 90-day bank feed limit. Try 1 statement free.',
    heroH1: 'Convert JPMorgan Chase PDF Statements to QuickBooks (.QBO) & Excel in Seconds',
    heroSub: 'Import historical Chase checking, savings, and Sapphire/Ink credit card statements beyond the 90-day Intuit bank feed limit. Converts multi-page statements into validated .QBO Web Connect files with zero column mapping errors.',
    features: [
      'Bypasses Chase & QuickBooks 90-day historical download limitation',
      'Accurately separates Chase combined debit/credit transaction columns',
      'Preserves multi-line Chase check numbers, wire references, and Zelle payees',
      'Full mathematical checksum verification against Chase opening & closing balances'
    ],
    stepGuide: {
      title: 'How to Import JPMorgan Chase PDF Statements into QuickBooks Online & Desktop',
      steps: [
        {
          num: 1,
          title: 'Upload Chase PDF Statement',
          desc: 'Drag and drop your Chase monthly PDF statement (checking, savings, or Ink/Sapphire business credit card) into LedgerSnap.'
        },
        {
          num: 2,
          title: 'Instant In-Memory Conversion',
          desc: 'LedgerSnap runs balance checksum reconciliation and builds a compliant Intuit Web Connect (.QBO) file with certified Chase FID tags (<INTU.BID>3000).'
        },
        {
          num: 3,
          title: 'Import Direct to QuickBooks',
          desc: 'In QuickBooks Online, go to Banking > Bank Transactions > Upload from file, select the .QBO file, and match it to your Chase account.'
        }
      ]
    },
    faqs: [
      {
        q: 'Why can’t I download statements older than 90 days from Chase directly into QuickBooks?',
        a: 'Intuit Bank Feeds only sync between 30 and 90 days of live historical data from JPMorgan Chase. For past quarters or annual tax catch-up, Chase only provides PDF statements. LedgerSnap bridges this gap by turning your Chase PDFs into certified .QBO Web Connect files that import into the QuickBooks register with one click.'
      },
      {
        q: 'Does LedgerSnap support Chase Ink Business and Sapphire credit cards?',
        a: 'Yes. LedgerSnap has pre-tuned layout algorithms for both Chase Business and Personal accounts, including Ink Business Unlimited, Ink Cash, Sapphire Preferred, and personal checking accounts.'
      },
      {
        q: 'How does LedgerSnap handle Chase multi-line transaction payees?',
        a: 'Chase statements often break merchant names, store IDs, and transaction locations across 2 to 3 lines. Generic CSV tools split these into duplicate ghost rows. LedgerSnap merges multi-line descriptions into a single clean payee string.'
      }
    ]
  },
  {
    slug: 'bank-of-america-pdf-to-qbo',
    name: 'Bank of America',
    fullName: 'Bank of America, N.A.',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Merged check numbers, multi-line Zelle/wire descriptions, and running balance verification',
    metaTitle: 'Convert Bank of America PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Bank of America checking & card PDF statements to QuickBooks Web Connect (.QBO) & Excel. Cleans merged check numbers and multi-line Zelle rows.',
    heroH1: 'Convert Bank of America PDF Statements to QuickBooks (.QBO) & Excel in Seconds',
    heroSub: 'Resolve Bank of America multi-line Zelle descriptions, merged check serial numbers, and service charge splits. Generates certified Intuit .QBO files for instant QuickBooks Online import.',
    features: [
      'Extracts embedded check serial numbers from BofA check image grids',
      'Normalizes multi-line Zelle, BillPay, and ACH payee descriptions',
      'Reconciles daily ending ledger balances against individual debits and credits',
      'Certified Intuit BofA FID tags (<INTU.BID>3000) for zero-mapping import'
    ],
    stepGuide: {
      title: 'How to Import Bank of America Statements into QuickBooks Online',
      steps: [
        {
          num: 1,
          title: 'Upload Bank of America Statement',
          desc: 'Drop your BofA checking, savings, or commercial credit card monthly statement PDF into LedgerSnap.'
        },
        {
          num: 2,
          title: 'Extract & Balance Checksum',
          desc: 'Our engine extracts transaction rows, cleans multi-line Zelle and ACH transfers, and reconciles against the statement summary.'
        },
        {
          num: 3,
          title: 'Import .QBO into QuickBooks',
          desc: 'Download the certified .QBO file and upload directly into your QuickBooks Bank Transactions screen.'
        }
      ]
    },
    faqs: [
      {
        q: 'How does LedgerSnap solve Bank of America merged check numbers?',
        a: 'Bank of America statements frequently print check images and check clearing tables with serial numbers adjacent to amounts. LedgerSnap separates check numbers into dedicated check reference fields so they map cleanly into QuickBooks.'
      },
      {
        q: 'Will Bank of America Zelle and wire fees be separated?',
        a: 'Yes. BofA often groups transfers with related outgoing wire or convenience fees on separate lines. LedgerSnap parses each line into discrete transaction entries.'
      }
    ]
  },
  {
    slug: 'wells-fargo-pdf-to-qbo',
    name: 'Wells Fargo',
    fullName: 'Wells Fargo Bank, N.A.',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Business checking combined deposits/withdrawals & statement period date parsing',
    metaTitle: 'Convert Wells Fargo PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Wells Fargo checking and credit card PDF statements to certified QuickBooks (.QBO) and Excel. Reconciles combined deposit/withdrawal columns with 100% accuracy.',
    heroH1: 'Convert Wells Fargo PDF Statements to QuickBooks (.QBO) & Excel in Seconds',
    heroSub: 'Tackle Wells Fargo dual-column format and combined transaction tables. LedgerSnap generates certified Intuit .QBO Web Connect files with zero manual date adjustment or column re-mapping.',
    features: [
      'Parses Wells Fargo complex side-by-side deposit and withdrawal tables',
      'Normalizes cross-year statement periods (December to January cycles)',
      'Identifies Wells Fargo ACH, merchant credit card settlements, and payroll wires',
      '100% mathematical balance verification to the exact penny'
    ],
    stepGuide: {
      title: 'How to Import Wells Fargo Statements into QuickBooks',
      steps: [
        {
          num: 1,
          title: 'Select Wells Fargo PDF',
          desc: 'Upload your Wells Fargo monthly business or personal statement PDF.'
        },
        {
          num: 2,
          title: 'Automated Column Disambiguation',
          desc: 'LedgerSnap disambiguates debits, credits, and check registers into standard accounting structures.'
        },
        {
          num: 3,
          title: 'One-Click QuickBooks Import',
          desc: 'Upload your generated .QBO file to QuickBooks Online; transactions populate your bank register automatically.'
        }
      ]
    },
    faqs: [
      {
        q: 'Why do generic converters fail on Wells Fargo statement tables?',
        a: 'Wells Fargo often lists deposits and withdrawals in adjacent columns or split tables without explicit positive/negative indicators. LedgerSnap uses contextual ledger math to determine directionality with 100% checksum accuracy.'
      }
    ]
  },
  {
    slug: 'citibank-pdf-to-qbo',
    name: 'Citibank',
    fullName: 'Citibank, N.A.',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Commercial card & multi-account PDF statement splits into clean .QBO',
    metaTitle: 'Convert Citibank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Citi commercial card and business checking statements from PDF to QuickBooks (.QBO) and Excel. Clean split for multi-account and corporate statement PDFs.',
    heroH1: 'Convert Citibank PDF Statements to QuickBooks (.QBO) & Excel in Seconds',
    heroSub: 'Seamlessly convert Citi commercial cards, multi-sub-account checking, and Costco Anywhere Visa statements into compliant Intuit Web Connect .QBO and Excel files.',
    features: [
      'Handles multi-sub-account consolidated statements without transaction bleed',
      'Accurately separates foreign transaction fees and currency conversions',
      'Standardizes Citi reference IDs and merchant category strings',
      'Direct Intuit Web Connect import for QuickBooks Online & Desktop'
    ],
    stepGuide: {
      title: 'Importing Citibank Statements into QuickBooks',
      steps: [
        {
          num: 1,
          title: 'Upload Citi PDF',
          desc: 'Upload your Citibank corporate or consumer statement PDF.'
        },
        {
          num: 2,
          title: 'Automated Account Separation',
          desc: 'LedgerSnap splits separate account numbers or cardholders into organized registers.'
        },
        {
          num: 3,
          title: 'Download & Match',
          desc: 'Export certified .QBO and import cleanly into QuickBooks Online.'
        }
      ]
    },
    faqs: [
      {
        q: 'Can LedgerSnap handle Citi statements with multiple authorized cardholders?',
        a: 'Yes. LedgerSnap extracts all cardholder transactions while attributing them to the main master account or providing clean Excel breakdown filters.'
      }
    ]
  },
  {
    slug: 'capital-one-pdf-to-qbo',
    name: 'Capital One',
    fullName: 'Capital One Financial Corporation',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Spark Business card & checking PDF statements to QuickBooks Online/Desktop',
    metaTitle: 'Convert Capital One PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Capital One Spark Business card and 360 Checking PDF statements to certified QuickBooks (.QBO) and Excel spreadsheets in seconds.',
    heroH1: 'Convert Capital One PDF Statements to QuickBooks (.QBO) & Excel in Seconds',
    heroSub: 'Convert Capital One Spark Business and 360 Checking statements. Eliminates the hassle of fragmented PDF layouts, rewards deductions, and multi-employee card rows.',
    features: [
      'Pre-tuned for Capital One Spark Business and Quicksilver statement layouts',
      'Separates cash back statement credits from operational vendor payments',
      'Normalizes transaction dates and posting dates correctly for tax reconciliation',
      'Certified OFX 200 format avoids QuickBooks import error OL-222'
    ],
    stepGuide: {
      title: 'How to Import Capital One Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload Statement', desc: 'Select your Capital One Spark Business or 360 PDF statement.' },
        { num: 2, title: 'Extract & Validate', desc: 'Verify opening balance, rewards credits, and net debits in real time.' },
        { num: 3, title: 'Import into QuickBooks', desc: 'Download .QBO file and upload directly into your QuickBooks bank feed.' }
      ]
    },
    faqs: [
      {
        q: 'How are Capital One Spark cash back credits categorized?',
        a: 'LedgerSnap correctly marks cash back credits as positive statement adjustments rather than negative debits, ensuring your QuickBooks accounts stay balanced.'
      }
    ]
  },
  {
    slug: 'american-express-pdf-to-qbo',
    name: 'American Express (Amex)',
    fullName: 'American Express Company',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Amex Business PDF statements with supplementary cardholder sub-sections',
    metaTitle: 'Convert American Express PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Amex Business Platinum, Gold, and corporate card statements from PDF to QuickBooks (.QBO) and Excel. Reconciles supplementary cardholders automatically.',
    heroH1: 'Convert American Express (Amex) PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Convert American Express Business Platinum, Gold, and Corporate card statements. Reconciles multiple employee sub-cards into a consolidated or segmented .QBO file for QuickBooks.',
    features: [
      'Parses multiple employee supplementary cards under one master business account',
      'Handles Amex split billing cycles and foreign currency charge summaries',
      'Normalizes payee merchant names by removing internal Amex reference codes',
      'Prevents duplicate entry of Amex autopay adjustments'
    ],
    stepGuide: {
      title: 'Importing Amex PDF Statements into QuickBooks Online',
      steps: [
        { num: 1, title: 'Upload Amex PDF', desc: 'Drop your monthly Amex Business statement into LedgerSnap.' },
        { num: 2, title: 'Parse Employee Sub-Cards', desc: 'LedgerSnap accurately captures all employee card rows and fees.' },
        { num: 3, title: 'Import .QBO File', desc: 'Import into QuickBooks Online with zero manual column mapping.' }
      ]
    },
    faqs: [
      {
        q: 'Does LedgerSnap support Amex statements with 10+ employee cards?',
        a: 'Yes. LedgerSnap is built specifically for corporate expense management and extracts hundreds of pages with multiple employee cardholder sections.'
      }
    ]
  },
  {
    slug: 'mercury-bank-pdf-to-qbo',
    name: 'Mercury',
    fullName: 'Mercury Technologies / Choice Financial Group',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Startup banking PDF statements & historical catch-up bookkeeping import',
    metaTitle: 'Convert Mercury Bank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Mercury startup bank PDF statements to QuickBooks Web Connect (.QBO) & Excel. Built for venture-backed startups and catch-up bookkeeping.',
    heroH1: 'Convert Mercury Bank PDF Statements to QuickBooks (.QBO) & Excel in Seconds',
    heroSub: 'Ideal for tech startups, venture-backed companies, and ecommerce founders. Convert Mercury checking, treasury, and venture debt PDF statements into QuickBooks Online (.QBO) and clean Excel files.',
    features: [
      'Built for startup catch-up bookkeeping and annual tax filings',
      'Preserves detailed Mercury wire details, investor memo tags, and Stripe settlements',
      'Extracts Mercury Treasury yield transfers and money market sweep entries',
      'Certified .QBO format imports directly into QuickBooks Online & Desktop'
    ],
    stepGuide: {
      title: 'How to Import Mercury Bank Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload Mercury Statement', desc: 'Upload your Mercury checking or savings monthly PDF.' },
        { num: 2, title: 'Reconcile Treasury & Operating', desc: 'Review verified transaction list with mathematical checksums.' },
        { num: 3, title: 'Sync to QuickBooks', desc: 'Export compliant .QBO file and import directly into QuickBooks Online.' }
      ]
    },
    faqs: [
      {
        q: 'Why convert Mercury PDF statements if Mercury has a live feed?',
        a: 'Live bank feeds frequently disconnect, lose historical transactions during platform migrations, or fail to import transactions older than 90 days. LedgerSnap allows complete historical reconciliation.'
      }
    ]
  },
  {
    slug: 'td-bank-pdf-to-qbo',
    name: 'TD Bank',
    fullName: 'TD Bank, N.A.',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Small business checking PDFs & check serial number extraction',
    metaTitle: 'Convert TD Bank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert TD Bank business checking and savings PDF statements to QuickBooks (.QBO) and Excel spreadsheets with 100% balance checksum verification.',
    heroH1: 'Convert TD Bank PDF Statements to QuickBooks (.QBO) & Excel in Seconds',
    heroSub: 'Accurately convert TD Bank business checking and personal statements. Extracts check numbers, daily balance summaries, and multi-line merchant transactions.',
    features: [
      'Extracts TD Bank check serial numbers and paid check tables cleanly',
      'Reconciles daily ending ledger balances with debits and credits',
      'Standardizes Canadian and US dollar TD Bank statements',
      'Direct Intuit Web Connect compatibility with QuickBooks Online'
    ],
    stepGuide: {
      title: 'Importing TD Bank Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload TD PDF', desc: 'Select your TD Bank statement.' },
        { num: 2, title: 'Validate Math', desc: 'Opening and closing balances verified against transaction rows.' },
        { num: 3, title: 'Import into QuickBooks', desc: 'Download .QBO file and upload in QuickBooks Banking tab.' }
      ]
    },
    faqs: [
      {
        q: 'Can LedgerSnap parse both US and Canadian TD Bank statements?',
        a: 'Yes, LedgerSnap handles both TD Bank US and TD Canada Trust statement formats with appropriate date and currency formatting.'
      }
    ]
  },
  {
    slug: 'pnc-bank-pdf-to-qbo',
    name: 'PNC Bank',
    fullName: 'PNC Financial Services Group, Inc.',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Virtual Wallet & business checking PDF statements to .QBO and .XLSX',
    metaTitle: 'Convert PNC Bank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert PNC Bank Virtual Wallet and business checking PDF statements to certified QuickBooks (.QBO) and Excel files with zero manual mapping.',
    heroH1: 'Convert PNC Bank PDF Statements to QuickBooks (.QBO) & Excel in Seconds',
    heroSub: 'Convert PNC Bank Virtual Wallet (Spend, Reserve, Growth) and commercial checking statements into QuickBooks (.QBO) and Excel spreadsheets with zero manual data entry.',
    features: [
      'Disentangles PNC Virtual Wallet sub-bucket internal transfers',
      'Parses PNC multi-column check images and electronic debit lists',
      'Verifies net change against beginning and ending statement balances',
      'Compliant Intuit OFX 200 tags for error-free import'
    ],
    stepGuide: {
      title: 'How to Import PNC Bank Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Select PNC PDF', desc: 'Upload your PNC business or personal PDF statement.' },
        { num: 2, title: 'Clean & Validate', desc: 'LedgerSnap reconciles sub-accounts and verifies balance checksums.' },
        { num: 3, title: 'Upload to QuickBooks', desc: 'Import the .QBO file into your QuickBooks bank feed.' }
      ]
    },
    faqs: [
      {
        q: 'How does LedgerSnap handle PNC Virtual Wallet split accounts?',
        a: 'LedgerSnap identifies each sub-account section (Spend, Reserve, Growth) and creates clean, non-duplicated transaction tables.'
      }
    ]
  },
  {
    slug: 'us-bank-pdf-to-qbo',
    name: 'U.S. Bank',
    fullName: 'U.S. Bancorp',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Multi-column business statement PDFs with daily ending balance tables',
    metaTitle: 'Convert U.S. Bank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert U.S. Bank PDF statements to certified QuickBooks (.QBO) and Excel. Reconciles complex daily ending balance tables with 100% precision.',
    heroH1: 'Convert U.S. Bank PDF Statements to QuickBooks (.QBO) & Excel in Seconds',
    heroSub: 'Convert U.S. Bank business checking, savings, and credit card statement PDFs. Resolves complex multi-column layouts and daily ending balance tables that break standard converters.',
    features: [
      'Accurately separates U.S. Bank check registers and electronic transactions',
      'Normalizes U.S. Bank multi-column transaction tables',
      'Reconciles daily ending ledger balances against all credits and debits',
      'Exports certified .QBO files for instant QuickBooks Online import'
    ],
    stepGuide: {
      title: 'Importing U.S. Bank Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload U.S. Bank PDF', desc: 'Drop your statement file into LedgerSnap.' },
        { num: 2, title: 'Automatic Layout Parsing', desc: 'Transactions are parsed and validated against ledger math.' },
        { num: 3, title: 'Import to QuickBooks', desc: 'Download .QBO file and upload directly to QuickBooks Online.' }
      ]
    },
    faqs: [
      {
        q: 'Why do U.S. Bank daily ending balance tables cause issues in standard tools?',
        a: 'Standard OCR tools mistakenly import the daily ending balance row as a real debit or credit transaction. LedgerSnap recognizes summary ledger headers and excludes them from the transaction stream.'
      }
    ]
  },
  {
    slug: 'bank-hapoalim-pdf-to-qbo',
    name: 'Bank Hapoalim (בנק הפועלים)',
    fullName: 'Bank Hapoalim B.M. (בנק הפועלים)',
    region: 'Israel / US Subsidiaries',
    isIsraeli: true,
    painPoint: 'Bi-directional Hebrew/English RTL PDF parsing, ILS/USD currency support & QuickBooks .QBO export',
    metaTitle: 'Convert Bank Hapoalim (בנק הפועלים) PDF to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Bank Hapoalim PDF statements into certified QuickBooks (.QBO) & Excel. Full support for Hebrew RTL text, ILS & USD foreign currency, and US subsidiaries.',
    heroH1: 'Convert Bank Hapoalim (בנק הפועלים) PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Built for CPAs, Israeli startups, and US subsidiaries. Conquers reversed Hebrew (RTL) payees, Israeli DD/MM/YYYY date formats, and foreign currency (ILS / USD) accounts into certified Intuit QuickBooks .QBO files.',
    features: [
      'Proprietary RTL reversal engine ensures Hebrew merchant descriptions read cleanly',
      'Standardizes Israeli DD/MM/YYYY dates to US QuickBooks MM/DD/YYYY format',
      'Full dual-currency support for Shekel (ILS) and Foreign Currency (USD/EUR) accounts',
      '100% mathematical reconciliation against Hapoalim closing balance'
    ],
    stepGuide: {
      title: 'How to Import Bank Hapoalim Statements into QuickBooks (US & Israeli Firms)',
      steps: [
        {
          num: 1,
          title: 'Upload Bank Hapoalim PDF (דף חשבון)',
          desc: 'Upload your Bank Hapoalim checking (עו״ש) or foreign currency PDF statement.'
        },
        {
          num: 2,
          title: 'Hebrew RTL & Date Normalization',
          desc: 'LedgerSnap restores inverted Hebrew characters to correct visual order and converts Israeli dates into Intuit QuickBooks standards.'
        },
        {
          num: 3,
          title: 'One-Click Import into QuickBooks',
          desc: 'Export compliant .QBO file and upload into QuickBooks Online with zero manual re-typing.'
        }
      ]
    },
    faqs: [
      {
        q: 'How does LedgerSnap handle reversed Hebrew text in Bank Hapoalim PDFs?',
        a: 'Standard PDF converters output Hebrew characters in reverse order (e.g., םילעופה קנב instead of בנק הפועלים). LedgerSnap includes a bi-directional RTL normalization algorithm that reorders Hebrew text accurately before exporting.'
      },
      {
        q: 'Can US CPAs manage Israeli subsidiaries using LedgerSnap?',
        a: 'Yes. Many US venture-backed companies have Israeli R&D centers banking with Hapoalim. LedgerSnap allows US accountants to convert Israeli PDF statements directly into QuickBooks Online .QBO registers.'
      }
    ]
  },
  {
    slug: 'bank-leumi-pdf-to-qbo',
    name: 'Bank Leumi (בנק לאומי)',
    fullName: 'Bank Leumi Le-Israel B.M. (בנק לאומי)',
    region: 'Israel / US Subsidiaries',
    isIsraeli: true,
    painPoint: 'Hebrew RTL payee descriptions, date format normalization (DD/MM/YYYY to US QuickBooks format)',
    metaTitle: 'Convert Bank Leumi (בנק לאומי) PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Bank Leumi checking and credit card PDF statements to QuickBooks (.QBO) & Excel. Clean Hebrew RTL text, date normalization, and certified Intuit import.',
    heroH1: 'Convert Bank Leumi (בנק לאומי) PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Effortlessly parse Bank Leumi (עו״ש ומט״ח) statements. Resolves inverted Hebrew text, debit/credit column inversion (זכות / חובה), and DD/MM/YYYY date formatting for seamless QuickBooks Online import.',
    features: [
      'Accurate mapping of Israeli הזכות (Credit) and החובה (Debit) columns',
      'Bi-directional Hebrew & English text reconstruction without garbled glyphs',
      'Supports Bank Leumi Total Digital and Leumi Tech corporate statements',
      'Exports certified .QBO Web Connect and Excel files with balance formulas'
    ],
    stepGuide: {
      title: 'Importing Bank Leumi Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload Leumi PDF', desc: 'Select your Bank Leumi monthly statement.' },
        { num: 2, title: 'Parse Hebrew & Math Checksum', desc: 'RTL Hebrew payees and date formats are normalized.' },
        { num: 3, title: 'Import .QBO File', desc: 'Upload into QuickBooks Online; transactions match automatically.' }
      ]
    },
    faqs: [
      {
        q: 'Does LedgerSnap handle Leumi Tech foreign currency accounts?',
        a: 'Yes. Leumi Tech accounts with USD, EUR, or GBP sub-ledgers are converted cleanly into QuickBooks-compatible OFX/QBO files.'
      }
    ]
  },
  {
    slug: 'discount-bank-pdf-to-qbo',
    name: 'Israel Discount Bank (בנק דיסקונט)',
    fullName: 'Israel Discount Bank Ltd. (בנק דיסקונט)',
    region: 'Israel / US Subsidiaries',
    isIsraeli: true,
    painPoint: 'Corporate & startup ILS/USD PDF statements into QuickBooks Online & Excel',
    metaTitle: 'Convert Israel Discount Bank (בנק דיסקונט) PDF to QuickBooks | LedgerSnap',
    metaDescription: 'Convert Israel Discount Bank PDF statements to QuickBooks (.QBO) and Excel spreadsheets. Handles Hebrew RTL descriptions and ILS/USD corporate statements.',
    heroH1: 'Convert Israel Discount Bank PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Transform Israel Discount Bank (בנק דיסקונט) statements into compliant Intuit QuickBooks (.QBO) files. Fixes reversed Hebrew typography, Israeli tax withholding lines, and multi-currency registers.',
    features: [
      'Normalizes Discount Bank debit (חובה) and credit (זכות) balance math',
      'Full support for corporate tech checking and foreign currency deposits',
      'Removes OCR distortions and garbled Hebrew text',
      'Ready for instant QuickBooks Online and Desktop bank feeds'
    ],
    stepGuide: {
      title: 'How to Import Discount Bank Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload Discount Statement', desc: 'Drop your Discount Bank PDF.' },
        { num: 2, title: 'Automated Processing', desc: 'In-memory parsing normalizes dates, payees, and balances.' },
        { num: 3, title: 'Upload .QBO', desc: 'Import directly into QuickBooks Online.' }
      ]
    },
    faqs: [
      {
        q: 'Why do Hebrew characters appear backwards in regular converters?',
        a: 'PDFs store Hebrew characters in visual reading order from left to right. Without specialized bi-directional processing, regular converters render the words backwards. LedgerSnap reconstructs the logical order properly.'
      }
    ]
  },
  {
    slug: 'mizrahi-tefahot-pdf-to-qbo',
    name: 'Mizrahi-Tefahot (מזרחי טפחות)',
    fullName: 'Mizrahi Tefahot Bank Ltd. (בנק מזרחי טפחות)',
    region: 'Israel / US Subsidiaries',
    isIsraeli: true,
    painPoint: 'Clean extraction of Hebrew/English transaction tables with mathematical checksum',
    metaTitle: 'Convert Mizrahi-Tefahot PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Mizrahi-Tefahot (מזרחי טפחות) bank statements to QuickBooks (.QBO) & Excel. 100% mathematical checksum verification and clean Hebrew parsing.',
    heroH1: 'Convert Mizrahi-Tefahot PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Convert Mizrahi-Tefahot business and mortgage/checking statement PDFs. Ensures zero missed transactions, accurate Hebrew payee rendering, and instant QuickBooks Online import.',
    features: [
      'Reconciles complex Mizrahi-Tefahot balance summaries and fee tables',
      'Bi-directional Hebrew character reordering for flawless payee descriptions',
      'Converts Israeli DD/MM/YYYY date sequences to Intuit standard format',
      '100% private in-memory RAM processing'
    ],
    stepGuide: {
      title: 'Importing Mizrahi-Tefahot Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload Mizrahi PDF', desc: 'Drop your Mizrahi-Tefahot PDF statement.' },
        { num: 2, title: 'Instant Verification', desc: 'LedgerSnap verifies math checksums and formats transaction rows.' },
        { num: 3, title: 'Import .QBO File', desc: 'Import directly into QuickBooks Online.' }
      ]
    },
    faqs: [
      {
        q: 'Are mortgage or loan payments from Mizrahi-Tefahot parsed accurately?',
        a: 'Yes, LedgerSnap extracts principal and interest payment breakdowns from monthly checking statements accurately.'
      }
    ]
  }
];
