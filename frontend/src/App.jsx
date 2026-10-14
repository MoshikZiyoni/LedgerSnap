import React, { useState } from 'react';
import { 
  FileText, UploadCloud, CheckCircle2, AlertCircle, Download, 
  Search, ShieldCheck, Zap, ArrowRight, Lock, Sparkles, Building2,
  RefreshCw, DollarSign, BarChart3, HelpCircle, ChevronDown, Check,
  BookOpen, X, ExternalLink, PieChart, Filter, TrendingDown, Layers,
  Eye, Cookie
} from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000' : '');

const getClientId = () => {
  try {
    let cid = localStorage.getItem('ls_client_id');
    if (!cid) {
      cid = 'cid_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('ls_client_id', cid);
    }
    return cid;
  } catch {
    return 'cid_anonymous';
  }
};

const categorizeTransaction = (desc = '', amt = 0) => {
  const d = (desc || '').toUpperCase();
  if (amt > 0) {
    return {
      category: 'Income & Deposits',
      color: '#10b981',
      qbAccount: '40000 • Gross Sales & Client Revenue',
      icon: '💵'
    };
  }
  if (d.includes('GUSTO') || d.includes('PAYROLL') || d.includes('ADP') || d.includes('SALARY') || d.includes('WAGE') || d.includes('TAX DEDUCT')) {
    return {
      category: 'Payroll & Compensation',
      color: '#ec4899',
      qbAccount: '60000 • Payroll & Contractor Expenses',
      icon: '👥'
    };
  }
  if (d.includes('AWS') || d.includes('AMAZON WEB') || d.includes('GOOGLE') || d.includes('MICROSOFT') || d.includes('SLACK') || d.includes('GITHUB') || d.includes('INTUIT') || d.includes('QUICKBOOKS') || d.includes('ZOOM') || d.includes('ADOBE') || d.includes('NOTION') || d.includes('CLOUD') || d.includes('HOSTING')) {
    return {
      category: 'Software & Cloud SaaS',
      color: '#38bdf8',
      qbAccount: '63000 • Dues & Tech Subscriptions',
      icon: '☁️'
    };
  }
  if (d.includes('VERIZON') || d.includes('AT&T') || d.includes('T-MOBILE') || d.includes('UTILITY') || d.includes('ELECTRIC') || d.includes('POWER') || d.includes('WATER') || d.includes('COMED') || d.includes('INTERNET')) {
    return {
      category: 'Telecom & Utilities',
      color: '#a855f7',
      qbAccount: '65000 • Utilities & Communications',
      icon: '⚡'
    };
  }
  if (d.includes('FEE') || d.includes('WIRE') || d.includes('BANK') || d.includes('MONTHLY') || d.includes('LEGAL') || d.includes('CPA') || d.includes('ACCOUNTING')) {
    return {
      category: 'Professional & Bank Fees',
      color: '#f59e0b',
      qbAccount: '68000 • Bank Service Charges & Fees',
      icon: '🏛️'
    };
  }
  return {
    category: 'General Operating Expenses',
    color: '#64748b',
    qbAccount: '69000 • General & Administrative',
    icon: '📦'
  };
};

const SAMPLE_DEMO_DATA = {
  file_id: "demo-sample-chase-statement",
  filename: "Chase_Business_Checking_October_2026.pdf",
  bank_name: "JPMorgan Chase Bank, N.A.",
  summary: {
    count: 12,
    total_credits: 7450.00,
    total_debits: 2423.30,
    net_change: 5026.70,
    bank_detected: "JPMorgan Chase Bank, N.A."
  },
  preview: [
    { date: "10/01/2026", description: "STRIPE PAYMENTS TRANSFER PPD", amount: 2450.00, type: "Credit", balance: 14250.00 },
    { date: "10/02/2026", description: "AMAZON WEB SERVICES AWS.AMAZON.COM WA", amount: -148.50, type: "Debit", balance: 14101.50 },
    { date: "10/03/2026", description: "GUSTO PAYROLL PE1024 TAX DEDUCT", amount: -1850.00, type: "Debit", balance: 12251.50 },
    { date: "10/05/2026", description: "GOOGLE WORKSPACE CC GOOGLE.COM CA", amount: -36.00, type: "Debit", balance: 12215.50 },
    { date: "10/07/2026", description: "CLIENT WIRE INVOICE #1042 CORP INC", amount: 3800.00, type: "Credit", balance: 16015.50 },
    { date: "10/09/2026", description: "MICROSOFT 365 MSBILL.INFO WA", amount: -22.00, type: "Debit", balance: 15993.50 },
    { date: "10/11/2026", description: "SLACK TECHNOLOGIES SUBSCRIPTION", amount: -45.00, type: "Debit", balance: 15948.50 },
    { date: "10/12/2026", description: "GITHUB ENTERPRISE SEATTLE WA", amount: -21.00, type: "Debit", balance: 15927.50 },
    { date: "10/14/2026", description: "VERIZON WIRELESS ONLINE PMT", amount: -115.80, type: "Debit", balance: 15811.70 },
    { date: "10/15/2026", description: "CLIENT CONSULTING PAYMENT ACME LLC", amount: 1200.00, type: "Credit", balance: 17011.70 },
    { date: "10/16/2026", description: "INTUIT QUICKBOOKS ONLINE MTHLY", amount: -85.00, type: "Debit", balance: 16926.70 },
    { date: "10/18/2026", description: "CHASE BUSINESS CHECKING MONTHLY FEE WAIVED", amount: 0.00, type: "Credit", balance: 16926.70 }
  ]
};

export default function App() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversionData, setConversionData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('qbo');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState('step1');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Licensing & Checkout State
  const [license, setLicense] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bqbo_license')) || null;
    } catch {
      return null;
    }
  });
  const [freeUsed, setFreeUsed] = useState(() => {
    try {
      return parseInt(localStorage.getItem('ls_free_used') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [calculatorStatements, setCalculatorStatements] = useState(10);
  const [parsingStep, setParsingStep] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState('pro_monthly');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutTab, setCheckoutTab] = useState('plans');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  // Accessibility & Cookie Consent State
  const [showCookieBanner, setShowCookieBanner] = useState(() => {
    try {
      return !localStorage.getItem('ls_cookie_consent');
    } catch {
      return false;
    }
  });

  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const [a11ySettings, setA11ySettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ls_a11y_settings');
      return saved ? JSON.parse(saved) : {
        contrast: false,
        largeText: false,
        highlightLinks: false,
        readableFont: false,
      };
    } catch {
      return { contrast: false, largeText: false, highlightLinks: false, readableFont: false };
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('ls_a11y_settings', JSON.stringify(a11ySettings));
    } catch (e) {
      console.error(e);
    }
    document.body.classList.toggle('high-contrast', !!a11ySettings.contrast);
    document.body.classList.toggle('large-text', !!a11ySettings.largeText);
    document.body.classList.toggle('highlight-links', !!a11ySettings.highlightLinks);
    document.body.classList.toggle('readable-font', !!a11ySettings.readableFont);
  }, [a11ySettings]);

  const handleAcceptCookies = (type = 'all') => {
    try {
      localStorage.setItem('ls_cookie_consent', type);
    } catch (e) {
      console.error(e);
    }
    setShowCookieBanner(false);
  };

  const toggleA11y = (key) => {
    setA11ySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetA11y = () => {
    setA11ySettings({
      contrast: false,
      largeText: false,
      highlightLinks: false,
      readableFont: false,
    });
  };

  // Sync free tier status by IP & persistent client ID from server upon mount
  React.useEffect(() => {
    const cid = getClientId();
    fetch(`${API_BASE}/api/free-tier/status?client_id=${cid}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.conversions_used !== undefined) {
          setFreeUsed(data.conversions_used);
          if (data.conversions_used >= 1) {
            localStorage.setItem('ls_free_used', String(data.conversions_used));
          }
        }
      })
      .catch(console.error);
  }, []);

  // Check URL parameter for incoming license redirect or Lemon Squeezy / Stripe checkout completion
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSessionId = params.get('stripe_session_id');
    const urlLic = params.get('license') || params.get('license_key');
    const lsSuccess = params.get('ls_success');
    const returnPlan = params.get('plan');

    if (stripeSessionId) {
      fetch(`${API_BASE}/api/stripe/verify-session?session_id=${stripeSessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.license_key) {
            setLicense(data);
            localStorage.setItem('bqbo_license', JSON.stringify(data));
            triggerConfetti();
            if (window.trackLedgerEvent) {
              window.trackLedgerEvent('purchase_success', { plan: data.plan });
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(console.error);
    } else if (urlLic) {
      fetch(`${API_BASE}/api/license/status?license_key=${urlLic}`)
        .then(r => r.json())
        .then(data => {
          if (data.has_license) {
            setLicense(data);
            localStorage.setItem('bqbo_license', JSON.stringify(data));
            triggerConfetti();
            if (window.trackLedgerEvent) {
              window.trackLedgerEvent('purchase_success', { plan: data.plan });
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(console.error);
    } else if (lsSuccess) {
      // Returned from Lemon Squeezy Checkout
      triggerConfetti();
      setCheckoutMessage('🎉 Payment successful! Check your email for your license key.');
      setIsCheckoutOpen(true);
      setCheckoutTab('restore');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF bank statement.');
      return;
    }

    // Check if free trial already consumed on frontend
    if (!hasActiveLicense && freeUsed >= 1) {
      setIsCheckoutOpen(true);
      setCheckoutTab('plans');
      setCheckoutPlan('pro_monthly');
      setCheckoutMessage('⚡ Free trial limit reached! You have already converted 1 statement for free. Upgrade to Pro ($19.99/mo) or purchase a Single Pass ($4.99) to convert more:');
      return;
    }

    setError(null);
    setIsLoading(true);
    setParsingStep(1);

    const timer1 = setTimeout(() => setParsingStep(2), 900);
    const timer2 = setTimeout(() => setParsingStep(3), 1800);

    if (window.trackLedgerEvent) {
      window.trackLedgerEvent('file_uploaded', { filename: file.name });
    }

    const cid = getClientId();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_id', cid);
    if (license?.license_key) {
      formData.append('license_key', license.license_key);
    }

    try {
      const response = await fetch(`${API_BASE}/api/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        if (response.status === 402) {
          setFreeUsed(1);
          try { localStorage.setItem('ls_free_used', '1'); } catch {}
          setIsCheckoutOpen(true);
          setCheckoutTab('plans');
          setCheckoutPlan('pro_monthly');
          setCheckoutMessage('⚡ Free trial limit reached for your IP address! Upgrade to Pro ($19.99/mo) or get a Single Pass ($4.99) to convert this file:');
          throw new Error(errJson?.detail || 'Free trial limit reached.');
        }
        throw new Error(errJson?.detail || `Server returned ${response.status}`);
      }

      const result = await response.json();
      setConversionData(result);
      setSelectedCategory('all');
      triggerConfetti();

      // If user converted on free tier, record locally as consumed
      if (!hasActiveLicense) {
        setFreeUsed(1);
        try { localStorage.setItem('ls_free_used', '1'); } catch {}
      }

      if (window.trackLedgerEvent) {
        window.trackLedgerEvent('conversion_success', { 
          count: result.summary?.count, 
          bank: result.bank_name 
        });
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err.message || 'Failed to parse statement. Please ensure it is a valid PDF statement.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
      setParsingStep(1);
    }
  };

  const loadSample = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/sample`);
      if (res.ok) {
        const data = await res.json();
        setConversionData(data);
        setSelectedCategory('all');
      } else {
        setConversionData(SAMPLE_DEMO_DATA);
        setSelectedCategory('all');
      }
    } catch {
      setConversionData(SAMPLE_DEMO_DATA);
      setSelectedCategory('all');
    } finally {
      setIsLoading(false);
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const hasActiveLicense = Boolean(license && (license.has_license || license.license_key));

  const handleDownload = async () => {
    if (!conversionData) return;

    const fileId = conversionData.file_id || 'demo-sample-chase-statement';
    const cid = getClientId();
    const licParam = license?.license_key ? `&license_key=${encodeURIComponent(license.license_key)}` : '';
    const downloadUrl = `${API_BASE}/api/download/${fileId}?format=${selectedFormat}&client_id=${cid}${licParam}`;

    try {
      const res = await fetch(downloadUrl);
      if (res.status === 402) {
        setFreeUsed(1);
        try { localStorage.setItem('ls_free_used', '1'); } catch {}
        setIsCheckoutOpen(true);
        setCheckoutTab('plans');
        setCheckoutPlan('pro_monthly');
        setCheckoutMessage('⚡ Free conversion limit reached for your IP! Choose a plan below to instantly download your statement:');
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.detail || `Download failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const baseFilename = (conversionData.filename || 'statement').replace(/\.pdf$/i, '');
      link.setAttribute('download', `${baseFilename}.${selectedFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      triggerConfetti();

      if (!hasActiveLicense) {
        setFreeUsed(1);
        try { localStorage.setItem('ls_free_used', '1'); } catch {}
      }

      if (window.trackLedgerEvent) {
        window.trackLedgerEvent('download_completed', { format: selectedFormat });
      }
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Download failed. Please try again.');
    }
  };

  const handleActivateLicense = async (e) => {
    e.preventDefault();
    if (!checkoutEmail || !checkoutEmail.includes('@')) {
      setCheckoutError('Please enter a valid email address.');
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutMessage(null);

    if (window.trackLedgerEvent) {
      window.trackLedgerEvent('checkout_started', { plan: checkoutPlan, email: checkoutEmail });
    }

    try {
      const res = await fetch(`${API_BASE}/api/checkout/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: checkoutEmail, 
          plan: checkoutPlan,
          origin: window.location.origin
        })
      });
      const data = await res.json();
      if (data.url) {
        if (data.demo_mode && data.license) {
          setLicense(data.license);
          localStorage.setItem('bqbo_license', JSON.stringify(data.license));
          setCheckoutMessage('🎉 Payment successful! Pro access activated.');
          triggerConfetti();
          setTimeout(() => {
            setIsCheckoutOpen(false);
            setCheckoutMessage(null);
          }, 1500);
        } else {
          // Hosted Lemon Squeezy / Stripe Checkout redirect
          window.location.href = data.url;
        }
      } else {
        throw new Error(data.detail || 'Failed to initiate checkout session');
      }
    } catch (err) {
      setCheckoutError(err.message || 'Payment failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleRestoreLicense = async (e) => {
    e.preventDefault();
    if (!checkoutEmail || !checkoutEmail.includes('@')) {
      setCheckoutError('Please enter your purchase email address.');
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/license/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: checkoutEmail })
      });
      const data = await res.json();
      if (data.success) {
        setLicense(data);
        localStorage.setItem('bqbo_license', JSON.stringify(data));
        setCheckoutMessage('🎉 Active license found and restored!');
        triggerConfetti();
        setTimeout(() => {
          setIsCheckoutOpen(false);
          setCheckoutMessage(null);
        }, 1500);
      } else {
        setCheckoutError('No active license found for this email.');
      }
    } catch {
      setCheckoutError('Email not found. Please verify your purchase email.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const monthFiltered = selectedMonth === 'all'
    ? (conversionData?.preview || [])
    : (conversionData?.preview || []).filter(t => {
        const parts = t.date.split('/');
        return parts.length === 3 && `${parts[1]}/${parts[2]}` === selectedMonth;
      });

  const categoryFiltered = selectedCategory === 'all'
    ? monthFiltered
    : monthFiltered.filter(t => categorizeTransaction(t.description, t.amount).category === selectedCategory);

  const filteredTransactions = categoryFiltered.filter(item => 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date.includes(searchQuery)
  );

  const activeCredits = monthFiltered.reduce((sum, t) => t.amount > 0 ? sum + t.amount : sum, 0);
  const activeDebits = monthFiltered.reduce((sum, t) => t.amount < 0 ? sum + Math.abs(t.amount) : sum, 0);

  // Compute expense categories for spending distribution chart
  const expenseTransactions = monthFiltered.filter(t => t.amount < 0);
  const totalExpenses = expenseTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const categoryMap = {};
  expenseTransactions.forEach(t => {
    const cat = categorizeTransaction(t.description, t.amount);
    if (!categoryMap[cat.category]) {
      categoryMap[cat.category] = {
        name: cat.category,
        color: cat.color,
        icon: cat.icon,
        qbAccount: cat.qbAccount,
        total: 0,
        count: 0
      };
    }
    categoryMap[cat.category].total += Math.abs(t.amount);
    categoryMap[cat.category].count += 1;
  });

  const expenseCategories = Object.values(categoryMap).sort((a, b) => b.total - a.total);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Value Banner */}
      <div style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '10px 16px', textAlign: 'center', fontSize: '13px', color: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '700' }}>
          <Sparkles size={14} /> 1 Full Statement Conversion Free
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
        <span>Certified Intuit QuickBooks Web Connect (.QBO) & Excel (.XLSX)</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
        <span style={{ color: '#e2e8f0' }}>Zero Manual Data Entry</span>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10, 14, 23, 0.9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setConversionData(null)}>
          <img 
            src="/logo.svg" 
            alt="LedgerSnap Logo" 
            style={{ width: '42px', height: '42px', borderRadius: '10px', boxShadow: '0 4px 18px rgba(56, 189, 248, 0.35)', transition: 'transform 0.2s ease', flexShrink: 0 }} 
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: 'var(--font-display)' }}>Ledger<span style={{ color: 'var(--accent-cyan)' }}>Snap</span></span>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Bank to QuickBooks AI</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button 
            onClick={() => setIsGuideOpen(true)}
            style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={15} /> Quick Guide
          </button>
          <a href="#roi-calculator" className="desktop-nav-link" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Calculator</a>
          <a href="#how-it-works" className="desktop-nav-link" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Why LedgerSnap</a>
          <a href="#pricing" className="desktop-nav-link" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Pricing</a>
          <a href="#faq" className="desktop-nav-link" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>FAQ</a>
          
          {hasActiveLicense ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
              <ShieldCheck size={15} /> Pro Member Active
            </div>
          ) : freeUsed === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="glass-pill pulse-badge" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '700', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> 1 Free Conversion
              </span>
              <button 
                onClick={() => { setIsCheckoutOpen(true); setCheckoutTab('plans'); }} 
                className="gradient-btn" 
                style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Zap size={14} /> Get Unlimited Pro
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => { setIsCheckoutOpen(true); setCheckoutTab('restore'); }} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Restore License
              </button>
              <button 
                onClick={() => { setIsCheckoutOpen(true); setCheckoutTab('plans'); }} 
                className="gradient-btn" 
                style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Zap size={14} /> Upgrade to Pro ($19.99)
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="glass-pill pulse-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', marginBottom: '20px', color: '#38bdf8', fontSize: '13px', fontWeight: '700', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
            <Sparkles size={16} color="#10b981" /> 
            <span>Try It Free: <strong>Convert 1 Statement at $0 Cost</strong> • No Card Required</span>
          </div>
          <h1 className="hero-headline" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '800', lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-1px' }}>
            Convert Bank Statement PDF to <br />
            <span className="gradient-text">QuickBooks (.QBO) & Excel</span> in Seconds
          </h1>
          <p className="hero-subtext" style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto 28px auto' }}>
            Stop wasting hours manually retyping bank transactions. Instantly converts Chase, Bank of America, Wells Fargo & 500+ bank statements into certified Intuit QuickBooks and clean Excel spreadsheets with 100% mathematical accuracy.
          </p>
        </div>

        {/* Studio Card / Dropzone */}
        <div className="glass-panel" style={{ padding: '32px', marginBottom: '64px' }}>
          {!conversionData ? (
            <div>
              <div 
                className={`dropzone ${isDragOver ? 'drag-active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => document.getElementById('pdf-file-input').click()}
              >
                <input 
                  type="file" 
                  id="pdf-file-input" 
                  accept=".pdf" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {isLoading ? (
                  <div style={{ padding: '24px 12px' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                      <RefreshCw className="animate-spin" size={36} />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '10px' }}>
                      {parsingStep === 1 && "🔍 Step 1/3: Reading Bank Statement PDF Layout..."}
                      {parsingStep === 2 && "⚡ Step 2/3: Extracting Transactions & Verifying Math Checksums..."}
                      {parsingStep === 3 && "✨ Step 3/3: Building Certified QuickBooks (.QBO) & Excel..."}
                    </h3>
                    <p className="shimmer-text" style={{ fontSize: '15px', fontWeight: '600', maxWidth: '500px', margin: '0 auto' }}>
                      Deterministic in-memory OCR extraction. 100% private & secure.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                      <UploadCloud size={32} />
                    </div>

                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
                      Drop your Bank Statement PDF here
                    </h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '20px' }}>
                      Supports all major US & international banks. 256-bit ephemeral RAM processing. No passwords required.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button type="button" className="gradient-btn">
                        <UploadCloud size={16} /> Select Statement PDF
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); loadSample(); }}
                        style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '12px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                      >
                        <Sparkles size={16} color="#38bdf8" /> Try with Chase Demo Statement
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              {/* Supported Bank Badges */}
              <div id="supported-banks" style={{ marginTop: '32px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', fontWeight: '600' }}>Pre-Tuned Layout Algorithms For</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {['JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One', 'Barclays', 'TD Bank', 'Bank Hapoalim', 'Bank Leumi', 'Israel Discount Bank'].map((bank, i) => (
                    <span key={i} className="glass-pill" style={{ padding: '6px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      🏛️ {bank}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Conversion Result Dashboard */
            <div>
              {/* Free Trial / Pro Status Alert Box */}
              {!hasActiveLicense && (
                freeUsed === 0 ? (
                  <div style={{ marginBottom: '24px', padding: '14px 20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🎁</span>
                      <div>
                        <strong style={{ color: '#10b981', fontSize: '14px' }}>Free Trial Pass Active:</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '6px' }}>
                          You can download this entire statement 100% FREE! Test importing the .QBO file into QuickBooks Online with zero risk.
                        </span>
                      </div>
                    </div>
                    <span className="glass-pill" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>
                      1/1 Free Pass Available
                    </span>
                  </div>
                ) : (
                  <div style={{ marginBottom: '24px', padding: '14px 20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>⚡</span>
                      <div>
                        <strong style={{ color: '#f59e0b', fontSize: '14px' }}>Free Trial Statement Used:</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '6px' }}>
                          You have used your 1 free download. Upgrade to Pro ($19.99/mo) or get a Single Pass ($4.99) to export this statement.
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setIsCheckoutOpen(true); setCheckoutPlan('pro_monthly'); }} 
                      className="gradient-btn" 
                      style={{ padding: '6px 16px', fontSize: '12px', fontWeight: '700' }}
                    >
                      <Zap size={13} /> Unlock Export Now
                    </button>
                  </div>
                )
              )}

              {/* Header result bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className="glass-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '4px 12px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      ✓ Parsed Successfully
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{conversionData.filename}</span>
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{conversionData.bank_name || 'Commercial Bank'} Statement</h2>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setConversionData(null)} 
                    style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Convert Another PDF
                  </button>

                  <button onClick={handleDownload} className="gradient-btn" style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '700' }}>
                    <Download size={16} /> 
                    {hasActiveLicense 
                      ? `Download ${selectedFormat.toUpperCase()} File`
                      : freeUsed === 0 
                        ? `Download ${selectedFormat.toUpperCase()} Free (1 Left)`
                        : `Unlock & Download ${selectedFormat.toUpperCase()}`}
                  </button>
                </div>
              </div>

              {/* Financial Metrics Strip */}
              {(() => {
                const curr = conversionData?.summary?.currency_symbol || (
                  ['Yahav', 'Hapoalim', 'Leumi', 'Discount', 'Mizrahi', 'FIBI', 'MAX', 'Isracard', 'Cal'].some(b => (conversionData?.bank_name || '').includes(b)) ? '₪' : '$'
                );
                const monthCount = conversionData?.summary?.months?.length || 1;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {/* Card 1: Ending Balance */}
                    <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Account Ending Balance</span>
                      <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#fff' }}>
                        {curr}{conversionData.summary.ending_balance !== null && conversionData.summary.ending_balance !== undefined ? conversionData.summary.ending_balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : conversionData.summary.net_change.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                        As of {conversionData.summary.end_date || 'latest statement date'}
                      </span>
                    </div>

                    {/* Card 2: Deposits */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <span style={{ color: 'var(--accent-emerald)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Total Deposits (Credits)</span>
                      <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--accent-emerald)' }}>
                        +{curr}{activeCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                        {selectedMonth === 'all' ? (monthCount > 1 ? `All ${monthCount} Statement Months` : 'Full Period') : `Selected Month (${selectedMonth})`}
                      </span>
                    </div>

                    {/* Card 3: Payments */}
                    <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                      <span style={{ color: 'var(--accent-rose)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Total Payments (Debits)</span>
                      <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--accent-rose)' }}>
                        -{curr}{activeDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                        {selectedMonth === 'all' ? (monthCount > 1 ? `All ${monthCount} Statement Months` : 'Full Period') : `Selected Month (${selectedMonth})`}
                      </span>
                    </div>

                    {/* Card 4: Statement Period */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Statement Period</span>
                      <p style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px', color: '#fff', letterSpacing: '-0.2px' }}>
                        {conversionData.summary.date_range || 'Recent'}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                        {conversionData.summary.count} transactions in file
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Monthly Filter Navigation Tabs */}
              {conversionData.summary.months && conversionData.summary.months.length > 1 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BarChart3 size={16} color="var(--accent-cyan)" />
                      Statement spans {conversionData.summary.months.length} months ({conversionData.summary.date_range}):
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      Filter by month to view that month's exact deposits & payments
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <button
                      onClick={() => setSelectedMonth('all')}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '8px',
                        border: selectedMonth === 'all' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        background: selectedMonth === 'all' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.04)',
                        color: selectedMonth === 'all' ? '#0f172a' : 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                    >
                      All Transactions ({conversionData.summary.count})
                    </button>
                    {conversionData.summary.months.map(m => (
                      <button
                        key={m.key}
                        onClick={() => setSelectedMonth(m.key)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '8px',
                          border: selectedMonth === m.key ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          background: selectedMonth === m.key ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.04)',
                          color: selectedMonth === m.key ? '#0f172a' : 'var(--text-muted)',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s'
                        }}
                      >
                        {m.label} ({m.count} txns)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Intelligence & Spending Distribution Dashboard */}
              {expenseCategories.length > 0 && (() => {
                const curr = conversionData?.summary?.currency_symbol || (
                  ['Yahav', 'Hapoalim', 'Leumi', 'Discount', 'Mizrahi', 'FIBI', 'MAX', 'Isracard', 'Cal'].some(b => (conversionData?.bank_name || '').includes(b)) ? '₪' : '$'
                );

                // SVG Donut Calculations
                const radius = 58;
                const circumference = 2 * Math.PI * radius; // ~364.42
                let accumulatedOffset = 0;

                const activeHighlight = hoveredCategory || (selectedCategory !== 'all' ? expenseCategories.find(c => c.name === selectedCategory) : null);

                return (
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.6))', 
                    border: '1px solid rgba(56, 189, 248, 0.25)', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    marginBottom: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PieChart size={17} color="var(--accent-cyan)" />
                          </div>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0 }}>
                            Spending Breakdown & QuickBooks Expense Intelligence
                          </h3>
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: '4px 0 0 0' }}>
                          Deterministic AI classifies each transaction into standard QuickBooks Chart of Accounts. Click any category slice or card below to filter the table.
                        </p>
                      </div>

                      {selectedCategory !== 'all' && (
                        <button
                          onClick={() => setSelectedCategory('all')}
                          style={{
                            background: 'rgba(56, 189, 248, 0.15)',
                            border: '1px solid var(--accent-cyan)',
                            color: 'var(--accent-cyan)',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <X size={14} /> Clear Filter ({selectedCategory})
                        </button>
                      )}
                    </div>

                    {/* Content Grid: Chart on Left, Cards on Right */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
                      
                      {/* Left: Interactive SVG Donut */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '220px' }}>
                        <svg width="220" height="220" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                          {/* Background Track */}
                          <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            fill="transparent"
                            stroke="rgba(255, 255, 255, 0.05)"
                            strokeWidth="15"
                          />
                          {/* Slices */}
                          {expenseCategories.map((cat) => {
                            const pct = totalExpenses > 0 ? (cat.total / totalExpenses) : 0;
                            const strokeDasharray = `${pct * circumference} ${circumference - (pct * circumference)}`;
                            const strokeDashoffset = -accumulatedOffset;
                            accumulatedOffset += pct * circumference;

                            const isSelected = selectedCategory === cat.name;
                            const isHovered = hoveredCategory?.name === cat.name;

                            return (
                              <circle
                                key={cat.name}
                                cx="80"
                                cy="80"
                                r={radius}
                                fill="transparent"
                                stroke={cat.color}
                                strokeWidth={isSelected || isHovered ? 18 : 14}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                className="donut-slice"
                                style={{
                                  opacity: (selectedCategory === 'all' && !hoveredCategory) || isSelected || isHovered ? 1 : 0.35,
                                  color: cat.color
                                }}
                                onMouseEnter={() => setHoveredCategory(cat)}
                                onMouseLeave={() => setHoveredCategory(null)}
                                onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'all' : cat.name)}
                              />
                            );
                          })}
                        </svg>

                        {/* Center Metric Display */}
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center',
                          pointerEvents: 'none',
                          maxWidth: '135px'
                        }}>
                          {activeHighlight ? (
                            <>
                              <span style={{ fontSize: '11px', color: activeHighlight.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {activeHighlight.icon} {activeHighlight.name}
                              </span>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>
                                -{curr}{activeHighlight.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>
                                {((activeHighlight.total / (totalExpenses || 1)) * 100).toFixed(1)}% of Outflow
                              </span>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                                Total Outflows
                              </span>
                              <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>
                                -{curr}{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '600' }}>
                                {expenseTransactions.length} Expenses
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Category Legend & Filter Cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {expenseCategories.map((cat) => {
                          const pct = totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : 0;
                          const isSelected = selectedCategory === cat.name;

                          return (
                            <div
                              key={cat.name}
                              className={`category-card ${isSelected ? 'active' : ''}`}
                              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                              onMouseEnter={() => setHoveredCategory(cat)}
                              onMouseLeave={() => setHoveredCategory(null)}
                              style={{
                                background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.07)',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, flexShrink: 0, boxShadow: `0 0 8px ${cat.color}` }} />
                                <div style={{ overflow: 'hidden' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {cat.icon} {cat.name}
                                    </span>
                                    {isSelected && (
                                      <span style={{ fontSize: '10px', padding: '1px 6px', background: 'var(--accent-cyan)', color: '#0f172a', borderRadius: '4px', fontWeight: '700' }}>
                                        Active Filter
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {cat.qbAccount}
                                  </span>
                                </div>
                              </div>

                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                                  -{curr}{cat.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  <strong style={{ color: cat.color }}>{pct}%</strong> • {cat.count} {cat.count === 1 ? 'tx' : 'txs'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Format Switcher & Search Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  {[
                    { id: 'qbo', label: 'QuickBooks (.QBO)', badge: 'Recommended' },
                    { id: 'xlsx', label: 'Excel (.XLSX)' },
                    { id: 'csv', label: 'CSV (.CSV)' },
                  ].map(fmt => (
                    <button
                      key={fmt.id}
                      onClick={() => setSelectedFormat(fmt.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        background: selectedFormat === fmt.id ? 'var(--accent-cyan)' : 'transparent',
                        color: selectedFormat === fmt.id ? '#0f172a' : 'var(--text-muted)'
                      }}
                    >
                      {fmt.label} {fmt.badge && <span style={{ fontSize: '10px', padding: '2px 6px', background: selectedFormat === fmt.id ? '#0f172a' : 'rgba(56, 189, 248, 0.2)', color: selectedFormat === fmt.id ? '#fff' : 'var(--accent-cyan)', borderRadius: '4px', marginLeft: '4px' }}>{fmt.badge}</span>}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '500' }}>
                    Showing {filteredTransactions.length} of {conversionData.summary.count} transactions
                    {selectedCategory !== 'all' && ` (Filtered: ${selectedCategory})`}
                  </span>

                  <div style={{ position: 'relative', width: '260px' }}>
                    <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      placeholder="Search payees or dates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Description / Payee</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>QuickBooks Category</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600' }}>Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t, idx) => {
                      const desc = t.description;
                      const cat = categorizeTransaction(desc, t.amount);

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.date}</td>
                          <td dir="auto" style={{ padding: '12px 16px', fontWeight: '500', textAlign: /[\u0590-\u05FF]/.test(desc) ? 'right' : 'left' }}>
                            {desc}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              fontSize: '11px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: `${cat.color}15`,
                              color: cat.color,
                              border: `1px solid ${cat.color}35`,
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap'
                            }}>
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '9999px', background: t.amount >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', color: t.amount >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: '600' }}>
                              {t.amount >= 0 ? 'Credit' : 'Debit'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', fontFamily: 'monospace', color: t.amount >= 0 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                            {t.amount >= 0 ? '+' : '-'}{conversionData?.summary?.currency_symbol || (['Yahav', 'Hapoalim', 'Leumi', 'Discount', 'Mizrahi', 'FIBI', 'MAX', 'Isracard', 'Cal'].some(b => (conversionData?.bank_name || '').includes(b)) ? '₪' : '$')}{Math.abs(t.amount).toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                            {t.balance !== null && t.balance !== undefined ? `${conversionData?.summary?.currency_symbol || (['Yahav', 'Hapoalim', 'Leumi', 'Discount', 'Mizrahi', 'FIBI', 'MAX', 'Isracard', 'Cal'].some(b => (conversionData?.bank_name || '').includes(b)) ? '₪' : '$')}${Number(t.balance).toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom call to action */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.05)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={26} color="var(--accent-cyan)" />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Ready for QuickBooks Online & Desktop Import</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      {hasActiveLicense 
                        ? 'Unlimited Pro Active: Export complete QBO, Excel, or CSV.'
                        : freeUsed === 0 
                          ? '🎁 1 Free Conversion Pass Active — No credit card required.'
                          : '⚡ Free Pass Used — Upgrade to Pro ($19.99/mo) or Single Pass ($4.99).'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleDownload} 
                  className="gradient-btn" 
                  style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700' }}
                >
                  {hasActiveLicense ? (
                    <>Download {selectedFormat.toUpperCase()} Now</>
                  ) : freeUsed === 0 ? (
                    <>🎁 Download {selectedFormat.toUpperCase()} Free (1 Left)</>
                  ) : (
                    <>⚡ Unlock & Download {selectedFormat.toUpperCase()} ($19.99/mo)</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interactive ROI & Time Saved Calculator */}
        <section id="roi-calculator" style={{ marginBottom: '80px' }}>
          <div className="glass-panel" style={{ padding: '36px', background: 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.75))', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', marginBottom: '14px', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: '700' }}>
                <DollarSign size={15} /> Time & Cost Savings Calculator
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', marginBottom: '8px' }}>
                Calculate Your Monthly Hours & Dollars Saved
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
                See how much you save using LedgerSnap compared to paying a bookkeeper ($50/hr) or manual data entry.
              </p>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto 36px auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>Statements Processed Per Month:</span>
                <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
                  {calculatorStatements} Statements
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="60" 
                value={calculatorStatements} 
                onChange={(e) => setCalculatorStatements(parseInt(e.target.value, 10))}
                className="custom-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
                <span>1 Statement / mo</span>
                <span>30 Statements / mo</span>
                <span>60 Statements / mo</span>
              </div>
            </div>

            {/* Metric Comparison Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px', maxWidth: '850px', margin: '0 auto 28px auto' }}>
              <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-rose)' }}>Manual Entry Cost</span>
                <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-rose)', marginTop: '6px' }}>
                  ${(calculatorStatements * 40).toFixed(0)} <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '400' }}>/ mo</span>
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
                  ~{(calculatorStatements * 0.8).toFixed(1)} hrs manual typing
                </span>
              </div>

              <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>LedgerSnap Pro</span>
                <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '6px' }}>
                  $19.99 <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '400' }}>/ mo</span>
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
                  ~{(calculatorStatements * 3)} seconds total
                </span>
              </div>

              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-emerald)' }}>Your Net Savings</span>
                <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '6px' }}>
                  +${Math.max(0, (calculatorStatements * 40) - 19.99).toFixed(0)} <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '400' }}>/ mo</span>
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginTop: '4px' }}>
                  Save {(calculatorStatements * 0.8).toFixed(0)} hours every month
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => { setIsCheckoutOpen(true); setCheckoutPlan('pro_monthly'); }} 
                className="gradient-btn"
                style={{ padding: '14px 32px', fontSize: '15px' }}
              >
                <Zap size={18} /> Start Saving Today — Unlock Pro for $19.99/mo
              </button>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '10px' }}>
                100% money-back guarantee • Cancel anytime with 1-click
              </p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="how-it-works" style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>Why CPAs & Bookkeepers Choose LedgerSnap</h2>
            <p style={{ color: 'var(--text-muted)' }}>Avoid common QuickBooks CSV import errors, mismatching columns, and duplicate entries.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Certified .QBO Web Connect</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                QuickBooks Online and Desktop reject PDF files and often corrupt column mappings on generic CSVs. Our .QBO files import directly into the QuickBooks bank register with zero mapping.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)', marginBottom: '16px' }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Strict Privacy & Zero Retention</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                We never store, log, or sell your financial data. Files are processed in ephemeral memory and permanently deleted immediately after conversion. SOC2 architecture standards.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)', marginBottom: '16px' }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Accurate Table Extraction</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Trained on complex bank layouts that break regular PDF converters: multi-line payee descriptions, floating check numbers, combined debits/credits, and running balances.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Matrix */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>How LedgerSnap Outperforms the Alternatives</h2>
            <p style={{ color: 'var(--text-muted)' }}>Why generic tools and manual typing fail with client bank statements.</p>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: 'rgba(15,23,42,0.6)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Feature / Capability</th>
                  <th style={{ padding: '16px 20px', color: 'var(--accent-cyan)', fontWeight: '800', background: 'rgba(56,189,248,0.1)' }}>⚡ LedgerSnap</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>ChatGPT / Free LLMs</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Manual Data Entry</th>
                  <th style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Legacy Desktop Apps</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Certified .QBO / OFX 200 Output", ls: "✅ Certified Direct Import", chat: "❌ Corrupts / Not Supported", manual: "❌ Not possible (Excel only)", legacy: "✅ Supported" },
                  { feature: "Accuracy Guarantee", ls: "✅ 100% Mathematical Checksum", chat: "❌ Hallucinates & swaps columns", manual: "⚠️ Frequent Human Typos", legacy: "✅ Good" },
                  { feature: "Conversion Speed", ls: "⚡ Under 3 Seconds", chat: "⏱️ 3-5 Minutes", manual: "🐢 2 - 5 Hours per file", legacy: "⏱️ 10 - 20 Minutes" },
                  { feature: "Data Privacy & Security", ls: "🛡️ Zero-Knowledge Ephemeral RAM", chat: "⚠️ Trains on Your Bank Data", manual: "⚠️ Exposed to Outsourced Staff", legacy: "🛡️ Local Machine" },
                  { feature: "Price per month", ls: "💎 $19.99 / mo (Unlimited)", chat: "💲 $20 / mo (Invalid files)", manual: "💸 $30 - $70 / hour", legacy: "💸 $60 - $120 / mo" }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '600' }}>{row.feature}</td>
                    <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--accent-cyan)', background: 'rgba(56,189,248,0.05)' }}>{row.ls}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-dim)' }}>{row.chat}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-dim)' }}>{row.manual}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-dim)' }}>{row.legacy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Verified Testimonials */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', marginBottom: '12px', color: 'var(--accent-emerald)', fontSize: '12px', fontWeight: '700' }}>
              ⭐ Rated 4.9/5 by 380+ Bookkeepers & CPAs
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Trusted by Modern Accounting Professionals</h2>
            <p style={{ color: 'var(--text-muted)' }}>See how LedgerSnap is saving dozens of hours every tax season.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              {
                quote: "We had a client come in with 3 years of backlog Chase statements in PDF. Retyping would have taken 2 days. LedgerSnap converted all 36 statements into clean .QBO files in under 3 minutes. Flawless QuickBooks import.",
                author: "Marcus Vance, CPA",
                role: "Managing Partner at Vance Financial, TX",
                avatar: "MV"
              },
              {
                quote: "I tested 4 different PDF converters before finding LedgerSnap. Every other tool scrambled the multi-line check descriptions or flipped credits and debits. LedgerSnap calculated the running balance to the penny.",
                author: "Elena Rostova",
                role: "Certified QuickBooks ProAdvisor, FL",
                avatar: "ER"
              },
              {
                quote: "The single pass for $4.99 was a lifesaver for our mortgage application. Upgraded immediately to the $19.99 monthly plan for my bookkeeping clients. Best ROI tool in my tech stack.",
                author: "Julian Chen",
                role: "Small Business Owner & Consultant, CA",
                avatar: "JC"
              }
            ].map((t, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: '#fbbf24' }}>
                    {'★★★★★'}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '20px' }}>
                    "{t.quote}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{t.author}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Table (US / Global focused) */}
        <section id="pricing" style={{ marginBottom: '80px', textAlign: 'center' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>Simple, Transparent Pricing</h2>
            <p style={{ color: 'var(--text-muted)' }}>Choose pay-per-document or unlimited monthly conversions.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
            {/* Pay per doc */}
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Single Statement</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '16px' }}>For one-off loan or tax filings</p>
              <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>$4.99 <span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: '400' }}>/ statement</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> 1 Statement (Up to 50 pages)</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Instant .QBO, .XLSX & .CSV</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> 100% Client-Side Encryption</li>
              </ul>
              <button 
                onClick={() => { setIsCheckoutOpen(true); setCheckoutPlan('single'); }} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                Get Single Pass ($4.99)
              </button>
            </div>

            {/* Pro Monthly (Best Value) */}
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'left', border: '2px solid var(--accent-cyan)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'var(--accent-cyan)', color: '#0f172a', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                Most Popular
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Bookkeeper Pro</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '16px' }}>For business owners & freelancers</p>
              <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>$19.99 <span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: '400' }}>/ month</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> <strong>Unlimited</strong> Statement Conversions</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Batch Upload Multiple Statements</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Priority Table Parsing AI</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Cancel anytime with 1-click</li>
              </ul>
              <button 
                onClick={() => { setIsCheckoutOpen(true); setCheckoutPlan('pro_monthly'); }} 
                className="gradient-btn" 
                style={{ width: '100%', padding: '12px' }}
              >
                Get Bookkeeper Pro ($19.99/mo)
              </button>
            </div>

            {/* Firm Plan */}
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>CPA & Accounting Firm</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '16px' }}>For high-volume accounting firms</p>
              <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>$49.00 <span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: '400' }}>/ month</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Unlimited Team Seats</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Dedicated API Access</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Scanned & Faxed PDF OCR Engine</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Dedicated Account Manager</li>
              </ul>
              <button 
                onClick={() => { setIsCheckoutOpen(true); setCheckoutPlan('firm'); }} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                Get Firm Plan ($49/mo)
              </button>
            </div>
          </div>
        </section>

        {/* SEO FAQ Section */}
        <section id="faq" style={{ maxWidth: '800px', margin: '0 auto 80px auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Everything you need to know about LedgerSnap</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: "How do I import the .QBO file into QuickBooks Online?",
                a: "Log in to QuickBooks Online, navigate to Bookkeeping > Transactions > Bank transactions. In the top right corner, click the arrow next to 'Link account' and choose 'Upload from file'. Select your downloaded .QBO file and match it to your checking account. All transactions appear instantly!"
              },
              {
                q: "Is my banking information secure and private?",
                a: "Yes, 100%. We never ask for your bank login or password. The PDF conversion happens in isolated ephemeral memory. We do not store your statements or share financial data with any third parties."
              },
              {
                q: "Why shouldn't I just use ChatGPT or Gemini to convert my bank statement for free?",
                a: "QuickBooks strictly rejects regular spreadsheets and markdown text; it requires certified OFX 102/200 binary formatting with financial institution INTU.BID tags and cryptographic FITID transaction hashes that ChatGPT cannot produce. Furthermore, probabilistic AI models frequently hallucinate amounts, swap credit/debit columns, and violate US GLBA / SOC-2 banking privacy regulations by retaining client financial data. LedgerSnap provides deterministic, mathematically validated files with zero retention."
              },
              {
                q: "Which banks are supported?",
                a: "LedgerSnap supports all major US, UK, European, and international banks including JPMorgan Chase, Bank of America, Wells Fargo, Citibank, Capital One, Barclays, PNC, TD Bank, Silicon Valley Bank, Mercury, and Israeli banks (Bank Hapoalim, Bank Leumi, Israel Discount Bank, Bank Yahav, Mizrahi Tefahot)."
              },
              {
                q: "Why not just use a regular free PDF to Excel converter?",
                a: "Regular converters treat PDFs as raw text. They split payee names across rows, mix up debits with credits, and omit running balances. Most importantly, QuickBooks Online will fail when trying to import generic spreadsheets. LedgerSnap guarantees certified OFX/QBO formatting."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="glass-panel" 
                style={{ padding: '20px 24px', cursor: 'pointer' }}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{faq.q}</h4>
                  <ChevronDown 
                    size={18} 
                    color="var(--accent-cyan)" 
                    style={{ transform: openFaq === index ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} 
                  />
                </div>
                {openFaq === index && (
                  <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Checkout & Licensing Modal */}
      {isCheckoutOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img 
                src="/logo.svg" 
                alt="LedgerSnap" 
                style={{ width: '36px', height: '36px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)', flexShrink: 0 }} 
              />
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Unlock Instant Conversions</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Certified Intuit QuickBooks (.QBO) & Excel (.XLSX) format. Process in seconds.
            </p>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px', marginBottom: '24px' }}>
              <button 
                onClick={() => setCheckoutTab('plans')}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: checkoutTab === 'plans' ? 'var(--accent-cyan)' : 'transparent', color: checkoutTab === 'plans' ? '#0f172a' : 'var(--text-muted)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Choose Plan
              </button>
              <button 
                onClick={() => setCheckoutTab('restore')}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: checkoutTab === 'restore' ? 'var(--accent-cyan)' : 'transparent', color: checkoutTab === 'restore' ? '#0f172a' : 'var(--text-muted)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Restore License
              </button>
            </div>

            {checkoutTab === 'plans' ? (
              <form onSubmit={handleActivateLicense}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {/* Option 1: Pro Monthly */}
                  <div 
                    onClick={() => setCheckoutPlan('pro_monthly')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      border: checkoutPlan === 'pro_monthly' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      background: checkoutPlan === 'pro_monthly' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '15px' }}>Bookkeeper Pro</span>
                        <span style={{ fontSize: '10px', background: 'var(--accent-cyan)', color: '#0f172a', fontWeight: '800', padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase' }}>Most Popular</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Unlimited statements • Batch conversion • Priority OCR</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800' }}>$19.99</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>/mo</span>
                    </div>
                  </div>

                  {/* Option 2: Single Pass */}
                  <div 
                    onClick={() => setCheckoutPlan('single')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      border: checkoutPlan === 'single' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      background: checkoutPlan === 'single' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '15px' }}>Single Statement Pass</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>1 statement conversion (Up to 50 pages)</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800' }}>$4.99</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Your Email Address (For receipt & license key):</label>
                  <input 
                    type="email" 
                    placeholder="accountant@company.com"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                {checkoutError && <p style={{ color: 'var(--accent-rose)', fontSize: '13px', marginBottom: '12px' }}>{checkoutError}</p>}
                {checkoutMessage && <p style={{ color: 'var(--accent-emerald)', fontSize: '13px', marginBottom: '12px' }}>{checkoutMessage}</p>}

                <button 
                  type="submit" 
                  disabled={checkoutLoading}
                  className="gradient-btn" 
                  style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '700' }}
                >
                  {checkoutLoading ? 'Redirecting to Stripe...' : `Pay with Stripe (${checkoutPlan === 'single' ? '$4.99' : '$19.99/mo'})`}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px', fontSize: '12px', color: 'var(--text-dim)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> Powered by Stripe</span>
                  <span>•</span>
                  <span>256-bit Encryption</span>
                  <span>•</span>
                  <span>Cancel Anytime</span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRestoreLicense}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Purchased before on another computer? Enter your purchase email address to restore unlimited access instantly.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Purchase Email Address:</label>
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                {checkoutError && <p style={{ color: 'var(--accent-rose)', fontSize: '13px', marginBottom: '12px' }}>{checkoutError}</p>}
                {checkoutMessage && <p style={{ color: 'var(--accent-emerald)', fontSize: '13px', marginBottom: '12px' }}>{checkoutMessage}</p>}

                <button 
                  type="submit" 
                  disabled={checkoutLoading}
                  className="gradient-btn" 
                  style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: '700' }}
                >
                  {checkoutLoading ? 'Searching...' : 'Restore My License'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Guide Modal (Popup with tabs) */}
      {isGuideOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', padding: '32px', background: '#0f172a', border: '1px solid var(--accent-cyan)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setIsGuideOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img src="/logo.svg" alt="LedgerSnap" style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }} />
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Step-by-Step Quick Guide</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
              Follow these simple steps to download your statement and convert it in under 60 seconds.
            </p>

            {/* Guide Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <button 
                onClick={() => setGuideTab('step1')} 
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: guideTab === 'step1' ? 'var(--accent-cyan)' : 'transparent', color: guideTab === 'step1' ? '#0f172a' : 'var(--text-muted)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
              >
                1. Download Statement (PDF)
              </button>
              <button 
                onClick={() => setGuideTab('step2')} 
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: guideTab === 'step2' ? 'var(--accent-cyan)' : 'transparent', color: guideTab === 'step2' ? '#0f172a' : 'var(--text-muted)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
              >
                2. Convert in LedgerSnap
              </button>
              <button 
                onClick={() => setGuideTab('step3')} 
                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: guideTab === 'step3' ? 'var(--accent-cyan)' : 'transparent', color: guideTab === 'step3' ? '#0f172a' : 'var(--text-muted)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
              >
                3. Import to QuickBooks (.QBO)
              </button>
            </div>

            {/* Tab 1 Content */}
            {guideTab === 'step1' && (
              <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                <h4 style={{ color: '#fff', marginBottom: '8px', fontWeight: '700' }}>Which file should you download from your bank?</h4>
                <p style={{ marginBottom: '12px' }}>
                  Log in to your online banking portal (Chase, Bank of America, Wells Fargo, Citi, or any international bank):
                </p>
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <li><strong>Account Statements:</strong> Navigate to <em>"Statements & Documents"</em> or <em>"Account Activity"</em>.</li>
                  <li><strong>Select Period:</strong> Choose your desired statement month or billing cycle.</li>
                  <li><strong>Download Official PDF:</strong> Always click <em>"Download Statement (PDF)"</em> rather than printing a web page.</li>
                  <li><em>Credit Cards:</em> Monthly statement PDFs from Visa, Mastercard, and American Express are also fully supported.</li>
                </ol>
                <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '12px', color: '#93c5fd' }}>
                  💡 <strong>Zero-Knowledge Privacy:</strong> Statements are processed purely in ephemeral RAM and instantly deleted. Your financial data is never stored, sold, or shared with third parties.
                </div>
              </div>
            )}

            {/* Tab 2 Content */}
            {guideTab === 'step2' && (
              <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                <h4 style={{ color: '#fff', marginBottom: '8px', fontWeight: '700' }}>How to convert with LedgerSnap?</h4>
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <li>Drag and drop your PDF bank statement into the upload box on the home page.</li>
                  <li>The engine extracts transaction dates, payees, deposits, payments, and balances into an instant live preview.</li>
                  <li>Select your export format:
                    <ul style={{ marginTop: '4px', paddingLeft: '16px' }}>
                      <li><strong>QuickBooks (.QBO):</strong> For direct 1-click import into QuickBooks Online & Desktop.</li>
                      <li><strong>Excel (.XLSX):</strong> A formatted spreadsheet complete with debit/credit balance formulas.</li>
                      <li><strong>CSV (.CSV):</strong> Clean comma-separated format for Xero, Wave, or custom ledgers.</li>
                    </ul>
                  </li>
                  <li>Click <strong>Download</strong> and your certified file is saved to your computer in seconds!</li>
                </ol>
              </div>
            )}

            {/* Tab 3 Content */}
            {guideTab === 'step3' && (
              <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                <h4 style={{ color: '#fff', marginBottom: '8px', fontWeight: '700' }}>How to import .QBO into QuickBooks Online?</h4>
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <li>Log in to your <strong>QuickBooks Online</strong> account.</li>
                  <li>Navigate to <strong>Bookkeeping</strong> &gt; <strong>Transactions</strong> &gt; <strong>Bank transactions</strong>.</li>
                  <li>In the top right corner, click the small arrow next to <em>"Link account"</em> and select <strong>"Upload from file"</strong>.</li>
                  <li>Select the downloaded <strong>.QBO</strong> file from LedgerSnap.</li>
                  <li>Choose your matching bank register and click <strong>Continue</strong>. All transactions match automatically with zero manual entry!</li>
                </ol>
              </div>
            )}

            <button 
              onClick={() => setIsGuideOpen(false)}
              className="gradient-btn" 
              style={{ width: '100%', marginTop: '24px', padding: '10px' }}
            >
              Got It, Let's Convert!
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '40px 24px', background: 'rgba(10, 14, 23, 0.95)', marginTop: 'auto', textAlign: 'center', fontSize: '13px', color: 'var(--text-dim)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.svg" alt="LedgerSnap Logo" style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0 }} />
            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '16px', letterSpacing: '-0.3px' }}>Ledger<span style={{ color: 'var(--accent-cyan)' }}>Snap</span></span>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <span onClick={() => setIsGuideOpen(true)} style={{ color: 'var(--accent-cyan)', cursor: 'pointer' }}>Quick Guide</span>
            <a href="#how-it-works" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>How it works</a>
            <a href="#pricing" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Pricing</a>
            <a href="#faq" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>FAQ</a>
            <span style={{ color: 'var(--text-dim)' }}>Privacy & SOC2 Compliant</span>
          </div>

          <p>© 2026 LedgerSnap. Built for CPAs, bookkeepers, and modern businesses.</p>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <aside 
          aria-label="Cookie Consent Banner" 
          role="region"
          className="cookie-banner"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            maxWidth: '440px',
            width: 'calc(100% - 48px)',
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.15)',
            backdropFilter: 'blur(16px)',
            zIndex: 9999,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              flexShrink: 0
            }}>
              <Cookie size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>
                We Value Your Privacy & Cookies
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                LedgerSnap uses essential cookies & local storage to manage secure conversions, prevent abuse, and save your preferences. We never sell your financial data.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleAcceptCookies('essential')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              Essential Only
            </button>
            <button
              onClick={() => handleAcceptCookies('all')}
              className="gradient-btn"
              style={{
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              Accept All Cookies
            </button>
          </div>
        </aside>
      )}

      {/* Accessibility Floating Trigger Button */}
      <button
        onClick={() => setIsA11yOpen(prev => !prev)}
        className="a11y-widget-btn"
        aria-label="Toggle Accessibility Options Menu"
        aria-expanded={isA11yOpen}
        title="Accessibility Settings (WCAG Compliant)"
      >
        <Eye size={20} />
      </button>

      {/* Accessibility Settings Modal */}
      {isA11yOpen && (
        <aside
          role="dialog"
          aria-label="Accessibility Settings"
          aria-modal="true"
          style={{
            position: 'fixed',
            bottom: '76px',
            left: '24px',
            width: '320px',
            maxWidth: 'calc(100vw - 48px)',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.2)',
            backdropFilter: 'blur(16px)',
            zIndex: 9998,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: 0 }}>
                Accessibility Controls
              </h3>
            </div>
            <button
              onClick={() => setIsA11yOpen(false)}
              aria-label="Close Accessibility Menu"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => toggleA11y('contrast')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                border: a11ySettings.contrast ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                background: a11ySettings.contrast ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: a11ySettings.contrast ? '#fff' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>🌓 High Contrast</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: a11ySettings.contrast ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>
                {a11ySettings.contrast ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => toggleA11y('largeText')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                border: a11ySettings.largeText ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                background: a11ySettings.largeText ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: a11ySettings.largeText ? '#fff' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>🔍 Larger Text (+12%)</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: a11ySettings.largeText ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>
                {a11ySettings.largeText ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => toggleA11y('highlightLinks')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                border: a11ySettings.highlightLinks ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                background: a11ySettings.highlightLinks ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: a11ySettings.highlightLinks ? '#fff' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>🔗 Highlight All Links</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: a11ySettings.highlightLinks ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>
                {a11ySettings.highlightLinks ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => toggleA11y('readableFont')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                border: a11ySettings.readableFont ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                background: a11ySettings.readableFont ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: a11ySettings.readableFont ? '#fff' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>📖 Standard Readable Font</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: a11ySettings.readableFont ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>
                {a11ySettings.readableFont ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={resetA11y}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Reset to default
            </button>
            <button
              onClick={() => setIsA11yOpen(false)}
              className="gradient-btn"
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px' }}
            >
              Done
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
