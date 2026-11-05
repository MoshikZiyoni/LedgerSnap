#!/usr/bin/env node

/**
 * Automated Public Deployment for LedgerSnap Satellite Authority Network
 * Deploys all satellite microsites directly to GitHub Pages (Domain Authority 96)
 * completely automatically without human intervention.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const SATELLITES_DIR = path.join(REPO_ROOT, 'satellites');
const STAGING_DIR = path.join(REPO_ROOT, '.temp-satellite-deploy');

console.log('='.repeat(70));
console.log('🚀 LedgerSnap Autonomous Satellite Site Deployer (GitHub Pages Live Host)');
console.log('='.repeat(70));

try {
  // 1. Clean staging directory
  if (fs.existsSync(STAGING_DIR)) {
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  // 2. Prepare Directory Structure
  // Satellite 1: Root portal (Review Hub)
  const hubSrc = path.join(SATELLITES_DIR, 'qbo-review-hub', 'index.html');
  fs.copyFileSync(hubSrc, path.join(STAGING_DIR, 'index.html'));

  // Satellite 2: /error-ol222
  const ol222Dir = path.join(STAGING_DIR, 'error-ol222');
  fs.mkdirSync(ol222Dir, { recursive: true });
  fs.copyFileSync(
    path.join(SATELLITES_DIR, 'quickbooks-ol222-solver', 'index.html'),
    path.join(ol222Dir, 'index.html')
  );

  // Satellite 3: /free-excel
  const excelDir = path.join(STAGING_DIR, 'free-excel');
  fs.mkdirSync(excelDir, { recursive: true });
  fs.copyFileSync(
    path.join(SATELLITES_DIR, 'free-statement-to-excel', 'index.html'),
    path.join(excelDir, 'index.html')
  );

  // Add .nojekyll so GitHub Pages does not ignore underscore files
  fs.writeFileSync(path.join(STAGING_DIR, '.nojekyll'), '');

  // Add sitemap & robots.txt for GitHub Pages
  fs.writeFileSync(
    path.join(STAGING_DIR, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: https://moshikziyoni.github.io/LedgerSnap/sitemap.xml\n`
  );

  fs.writeFileSync(
    path.join(STAGING_DIR, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://moshikziyoni.github.io/LedgerSnap/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://moshikziyoni.github.io/LedgerSnap/error-ol222/</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://moshikziyoni.github.io/LedgerSnap/free-excel/</loc>
    <priority>0.9</priority>
  </url>
</urlset>`
  );

  console.log('[1/4] Assembled satellite network files in staging directory.');

  // 3. Initialize Git repo in staging dir
  const run = (cmd, cwd = STAGING_DIR) => execSync(cmd, { cwd, stdio: 'pipe' }).toString().trim();

  run('git init');
  run('git config user.name "LedgerSnap-Automation"');
  run('git config user.email "bot@ledger-snap.com"');
  run('git add -A');
  run('git commit -m "deploy: publish autonomous satellite authority network"');

  console.log('[2/4] Created standalone git commit.');

  // 4. Push directly to gh-pages branch on GitHub
  let remoteUrl = execSync('git remote get-url origin', { cwd: REPO_ROOT }).toString().trim();
  if (process.env.GITHUB_TOKEN && remoteUrl.includes('github.com')) {
    remoteUrl = `https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/MoshikZiyoni/LedgerSnap.git`;
  }
  console.log(`[3/4] Pushing to remote ${remoteUrl.replace(/:[^@]+@/, ':***@')} (branch: gh-pages)...`);
  
  execSync(`git push -f ${remoteUrl} master:gh-pages || git push -f ${remoteUrl} main:gh-pages`, {
    cwd: STAGING_DIR,
    stdio: 'inherit'
  });

  console.log('[4/4] Successfully pushed to gh-pages branch!');

  // 5. Cleanup staging directory
  fs.rmSync(STAGING_DIR, { recursive: true, force: true });

  console.log('\n' + '='.repeat(70));
  console.log('🎉 3 LIVE PUBLIC SATELLITE SITES DEPLOYED SUCCESSFULLY TO GITHUB PAGES:');
  console.log('='.repeat(70));
  console.log('1. Review Hub (DA 96):');
  console.log('   👉 https://moshikziyoni.github.io/LedgerSnap/');
  console.log('2. QuickBooks Error OL-222 Solver:');
  console.log('   👉 https://moshikziyoni.github.io/LedgerSnap/error-ol222/');
  console.log('3. Free Statement to Excel Converter:');
  console.log('   👉 https://moshikziyoni.github.io/LedgerSnap/free-excel/');
  console.log('='.repeat(70));
  console.log('All 3 public URLs have permanent, high-authority do-follow backlinks pointing to:');
  console.log('   🔗 https://ledger-snap.com/');
  console.log('='.repeat(70));

} catch (err) {
  console.error('[!] Deployment failed:', err.message);
  if (fs.existsSync(STAGING_DIR)) {
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
  }
  process.exit(1);
}
