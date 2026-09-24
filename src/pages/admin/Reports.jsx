import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, formatRupiah } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    check: 'M5 13l4 4L19 7',
    close: 'M6 18L18 6M6 6l12 12',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2',
    file: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

export default function Reports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await api.get('/reports/sales', { 
        params: from && to ? { from, to } : {} 
      });
      setReport(res.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleApplyFilter() {
    setRefreshing(true);
    fetchReport();
  }

  function handleReset() {
    setFrom('');
    setTo('');
    setRefreshing(true);
    // Directly fetch without params
    api.get('/reports/sales')
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch report:', err);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  async function handleExport() {
    if (!report) return;
    
    setExporting(true);
    try {
      // Coba fetch dari endpoint export jika ada
      const params = from && to ? { from, to } : {};
      
      // Method 1: Jika backend menyediakan endpoint export CSV
      try {
        const response = await api.get('/reports/sales/export', {
          params,
          responseType: 'blob',
        });
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `laporan-penjualan-${from || 'semua'}-${to || 'waktu'}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (exportErr) {
        // Method 2: Fallback - generate CSV dari data yang ada
        console.warn('Export endpoint not found, generating CSV locally:', exportErr);
        generateCSVFromData();
      }
    } catch (err) {
      console.error('Failed to export report:', err);
      alert('Gagal mengexport laporan.');
    } finally {
      setExporting(false);
    }
  }

  function generateCSVFromData() {
    if (!report) return;
    
    let csv = '';
    
    // Add summary section
    csv += 'LAPORAN PENJUALAN\n';
    csv += `Periode: ${from || 'Semua'} - ${to || 'Waktu'}\n\n`;
    csv += 'RINGKASAN\n';
    csv += 'Total Pesanan,Total Pesanan Lunas,Total Tiket Terjual,Total Pendapatan\n';
    csv += `${report.summary.total_orders},${report.summary.total_paid_orders},${report.summary.total_tickets_sold},"${formatRupiah(report.summary.total_revenue)}"\n\n`;
    
    // Add concert sales
    csv += 'PENJUALAN PER KONSER\n';
    csv += 'Nama Konser,Tiket Terjual,Pendapatan\n';
    report.by_concert.forEach((concert) => {
      csv += `"${concert.name}",${concert.tickets_sold},"${formatRupiah(concert.revenue)}"\n`;
    });
    
    csv += '\nSTATUS TRANSAKSI\n';
    csv += 'Status,Total\n';
    report.by_status.forEach((status) => {
      csv += `${status.status},${status.total}\n`;
    });
    
    // Create and download CSV
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `laporan-penjualan-${from || 'semua'}-${to || 'waktu'}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  const statusConfig = {
    lunas: { label: 'Lunas', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'check' },
    menunggu_pembayaran: { label: 'Menunggu Pembayaran', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: 'clock' },
    kadaluarsa: { label: 'Kadaluarsa', color: 'text-red-400', bg: 'bg-red-500/10', icon: 'close' },
    dibatalkan: { label: 'Dibatalkan', color: 'text-ink-400', bg: 'bg-ink-700', icon: 'close' },
  };

  const summaryCards = report ? [
    { 
      label: 'Total Pesanan', 
      value: report.summary.total_orders, 
      icon: 'trending',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    { 
      label: 'Pesanan Lunas', 
      value: report.summary.total_paid_orders, 
      icon: 'check',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    { 
      label: 'Tiket Terjual', 
      value: report.summary.total_tickets_sold, 
      icon: 'ticket',
      color: 'text-flame-400',
      bg: 'bg-flame-500/10',
      border: 'border-flame-500/20'
    },
    { 
      label: 'Total Pendapatan', 
      value: formatRupiah(report.summary.total_revenue), 
      icon: 'wallet',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header dengan subtle accent */}
      <div className="relative mb-6">
        <div className="absolute -top-8 -left-4 w-40 h-40 bg-flame-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-flame-500/10 flex items-center justify-center">
              <Icon name="chart" className="w-5 h-5 text-flame-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Laporan Penjualan</h1>
              <p className="text-sm text-ink-400 mt-0.5">
                Analisis penjualan dan performa konser
              </p>
            </div>
          </div>
          {report && (
            <button 
              onClick={handleExport}
              disabled={exporting}
              className="btn-secondary inline-flex items-center gap-2 text-xs"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Mengexport...
                </>
              ) : (
                <>
                  <Icon name="download" className="w-4 h-4" />
                  Export CSV
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filter dengan gradient accent */}
      <div className="relative card p-5 mb-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-flame-500/20 to-transparent" />
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-ink-200 mb-1.5">Dari Tanggal</label>
            <input
              type="date"
              className="w-full input-field bg-ink-800/40"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-ink-200 mb-1.5">Sampai Tanggal</label>
            <input
              type="date"
              className="w-full input-field bg-ink-800/40"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button
            onClick={handleApplyFilter}
            disabled={refreshing}
            className="btn-primary inline-flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memuat...
              </>
            ) : (
              <>
                <Icon name="calendar" className="w-4 h-4" />
                Terapkan
              </>
            )}
          </button>
          {(from || to) && (
            <button
              onClick={handleReset}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Icon name="refresh" className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : report && (
        <>
          {/* Summary Cards dengan hover effect */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group card p-5 hover:border-ink-600 transition-all hover:-translate-y-0.5"
              >
                <div className={`w-10 h-10 rounded-lg ${card.bg} border ${card.border} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon name={card.icon} className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-ink-300 mt-1">{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Sales by Concert dengan progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card mb-6 overflow-hidden"
          >
            <div className="p-5 border-b border-ink-700">
              <div className="flex items-center gap-2">
                <Icon name="trending" className="w-4 h-4 text-flame-400" />
                <h2 className="font-semibold text-white">Penjualan per Konser</h2>
              </div>
              <p className="text-xs text-ink-400 mt-0.5">
                {report.by_concert.length} konser
              </p>
            </div>

            {report.by_concert.length === 0 ? (
              <div className="p-12 text-center">
                <Icon name="trending" className="w-12 h-12 text-ink-600 mx-auto mb-3" />
                <p className="text-sm text-ink-400">Belum ada data penjualan.</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-700/60">
                {report.by_concert.map((concert, index) => {
                  const maxRevenue = Math.max(...report.by_concert.map(c => c.revenue));
                  const percentage = maxRevenue > 0 ? (concert.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <motion.div
                      key={concert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.03 }}
                      className="p-4 hover:bg-ink-800/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate group-hover:text-flame-400 transition-colors">
                            {concert.name}
                          </p>
                          <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
                            <Icon name="ticket" className="w-3 h-3" />
                            {concert.tickets_sold} tiket terjual
                          </p>
                        </div>
                        <span className="font-semibold text-flame-400 shrink-0">
                          {formatRupiah(concert.revenue)}
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="w-full bg-ink-800 rounded-full h-1 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-flame-500/50 to-flame-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Transaction Status dengan percentage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card overflow-hidden"
          >
            <div className="p-5 border-b border-ink-700">
              <h2 className="font-semibold text-white">Status Transaksi</h2>
              <p className="text-xs text-ink-400 mt-0.5">
                Distribusi status pembayaran
              </p>
            </div>

            <div className="divide-y divide-ink-700/60">
              {report.by_status.map((status, index) => {
                const config = statusConfig[status.status] || {
                  label: status.status,
                  color: 'text-ink-300',
                  bg: 'bg-ink-700',
                  icon: 'trending'
                };
                const totalTransactions = report.summary.total_orders || 1;
                const percentage = (status.total / totalTransactions) * 100;
                
                return (
                  <motion.div
                    key={status.status}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.03 }}
                    className="p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                          <Icon name={config.icon} className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <span className="text-sm text-ink-200">{config.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-white">{status.total}</span>
                        <span className="text-xs text-ink-400 ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-ink-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${config.bg}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}