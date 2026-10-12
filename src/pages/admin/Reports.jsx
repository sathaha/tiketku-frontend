import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

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
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60';

/* Notches are cut out of the ticket with a mask, so they work on any background. */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const ticketCss = `
  .ticket-notch { -webkit-mask: ${notch}; mask: ${notch}; }
  @media (min-width: 640px) {
    .ticket-notch-sm { -webkit-mask: ${notch}; mask: ${notch}; }
  }
`;

const statusConfig = {
  lunas: { label: 'Paid', text: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  menunggu_pembayaran: { label: 'Awaiting Payment', text: 'text-yellow-700', dot: 'bg-yellow-500', bar: 'bg-yellow-500' },
  kadaluarsa: { label: 'Expired', text: 'text-red-700', dot: 'bg-red-500', bar: 'bg-red-500' },
  dibatalkan: { label: 'Cancelled', text: 'text-amber-700/60', dot: 'bg-amber-500/60', bar: 'bg-amber-500/60' },
};

function SkeletonReport() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-amber-200/60 rounded-2xl p-5 space-y-3">
            <div className="h-9 w-9 bg-amber-100 rounded-lg" />
            <div className="h-6 w-20 bg-amber-100 rounded" />
            <div className="h-3 w-16 bg-amber-100 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-amber-200/60 rounded-2xl p-5 space-y-4">
        <div className="h-5 w-40 bg-amber-100 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full bg-amber-100 rounded" />
            <div className="h-1.5 w-full bg-amber-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function notify(type, message) {
    setToast({ type, message, id: Date.now() });
  }

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await api.get('/reports/sales', {
        params: from && to ? { from, to } : {},
      });
      setReport(res.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      notify('error', 'Failed to load report.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleApplyFilter() {
    if (from && to && from > to) {
      notify('error', 'Start date cannot be after the end date.');
      return;
    }
    setRefreshing(true);
    fetchReport();
  }

  function handleReset() {
    setFrom('');
    setTo('');
    setRefreshing(true);
    api.get('/reports/sales')
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch report:', err);
        notify('error', 'Failed to reset report.');
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
      const params = from && to ? { from, to } : {};
      try {
        const response = await api.get('/reports/sales/export', {
          params,
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sales-report-${from || 'all'}-${to || 'time'}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        notify('success', 'Report exported');
      } catch (exportErr) {
        console.warn('Export endpoint not found, generating CSV locally:', exportErr);
        generateCSVFromData();
        notify('success', 'Report exported');
      }
    } catch (err) {
      console.error('Failed to export report:', err);
      notify('error', 'Failed to export the report.');
    } finally {
      setExporting(false);
    }
  }

  function generateCSVFromData() {
    if (!report) return;
    let csv = '';
    csv += 'SALES REPORT\n';
    csv += `Period: ${from || 'All'} - ${to || 'Time'}\n\n`;
    csv += 'SUMMARY\n';
    csv += 'Total Orders,Total Paid Orders,Total Tickets Sold,Total Revenue\n';
    csv += `${report.summary.total_orders},${report.summary.total_paid_orders},${report.summary.total_tickets_sold},"${formatRupiah(report.summary.total_revenue)}"\n\n`;
    csv += 'SALES BY CONCERT\n';
    csv += 'Concert Name,Tickets Sold,Revenue\n';
    report.by_concert.forEach((concert) => {
      csv += `"${concert.name}",${concert.tickets_sold},"${formatRupiah(concert.revenue)}"\n`;
    });
    csv += '\nTRANSACTION STATUS\n';
    csv += 'Status,Total\n';
    report.by_status.forEach((status) => {
      csv += `${status.status},${status.total}\n`;
    });
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `sales-report-${from || 'all'}-${to || 'time'}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  const summaryCards = useMemo(() => {
    if (!report) return [];
    return [
      {
        label: 'Total Orders',
        value: report.summary.total_orders,
        icon: 'trending',
        accent: 'text-blue-700',
        bg: 'bg-blue-100',
        border: 'border-blue-200/60',
      },
      {
        label: 'Paid Orders',
        value: report.summary.total_paid_orders,
        icon: 'check',
        accent: 'text-emerald-700',
        bg: 'bg-emerald-100',
        border: 'border-emerald-200/60',
      },
      {
        label: 'Tickets Sold',
        value: report.summary.total_tickets_sold,
        icon: 'ticket',
        accent: 'text-amber-700',
        bg: 'bg-amber-100',
        border: 'border-amber-200/60',
      },
      {
        label: 'Total Revenue',
        value: formatRupiah(report.summary.total_revenue),
        icon: 'wallet',
        accent: 'text-purple-700',
        bg: 'bg-purple-100',
        border: 'border-purple-200/60',
      },
    ];
  }, [report]);

  const maxRevenue = useMemo(() => {
    if (!report?.by_concert?.length) return 0;
    return Math.max(...report.by_concert.map((c) => c.revenue));
  }, [report]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f5ede4]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <style>{ticketCss}</style>

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-amber-950">Sales report</h1>
              <p className="font-serif text-sm text-amber-700/70 mt-1">
                {loading ? 'Loading report...' : report ? `${report.by_concert.length} concerts tracked` : 'Sales analysis and concert performance'}
              </p>
            </div>
            {report && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors disabled:opacity-60 self-start sm:self-auto ${focusRing}`}
              >
                {exporting ? (
                  <>
                    <Spinner />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Icon name="download" className="w-4 h-4" />
                    Export CSV
                  </>
                )}
              </button>
            )}
          </header>

          {/* Filter */}
          <div className="bg-white border border-amber-200/60 rounded-2xl p-5 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[160px]">
                <label htmlFor="report-from" className="block font-serif text-sm text-amber-900 mb-1.5">
                  From date
                </label>
                <input
                  id="report-from"
                  type="date"
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label htmlFor="report-to" className="block font-serif text-sm text-amber-900 mb-1.5">
                  To date
                </label>
                <input
                  id="report-to"
                  type="date"
                  min={from || undefined}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <button
                onClick={handleApplyFilter}
                disabled={refreshing}
                className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
              >
                {refreshing ? (
                  <>
                    <Spinner />
                    Loading...
                  </>
                ) : (
                  <>
                    <Icon name="calendar" className="w-4 h-4" />
                    Apply
                  </>
                )}
              </button>
              {(from || to) && (
                <button
                  onClick={handleReset}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                >
                  <Icon name="refresh" className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <SkeletonReport />
          ) : report && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {summaryCards.map((card, index) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="bg-white border border-amber-200/60 rounded-2xl p-4 hover:border-amber-300 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg ${card.bg} border ${card.border} flex items-center justify-center mb-3`}>
                      <Icon name={card.icon} className={`w-4 h-4 ${card.accent}`} />
                    </div>
                    <p className="font-serif text-xl font-bold text-amber-950 font-mono tabular-nums leading-none">
                      {card.value}
                    </p>
                    <p className="font-serif text-xs text-amber-700/70 mt-1.5">{card.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Sales by Concert */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.25 }}
                className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden mb-6"
              >
                <div className="p-5 border-b border-amber-200/60">
                  <div className="flex items-center gap-2">
                    <Icon name="trending" className="w-4 h-4 text-amber-600" />
                    <h2 className="font-serif font-semibold text-amber-950">Sales by concert</h2>
                  </div>
                  <p className="font-serif text-xs text-amber-700/70 mt-0.5">
                    {report.by_concert.length} concerts
                  </p>
                </div>

                {report.by_concert.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                      <Icon name="trending" className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-serif font-semibold text-amber-950 mb-1">No sales data</h3>
                    <p className="font-serif text-sm text-amber-700/70">
                      There are no sales records for this period yet.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-amber-200/60">
                    {report.by_concert.map((concert, index) => {
                      const percentage = maxRevenue > 0 ? (concert.revenue / maxRevenue) * 100 : 0;
                      return (
                        <motion.li
                          key={concert.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + index * 0.03, duration: 0.2 }}
                          className="p-4 hover:bg-amber-50/50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-serif font-medium text-amber-950 truncate">
                                {concert.name}
                              </p>
                              <p className="font-serif text-xs text-amber-700/70 mt-0.5 flex items-center gap-1.5">
                                <Icon name="ticket" className="w-3.5 h-3.5" />
                                <span className="font-mono tabular-nums">{concert.tickets_sold}</span> tickets sold
                              </p>
                            </div>
                            <span className="font-serif font-semibold text-amber-700 shrink-0 font-mono tabular-nums">
                              {formatRupiah(concert.revenue)}
                            </span>
                          </div>
                          <div
                            className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden"
                            role="progressbar"
                            aria-valuenow={Math.round(percentage)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${concert.name} revenue share`}
                          >
                            <div
                              className="h-full rounded-full bg-amber-500 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>

              {/* Transaction Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.25 }}
                className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b border-amber-200/60">
                  <h2 className="font-serif font-semibold text-amber-950">Transaction status</h2>
                  <p className="font-serif text-xs text-amber-700/70 mt-0.5">
                    Payment status distribution
                  </p>
                </div>

                {report.by_status.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                      <Icon name="chart" className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-serif font-semibold text-amber-950 mb-1">No transactions</h3>
                    <p className="font-serif text-sm text-amber-700/70">
                      No transactions recorded for this period.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-amber-200/60">
                    {report.by_status.map((status, index) => {
                      const config = statusConfig[status.status] || {
                        label: status.status,
                        text: 'text-amber-700',
                        dot: 'bg-amber-500',
                        bar: 'bg-amber-500',
                      };
                      const totalTransactions = report.summary.total_orders || 1;
                      const percentage = (status.total / totalTransactions) * 100;
                      return (
                        <motion.li
                          key={status.status}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + index * 0.03, duration: 0.2 }}
                          className="p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                              <span className={`font-serif text-sm font-medium ${config.text}`}>
                                {config.label}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-serif font-semibold text-amber-950 font-mono tabular-nums">
                                {status.total}
                              </span>
                              <span className="font-serif text-xs text-amber-700/70 font-mono tabular-nums">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div
                            className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden"
                            role="progressbar"
                            aria-valuenow={Math.round(percentage)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${config.label} share`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            </>
          )}

          {/* Toast */}
          <div className="fixed bottom-6 inset-x-0 z-[80] flex justify-center px-4 pointer-events-none">
            <AnimatePresence>
              {toast && (
                <motion.div
                  key={toast.id}
                  role="status"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.18 }}
                  className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg border font-serif text-sm font-medium ${
                    toast.type === 'error'
                      ? 'bg-red-50 border-red-200/60 text-red-700'
                      : 'bg-emerald-50 border-emerald-200/60 text-emerald-700'
                  }`}
                >
                  <Icon name={toast.type === 'error' ? 'close' : 'check'} className="w-4 h-4" />
                  {toast.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}