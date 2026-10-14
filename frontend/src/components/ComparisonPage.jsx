import React, { useState, useEffect } from 'react';
import { 
  Check, X, AlertTriangle, Zap, Sparkles, 
  ChevronDown, UploadCloud 
} from 'lucide-react';

export default function ComparisonPage({ comparison, onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = comparison.metaTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', comparison.metaDescription);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://ledger-snap.com/compare/${comparison.slug}`);
    }

    // Inject FAQ schema
    const scriptId = 'comparison-faq-schema';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": comparison.faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a
        }
      }))
    };
    script.text = JSON.stringify(faqSchema);

    return () => {
      document.title = "LedgerSnap | Convert Bank Statement PDF to QuickBooks (.QBO) & Excel";
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [comparison]);

  return (
    <div style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '36px 24px 80px 24px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '28px' }}>
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onNavigate('/'); }} 
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          Home
        </a>
        <span>/</span>
        <span style={{ color: 'var(--text-muted)' }}>Comparisons</span>
        <span>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{comparison.competitor}</span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div 
          className="glass-pill" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 16px', 
            marginBottom: '16px', 
            color: 'var(--accent-cyan)', 
            fontSize: '12px', 
            fontWeight: '700',
            textTransform: 'uppercase'
          }}
        >
          <Sparkles size={14} color="var(--accent-cyan)" />
          Independent Accounting Software Comparison
        </div>
        <h1 className="hero-headline" style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.8px' }}>
          {comparison.headline}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '17px', maxWidth: '750px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
          {comparison.subheadline}
        </p>

        {/* Highlight Key Takeaway Box */}
        <div 
          className="glass-panel" 
          style={{ 
            maxWidth: '850px', 
            margin: '0 auto', 
            padding: '20px 24px', 
            border: '1px solid rgba(56, 189, 248, 0.3)', 
            background: 'rgba(56, 189, 248, 0.05)',
            textAlign: 'left',
            borderRadius: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }}>
              <Zap size={20} />
            </div>
            <div>
              <strong style={{ color: '#fff', fontSize: '15px', display: 'block', marginBottom: '4px' }}>
                Executive Summary:
              </strong>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                {comparison.keyTakeaway}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Contrast Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <div className="glass-panel" style={{ padding: '28px', border: '2px solid var(--accent-cyan)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--accent-cyan)', color: '#0f172a', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
            Recommended Choice
          </div>
          <span style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ LedgerSnap
          </span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 16px 0' }}>
            {comparison.priceComparison.ledgersnap}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={18} color="var(--accent-cyan)" /> 100% Unlimited Statement Pages</li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={18} color="var(--accent-cyan)" /> Certified Intuit .QBO Web Connect Export</li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={18} color="var(--accent-cyan)" /> Ephemeral RAM Processing (SOC 2 Cloud)</li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={18} color="var(--accent-cyan)" /> Try 1 Full Statement Free (No Card)</li>
          </ul>
          <button 
            onClick={() => { onNavigate('/'); }} 
            className="gradient-btn" 
            style={{ width: '100%', padding: '12px' }}
          >
            Start Converting with LedgerSnap
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '28px', opacity: 0.85 }}>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {comparison.competitor}
          </span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', margin: '8px 0 16px 0', color: 'var(--text-muted)' }}>
            {comparison.priceComparison.competitor}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-dim)' }}>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><X size={18} color="#f87171" /> Restricted quotas or high monthly tiers</li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><AlertTriangle size={18} color="#fbbf24" /> Risk of column mismatch or error OL-222</li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><X size={18} color="#f87171" /> No single statement one-time passes</li>
          </ul>
        </div>
      </div>

      {/* Feature Comparison Matrix Table */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>
          Side-by-Side Technical Comparison
        </h2>

        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: 'rgba(15,23,42,0.6)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Feature / Metric</th>
                <th style={{ padding: '16px 20px', color: 'var(--accent-cyan)', fontWeight: '800', background: 'rgba(56,189,248,0.1)' }}>⚡ LedgerSnap</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{comparison.competitor}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.tableRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>{row.feature}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--accent-cyan)', background: 'rgba(56,189,248,0.05)' }}>{row.ledgersnap}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-dim)' }}>{row.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Deep Dive Breakdown */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>
          Why Bookkeepers & CPAs Prefer LedgerSnap
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {comparison.detailedPros.map((pro, i) => (
            <div key={i} className="glass-panel" style={{ padding: '26px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', marginBottom: '14px' }}>
                <Check size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{pro.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{pro.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison FAQs */}
      <section style={{ maxWidth: '800px', margin: '0 auto 48px auto' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comparison.faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="glass-panel" 
              style={{ padding: '20px 24px', cursor: 'pointer' }}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{faq.q}</h4>
                <ChevronDown 
                  size={18} 
                  color="var(--accent-cyan)" 
                  style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} 
                />
              </div>
              {openFaq === idx && (
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Conversion CTA */}
      <div style={{ textAlign: 'center', padding: '40px 24px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>
          Experience the Difference Today
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
          Convert 1 bank statement PDF 100% free with zero payment details required.
        </p>
        <button 
          onClick={() => onNavigate('/')} 
          className="gradient-btn"
          style={{ padding: '12px 28px', fontSize: '15px' }}
        >
          <UploadCloud size={16} /> Try LedgerSnap Converter Free
        </button>
      </div>
    </div>
  );
}
