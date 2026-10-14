import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { StatusBadge, formatRupiah, formatDate } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  plus: 'M12 4v16m8-8H4',
  arrow: 'M13 7l5 5-5 5M6 12h12',
  chevron: 'M9 5l7 7-7 7',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  orders: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  wallet: 'M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4h-4z',
  copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  check: 'M5 13l4 4L19 7',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';
// Untuk elemen di dalam container overflow-hidden, ring biasa akan terpotong.
const focusRingInset =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/70';

const panel = 'bg-white rounded-2xl shadow-sm shadow-amber-950/5';
const ticketShadow =
  'rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)]';

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

// Gradien avatar customer (dipilih berdasarkan huruf pertama nama)
const AVATAR_GRADIENTS = [
  'from-amber-400 to-amber-600',
  'from-emerald-400 to-emerald-600',
  'from-blue-400 to-blue-600',
  'from-rose-400 to-rose-600',
  'from-purple-400 to-purple-600',
  'from-cyan-400 to-cyan-600',
];

function avatarGradient(name = '') {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
}

// Garis pemisah putus-putus antar sel statistik (2 kolom di mobile, 4 di desktop)
const statDividers = [
  '',
  'border-l',
  'border-t sm:border-t-0 sm:border-l',
  'border-t border-l sm:border-t-0',
];

/* ============ HOOKS ============ */

/* Menghitung naik saat data pertama datang, dan bergerak dari nilai sebelumnya saat refresh. */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const latest = useRef(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      latest.current = target;
      setValue(target);
      return undefined;
    }

    const from = latest.current;
    const start = performance.now();
    let raf;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      latest.current = Math.round(from + (target - from) * eased);
      setValue(latest.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/* ============ SKELETON ============ */
function Bone({ className = '' }) {
  return <div className={`bg-amber-100 rounded ${className}`} />;
}

function SkeletonLoader() {
  return (
    <div
      className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="lg:col-span-2 space-y-6 min-w-0">
        {/* Revenue ticket */}
        <div className={ticketShadow}>
          <div className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)]">
            <div className="p-6 space-y-4">
              <Bone className="h-3 w-24" />
              <Bone className="h-12 w-72 max-w-full" />
              <Bone className="h-1.5 w-full rounded-full mt-6" />
            </div>
            <div className="border-t border-dashed border-amber-300/80 bg-amber-50 px-6 flex items-center justify-between">
              <div className="space-y-2">
                <Bone className="h-3 w-24" />
                <Bone className="h-5 w-32" />
              </div>
              <Bone className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`${panel} grid grid-cols-2 sm:grid-cols-4 overflow-hidden`}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`border-dashed border-amber-200 ${statDividers[i]}`}>
              <div className="p-4 flex items-center gap-3">
                <Bone className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Bone className="h-5 w-10" />
                  <Bone className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent transactions */}
        <div className={`${panel} overflow-hidden`}>
          <div className="px-6 py-4 bg-amber-950 space-y-2">
            <div className="h-5 w-44 bg-amber-900 rounded" />
            <div className="h-3 w-24 bg-amber-900 rounded" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 px-6 py-4 border-t first:border-t-0 border-dashed border-amber-200">
              <div className="flex items-center gap-4">
                <Bone className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Bone className="h-3 w-40" />
                  <Bone className="h-3 w-28" />
                </div>
              </div>
              <div className="space-y-2 flex flex-col items-end">
                <Bone className="h-3 w-20" />
                <Bone className="h-4 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side rail */}
      <div className="space-y-6 min-w-0">
        <div className={`${panel} p-5 space-y-4`}>
          <Bone className="h-4 w-32" />
          <Bone className="h-12 w-full rounded-lg" />
          <Bone className="h-12 w-full rounded-lg" />
        </div>
        <div className={`${panel} p-5 space-y-4`}>
          <Bone className="h-4 w-28" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

/* ============ BUILDING BLOCKS ============ */
function StatCell({ icon, tint, label, value, link, index }) {
  const body = (
    <>
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="f-display text-2xl font-semibold text-amber-950 tabular-nums leading-none">{value}</p>
        <p className="text-xs text-amber-700/80 mt-1.5 truncate">{label}</p>
      </div>
      {link && (
        <Icon name="chevron" className="w-4 h-4 text-amber-500 group-hover:text-amber-800 transition-colors shrink-0" />
      )}
    </>
  );

  return (
    <div className={`border-dashed border-amber-200 ${statDividers[index]}`}>
      {link ? (
        <Link
          to={link}
          className={`group h-full p-4 flex items-center gap-3 hover:bg-amber-50 transition-colors ${focusRingInset}`}
        >
          {body}
        </Link>
      ) : (
        <div className="h-full p-4 flex items-center gap-3">{body}</div>
      )}
    </div>
  );
}

function AttentionRow({ to, icon, tint, title, sub, badge }) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-5 py-3.5 hover:bg-amber-50 transition-colors ${focusRingInset}`}
    >
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-950">{title}</p>
        <p className="text-xs text-amber-700/80 truncate">{sub}</p>
      </div>
      {badge ? (
        <span className="min-w-5 h-5 px-1.5 bg-amber-950 text-amber-50 text-xs tabular-nums rounded-full flex items-center justify-center">
          {badge}
        </span>
      ) : null}
      <Icon name="chevron" className="w-4 h-4 text-amber-500 group-hover:text-amber-800 transition-colors shrink-0" />
    </Link>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="text-amber-700/80 flex items-center gap-1.5 shrink-0">
        <Icon name={icon} className="w-3.5 h-3.5 text-amber-500" />
        {label}
      </span>
      <span className="text-amber-950 font-medium truncate text-right">{children}</span>
    </div>
  );
}

function OperationalPill() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
      </span>
      Operational
    </span>
  );
}

/**
 * Baris transaksi terbaru:
 * avatar gradien, order code sebagai chip yang bisa di-copy,
 * total di atas dan status di bawah (rata kanan).
 */
function RecentOrderRow({ order, copiedCode, onCopy }) {
  const isCopied = copiedCode === order.order_code;

  return (
    <li className="px-6 py-4 hover:bg-amber-50/60 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient(order.customer_name)} flex items-center justify-center shrink-0 shadow-sm`}
          aria-hidden="true"
        >
          <span className="f-display text-base font-semibold text-white">
            {order.customer_name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="f-display font-semibold text-amber-950 truncate">{order.concert_name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1">
            <span className="text-sm text-amber-700/80 truncate max-w-[10rem] sm:max-w-none">
              {order.customer_name}
            </span>

            <button
              type="button"
              onClick={() => onCopy(order.order_code)}
              title="Copy order code"
              aria-label={`Copy order code ${order.order_code}`}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] text-amber-800 tabular-nums transition-colors ${focusRing}`}
            >
              {order.order_code}
              <Icon name={isCopied ? 'check' : 'copy'} className="w-3 h-3 opacity-70" />
            </button>

            <span className="text-xs text-amber-700/70 flex items-center gap-1">
              <Icon name="calendar" className="w-3 h-3" />
              {formatDate(order.created_at)}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <p className="f-display font-semibold text-amber-950 tabular-nums">{formatRupiah(order.total_price)}</p>
          <StatusBadge status={order.status} />
        </div>
      </div>
    </li>
  );
}

/* ============ MAIN ============ */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [toast, setToast] = useState(null);
  const copyTimer = useRef(null);

  const notify = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() });
  }, []);

  const fetchStats = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await api.get('/reports/dashboard');
        setStats(res.data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        // Kalau data lama masih ada, cukup beri tahu lewat toast
        if (isManual) notify('error', "Couldn't refresh. Showing the last data we loaded.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  async function copyOrderCode(code) {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      notify('error', "Couldn't copy the order code.");
      return;
    }
    setCopiedCode(code);
    notify('success', `Order code ${code} copied`);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedCode(null), 1200);
  }

  const totalRevenue = stats?.total_revenue || 0;
  const pendingPayout = stats?.pending_payout || 0;
  const pendingApproval = stats?.pending_approval || 0;
  const recentOrders = stats?.recentOrders ?? [];
  const animatedRevenue = useCountUp(totalRevenue);

  const payoutShare = totalRevenue
    ? Math.min(100, Math.round((pendingPayout / totalRevenue) * 100))
    : 0;

  const summary = !stats
    ? ''
    : pendingApproval > 0
      ? `${pendingApproval} concert${pendingApproval > 1 ? 's' : ''} waiting for your approval`
      : 'No concerts waiting for approval';

  const timeLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '-';

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4] px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* ===== HEADER ===== */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="f-display text-3xl font-bold text-amber-950">Admin dashboard</h1>
              <p className="text-sm text-amber-700/80 mt-1">{loading ? 'Loading dashboard…' : summary}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {lastUpdated && !loading && (
                <span className="text-xs text-amber-700/80 mr-1 hidden sm:inline tabular-nums">
                  Updated {timeLabel}
                </span>
              )}
              <button
                type="button"
                onClick={() => fetchStats(true)}
                disabled={refreshing || loading}
                aria-label="Refresh data"
                title="Refresh data"
                className={`p-2.5 bg-white hover:bg-amber-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
              >
                <Icon
                  name="refresh"
                  className={`w-4 h-4 text-amber-800 ${refreshing ? 'animate-spin motion-reduce:animate-none' : ''}`}
                />
              </button>
              <Link
                to="/admin/concerts"
                className={`inline-flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
              >
                <Icon name="plus" className="w-4 h-4" />
                Add concert
              </Link>
            </div>
          </header>

          {/* ===== CONTENT ===== */}
          {loading ? (
            <SkeletonLoader />
          ) : !stats ? (
            <div className="max-w-md mx-auto rounded-2xl border-2 border-dashed border-amber-300/70 p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                <Icon name="alert" className="w-6 h-6" />
              </div>
              <h2 className="f-display text-lg font-semibold text-amber-950 mb-1">Couldn't load the dashboard</h2>
              <p className="text-sm text-amber-800/80 mb-5">Check your connection, then try again.</p>
              <button
                type="button"
                onClick={() => fetchStats()}
                className={`px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-6 min-w-0">
                {/* Revenue: tiket dengan stub payout */}
                <div className={ticketShadow}>
                  <div className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)]">
                    <div className="p-6 min-w-0">
                      <p className="text-sm text-amber-700/80">Total revenue</p>
                      <p className="mt-2 f-display text-4xl sm:text-5xl font-semibold text-amber-950 tabular-nums tracking-tight break-words">
                        {formatRupiah(animatedRevenue)}
                      </p>

                      <div className="mt-6">
                        <div className="flex items-center justify-between gap-3 mb-2 text-xs text-amber-700/80">
                          <span className="flex items-center gap-1.5">
                            <Icon name="wallet" className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            Still owed to event organizers
                          </span>
                          <span className="font-medium text-amber-950 tabular-nums">{payoutShare}%</span>
                        </div>
                        <div
                          role="progressbar"
                          aria-label="Share of revenue still owed to event organizers"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={payoutShare}
                          className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden"
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${payoutShare}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-orange-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-amber-300/80 bg-amber-50 px-6 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-amber-700/80">Pending EO payout</p>
                        <p className="f-display text-base font-semibold text-orange-600 tabular-nums truncate">
                          {formatRupiah(pendingPayout)}
                        </p>
                      </div>
                      <Link
                        to="/admin/payouts"
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-50 bg-amber-800 hover:bg-amber-700 rounded-lg transition-colors shrink-0 ${focusRing}`}
                      >
                        <Icon name="wallet" className="w-3.5 h-3.5" />
                        {pendingPayout > 0 ? 'Process payout' : 'View payouts'}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Angka ringkas */}
                <div className={`${panel} grid grid-cols-2 sm:grid-cols-4 overflow-hidden`}>
                  <StatCell index={0} icon="music" tint="bg-amber-100 text-amber-700" label="Concerts" value={stats.total_concerts || 0} />
                  <StatCell index={1} icon="users" tint="bg-blue-100 text-blue-700" label="Customers" value={stats.total_users || 0} />
                  <StatCell index={2} icon="ticket" tint="bg-emerald-100 text-emerald-700" label="Tickets sold" value={stats.tickets_sold || 0} />
                  <StatCell
                    index={3}
                    icon="clipboard"
                    tint="bg-amber-100 text-amber-700"
                    label="Pending approval"
                    value={pendingApproval}
                    link="/admin/approvals"
                  />
                </div>

                {/* Transaksi terbaru */}
                <section className={`${panel} overflow-hidden`}>
                  <div className="flex items-center justify-between gap-3 px-6 py-4 bg-amber-950 text-amber-50">
                    <div className="min-w-0">
                      <h2 className="f-display text-xl font-semibold">Recent transactions</h2>
                      <p className="text-xs text-amber-200/70 mt-0.5">Latest {recentOrders.length} orders</p>
                    </div>
                    <Link
                      to="/admin/orders"
                      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 -mr-1.5 rounded-lg text-sm font-medium text-amber-200 hover:text-white hover:bg-amber-900 transition-colors shrink-0 ${focusRing}`}
                    >
                      View all
                      <Icon name="arrow" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" />
                    </Link>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="m-5 rounded-2xl border-2 border-dashed border-amber-300/70 p-10 text-center">
                      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                        <Icon name="orders" className="w-6 h-6" />
                      </div>
                      <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No transactions yet</h3>
                      <p className="text-sm text-amber-800/80">Orders show up here as soon as the first ticket is sold.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-dashed divide-amber-200">
                      {recentOrders.map((order) => (
                        <RecentOrderRow
                          key={order.id}
                          order={order}
                          copiedCode={copiedCode}
                          onCopy={copyOrderCode}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              {/* Side rail */}
              <aside className="space-y-6 min-w-0 lg:sticky lg:top-6">
                <section className={`${panel} overflow-hidden`}>
                  <h2 className="f-display text-base font-semibold text-amber-950 px-5 pt-5 pb-2">Needs attention</h2>
                  <div className="divide-y divide-dashed divide-amber-200 border-t border-dashed border-amber-200">
                    <AttentionRow
                      to="/admin/approvals"
                      icon="clipboard"
                      tint="bg-amber-100 text-amber-700"
                      title="Approve concerts"
                      sub={pendingApproval > 0 ? 'Review events submitted by EO' : 'Nothing to review'}
                      badge={pendingApproval > 0 ? pendingApproval : null}
                    />
                    <AttentionRow
                      to="/admin/payouts"
                      icon="wallet"
                      tint="bg-orange-100 text-orange-700"
                      title="Pay out EO"
                      sub={pendingPayout > 0 ? `${formatRupiah(pendingPayout)} waiting` : 'Nothing pending'}
                    />
                  </div>
                </section>

                <section className={`${panel} p-5`}>
                  <h2 className="f-display text-base font-semibold text-amber-950 mb-1">Platform status</h2>
                  <div className="divide-y divide-dashed divide-amber-200 border-t border-dashed border-amber-200 mt-2">
                    <InfoRow icon="wallet" label="Xendit payments">
                      <OperationalPill />
                    </InfoRow>
                    <InfoRow icon="clock" label="Dashboard data">
                      <span className="tabular-nums">{timeLabel}</span>
                    </InfoRow>
                  </div>
                </section>
              </aside>
            </div>
          )}

          {/* ===== TOAST ===== */}
          <div className="fixed bottom-6 inset-x-0 z-[90] flex justify-center px-4 pointer-events-none">
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