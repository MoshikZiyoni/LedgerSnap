#!/usr/bin/env node

/**
 * LedgerSnap Programmatic Bank-Specific YouTube Video Generator
 * Takes master demo video (ledgersnap-qbo-demo.mp4) and generates:
 * 1. Bank-specific video variants with intro/title overlays via ffmpeg
 * 2. Complete ready-to-paste YouTube SEO upload pack (youtube-upload-pack.md)
 * 3. Batch render scripts for Windows (.bat) and POSIX (.sh)
 * 
 * Top 10 US Banks Covered:
 * Chase, Bank of America, Wells Fargo, Citibank, Capital One,
 * American Express, Mercury, TD Bank, PNC Bank, U.S. Bank.
 * 
 * Usage:
 *   node scripts/growth/generate-bank-videos.mjs
 *   node scripts/growth/generate-bank-videos.mjs --render
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

const OUTPUT_DIR = path.join(__dirname, 'generated-videos');
const UPLOAD_PACK_PATH = path.join(__dirname, 'youtube-upload-pack.md');
const BATCH_SCRIPT_BAT = path.join(__dirname, 'render-bank-videos.bat');
const BATCH_SCRIPT_SH = path.join(__dirname, 'render-bank-videos.sh');

// Locate master demo video
function getMasterVideoPath() {
  const candidates = [
    path.join(REPO_ROOT, 'frontend', 'public', 'demo', 'ledgersnap-qbo-demo.mp4'),
    path.join(REPO_ROOT, 'public', 'demo', 'ledgersnap-qbo-demo.mp4')
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }

  return candidates[0]; // fallback
}

// Check ffmpeg availability
function checkFfmpeg() {
  try {
    const res = spawnSync('ffmpeg', ['-version'], { stdio: 'pipe', encoding: 'utf8' });
    return res.status === 0;
  } catch {
    return false;
  }
}

// Top 10 US Banks metadata definition
const TOP_10_BANKS = [
  {
    name: 'Chase',
    fullName: 'JPMorgan Chase Bank, N.A.',
    slug: 'chase-pdf-to-qbo',
    title: 'How to Convert Chase PDF Bank Statement to QuickBooks .QBO in 3 Seconds',
    shortDesc: 'Watch how to instantly convert Chase checking, savings, and credit card PDF statements into certified Intuit .QBO Web Connect format without manual CSV column mapping.',
    painPoint: 'Multi-line payee descriptions, floating check numbers, and daily ending balance reconciliation.',
    tags: [
      'convert chase pdf to qbo',
      'chase bank statement quickbooks',
      'import chase pdf into quickbooks online',
      'chase bank to quickbooks',
      'pdf to qbo converter',
      'quickbooks web connect chase',
      'chase business checking quickbooks',
      'convert pdf to quickbooks'
    ]
  },
  {
    name: 'Bank of America',
    fullName: 'Bank of America, N.A.',
    slug: 'bank-of-america-pdf-to-qbo',
    title: 'How to Convert Bank of America PDF Statement to QuickBooks Online .QBO',
    shortDesc: 'Learn how to convert Bank of America PDF bank statements into QuickBooks Online .QBO format. Fixes split debit/credit column issues and balances automatically.',
    painPoint: 'Dual-column debit/credit layouts, combined checking/savings statements, and electronic withdrawal codes.',
    tags: [
      'convert bank of america pdf to qbo',
      'bofa pdf to quickbooks',
      'bank of america statement into quickbooks online',
      'import bofa bank statement to qbo',
      'bank of america quickbooks error ol-222',
      'bofa pdf to excel converter',
      'clean up bofa bank statements quickbooks'
    ]
  },
  {
    name: 'Wells Fargo',
    fullName: 'Wells Fargo Bank, N.A.',
    slug: 'wells-fargo-pdf-to-qbo',
    title: 'How to Import Wells Fargo PDF Statements into QuickBooks Online & Desktop',
    shortDesc: 'Step-by-step tutorial on converting Wells Fargo PDF statements into native .QBO files with mathematical balance checksum validation.',
    painPoint: 'Multi-page activity summaries, check number alignment, and daily ledger balances.',
    tags: [
      'convert wells fargo pdf to qbo',
      'import wells fargo pdf statement quickbooks',
      'wells fargo to quickbooks online',
      'wells fargo qbo web connect',
      'convert wells fargo statement to excel',
      'wells fargo clean up bookkeeping'
    ]
  },
  {
    name: 'Citibank',
    fullName: 'Citibank, N.A.',
    slug: 'citibank-pdf-to-qbo',
    title: 'How to Convert Citibank PDF Bank Statement to QuickBooks .QBO',
    shortDesc: 'Instantly convert Citibank commercial checking and credit card PDF statements to QuickBooks Web Connect .QBO with zero data entry.',
    painPoint: 'Citi commercial statements, running ledger balance calculation, and international wire fee lines.',
    tags: [
      'convert citibank pdf to qbo',
      'citibank statement quickbooks',
      'import citi statement to quickbooks online',
      'citi bank qbo converter',
      'citibank credit card pdf to quickbooks'
    ]
  },
  {
    name: 'Capital One',
    fullName: 'Capital One, N.A.',
    slug: 'capital-one-pdf-to-qbo',
    title: 'How to Import Capital One PDF Statements into QuickBooks Online (No Errors)',
    shortDesc: 'How to convert Capital One Spark Business and 360 checking PDF statements into clean .QBO files that import on the first try.',
    painPoint: 'Spark business statements, rewards balance credits, and fee breakdown lines.',
    tags: [
      'convert capital one pdf to qbo',
      'capital one spark statement quickbooks',
      'import capital one pdf into quickbooks',
      'capital one qbo converter',
      'capital one statement to excel'
    ]
  },
  {
    name: 'American Express',
    fullName: 'American Express National Bank',
    slug: 'american-express-pdf-to-qbo',
    title: 'How to Convert Amex PDF Statements to QuickBooks (.QBO OFX Format)',
    shortDesc: 'Convert complex American Express PDF credit card statements with multiple employee sub-cards into QuickBooks .QBO format seamlessly.',
    painPoint: 'Multiple cardholder employee subtables, foreign exchange adjustments, and payment credit lines.',
    tags: [
      'convert amex pdf to qbo',
      'american express pdf statement to quickbooks',
      'import amex to quickbooks online',
      'amex multi cardholder pdf to excel',
      'american express web connect qbo'
    ]
  },
  {
    name: 'Mercury',
    fullName: 'Mercury Technologies / Choice Financial Group',
    slug: 'mercury-bank-pdf-to-qbo',
    title: 'How to Import Mercury Bank Statements into QuickBooks Online with Math Checksum',
    shortDesc: 'The fastest way for tech startups and agencies to convert Mercury Bank PDF statements into QuickBooks .QBO files with 100% balance checksum verification.',
    painPoint: 'Startup treasury accounts, multi-currency transactions, and Stripe/ACH bulk payouts.',
    tags: [
      'convert mercury bank pdf to qbo',
      'mercury bank quickbooks online',
      'import mercury statement to quickbooks',
      'mercury banking qbo converter',
      'mercury pdf to csv quickbooks'
    ]
  },
  {
    name: 'TD Bank',
    fullName: 'TD Bank, N.A.',
    slug: 'td-bank-pdf-to-qbo',
    title: 'How to Convert TD Bank PDF Statements to QuickBooks .QBO in Seconds',
    shortDesc: 'Effortlessly turn TD Bank PDF checking and savings statements into QuickBooks Web Connect .QBO files with no column mapping mistakes.',
    painPoint: 'East Coast small business checking, daily ledger balances, and overdraft transfer lines.',
    tags: [
      'convert td bank pdf to qbo',
      'td bank statement to quickbooks online',
      'import td bank pdf into quickbooks',
      'td bank qbo converter',
      'td bank statement to excel'
    ]
  },
  {
    name: 'PNC Bank',
    fullName: 'PNC Bank, N.A.',
    slug: 'pnc-bank-pdf-to-qbo',
    title: 'How to Import PNC Bank PDF Statements into QuickBooks Online & Desktop',
    shortDesc: 'Guide to converting PNC Bank Virtual Wallet and Business Checking PDF statements into native Intuit .QBO Web Connect format.',
    painPoint: 'Pinnacle treasury statements, virtual wallet bucket transactions, and checks paid summaries.',
    tags: [
      'convert pnc bank pdf to qbo',
      'pnc bank statement quickbooks',
      'import pnc pdf into quickbooks online',
      'pnc bank to qbo converter',
      'pnc checking statement into excel'
    ]
  },
  {
    name: 'U.S. Bank',
    fullName: 'U.S. Bank National Association',
    slug: 'us-bank-pdf-to-qbo',
    title: 'How to Convert U.S. Bank PDF Statement to QuickBooks .QBO Without Mapping',
    shortDesc: 'Step-by-step tutorial on turning U.S. Bank PDF statements into QuickBooks .QBO files that automatically map to your bank register.',
    painPoint: 'Commercial checking layouts, multi-account summaries, and standard OFX FID tags.',
    tags: [
      'convert us bank pdf to qbo',
      'u.s. bank statement to quickbooks',
      'import us bank pdf into quickbooks online',
      'us bank qbo converter',
      'us bank statement to excel'
    ]
  }
];

// Generate YouTube description with timestamps and links
function generateDescription(bank) {
  return `${bank.title}

Convert your official ${bank.name} PDF bank statements into certified Intuit QuickBooks (.QBO) Web Connect and Excel format in under 3 seconds:
👉 Convert your ${bank.name} PDF free: https://ledger-snap.com/convert/${bank.slug}

Why manual CSV mapping and standard OCR converters fail for ${bank.name}:
Generic tools frequently trigger broken column alignments, inverted debits/credits, or Intuit error OL-222. LedgerSnap uses pre-tuned algorithms engineered specifically for ${bank.name} (${bank.painPoint}).

Every extracted transaction row is mathematically reconciled against your statement's opening and closing balance before export:
Opening Balance + Deposits - Withdrawals = Closing Balance.

⏱️ VIDEO CHAPTERS / TIMESTAMPS:
0:00 - Why CSV column mapping fails for ${bank.name} statements
0:15 - Downloading your official ${bank.name} PDF statement
0:32 - 1-Click conversion into Intuit .QBO Web Connect
0:55 - Automatic balance checksum verification (Opening + Credits - Debits = Closing)
1:20 - Direct 1-click import into QuickBooks Online & Desktop register
1:45 - Ephemeral in-memory RAM processing (Zero data retention)

🔒 SECURITY & PRIVACY GUARANTEE:
• Ephemeral RAM processing—zero statement logs saved to disk
• 256-bit client-side and TLS encryption
• Certified Intuit OFX 200 format with INTU.BID authentication
• 100% compliant with GAAP and CPA reconciliation standards

Convert your first ${bank.name} statement completely free (no credit card required):
🌐 https://ledger-snap.com/convert/${bank.slug}

#${bank.name.replace(/[^a-zA-Z0-9]/g, '')} #QuickBooks #Bookkeeping #PDFtoQBO #AccountingAutomation #LedgerSnap`;
}

// Generate YouTube upload pack markdown
function generateUploadPackMarkdown(banks) {
  let md = `# 🎬 LedgerSnap YouTube Video SEO & Upload Pack
> Ready-to-copy metadata, titles, descriptions with timestamps, tags, and YouTube Data API v3 JSON payloads for the Top 10 US Banks.

## 📊 Quick Reference Table

| # | Bank | YouTube Video Title | Landing Page URL | Tags Count |
|---|------|---------------------|------------------|------------|
`;

  banks.forEach((b, i) => {
    md += `| ${i + 1} | **${b.name}** | [${b.title}](#${b.slug}) | [${b.slug}](https://ledger-snap.com/convert/${b.slug}) | ${b.tags.length} tags |\n`;
  });

  md += `\n---\n\n`;

  banks.forEach((b, i) => {
    const desc = generateDescription(b);
    const apiPayload = {
      snippet: {
        title: b.title,
        description: desc,
        tags: b.tags,
        categoryId: '27', // Education
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en'
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false
      }
    };

    md += `## <a id="${b.slug}"></a> ${i + 1}. ${b.name} (${b.fullName})

### 🏷️ YouTube Title (High CTR & Exact Match Search)
\`\`\`text
${b.title}
\`\`\`

### 🔗 Target Converter Landing Page
[https://ledger-snap.com/convert/${b.slug}](https://ledger-snap.com/convert/${b.slug})

### 📝 YouTube Video Description (Copy & Paste)
\`\`\`markdown
${desc}
\`\`\`

### 🏷️ YouTube Tags (Comma-Separated for YouTube Studio)
\`\`\`text
${b.tags.join(', ')}
\`\`\`

### ⚡ YouTube Data API v3 JSON Payload
\`\`\`json
${JSON.stringify(apiPayload, null, 2)}
\`\`\`

---
`;
  });

  return md;
}

// Generate ffmpeg command for a given bank
function buildFfmpegCommand(masterVideo, bank, outputVideo) {
  // Escaping for drawtext
  const cleanBankName = bank.name.replace(/'/g, "\\'");
  const cleanSlug = bank.slug;

  // Filter complex:
  // Adds a stylish high-contrast lower-third / title pill during the first 6 seconds
  const filter = `drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='${cleanBankName} Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100% Math Checksum Verified • ledger-snap.com/convert/${cleanSlug}':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'`;

  return {
    command: 'ffmpeg',
    args: [
      '-y',
      '-i', masterVideo,
      '-vf', filter,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '20',
      '-c:a', 'copy',
      outputVideo
    ]
  };
}

// Generate batch scripts (.bat and .sh) for rendering
function generateBatchScripts(masterVideo, banks) {
  // Windows Batch script (.bat)
  let batContent = `@echo off\r\nREM LedgerSnap Bank-Specific YouTube Video Generator\r\necho ====================================================\r\necho 🎬 Rendering 10 Bank-Specific Demo Video Variants\r\necho ====================================================\r\n\r\nif not exist "${OUTPUT_DIR}" mkdir "${OUTPUT_DIR}"\r\n\r\n`;

  // POSIX Bash script (.sh)
  let shContent = `#!/usr/bin/env bash\n# LedgerSnap Bank-Specific YouTube Video Generator\nset -e\necho "===================================================="\necho "🎬 Rendering 10 Bank-Specific Demo Video Variants"\necho "===================================================="\n\nmkdir -p "${OUTPUT_DIR}"\n\n`;

  for (const b of banks) {
    const outFileBat = `"${path.join(OUTPUT_DIR, `${b.slug}-demo.mp4`)}"`;
    const outFileSh = `"${path.join(OUTPUT_DIR, `${b.slug}-demo.mp4`).replace(/\\/g, '/')}"`;
    const masterBat = `"${masterVideo}"`;
    const masterSh = `"${masterVideo.replace(/\\/g, '/')}"`;

    const filterText = `drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='${b.name} Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100%% Math Checksum Verified * ledger-snap.com/convert/${b.slug}':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'`;
    const filterTextSh = `drawbox=y=30:color=black@0.75:width=iw:height=120:enable='between(t,0,6)',drawtext=text='${b.name} Statement to QuickBooks .QBO':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=48:enable='between(t,0,6)',drawtext=text='100% Math Checksum Verified • ledger-snap.com/convert/${b.slug}':fontcolor=0x38bdf8:fontsize=22:x=(w-text_w)/2:y=102:enable='between(t,0,6)'`;

    batContent += `echo Rendering ${b.name} variant...\r\nffmpeg -y -i ${masterBat} -vf "${filterText}" -c:v libx264 -preset fast -crf 20 -c:a copy ${outFileBat}\r\n\r\n`;
    shContent += `echo "Rendering ${b.name} variant..."\nffmpeg -y -i ${masterSh} -vf "${filterTextSh}" -c:v libx264 -preset fast -crf 20 -c:a copy ${outFileSh}\n\n`;
  }

  batContent += `echo All 10 bank video variants rendered successfully into ${OUTPUT_DIR}!\r\npause\r\n`;
  shContent += `echo "All 10 bank video variants rendered successfully into ${OUTPUT_DIR}!"\n`;

  fs.writeFileSync(BATCH_SCRIPT_BAT, batContent, 'utf8');
  fs.writeFileSync(BATCH_SCRIPT_SH, shContent, 'utf8');
}

// Main execution
async function main() {
  console.log('='.repeat(70));
  console.log('🎬 LedgerSnap Programmatic YouTube Video & Upload Pack Generator');
  console.log('='.repeat(70));

  const shouldRender = process.argv.includes('--render');
  const masterVideo = getMasterVideoPath();

  console.log(`[Input] Master Video:   ${masterVideo}`);
  if (!fs.existsSync(masterVideo)) {
    console.warn(`[Warning] Master demo video file not found at: ${masterVideo}`);
  } else {
    const stats = fs.statSync(masterVideo);
    console.log(`        Size:           ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Generate YouTube upload pack markdown
  console.log(`[Pack] Generating YouTube upload pack markdown...`);
  const markdown = generateUploadPackMarkdown(TOP_10_BANKS);
  fs.writeFileSync(UPLOAD_PACK_PATH, markdown, 'utf8');
  console.log(`✅ [Pack] Written: ${UPLOAD_PACK_PATH}`);

  // 2. Generate batch render scripts (.bat and .sh)
  console.log(`[Render] Generating batch render scripts...`);
  generateBatchScripts(masterVideo, TOP_10_BANKS);
  console.log(`✅ [Render] Windows Script: ${BATCH_SCRIPT_BAT}`);
  console.log(`✅ [Render] POSIX Script:   ${BATCH_SCRIPT_SH}`);

  // 3. Check for ffmpeg and optionally render
  const hasFfmpeg = checkFfmpeg();
  console.log(`[ffmpeg] Available in system PATH: ${hasFfmpeg ? 'YES' : 'NO'}`);

  if (hasFfmpeg && (shouldRender || process.argv.includes('--run'))) {
    console.log(`\n🚀 Rendering ${TOP_10_BANKS.length} bank-specific video variants...`);
    for (const bank of TOP_10_BANKS) {
      const outputVideo = path.join(OUTPUT_DIR, `${bank.slug}-demo.mp4`);
      console.log(`   • Rendering ${bank.name} -> ${path.basename(outputVideo)}`);
      const { command, args } = buildFfmpegCommand(masterVideo, bank, outputVideo);
      const res = spawnSync(command, args, { stdio: 'inherit' });
      if (res.status === 0) {
        console.log(`     ✅ Complete: ${outputVideo}`);
      } else {
        console.error(`     ❌ Failed to render ${bank.name}`);
      }
    }
  } else if (!hasFfmpeg) {
    console.log(`\nℹ️  [Note] ffmpeg is not currently installed in system PATH.`);
    console.log(`   The video rendering pipeline scripts have been generated:`);
    console.log(`   • Run "scripts\\growth\\render-bank-videos.bat" on any machine with ffmpeg installed`);
    console.log(`   • Or run in GitHub Actions / Docker using standard ffmpeg image.`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ All 10 US Bank YouTube video metadata & render pipelines generated!');
  console.log(`   • Metadata Table: scripts/growth/youtube-upload-pack.md`);
  console.log(`   • Batch Render:   scripts/growth/render-bank-videos.bat`);
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('[Fatal Video Generator Error]:', err);
  process.exit(1);
});
