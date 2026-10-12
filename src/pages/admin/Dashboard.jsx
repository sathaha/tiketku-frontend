import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { StatusBadge, formatRupiah, formatDate } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    plus: 'M12 5v14M5 12h14',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    chevron: 'M9 5l7 7-7 7',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    orders: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    wallet: 'M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4h-4z',
    copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
    music: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

/* Counts up once when data arrives, and eases from the previous value on refresh. */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const latest = useRef(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      latest.current = target;
      setValue(target);
      return;
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

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60';

// Gradien avatar untuk customer (bergantian berdasarkan nama)
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

function SkeletonLoader() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-4" aria-hidden="true">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-amber-200/60 rounded-2xl grid grid-cols-1 sm:grid-cols-3">
          <div className="p-6 sm:col-span-2 space-y-4">
            <div className="h-3 w-24 bg-amber-100 rounded" />
            <div className="h-10 w-64 bg-amber-100 rounded" />
            <div className="h-1.5 w-full bg-amber-100 rounded-full mt-6" />
          </div>
          <div className="p-6 space-y-4 border-t border-dashed border-amber-200/60 sm:border-t-0 sm:border-l">
            <div className="h-3 w-24 bg-amber-100 rounded" />
            <div className="h-6 w-32 bg-amber-100 rounded" />
          </div>
        </div>

        <div className="bg-white border border-amber-200/60 rounded-2xl grid grid-cols-2 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-10 bg-amber-100 rounded" />
                <div className="h-3 w-16 bg-amber-100 rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-amber-200/60 rounded-2xl p-5">
          <div className="h-4 w-40 bg-amber-100 rounded mb-5" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-t border-amber-200/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100" />
                <div className="space-y-2">
                  <div className="h-3 w-40 bg-amber-100 rounded" />
                  <div className="h-3 w-28 bg-amber-100 rounded" />
                </div>
              </div>
              <div className="h-3 w-20 bg-amber-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-amber-200/60 rounded-2xl p-5 space-y-4">
          <div className="h-4 w-32 bg-amber-100 rounded" />
          <div className="h-10 w-full bg-amber-100 rounded-lg" />
          <div className="h-10 w-full bg-amber-100 rounded-lg" />
        </div>
        <div className="bg-white border border-amber-200/60 rounded-2xl p-5 space-y-4">
          <div className="h-4 w-28 bg-amber-100 rounded" />
          <div className="h-3 w-full bg-amber-100 rounded" />
          <div className="h-3 w-3/4 bg-amber-100 rounded" />
        </div>
      </div>
    </div>
  );
}

const statBorders = [
  '',
  'border-l',
  'border-t sm:border-t-0 sm:border-l',
  'border-l border-t sm:border-t-0',
];

function StatCell({ icon, tint, label, value, link, index }) {
  const content = (
    <div className={`p-4 flex items-center gap-3 border-amber-200/60 ${statBorders[index]} ${link ? 'hover:bg-amber-50 transition-colors' : ''}`}>
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="font-serif text-xl font-bold text-amber-950 font-mono tabular-nums leading-none">{value}</p>
        <p className="font-serif text-xs text-amber-700/70 mt-1.5 truncate">{label}</p>
      </div>
    </div>
  );
  return link ? (
    <Link to={link} className={`block ${focusRing}`}>
      {content}
    </Link>
  ) : (
    content
  );
}

function AttentionRow({ to, icon, tint, title, sub, badge }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 -mx-1 rounded-lg hover:bg-amber-50 transition-colors group ${focusRing}`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-serif text-sm font-medium text-amber-950">{title}</p>
        <p className="font-serif text-xs text-amber-700/60 truncate">{sub}</p>
      </div>
      {badge ? (
        <span className="min-w-5 h-5 px-1.5 bg-amber-100 text-amber-800 border border-amber-200/60 text-xs font-mono rounded-full flex items-center justify-center">
          {badge}
        </span>
      ) : null}
      <Icon name="chevron" className="w-4 h-4 text-amber-500 group-hover:text-amber-800 transition-colors" />
    </Link>
  );
}

/**
 * Recent transactions row — dibuat lebih hidup dengan:
 * - avatar gradien per customer
 * - order code jadi chip kecil
 * - status badge di kanan, total di atas
 */
function RecentOrderRow({ order, copiedCode, onCopy }) {
  const gradient = avatarGradient(order.customer_name || '');

  return (
    <li className="group relative px-5 py-4 hover:bg-amber-50/60 transition-colors">
      <div className="flex items-center gap-4">
        {/* Avatar gradien */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm`}>
          <span className="font-serif text-sm font-bold text-white">
            {order.customer_name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-serif font-semibold text-amber-950 text-sm truncate">
            {order.concert_name}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="font-serif text-xs text-amber-700/70 truncate">
              {order.customer_name}
            </span>

            {/* Order code chip */}
            <button
              onClick={() => onCopy(order.order_code)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-md font-mono text-[10px] text-amber-800 transition-colors ${focusRing}`}
              title="Copy order code"
            >
              {copiedCode === order.order_code ? 'Copied!' : order.order_code}
              <Icon name="copy" className="w-3 h-3 opacity-70" />
            </button>

            {/* Date */}
            <span className="font-serif text-[11px] text-amber-600/60 flex items-center gap-1">
              <Icon name="calendar" className="w-3 h-3" />
              {formatDate(order.created_at)}
            </span>
          </div>
        </div>

        {/* Total + status */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
          <p className="font-serif font-bold text-amber-800 font-mono tabular-nums text-sm">
            {formatRupiah(order.total_price)}
          </p>
          <StatusBadge status={order.status} />
        </div>
      </div>
    </li>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats(isManual = false) {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get('/reports/dashboard');
      setStats(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function copyOrderCode(code) {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 1200);
  }

  const totalRevenue = stats?.total_revenue || 0;
  const pendingPayout = stats?.pending_payout || 0;
  const pendingApproval = stats?.pending_approval || 0;
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
    : '';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f5ede4]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <style>{`
            @media (min-width: 640px) {
              .ticket-cut {
                -webkit-mask:
                  radial-gradient(circle 9px at 66.6667% 0, #0000 97%, #000) top / 100% 51% no-repeat,
                  radial-gradient(circle 9px at 66.6667% 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
                mask:
                  radial-gradient(circle 9px at 66.6667% 0, #0000 97%, #000) top / 100% 51% no-repeat,
                  radial-gradient(circle 9px at 66.6667% 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
              }
            }
          `}</style>

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-amber-950">Admin dashboard</h1>
              {summary && <p className="font-serif text-sm text-amber-700/70 mt-1">{summary}</p>}
            </div>

            <div className="flex items-center gap-2">
              {lastUpdated && !loading && (
                <span className="font-serif text-xs text-amber-700/60 mr-1">Updated {timeLabel}</span>
              )}
              <button
                onClick={() => fetchStats(true)}
                disabled={refreshing || loading}
                aria-label="Refresh data"
                title="Refresh data"
                className={`p-2 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${focusRing}`}
              >
                <Icon name="refresh" className={`w-5 h-5 text-amber-700 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                to="/admin/concerts"
                className={`flex items-center gap-2 px-3.5 py-2 bg-amber-800 hover:bg-amber-700 active:scale-[0.98] text-amber-50 rounded-lg font-serif text-sm font-medium transition-all ${focusRing}`}
              >
                <Icon name="plus" className="w-4 h-4" />
                Create concert
              </Link>
            </div>
          </header>

          {loading ? (
            <SkeletonLoader />
          ) : !stats ? (
            <div className="max-w-md mx-auto py-16 text-center">
              <h2 className="font-serif text-xl font-bold text-amber-950 mb-2">Couldn't load the dashboard</h2>
              <p className="font-serif text-amber-700/70 mb-6">Check your connection, then try again.</p>
              <button
                onClick={() => fetchStats()}
                className={`px-4 py-2 bg-amber-800 hover:bg-amber-700 text-amber-50 rounded-lg font-serif text-sm font-medium transition-colors ${focusRing}`}
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-4 min-w-0">
                {/* Revenue, shaped like a ticket with a payout stub */}
                <div className="ticket-cut bg-white border border-amber-200/60 rounded-2xl relative grid grid-cols-1 sm:grid-cols-3">
                  <div className="p-6 sm:col-span-2">
                    <p className="font-serif text-sm text-amber-700/70">Total revenue</p>
                    <p className="mt-2 font-serif text-4xl font-bold text-amber-950 font-mono tabular-nums tracking-tight">
                      {formatRupiah(animatedRevenue)}
                    </p>

                    <div className="mt-6">
                      <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${payoutShare}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-orange-400 rounded-full"
                        />
                      </div>
                      <p className="flex items-center gap-2 mt-3 font-serif text-xs text-amber-700/70">
                        <Icon name="wallet" className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        {payoutShare}% of revenue is still owed to event organizers
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/admin/payouts"
                    className={`group flex flex-col justify-between gap-6 p-6 border-t border-dashed border-amber-200/60 sm:border-t-0 sm:border-l hover:bg-orange-50 transition-colors ${focusRing}`}
                  >
                    <div>
                      <p className="font-serif text-sm text-amber-700/70">Pending EO payout</p>
                      <p className="mt-2 font-serif text-2xl font-bold text-orange-600 font-mono tabular-nums">
                        {formatRupiah(pendingPayout)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 font-serif text-xs font-medium text-amber-800">
                      {pendingPayout > 0 ? 'Process payout' : 'View payouts'}
                      <Icon name="arrow" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>

                {/* Numbers at a glance */}
                <div className="bg-white border border-amber-200/60 rounded-2xl grid grid-cols-2 sm:grid-cols-4 overflow-hidden">
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

                {/* Recent transactions */}
                <section className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-amber-200/60">
                    <div>
                      <h2 className="font-serif font-semibold text-amber-950">Recent transactions</h2>
                      <p className="font-serif text-xs text-amber-700/60 mt-0.5">
                        Latest {stats.recentOrders?.length || 0} orders
                      </p>
                    </div>
                    <Link
                      to="/admin/orders"
                      className={`font-serif text-sm text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1 group rounded ${focusRing}`}
                    >
                      View all
                      <Icon name="arrow" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {!stats.recentOrders || stats.recentOrders.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                        <Icon name="orders" className="w-6 h-6 text-amber-600" />
                      </div>
                      <h3 className="font-serif font-semibold text-amber-950 mb-1">No transactions yet</h3>
                      <p className="font-serif text-sm text-amber-700/60">Orders show up here as soon as the first ticket is sold.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-amber-200/60">
                      {stats.recentOrders.map((order) => (
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
              <aside className="space-y-4 min-w-0">
                <section className="bg-white border border-amber-200/60 rounded-2xl p-5">
                  <h2 className="font-serif font-semibold text-amber-950 mb-3">Needs attention</h2>
                  <div className="space-y-1">
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

                <section className="bg-white border border-amber-200/60 rounded-2xl p-5">
                  <h2 className="font-serif font-semibold text-amber-950 mb-1">Platform status</h2>
                  <div className="divide-y divide-amber-200/60">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <span className="font-serif text-sm text-amber-950">Xendit payments</span>
                      </div>
                      <span className="font-serif text-xs text-emerald-700">Operational</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="font-serif text-sm text-amber-800/70">Dashboard data</span>
                      <span className="font-serif text-sm text-amber-950 font-mono tabular-nums">{timeLabel}</span>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}