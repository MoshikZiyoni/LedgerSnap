import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, AlertTriangle, AlertCircle, Download, 
  UploadCloud, ArrowRight, ShieldCheck, Zap, RefreshCw, Sparkles,
  ChevronDown, Settings, Check, ExternalLink
} from 'lucide-react';
import { 
  parseQboText, fixQboErrorOL222, generateClientQbo, 
  cleanPayeeName, formatOfxDate 
} from '../utils/qboUtils';

export default function ToolsPage({ tool, onNavigate }) {
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [repairedData, setRepairedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // CSV to QBO specific state
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRawRows, setCsvRawRows] = useState([]);
  const [colMap, setColMap] = useState({ date: 0, desc: 1, amount: 2, debit: -1, credit: -1 });
  const [csvSettings, setCsvSettings] = useState({
    currency: 'USD',
    accountType: 'CHECKING',
    accountId: '123456789',
    bankName: 'Universal Bank',
    dateFormat: 'auto'
  });

  // OFX to QBO specific state
  const [ofxConverted, setOfxConverted] = useState(null);

  useEffect(() => {
    document.title = tool.metaTitle;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', tool.metaDescription);
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://ledger-snap.com/tools/${tool.slug}`);
    }

    return () => {
      document.title = "LedgerSnap | Convert Bank Statement PDF to QuickBooks (.QBO) & Excel";
    };
  }, [tool]);

  // Handle QBO / OFX upload for Viewer
  const handleQboUpload = (file) => {
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);
    setRepairedData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setFileContent(text);
      const parsed = parseQboText(text);
      setParsedData(parsed);
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  // 1-Click Fix OL-222
  const handleFixOL222 = () => {
    if (!fileContent) return;
    const { fixedContent, repairsApplied } = fixQboErrorOL222(fileContent);
    setRepairedData({
      content: fixedContent,
      repairs: repairsApplied,
      reparsed: parseQboText(fixedContent)
    });
  };

  const handleDownloadFixedQbo = () => {
    if (!repairedData) return;
    const blob = new Blob([repairedData.content], { type: 'application/x-ofx' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.(qbo|ofx|qfx)$/i, '') + '_Fixed_OL222.qbo';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCsvFromQbo = () => {
    const txns = (repairedData ? repairedData.reparsed : parsedData)?.transactions || [];
    if (txns.length === 0) return;

    let csv = "Date,Type,Amount,Payee/Name,Memo,FITID\n";
    for (const t of txns) {
      csv += `"${t.date}","${t.type}",${t.amount},"${(t.name || '').replace(/"/g, '""')}","${(t.memo || '').replace(/"/g, '""')}","${t.fitid || ''}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (fileName ? fileName.replace(/\.[^/.]+$/, "") : "qbo_export") + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Handle CSV Upload
  const handleCsvUpload = (file) => {
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        // Simple CSV splitter handling quotes
        const parseLine = (line) => {
          const res = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
              res.push(cur.trim());
              cur = '';
            } else {
              cur += ch;
            }
          }
          res.push(cur.trim());
          return res;
        };

        const headers = parseLine(lines[0]);
        setCsvHeaders(headers);

        const rows = lines.slice(1).map(l => parseLine(l)).filter(r => r.length >= 2);
        setCsvRawRows(rows);

        // Auto-detect columns
        const newMap = { date: 0, desc: 1, amount: -1, debit: -1, credit: -1 };
        headers.forEach((h, idx) => {
          const lower = h.toLowerCase();
          if (lower.includes('date') || lower.includes('time')) newMap.date = idx;
          else if (lower.includes('desc') || lower.includes('payee') || lower.includes('memo') || lower.includes('name')) newMap.desc = idx;
          else if (lower.includes('amount') || lower.includes('total')) newMap.amount = idx;
          else if (lower.includes('debit') || lower.includes('withdrawal') || lower.includes('out')) newMap.debit = idx;
          else if (lower.includes('credit') || lower.includes('deposit') || lower.includes('in')) newMap.credit = idx;
        });

        if (newMap.amount === -1 && newMap.debit !== -1) {
          // Keep debit & credit mapped
        } else if (newMap.amount === -1) {
          newMap.amount = Math.min(2, headers.length - 1);
        }
        setColMap(newMap);
      }
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  // Convert CSV rows to QBO and download
  const handleConvertCsvToQbo = () => {
    if (csvRawRows.length === 0) return;

    const txns = [];
    for (const r of csvRawRows) {
      const d = r[colMap.date] || '';
      const desc = r[colMap.desc] || 'Transaction';
      let amt = 0;

      if (colMap.debit !== -1 && colMap.credit !== -1) {
        const deb = parseFloat((r[colMap.debit] || '0').replace(/[^0-9.-]/g, '')) || 0;
        const cred = parseFloat((r[colMap.credit] || '0').replace(/[^0-9.-]/g, '')) || 0;
        amt = cred > 0 ? cred : -Math.abs(deb);
      } else {
        const rawAmt = (r[colMap.amount] || '0').replace(/[^0-9.-]/g, '');
        amt = parseFloat(rawAmt) || 0;
      }

      if (d && !isNaN(amt) && amt !== 0) {
        txns.push({
          date: d,
          description: desc,
          amount: amt
        });
      }
    }

    const qboContent = generateClientQbo({
      transactions: txns,
      bankName: csvSettings.bankName,
      accountId: csvSettings.accountId,
      currency: csvSettings.currency,
      accountType: csvSettings.accountType,
      dateFormat: csvSettings.dateFormat === 'auto' ? 'DD/MM/YYYY' : csvSettings.dateFormat
    });

    const blob = new Blob([qboContent], { type: 'application/x-ofx' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (fileName ? fileName.replace(/\.[^/.]+$/, "") : "converted") + ".qbo";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Handle OFX to QBO
  const handleOfxUpload = (file) => {
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { fixedContent, repairsApplied } = fixQboErrorOL222(text);
      setOfxConverted({
        content: fixedContent,
        repairs: repairsApplied,
        parsed: parseQboText(fixedContent)
      });
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleDownloadOfxToQbo = () => {
    if (!ofxConverted) return;
    const blob = new Blob([ofxConverted.content], { type: 'application/x-ofx' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.(ofx|qfx)$/i, '') + '.qbo';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ flex: 1, maxWidth: '1040px', margin: '0 auto', width: '100%', padding: '36px 24px 80px 24px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onNavigate('/'); }} 
          style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
        >
          Home
        </a>
        <span>/</span>
        <span style={{ color: 'var(--text-muted)' }}>Free Tools</span>
        <span>/</span>
        <span style={{ color: '#fff', fontWeight: '600' }}>{tool.title}</span>
      </div>

      {/* Hero Title & Subheading */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '14px' }}>
          <Sparkles size={14} /> 100% Client-Side In-Browser Tool • Zero Server Upload
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '12px', color: '#fff' }}>
          {tool.heading}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          {tool.subheading}
        </p>
      </div>

      {/* Main Tool Work Area */}
      <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginBottom: '40px' }}>
        
        {/* TOOL 1: QBO VIEWER & OL-222 CHECKER */}
        {(tool.slug === 'qbo-viewer-and-validator' || tool.slug === 'qbo-viewer-checker') && (
          <div>
            {!parsedData ? (
              <div 
                style={{
                  border: '2px dashed rgba(56, 189, 248, 0.4)',
                  borderRadius: '14px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: 'rgba(56, 189, 248, 0.03)',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('qbo-file-input').click()}
              >
                <input 
                  type="file" 
                  id="qbo-file-input" 
                  accept=".qbo,.ofx,.qfx" 
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleQboUpload(e.target.files[0])}
                />
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <FileText size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
                  Drop your .QBO, .OFX, or .QFX file here
                </h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '16px' }}>
                  Runs 100% locally in your browser. Fast error diagnosis & syntax repair.
                </p>
                <button type="button" className="gradient-btn" style={{ padding: '10px 22px', fontSize: '14px' }}>
                  Select File from Computer
                </button>
              </div>
            ) : (
              <div>
                {/* Header bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>File Analyzed:</span>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{fileName}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => { setParsedData(null); setRepairedData(null); }}
                      style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Inspect Another File
                    </button>
                    <button 
                      onClick={handleExportCsvFromQbo}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={14} /> Export to CSV
                    </button>
                    <button 
                      onClick={handleFixOL222}
                      className="gradient-btn"
                      style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Zap size={14} /> 1-Click Fix Error OL-222
                    </button>
                  </div>
                </div>

                {/* Validation Status Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                  <div style={{ background: parsedData.intuBid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '10px', border: parsedData.intuBid ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: parsedData.intuBid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {parsedData.intuBid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} INTU.BID Tag
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: '#fff' }}>
                      {parsedData.intuBid ? `ID: ${parsedData.intuBid}` : 'MISSING (Error OL-222)'}
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {parsedData.intuBid ? 'Recognized financial institution' : 'QuickBooks will reject Web Connect import'}
                    </span>
                  </div>

                  <div style={{ background: parsedData.errors.length === 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '10px', border: parsedData.errors.length === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: parsedData.errors.length === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {parsedData.errors.length === 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} XML / Tag Syntax
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: '#fff' }}>
                      {parsedData.errors.length === 0 ? 'Valid OFX 102 SGML' : `${parsedData.errors.length} Syntax Errors`}
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {parsedData.errors.length === 0 ? 'No XML-breaking entities detected' : parsedData.errors[0]}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Transactions Parsed</span>
                    <p style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: '#fff' }}>
                      {parsedData.transactions.length} rows
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      Currency: {parsedData.currency} • Type: {parsedData.accountType}
                    </span>
                  </div>
                </div>

                {/* Repair Banner if Fixed */}
                {repairedData && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>
                        <CheckCircle2 size={18} /> File Successfully Repaired for QuickBooks!
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        {repairedData.repairs.length > 0 ? repairedData.repairs.join(' • ') : 'Validated all tags and syntax. Ready for import.'}
                      </p>
                    </div>
                    <button 
                      onClick={handleDownloadFixedQbo}
                      className="gradient-btn"
                      style={{ padding: '10px 22px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Download size={16} /> Download Clean .QBO
                    </button>
                  </div>
                )}

                {/* Transactions Table */}
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '10px 14px' }}>Date</th>
                        <th style={{ padding: '10px 14px' }}>Payee (&lt;NAME&gt;)</th>
                        <th style={{ padding: '10px 14px' }}>Memo</th>
                        <th style={{ padding: '10px 14px' }}>Type</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '10px 14px' }}>FITID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(repairedData ? repairedData.reparsed : parsedData).transactions.slice(0, 50).map((t, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{t.date}</td>
                          <td style={{ padding: '10px 14px', fontWeight: '600', color: '#fff' }}>{t.name}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{t.memo}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: t.type === 'CREDIT' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', color: t.type === 'CREDIT' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                              {t.type}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: t.amount >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                            {t.amount >= 0 ? `+${t.amount.toFixed(2)}` : t.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-dim)' }}>{t.fitid}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 2: CSV TO QBO CONVERTER */}
        {tool.slug === 'csv-to-qbo' && (
          <div>
            {csvRawRows.length === 0 ? (
              <div 
                style={{
                  border: '2px dashed rgba(56, 189, 248, 0.4)',
                  borderRadius: '14px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: 'rgba(56, 189, 248, 0.03)',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('csv-file-input').click()}
              >
                <input 
                  type="file" 
                  id="csv-file-input" 
                  accept=".csv,.txt" 
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleCsvUpload(e.target.files[0])}
                />
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <UploadCloud size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
                  Drop your Bank CSV spreadsheet here
                </h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '16px' }}>
                  Converts to certified QuickBooks Web Connect (.QBO) file with valid INTU.BID #3000.
                </p>
                <button type="button" className="gradient-btn" style={{ padding: '10px 22px', fontSize: '14px' }}>
                  Select CSV File
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Loaded File:</span>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{fileName} ({csvRawRows.length} rows)</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => { setCsvRawRows([]); setCsvHeaders([]); }}
                      style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Upload Different CSV
                    </button>
                    <button 
                      onClick={handleConvertCsvToQbo}
                      className="gradient-btn"
                      style={{ padding: '8px 24px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={16} /> Download .QBO File
                    </button>
                  </div>
                </div>

                {/* Column Mapping Section */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Settings size={16} /> Match CSV Columns:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Date Column:</label>
                      <select 
                        value={colMap.date} 
                        onChange={(e) => setColMap({ ...colMap, date: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                      >
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h || `Col ${i+1}`}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Payee / Description Column:</label>
                      <select 
                        value={colMap.desc} 
                        onChange={(e) => setColMap({ ...colMap, desc: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                      >
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h || `Col ${i+1}`}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Amount Column:</label>
                      <select 
                        value={colMap.amount} 
                        onChange={(e) => setColMap({ ...colMap, amount: parseInt(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                      >
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h || `Col ${i+1}`}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Currency:</label>
                      <select 
                        value={csvSettings.currency} 
                        onChange={(e) => setCsvSettings({ ...csvSettings, currency: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '13px' }}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="ILS">ILS (₪)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                        <option value="AUD">AUD (A$)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preview Table */}
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 14px' }}>Mapped Date</th>
                        <th style={{ padding: '10px 14px' }}>Mapped Description</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Mapped Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvRawRows.slice(0, 15).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{row[colMap.date]}</td>
                          <td style={{ padding: '10px 14px', color: '#fff' }}>{row[colMap.desc]}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700' }}>{row[colMap.amount]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 3: OFX / QFX TO QBO CONVERTER */}
        {(tool.slug === 'ofx-to-qbo' || tool.slug === 'qfx-to-qbo' || tool.slug === 'ofx-qfx-to-qbo') && (
          <div>
            {!ofxConverted ? (
              <div 
                style={{
                  border: '2px dashed rgba(56, 189, 248, 0.4)',
                  borderRadius: '14px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: 'rgba(56, 189, 248, 0.03)',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('ofx-file-input').click()}
              >
                <input 
                  type="file" 
                  id="ofx-file-input" 
                  accept=".ofx,.qfx,.xml" 
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleOfxUpload(e.target.files[0])}
                />
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <FileText size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
                  Drop your generic .OFX or Quicken .QFX file here
                </h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '16px' }}>
                  Injects certified QuickBooks Web Connect headers &amp; INTU.BID #3000 in 1 second.
                </p>
                <button type="button" className="gradient-btn" style={{ padding: '10px 22px', fontSize: '14px' }}>
                  Select OFX/QFX File
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>File Converted:</span>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{fileName}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setOfxConverted(null)}
                      style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Convert Another File
                    </button>
                    <button 
                      onClick={handleDownloadOfxToQbo}
                      className="gradient-btn"
                      style={{ padding: '8px 24px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={16} /> Download Certified .QBO
                    </button>
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>
                    <CheckCircle2 size={18} /> Injected QuickBooks Web Connect Headers!
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                    Successfully injected &lt;INTU.BID&gt;3000 and standardized headers for QuickBooks Online and Desktop Web Connect.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* High-Converting Upsell Banner to LedgerSnap Main PDF Converter */}
      <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '56px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
          <Sparkles size={14} /> Need to convert PDF bank statements?
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
          Stop Typing Bank Statements by Hand
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '620px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
          LedgerSnap converts digital and scanned PDF bank statements directly to certified .QBO, Excel, and CSV in 3 seconds with guaranteed mathematical balance reconciliation.
        </p>
        <button 
          onClick={() => onNavigate('/')}
          className="gradient-btn"
          style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>Convert a Bank Statement PDF Free</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ marginBottom: '56px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '800', textAlign: 'center', marginBottom: '24px' }}>
          Why Professional Bookkeepers Use LedgerSnap Micro-Tools
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {tool.features.map((feat, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Check size={18} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <section style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '800', textAlign: 'center', marginBottom: '24px' }}>
          Frequently Asked Questions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tool.faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{ padding: '20px 24px', cursor: 'pointer', borderRadius: '12px' }}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{faq.q}</h4>
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
    </div>
  );
}
