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
    metaDescription: 'Convert Bank of America checking and credit card PDF statements to QuickBooks (.QBO) & Excel. Automatic check number matching and balance reconciliation.',
    heroH1: 'Convert Bank of America PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Transform multi-column Bank of America monthly checking, savings, and corporate card statements into certified .QBO Web Connect files. Automatically parses BofA check image registers and reconciles balances without manual entry.',
    features: [
      'Extracts embedded check numbers and check image tables accurately',
      'Parses complex BofA multi-line wire, ACH, and electronic deposit descriptions',
      'Certified Bank of America Intuit FID tags (<INTU.BID>3003) for flawless import',
      'Supports business checking, merchant services, and Merrill cash management accounts'
    ],
    stepGuide: {
      title: 'Importing Bank of America Statements into QuickBooks Online',
      steps: [
        { num: 1, title: 'Upload BofA PDF', desc: 'Select your Bank of America monthly statement PDF.' },
        { num: 2, title: 'Automatic Table Parsing', desc: 'LedgerSnap splits deposits, withdrawals, and check images into structured rows.' },
        { num: 3, title: 'Import into QuickBooks', desc: 'Download your .QBO file and import directly into QuickBooks Online Banking.' }
      ]
    },
    faqs: [
      {
        q: 'How does LedgerSnap handle Bank of America check registers?',
        a: 'Bank of America statements print check numbers and amounts in separate 3-column sub-tables. Regular OCR software scrambles these into debit amounts without check IDs. LedgerSnap reconstructs each check number as an Intuit <CHECKNUM> tag with exact dates.'
      }
    ]
  },
  {
    slug: 'wells-fargo-pdf-to-qbo',
    name: 'Wells Fargo',
    fullName: 'Wells Fargo Bank, N.A.',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Multi-column check listings, daily ledger balances, and ATM deposit breakdown',
    metaTitle: 'Convert Wells Fargo PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Wells Fargo business checking and commercial PDF statements to QuickBooks (.QBO) & Excel. Zero data retention, instant conversion.',
    heroH1: 'Convert Wells Fargo PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Convert multi-page Wells Fargo statements into validated QuickBooks Web Connect files. Solves column alignment issues in Wells Fargo commercial accounts, daily ledger reconciliations, and wire transactions.',
    features: [
      'Converts Wells Fargo multi-page commercial and small business checking statements',
      'Preserves Wells Fargo electronic payment references and bill pay details',
      'Validates closing balances against daily ledger summary tables',
      'Exports certified .QBO files compatible with all QuickBooks versions (2018-2026)'
    ],
    stepGuide: {
      title: 'How to Convert and Import Wells Fargo Statements',
      steps: [
        { num: 1, title: 'Upload Wells Fargo PDF', desc: 'Drop your Wells Fargo checking or credit card statement.' },
        { num: 2, title: 'Mathematical Verification', desc: 'LedgerSnap matches total debits, total credits, and closing balance.' },
        { num: 3, title: 'Upload to QuickBooks', desc: 'Import the generated .QBO file with zero mapping required.' }
      ]
    },
    faqs: [
      {
        q: 'Does LedgerSnap work with Wells Fargo Commercial and Treasury accounts?',
        a: 'Yes. LedgerSnap accurately parses both standard small business statements and high-volume Wells Fargo Commercial Electronic Office (CEO) PDF statements.'
      }
    ]
  },
  {
    slug: 'citibank-pdf-to-qbo',
    name: 'Citibank',
    fullName: 'Citibank, N.A. (Citi)',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Complex corporate statements, foreign transaction fees, and multi-currency registers',
    metaTitle: 'Convert Citibank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Citibank checking, commercial, and Costco Anywhere card PDF statements to QuickBooks (.QBO) and Excel spreadsheets in seconds.',
    heroH1: 'Convert Citibank PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Effortlessly convert Citibank corporate checking and Citi credit card statements into QuickBooks Online .QBO registers. Accurately handles Costco Citi cards, merchant processing statements, and multi-currency transactions.',
    features: [
      'Supports Citi Commercial Bank, CitiBusiness, and personal checking accounts',
      'Custom parsing for Costco Anywhere Visa and Citi Double Cash credit cards',
      'Calculates accurate balances with full mathematical reconciliation',
      'Certified Intuit FID tags (<INTU.BID>24909)'
    ],
    stepGuide: {
      title: 'Importing Citi Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload Citi PDF', desc: 'Upload your Citibank statement.' },
        { num: 2, title: 'In-Memory Processing', desc: 'Table parsing extracts line-item transactions without retaining data.' },
        { num: 3, title: 'Import .QBO File', desc: 'One-click upload into QuickBooks Online banking feeds.' }
      ]
    },
    faqs: [
      {
        q: 'Can I convert Citi credit card statements with foreign currency conversions?',
        a: 'Yes. LedgerSnap extracts the settled USD amount and original foreign currency reference cleanly into the transaction memo.'
      }
    ]
  },
  {
    slug: 'capital-one-pdf-to-qbo',
    name: 'Capital One',
    fullName: 'Capital One Financial Corporation',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Spark Business card expense categorizations, merged fee lines, and multi-card employee sub-accounts',
    metaTitle: 'Convert Capital One PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Capital One Spark Business and 360 checking PDF statements to QuickBooks (.QBO) & Excel. Separate employee cardholder expenses automatically.',
    heroH1: 'Convert Capital One PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Designed for accountants handling Capital One Spark Business credit cards and 360 checking accounts. Accurately parses employee card spending sub-tables and statement credits into clean QuickBooks bank feeds.',
    features: [
      'Segregates Capital One Spark Business transactions by individual employee cardholder',
      'Handles multi-page Capital One 360 checking and high-yield savings statements',
      'Correctly maps interest payments, cash back credits, and annual fees',
      'Generates certified Intuit Web Connect (.QBO) files with <INTU.BID> tags'
    ],
    stepGuide: {
      title: 'Importing Capital One Statements to QuickBooks Online',
      steps: [
        { num: 1, title: 'Upload Capital One Statement', desc: 'Upload your Spark Business or 360 PDF.' },
        { num: 2, title: 'Reconcile Transactions', desc: 'LedgerSnap aligns cardholders and reconciles closing balances.' },
        { num: 3, title: 'Import to QBO', desc: 'Import directly into QuickBooks Online Bank Transactions.' }
      ]
    },
    faqs: [
      {
        q: 'Does LedgerSnap separate employee cards on Capital One Spark accounts?',
        a: 'Yes! Capital One prints transactions grouped under each employee name. LedgerSnap preserves employee cardholder metadata in the .QBO memo line so you can assign expenses to the right class or vendor in QuickBooks.'
      }
    ]
  },
  {
    slug: 'mercury-bank-pdf-to-qbo',
    name: 'Mercury Bank',
    fullName: 'Mercury Technologies (Choice Financial Group / Evolve Bank & Trust)',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Multi-account startup tech statements, venture debt wires, and Stripe/PayPal batch payouts',
    metaTitle: 'Convert Mercury Bank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Mercury startup bank PDF statements to QuickBooks (.QBO) and Excel. Reconcile Stripe payouts, venture wires, and corporate debit cards.',
    heroH1: 'Convert Mercury Bank PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'The dedicated converter for tech startups, SaaS founders, and venture-backed companies. Transform Mercury checking, savings, and corporate credit statements into clean QuickBooks and Xero registers.',
    features: [
      'Specialized parser for Mercury checking, treasury, and credit statements',
      'Reconciles complex Stripe, Shopify, and PayPal batch payout lines',
      'Preserves wire recipient details, counterparty names, and internal transfer memos',
      'Instant conversion to certified .QBO Web Connect and Excel formats'
    ],
    stepGuide: {
      title: 'How to Import Mercury Statements into QuickBooks Online',
      steps: [
        { num: 1, title: 'Upload Mercury PDF', desc: 'Upload your monthly Mercury statement.' },
        { num: 2, title: 'Extract Wires & Payouts', desc: 'All transactions, counterparties, and fees are extracted in memory.' },
        { num: 3, title: 'Upload to QuickBooks', desc: 'Match with your Mercury checking ledger in QuickBooks Online.' }
      ]
    },
    faqs: [
      {
        q: 'Why use LedgerSnap if Mercury has direct QuickBooks integration?',
        a: 'Mercury direct bank feeds occasionally break or fail to sync historical transactions older than 90 days. For annual audits, tax filings, or catch-up bookkeeping, LedgerSnap converts the official historical PDFs into flawless .QBO files.'
      }
    ]
  },
  {
    slug: 'pnc-bank-pdf-to-qbo',
    name: 'PNC Bank',
    fullName: 'PNC Financial Services Group, Inc.',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Virtual Wallet statement tables, check register grids, and automated sweeping accounts',
    metaTitle: 'Convert PNC Bank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert PNC Bank business checking and Virtual Wallet PDF statements into certified QuickBooks (.QBO) and Excel. 100% accurate balance reconciliation.',
    heroH1: 'Convert PNC Bank PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Easily convert PNC Bank commercial checking, Virtual Wallet, and treasury management PDF statements. Resolves check image column splitting and sweep account transfers.',
    features: [
      'Accurate parsing of PNC Virtual Wallet (Spend, Reserve, Growth) statements',
      'Extracts check numbers and electronic payment memos reliably',
      'Full mathematical balance validation against opening & closing totals',
      'Zero installation: 100% cloud in-memory conversion'
    ],
    stepGuide: {
      title: 'Importing PNC Bank Statements into QuickBooks Online',
      steps: [
        { num: 1, title: 'Upload PNC PDF', desc: 'Drop your PNC monthly checking statement.' },
        { num: 2, title: 'Automatic Parsing', desc: 'LedgerSnap builds a validated .QBO file in seconds.' },
        { num: 3, title: 'Upload to QBO', desc: 'One-click import into QuickBooks Online.' }
      ]
    },
    faqs: [
      {
        q: 'Does LedgerSnap support PNC treasury management and sweep accounts?',
        a: 'Yes, LedgerSnap handles both personal Virtual Wallet statements and high-volume commercial sweep accounts.'
      }
    ]
  },
  {
    slug: 'us-bank-pdf-to-qbo',
    name: 'U.S. Bank',
    fullName: 'U.S. Bancorp / U.S. Bank National Association',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Commercial checking statements, multi-column deposit breakdowns, and merchant card processing fees',
    metaTitle: 'Convert U.S. Bank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert U.S. Bank checking, commercial, and credit card PDF statements into certified QuickBooks (.QBO) & Excel. Fast, accurate, and private.',
    heroH1: 'Convert U.S. Bank PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Transform U.S. Bank checking and commercial card PDF statements into certified QuickBooks .QBO registers. Accurately maps deposits, withdrawals, and merchant processing fees without manual data entry.',
    features: [
      'Parses U.S. Bank Silver, Gold, and Platinum business checking statements',
      'Supports U.S. Bank commercial credit cards and Elavon merchant processing rows',
      'Reconciles opening and closing balances with zero math discrepancies',
      'Certified Intuit Web Connect file formatting'
    ],
    stepGuide: {
      title: 'How to Import U.S. Bank Statements to QuickBooks',
      steps: [
        { num: 1, title: 'Upload U.S. Bank PDF', desc: 'Drag your statement into LedgerSnap.' },
        { num: 2, title: 'Fast Conversion', desc: 'Our engine extracts transaction rows in RAM memory.' },
        { num: 3, title: 'Import to QuickBooks', desc: 'Upload the .QBO file into your QuickBooks bank feed.' }
      ]
    },
    faqs: [
      {
        q: 'Does LedgerSnap support Elavon merchant deposit breakdowns on U.S. Bank statements?',
        a: 'Yes. U.S. Bank statements featuring daily Elavon batch credit card deposits and batch merchant fees are split into individual accounting transactions cleanly.'
      }
    ]
  },
  {
    slug: 'td-bank-pdf-to-qbo',
    name: 'TD Bank',
    fullName: 'TD Bank, N.A. (America’s Most Convenient Bank)',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Multi-column electronic banking tables, daily balance summaries, and ACH payroll entries',
    metaTitle: 'Convert TD Bank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert TD Bank business checking and personal PDF statements into QuickBooks (.QBO) and Excel spreadsheets in seconds. Try 1 statement free.',
    heroH1: 'Convert TD Bank PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Convert TD Bank checking, savings, and credit card PDF statements into certified QuickBooks (.QBO) files. Handles TD Convenience Checking, Business Simple Checking, and ACH wire transactions flawlessly.',
    features: [
      'Full support for TD Bank US checking and business convenience accounts',
      'Extracts check numbers, ACH payroll debits, and electronic transfers',
      'Performs mathematical checksums against TD Bank daily balance summaries',
      'Compatible with QuickBooks Online, QuickBooks Desktop, and Xero'
    ],
    stepGuide: {
      title: 'Importing TD Bank Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload TD Bank PDF', desc: 'Select your monthly TD Bank PDF statement.' },
        { num: 2, title: 'Instant Conversion', desc: 'LedgerSnap processes the PDF in ephemeral volatile memory.' },
        { num: 3, title: 'Import to QuickBooks', desc: 'Upload your .QBO file into QuickBooks Online with zero mapping.' }
      ]
    },
    faqs: [
      {
        q: 'Can I convert TD Bank statements with hundreds of debit card transactions?',
        a: 'Yes. LedgerSnap easily processes multi-page statements spanning 20, 50, or 100+ pages without choking or dropping rows.'
      }
    ]
  },
  {
    slug: 'truist-bank-pdf-to-qbo',
    name: 'Truist Bank',
    fullName: 'Truist Financial Corporation (BB&T and SunTrust)',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Merged BB&T and SunTrust legacy statement formats, check image tables, and treasury registers',
    metaTitle: 'Convert Truist Bank PDF Statements to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Truist Bank (formerly SunTrust and BB&T) PDF statements to QuickBooks (.QBO) & Excel in seconds. Zero data retention.',
    heroH1: 'Convert Truist Bank PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'The ultimate PDF to QuickBooks converter for Truist Bank. Accurately handles unified Truist statements as well as legacy BB&T and SunTrust checking, savings, and commercial registers.',
    features: [
      'Supports Truist Business Checking, Simple Business Checking, and Commercial accounts',
      'Compatible with legacy SunTrust and BB&T statement layouts',
      'Accurate check number extraction and Zelle memo parsing',
      'Strict balance checksum verification against Truist closing numbers'
    ],
    stepGuide: {
      title: 'How to Import Truist Statements into QuickBooks',
      steps: [
        { num: 1, title: 'Upload Truist PDF', desc: 'Upload your Truist statement PDF.' },
        { num: 2, title: 'Extract Data', desc: 'Tables and payees are cleaned and converted in memory.' },
        { num: 3, title: 'Import to QBO', desc: 'Upload into QuickBooks Online Banking in one click.' }
      ]
    },
    faqs: [
      {
        q: 'Does LedgerSnap work with older SunTrust or BB&T statements from before the merger?',
        a: 'Yes! Our layout detection engine automatically recognizes pre-merger SunTrust and BB&T formatting and converts them cleanly.'
      }
    ]
  },
  {
    slug: 'silicon-valley-bank-pdf-to-qbo',
    name: 'Silicon Valley Bank (SVB)',
    fullName: 'Silicon Valley Bank (a division of First Citizens Bank)',
    region: 'US',
    isIsraeli: false,
    painPoint: 'Venture capital wire feeds, startup treasury statements, and multi-entity account ledgers',
    metaTitle: 'Convert Silicon Valley Bank (SVB) PDF to QuickBooks (.QBO) | LedgerSnap',
    metaDescription: 'Convert Silicon Valley Bank (SVB) PDF statements into certified QuickBooks (.QBO) and Excel. Built for venture-backed startups and finance teams.',
    heroH1: 'Convert Silicon Valley Bank (SVB) PDF Statements to QuickBooks (.QBO) & Excel',
    heroSub: 'Designed for CFOs, controllers, and accountants at venture-backed startups. Turn multi-page SVB checking, money market, and venture debt statements into certified Intuit QuickBooks registers.',
    features: [
      'Specialized layout recognition for SVB First Citizens Bank statements',
      'Preserves wire counterparty descriptions, venture funding deposits, and FX fees',
      'Full mathematical balance validation against SVB closing balances',
      'Zero-retention volatile RAM processing for maximum financial confidentiality'
    ],
    stepGuide: {
      title: 'Importing SVB Statements into QuickBooks Online',
      steps: [
        { num: 1, title: 'Upload SVB Statement', desc: 'Upload your SVB monthly PDF statement.' },
        { num: 2, title: 'In-Memory Extraction', desc: 'Transactions are extracted and verified against ledger summaries.' },
        { num: 3, title: 'Import to QuickBooks', desc: 'Upload into QuickBooks Online with full vendor recognition.' }
      ]
    },
    faqs: [
      {
        q: 'Is my SVB company data confidential during conversion?',
        a: 'Yes. LedgerSnap processes files strictly in ephemeral RAM memory and deletes all traces immediately after file generation. We never train AI on financial records or store statements on disk.'
      }
    ]
  }
];
