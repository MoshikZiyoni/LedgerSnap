import React from 'react';
import { ArrowLeft, Shield, CheckCircle, Scale, FileText, RefreshCw } from 'lucide-react';

export default function LegalPage({ pageType, onNavigate }) {
  const isTerms = pageType === 'terms';
  const isPrivacy = pageType === 'privacy';
  const isRefund = pageType === 'refund';

  const title = isTerms 
    ? 'Terms of Service' 
    : isPrivacy 
    ? 'Privacy Policy' 
    : 'Refund & Cancellation Policy';

  const lastUpdated = 'October 15, 2026';

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '48px 24px', color: 'var(--text-light, #f1f5f9)' }}>
      {/* Back button */}
      <button 
        onClick={() => onNavigate('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
          color: 'var(--accent-cyan, #38bdf8)',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '32px',
          fontWeight: '600',
          fontSize: '14px'
        }}
      >
        <ArrowLeft size={16} /> Back to LedgerSnap
      </button>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '36px', borderRadius: '16px', marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {isTerms && <Scale size={28} color="var(--accent-cyan, #38bdf8)" />}
          {isPrivacy && <Shield size={28} color="#10b981" />}
          {isRefund && <RefreshCw size={28} color="#a855f7" />}
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>{title}</h1>
        </div>
        <p style={{ color: 'var(--text-muted, #94a3b8)', margin: 0, fontSize: '14px' }}>
          Effective Date: {lastUpdated} • Applicable to LedgerSnap (ledger-snap.com)
        </p>
      </div>

      {/* Content Body */}
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', lineHeight: 1.8, fontSize: '15px', color: '#cbd5e1' }}>
        {isTerms && (
          <div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: 0 }}>1. Acceptance of Terms</h2>
            <p>
              By accessing and using LedgerSnap (&quot;the Service&quot;), operated at <strong>ledger-snap.com</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue using the Service immediately.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>2. Nature of the Service</h2>
            <p>
              LedgerSnap provides automated PDF statement parsing and format conversion into Intuit QuickBooks (.QBO) and spreadsheet (.XLSX, .CSV) formats. The Service is provided &quot;as-is&quot; and is intended for use by accounting professionals, bookkeepers, and business owners.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>3. Subscriptions &amp; Billing</h2>
            <p>
              Payments for LedgerSnap subscriptions and passes are processed securely by <strong>Paddle.com Market Limited</strong>, our Merchant of Record. By placing an order, you agree to Paddle&apos;s checkout terms and conditions.
            </p>
            <ul>
              <li><strong>Bookkeeper Pro ($19.99/mo):</strong> Recurring monthly subscription. Cancel anytime from your account settings with one click.</li>
              <li><strong>CPA &amp; Accounting Firm ($49.00/mo):</strong> Recurring monthly subscription for high-volume firms and multiple team seats.</li>
              <li><strong>Single Statement Pass ($4.99):</strong> One-time single-use purchase for one statement conversion.</li>
            </ul>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>4. Intellectual Property &amp; Trademarks</h2>
            <p>
              Intuit, QuickBooks, and QBO are registered trademarks of Intuit Inc. LedgerSnap is an independent third-party tool and is not affiliated with, endorsed by, or sponsored by Intuit Inc., JPMorgan Chase, Bank of America, or any other financial institution.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>5. Limitation of Liability</h2>
            <p>
              While LedgerSnap utilizes advanced mathematical checksums to ensure conversion accuracy, users are solely responsible for reviewing and verifying the accuracy of converted financial data before importing it into accounting registers or filing tax returns. In no event shall LedgerSnap be liable for indirect, punitive, or consequential damages.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>6. Contact Us</h2>
            <p>
              If you have any questions regarding these Terms, contact our legal team at <a href="mailto:Moshiktm1994@gmail.com" style={{ color: 'var(--accent-cyan, #38bdf8)' }}>Moshiktm1994@gmail.com</a>.
            </p>
          </div>
        )}

        {isPrivacy && (
          <div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: 0 }}>1. Zero-Retention Financial Privacy Architecture</h2>
            <p>
              LedgerSnap is engineered from the ground up to protect confidential financial records. We adhere to a strict <strong>Zero-Retention Policy</strong>:
            </p>
            <ul>
              <li><strong>Volatile In-Memory Processing:</strong> Uploaded PDF statements are parsed exclusively in ephemeral volatile RAM memory.</li>
              <li><strong>Zero Disk Storage:</strong> Bank statements are never saved to permanent disk storage, databases, or third-party buckets.</li>
              <li><strong>Instant Wipe:</strong> Once your converted .QBO or .XLSX file is downloaded, memory buffers are permanently flushed and wiped.</li>
              <li><strong>No AI Model Training:</strong> We never train AI, machine learning models, or LLMs on your bank transaction details or financial statements.</li>
            </ul>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>2. Information We Collect</h2>
            <p>
              We collect minimal technical and billing metadata strictly necessary to provide the service:
            </p>
            <ul>
              <li><strong>Account &amp; Licensing Information:</strong> Your email address and purchase token to maintain and restore active licenses.</li>
              <li><strong>Technical Metadata:</strong> Anonymized client IDs and conversion counts strictly to enforce free trial quotas.</li>
              <li><strong>Payment Data:</strong> All credit card details are handled directly by our certified Merchant of Record (Paddle.com) under PCI-DSS Level 1 compliance. We never see or store your credit card numbers.</li>
            </ul>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>3. Data Security &amp; Encryption</h2>
            <p>
              All communication between your browser and our servers is secured via 256-bit TLS/SSL encryption. Server endpoints are hosted on SOC 2 Type II certified cloud infrastructure.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>4. GDPR &amp; CCPA Compliance</h2>
            <p>
              You have the right to request the deletion or retrieval of your account email and licensing metadata at any time by contacting <a href="mailto:Moshiktm1994@gmail.com" style={{ color: 'var(--accent-cyan, #38bdf8)' }}>Moshiktm1994@gmail.com</a>.
            </p>
          </div>
        )}

        {isRefund && (
          <div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: 0 }}>1. 14-Day Money-Back Guarantee</h2>
            <p>
              We want you to be completely confident in LedgerSnap. If our converter fails to accurately extract or parse your bank statement, or if your converted .QBO file cannot be imported into QuickBooks, you are eligible for a <strong>100% full refund within 14 days of purchase</strong>.
            </p>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>2. Cancellation of Subscriptions</h2>
            <p>
              You may cancel your <strong>Bookkeeper Pro ($19.99/mo)</strong> or <strong>CPA &amp; Accounting Firm ($49.00/mo)</strong> subscription at any time without fees or penalties:
            </p>
            <ul>
              <li>You can cancel directly through your Paddle receipt link or by emailing our billing support.</li>
              <li>Upon cancellation, your Pro access remains fully active until the end of your current billing period.</li>
              <li>You will never be billed again after cancellation.</li>
            </ul>

            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '32px' }}>3. How to Request a Refund</h2>
            <p>
              To request a refund, simply send an email to <a href="mailto:Moshiktm1994@gmail.com" style={{ color: 'var(--accent-cyan, #38bdf8)' }}>Moshiktm1994@gmail.com</a> with:
            </p>
            <ol>
              <li>The email address used during purchase.</li>
              <li>Your order or transaction reference number (from your Paddle receipt).</li>
              <li>A brief description of the issue or statement problem encountered.</li>
            </ol>
            <p>
              Refund requests are typically processed within 24–48 hours, and funds will be credited directly back to your original payment method.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
