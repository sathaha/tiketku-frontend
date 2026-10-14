import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin motion-reduce:animate-none ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const panel = 'bg-white rounded-2xl shadow-sm shadow-amber-950/5';
const ticketShadow = 'rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)]';

const inputCls =
  'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';
const labelCls = 'block text-sm font-medium text-amber-900 mb-1.5';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .ticket-card {
    --stub-h: 4.5rem;
    -webkit-mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }
`;

const statusConfig = {
  lunas: { label: 'Paid', text: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  menunggu_pembayaran: { label: 'Awaiting Payment', text: 'text-yellow-700', dot: 'bg-yellow-500', bar: 'bg-yellow-500' },
  kadaluarsa: { label: 'Expired', text: 'text-red-700', dot: 'bg-red-500', bar: 'bg-red-500' },
  dibatalkan: { label: 'Cancelled', text: 'text-amber-700/60', dot: 'bg-amber-500/60', bar: 'bg-amber-500/60' },
};

/* ============ HELPERS ============ */
const pad = (n) => String(n).padStart(2, '0');
const toInputDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const presets = [
  {
    key: '7d',
    label: 'Last 7 days',
    range: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 6);
      return { from: toInputDate(from), to: toInputDate(to) };
    },
  },
  {
    key: '30d',
    label: 'Last 30 days',
    range: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 29);
      return { from: toInputDate(from), to: toInputDate(to) };
    },
  },
  {
    key: 'month',
    label: 'This month',
    range: () => {
      const now = new Date();
      return { from: toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)), to: toInputDate(now) };
    },
  },
];

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function buildCsv(report, range) {
  const lines = [
    'SALES REPORT',
    `Period: ${range.from || 'All'} - ${range.to || 'Time'}`,
    '',
    'SUMMARY',
    'Total Orders,Total Paid Orders,Total Tickets Sold,Total Revenue',
    [
      report.summary.total_orders,
      report.summary.total_paid_orders,
      report.summary.total_tickets_sold,
      csvCell(formatRupiah(report.summary.total_revenue)),
    ].join(','),
    '',
    'SALES BY CONCERT',
    'Concert Name,Tickets Sold,Revenue',
    ...report.by_concert.map(
      (c) => `${csvCell(c.name)},${c.tickets_sold},${csvCell(formatRupiah(c.revenue))}`
    ),
    '',
    'TRANSACTION STATUS',
    'Status,Total',
    ...report.by_status.map((s) => `${csvCell(s.status)},${s.total}`),
  ];
  return lines.join('\n') + '\n';
}

/* ============ SMALL COMPONENTS ============ */
function Bone({ className = '' }) {
  return <div className={`bg-amber-100 rounded ${className}`} />;
}

function FilterChip({ label, active, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-60 ${focusRing} ${
        active ? 'bg-amber-950 text-amber-50' : 'bg-amber-100 text-amber-800 hover:text-amber-950 hover:bg-amber-200/70'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ icon, title, children, compact = false }) {
  return (
    <div className={`rounded-2xl border-2 border-dashed border-amber-300/70 text-center ${compact ? 'm-5 p-8' : 'p-12'}`}>
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">{title}</h3>
      {children}
    </div>
  );
}

function RevenueBar({ percentage, barClass = 'bg-amber-500', label }) {
  return (
    <div
      className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full rounded-full ${barClass}`}
      />
    </div>
  );
}

function SkeletonReport() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading report">
      <div className={ticketShadow}>
        <div className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)]">
          <div className="p-6 space-y-4">
            <Bone className="h-10 w-40" />
            <Bone className="h-12 w-72 max-w-full" />
          </div>
          <div className="border-t border-dashed border-amber-300/80 bg-amber-50 grid grid-cols-3 divide-x divide-dashed divide-amber-300/80">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-4 sm:px-6 flex flex-col justify-center gap-2">
                <Bone className="h-3 w-16" />
                <Bone className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`${panel} overflow-hidden`}>
        <div className="px-6 py-4 bg-amber-950 space-y-2">
          <div className="h-5 w-40 bg-amber-900 rounded" />
          <div className="h-3 w-20 bg-amber-900 rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-t first:border-t-0 border-dashed border-amber-200 space-y-3">
            <div className="flex justify-between gap-4">
              <Bone className="h-4 w-48 max-w-full" />
              <Bone className="h-4 w-24" />
            </div>
            <Bone className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ MAIN ============ */
export default function Reports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({ from: '', to: '' });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const requestRef = useRef(0);

  const notify = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() });
  }, []);

  const loadReport = useCallback(
    async (range, initial = false) => {
      const id = ++requestRef.current;
      if (initial) setLoading(true);
      else setRefreshing(true);

      try {
        const res = await api.get('/reports/sales', {
          params: range.from && range.to ? { from: range.from, to: range.to } : {},
        });
        if (id !== requestRef.current) return; // ada permintaan yang lebih baru
        setReport(res.data);
        setLoadError(false);
      } catch (err) {
        if (id !== requestRef.current) return;
        console.error('Failed to fetch report:', err);
        if (initial || !report) setLoadError(true);
        else notify('error', 'Failed to load report.');
      } finally {
        if (id === requestRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notify]
  );

  useEffect(() => {
    loadReport({ from: '', to: '' }, true);
  }, [loadReport]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function applyRange(range) {
    setFrom(range.from);
    setTo(range.to);
    setApplied(range);
    loadReport(range);
  }

  function handleApplyFilter() {
    if (from && to && from > to) {
      notify('error', 'Start date cannot be after the end date.');
      return;
    }
    applyRange({ from, to });
  }

  function handleReset() {
    applyRange({ from: '', to: '' });
  }

  async function handleExport() {
    if (!report) return;
    setExporting(true);
    const params = applied.from && applied.to ? applied : {};
    const filename = `sales-report-${applied.from || 'all'}-${applied.to || 'time'}.csv`;

    try {
      try {
        const response = await api.get('/reports/sales/export', { params, responseType: 'blob' });
        downloadBlob(new Blob([response.data]), filename);
      } catch (exportErr) {
        console.warn('Export endpoint failed, generating CSV locally:', exportErr);
        downloadBlob(
          new Blob(['\ufeff' + buildCsv(report, applied)], { type: 'text/csv;charset=utf-8;' }),
          filename
        );
      }
      notify('success', 'Report exported');
    } catch (err) {
      console.error('Failed to export report:', err);
      notify('error', 'Failed to export the report.');
    } finally {
      setExporting(false);
    }
  }

  const maxRevenue = useMemo(() => {
    if (!report?.by_concert?.length) return 0;
    return Math.max(...report.by_concert.map((c) => c.revenue));
  }, [report]);

  const onlyOneDate = (from && !to) || (!from && to);
  const hasFilter = !!(from || to || applied.from || applied.to);
  const periodLabel =
    applied.from && applied.to ? `${formatDate(applied.from)} to ${formatDate(applied.to)}` : 'All time';

  const stubStats = report
    ? [
        { label: 'Total orders', value: report.summary.total_orders, color: 'text-blue-700' },
        { label: 'Paid orders', value: report.summary.total_paid_orders, color: 'text-emerald-700' },
        { label: 'Tickets sold', value: report.summary.total_tickets_sold, color: 'text-amber-700' },
      ]
    : [];

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4] px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ===== HEADER ===== */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="f-display text-3xl font-bold text-amber-950">Sales report</h1>
              <p className="text-sm text-amber-700/80 mt-1">
                {loading
                  ? 'Loading report…'
                  : report
                    ? `${report.by_concert.length} concerts tracked`
                    : 'Sales analysis and concert performance'}
              </p>
            </div>
            {report && (
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className={`inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-60 ${focusRing}`}
              >
                {exporting ? (
                  <>
                    <Spinner />
                    Exporting…
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

          {/* ===== FILTER ===== */}
          <div className={`${panel} p-5 mb-6`}>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[160px]">
                <label htmlFor="report-from" className={labelCls}>
                  From date
                </label>
                <input
                  id="report-from"
                  type="date"
                  className={inputCls}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label htmlFor="report-to" className={labelCls}>
                  To date
                </label>
                <input
                  id="report-to"
                  type="date"
                  min={from || undefined}
                  className={inputCls}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyFilter}
                disabled={refreshing || onlyOneDate}
                className={`inline-flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
              >
                {refreshing ? (
                  <>
                    <Spinner />
                    Loading…
                  </>
                ) : (
                  <>
                    <Icon name="calendar" className="w-4 h-4" />
                    Apply
                  </>
                )}
              </button>
              {hasFilter && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={refreshing}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-60 ${focusRing}`}
                >
                  <Icon name="refresh" className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-dashed border-amber-200">
              <span className="text-xs text-amber-700/80 mr-1">Quick range</span>
              {presets.map((p) => {
                const r = p.range();
                return (
                  <FilterChip
                    key={p.key}
                    label={p.label}
                    active={applied.from === r.from && applied.to === r.to}
                    disabled={refreshing}
                    onClick={() => applyRange(r)}
                  />
                );
              })}
              {onlyOneDate && (
                <span className="text-xs text-amber-700/80 ml-auto">Choose both dates to apply a range.</span>
              )}
            </div>
          </div>

          {/* ===== CONTENT ===== */}
          {loading ? (
            <SkeletonReport />
          ) : loadError || !report ? (
            <EmptyState icon="alert" title="Couldn't load the report">
              <p className="text-sm text-amber-800/80 mb-5">Check your connection, then try again.</p>
              <button
                type="button"
                onClick={() => loadReport(applied, true)}
                className={`px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
              >
                Try again
              </button>
            </EmptyState>
          ) : (
            <div className={`space-y-6 transition-opacity duration-200 ${refreshing ? 'opacity-60' : ''}`} aria-busy={refreshing}>
              {/* Ringkasan: tiket dengan stub */}
              <div className={ticketShadow}>
                <div className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)]">
                  <div className="p-6 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Icon name="wallet" className="w-[18px] h-[18px]" />
                      </span>
                      <p className="text-sm text-amber-700/80">Total revenue</p>
                    </div>
                    <p className="mt-3 f-display text-4xl sm:text-5xl font-semibold text-amber-950 tabular-nums tracking-tight break-words">
                      {formatRupiah(report.summary.total_revenue)}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-amber-700/80 mt-3">
                      <Icon name="calendar" className="w-3.5 h-3.5 text-amber-500" />
                      {periodLabel}
                    </p>
                  </div>

                  <div className="border-t border-dashed border-amber-300/80 bg-amber-50 grid grid-cols-3 divide-x divide-dashed divide-amber-300/80">
                    {stubStats.map((s) => (
                      <div key={s.label} className="px-4 sm:px-6 flex flex-col justify-center min-w-0">
                        <p className="text-xs text-amber-700/80 truncate">{s.label}</p>
                        <p className={`f-display text-xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Penjualan per konser */}
              <section className={`${panel} overflow-hidden`}>
                <div className="flex items-center gap-3 px-6 py-4 bg-amber-950 text-amber-50">
                  <Icon name="trending" className="w-5 h-5 text-amber-200" />
                  <div className="min-w-0">
                    <h2 className="f-display text-xl font-semibold">Sales by concert</h2>
                    <p className="text-xs text-amber-200/70 mt-0.5">{report.by_concert.length} concerts</p>
                  </div>
                </div>

                {report.by_concert.length === 0 ? (
                  <EmptyState compact icon="trending" title="No sales data">
                    <p className="text-sm text-amber-800/80">There are no sales records for this period yet.</p>
                  </EmptyState>
                ) : (
                  <ul className="divide-y divide-dashed divide-amber-200">
                    {report.by_concert.map((concert) => {
                      const percentage = maxRevenue > 0 ? (concert.revenue / maxRevenue) * 100 : 0;
                      return (
                        <li key={concert.id} className="px-6 py-4 hover:bg-amber-50/60 transition-colors">
                          <div className="flex items-center justify-between gap-4 mb-2.5">
                            <div className="flex-1 min-w-0">
                              <p className="f-display font-semibold text-amber-950 truncate">{concert.name}</p>
                              <p className="text-xs text-amber-700/80 mt-0.5 flex items-center gap-1.5">
                                <Icon name="ticket" className="w-3.5 h-3.5 text-amber-500" />
                                <span className="tabular-nums">{concert.tickets_sold}</span> tickets sold
                              </p>
                            </div>
                            <span className="f-display font-semibold text-amber-700 shrink-0 tabular-nums">
                              {formatRupiah(concert.revenue)}
                            </span>
                          </div>
                          <RevenueBar percentage={percentage} label={`${concert.name} revenue share`} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Status transaksi */}
              <section className={`${panel} overflow-hidden`}>
                <div className="px-6 pt-5 pb-4 border-b border-dashed border-amber-200">
                  <h2 className="f-display text-base font-semibold text-amber-950">Transaction status</h2>
                  <p className="text-xs text-amber-700/80 mt-0.5">Payment status distribution</p>
                </div>

                {report.by_status.length === 0 ? (
                  <EmptyState compact icon="chart" title="No transactions">
                    <p className="text-sm text-amber-800/80">No transactions recorded for this period.</p>
                  </EmptyState>
                ) : (
                  <ul className="divide-y divide-dashed divide-amber-200">
                    {report.by_status.map((status) => {
                      const config = statusConfig[status.status] || {
                        label: status.status,
                        text: 'text-amber-700',
                        dot: 'bg-amber-500',
                        bar: 'bg-amber-500',
                      };
                      const totalTransactions = report.summary.total_orders || 1;
                      const percentage = (status.total / totalTransactions) * 100;
                      return (
                        <li key={status.status} className="px-6 py-4">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 text-xs font-medium ${config.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                              {config.label}
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="f-display font-semibold text-amber-950 tabular-nums">{status.total}</span>
                              <span className="text-xs text-amber-700/80 tabular-nums">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <RevenueBar percentage={percentage} barClass={config.bar} label={`${config.label} share`} />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          )}

          {/* ===== TOAST ===== */}
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
                  className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-950 text-amber-50 text-sm shadow-lg shadow-amber-950/30"
                >
                  <Icon
                    name={toast.type === 'error' ? 'alert' : 'check'}
                    className={`w-4 h-4 ${toast.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
                  />
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