import React from 'react';
import { Shield, Lock, Cpu, Mail } from 'lucide-react';
import { SEO_BANKS } from '../data/seoBanks';
import { SEO_COMPARISONS } from '../data/seoComparisons';
import { SEO_GUIDES } from '../data/seoGuides';

export default function Footer({ onNavigate }) {
  const usBanks = SEO_BANKS.filter(b => !b.isIsraeli).slice(0, 7);
  const israeliBanks = SEO_BANKS.filter(b => b.isIsraeli);

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(10, 14, 23, 0.98)', marginTop: 'auto', fontSize: '13px', color: 'var(--text-dim)' }}>
      {/* Top Security & Transparency Trust Strip */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px', background: 'rgba(15, 23, 42, 0.6)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={18} color="var(--accent-cyan)" />
            <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '13px' }}>
              Zero-Retention RAM Processing
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} color="var(--accent-emerald)" />
            <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '13px' }}>
              Hosted on SOC 2 Type II Cloud Infrastructure
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={18} color="var(--accent-indigo)" />
            <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '13px' }}>
              256-Bit TLS & Client-Side Encryption
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px 36px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '36px', marginBottom: '48px' }}>
          {/* Brand Info & Contact Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <img src="/logo.svg" alt="LedgerSnap Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }} />
              <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '18px', letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>
                Ledger<span style={{ color: 'var(--accent-cyan)' }}>Snap</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
              Instant deterministic conversion of PDF bank statements into certified Intuit QuickBooks (.QBO) Web Connect and formatted Excel (.XLSX) files.
            </p>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-cyan)', fontWeight: '700', marginBottom: '6px' }}>
                Contact & Support
              </span>
              <a 
                href="mailto:Moshiktm1994@gmail.com" 
                style={{ color: '#fff', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
              >
                <Mail size={15} color="var(--accent-cyan)" />
                Moshiktm1994@gmail.com
              </a>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                Questions, custom bank layouts, or enterprise firm plans.
              </span>
            </div>
          </div>

          {/* Column 1: Popular US Bank Converters */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.2px' }}>
              Popular US Bank Converters
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {usBanks.map((b) => (
                <li key={b.slug}>
                  <a
                    href={`/convert/${b.slug}`}
                    onClick={(e) => handleLinkClick(e, `/convert/${b.slug}`)}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <span>{b.name} PDF to .QBO</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Israeli Bank Converters */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.2px' }}>
              Israeli Bank Converters (IL → US QuickBooks)
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {israeliBanks.map((b) => (
                <li key={b.slug}>
                  <a
                    href={`/convert/${b.slug}`}
                    onClick={(e) => handleLinkClick(e, `/convert/${b.slug}`)}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <span>{b.name}</span>
                  </a>
                </li>
              ))}
              <li style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  ✓ Hebrew RTL character reconstruction &amp; ILS/USD dual currency.
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Comparisons & Guides */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.2px' }}>
              Comparisons & Guides
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SEO_COMPARISONS.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/compare/${c.slug}`}
                    onClick={(e) => handleLinkClick(e, `/compare/${c.slug}`)}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    LedgerSnap vs {c.competitor}
                  </a>
                </li>
              ))}
              <li style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                  QuickBooks Tutorials
                </span>
              </li>
              {SEO_GUIDES.map((g) => (
                <li key={g.slug}>
                  <a
                    href={`/guides/${g.slug}`}
                    onClick={(e) => handleLinkClick(e, `/guides/${g.slug}`)}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '12px' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {g.slug === 'how-to-fix-quickbooks-web-connect-error-ol-222' ? 'Fix QuickBooks Error OL-222' : g.slug === 'how-to-import-pdf-bank-statements-into-quickbooks-online' ? 'Import PDF to QuickBooks Online' : 'Israeli Statements for US Subsidiaries'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px' }}>
              © 2026 LedgerSnap (ledger-snap.com). All rights reserved. Intuit and QuickBooks are registered trademarks of Intuit Inc.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
            <a 
              href="/" 
              onClick={(e) => handleLinkClick(e, '/')} 
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              Home
            </a>
            <a href="#how-it-works" onClick={(e) => { if (window.location.pathname !== '/') { handleLinkClick(e, '/#how-it-works'); } }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              How it works
            </a>
            <a href="#pricing" onClick={(e) => { if (window.location.pathname !== '/') { handleLinkClick(e, '/#pricing'); } }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Pricing
            </a>
            <a href="#faq" onClick={(e) => { if (window.location.pathname !== '/') { handleLinkClick(e, '/#faq'); } }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              FAQ
            </a>
            <span style={{ color: 'var(--text-dim)' }}>
              Zero-Retention RAM | Hosted on SOC 2 Type II Cloud Infrastructure
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
