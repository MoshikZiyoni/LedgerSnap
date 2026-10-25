#!/usr/bin/env node

/**
 * LedgerSnap 24/7 Automated Reddit Lead Hunter (V3 - High Availability & Intent Matcher)
 * Monitors US accounting, bookkeeping, and small business discussions across Reddit.
 * Features multi-gateway failover (rss2json + feed2json), wide sub coverage, and zero duplicate spam.
 * 
 * Usage:
 *   node scripts/growth/reddit-lead-hunter.mjs               (Normal scan, alerts on new leads)
 *   node scripts/growth/reddit-lead-hunter.mjs --max 5       (Alert up to 5 leads)
 *   node scripts/growth/reddit-lead-hunter.mjs --show-recent 3 (Always deliver top 3 recent leads)
 *   node scripts/growth/reddit-lead-hunter.mjs --force       (Force deliver top leads even if logged)
 *   node scripts/growth/reddit-lead-hunter.mjs --test-sample (Send a realistic mock lead)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const LEADS_LOG_PATH = path.join(__dirname, 'leads-log.json');

// Auto-load .env file if present
function loadEnv() {
  const envCandidates = [
    path.join(REPO_ROOT, '.env'),
    path.join(REPO_ROOT, 'scripts', 'growth', '.env'),
    path.join(REPO_ROOT, 'backend', '.env')
  ];
  for (const p of envCandidates) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [k, ...vals] = trimmed.split('=');
            const val = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[k.trim()]) {
              process.env[k.trim()] = val;
            }
          }
        }
      } catch {}
    }
  }
}
loadEnv();

// Max age threshold for leads (posts older than this are strictly discarded)
const DEFAULT_MAX_LEAD_AGE_HOURS = 48;

// High-intent search feeds across US accounting, bookkeeping & small business communities (strictly sorted by new)
const SEARCH_TARGETS = [
  'https://www.reddit.com/r/Bookkeeping/search.rss?q=statement&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/QuickBooks/search.rss?q=statement&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/Bookkeeping/search.rss?q=pdf&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/QuickBooks/search.rss?q=pdf&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/Bookkeeping/search.rss?q=qbo&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/QuickBooks/search.rss?q=qbo&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/QuickBooks/search.rss?q=import&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/QuickBooks/search.rss?q=bank+feed&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/QuickBooks/search.rss?q=web+connect&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/Bookkeeping/search.rss?q=import&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/Bookkeeping/search.rss?q=reconcil&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/Accounting/search.rss?q=statement+pdf&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/Accounting/search.rss?q=quickbooks&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/smallbusiness/search.rss?q=quickbooks+statement&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/smallbusiness/search.rss?q=bank+statement+pdf&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/tax/search.rss?q=quickbooks+statement&restrict_sr=1&sort=new&t=week',
  'https://www.reddit.com/r/Bookkeeping/new.rss',
  'https://www.reddit.com/r/QuickBooks/new.rss',
  'https://www.reddit.com/r/Accounting/new.rss',
  'https://www.reddit.com/r/smallbusiness/new.rss'
];

// Bank to URL slug mapping for targeted landing page linking
const BANK_SLUG_MAP = [
  { keywords: ['chase', 'jpmorgan'], slug: 'chase-pdf-to-qbo', name: 'Chase' },
  { keywords: ['bofa', 'bank of america', 'boa'], slug: 'bank-of-america-pdf-to-qbo', name: 'Bank of America' },
  { keywords: ['wells fargo', 'wellsfargo', 'wells'], slug: 'wells-fargo-pdf-to-qbo', name: 'Wells Fargo' },
  { keywords: ['citi', 'citibank'], slug: 'citibank-pdf-to-qbo', name: 'Citibank' },
  { keywords: ['capital one', 'cap one', 'capitalone'], slug: 'capital-one-pdf-to-qbo', name: 'Capital One' },
  { keywords: ['amex', 'american express'], slug: 'american-express-pdf-to-qbo', name: 'American Express' },
  { keywords: ['mercury', 'mercury bank'], slug: 'mercury-bank-pdf-to-qbo', name: 'Mercury' },
  { keywords: ['td bank', 'toronto-dominion'], slug: 'td-bank-pdf-to-qbo', name: 'TD Bank' },
  { keywords: ['pnc', 'pnc bank'], slug: 'pnc-bank-pdf-to-qbo', name: 'PNC Bank' },
  { keywords: ['us bank', 'u.s. bank'], slug: 'us-bank-pdf-to-qbo', name: 'U.S. Bank' }
];

// Pain point taxonomy (flexible regex that catches multi-word patterns in any order)
const PAIN_PATTERNS = [
  {
    category: 'PDF to QuickBooks / QBO / CSV Conversion',
    test: (text) => {
      const t = text.toLowerCase();
      const hasPdf = t.includes('pdf');
      const hasStatement = t.includes('statement');
      const hasQb = t.includes('quickbooks') || t.includes('qbo') || t.includes('qbd') || t.includes('excel') || t.includes('csv');
      const hasAction = t.includes('convert') || t.includes('import') || t.includes('transcribe') || t.includes('extract') || t.includes('enter') || t.includes('mapping');
      return (hasPdf && hasStatement) || (hasStatement && hasQb && hasAction) || (hasPdf && hasQb);
    }
  },
  {
    category: 'Catch-up / Clean-up Bookkeeping & Backlog',
    test: (text) => {
      const t = text.toLowerCase();
      return t.includes('catch-up') || t.includes('catch up') || t.includes('clean-up') || 
             t.includes('cleanup') || t.includes('backlog') || t.includes('months of statement') || 
             t.includes('reconcil') || t.includes('beginning balance') || t.includes('opening balance') ||
             t.includes('historical statement') || t.includes('old statement');
    }
  },
  {
    category: 'Competitor Frustrations (DocuClipper / MoneyThumb / Dext)',
    test: (text) => {
      const t = text.toLowerCase();
      return t.includes('docuclipper') || t.includes('moneythumb') || t.includes('dext') || 
             t.includes('autoentry') || t.includes('properconvert') || t.includes('hubdoc');
    }
  },
  {
    category: 'QuickBooks Web Connect / Bank Feed Errors (OL-222 / 324 / 106)',
    test: (text) => {
      const t = text.toLowerCase();
      return t.includes('ol-222') || t.includes('ol222') || t.includes('ol-301') || 
             t.includes('web connect') || t.includes('bank feed') || t.includes('column mapping') ||
             t.includes('error 324') || t.includes('error 106') || t.includes('bank disconnected') ||
             t.includes('manual bank statement');
    }
  }
];

// Load existing leads log for deduplication
export function loadLeadsLog() {
  try {
    if (fs.existsSync(LEADS_LOG_PATH)) {
      const data = fs.readFileSync(LEADS_LOG_PATH, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.warn(`[Warning] Could not read leads log: ${err.message}`);
  }
  return [];
}

// Save updated leads log
export function saveLeadsLog(leads) {
  try {
    fs.writeFileSync(LEADS_LOG_PATH, JSON.stringify(leads, null, 2), 'utf8');
    console.log(`[Storage] Saved ${leads.length} total leads to ${LEADS_LOG_PATH}`);
  } catch (err) {
    console.error(`[Error] Failed to save leads log:`, err.message);
  }
}

// Clean HTML tags and entities
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fetch Reddit feed using Multi-Gateway Failover (rss2json -> feed2json)
async function fetchFeed(url) {
  // Strategy 1: High-availability rss2json gateway
  try {
    const gatewayUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url);
    const res = await fetch(gatewayUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        return data.items.map(item => ({
          id: item.guid || item.link,
          title: cleanHtml(item.title),
          content: cleanHtml(item.description || item.content),
          url: item.link,
          published: new Date(item.pubDate || Date.now()),
          author: (item.author || '').replace('/u/', '').trim() || 'reddit_user',
          subreddit: (item.link.match(/\/r\/([^/]+)\//) || [])[1] || 'accounting'
        }));
      }
    }
  } catch {}

  // Strategy 2: feed2json.org failover
  try {
    const gatewayUrl = 'https://feed2json.org/convert?url=' + encodeURIComponent(url);
    const res = await fetch(gatewayUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        return data.items.map(item => ({
          id: item.id || item.url,
          title: cleanHtml(item.title),
          content: cleanHtml(item.content_html || item.content_text),
          url: item.url,
          published: new Date(item.date_published || Date.now()),
          author: item.authors?.[0]?.name?.replace('/u/', '').trim() || 'reddit_user',
          subreddit: (item.url?.match(/\/r\/([^/]+)\//) || [])[1] || 'accounting'
        }));
      }
    }
  } catch {}

  return [];
}

// Analyze post and match pain points
export function analyzePost(post) {
  const fullText = `${post.title} ${post.content}`;
  const matchedPains = [];

  for (const pain of PAIN_PATTERNS) {
    if (pain.test(fullText)) {
      matchedPains.push(pain.category);
    }
  }

  // Detect bank
  let matchedBank = null;
  const lower = fullText.toLowerCase();
  for (const b of BANK_SLUG_MAP) {
    if (b.keywords.some(kw => lower.includes(kw))) {
      matchedBank = b;
      break;
    }
  }

  // Detect specific triggers
  const isOl222 = /ol[- ]?222|error 106|error 324/i.test(fullText);
  const isDocuclipper = /docuclipper/i.test(lower);
  const isMoneythumb = /moneythumb/i.test(lower);

  // Target conversion link
  let targetUrl = 'https://ledger-snap.com/';
  if (isOl222) {
    targetUrl = 'https://ledger-snap.com/guides/how-to-fix-quickbooks-web-connect-error-ol-222';
  } else if (isDocuclipper) {
    targetUrl = 'https://ledger-snap.com/compare/ledgersnap-vs-docuclipper';
  } else if (isMoneythumb) {
    targetUrl = 'https://ledger-snap.com/compare/ledgersnap-vs-moneythumb';
  } else if (matchedBank) {
    targetUrl = `https://ledger-snap.com/convert/${matchedBank.slug}`;
  }

  return {
    isMatch: matchedPains.length > 0,
    matchedPains,
    matchedBank,
    targetUrl
  };
}

// Generate tailored, non-spammy, high-value draft reply
export function generateReplyDraft(post, analysis) {
  const { matchedPains, matchedBank, targetUrl } = analysis;
  const isOl222 = matchedPains.some(p => p.includes('Error'));
  const isCompetitor = matchedPains.some(p => p.includes('Competitor'));
  const isCatchup = matchedPains.some(p => p.includes('Clean-up'));

  let technicalAdvice = '';

  if (isOl222) {
    technicalAdvice = `QuickBooks Web Connect errors (like OL-222, OL-301, or bank feed sync drops) usually happen because of one of two issues in the file header:
1. **Invalid INTU.BID tag**: QuickBooks Desktop and Online require an authorized Financial Institution ID tag (<INTU.BID>3000</INTU.BID> or the certified bank FID). If Intuit doesn't recognize the FID, it halts the import immediately.
2. **Unescaped characters in payee text**: Ampersands (&) or special symbols in transaction descriptions without proper XML entity escaping (e.g., "AT&T" instead of "AT&amp;T") corrupt the OFX 200 XML parser.

You can open the .QBO file in VS Code or Notepad to verify the <OFXHEADER>200</OFXHEADER> and check that every <STMTTRN> has valid opening/closing tags.`;
  } else if (isCompetitor) {
    technicalAdvice = `A major pain point with tools like DocuClipper or MoneyThumb during clean-up jobs is per-page pricing meters running out mid-statement, plus OCR column drift:
When statements have multi-line payee memos or check images, generic OCR tools often split a single transaction into two rows, throwing the account reconciliation completely out of balance.

Always ensure whatever conversion method you use verifies the mathematical balance checksum (**Opening Balance + Deposits - Withdrawals = Closing Balance**) before you import into your GL.`;
  } else if (isCatchup) {
    technicalAdvice = `For catch-up and historical clean-up bookkeeping, definitely avoid standard CSV mapping. CSV imports frequently cause:
- Inverted debit/credit signs
- Inconsistent date formats (MM/DD vs DD/MM) that scramble chronology
- Zero deduplication protection in QuickBooks

Instead, convert statements into **native Intuit .QBO (OFX 200) Web Connect format**. QuickBooks handles .QBO as an authenticated direct feed: each row receives a unique <FITID> cryptographic transaction hash, which completely stops duplicate transactions from importing across overlapping monthly statement batches.

Also verify the mathematical checksum (*Opening Balance + Credits - Debits = Closing Balance*) before importing to ensure penny-level accuracy.`;
  } else {
    technicalAdvice = `If you're dealing with client PDF bank statements for QuickBooks, stick with **native Intuit .QBO (OFX 200) Web Connect files** rather than CSV.

With CSV, QuickBooks forces manual column mapping on every batch and often scrambles debit/credit signs or truncates multi-line check memos. With .QBO, QuickBooks maps the register automatically, assigns unique transaction IDs (<FITID>) to prevent duplicate rows, and preserves running balances.

Crucial tip: Make sure your conversion verifies the penny-level balance checksum (*Opening Balance + Credits - Debits = Closing Balance*) before you import into your GL.`;
  }

  const founderDisclosure = `Full disclosure: I built a zero-retention PDF-to-QBO web tool at [${targetUrl.replace('https://', '')}](${targetUrl}) that verifies the math checksum and wipes RAM immediately—first statement is free with no card.`;

  return `${technicalAdvice}\n\n${founderDisclosure}`;
}

// Send instant notification via Telegram
export async function sendTelegramAlert(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return false;

  const text = `🚨 <b>New High-Intent Accounting Lead on Reddit!</b>\n\n` +
    `📌 <b>Title:</b> ${lead.title}\n` +
    `👤 <b>Author:</b> /u/${lead.author} (r/${lead.subreddit})\n` +
    `🔗 <b>Thread:</b> <a href="${lead.url}">${lead.url}</a>\n` +
    `🎯 <b>Matched Pain:</b> ${lead.matchedPains.join(', ')}\n\n` +
    `💬 <b>Ready-to-Copy Value Reply:</b>\n` +
    `<code>${lead.draft.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });
    return res.ok;
  } catch (err) {
    console.error(`[Telegram Error] Failed to send alert:`, err.message);
    return false;
  }
}

// Generate realistic mock sample leads for test mode
function getTestSampleLeads() {
  return [
    {
      id: 'test_sample_chase_cleanup',
      title: 'Need to convert 12 months of Chase PDF statements to QuickBooks Online. Best way?',
      content: 'Taking on a new client who has a year of backlog. Chase online only has PDFs available for older months. What is the cleanest way to convert them to QBO without manual CSV headaches?',
      url: 'https://www.reddit.com/r/Bookkeeping/comments/demo_chase_lead/',
      published: new Date(),
      author: 'cpa_pro_2026',
      subreddit: 'Bookkeeping'
    }
  ];
}

// Main execution flow
async function main() {
  console.log('='.repeat(70));
  console.log('🕵️  LedgerSnap 24/7 High-Performance Reddit Lead Hunter (V3)');
  console.log('='.repeat(70));

  const args = process.argv.slice(2);
  const isTestSample = args.includes('--test-sample');
  const isForce = args.includes('--force');
  const showRecentIndex = args.indexOf('--show-recent');
  const showRecentCount = showRecentIndex !== -1 ? parseInt(args[showRecentIndex + 1], 10) : 0;
  const maxAlertsIndex = args.indexOf('--max');
  const maxAlerts = maxAlertsIndex !== -1 ? parseInt(args[maxAlertsIndex + 1], 10) : 5;
  const maxAgeIndex = args.indexOf('--max-age');
  const maxAgeHours = maxAgeIndex !== -1 ? parseFloat(args[maxAgeIndex + 1]) : DEFAULT_MAX_LEAD_AGE_HOURS;

  const existingLeads = loadLeadsLog();
  const existingIds = new Set(existingLeads.map(l => l.id || l.url));

  let rawPosts = [];

  if (isTestSample) {
    console.log('[Test Mode] Loading realistic mock test sample threads...');
    rawPosts = getTestSampleLeads();
  } else {
    console.log(`[Polling] Scanning ${SEARCH_TARGETS.length} high-intent Reddit feeds across Accounting, Bookkeeping & Small Business (Max age: ${maxAgeHours}h)...`);
    for (const targetUrl of SEARCH_TARGETS) {
      const items = await fetchFeed(targetUrl);
      if (items.length > 0) {
        const shortName = targetUrl.split('?')[0].replace('https://www.reddit.com', '');
        console.log(`   ✓ Found ${items.length} items from ${shortName}`);
        rawPosts.push(...items);
      }
      await new Promise(r => setTimeout(r, 250));
    }
  }

  // Deduplicate raw posts by ID/URL
  const uniquePosts = [];
  const seenInBatch = new Set();
  for (const post of rawPosts) {
    if (!seenInBatch.has(post.id) && !seenInBatch.has(post.url)) {
      seenInBatch.add(post.id);
      seenInBatch.add(post.url);
      uniquePosts.push(post);
    }
  }

  // Sort newest first
  uniquePosts.sort((a, b) => b.published - a.published);

  console.log(`[Batch] Total unique threads scanned: ${uniquePosts.length}`);

  let newMatchingLeadsCount = 0;
  const currentRunMatches = [];

  for (const post of uniquePosts) {
    // Strictly filter out posts older than maxAgeHours (unless test sample)
    const postDate = new Date(post.published);
    const postTime = isNaN(postDate.getTime()) ? Date.now() : postDate.getTime();
    const postAgeHours = (Date.now() - postTime) / (1000 * 60 * 60);

    if (!isTestSample && postAgeHours > maxAgeHours) {
      continue;
    }

    // Analyze post content for high-intent bookkeeping pain points
    const analysis = analyzePost(post);
    if (!analysis.isMatch) {
      continue;
    }

    const replyDraft = generateReplyDraft(post, analysis);

    const leadRecord = {
      id: post.id,
      title: post.title,
      url: post.url,
      author: post.author,
      subreddit: post.subreddit,
      published: post.published.toISOString(),
      discoveredAt: new Date().toISOString(),
      matchedPains: analysis.matchedPains,
      targetUrl: analysis.targetUrl,
      draft: replyDraft,
      alertSent: false
    };

    currentRunMatches.push(leadRecord);

    // Check if already processed in prior runs
    if (existingIds.has(post.id) || existingIds.has(post.url)) {
      continue;
    }

    console.log('\n' + '-'.repeat(70));
    console.log(`🎯 NEW QUALIFIED US ACCOUNTING LEAD FOUND (${postAgeHours.toFixed(1)}h ago):`);
    console.log(`   • Title:     ${leadRecord.title}`);
    console.log(`   • Subreddit: r/${leadRecord.subreddit} (Author: /u/${leadRecord.author})`);
    console.log(`   • URL:       ${leadRecord.url}`);
    console.log(`   • Pain:      ${leadRecord.matchedPains.join(' | ')}`);
    console.log(`   • Target:    ${leadRecord.targetUrl}`);
    console.log('-'.repeat(70));

    // Send notifications to Telegram
    const telegramOk = await sendTelegramAlert(leadRecord);
    if (telegramOk) {
      leadRecord.alertSent = true;
      console.log(`🔔 Alert delivered to Telegram successfully!`);
    }

    existingLeads.unshift(leadRecord);
    existingIds.add(leadRecord.id);
    existingIds.add(leadRecord.url);
    newMatchingLeadsCount++;

    // Limit alerts per batch to prevent flooding Telegram
    if (newMatchingLeadsCount >= maxAlerts) {
      console.log(`[Batch Cap] Reached max alerts limit (${maxAlerts}) for this run.`);
      break;
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n[Summary] Discovered & delivered ${newMatchingLeadsCount} new qualified leads.`);

  // If no NEW leads were found, but the user requested --show-recent or --force:
  if (newMatchingLeadsCount === 0 && (showRecentCount > 0 || isForce)) {
    const deliveryCount = showRecentCount > 0 ? showRecentCount : 3;
    // Strictly filter candidates to only those published within the maxAgeHours window
    const freshExisting = existingLeads.filter(l => {
      const d = new Date(l.published).getTime();
      return !isNaN(d) && (Date.now() - d) / (1000 * 60 * 60) <= maxAgeHours;
    });
    const pool = currentRunMatches.length > 0 ? currentRunMatches : freshExisting;
    const leadsToShow = pool.slice(0, deliveryCount);

    if (leadsToShow.length > 0) {
      console.log(`\n[Interactive Mode] Delivering top ${leadsToShow.length} freshest active leads (last ${maxAgeHours}h) to Telegram...`);
      for (const lead of leadsToShow) {
        await sendTelegramAlert(lead);
        console.log(`   ✓ Delivered active lead: "${lead.title.substring(0, 50)}..."`);
        await new Promise(r => setTimeout(r, 800));
      }
    } else {
      console.log(`\n[Interactive Mode] No active leads found within the last ${maxAgeHours} hours. (Zero stale leads delivered)`);
    }
  }

  if (newMatchingLeadsCount > 0) {
    saveLeadsLog(existingLeads);
  } else {
    console.log(`[Summary] Total active leads stored in log: ${existingLeads.length}`);
  }
}

// Only execute when run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('[Fatal Lead Hunter Error]:', err);
    process.exit(1);
  });
}
