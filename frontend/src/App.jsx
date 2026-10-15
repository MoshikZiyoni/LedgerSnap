import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, CheckCircle2, AlertCircle, Download, 
  Search, ShieldCheck, Zap, Lock, Sparkles,
  RefreshCw, DollarSign, BarChart3, ChevronDown, Check,
  BookOpen, X, PieChart, Plus, Trash2, Edit3, Sliders,
  Eye, Cookie, Cpu, Wrench
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { initializePaddle } from '@paddle/paddle-js';
import LiveDemoSection from './components/LiveDemoSection';
import BankLandingPage from './components/BankLandingPage';
import ComparisonPage from './components/ComparisonPage';
import GuidePage from './components/GuidePage';
import LegalPage from './components/LegalPage';
import ToolsPage from './components/ToolsPage';
import Footer from './components/Footer';
import { SEO_BANKS } from './data/seoBanks';
import { SEO_COMPARISONS } from './data/seoComparisons';
import { SEO_GUIDES } from './data/seoGuides';
import { SEO_TOOLS } from './data/seoTools';
import { cleanPayeeName, generateClientQbo } from './utils/qboUtils';

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

  // Interactive Review Grid, Reconciliation, and Export Settings State
  const [editableTransactions, setEditableTransactions] = useState([]);
  const [exportSettings, setExportSettings] = useState({
    currency: 'USD',
    accountType: 'CHECKING',
    accountId: '123456789',
    bankId: '3000',
    intuBid: '3000',
    exportMode: 'utf8',
    dateFormat: 'auto',
    openingBalance: 0,
    statementEndingBalance: 0
  });
  const [aiCleanedSuccess, setAiCleanedSuccess] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('Extracting page 1 of 1 — Verifying mathematical balance...');

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
  const [paddle, setPaddle] = useState(null);

  // Initialize Paddle.js
  useEffect(() => {
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_f441b5bb650cb60a6bf2308e1b9';
    const paddleEnv = import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox';
    initializePaddle({
      environment: paddleEnv,
      token: clientToken,
      eventCallback: (data) => {
        if (data.name === 'checkout.completed') {
          triggerConfetti();
          setCheckoutMessage('🎉 Payment completed! Activating your license...');
          
          const txId = data.data?.id || data.data?.transaction_id;
          const userEmail = data.data?.customer?.email || checkoutEmail;
          
          fetch(`${API_BASE}/api/paddle/verify-transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              transaction_id: txId,
              email: userEmail,
              plan: checkoutPlan
            })
          })
            .then(r => r.json())
            .then(res => {
              if (res.success && res.license_key) {
                setLicense(res);
                localStorage.setItem('bqbo_license', JSON.stringify(res));
                setCheckoutMessage('🎉 Pro access unlocked successfully!');
                setTimeout(() => {
                  setIsCheckoutOpen(false);
                  setCheckoutMessage(null);
                }, 1500);
              }
            })
            .catch(err => {
              console.error('Paddle transaction verification error:', err);
              setTimeout(() => setIsCheckoutOpen(false), 2000);
            });
        }
      }
    }).then(p => {
      if (p) setPaddle(p);
    }).catch(err => {
      console.warn('Paddle initialization notice:', err);
    });
  }, []);

  // Client-Side Routing State for Programmatic SEO
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path) => {
    if (path.includes('#')) {
      const parts = path.split('#');
      const targetPath = parts[0] || '/';
      const hash = '#' + parts[1];

      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', path);
        setCurrentPath(targetPath);
      } else {
        window.history.pushState({}, '', path);
      }

      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
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
    // Secret license key direct link (optional)
    if (urlLic === 'LSNAP-ADMIN-MOSHIK-2026') {
      const adminData = {
        success: true,
        has_license: true,
        license_key: 'LSNAP-ADMIN-MOSHIK-2026',
        plan: 'firm',
        email: 'moshiktm1994@gmail.com',
        credits: 999999,
        is_admin: true
      };
      setLicense(adminData);
      try { localStorage.setItem('bqbo_license', JSON.stringify(adminData)); } catch {}
      triggerConfetti();
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

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

  const initializeConversionSession = (result) => {
    setConversionData(result);
    setSelectedCategory('all');
    setAiCleanedSuccess(false);

    const txns = (result.preview || result.all_transactions || []).map((t, idx) => ({
      id: idx + 1,
      date: t.date || '',
      description: t.description || t.name || 'Transaction',
      memo: t.memo || t.description || 'Transaction',
      amount: parseFloat(t.amount || 0),
      balance: t.balance !== null && t.balance !== undefined ? parseFloat(t.balance) : null,
      type: parseFloat(t.amount || 0) >= 0 ? 'Credit' : 'Debit'
    }));
    setEditableTransactions(txns);

    const bankStr = (result.bank_name || '');
    const isIsraeli = ['Yahav', 'Hapoalim', 'Leumi', 'Discount', 'Mizrahi', 'FIBI', 'MAX', 'Isracard', 'Cal'].some(b => bankStr.includes(b));
    const detectedCurr = result.summary?.currency || (isIsraeli ? 'ILS' : 'USD');
    const isCC = ['MAX', 'Isracard', 'Cal', 'Credit Card', 'Amex', 'Visa', 'Mastercard'].some(b => bankStr.includes(b));

    const openBal = result.summary?.opening_balance !== null && result.summary?.opening_balance !== undefined 
      ? result.summary.opening_balance 
      : 0;
    const endBal = result.summary?.ending_balance !== null && result.summary?.ending_balance !== undefined
      ? result.summary.ending_balance
      : (result.summary?.net_change !== undefined ? openBal + result.summary.net_change : 0);

    setExportSettings({
      currency: detectedCurr,
      accountType: isCC ? 'CREDITCARD' : 'CHECKING',
      accountId: result.summary?.account_id || '123456789',
      bankId: result.summary?.bank_id || '3000',
      intuBid: '3000',
      exportMode: 'utf8',
      dateFormat: result.summary?.detected_date_format || (isIsraeli ? 'DD/MM/YYYY' : 'auto'),
      openingBalance: openBal,
      statementEndingBalance: endBal
    });
  };

  const handleCellChange = (targetId, field, value) => {
    setEditableTransactions(prev => prev.map(item => {
      if (item.id !== targetId) return item;
      const updated = { ...item };

      if (field === 'date') {
        updated.date = value;
      } else if (field === 'description') {
        updated.description = value.slice(0, 32);
      } else if (field === 'memo') {
        updated.memo = value;
      } else if (field === 'debit') {
        const val = parseFloat(value) || 0;
        updated.amount = -Math.abs(val);
        updated.type = 'Debit';
      } else if (field === 'credit') {
        const val = parseFloat(value) || 0;
        updated.amount = Math.abs(val);
        updated.type = 'Credit';
      } else if (field === 'amount') {
        const val = parseFloat(value) || 0;
        updated.amount = val;
        updated.type = val >= 0 ? 'Credit' : 'Debit';
      }

      return updated;
    }));
  };

  const handleAddTransaction = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newId = Date.now();
    setEditableTransactions(prev => [
      {
        id: newId,
        date: today,
        description: 'New Payee',
        memo: 'Manual Entry',
        amount: 0.00,
        balance: null,
        type: 'Credit'
      },
      ...prev
    ]);
  };

  const handleDeleteTransaction = (targetId) => {
    setEditableTransactions(prev => prev.filter(t => t.id !== targetId));
  };

  const handleAiPayeeCleanup = () => {
    let count = 0;
    setEditableTransactions(prev => prev.map(t => {
      const raw = t.memo || t.description;
      const cleaned = cleanPayeeName(raw, 32);
      if (cleaned !== t.description) count++;
      return {
        ...t,
        description: cleaned,
        memo: raw // preserve full raw original text in memo
      };
    }));
    setAiCleanedSuccess(true);
    triggerConfetti();
    setTimeout(() => setAiCleanedSuccess(false), 5000);
  };

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
    setUploadProgressText(`Step 1/4: Reading PDF layout and detecting bank origin (${file.name})...`);

    const timer1 = setTimeout(() => {
      setParsingStep(2);
      setUploadProgressText('Step 2/4: Extracting transaction rows & running OCR engine...');
    }, 800);
    const timer2 = setTimeout(() => {
      setParsingStep(3);
      setUploadProgressText('Step 3/4: Mathematical checksum reconciliation (Opening + Credits - Debits = Closing)...');
    }, 1600);
    const timer3 = setTimeout(() => {
      setParsingStep(4);
      setUploadProgressText('Step 4/4: Building certified QuickBooks (.QBO) Web Connect structures...');
    }, 2400);

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
      initializeConversionSession(result);
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
      clearTimeout(timer3);
      setIsLoading(false);
      setParsingStep(1);
    }
  };

  const loadSample = async (bankOverride = null) => {
    setError(null);
    setIsLoading(true);
    setParsingStep(1);
    setUploadProgressText('Step 1/3: Reading Bank Statement PDF Layout...');

    await new Promise(r => setTimeout(r, 650));
    setParsingStep(2);
    setUploadProgressText('Step 2/3: Extracting Transactions & Verifying Math Checksums...');
    await new Promise(r => setTimeout(r, 750));
    setParsingStep(3);
    setUploadProgressText('Step 3/3: Building Certified QuickBooks (.QBO) & Excel...');
    await new Promise(r => setTimeout(r, 700));

    let sampleData = { ...SAMPLE_DEMO_DATA };
    if (bankOverride && bankOverride.name) {
      sampleData = {
        ...SAMPLE_DEMO_DATA,
        filename: `${bankOverride.name.replace(/\s+/g, '_')}_Business_Statement_Oct_2026.pdf`,
        bank_name: bankOverride.fullName || bankOverride.name,
        summary: {
          ...SAMPLE_DEMO_DATA.summary,
          bank_detected: bankOverride.fullName || bankOverride.name
        }
      };
    }

    initializeConversionSession(sampleData);
    setIsLoading(false);
    setParsingStep(1);
    triggerConfetti();

    setTimeout(() => {
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }, 100);
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
    const baseFilename = (conversionData.filename || 'statement').replace(/\.pdf$/i, '');
    const currentTxns = editableTransactions.length > 0 ? editableTransactions : (conversionData.preview || []);

    try {
      // 1. Send export request with user-edited transactions and settings
      const res = await fetch(`${API_BASE}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: currentTxns,
          currency: exportSettings.currency,
          account_id: exportSettings.accountId,
          bank_id: exportSettings.bankId,
          account_type: exportSettings.accountType,
          export_mode: exportSettings.exportMode,
          intu_bid: exportSettings.intuBid,
          date_format: exportSettings.dateFormat,
          format: selectedFormat,
          filename: conversionData.filename || 'statement.pdf',
          file_id: fileId,
          client_id: cid,
          license_key: license?.license_key
        })
      });

      if (res.status === 402) {
        setFreeUsed(1);
        try { localStorage.setItem('ls_free_used', '1'); } catch {}
        setIsCheckoutOpen(true);
        setCheckoutTab('plans');
        setCheckoutPlan('pro_monthly');
        setCheckoutMessage('⚡ Free conversion limit reached for your IP! Choose a plan below to instantly download your statement:');
        return;
      }

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
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
        return;
      }
    } catch (e) {
      console.warn("API export endpoint unavailable, falling back to client-side generator:", e);
    }

    // 2. Client-Side Fallback Generator
    try {
      if (selectedFormat === 'qbo') {
        const qboContent = generateClientQbo({
          transactions: currentTxns,
          bankName: conversionData.bank_name || 'Bank Statement',
          accountId: exportSettings.accountId,
          bankId: exportSettings.bankId,
          currency: exportSettings.currency,
          accountType: exportSettings.accountType,
          exportMode: exportSettings.exportMode,
          intuBid: exportSettings.intuBid,
          dateFormat: exportSettings.dateFormat === 'auto' ? 'DD/MM/YYYY' : exportSettings.dateFormat,
          openingBalance: exportSettings.openingBalance,
          endingBalance: exportSettings.statementEndingBalance
        });
        const blob = new Blob([qboContent], { type: 'application/x-ofx' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${baseFilename}.qbo`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        triggerConfetti();
      } else if (selectedFormat === 'csv') {
        let csv = "Date,Description,Amount,Type\n";
        for (const t of currentTxns) {
          csv += `"${t.date}","${(t.description || '').replace(/"/g, '""')}",${t.amount},"${t.amount >= 0 ? 'Credit' : 'Debit'}"\n`;
        }
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${baseFilename}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        triggerConfetti();
      }
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Download failed. Please try again.');
    }
  };

  const handleActivateLicense = async (e) => {
    e.preventDefault();
    const cleanEmail = (checkoutEmail || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setCheckoutError('Please enter a valid email address.');
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutMessage(null);

    // Instant Admin Recognition for moshiktm1994@gmail.com
    if (cleanEmail === 'moshiktm1994@gmail.com') {
      const adminData = {
        success: true,
        has_license: true,
        license_key: 'LSNAP-ADMIN-MOSHIK-2026',
        plan: 'firm',
        email: 'moshiktm1994@gmail.com',
        credits: 999999,
        is_admin: true
      };
      setLicense(adminData);
      try { localStorage.setItem('bqbo_license', JSON.stringify(adminData)); } catch {}
      setCheckoutMessage('👑 Welcome Moshik! Admin License Activated (Unlimited Conversions & OCR).');
      triggerConfetti();
      setCheckoutLoading(false);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setCheckoutMessage(null);
      }, 1500);
      return;
    }

    if (window.trackLedgerEvent) {
      window.trackLedgerEvent('checkout_started', { plan: checkoutPlan, email: checkoutEmail });
    }

    try {
      // 1. If Paddle.js is initialized, open Paddle checkout directly
      if (paddle && paddle.Checkout) {
        const priceMap = {
          single: import.meta.env.VITE_PADDLE_PRICE_SINGLE || 'pri_01m501dhzv51anvw259akf2hre',
          pro_monthly: import.meta.env.VITE_PADDLE_PRICE_PRO || 'pri_01m501efk8dm3rkxem1ja0x46x',
          firm: import.meta.env.VITE_PADDLE_PRICE_FIRM || 'pri_01m501fq92trvstcq840aqxaw6'
        };
        const selectedPriceId = priceMap[checkoutPlan] || priceMap.pro_monthly;

        paddle.Checkout.open({
          settings: {
            displayMode: 'overlay',
            theme: 'dark',
            locale: 'en'
          },
          items: [{ priceId: selectedPriceId, quantity: 1 }],
          customer: { email: checkoutEmail },
          customData: { plan: checkoutPlan, email: checkoutEmail }
        });
        setCheckoutLoading(false);
        return;
      }

      // 2. Otherwise fallback to backend API checkout session
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
    const cleanEmail = (checkoutEmail || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setCheckoutError('Please enter your purchase email address.');
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutMessage(null);

    // Instant Admin Recognition for moshiktm1994@gmail.com
    if (cleanEmail === 'moshiktm1994@gmail.com') {
      const adminData = {
        success: true,
        has_license: true,
        license_key: 'LSNAP-ADMIN-MOSHIK-2026',
        plan: 'firm',
        email: 'moshiktm1994@gmail.com',
        credits: 999999,
        is_admin: true
      };
      setLicense(adminData);
      try { localStorage.setItem('bqbo_license', JSON.stringify(adminData)); } catch {}
      setCheckoutMessage('👑 Welcome Moshik! Admin License Restored (Unlimited Firm Access).');
      triggerConfetti();
      setCheckoutLoading(false);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setCheckoutMessage(null);
      }, 1500);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/license/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      if (data.success) {
        setLicense(data);
        localStorage.setItem('bqbo_license', JSON.stringify(data));
        setCheckoutMessage(data.is_admin ? '👑 Welcome Moshik! Admin License Active.' : '🎉 Active license found and restored!');
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

  const allCurrentTransactions = editableTransactions.length > 0 ? editableTransactions : (conversionData?.preview || []);

  const monthFiltered = selectedMonth === 'all'
    ? allCurrentTransactions
    : allCurrentTransactions.filter(t => {
        const parts = t.date.split('/');
        return parts.length === 3 && `${parts[1]}/${parts[2]}` === selectedMonth;
      });

  const categoryFiltered = selectedCategory === 'all'
    ? monthFiltered
    : monthFiltered.filter(t => categorizeTransaction(t.description || t.name, t.amount).category === selectedCategory);

  const filteredTransactions = categoryFiltered.filter(item => 
    (item.description || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.memo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date.includes(searchQuery)
  );

  const activeCredits = allCurrentTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const activeDebits = allCurrentTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netChange = activeCredits - activeDebits;
  const openingBal = parseFloat(exportSettings.openingBalance) || 0;
  const calcEndingBalance = openingBal + netChange;
  const stmtEndingBalance = exportSettings.statementEndingBalance !== null && exportSettings.statementEndingBalance !== undefined 
    ? parseFloat(exportSettings.statementEndingBalance) 
    : calcEndingBalance;
  const balanceDiscrepancy = Math.abs(calcEndingBalance - stmtEndingBalance);
  const isReconciled = balanceDiscrepancy < 0.01;

  const CURRENCY_SYMBOLS = {
    USD: '$',
    ILS: '₪',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$'
  };
  const curr = CURRENCY_SYMBOLS[exportSettings.currency] || '$';

  // Compute expense categories for spending distribution chart
  const expenseTransactions = monthFiltered.filter(t => t.amount < 0);
  const totalExpenses = expenseTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const categoryMap = {};
  expenseTransactions.forEach(t => {
    const cat = categorizeTransaction(t.description || t.name, t.amount);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setConversionData(null); handleNavigate('/'); }}>
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
          <a 
            href="/tools/qbo-viewer-checker" 
            onClick={(e) => { e.preventDefault(); handleNavigate('/tools/qbo-viewer-checker'); }} 
            className="desktop-nav-link" 
            style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(56, 189, 248, 0.08)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}
          >
            <Wrench size={14} /> Free QBO Tools
          </a>
          <button 
            onClick={() => setIsGuideOpen(true)}
            style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={15} /> Quick Guide
          </button>
          <a href="#roi-calculator" onClick={(e) => { e.preventDefault(); handleNavigate('/#roi-calculator'); }} className="desktop-nav-link" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Calculator</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); handleNavigate('/#how-it-works'); }} className="desktop-nav-link" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Why LedgerSnap</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); handleNavigate('/#pricing'); }} className="desktop-nav-link" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Pricing</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); handleNavigate('/#faq'); }} className="desktop-nav-link" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>FAQ</a>
          
          {hasActiveLicense ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: (license?.is_admin || license?.email === 'moshiktm1994@gmail.com') ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                border: (license?.is_admin || license?.email === 'moshiktm1994@gmail.com') ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)', 
                color: (license?.is_admin || license?.email === 'moshiktm1994@gmail.com') ? 'var(--accent-cyan)' : 'var(--accent-emerald)', 
                padding: '6px 14px', 
                borderRadius: '8px', 
                fontSize: '13px', 
                fontWeight: '700' 
              }}>
                <ShieldCheck size={15} /> 
                {(license?.is_admin || license?.email === 'moshiktm1994@gmail.com') ? '👑 Admin (Moshik)' : 'Pro Member Active'}
              </div>
              <button 
                onClick={() => {
                  try { localStorage.removeItem('bqbo_license'); } catch {}
                  setLicense(null);
                }}
                style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '11px', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                title="Sign Out / Switch Mode"
              >
                Sign Out
              </button>
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

      {/* Programmatic SEO Landing Pages Routing (Bank Converters, Comparisons, Guides) */}
      {!conversionData && currentPath.startsWith('/convert/') && (() => {
        const slug = currentPath.replace('/convert/', '').replace(/\/$/, '');
        const bank = SEO_BANKS.find(b => b.slug === slug);
        if (bank) {
          return (
            <BankLandingPage 
              bank={bank}
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
              parsingStep={parsingStep}
              error={error}
              onLoadSample={() => loadSample(bank)}
              onNavigate={handleNavigate}
            />
          );
        }
        return null;
      })()}

      {!conversionData && currentPath.startsWith('/compare/') && (() => {
        const slug = currentPath.replace('/compare/', '').replace(/\/$/, '');
        const comparison = SEO_COMPARISONS.find(c => c.slug === slug);
        if (comparison) {
          return (
            <ComparisonPage 
              comparison={comparison}
              onNavigate={handleNavigate}
              onTryDemo={loadSample}
            />
          );
        }
        return null;
      })()}

      {!conversionData && currentPath.startsWith('/guides/') && (() => {
        const slug = currentPath.replace('/guides/', '').replace(/\/$/, '');
        const guide = SEO_GUIDES.find(g => g.slug === slug);
        if (guide) {
          return (
            <GuidePage 
              guide={guide}
              onNavigate={handleNavigate}
              onTryDemo={loadSample}
            />
          );
        }
        return null;
      })()}

      {!conversionData && currentPath.startsWith('/tools/') && (() => {
        const slug = currentPath.replace('/tools/', '').replace(/\/$/, '');
        const tool = SEO_TOOLS.find(t => t.slug === slug);
        if (tool) {
          return (
            <ToolsPage 
              tool={tool} 
              onNavigate={handleNavigate} 
            />
          );
        }
        return null;
      })()}

      {!conversionData && (currentPath === '/terms' || currentPath === '/privacy' || currentPath === '/refund') && (
        <LegalPage 
          pageType={currentPath.replace('/', '')} 
          onNavigate={handleNavigate} 
        />
      )}

      {/* Homepage & Studio Content (Rendered on '/' or when a conversion is active) */}
      {(conversionData || (!currentPath.startsWith('/convert/') && !currentPath.startsWith('/compare/') && !currentPath.startsWith('/guides/') && !currentPath.startsWith('/tools/') && currentPath !== '/terms' && currentPath !== '/privacy' && currentPath !== '/refund')) && (
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {/* Trust & Architecture Badges (Task 2) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <span className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', color: '#38bdf8', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
              <Cpu size={14} color="#38bdf8" /> Zero-Retention RAM Processing
            </span>
            <span className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', color: '#10b981', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <ShieldCheck size={14} color="#10b981" /> Hosted on SOC 2 Type II Cloud Infrastructure
            </span>
            <span className="glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', color: '#a855f7', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
              <Lock size={14} color="#a855f7" /> 256-Bit TLS &amp; Client-Side Encryption
            </span>
          </div>

          <h1 className="hero-headline" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '800', lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-1px' }}>
            Convert Bank Statement PDF to <br />
            <span className="gradient-text">QuickBooks (.QBO) &amp; Excel</span> in Seconds
          </h1>
          <p className="hero-subtext" style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto 28px auto' }}>
            Stop wasting hours manually retyping bank transactions. Instantly converts Chase, Bank of America, Wells Fargo &amp; 500+ bank statements into certified Intuit QuickBooks and clean Excel spreadsheets with 100% mathematical accuracy.
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
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px', color: '#fff' }}>
                      {uploadProgressText}
                    </h3>
                    <p className="shimmer-text" style={{ fontSize: '14px', fontWeight: '600', maxWidth: '520px', margin: '0 auto' }}>
                      ⚡ Real-time OCR parsing &amp; mathematical balance verification. 100% private in-memory execution.
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

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button type="button" className="gradient-btn" style={{ padding: '14px 26px', fontSize: '15px', fontWeight: '700' }}>
                          <UploadCloud size={18} /> Select Statement PDF
                        </button>
                        <button 
                          type="button" 
                          id="hero-live-demo-trigger"
                          onClick={(e) => { e.stopPropagation(); loadSample(); }}
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
                          <span>⚡ Run Live 2-Second Chase PDF Demo</span>
                        </button>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ color: '#10b981', fontWeight: '700' }}>✓ 1-Click Interactive Test</span>
                        <span>•</span>
                        <span>No file upload required</span>
                        <span>•</span>
                        <span>Inspect math checksums &amp; .QBO live</span>
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

              {/* Supported Bank Badges with Programmatic SEO Links */}
              <div id="supported-banks" style={{ marginTop: '32px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', fontWeight: '600' }}>Pre-Tuned Layout Algorithms For</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {[
                    { name: 'JPMorgan Chase', slug: 'chase-pdf-to-qbo' },
                    { name: 'Bank of America', slug: 'bank-of-america-pdf-to-qbo' },
                    { name: 'Wells Fargo', slug: 'wells-fargo-pdf-to-qbo' },
                    { name: 'Citibank', slug: 'citibank-pdf-to-qbo' },
                    { name: 'Capital One', slug: 'capital-one-pdf-to-qbo' },
                    { name: 'Mercury Bank', slug: 'mercury-bank-pdf-to-qbo' },
                    { name: 'PNC Bank', slug: 'pnc-bank-pdf-to-qbo' },
                    { name: 'U.S. Bank', slug: 'us-bank-pdf-to-qbo' },
                    { name: 'TD Bank', slug: 'td-bank-pdf-to-qbo' },
                    { name: 'Truist Bank', slug: 'truist-bank-pdf-to-qbo' },
                    { name: 'Silicon Valley Bank', slug: 'silicon-valley-bank-pdf-to-qbo' }
                  ].map((bankItem, i) => (
                    <a 
                      key={i} 
                      href={`/convert/${bankItem.slug}`}
                      onClick={(e) => { e.preventDefault(); handleNavigate(`/convert/${bankItem.slug}`); }}
                      className="glass-pill" 
                      style={{ padding: '6px 14px', fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-cyan)'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                    >
                      🏛️ {bankItem.name}
                    </a>
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

              {/* Summary Reconciliation & Mathematical Verification Bar */}
              <div style={{
                background: isReconciled 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 78, 59, 0.25))' 
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(153, 27, 27, 0.25))',
                border: isReconciled ? '1.5px solid rgba(16, 185, 129, 0.35)' : '1.5px solid rgba(239, 68, 68, 0.45)',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '24px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isReconciled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isReconciled ? <ShieldCheck size={20} color="#10b981" /> : <AlertCircle size={20} color="#ef4444" />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Statement Reconciliation Equation (Accounting Audit)
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 10px',
                          borderRadius: '9999px',
                          background: isReconciled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                          color: isReconciled ? '#34d399' : '#f87171',
                          border: isReconciled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.5)',
                          fontWeight: '700'
                        }}>
                          {isReconciled ? '✓ 100% Reconciled' : `⚠ Discrepancy: ${curr}${balanceDiscrepancy.toFixed(2)}`}
                        </span>
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>
                        Verifies: Opening Balance + Total Deposits - Total Debits = Ending Balance. Edit balances or rows below if bank statement target differs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reconciliation Equation Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Opening Balance</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>{curr}</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={exportSettings.openingBalance}
                        onChange={(e) => setExportSettings(s => ({ ...s, openingBalance: parseFloat(e.target.value) || 0 }))}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--accent-cyan)', color: '#fff', fontSize: '16px', fontWeight: '800', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: '800', color: 'var(--accent-emerald)' }}>+</div>

                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Total Deposits (Credits)</span>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                      +{curr}{activeCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: '800', color: 'var(--accent-rose)' }}>-</div>

                  <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--accent-rose)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Total Payments (Debits)</span>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-rose)', marginTop: '4px' }}>
                      -{curr}{activeDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: '800', color: '#fff' }}>=</div>

                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Calculated Balance</span>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
                      {curr}{calcEndingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ background: isReconciled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '12px 14px', borderRadius: '10px', border: isReconciled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.4)' }}>
                    <span style={{ fontSize: '11px', color: isReconciled ? '#10b981' : '#f87171', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Statement Target</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>{curr}</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={exportSettings.statementEndingBalance !== null && exportSettings.statementEndingBalance !== undefined ? exportSettings.statementEndingBalance : ''}
                        onChange={(e) => setExportSettings(s => ({ ...s, statementEndingBalance: parseFloat(e.target.value) || 0 }))}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--border-subtle)', color: isReconciled ? '#fff' : '#fca5a5', fontSize: '16px', fontWeight: '800', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* QuickBooks Web Connect (<ACCTID>, <INTU.BID>, Encoding) Settings Bar */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={16} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                      QuickBooks Web Connect &amp; OFX Settings
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      (Pre-tuned to eliminate QuickBooks Error OL-222)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  {/* Currency */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Currency (&lt;CURDEF&gt;)
                    </label>
                    <select 
                      value={exportSettings.currency} 
                      onChange={e => setExportSettings(s => ({ ...s, currency: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="ILS">ILS (₪) - Israeli Shekel</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="CAD">CAD (C$) - Canadian Dollar</option>
                      <option value="AUD">AUD (A$) - Australian Dollar</option>
                    </select>
                  </div>

                  {/* Account Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Account Type
                    </label>
                    <select 
                      value={exportSettings.accountType} 
                      onChange={e => setExportSettings(s => ({ ...s, accountType: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="CHECKING">Checking Account (BANKMSGSRSV1)</option>
                      <option value="SAVINGS">Savings Account (BANKMSGSRSV1)</option>
                      <option value="CREDITCARD">Credit Card (CREDITCARDMSGSRSV1)</option>
                    </select>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Account Number (&lt;ACCTID&gt;)
                    </label>
                    <input 
                      type="text"
                      value={exportSettings.accountId}
                      onChange={e => setExportSettings(s => ({ ...s, accountId: e.target.value }))}
                      placeholder="e.g. 123456789"
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>

                  {/* Bank/Branch ID */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Bank / Routing (&lt;BANKID&gt;)
                    </label>
                    <input 
                      type="text"
                      value={exportSettings.bankId}
                      onChange={e => setExportSettings(s => ({ ...s, bankId: e.target.value }))}
                      placeholder="e.g. 3000"
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>

                  {/* Intuit Bank ID */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Intuit Bank ID (&lt;INTU.BID&gt;)
                    </label>
                    <select 
                      value={exportSettings.intuBid} 
                      onChange={e => setExportSettings(s => ({ ...s, intuBid: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="3000">3000 - Universal Compatibility (Recommended)</option>
                      <option value="10898">10898 - JPMorgan Chase</option>
                      <option value="3000">3000 - Bank of America / Wells Fargo</option>
                      <option value="24001">24001 - Citibank</option>
                      <option value="1001">1001 - American Express</option>
                      <option value="4000">4000 - Capital One</option>
                    </select>
                  </div>

                  {/* Export Mode */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Encoding &amp; Payee Mode
                    </label>
                    <select 
                      value={exportSettings.exportMode} 
                      onChange={e => setExportSettings(s => ({ ...s, exportMode: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="utf8">QuickBooks Online (UTF-8 / Hebrew Preserved)</option>
                      <option value="ascii">QuickBooks Desktop (Legacy ASCII &amp; Transliteration)</option>
                    </select>
                  </div>

                  {/* Date Format Override */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Date Format (&lt;DTPOSTED&gt;)
                    </label>
                    <select 
                      value={exportSettings.dateFormat} 
                      onChange={e => setExportSettings(s => ({ ...s, dateFormat: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="auto">Auto-Detected ({exportSettings.dateFormat === 'auto' ? 'DD/MM/YYYY' : exportSettings.dateFormat})</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (UK, IL, EU, AU)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Metrics Strip */}
              {(() => {
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
                            Spending Breakdown &amp; QuickBooks Expense Intelligence
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

              {/* Format Switcher & Actions Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    {[
                      { id: 'qbo', label: 'QuickBooks (.QBO)', badge: 'Recommended' },
                      { id: 'xlsx', label: 'Excel (.XLSX)' },
                      { id: 'csv', label: 'CSV (.CSV)' },
                    ].map(fmt => (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id)}
                        style={{
                          padding: '8px 14px',
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

                  {/* AI Payee Cleanup Button */}
                  <button
                    onClick={handleAiPayeeCleanup}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: aiCleanedSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.12)',
                      border: aiCleanedSuccess ? '1px solid #10b981' : '1px solid rgba(56, 189, 248, 0.4)',
                      color: aiCleanedSuccess ? '#34d399' : 'var(--accent-cyan)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title="Clean noisy bank descriptions into clean 32-character payees and store full details in memo"
                  >
                    <Sparkles size={14} />
                    {aiCleanedSuccess ? '✓ Payees Cleaned & Truncated!' : '✨ AI Payee Cleanup'}
                  </button>

                  {/* Add Row Button */}
                  <button
                    onClick={handleAddTransaction}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '500' }}>
                    Showing {filteredTransactions.length} of {allCurrentTransactions.length} transactions
                    {selectedCategory !== 'all' && ` (Filtered: ${selectedCategory})`}
                  </span>

                  <div style={{ position: 'relative', width: '240px' }}>
                    <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      placeholder="Search payees, memos, dates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Editable Data Table */}
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.25)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '600', width: '110px' }}>Date</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600', minWidth: '220px' }}>Payee (&lt;NAME&gt;, max 32)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600', minWidth: '180px' }}>Memo / Details (&lt;MEMO&gt;)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600', width: '160px' }}>QuickBooks Category</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right', width: '110px' }}>Debit (-)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right', width: '110px' }}>Credit (+)</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right', width: '100px' }}>Balance</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600', width: '40px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t) => {
                      const desc = t.description || '';
                      const memo = t.memo || '';
                      const isHebrew = /[\u0590-\u05FF]/.test(desc);
                      const cat = categorizeTransaction(desc, t.amount);
                      const isOverLimit = desc.length > 32;

                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'transparent' }}>
                          {/* Date Input */}
                          <td style={{ padding: '8px 10px' }}>
                            <input 
                              type="text"
                              value={t.date}
                              onChange={e => handleCellChange(t.id, 'date', e.target.value)}
                              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid transparent', borderRadius: '6px', color: '#fff', padding: '6px 8px', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }}
                              onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
                              onBlur={e => e.target.style.borderColor = 'transparent'}
                            />
                          </td>

                          {/* Payee / <NAME> Input with 32-char indicator */}
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="text"
                                dir={isHebrew ? 'rtl' : 'ltr'}
                                value={desc}
                                onChange={e => handleCellChange(t.id, 'description', e.target.value)}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: isOverLimit ? '1px solid #f87171' : '1px solid transparent', borderRadius: '6px', color: '#fff', padding: '6px 36px 6px 8px', fontSize: '13px', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = isOverLimit ? '#f87171' : 'var(--accent-cyan)'}
                                onBlur={e => e.target.style.borderColor = isOverLimit ? '#f87171' : 'transparent'}
                              />
                              <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: isOverLimit ? '#f87171' : 'var(--text-dim)', pointerEvents: 'none', fontWeight: '600' }}>
                                {desc.length}/32
                              </span>
                            </div>
                          </td>

                          {/* Memo / <MEMO> Input */}
                          <td style={{ padding: '8px 10px' }}>
                            <input 
                              type="text"
                              dir={isHebrew ? 'rtl' : 'ltr'}
                              value={memo}
                              onChange={e => handleCellChange(t.id, 'memo', e.target.value)}
                              placeholder="Optional transaction memo"
                              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid transparent', borderRadius: '6px', color: 'var(--text-muted)', padding: '6px 8px', fontSize: '12px', outline: 'none' }}
                              onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
                              onBlur={e => e.target.style.borderColor = 'transparent'}
                            />
                          </td>

                          {/* QuickBooks Category */}
                          <td style={{ padding: '8px 10px' }}>
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

                          {/* Debit (-) Input */}
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            <input 
                              type="number"
                              step="0.01"
                              placeholder="—"
                              value={t.amount < 0 ? Math.abs(t.amount).toFixed(2) : ''}
                              onChange={e => handleCellChange(t.id, 'debit', e.target.value)}
                              style={{ width: '90px', textAlign: 'right', background: 'rgba(255,255,255,0.03)', border: '1px solid transparent', borderRadius: '6px', color: 'var(--accent-rose)', padding: '6px 8px', fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', outline: 'none' }}
                              onFocus={e => e.target.style.borderColor = 'var(--accent-rose)'}
                              onBlur={e => e.target.style.borderColor = 'transparent'}
                            />
                          </td>

                          {/* Credit (+) Input */}
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            <input 
                              type="number"
                              step="0.01"
                              placeholder="—"
                              value={t.amount > 0 ? Math.abs(t.amount).toFixed(2) : ''}
                              onChange={e => handleCellChange(t.id, 'credit', e.target.value)}
                              style={{ width: '90px', textAlign: 'right', background: 'rgba(255,255,255,0.03)', border: '1px solid transparent', borderRadius: '6px', color: 'var(--accent-emerald)', padding: '6px 8px', fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', outline: 'none' }}
                              onFocus={e => e.target.style.borderColor = 'var(--accent-emerald)'}
                              onBlur={e => e.target.style.borderColor = 'transparent'}
                            />
                          </td>

                          {/* Balance Display */}
                          <td style={{ padding: '8px 14px', textAlign: 'right', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                            {t.balance !== null && t.balance !== undefined ? `${curr}${Number(t.balance).toFixed(2)}` : '—'}
                          </td>

                          {/* Delete Action */}
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                              title="Delete Transaction"
                            >
                              <Trash2 size={14} />
                            </button>
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
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Strict Privacy &amp; Zero Retention</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Your financial documents are processed strictly in ephemeral volatile memory (RAM) and permanently wiped the instant your .QBO or .XLSX file is generated. We never store bank statements on disk, never log transaction rows, and never use client data to train AI models. Hosted on SOC 2 Type II certified cloud infrastructure.
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

        {/* Live Demo Video & Technical Guarantees Section (Task 1) */}
        <LiveDemoSection onTryChaseDemo={loadSample} />

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
                  { feature: "Data Privacy & Security", ls: "🛡️ Ephemeral RAM (SOC 2 Cloud)", chat: "⚠️ Trains on Your Bank Data", manual: "⚠️ Exposed to Outsourced Staff", legacy: "🛡️ Local Machine" },
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
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> <strong>Scanned PDF OCR Engine</strong> (Up to 50 pages/mo)</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Interactive Reconciliation &amp; Editable Grid</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> AI Payee Cleanup &amp; Smart Truncation</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Certified .QBO, .XLSX &amp; .CSV Exports</li>
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
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> <strong>Unlimited</strong> Scanned &amp; Faxed PDF OCR Engine</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Dedicated API Access &amp; Batch Processing</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={18} color="var(--accent-cyan)" /> Custom INTU.BID Bank Routing Configuration</li>
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
                a: "Your financial documents are processed strictly in ephemeral volatile memory (RAM) and permanently wiped the instant your .QBO or .XLSX file is generated. We never store bank statements on disk, never log transaction rows, and never use client data to train AI models. Hosted on SOC 2 Type II certified cloud infrastructure."
              },
              {
                q: "Why shouldn't I just use ChatGPT or Gemini to convert my bank statement for free?",
                a: "QuickBooks strictly rejects regular spreadsheets and markdown text; it requires certified OFX 102/200 binary formatting with financial institution INTU.BID tags and cryptographic FITID transaction hashes that ChatGPT cannot produce. Furthermore, probabilistic AI models frequently hallucinate amounts, swap credit/debit columns, and violate client privacy regulations by retaining sensitive financial data. LedgerSnap processes files strictly in ephemeral volatile memory (RAM) hosted on SOC 2 Type II certified cloud infrastructure with deterministic balance checksums."
              },
              {
                q: "Which banks are supported?",
                a: "LedgerSnap supports all major US national and regional banks including JPMorgan Chase, Bank of America, Wells Fargo, Citibank, Capital One, Mercury Bank, PNC Bank, U.S. Bank, TD Bank, Truist Bank, Silicon Valley Bank (SVB), and 500+ credit unions across the United States."
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
      )}

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

                  {/* Option 2: CPA & Accounting Firm */}
                  <div 
                    onClick={() => setCheckoutPlan('firm')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      border: checkoutPlan === 'firm' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      background: checkoutPlan === 'firm' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '15px' }}>CPA & Accounting Firm</span>
                        <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent-cyan)', fontWeight: '800', padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase' }}>High Volume</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Unlimited team seats • Dedicated API • Scanned & Faxed OCR</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800' }}>$49.00</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>/mo</span>
                    </div>
                  </div>

                  {/* Option 3: Single Pass */}
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
                  {checkoutLoading ? 'Opening Checkout...' : `Proceed to Checkout (${checkoutPlan === 'single' ? '$4.99' : (checkoutPlan === 'firm' ? '$49.00/mo' : '$19.99/mo')})`}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px', fontSize: '12px', color: 'var(--text-dim)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> Powered by Paddle</span>
                  <span>•</span>
                  <span>Card / Apple Pay / PayPal</span>
                  <span>•</span>
                  <span>Cancel Anytime</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)' }}>
                  Questions or custom invoices? Contact us at <a href="mailto:support@ledger-snap.com" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>support@ledger-snap.com</a>
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
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)' }}>
                  Need help? Contact support at <a href="mailto:support@ledger-snap.com" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>support@ledger-snap.com</a>
                </div>
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

      {/* Footer (Task 5 & Contact Support) */}
      <Footer onNavigate={handleNavigate} onOpenGuide={() => setIsGuideOpen(true)} />

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
