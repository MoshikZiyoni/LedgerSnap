import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, Sparkles, RefreshCw, AlertCircle, CheckCircle2, 
  ChevronDown 
} from 'lucide-react';

export default function BankLandingPage({ 
  bank, 
  onFileUpload, 
  isLoading, 
  parsingStep, 
  error, 
  onLoadSample,
  onNavigate 
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Update dynamic meta tags and JSON-LD schema for this bank
  useEffect(() => {
    document.title = bank.metaTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', bank.metaDescription);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://ledger-snap.com/convert/${bank.slug}`);
    }

    // Inject bank-specific FAQ schema
    const schemaScriptId = 'bank-faq-schema';
    let existingScript = document.getElementById(schemaScriptId);
    if (!existingScript) {
      existingScript = document.createElement('script');
      existingScript.id = schemaScriptId;
      existingScript.type = 'application/ld+json';
      document.head.appendChild(existingScript);
    }

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": bank.faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a
        }
      }))
    };
    existingScript.text = JSON.stringify(faqSchema);

    return () => {
      // Revert title on unmount
      document.title = "LedgerSnap | Convert Bank Statement PDF to QuickBooks (.QBO) & Excel";
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [bank]);

  return (
    <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '36px 24px 80px 24px' }}>
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
        <span style={{ color: 'var(--text-muted)' }}>Bank Statement Converters</span>
        <span>/</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{bank.name}</span>
      </div>

      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div 
          className="glass-pill pulse-badge" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 20px', 
            marginBottom: '20px', 
            color: 'var(--accent-cyan)', 
            fontSize: '13px', 
            fontWeight: '700', 
            border: '1px solid rgba(56, 189, 248, 0.4)' 
          }}
        >
          <Sparkles size={16} color="#10b981" />
          <span>Pre-Tuned Layout Algorithms for <strong>{bank.name}</strong> • 1 Free Statement Included</span>
        </div>

        <h1 className="hero-headline" style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: '800', lineHeight: 1.18, marginBottom: '20px', letterSpacing: '-0.8px' }}>
          {bank.heroH1}
        </h1>

        <p className="hero-subtext" style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '780px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
          {bank.heroSub}
        </p>

        {/* Specific Pain Point Callout */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '10px 20px', borderRadius: '30px', fontSize: '13px', color: '#93c5fd' }}>
          <CheckCircle2 size={16} color="var(--accent-cyan)" />
          <span><strong>Engineered for:</strong> {bank.painPoint}</span>
        </div>
      </div>

      {/* Direct Feed Limitation Alert Notice */}
      {bank.directFeedLimitNotice && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.08)',
          border: '1.5px solid rgba(234, 179, 8, 0.35)',
          borderRadius: '14px',
          padding: '14px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fef08a',
          fontSize: '14px',
          boxShadow: '0 4px 20px rgba(234, 179, 8, 0.08)'
        }}>
          <AlertCircle size={20} color="#eab308" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#fff' }}>⚡ Why You Need LedgerSnap for {bank.name}:</strong>{' '}
            <span>{bank.directFeedLimitNotice}</span>
          </div>
        </div>
      )}

      {/* Interactive Studio Dropzone embedded in the Hero */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '64px', border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)' }}>
        <div 
          className={`dropzone ${isDragOver ? 'drag-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              onFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => document.getElementById('bank-pdf-input').click()}
        >
          <input 
            type="file" 
            id="bank-pdf-input" 
            accept=".pdf" 
            style={{ display: 'none' }} 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileUpload(e.target.files[0]);
              }
            }}
          />

          {isLoading ? (
            <div style={{ padding: '24px 12px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <RefreshCw className="animate-spin" size={36} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '10px' }}>
                {parsingStep === 1 && `🔍 Step 1/3: Parsing ${bank.name} Statement Layout...`}
                {parsingStep === 2 && `⚡ Step 2/3: Calculating Balance Checksum & Sorting Credits/Debits...`}
                {parsingStep === 3 && `✨ Step 3/3: Generating Certified .QBO & Excel Spreadsheet...`}
              </h3>
              <p className="shimmer-text" style={{ fontSize: '15px', fontWeight: '600', maxWidth: '500px', margin: '0 auto' }}>
                Zero data retention in memory. 100% private & secure.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <UploadCloud size={32} />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
                Drop your {bank.name} PDF Statement here
              </h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '20px' }}>
                Supports checking, savings, and credit card statements. Instant in-memory conversion with zero disk logging.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button type="button" className="gradient-btn" style={{ padding: '14px 26px', fontSize: '15px', fontWeight: '700' }}>
                    <UploadCloud size={18} /> Select {bank.name} PDF
                  </button>
                  <button 
                    type="button" 
                    id="bank-live-demo-trigger"
                    onClick={(e) => { e.stopPropagation(); onLoadSample(); }}
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.25) 100%)',
                      color: '#fff', 
                      border: '1.5px solid rgba(56, 189, 248, 0.6)', 
                      padding: '14px 26px', 
                      borderRadius: '12px', 
                      fontWeight: '800', 
                      fontSize: '15px',
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      boxShadow: '0 0 25px rgba(56, 189, 248, 0.35)',
                      transition: 'all 0.25s ease' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 0 35px rgba(56, 189, 248, 0.6)';
                      e.currentTarget.style.borderColor = '#38bdf8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.35)';
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)';
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#38bdf8', color: '#090d16', fontSize: '12px', fontWeight: '900' }}>▶</span>
                    <span>⚡ Run Live 2-Second {bank.name} PDF Demo</span>
                  </button>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>✓ 1-Click Interactive Test</span>
                  <span>•</span>
                  <span>No file upload required</span>
                  <span>•</span>
                  <span>Sample {bank.name} mathematical checksum</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>

      {/* Bank Video Player with autoPlay, muted, loop, playsInline (NavBoost & Dwell-Time) */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div 
            className="glass-pill" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 16px', 
              marginBottom: '12px', 
              color: 'var(--accent-cyan)', 
              fontSize: '12px', 
              fontWeight: '700',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
          >
            <Sparkles size={14} color="#38bdf8" />
            Verified Technical Proof & Demonstration
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: '800', marginBottom: '10px' }}>
            Watch {bank.name} PDF Statements Import Directly into QuickBooks Online
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            See how our deterministic parsing engine converts {bank.name} statements into certified Intuit .QBO Web Connect format in real time.
          </p>
        </div>

        <div 
          className="glass-panel" 
          style={{ 
            maxWidth: '920px', 
            margin: '0 auto', 
            padding: '16px', 
            borderRadius: '20px', 
            border: '1px solid rgba(56, 189, 248, 0.25)',
            background: 'rgba(15, 23, 42, 0.8)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
          }}
        >
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              paddingTop: '56.25%', 
              borderRadius: '12px', 
              overflow: 'hidden',
              background: '#090d16'
            }}
          >
            <video
              src="/demo/ledgersnap-qbo-demo.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="auto"
              poster="/demo/poster.png"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            >
              Your browser does not support the video tag.
            </video>

            <div
              style={{
                position: 'absolute',
                bottom: '50px',
                left: '16px',
                zIndex: 10,
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                color: '#94a3b8',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                pointerEvents: 'none'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Live {bank.name} Import Demonstration • Auto-Looping
            </div>
          </div>
        </div>
      </section>

      {/* How Bank Statements Map to QuickBooks .QBO Preview Table */}
      {bank.mappingPreview && bank.mappingPreview.length > 0 && (
        <section style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div 
              className="glass-pill" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '6px 16px', 
                marginBottom: '12px', 
                color: 'var(--accent-cyan)', 
                fontSize: '12px', 
                fontWeight: '700',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            >
              <Sparkles size={14} color="#38bdf8" />
              Technical Specification &amp; Tag Mapping
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 30px)', fontWeight: '800', marginBottom: '10px' }}>
              How {bank.name} Statements Map to QuickBooks .QBO
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
              Our pre-tuned parsing rules transform raw {bank.name} PDF statement columns into certified Intuit Web Connect SGML tags.
            </p>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.65)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px 20px', fontWeight: '700' }}>Statement Field</th>
                  <th style={{ padding: '16px 20px', fontWeight: '700' }}>{bank.name} PDF Format</th>
                  <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--accent-cyan)' }}>Generated .QBO / OFX Tag</th>
                  <th style={{ padding: '16px 20px', fontWeight: '700' }}>QuickBooks Online &amp; Desktop Behavior</th>
                </tr>
              </thead>
              <tbody>
                {bank.mappingPreview.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '700', color: '#fff' }}>{row.field}</td>
                    <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: 'var(--text-dim)', fontSize: '12px' }}>{row.raw}</td>
                    <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: '600' }}>{row.qboTag}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{row.qbBehavior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bank Specific Feature Highlights */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>
          Engineered Specifically for {bank.name} Statement Layouts
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {bank.features.map((feat, i) => (
            <div key={i} className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', flexShrink: 0 }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-main)', fontWeight: '500' }}>
                  {feat}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-Step Guide */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
            {bank.stepGuide.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Follow these 3 easy steps to populate your QuickBooks bank register.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {bank.stepGuide.steps.map((st) => (
            <div key={st.num} className="glass-panel" style={{ padding: '28px', position: 'relative' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', marginBottom: '16px' }}>
                {st.num}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
                {st.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bank-Specific FAQs */}
      <section style={{ maxWidth: '800px', margin: '0 auto 40px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>
            Frequently Asked Questions: {bank.name} to QuickBooks
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Everything you need to know about converting {bank.name} statements.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bank.faqs.map((faq, idx) => (
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
          Ready to convert your {bank.name} PDF statement?
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
          Get 1 free full statement conversion with zero card required. Test direct QuickBooks Online import in under 60 seconds.
        </p>
        <button 
          onClick={() => window.scrollTo({ top: 120, behavior: 'smooth' })} 
          className="gradient-btn"
          style={{ padding: '12px 28px', fontSize: '15px' }}
        >
          <UploadCloud size={16} /> Convert {bank.name} PDF Now
        </button>
      </div>
    </div>
  );
}
