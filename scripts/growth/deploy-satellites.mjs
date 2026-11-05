#!/usr/bin/env node

/**
 * LedgerSnap Automated Satellite Site & Backlink Network Deployer
 * Prepares and synchronizes satellite microsites for zero-cost deployment
 * on GitHub Pages, Cloudflare Pages, Netlify, or Vercel.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const SATELLITES_DIR = path.join(REPO_ROOT, 'satellites');

const SATELLITES = [
  {
    id: 'qbo-review-hub',
    name: 'Top 5 Bank Statement to QBO Converters (Review Hub)',
    targetAnchor: 'https://ledger-snap.com/',
    purpose: 'CPA software reviews & comparison authority'
  },
  {
    id: 'quickbooks-ol222-solver',
    name: 'How to Fix QuickBooks Error OL-222 & OL-301',
    targetAnchor: 'https://ledger-snap.com/guides/fix-quickbooks-web-connect-error-ol-222-ol-301',
    purpose: 'Technical error solving & intent traffic'
  },
  {
    id: 'free-statement-to-excel',
    name: 'Free Bank Statement to Excel & CSV Converter',
    targetAnchor: 'https://ledger-snap.com/',
    purpose: 'Top of funnel spreadsheet searches'
  }
];

console.log('='.repeat(65));
console.log('🌐 LedgerSnap Satellite Authority & Backlink Network Deployer');
console.log('='.repeat(65));

for (const sat of SATELLITES) {
  const satPath = path.join(SATELLITES_DIR, sat.id, 'index.html');
  if (fs.existsSync(satPath)) {
    const size = (fs.statSync(satPath).size / 1024).toFixed(1);
    console.log(`✅ [READY] ${sat.name}`);
    console.log(`   📁 Path:    satellites/${sat.id}/index.html (${size} KB)`);
    console.log(`   🔗 Backlink: ${sat.targetAnchor}`);
    console.log(`   🎯 Purpose:  ${sat.purpose}\n`);
  } else {
    console.warn(`⚠️ [MISSING] ${sat.id}`);
  }
}

console.log('Deployment Options:');
console.log('1. Cloudflare Pages: Connect your GitHub repo and select root directory `satellites/<id>`');
console.log('2. Vercel: Import repo with root directory `satellites/<id>`');
console.log('3. Netlify: Drag-and-drop the folder `satellites/<id>` directly for instant live hosting');
console.log('='.repeat(65));

