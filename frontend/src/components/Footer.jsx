import React from 'react';
import { Shield, Lock, Cpu, Mail } from 'lucide-react';
import { SEO_BANKS } from '../data/seoBanks';
import { SEO_COMPARISONS } from '../data/seoComparisons';
import { SEO_GUIDES } from '../data/seoGuides';

export default function Footer({ onNavigate }) {
  const usBanksCol1 = SEO_BANKS.slice(0, 6);
  const usBanksCol2 = SEO_BANKS.slice(6, 12);

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
              256-Bit TLS &amp; Client-Side Encryption
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
              Instant deterministic conversion of US bank &amp; credit card statement PDFs into certified Intuit QuickBooks (.QBO) and formatted Excel (.XLSX) spreadsheets.
            </p>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-cyan)', fontWeight: '700', marginBottom: '6px' }}>
                Contact &amp; Billing Support
              </span>
              <a 
                href="mailto:support@ledger-snap.com" 
                style={{ color: '#fff', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
              >
                <Mail size={15} color="var(--accent-cyan)" />
                support@ledger-snap.com
              </a>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                Questions, statement parsing inquiries, or enterprise firm access.
              </span>
            </div>
          </div>

          {/* Column 1: Top US Banks */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.2px' }}>
              Major US Banks
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {usBanksCol1.map((b) => (
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
              <li style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <a
                  href="/banks"
                  onClick={(e) => handleLinkClick(e, '/banks')}
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  🏦 View All 30 US Banks Directory →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Regional & Tech Banks */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.2px' }}>
              Regional &amp; Tech Business Banks
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {usBanksCol2.map((b) => (
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
              <li style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                  Free In-Browser Accounting Tools
                </span>
              </li>
              <li>
                <a
                  href="/tools/csv-to-qbo"
                  onClick={(e) => handleLinkClick(e, '/tools/csv-to-qbo')}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '13px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  📄 Free CSV to QBO Web Connect Converter
                </a>
              </li>
              <li>
                <a
                  href="/tools/ofx-to-qbo"
                  onClick={(e) => handleLinkClick(e, '/tools/ofx-to-qbo')}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '13px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  🔄 Free OFX to QBO Converter
                </a>
              </li>
              <li>
                <a
                  href="/tools/qfx-to-qbo"
                  onClick={(e) => handleLinkClick(e, '/tools/qfx-to-qbo')}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '13px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  ⚡ Free Quicken QFX to QuickBooks QBO
                </a>
              </li>
              <li>
                <a
                  href="/tools/qbo-viewer-and-validator"
                  onClick={(e) => handleLinkClick(e, '/tools/qbo-viewer-and-validator')}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '13px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  🔍 Free QBO File Viewer &amp; Validator
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Guides, Legal & Comparisons */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.2px' }}>
              QuickBooks Troubleshooting Guides
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '18px' }}>
              {SEO_GUIDES.map((g) => (
                <li key={g.slug}>
                  <a
                    href={`/guides/${g.slug}`}
                    onClick={(e) => handleLinkClick(e, `/guides/${g.slug}`)}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '12px' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {g.title.split(':')[0]}
                  </a>
                </li>
              ))}
            </ul>

            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '12px', letterSpacing: '0.2px' }}>
              Trust &amp; Legal Policies
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleLinkClick(e, '/terms')}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '12px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleLinkClick(e, '/privacy')}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '12px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/refund"
                  onClick={(e) => handleLinkClick(e, '/refund')}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '12px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Refund Policy (14-Day Guarantee)
                </a>
              </li>
              <li style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                  Competitor Comparisons
                </span>
              </li>
              {SEO_COMPARISONS.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/compare/${c.slug}`}
                    onClick={(e) => handleLinkClick(e, `/compare/${c.slug}`)}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '12px' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    LedgerSnap vs {c.competitor}
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
              © 2026 LedgerSnap (ledger-snap.com). All rights reserved. Intuit and QuickBooks are registered trademarks of Intuit Inc. Payments processed securely by Paddle.com.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '18px', fontSize: '12px', flexWrap: 'wrap' }}>
            <a href="/" onClick={(e) => handleLinkClick(e, '/')} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</a>
            <a href="#how-it-works" onClick={(e) => { if (window.location.pathname !== '/') { handleLinkClick(e, '/#how-it-works'); } }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>How it works</a>
            <a href="#pricing" onClick={(e) => { if (window.location.pathname !== '/') { handleLinkClick(e, '/#pricing'); } }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Pricing</a>
            <a href="/terms" onClick={(e) => handleLinkClick(e, '/terms')} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</a>
            <a href="/privacy" onClick={(e) => handleLinkClick(e, '/privacy')} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
            <a href="/refund" onClick={(e) => handleLinkClick(e, '/refund')} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Refunds</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
