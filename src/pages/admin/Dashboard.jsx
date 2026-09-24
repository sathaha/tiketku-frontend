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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500/60';

function SkeletonLoader() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-4" aria-hidden="true">
      <div className="lg:col-span-2 space-y-4">
        <div className="card grid grid-cols-1 sm:grid-cols-3">
          <div className="p-6 sm:col-span-2 space-y-4">
            <div className="h-3 w-24 bg-ink-700 rounded" />
            <div className="h-10 w-64 bg-ink-700 rounded" />
            <div className="h-1.5 w-full bg-ink-700 rounded-full mt-6" />
          </div>
          <div className="p-6 space-y-4 border-t border-dashed border-ink-700 sm:border-t-0 sm:border-l">
            <div className="h-3 w-24 bg-ink-700 rounded" />
            <div className="h-6 w-32 bg-ink-700 rounded" />
          </div>
        </div>

        <div className="card grid grid-cols-2 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-ink-700 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-10 bg-ink-700 rounded" />
                <div className="h-3 w-16 bg-ink-700 rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5">
          <div className="h-4 w-40 bg-ink-700 rounded mb-5" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-t border-ink-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-ink-700" />
                <div className="space-y-2">
                  <div className="h-3 w-40 bg-ink-700 rounded" />
                  <div className="h-3 w-28 bg-ink-700 rounded" />
                </div>
              </div>
              <div className="h-3 w-20 bg-ink-700 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5 space-y-4">
          <div className="h-4 w-32 bg-ink-700 rounded" />
          <div className="h-10 w-full bg-ink-700 rounded-lg" />
          <div className="h-10 w-full bg-ink-700 rounded-lg" />
        </div>
        <div className="card p-5 space-y-4">
          <div className="h-4 w-28 bg-ink-700 rounded" />
          <div className="h-3 w-full bg-ink-700 rounded" />
          <div className="h-3 w-3/4 bg-ink-700 rounded" />
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
    <div className={`p-4 flex items-center gap-3 border-ink-700 ${statBorders[index]} ${link ? 'hover:bg-ink-800/50 transition-colors' : ''}`}>
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold text-white font-mono tabular-nums leading-none">{value}</p>
        <p className="text-xs text-ink-400 mt-1.5 truncate">{label}</p>
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
      className={`flex items-center gap-3 p-3 -mx-1 rounded-lg hover:bg-ink-800/60 transition-colors group ${focusRing}`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-ink-400 truncate">{sub}</p>
      </div>
      {badge ? (
        <span className="min-w-5 h-5 px-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-mono rounded-full flex items-center justify-center">
          {badge}
        </span>
      ) : null}
      <Icon name="chevron" className="w-4 h-4 text-ink-500 group-hover:text-flame-400 transition-colors" />
    </Link>
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
            <h1 className="text-2xl font-bold text-white">Admin dashboard</h1>
            {summary && <p className="text-sm text-ink-400 mt-1">{summary}</p>}
          </div>

          <div className="flex items-center gap-2">
            {lastUpdated && !loading && (
              <span className="text-xs text-ink-400 mr-1">Updated {timeLabel}</span>
            )}
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing || loading}
              aria-label="Refresh data"
              title="Refresh data"
              className={`p-2 hover:bg-ink-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${focusRing}`}
            >
              <Icon name="refresh" className={`w-5 h-5 text-ink-300 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/admin/concerts"
              className={`flex items-center gap-2 px-3.5 py-2 bg-flame-500 hover:bg-flame-600 active:scale-[0.98] text-white rounded-lg text-sm font-medium transition-all ${focusRing}`}
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
            <h2 className="text-xl font-bold text-white mb-2">Couldn't load the dashboard</h2>
            <p className="text-ink-300 mb-6">Check your connection, then try again.</p>
            <button
              onClick={() => fetchStats()}
              className={`px-4 py-2 bg-flame-500 hover:bg-flame-600 text-white rounded-lg text-sm font-medium transition-colors ${focusRing}`}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-4 min-w-0">
              {/* Revenue, shaped like a ticket with a payout stub */}
              <div className="ticket-cut card relative grid grid-cols-1 sm:grid-cols-3">
                <div className="p-6 sm:col-span-2">
                  <p className="text-sm text-ink-400">Total revenue</p>
                  <p className="mt-2 text-4xl font-bold text-white font-mono tabular-nums tracking-tight">
                    {formatRupiah(animatedRevenue)}
                  </p>

                  <div className="mt-6">
                    <div className="h-1.5 w-full bg-ink-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${payoutShare}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-orange-400 rounded-full"
                      />
                    </div>
                    <p className="flex items-center gap-2 mt-3 text-xs text-ink-400">
                      <Icon name="wallet" className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      {payoutShare}% of revenue is still owed to event organizers
                    </p>
                  </div>
                </div>

                <Link
                  to="/admin/payouts"
                  className={`group flex flex-col justify-between gap-6 p-6 border-t border-dashed border-ink-700 sm:border-t-0 sm:border-l hover:bg-orange-500/5 transition-colors ${focusRing}`}
                >
                  <div>
                    <p className="text-sm text-ink-400">Pending EO payout</p>
                    <p className="mt-2 text-2xl font-bold text-orange-400 font-mono tabular-nums">
                      {formatRupiah(pendingPayout)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-flame-400">
                    {pendingPayout > 0 ? 'Process payout' : 'View payouts'}
                    <Icon name="arrow" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>

              {/* Numbers at a glance */}
              <div className="card grid grid-cols-2 sm:grid-cols-4 overflow-hidden">
                <StatCell index={0} icon="music" tint="bg-flame-500/10 text-flame-400" label="Concerts" value={stats.total_concerts || 0} />
                <StatCell index={1} icon="users" tint="bg-blue-500/10 text-blue-400" label="Customers" value={stats.total_users || 0} />
                <StatCell index={2} icon="ticket" tint="bg-emerald-500/10 text-emerald-400" label="Tickets sold" value={stats.tickets_sold || 0} />
                <StatCell
                  index={3}
                  icon="clipboard"
                  tint="bg-yellow-500/10 text-yellow-400"
                  label="Pending approval"
                  value={pendingApproval}
                  link="/admin/approvals"
                />
              </div>

              {/* Recent transactions */}
              <section className="card overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-ink-700">
                  <div>
                    <h2 className="font-semibold text-white">Recent transactions</h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Latest {stats.recentOrders?.length || 0} orders
                    </p>
                  </div>
                  <Link
                    to="/admin/orders"
                    className={`text-sm text-flame-400 hover:text-flame-300 font-medium inline-flex items-center gap-1 group rounded ${focusRing}`}
                  >
                    View all
                    <Icon name="arrow" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {!stats.recentOrders || stats.recentOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-ink-800 flex items-center justify-center mb-4">
                      <Icon name="orders" className="w-6 h-6 text-ink-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">No transactions yet</h3>
                    <p className="text-sm text-ink-400">Orders show up here as soon as the first ticket is sold.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-ink-700">
                    {stats.recentOrders.map((order) => (
                      <li
                        key={order.id}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-ink-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-ink-200">
                              {order.customer_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">{order.concert_name}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                              <p className="text-xs text-ink-300">{order.customer_name}</p>
                              <button
                                onClick={() => copyOrderCode(order.order_code)}
                                className={`text-xs text-ink-400 font-mono flex items-center gap-1 hover:text-ink-200 transition-colors rounded ${focusRing}`}
                                title="Copy order code"
                              >
                                {copiedCode === order.order_code ? 'Copied' : order.order_code}
                                <Icon name="copy" className="w-3 h-3" />
                              </button>
                              <p className="text-xs text-ink-400 flex items-center gap-1">
                                <Icon name="calendar" className="w-3 h-3" />
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          <p className="font-semibold text-flame-400 font-mono tabular-nums">
                            {formatRupiah(order.total_price)}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Side rail */}
            <aside className="space-y-4 min-w-0">
              <section className="card p-5">
                <h2 className="font-semibold text-white mb-3">Needs attention</h2>
                <div className="space-y-1">
                  <AttentionRow
                    to="/admin/approvals"
                    icon="clipboard"
                    tint="bg-yellow-500/10 text-yellow-400"
                    title="Approve concerts"
                    sub={pendingApproval > 0 ? 'Review events submitted by EO' : 'Nothing to review'}
                    badge={pendingApproval > 0 ? pendingApproval : null}
                  />
                  <AttentionRow
                    to="/admin/payouts"
                    icon="wallet"
                    tint="bg-orange-500/10 text-orange-400"
                    title="Pay out EO"
                    sub={pendingPayout > 0 ? `${formatRupiah(pendingPayout)} waiting` : 'Nothing pending'}
                  />
                </div>
              </section>

              <section className="card p-5">
                <h2 className="font-semibold text-white mb-1">Platform status</h2>
                <div className="divide-y divide-ink-800">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <span className="text-sm text-white">Xendit payments</span>
                    </div>
                    <span className="text-xs text-emerald-400">Operational</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-ink-300">Dashboard data</span>
                    <span className="text-sm text-white font-mono tabular-nums">{timeLabel}</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}