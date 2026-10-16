/**
 * Authoritative Directory of Top 30 US Banks, Credit Cards & Neobanks
 * for Programmatic SEO Landing Pages, Schema.org Generation, and Dropzone Configuration.
 */

export const US_INSTITUTIONS = [
  {
    id: 'chase',
    name: 'JPMorgan Chase',
    fullName: 'JPMorgan Chase Bank, N.A.',
    org: 'JPMorgan Chase Bank',
    fid: '10898',
    bid: '10898',
    routing: '021000021',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Chase Direct Connect only imports the last 90 days of transactions into QuickBooks Online. For older catch-up bookkeeping, upload your Chase PDF statements here.',
    painPoint: 'Multi-page checking & Sapphire/Ink credit card statements beyond the 90-day bank feed limit',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'CHECK # / CHK 1042',
    keywords: ['CHASE', 'JPMORGAN', 'JPMORGAN CHASE', 'J.P. MORGAN', 'CHASE INK', 'SAPPHIRE']
  },
  {
    id: 'wells-fargo',
    name: 'Wells Fargo',
    fullName: 'Wells Fargo Bank, N.A.',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '121000247',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Wells Fargo bank feeds truncate transaction history at 90 days. Convert older Wells Fargo PDF statements into certified .QBO Web Connect files in seconds.',
    painPoint: 'Multi-column check listings, daily ledger balances, and ATM deposit breakdown',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check 4021 / Image Check',
    keywords: ['WELLS FARGO', 'WELLSFARGO']
  },
  {
    id: 'bank-of-america',
    name: 'Bank of America',
    fullName: 'Bank of America, N.A.',
    org: 'Bank of America',
    fid: '6812',
    bid: '6812',
    routing: '026009593',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Bank of America limits automatic bank feeds to the last 90 days. For previous tax years or quarterly audits, convert BofA PDF statements to .QBO.',
    painPoint: 'Embedded check registers, multi-line Zelle/wire payees, and running balance reconciliation',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #5521 in sub-table',
    keywords: ['BANK OF AMERICA', 'BOFA', 'B OF A']
  },
  {
    id: 'citi',
    name: 'Citibank',
    fullName: 'Citibank, N.A.',
    org: 'Citibank',
    fid: '24909',
    bid: '24909',
    routing: '021000089',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Citibank live bank feeds only pull recent records. For tax filings or catch-up bookkeeping spanning prior years, convert your Citi PDF statements here.',
    painPoint: 'Combined debits and credits, multi-currency international wires, and Costco card statements',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'CHECK 3301',
    keywords: ['CITIBANK', 'CITI', 'CITIGROUP']
  },
  {
    id: 'capital-one',
    name: 'Capital One',
    fullName: 'Capital One Bank (USA), N.A.',
    org: 'Capital One',
    fid: '15688',
    bid: '15688',
    routing: '051405515',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Capital One Spark Business and 360 accounts only sync recent transactions. Convert Spark PDF statements to .QBO without inverted liability signs.',
    painPoint: 'Spark business cards listing charges as positive numbers and fragmented vendor codes',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'CHECK #1021',
    keywords: ['CAPITAL ONE', 'CAPITALONE', 'SPARK BUSINESS']
  },
  {
    id: 'amex',
    name: 'American Express',
    fullName: 'American Express Company',
    org: 'AMEX',
    fid: '3101',
    bid: '3101',
    routing: '000000000',
    accountTypeDefault: 'CREDITLINE',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'American Express direct bank connections only fetch up to 90 days. LedgerSnap converts multi-page Amex Platinum, Gold, and Blue Business statements to .QBO with correct negative charge signs.',
    painPoint: 'Credit card liability signs inverted by generic CSV tools, merchant category splits, and foreign FX fees',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'N/A (Credit Card)',
    keywords: ['AMERICAN EXPRESS', 'AMEX', 'CENTURION']
  },
  {
    id: 'us-bank',
    name: 'U.S. Bank',
    fullName: 'U.S. Bank National Association',
    org: 'US Bank',
    fid: '1465',
    bid: '1465',
    routing: '091000022',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'U.S. Bank direct feeds cap historical downloads at 90 days. Convert your U.S. Bank PDF statements directly into certified QuickBooks Web Connect files.',
    painPoint: 'Commercial checking summary tables, daily ledger balance checks, and merchant processing batches',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #8841',
    keywords: ['U.S. BANK', 'US BANK', 'USBANK']
  },
  {
    id: 'pnc',
    name: 'PNC Bank',
    fullName: 'PNC Bank, National Association',
    org: 'PNC Bank',
    fid: '4332',
    bid: '4332',
    routing: '043000096',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'PNC Bank Virtual Wallet and Business checking feeds cut off at 90 days. Convert your PNC PDF statements to .QBO without duplicate entries.',
    painPoint: 'Virtual Wallet multi-account layouts (Spend, Reserve, Growth) and separate check listing grids',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check 2012',
    keywords: ['PNC', 'PNC BANK']
  },
  {
    id: 'td-bank',
    name: 'TD Bank',
    fullName: 'TD Bank, N.A.',
    org: 'TD Bank',
    fid: '10912',
    bid: '10912',
    routing: '011103093',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'TD Bank feeds only supply 90 days of transaction history. Convert multi-page TD Bank statements to .QBO with automated balance reconciliation.',
    painPoint: 'Extensive debit card registers, multiple store locations, and multi-page statements exceeding 30 pages',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #3014',
    keywords: ['TD BANK', 'TD AMERITRADE']
  },
  {
    id: 'truist',
    name: 'Truist',
    fullName: 'Truist Financial Corporation (BB&T and SunTrust)',
    org: 'Truist',
    fid: '12811',
    bid: '12811',
    routing: '053000196',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Truist direct feeds disconnect frequently and limit historical sync to 90 days. Convert Truist, SunTrust, or BB&T PDF statements seamlessly.',
    painPoint: 'Merged BB&T and SunTrust legacy statement layouts and check register formatting',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check 9182',
    keywords: ['TRUIST', 'SUNTRUST', 'BB&T']
  },
  {
    id: 'regions',
    name: 'Regions Bank',
    fullName: 'Regions Bank',
    org: 'Regions Bank',
    fid: '1007',
    bid: '1007',
    routing: '062000019',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Regions Bank online banking only exports recent quarters. Use LedgerSnap to convert multi-year Regions PDF statements to QuickBooks.',
    painPoint: 'LifeGreen checking multi-line descriptions and check sequence tables',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #1245',
    keywords: ['REGIONS', 'REGIONS BANK']
  },
  {
    id: 'fifth-third',
    name: 'Fifth Third Bank',
    fullName: 'Fifth Third Bank, N.A.',
    org: 'Fifth Third Bank',
    fid: '1011',
    bid: '1011',
    routing: '042000314',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Fifth Third 5/3 Bank feeds restrict historical imports to 90 days. Convert historical 5/3 statement PDFs to .QBO with 1-click.',
    painPoint: 'Electronic banking transaction codes and 5/3 business checking running balances',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check 7712',
    keywords: ['FIFTH THIRD', '5/3 BANK']
  },
  {
    id: 'citizens',
    name: 'Citizens Bank',
    fullName: 'Citizens Bank, N.A.',
    org: 'Citizens Bank',
    fid: '2440',
    bid: '2440',
    routing: '011500120',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Citizens Bank direct connect cuts off at 90 days. Easily import older Citizens statements into QuickBooks Online without manual typing.',
    painPoint: 'Citizens commercial cash flow ledgers and check payment registers',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #4421',
    keywords: ['CITIZENS', 'CITIZENS BANK']
  },
  {
    id: 'huntington',
    name: 'Huntington Bank',
    fullName: 'The Huntington National Bank',
    org: 'Huntington National Bank',
    fid: '1014',
    bid: '1014',
    routing: '044000024',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Huntington 24-Hour Grace checking statements older than 90 days cannot be pulled via bank feed. Upload Huntington PDFs to get compliant .QBO files.',
    painPoint: 'Huntington 24-Hour Grace transfers and separate debit card register columns',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check 6150',
    keywords: ['HUNTINGTON', 'HUNTINGTON BANK']
  },
  {
    id: 'keybank',
    name: 'KeyBank',
    fullName: 'KeyBank National Association',
    org: 'KeyBank',
    fid: '1016',
    bid: '1016',
    routing: '041001039',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'KeyBank direct feed limits historical synchronization to 90 days. Convert KeyBank PDF statements into validated QuickBooks Web Connect files.',
    painPoint: 'KeyBank Business Rewards checking and check clearing sub-tables',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #2291',
    keywords: ['KEYBANK', 'KEY BANK']
  },
  {
    id: 'navy-federal',
    name: 'Navy Federal Credit Union',
    fullName: 'Navy Federal Credit Union',
    org: 'Navy Federal',
    fid: '2490',
    bid: '2490',
    routing: '256074974',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Navy Federal Credit Union feeds frequently disconnect or fail to import historical data. LedgerSnap converts NFCU statements into 100% compliant .QBO files.',
    painPoint: 'NFCU share accounts (Share 001, Share 002) combined on single monthly statements',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check 8101',
    keywords: ['NAVY FEDERAL', 'NFCU']
  },
  {
    id: 'usaa',
    name: 'USAA',
    fullName: 'USAA Federal Savings Bank',
    org: 'USAA',
    fid: '6781',
    bid: '6781',
    routing: '314074269',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'USAA bank feeds restrict transaction history to the most recent 90 days. Convert USAA military checking and credit card PDFs to .QBO.',
    painPoint: 'USAA electronic transfer memos, insurance premiums, and combined deposit tables',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #5502',
    keywords: ['USAA', 'USAA FEDERAL SAVINGS']
  },
  {
    id: 'schwab',
    name: 'Charles Schwab',
    fullName: 'Charles Schwab Bank, SSB',
    org: 'Charles Schwab',
    fid: '1018',
    bid: '1018',
    routing: '121202211',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Charles Schwab Bank Investor Checking feeds drop transactions older than 90 days. Convert Schwab monthly PDF statements to .QBO with zero errors.',
    painPoint: 'Brokerage cash sweep transactions, interest credits, and ATM fee rebates',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check 1002',
    keywords: ['SCHWAB', 'CHARLES SCHWAB']
  },
  {
    id: 'fidelity',
    name: 'Fidelity',
    fullName: 'Fidelity Investments',
    org: 'Fidelity',
    fid: '1019',
    bid: '1019',
    routing: '101205681',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Fidelity Cash Management and brokerage accounts require manual statement imports for older periods. Convert Fidelity PDFs to .QBO in seconds.',
    painPoint: 'Cash management sweep dividends, debit card transactions, and trade settlements',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #7210',
    keywords: ['FIDELITY', 'FIDELITY INVESTMENTS']
  },
  {
    id: 'mercury',
    name: 'Mercury',
    fullName: 'Mercury Technologies (Evolve Bank / Choice Financial)',
    org: 'JPMorgan Chase Bank',
    fid: '10898',
    bid: '10898',
    routing: '084109404',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Mercury startup banking statements often need to be imported for historical catch-up tax filings. Convert Mercury PDF statements directly to QuickBooks.',
    painPoint: 'High-volume venture capital wires, international treasury transactions, and multi-entity accounts',
    dateFormatExample: 'YYYY-MM-DD or MM/DD/YYYY',
    checkNumPattern: 'N/A (Wires / ACH)',
    keywords: ['MERCURY', 'MERCURY.COM', 'EVOLVE BANK']
  },
  {
    id: 'relay',
    name: 'Relay Financial',
    fullName: 'Relay Financial (Thread Bank)',
    org: 'JPMorgan Chase Bank',
    fid: '10898',
    bid: '10898',
    routing: '053112929',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Relay Financial multi-account Profit First setups can be converted to QuickBooks .QBO with clean vendor names and zero duplicate transactions.',
    painPoint: 'Profit First multi-account statements and collaborative bookkeeping transfers',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #1005',
    keywords: ['RELAY', 'RELAY FINANCIAL', 'THREAD BANK']
  },
  {
    id: 'brex',
    name: 'Brex',
    fullName: 'Brex Cash & Corporate Card',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '000000000',
    accountTypeDefault: 'CREDITLINE',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Brex corporate credit card statements must be imported with proper liability signs. LedgerSnap ensures Brex charges import as negative debits in QuickBooks.',
    painPoint: 'Corporate card charges listed as positive numbers causing inverted QuickBooks registers',
    dateFormatExample: 'YYYY-MM-DD or MM/DD/YYYY',
    checkNumPattern: 'N/A (Card Transactions)',
    keywords: ['BREX']
  },
  {
    id: 'ramp',
    name: 'Ramp',
    fullName: 'Ramp Business Card',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '000000000',
    accountTypeDefault: 'CREDITLINE',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Ramp business card statements require exact Web Connect credit card formatting. Convert Ramp PDF statements to .QBO with automated sign normalization.',
    painPoint: 'Multi-employee corporate cards, reimbursement batches, and cashback credits',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'N/A (Card Transactions)',
    keywords: ['RAMP', 'RAMP CARD']
  },
  {
    id: 'bluevine',
    name: 'Bluevine',
    fullName: 'Bluevine Business Checking (Coastal Community Bank)',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '125108398',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Bluevine business checking statements older than 90 days cannot be synced directly. Convert Bluevine PDF statements to .QBO with 100% balance validation.',
    painPoint: 'Sub-account balances, bill pay debits, and line of credit interest fees',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #1020',
    keywords: ['BLUEVINE', 'COASTAL COMMUNITY BANK']
  },
  {
    id: 'novo',
    name: 'Novo',
    fullName: 'Novo Platform Inc (Middlesex Federal Savings)',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '211370545',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Novo small business checking bank feeds restrict historical sync. Convert Novo PDF statements into certified Intuit Web Connect .QBO files.',
    painPoint: 'Stripe payouts, square card deposits, and reserve sub-ledger transfers',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Check #902',
    keywords: ['NOVO', 'MIDDLESEX FEDERAL']
  },
  {
    id: 'found',
    name: 'Found',
    fullName: 'Found Technologies (Piermont Bank)',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '026014902',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Found self-employed banking statements can be converted to QuickBooks .QBO to separate personal and business expenses effortlessly.',
    painPoint: 'Automated tax withholding deductions and schedule C expense categories',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'N/A (Electronic)',
    keywords: ['FOUND', 'FOUND BANK']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    fullName: 'PayPal Business Account',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '000000000',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'PayPal bank feeds frequently cause duplicate gross/fee rows. LedgerSnap parses PayPal statements into clean net deposits and fee debits.',
    painPoint: 'Gross sales versus processing fee splits, dispute holds, and currency conversions',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Transaction ID #',
    keywords: ['PAYPAL']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    fullName: 'Stripe Payments & Treasury',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '000000000',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Stripe payout reports and balance statements can be converted directly into QuickBooks .QBO files with accurate fee splits and batch reconciliations.',
    painPoint: 'Payout bundle reconciliations, dispute reserves, and multi-currency balances',
    dateFormatExample: 'YYYY-MM-DD or MM/DD/YYYY',
    checkNumPattern: 'Transfer po_***',
    keywords: ['STRIPE']
  },
  {
    id: 'square',
    name: 'Square',
    fullName: 'Block Inc / Square Financial Services',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '124303254',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Square POS banking and settlement statements can be converted to QuickBooks .QBO with clean vendor payees and zero duplicate sales rows.',
    painPoint: 'Daily batch settlement reconciliations and instant deposit fee deductions',
    dateFormatExample: 'MM/DD/YYYY (e.g. 10/16/2026)',
    checkNumPattern: 'Settlement ID',
    keywords: ['SQUARE', 'BLOCK INC']
  },
  {
    id: 'wise',
    name: 'Wise',
    fullName: 'Wise US Inc (formerly TransferWise)',
    org: 'Wells Fargo',
    fid: '3000',
    bid: '3000',
    routing: '000000000',
    accountTypeDefault: 'CHECKING',
    directFeedLimit: '90 days',
    directFeedLimitNotice: 'Wise multi-currency borderless account statements can be converted to QuickBooks .QBO or Excel with accurate currency codes and FX fee separation.',
    painPoint: 'Multi-currency balances (USD, EUR, GBP) on a single statement with exchange rate conversions',
    dateFormatExample: 'DD/MM/YYYY or MM/DD/YYYY',
    checkNumPattern: 'Transfer ID',
    keywords: ['WISE', 'TRANSFERWISE']
  }
];

function generateBankLandingConfig(inst) {
  const isCreditCard = inst.accountTypeDefault === 'CREDITLINE';
  const slugStatementToQbo = `${inst.id}-statement-to-qbo`;
  const slugPdfToQbo = `${inst.id}-pdf-to-qbo`;
  const slugPdfToQboOnline = `${inst.id}-pdf-to-quickbooks-online`;
  const slugPdfToCsv = `${inst.id}-pdf-to-csv`;

  const faqs = [
    {
      q: `Why can’t I download historical statements older than 90 days from ${inst.name} into QuickBooks?`,
      a: `Intuit Bank Feeds limit automatic direct-connect syncing to between 30 and 90 days for ${inst.name}. For prior quarters or tax-season catch-up bookkeeping, ${inst.name} only offers PDF statements. LedgerSnap turns those PDF statements into certified Intuit Web Connect (.QBO) files with valid <INTU.BID>${inst.bid}</INTU.BID> headers that import with 1-click.`
    },
    {
      q: `Does LedgerSnap support both ${inst.name} business accounts and personal statements?`,
      a: `Yes. LedgerSnap has pre-tuned layout algorithms for both ${inst.name} Commercial/Business accounts and Personal checking, savings, and credit cards. It properly maps account numbers, transaction types, and check numbers.`
    },
    {
      q: `How does LedgerSnap handle ${inst.name} check registers and check numbers?`,
      a: `${inst.name} statements often print check numbers in separate 3-column sub-tables or inside payee text (e.g. "${inst.checkNumPattern}"). LedgerSnap extracts the exact check number into the Intuit <CHECKNUM> tag right after <FITID>, mapping directly to the QuickBooks Check Number column.`
    },
    {
      q: `Will importing ${inst.name} files cause duplicate transactions in QuickBooks?`,
      a: `No. LedgerSnap generates 100% deterministic cryptographic <FITID> hashes (SHA-256) for every transaction based on account ID, date, amount, and payee string. Re-importing overlapping periods will cause QuickBooks to automatically skip already-imported entries.`
    },
    {
      q: `Are my ${inst.name} financial records private and secure during conversion?`,
      a: `Yes. LedgerSnap processes files strictly in volatile ephemeral RAM memory. Your bank statement is never stored on disk, never retained in a database, and never used to train AI models. Hosted on SOC 2 Type II certified cloud infrastructure.`
    }
  ];

  return {
    id: inst.id,
    slug: slugStatementToQbo,
    aliases: [slugPdfToQbo, slugPdfToQboOnline, slugPdfToCsv],
    name: inst.name,
    fullName: inst.fullName,
    org: inst.org,
    fid: inst.fid,
    bid: inst.bid,
    routing: inst.routing,
    accountTypeDefault: inst.accountTypeDefault,
    directFeedLimit: inst.directFeedLimit,
    directFeedLimitNotice: inst.directFeedLimitNotice,
    painPoint: inst.painPoint,
    dateFormatExample: inst.dateFormatExample,
    checkNumPattern: inst.checkNumPattern,
    metaTitle: `Convert ${inst.name} Statement PDF to QuickBooks (.QBO) & Excel | LedgerSnap`,
    metaDescription: `Convert ${inst.name} PDF bank and credit card statements into certified QuickBooks Online (.QBO), Desktop Web Connect, and Excel. 100% balance reconciliation.`,
    heroH1: `Convert ${inst.name} PDF Statements to QuickBooks (.QBO) & Excel in Seconds`,
    heroSub: `Import historical ${inst.name} statements beyond the 90-day bank feed limit. Converts multi-page checking, savings, and card statements into certified Intuit Web Connect (.QBO) files with zero column mapping errors.`,
    features: [
      `Bypasses the ${inst.name} 90-day historical download limitation in QuickBooks`,
      `Certified ${inst.name} Intuit FID block (<INTU.BID>${inst.bid}</INTU.BID>) prevents Error OL-222`,
      `Extracts embedded check numbers and check image sub-tables accurately`,
      `Automated penny-level mathematical reconciliation (Opening + Credits - Debits = Closing Balance)`
    ],
    stepGuide: {
      title: `How to Import ${inst.name} PDF Statements into QuickBooks Online & Desktop`,
      steps: [
        {
          num: 1,
          title: `Upload ${inst.name} PDF Statement`,
          desc: `Drag and drop your monthly ${inst.name} statement PDF into the converter above. 1 free statement included.`
        },
        {
          num: 2,
          title: `Instant In-Memory Balance Reconciliation`,
          desc: `LedgerSnap verifies that Opening Balance + Credits - Debits matches Closing Balance to the exact penny.`
        },
        {
          num: 3,
          title: `Import Direct to QuickBooks`,
          desc: `Download your certified .QBO file. In QuickBooks Online, click Banking > Upload from file, and match it to your ${inst.name} account.`
        }
      ]
    },
    mappingPreview: [
      { field: 'Date', raw: inst.dateFormatExample, qboTag: '<DTPOSTED>20261016120000[0:GMT]', qbBehavior: 'Preserved at Noon GMT so US timezones never shift transaction calendar day' },
      { field: 'Check Number', raw: inst.checkNumPattern, qboTag: isCreditCard ? 'N/A' : '<CHECKNUM>1042', qbBehavior: 'Maps to QuickBooks Check # column' },
      { field: 'Institution ID', raw: `${inst.name} (<INTU.BID>${inst.bid})`, qboTag: `<FI><ORG>${inst.org}</ORG><FID>${inst.fid}</FID></FI><INTU.BID>${inst.bid}</INTU.BID>`, qbBehavior: 'Eliminates QuickBooks Web Connect Error OL-222 & OL-301' },
      { field: 'Payee / Description', raw: 'POS DEBIT VISA *4412 AMZN Mktp US*...', qboTag: '<NAME>Amazon Marketplace', qbBehavior: 'Clean 32-char payee inside <NAME>, full raw bank string in <MEMO>' },
      { field: 'Sign Convention', raw: isCreditCard ? 'Charge listed positive on PDF' : 'Withdrawal listed in Debit column', qboTag: isCreditCard ? '<TRNAMT>-85.00 (DEBIT)' : '<TRNAMT>-85.00 (DEBIT)', qbBehavior: 'Strict Intuit liability rules: purchases are negative, payments positive' }
    ],
    faqs
  };
}

export const SEO_BANKS = US_INSTITUTIONS.map(generateBankLandingConfig);

export function findBankBySlug(slug = '') {
  const clean = String(slug || '').trim().replace(/\/$/, '').toLowerCase();
  for (const b of SEO_BANKS) {
    if (b.slug === clean) return b;
    if (b.aliases && b.aliases.includes(clean)) return b;
    // Check pattern matching e.g. /convert/chase-statement-to-qbo, /convert/chase-pdf-to-quickbooks-online, /convert/chase-pdf-to-csv
    if (clean === `${b.id}-statement-to-qbo` || clean === `${b.id}-pdf-to-quickbooks-online` || clean === `${b.id}-pdf-to-csv` || clean === `${b.id}-pdf-to-qbo`) {
      return b;
    }
  }
  return null;
}
