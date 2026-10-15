#!/usr/bin/env node

/**
 * LedgerSnap Instant Search Engine & AI Indexing Submitter
 * Submits all sitemap URLs to IndexNow (Bing, ChatGPT Search, Perplexity, Copilot)
 * 
 * Usage:
 *   node scripts/growth/indexnow-submit.mjs
 *   node scripts/growth/indexnow-submit.mjs --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

const HOST = 'ledger-snap.com';
const INDEXNOW_API_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEFAULT_KEY = 'e74b39b563604f25b29c98efcb5c290a';

// 1. Locate IndexNow Key
function getIndexNowKey() {
  if (process.env.INDEXNOW_KEY && process.env.INDEXNOW_KEY.trim()) {
    return process.env.INDEXNOW_KEY.trim();
  }

  // Look for static key file in public directories
  const candidateDirs = [
    path.join(REPO_ROOT, 'frontend', 'public'),
    path.join(REPO_ROOT, 'public')
  ];

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.txt') && file.length >= 16) {
          const keyCandidate = file.replace('.txt', '').trim();
          const content = fs.readFileSync(path.join(dir, file), 'utf8').trim();
          if (content === keyCandidate && /^[a-zA-Z0-9_-]+$/.test(keyCandidate)) {
            return keyCandidate;
          }
        }
      }
    }
  }

  return DEFAULT_KEY;
}

// 2. Locate and Read sitemap.xml
function getSitemapUrls() {
  const candidateSitemaps = [
    path.join(REPO_ROOT, 'frontend', 'public', 'sitemap.xml'),
    path.join(REPO_ROOT, 'public', 'sitemap.xml'),
    path.join(REPO_ROOT, 'sitemap.xml')
  ];

  let sitemapPath = null;
  for (const p of candidateSitemaps) {
    if (fs.existsSync(p)) {
      sitemapPath = p;
      break;
    }
  }

  if (!sitemapPath) {
    throw new Error(`Could not find sitemap.xml in any expected location: ${candidateSitemaps.join(', ')}`);
  }

  console.log(`[IndexNow] Reading sitemap from: ${sitemapPath}`);
  const xml = fs.readFileSync(sitemapPath, 'utf8');

  // Extract <loc> URLs
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    const url = match[1].trim();
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }

  if (urls.length === 0) {
    throw new Error(`No URLs extracted from sitemap at: ${sitemapPath}`);
  }

  return { urls, sitemapPath };
}

// 3. Main execution
async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('='.repeat(70));
  console.log('⚡ LedgerSnap Instant Search Engine & AI Indexing Submitter');
  console.log('='.repeat(70));

  const key = getIndexNowKey();
  const keyLocation = `https://${HOST}/${key}.txt`;
  const { urls, sitemapPath } = getSitemapUrls();

  // Categorize URLs for logging
  const homeUrls = urls.filter(u => u === `https://${HOST}/` || u === `https://${HOST}`);
  const convertUrls = urls.filter(u => u.includes('/convert/'));
  const compareUrls = urls.filter(u => u.includes('/compare/'));
  const guideUrls = urls.filter(u => u.includes('/guides/'));
  const otherUrls = urls.filter(u => !homeUrls.includes(u) && !convertUrls.includes(u) && !compareUrls.includes(u) && !guideUrls.includes(u));

  console.log(`[Config] Target Host:   ${HOST}`);
  console.log(`[Config] IndexNow Key:  ${key}`);
  console.log(`[Config] Key Location: ${keyLocation}`);
  console.log(`[Config] Total URLs:    ${urls.length}`);
  console.log(`         • Homepage:           ${homeUrls.length}`);
  console.log(`         • Bank Converters:    ${convertUrls.length}`);
  console.log(`         • Competitor Compare: ${compareUrls.length}`);
  console.log(`         • Technical Guides:   ${guideUrls.length}`);
  if (otherUrls.length > 0) {
    console.log(`         • Other URLs:         ${otherUrls.length}`);
  }
  console.log('-'.repeat(70));

  const payload = {
    host: HOST,
    key: key,
    keyLocation: keyLocation,
    urlList: urls
  };

  if (isDryRun) {
    console.log('[DRY-RUN] Would submit the following payload to IndexNow:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n[DRY-RUN] Completed without sending network request.');
    return;
  }

  console.log(`[IndexNow] Submitting ${urls.length} URLs to ${INDEXNOW_API_ENDPOINT}...`);

  try {
    const response = await fetch(INDEXNOW_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'LedgerSnap-IndexNow-Ping/1.0 (+https://ledger-snap.com)'
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    const responseText = await response.text();

    if (status === 200 || status === 202) {
      console.log(`\n✅ [IndexNow SUCCESS] HTTP ${status} OK / Accepted!`);
      console.log(`   ${urls.length} URLs successfully submitted for real-time indexing.`);
      console.log(`   Distributed instantly to:`);
      console.log(`   • Microsoft Bing Search`);
      console.log(`   • OpenAI ChatGPT Search`);
      console.log(`   • Perplexity AI`);
      console.log(`   • Microsoft Copilot`);
      console.log(`   • Naver & Seznam`);
    } else {
      console.error(`\n⚠️  [IndexNow Warning] HTTP ${status}`);
      console.error(`   Response body: ${responseText}`);
      if (status === 400) {
        console.error('   Hint: Check that the payload JSON format or URL list matches IndexNow requirements.');
      } else if (status === 403) {
        console.error(`   Hint: Key not found or keyLocation (${keyLocation}) does not match key.`);
      } else if (status === 422) {
        console.error('   Hint: In URLs list, ensure URLs belong to the host.');
      }
    }
  } catch (err) {
    console.error(`\n❌ [IndexNow Network Error]:`, err.message);
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('[IndexNow Fatal Error]:', err);
  process.exit(1);
});
