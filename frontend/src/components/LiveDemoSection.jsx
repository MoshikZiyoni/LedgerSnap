import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, ShieldCheck, Database, FileSpreadsheet } from 'lucide-react';

export default function LiveDemoSection({ onTryChaseDemo }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = React.useRef(null);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <section style={{ marginBottom: '80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div 
          className="glass-pill" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 16px', 
            marginBottom: '14px', 
            color: 'var(--accent-cyan)', 
            fontSize: '12px', 
            fontWeight: '700',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          <ShieldCheck size={15} color="#38bdf8" />
          Verified Technical Proof & Accounting Standards
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          See LedgerSnap in Action: PDF to QuickBooks Online in 45 Seconds
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          Watch a real multi-page Chase PDF statement convert into a validated .QBO Web Connect file and import cleanly into QuickBooks Online with zero column mapping.
        </p>
      </div>

      {/* Part A — Embedded Demo Video Container (id="live-demo-video") */}
      <div 
        id="live-demo-video" 
        className="glass-panel" 
        style={{ 
          maxWidth: '920px', 
          margin: '0 auto 48px auto', 
          padding: '16px', 
          borderRadius: '20px', 
          border: '1px solid rgba(56, 189, 248, 0.25)',
          background: 'rgba(15, 23, 42, 0.8)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.1)'
        }}
      >
        <div 
          style={{ 
            position: 'relative', 
            width: '100%', 
            paddingTop: '56.25%', /* 16:9 Aspect Ratio */
            borderRadius: '12px', 
            overflow: 'hidden',
            background: '#090d16'
          }}
        >
          <video
            ref={videoRef}
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
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>

          {/* Sound Mute/Unmute Quick Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 10,
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '20px',
              color: '#fff',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            {isMuted ? <span style={{ color: '#38bdf8' }}>🔇 Muted (Click for Sound)</span> : <span style={{ color: '#10b981' }}>🔊 Sound On</span>}
          </button>

          {/* Live indicator badge */}
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
            Live QBO Import Demo • Auto-Looping
          </div>
        </div>

        {/* Action Button Right Below Player */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '18px', padding: '8px 0', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onTryChaseDemo}
            className="gradient-btn"
            style={{ 
              padding: '12px 28px', 
              fontSize: '14px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.35)' 
            }}
          >
            <Sparkles size={16} color="#fff" /> Try with Chase Demo Statement
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
            Instant sample session • No upload needed
          </span>
        </div>
      </div>

      {/* Part B — 3 Verifiable Engineering & Accounting Guarantees */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Card 1 */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '30px', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <CheckCircle2 size={26} />
            </div>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#10b981', fontWeight: '800' }}>Guarantee #1</span>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>100% Mathematical Balance Checksum</h3>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.65, flex: 1 }}>
            Every extracted transaction row is mathematically reconciled against your statement's opening and closing balances (<strong>Opening Balance + Credits - Debits = Closing Balance</strong>). If a single cent is off, LedgerSnap flags the exact row before export.
          </p>
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
            <span>✓ Penny-level ledger balance verification</span>
          </div>
        </div>

        {/* Card 2 */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '30px', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <FileSpreadsheet size={26} />
            </div>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#38bdf8', fontWeight: '800' }}>Guarantee #2</span>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Native Intuit .QBO (OFX 200) Schema</h3>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.65, flex: 1 }}>
            Generic CSV converters fail in QuickBooks due to broken date formats, merged debit/credit columns, and missing FIDs. LedgerSnap outputs compliant .QBO Web Connect files that import in one click.
          </p>
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>
            <span>✓ Certified INTU.BID & FITID transaction tags</span>
          </div>
        </div>

        {/* Card 3 */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '30px', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Database size={26} />
            </div>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#818cf8', fontWeight: '800' }}>Guarantee #3</span>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Multi-Line & Israeli/Intl Statements</h3>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.65, flex: 1 }}>
            Accurately parses floating check numbers, multi-line payee descriptions, running balances, and bi-directional (RTL Hebrew/English) statements that break standard OCR tools.
          </p>
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#818cf8', fontWeight: '700' }}>
            <span>✓ Bi-directional RTL & multi-line payee engine</span>
          </div>
        </div>
      </div>
    </section>
  );
}
