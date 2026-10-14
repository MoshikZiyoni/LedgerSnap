import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Clock, Calendar, 
  ChevronDown, UploadCloud 
} from 'lucide-react';

export default function GuidePage({ guide, onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = guide.metaTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', guide.metaDescription);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://ledger-snap.com/guides/${guide.slug}`);
    }

    // Inject FAQ schema for guide
    const scriptId = 'guide-faq-schema';
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
      "mainEntity": guide.faqs.map(f => ({
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
  }, [guide]);

  return (
    <div style={{ flex: 1, maxWidth: '960px', margin: '0 auto', width: '100%', padding: '36px 24px 80px 24px' }}>
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
        <span style={{ color: 'var(--text-muted)' }}>Guides &amp; Troubleshooting</span>
        <span>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>Article</span>
      </div>

      {/* Guide Header */}
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span className="glass-pill" style={{ color: 'var(--accent-cyan)', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>
            QuickBooks Masterclass
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> {guide.readingTime}
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> {guide.publishedDate}
          </span>
          <span>•</span>
          <span>By {guide.author}</span>
        </div>

        <h1 className="hero-headline" style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: '800', lineHeight: 1.25, marginBottom: '20px', letterSpacing: '-0.8px' }}>
          {guide.title}
        </h1>

        <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '16px', lineHeight: 1.7, color: 'var(--text-main)' }}>
          {guide.intro}
        </div>
      </header>

      {/* Embedded High-Intent Interactive CTA Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px 28px', 
          marginBottom: '48px', 
          border: '1px solid rgba(56, 189, 248, 0.35)', 
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.6) 100%)',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
            <Sparkles size={16} /> Instant Solution Available
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px 0', color: '#fff' }}>
            Convert your Bank Statement PDF in seconds
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            100% compliant .QBO Web Connect format. Zero column mapping required in QuickBooks.
          </p>
        </div>

        <button 
          onClick={() => onNavigate('/')} 
          className="gradient-btn"
          style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UploadCloud size={16} /> Try 1 Statement Free
        </button>
      </div>

      {/* Article Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', marginBottom: '64px' }}>
        {guide.sections.map((sec, idx) => (
          <section key={idx} className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '18px', color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px' }}>
              {sec.heading}
            </h2>
            <div style={{ fontSize: '15px', lineHeight: 1.75, color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
              {sec.content}
            </div>
          </section>
        ))}
      </div>

      {/* Guide FAQs */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {guide.faqs.map((faq, idx) => (
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
          Skip the Manual Data Entry & Import Cleanly Today
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
          Join CPAs and bookkeepers who save dozens of hours each month with LedgerSnap.
        </p>
        <button 
          onClick={() => onNavigate('/')} 
          className="gradient-btn"
          style={{ padding: '12px 28px', fontSize: '15px' }}
        >
          <UploadCloud size={16} /> Open LedgerSnap Converter
        </button>
      </div>
    </div>
  );
}
