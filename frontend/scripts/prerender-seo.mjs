import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEO_BANKS, US_INSTITUTIONS, ISRAELI_INSTITUTIONS } from '../src/data/seoBanks.js';
import { SEO_TOOLS } from '../src/data/seoTools.js';
import { SEO_GUIDES } from '../src/data/seoGuides.js';
import { SEO_COMPARISONS } from '../src/data/seoComparisons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(FRONTEND_DIR, 'dist');
const PUBLIC_DIR = path.join(FRONTEND_DIR, 'public');
const SITE_ORIGIN = 'https://ledger-snap.com';
const BUILD_DATE = new Date().toISOString().split('T')[0];

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escAttr(str = '') {
  return escHtml(str).replace(/"/g, '&quot;');
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function layoutShell({ breadcrumb, heroBadge, h1, subtitle, mainHtml }) {
  return `
<div style="min-height:100vh;background:#0a0e17;color:#f8fafc;font-family:Inter,system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;">
  <header style="border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(10,14,23,0.95);padding:16px 24px;">
    <nav aria-label="Primary" style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
      <a href="/" style="color:#f8fafc;text-decoration:none;font-weight:800;font-size:20px;">Ledger<span style="color:#38bdf8;">Snap</span> <span style="display:block;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">PDF to QuickBooks (.QBO)</span></a>
      <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;font-size:14px;">
        <a href="/banks" style="color:#cbd5e1;text-decoration:none;">Supported Banks</a>
        <a href="/tools" style="color:#38bdf8;text-decoration:none;font-weight:600;">Free QBO Tools</a>
        <a href="/guides" style="color:#cbd5e1;text-decoration:none;">Guides</a>
        <a href="/compare" style="color:#cbd5e1;text-decoration:none;">Comparisons</a>
        <a href="/#converter" style="background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;">1 Free Statement Conversion</a>
      </div>
    </nav>
  </header>
  <main style="flex:1;max-width:1120px;width:100%;margin:0 auto;padding:40px 24px 72px 24px;line-height:1.65;">
    ${breadcrumb ? `<div style="font-size:13px;color:#94a3b8;margin-bottom:20px;">${breadcrumb}</div>` : ''}
    ${heroBadge ? `<div style="display:inline-block;padding:6px 14px;border-radius:9999px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:12px;font-weight:700;margin-bottom:16px;">${heroBadge}</div>` : ''}
    <h1 style="font-size:clamp(28px,4vw,46px);font-weight:800;line-height:1.18;margin:0 0 18px 0;color:#fff;">${escHtml(h1)}</h1>
    ${subtitle ? `<p style="font-size:17px;color:#cbd5e1;max-width:820px;margin:0 0 32px 0;">${escHtml(subtitle)}</p>` : ''}
    ${mainHtml}
  </main>
  <footer style="border-top:1px solid rgba(255,255,255,0.08);background:#070a11;padding:32px 24px;color:#94a3b8;font-size:13px;">
    <div style="max-width:1120px;margin:0 auto;display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;">
      <div>LedgerSnap (ledger-snap.com) — Zero-Retention RAM Processing • 256-Bit TLS Encryption in Transit</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="/banks" style="color:#94a3b8;">Banks Directory</a>
        <a href="/tools/qbo-viewer-and-validator" style="color:#94a3b8;">QBO Validator</a>
        <a href="/guides" style="color:#94a3b8;">Guides</a>
        <a href="/terms" style="color:#94a3b8;">Terms</a>
        <a href="/privacy" style="color:#94a3b8;">Privacy</a>
        <a href="/refund" style="color:#94a3b8;">Refund Policy</a>
      </div>
    </div>
  </footer>
</div>`;
}

function renderHtml(template, { lang = 'en', title, description, canonicalUrl, schemaId, schemaGraph, rootHtml, robots }) {
  let html = template;
  html = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${escAttr(lang)}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escHtml(title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escAttr(description)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escAttr(canonicalUrl)}" />`
  );
  if (robots) {
    html = html.replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="robots" content="${escAttr(robots)}" />`
    );
  }
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escAttr(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escAttr(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escAttr(description)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escAttr(title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escAttr(description)}" />`
  );

  if (canonicalUrl !== `${SITE_ORIGIN}/`) {
    const baseOrgSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE_ORIGIN}/#organization`,
          name: 'LedgerSnap',
          url: `${SITE_ORIGIN}/`,
          email: 'support@ledger-snap.com'
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_ORIGIN}/#website`,
          name: 'LedgerSnap',
          url: `${SITE_ORIGIN}/`,
          publisher: { '@id': `${SITE_ORIGIN}/#organization` }
        }
      ]
    };
    html = html.replace(
      /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
      `<script type="application/ld+json">${JSON.stringify(baseOrgSchema)}</script>`
    );
  }

  if (schemaGraph && schemaGraph.length > 0 && schemaId) {
    const schemaScript = `\n    <script id="${escAttr(schemaId)}" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': schemaGraph })}</script>\n  </head>`;
    html = html.replace(/<\/head>/i, schemaScript);
  }

  html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${rootHtml}</div>`);
  return html;
}

function writeDistPage(relPath, content) {
  const dest = path.join(DIST_DIR, relPath);
  ensureDir(dest);
  fs.writeFileSync(dest, content, 'utf8');
}

function main() {
  const distIndexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(distIndexPath)) {
    throw new Error('dist/index.html not found. Run vite build before prerender-seo.mjs.');
  }
  const template = fs.readFileSync(distIndexPath, 'utf8');

  // 1. Write 200.html SPA fallback with noindex so unknown paths don't create soft-404 duplicate canonicals
  const fallback200 = template.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    '<meta name="robots" content="noindex, follow" />'
  );
  fs.writeFileSync(path.join(DIST_DIR, '200.html'), fallback200, 'utf8');

  const sitemapEntries = [];
  const addSitemapUrl = (urlPath, changefreq, priority) => {
    const full = urlPath === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${urlPath}`;
    sitemapEntries.push({ loc: full, changefreq, priority });
  };

  // 2. Prerender Home '/' -> dist/index.html
  const homeRoot = layoutShell({
    heroBadge: 'Zero-Retention RAM Processing • 256-Bit TLS Encryption in Transit',
    h1: 'Convert Bank Statement PDF to QuickBooks (.QBO) & Excel',
    subtitle: 'Deterministic bank & credit card PDF statement converter for QuickBooks Online, QuickBooks Desktop, Excel (.XLSX), CSV, and Hashavshevet. Mathematical reconciliation (Opening + Credits - Debits = Closing) with 1 free conversion included.',
    mainHtml: `
      <section style="background:rgba(15,23,42,0.7);border:1px solid rgba(56,189,248,0.25);border-radius:16px;padding:28px;margin-bottom:36px;">
        <h2 style="font-size:22px;color:#fff;margin:0 0 12px 0;">Upload Any US or Israeli Bank Statement PDF</h2>
        <p style="color:#cbd5e1;margin:0 0 16px 0;">Bypass the 90-day bank feed limit. LedgerSnap extracts multi-page PDF tables, preserves check numbers, removes OL-222 errors via certified &lt;INTU.BID&gt; headers, and fixes Hebrew RTL text and DD/MM/YYYY dates.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a href="/banks" style="color:#38bdf8;font-weight:700;">Browse All ${SEO_BANKS.length} Supported Banks (US &amp; Israel) →</a>
          <a href="/tools/qbo-viewer-and-validator" style="color:#cbd5e1;">Free .QBO Viewer &amp; OL-222 Validator</a>
          <a href="/guides" style="color:#cbd5e1;">QuickBooks Import Guides</a>
          <a href="/compare" style="color:#cbd5e1;">DocuClipper &amp; MoneyThumb Alternatives</a>
        </div>
      </section>
      <section style="margin-bottom:36px;">
        <h2 style="font-size:22px;color:#fff;margin:0 0 16px 0;">Popular Bank Converters</h2>
        <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;list-style:none;padding:0;margin:0;">
          ${SEO_BANKS.slice(0, 12).concat(SEO_BANKS.filter(b => b.region === 'IL')).map(b =>
            `<li><a href="/convert/${escAttr(b.slug)}" style="display:block;padding:10px 14px;border-radius:10px;background:rgba(15,23,42,0.55);border:1px solid rgba(255,255,255,0.08);color:#e2e8f0;text-decoration:none;">${escHtml(b.name)} PDF to .QBO</a></li>`
          ).join('')}
        </ul>
      </section>
      <section>
        <h2 style="font-size:22px;color:#fff;margin:0 0 16px 0;">Free QuickBooks Utilities &amp; Troubleshooting</h2>
        <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;list-style:none;padding:0;margin:0;">
          ${SEO_TOOLS.map(t => `<li><a href="/tools/${escAttr(t.slug)}" style="display:block;padding:12px 16px;border-radius:10px;background:rgba(15,23,42,0.55);border:1px solid rgba(56,189,248,0.2);color:#38bdf8;text-decoration:none;">${escHtml(t.title)}</a></li>`).join('')}
          ${SEO_GUIDES.map(g => `<li><a href="/guides/${escAttr(g.slug)}" style="display:block;padding:12px 16px;border-radius:10px;background:rgba(15,23,42,0.55);border:1px solid rgba(255,255,255,0.08);color:#e2e8f0;text-decoration:none;">${escHtml(g.title)}</a></li>`).join('')}
        </ul>
      </section>`
  });
  writeDistPage(
    'index.html',
    renderHtml(template, {
      title: 'LedgerSnap | Convert Bank Statement PDF to QuickBooks (.QBO) & Excel',
      description: 'Convert bank & credit card PDF statements to certified QuickBooks (.QBO), Excel (.XLSX), CSV & Hashavshevet in seconds. Zero-retention RAM processing with 1 free conversion.',
      canonicalUrl: `${SITE_ORIGIN}/`,
      rootHtml: homeRoot
    })
  );
  addSitemapUrl('/', 'daily', '1.0');

  // 3. Prerender /banks Directory
  const banksHubHtml = layoutShell({
    breadcrumb: '<a href="/" style="color:#94a3b8;">Home</a> / <span>Supported Banks Directory</span>',
    heroBadge: `${US_INSTITUTIONS.length} US Institutions + ${ISRAELI_INSTITUTIONS.length} Israeli Banks & Cards`,
    h1: 'Supported US & Israeli Banks for QuickBooks (.QBO), Excel & Hashavshevet',
    subtitle: 'Pre-configured Intuit Web Connect (<INTU.BID>) bank profiles for US checking, savings, commercial accounts, credit cards, and Israeli Hebrew/ILS statements.',
    mainHtml: `
      <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;list-style:none;padding:0;margin:0;">
        ${SEO_BANKS.map(b => `
          <li style="background:rgba(15,23,42,0.65);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
            <a href="/convert/${escAttr(b.slug)}" style="color:#38bdf8;font-weight:700;font-size:16px;text-decoration:none;display:block;margin-bottom:6px;">${escHtml(b.name)} PDF to .QBO</a>
            <div style="font-size:12px;color:#94a3b8;">INTU.BID: ${escHtml(b.bid)} • ${escHtml(b.painPoint)}</div>
          </li>`).join('')}
      </ul>`
  });
  writeDistPage(
    'banks.html',
    renderHtml(template, {
      title: 'Supported US & Israeli Banks Directory (PDF to .QBO & Excel) | LedgerSnap',
      description: 'Browse 45 US and Israeli banks, credit cards, and neobanks pre-configured with verified Intuit <INTU.BID> headers for QuickBooks Online, Desktop, Excel, and Hashavshevet.',
      canonicalUrl: `${SITE_ORIGIN}/banks`,
      schemaId: 'hub-rich-schema',
      schemaGraph: [{
        '@type': 'CollectionPage',
        name: 'Supported Banks Directory',
        url: `${SITE_ORIGIN}/banks`
      }],
      rootHtml: banksHubHtml
    })
  );
  addSitemapUrl('/banks', 'weekly', '0.9');

  // 4. Prerender /tools Hub + /tools/<slug>
  const toolsHubHtml = layoutShell({
    breadcrumb: '<a href="/" style="color:#94a3b8;">Home</a> / <span>Free QBO Tools</span>',
    heroBadge: '100% Free Client-Side Accounting Utilities',
    h1: 'Free QuickBooks Web Connect (.QBO) Converters & Validators',
    subtitle: 'Convert CSV, OFX, and QFX files to QuickBooks .QBO, or inspect and repair broken Web Connect files causing QuickBooks Error OL-222.',
    mainHtml: `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;">
        ${SEO_TOOLS.map(t => `
          <article style="background:rgba(15,23,42,0.65);border:1px solid rgba(56,189,248,0.2);border-radius:14px;padding:22px;">
            <h2 style="font-size:20px;margin:0 0 10px 0;"><a href="/tools/${escAttr(t.slug)}" style="color:#38bdf8;text-decoration:none;">${escHtml(t.title)}</a></h2>
            <p style="color:#cbd5e1;font-size:14px;margin:0 0 12px 0;">${escHtml(t.subheading)}</p>
            <a href="/tools/${escAttr(t.slug)}" style="color:#fff;font-weight:700;font-size:13px;">Open Tool →</a>
          </article>`).join('')}
      </div>`
  });
  writeDistPage(
    'tools.html',
    renderHtml(template, {
      title: 'Free QuickBooks (.QBO) Converter & Validator Tools | LedgerSnap',
      description: 'Free in-browser tools to convert CSV, OFX, and QFX files to QuickBooks (.QBO) and validate or fix QuickBooks Web Connect Error OL-222.',
      canonicalUrl: `${SITE_ORIGIN}/tools`,
      rootHtml: toolsHubHtml
    })
  );
  addSitemapUrl('/tools', 'weekly', '0.9');

  for (const tool of SEO_TOOLS) {
    const canonical = `${SITE_ORIGIN}/tools/${tool.slug}`;
    const mainHtml = `
      <section style="margin-bottom:32px;">
        <h2 style="font-size:22px;color:#fff;margin:0 0 14px 0;">Key Capabilities</h2>
        <ul style="color:#cbd5e1;padding-left:20px;">
          ${(tool.features || []).map(f => `<li style="margin-bottom:8px;">${escHtml(f)}</li>`).join('')}
        </ul>
      </section>
      <section>
        <h2 style="font-size:22px;color:#fff;margin:0 0 14px 0;">Frequently Asked Questions</h2>
        ${(tool.faqs || []).map(f => `<details open style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 18px;margin-bottom:10px;"><summary style="font-weight:700;color:#fff;">${escHtml(f.q)}</summary><p style="color:#cbd5e1;margin:10px 0 0 0;">${escHtml(f.a)}</p></details>`).join('')}
      </section>`;
    writeDistPage(
      `tools/${tool.slug}.html`,
      renderHtml(template, {
        title: tool.metaTitle,
        description: tool.metaDescription,
        canonicalUrl: canonical,
        schemaId: 'tool-rich-schema',
        schemaGraph: [
          {
            '@type': 'SoftwareApplication',
            name: tool.title,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            url: canonical,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
          },
          ...(tool.faqs?.length ? [{
            '@type': 'FAQPage',
            mainEntity: tool.faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a }
            }))
          }] : [])
        ],
        rootHtml: layoutShell({
          breadcrumb: `<a href="/" style="color:#94a3b8;">Home</a> / <a href="/tools" style="color:#94a3b8;">Free QBO Tools</a> / <span>${escHtml(tool.title)}</span>`,
          heroBadge: 'Free Browser Utility — Zero Upload Required',
          h1: tool.heading,
          subtitle: tool.subheading,
          mainHtml
        })
      })
    );
    addSitemapUrl(`/tools/${tool.slug}`, 'weekly', tool.slug === 'csv-to-qbo' || tool.slug === 'qbo-viewer-and-validator' ? '0.9' : '0.8');
  }

  // 5. Prerender /guides Hub + /guides/<slug>
  const guidesHubHtml = layoutShell({
    breadcrumb: '<a href="/" style="color:#94a3b8;">Home</a> / <span>QuickBooks Troubleshooting Guides</span>',
    heroBadge: 'Technical Accounting Documentation',
    h1: 'QuickBooks Bank Feed & .QBO Web Connect Guides',
    subtitle: 'Step-by-step engineering tutorials for fixing QuickBooks errors OL-222 and OL-301, importing statements older than 90 days, credit card signs, and PDF to QBO workflows.',
    mainHtml: `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;">
        ${SEO_GUIDES.map(g => `
          <article style="background:rgba(15,23,42,0.65);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:22px;">
            <div style="font-size:12px;color:#38bdf8;font-weight:700;margin-bottom:8px;">${escHtml(g.readingTime)} • ${escHtml(g.publishedDate)}</div>
            <h2 style="font-size:20px;margin:0 0 10px 0;"><a href="/guides/${escAttr(g.slug)}" style="color:#fff;text-decoration:none;">${escHtml(g.title)}</a></h2>
            <p style="color:#cbd5e1;font-size:14px;margin:0 0 12px 0;">${escHtml(g.metaDescription)}</p>
            <a href="/guides/${escAttr(g.slug)}" style="color:#38bdf8;font-weight:700;font-size:13px;">Read Guide →</a>
          </article>`).join('')}
      </div>`
  });
  writeDistPage(
    'guides.html',
    renderHtml(template, {
      title: 'QuickBooks Bank Statement & Error OL-222 Troubleshooting Guides | LedgerSnap',
      description: 'Technical guides for fixing QuickBooks Error OL-222, OL-301, INTU.BID verification failures, importing statements older than 90 days, and credit card PDF conversion.',
      canonicalUrl: `${SITE_ORIGIN}/guides`,
      rootHtml: guidesHubHtml
    })
  );
  addSitemapUrl('/guides', 'weekly', '0.9');

  for (const guide of SEO_GUIDES) {
    const canonical = `${SITE_ORIGIN}/guides/${guide.slug}`;
    const lang = guide.slug.startsWith('extraire-') ? 'fr' : 'en';
    const mainHtml = `
      <p style="font-size:16px;color:#e2e8f0;background:rgba(15,23,42,0.65);padding:20px;border-radius:12px;border-left:4px solid #38bdf8;margin:0 0 28px 0;">${escHtml(guide.intro)}</p>
      ${(guide.sections || []).map(s => `
        <section style="margin-bottom:28px;">
          <h2 style="font-size:22px;color:#fff;margin:0 0 10px 0;">${escHtml(s.heading)}</h2>
          <p style="color:#cbd5e1;margin:0 0 12px 0;">${escHtml(s.body)}</p>
          ${s.code ? `<pre style="background:#05080f;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px;overflow-x:auto;color:#7dd3fc;font-size:13px;"><code>${escHtml(s.code)}</code></pre>` : ''}
        </section>`).join('')}
      <section>
        <h2 style="font-size:22px;color:#fff;margin:0 0 14px 0;">Frequently Asked Questions</h2>
        ${(guide.faqs || []).map(f => `<details open style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 18px;margin-bottom:10px;"><summary style="font-weight:700;color:#fff;">${escHtml(f.q)}</summary><p style="color:#cbd5e1;margin:10px 0 0 0;">${escHtml(f.a)}</p></details>`).join('')}
      </section>`;
    writeDistPage(
      `guides/${guide.slug}.html`,
      renderHtml(template, {
        lang,
        title: guide.metaTitle,
        description: guide.metaDescription,
        canonicalUrl: canonical,
        schemaId: 'guide-rich-schema',
        schemaGraph: [
          {
            '@type': 'TechArticle',
            headline: guide.title,
            description: guide.metaDescription,
            datePublished: guide.publishedDate,
            author: { '@type': 'Organization', name: 'LedgerSnap' },
            mainEntityOfPage: canonical
          },
          ...(guide.faqs?.length ? [{
            '@type': 'FAQPage',
            mainEntity: guide.faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a }
            }))
          }] : [])
        ],
        rootHtml: layoutShell({
          breadcrumb: `<a href="/" style="color:#94a3b8;">Home</a> / <a href="/guides" style="color:#94a3b8;">Guides</a> / <span>${escHtml(guide.title)}</span>`,
          heroBadge: `${guide.readingTime || '5 min read'} • ${guide.publishedDate || BUILD_DATE}`,
          h1: guide.title,
          subtitle: guide.metaDescription,
          mainHtml
        })
      })
    );
    addSitemapUrl(`/guides/${guide.slug}`, 'monthly', guide.slug.startsWith('extraire-') ? '0.8' : '0.9');
  }

  // 6. Prerender /compare Hub + /compare/<slug>
  const compareHubHtml = layoutShell({
    breadcrumb: '<a href="/" style="color:#94a3b8;">Home</a> / <span>Comparisons</span>',
    heroBadge: 'Side-by-Side Technical Benchmarks',
    h1: 'LedgerSnap vs DocuClipper, MoneyThumb, ProperConvert & ChatGPT',
    subtitle: 'Transparent comparison of pricing, Intuit <INTU.BID> certification, penny-level balance reconciliation, and zero-retention RAM security.',
    mainHtml: `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;">
        ${SEO_COMPARISONS.map(c => `
          <article style="background:rgba(15,23,42,0.65);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:22px;">
            <h2 style="font-size:20px;margin:0 0 10px 0;"><a href="/compare/${escAttr(c.slug)}" style="color:#38bdf8;text-decoration:none;">LedgerSnap vs ${escHtml(c.competitor)}</a></h2>
            <p style="color:#cbd5e1;font-size:14px;margin:0 0 12px 0;">${escHtml(c.subheadline)}</p>
            <a href="/compare/${escAttr(c.slug)}" style="color:#fff;font-weight:700;font-size:13px;">Compare Full Specs →</a>
          </article>`).join('')}
      </div>`
  });
  writeDistPage(
    'compare.html',
    renderHtml(template, {
      title: 'LedgerSnap vs DocuClipper, MoneyThumb, ProperConvert & ChatGPT',
      description: 'Compare LedgerSnap against DocuClipper, MoneyThumb, ProperConvert, and ChatGPT on pricing, zero-retention privacy, balance checksums, and QuickBooks .QBO accuracy.',
      canonicalUrl: `${SITE_ORIGIN}/compare`,
      rootHtml: compareHubHtml
    })
  );
  addSitemapUrl('/compare', 'monthly', '0.8');

  for (const comp of SEO_COMPARISONS) {
    const canonical = `${SITE_ORIGIN}/compare/${comp.slug}`;
    const mainHtml = `
      <p style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:18px;color:#d1fae5;margin:0 0 28px 0;"><strong>Key Takeaway:</strong> ${escHtml(comp.keyTakeaway)}</p>
      <div style="overflow-x:auto;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.15);text-align:left;">
              <th style="padding:12px;color:#94a3b8;">Feature</th>
              <th style="padding:12px;color:#38bdf8;">LedgerSnap</th>
              <th style="padding:12px;color:#cbd5e1;">${escHtml(comp.competitor)}</th>
            </tr>
          </thead>
          <tbody>
            ${(comp.tableRows || []).map(r => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                <td style="padding:12px;font-weight:600;color:#fff;">${escHtml(r.feature)}</td>
                <td style="padding:12px;color:#34d399;">${escHtml(r.ledgersnap)}</td>
                <td style="padding:12px;color:#94a3b8;">${escHtml(r.competitorVal)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <section>
        <h2 style="font-size:22px;color:#fff;margin:0 0 14px 0;">Frequently Asked Questions</h2>
        ${(comp.faqs || []).map(f => `<details open style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 18px;margin-bottom:10px;"><summary style="font-weight:700;color:#fff;">${escHtml(f.q)}</summary><p style="color:#cbd5e1;margin:10px 0 0 0;">${escHtml(f.a)}</p></details>`).join('')}
      </section>`;
    writeDistPage(
      `compare/${comp.slug}.html`,
      renderHtml(template, {
        title: comp.metaTitle,
        description: comp.metaDescription,
        canonicalUrl: canonical,
        schemaId: 'compare-rich-schema',
        schemaGraph: [
          {
            '@type': 'WebPage',
            name: comp.headline,
            url: canonical,
            description: comp.metaDescription
          },
          ...(comp.faqs?.length ? [{
            '@type': 'FAQPage',
            mainEntity: comp.faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a }
            }))
          }] : [])
        ],
        rootHtml: layoutShell({
          breadcrumb: `<a href="/" style="color:#94a3b8;">Home</a> / <a href="/compare" style="color:#94a3b8;">Comparisons</a> / <span>LedgerSnap vs ${escHtml(comp.competitor)}</span>`,
          heroBadge: `Verified Comparison • ${comp.priceComparison?.ledgersnap || '$19.99/mo'} vs ${comp.priceComparison?.competitor || ''}`,
          h1: comp.headline,
          subtitle: comp.subheadline,
          mainHtml
        })
      })
    );
    addSitemapUrl(`/compare/${comp.slug}`, 'monthly', comp.slug === 'ledgersnap-vs-chatgpt' ? '0.9' : '0.8');
  }

  // 7. Prerender /convert/<bank.slug> for all US + Israeli banks
  for (const bank of SEO_BANKS) {
    const canonical = `${SITE_ORIGIN}/convert/${bank.slug}`;
    const priority = ['chase', 'wells-fargo', 'bank-of-america', 'bank-hapoalim', 'bank-leumi'].includes(bank.id) ? '0.9' : '0.8';
    const related = SEO_BANKS.filter(b => b.id !== bank.id && (b.region || 'US') === (bank.region || 'US')).slice(0, 4);

    const mainHtml = `
      <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:12px;padding:18px;margin-bottom:28px;color:#bae6fd;">
        <strong>Bank Profile:</strong> ${escHtml(bank.fullName)} • <strong>INTU.BID:</strong> <code>${escHtml(bank.bid)}</code> • <strong>Currency:</strong> ${escHtml(bank.currency || 'USD')} • <strong>Engineered for:</strong> ${escHtml(bank.painPoint)}
      </div>
      <section style="margin-bottom:32px;">
        <h2 style="font-size:22px;color:#fff;margin:0 0 12px 0;">Why Accountants Use LedgerSnap for ${escHtml(bank.name)}</h2>
        <p style="color:#cbd5e1;margin:0 0 14px 0;">${escHtml(bank.directFeedLimitNotice)}</p>
        <ul style="color:#cbd5e1;padding-left:20px;">
          ${(bank.features || []).map(f => `<li style="margin-bottom:8px;">${escHtml(f)}</li>`).join('')}
        </ul>
      </section>
      <section style="margin-bottom:32px;">
        <h2 style="font-size:22px;color:#fff;margin:0 0 14px 0;">${escHtml(bank.stepGuide?.title || `How to Convert ${bank.name} PDF to .QBO`)}</h2>
        <ol style="color:#cbd5e1;padding-left:20px;">
          ${(bank.stepGuide?.steps || []).map(s => `<li style="margin-bottom:10px;"><strong>${escHtml(s.title)}:</strong> ${escHtml(s.desc)}</li>`).join('')}
        </ol>
      </section>
      <section style="margin-bottom:32px;">
        <h2 style="font-size:22px;color:#fff;margin:0 0 14px 0;">Frequently Asked Questions: ${escHtml(bank.name)}</h2>
        ${(bank.faqs || []).map(f => `<details open style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 18px;margin-bottom:10px;"><summary style="font-weight:700;color:#fff;">${escHtml(f.q)}</summary><p style="color:#cbd5e1;margin:10px 0 0 0;">${escHtml(f.a)}</p></details>`).join('')}
      </section>
      <section>
        <h3 style="font-size:18px;color:#fff;margin:0 0 12px 0;">Related Bank Converters</h3>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${related.map(r => `<a href="/convert/${escAttr(r.slug)}" style="color:#38bdf8;">${escHtml(r.name)} PDF to .QBO</a>`).join('')}
          <a href="/banks" style="color:#cbd5e1;">All ${SEO_BANKS.length} Supported Banks</a>
          <a href="/guides/fix-quickbooks-web-connect-error-ol-222-ol-301" style="color:#cbd5e1;">Fix Error OL-222</a>
        </div>
      </section>`;

    writeDistPage(
      `convert/${bank.slug}.html`,
      renderHtml(template, {
        title: bank.metaTitle,
        description: bank.metaDescription,
        canonicalUrl: canonical,
        schemaId: 'bank-rich-schema',
        schemaGraph: [
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumbs`,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Bank Converters Directory', item: `${SITE_ORIGIN}/banks` },
              { '@type': 'ListItem', position: 3, name: `${bank.name} Statement Converter`, item: canonical }
            ]
          },
          {
            '@type': 'HowTo',
            '@id': `${canonical}#howto`,
            name: `How to Convert ${bank.name} Bank Statement PDF to QuickBooks (.QBO)`,
            description: bank.metaDescription,
            step: (bank.stepGuide?.steps || []).map(st => ({
              '@type': 'HowToStep',
              name: st.title,
              text: st.desc,
              url: canonical
            }))
          },
          {
            '@type': 'FAQPage',
            '@id': `${canonical}#faq`,
            mainEntity: (bank.faqs || []).map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a }
            }))
          }
        ],
        rootHtml: layoutShell({
          breadcrumb: `<a href="/" style="color:#94a3b8;">Home</a> / <a href="/banks" style="color:#94a3b8;">Bank Statement Converters</a> / <span>${escHtml(bank.name)}</span>`,
          heroBadge: `Pre-Tuned for ${bank.name} • 1 Free Statement Included`,
          h1: bank.heroH1,
          subtitle: bank.heroSub,
          mainHtml
        })
      })
    );
    addSitemapUrl(`/convert/${bank.slug}`, 'weekly', priority);
  }

  // 8. Prerender Legal Pages (/terms, /privacy, /refund)
  const legalPages = [
    {
      slug: 'terms',
      title: 'Terms of Service | LedgerSnap',
      h1: 'Terms of Service',
      desc: 'LedgerSnap Terms of Service for automated bank statement PDF to QuickBooks (.QBO) and Excel conversion.',
      body: '<p>LedgerSnap provides automated PDF bank statement parsing and conversion into QuickBooks (.QBO), Excel (.XLSX), CSV, and Hashavshevet formats. Billing is processed by Paddle.com Market Limited. Contact <a href="mailto:support@ledger-snap.com" style="color:#38bdf8;">support@ledger-snap.com</a> for assistance.</p>'
    },
    {
      slug: 'privacy',
      title: 'Zero-Retention Privacy Policy | LedgerSnap',
      h1: 'Privacy Policy',
      desc: 'How LedgerSnap processes PDF bank statements in ephemeral volatile RAM with auto-expiration and zero transaction database retention.',
      body: '<p>LedgerSnap processes uploaded PDF bank statements and parsed transaction rows strictly in volatile RAM during your active export session (up to 30 minutes or until restart). Transaction rows are never stored on disk, never saved to a database, and never used for AI model training. All traffic is secured with 256-bit TLS encryption in transit.</p>'
    },
    {
      slug: 'refund',
      title: '14-Day Refund & Cancellation Policy | LedgerSnap',
      h1: 'Refund & Cancellation Policy',
      desc: 'LedgerSnap 14-day money-back guarantee and one-click subscription cancellation policy.',
      body: '<p>Every paid LedgerSnap plan is backed by our 14-day money-back guarantee. Subscriptions can be cancelled anytime via your Paddle receipt or by emailing <a href="mailto:support@ledger-snap.com" style="color:#38bdf8;">support@ledger-snap.com</a>.</p>'
    }
  ];

  for (const lp of legalPages) {
    writeDistPage(
      `${lp.slug}.html`,
      renderHtml(template, {
        title: lp.title,
        description: lp.desc,
        canonicalUrl: `${SITE_ORIGIN}/${lp.slug}`,
        rootHtml: layoutShell({
          breadcrumb: `<a href="/" style="color:#94a3b8;">Home</a> / <span>${escHtml(lp.h1)}</span>`,
          heroBadge: 'Legal & Trust Documentation',
          h1: lp.h1,
          subtitle: lp.desc,
          mainHtml: `<div style="background:rgba(15,23,42,0.65);border-radius:12px;padding:24px;border:1px solid rgba(255,255,255,0.08);color:#cbd5e1;">${lp.body}</div>`
        })
      })
    );
    addSitemapUrl(`/${lp.slug}`, 'monthly', '0.5');
  }

  // 9. Write clean canonical-only sitemap.xml to public/ and dist/
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries
    .map(
      (u) =>
        `  <url>\n    <loc>${escHtml(u.loc)}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');

  // 10. Write 301 _redirects for legacy & alias URLs -> canonical URLs
  const redirectSet = new Set();
  const addRedirect = (from, to) => {
    if (from && to && from !== to) redirectSet.add(`${from} ${to} 301`);
  };

  for (const bank of SEO_BANKS) {
    for (const alias of bank.aliases || []) {
      addRedirect(`/convert/${alias}`, `/convert/${bank.slug}`);
    }
  }
  for (const tool of SEO_TOOLS) {
    for (const alias of tool.aliases || []) {
      addRedirect(`/tools/${alias}`, `/tools/${tool.slug}`);
    }
  }
  addRedirect('/tools/ofx-qfx-to-qbo', '/tools/ofx-to-qbo');
  addRedirect('/tools/qbo-viewer-checker', '/tools/qbo-viewer-and-validator');

  for (const guide of SEO_GUIDES) {
    for (const alias of guide.aliases || []) {
      addRedirect(`/guides/${alias}`, `/guides/${guide.slug}`);
    }
  }
  addRedirect('/guides/how-to-fix-quickbooks-web-connect-error-ol-222', '/guides/fix-quickbooks-web-connect-error-ol-222-ol-301');
  addRedirect('/guides/how-to-import-pdf-bank-statements-into-quickbooks-online', '/guides/import-older-than-90-days-bank-statements-into-quickbooks');
  addRedirect('/guides/convert-israeli-bank-statements-to-quickbooks-us-subsidiaries', '/convert/bank-hapoalim-statement-to-qbo');

  for (const comp of SEO_COMPARISONS) {
    for (const alias of comp.aliases || []) {
      addRedirect(`/compare/${alias}`, `/compare/${comp.slug}`);
    }
  }
  addRedirect('/compare/ledgersnap-vs-docuclipper', '/compare/docuclipper-alternative');
  addRedirect('/compare/ledgersnap-vs-moneythumb', '/compare/moneythumb-alternative');
  addRedirect('/compare/ledgersnap-vs-properconvert', '/compare/propersoft-properconvert-alternative');
  addRedirect('/directory', '/banks');

  const redirectsTxt = Array.from(redirectSet).join('\n') + '\n';
  fs.writeFileSync(path.join(PUBLIC_DIR, '_redirects'), redirectsTxt, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, '_redirects'), redirectsTxt, 'utf8');

  console.log(`Prerendered ${sitemapEntries.length} canonical HTML pages + 200.html + sitemap.xml + ${redirectSet.size} _redirects.`);
}

main();
