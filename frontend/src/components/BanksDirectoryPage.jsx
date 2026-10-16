import React, { useState } from 'react';
import { Search, Building2, ArrowRight, ShieldCheck, Zap, CheckCircle2, Clock } from 'lucide-react';
import { US_INSTITUTIONS, SEO_BANKS } from '../data/seoBanks';

export default function BanksDirectoryPage({ onNavigate }) {
  const [search, setSearch] = useState('');

  const filteredBanks = US_INSTITUTIONS.filter(bank => {
    const q = search.toLowerCase();
    return (
      bank.name.toLowerCase().includes(q) ||
      bank.fullName.toLowerCase().includes(q) ||
      bank.org.toLowerCase().includes(q) ||
      bank.bid.includes(q) ||
      (bank.keywords && bank.keywords.some(k => k.toLowerCase().includes(q)))
    );
  });

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px', minHeight: '80vh' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
          <Building2 size={16} /> Certified US Bank Directory
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px' }}>
          Supported US Banks &amp; Credit Cards for <br />
          <span className="gradient-text">QuickBooks Web Connect (.QBO)</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '720px', margin: '0 auto 28px auto' }}>
          Convert PDF bank and credit card statements from top US institutions into 100% verified QuickBooks Online, QuickBooks Desktop, Xero, and CPA-audit Excel files. Every bank profile is pre-tuned with certified Intuit Financial Institution IDs (&lt;INTU.BID&gt; &amp; &lt;FI&gt;) to prevent Web Connect errors OL-222 and OL-301.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '520px', margin: '0 auto', position: 'relative' }}>
          <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by bank name, INTU.BID, or card brand (e.g. Chase, Amex, 10898)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 44px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
            }}
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginBottom: '60px' }}>
        {filteredBanks.map((bank) => {
          const isCreditCard = bank.accountTypeDefault === 'CREDITCARD' || bank.accountTypeDefault === 'CREDITLINE';
          const primarySlug = `/convert/${bank.id}-statement-to-qbo`;

          return (
            <div
              key={bank.id}
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#fff' }}>
                      {bank.name}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      {bank.fullName}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: isCreditCard ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: isCreditCard ? '#c084fc' : 'var(--accent-cyan)',
                    border: `1px solid ${isCreditCard ? 'rgba(168, 85, 247, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
                  }}>
                    {isCreditCard ? 'Credit Card' : 'Checking / Savings'}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {bank.painPoint}
                </p>

                {/* Specs Box */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Intuit Bank ID (&lt;INTU.BID&gt;):</span>
                    <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{bank.bid}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Financial Inst (&lt;ORG&gt;):</span>
                    <strong style={{ color: '#fff' }}>{bank.org}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Direct Feed Limitation:</span>
                    <strong style={{ color: '#f59e0b' }}>{bank.directFeedLimit} max</strong>
                  </div>
                </div>
              </div>

              {/* Conversion Links */}
              <div>
                <a
                  href={primarySlug}
                  onClick={(e) => handleLinkClick(e, primarySlug)}
                  className="gradient-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    marginBottom: '10px'
                  }}
                >
                  Convert {bank.name} Statement <ArrowRight size={14} />
                </a>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', fontSize: '11px' }}>
                  <a
                    href={`/convert/${bank.id}-pdf-to-quickbooks-online`}
                    onClick={(e) => handleLinkClick(e, `/convert/${bank.id}-pdf-to-quickbooks-online`)}
                    style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                  >
                    QuickBooks Online
                  </a>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                  <a
                    href={`/convert/${bank.id}-pdf-to-csv`}
                    onClick={(e) => handleLinkClick(e, `/convert/${bank.id}-pdf-to-csv`)}
                    style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                  >
                    Export CSV
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Architecture Notice */}
      <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
          Don't See Your Bank Listed?
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '650px', margin: '0 auto 20px auto' }}>
          LedgerSnap automatically parses PDF bank statements from over 500+ US credit unions, regional institutions, and international banks. When a smaller institution is uploaded, we automatically apply universal Wells Fargo or Chase Web Connect profiles accepted 100% by QuickBooks Online &amp; Desktop.
        </p>
        <button
          onClick={() => {
            if (onNavigate) onNavigate('/');
            else {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }}
          className="gradient-btn"
          style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700' }}
        >
          <Zap size={16} /> Upload Any PDF Statement Now
        </button>
      </div>
    </div>
  );
}
