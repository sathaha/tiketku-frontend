import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    check: 'M5 13l4 4L19 7',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    plus: 'M12 4v16m8-8H4',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
    clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    chart: 'M3 3v18h18M18 17V9M13 17V5M8 17v-3',
    trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    fire: 'M12 23c-4.97 0-8-3.582-8-8 0-2.5 1.5-5 3-6.5C8 7 9 5 9.5 3c.5-2 1-2.5 2-2.5.5 0 1 .5 1 1.5V3c0 1.5 1 3 2 4.5 1.5 2 2.5 3.5 2.5 6 0 4.418-2.03 9.5-5 9.5z',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  };
  const path = paths[name];
  if (!path) return null;
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60';

const statusBadge = {
  disetujui: { label: 'Approved', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200/60', bg: 'bg-emerald-50' },
  menunggu_persetujuan: { label: 'Pending', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200/60', bg: 'bg-yellow-50' },
  ditolak: { label: 'Rejected', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200/60', bg: 'bg-red-50' },
  aktif: { label: 'Active', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200/60', bg: 'bg-emerald-50' },
  draft: { label: 'Draft', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200/60', bg: 'bg-amber-50' },
  selesai: { label: 'Completed', text: 'text-amber-700/70', dot: 'bg-amber-500/60', border: 'border-amber-200/60', bg: 'bg-amber-50' },
};

function StatusBadge({ status }) {
  const meta = statusBadge[status] || statusBadge.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${meta.bg} border ${meta.border} font-serif text-[10px] font-medium ${meta.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/* Ticket notch mask, works on any background */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const ticketCss = `
  .ticket-notch { -webkit-mask: ${notch}; mask: ${notch}; }
  @media (min-width: 640px) {
    .ticket-notch-sm { -webkit-mask: ${notch}; mask: ${notch}; }
  }
`;

const BARCODE_PATTERN = `repeating-linear-gradient(90deg,
  currentColor 0px, currentColor 2px, transparent 2px, transparent 4px,
  currentColor 4px, currentColor 5px, transparent 5px, transparent 8px,
  currentColor 8px, currentColor 11px, transparent 11px, transparent 13px,
  currentColor 13px, currentColor 14px, transparent 14px, transparent 18px,
  currentColor 18px, currentColor 21px, transparent 21px, transparent 23px,
  currentColor 23px, currentColor 24px, transparent 24px, transparent 27px)`;

function NumberTicker({ value, format = 'id-ID', prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const from = prevValueRef.current;
    const to = value;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = to;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString(format)}{suffix}
    </span>
  );
}

function StatMini({ icon, label, value, to, color = 'text-amber-700', delay = 0 }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.2 }}
      className={`flex items-center justify-between gap-3 py-3 px-3 rounded-lg ${to ? 'hover:bg-amber-50 cursor-pointer' : ''} transition-colors group ${focusRing}`}
    >
      <span className="font-serif text-sm text-amber-800/80 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-md bg-amber-100 border border-amber-200/60 flex items-center justify-center">
          <Icon name={icon} className={`w-4 h-4 ${color}`} />
        </span>
        {label}
      </span>
      <span className="font-serif text-sm font-semibold text-amber-950 font-mono tabular-nums">
        {value}
      </span>
    </motion.div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function SkeletonDashboard() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      <div className="bg-white border border-amber-200/60 rounded-2xl p-8 space-y-4">
        <div className="h-4 w-40 bg-amber-100 rounded" />
        <div className="h-14 w-64 bg-amber-100 rounded" />
        <div className="h-4 w-48 bg-amber-100 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-amber-200/60 rounded-2xl p-5 space-y-3">
            <div className="h-4 w-32 bg-amber-100 rounded" />
            <div className="h-3 w-full bg-amber-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EoDashboard() {
  const [summary, setSummary] = useState({
    total_pendapatan: 0,
    belum_cair: 0,
    sudah_cair: 0,
    total_tiket_terjual: 0,
  });
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [showQuickStats, setShowQuickStats] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [payoutRes, concertRes] = await Promise.all([
        api.get('/payouts/my-summary'),
        api.get('/concerts'),
      ]);
      setSummary(
        payoutRes.data || {
          total_pendapatan: 0,
          belum_cair: 0,
          sudah_cair: 0,
          total_tiket_terjual: 0,
        }
      );
      setConcerts(concertRes.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to connect to the server. Check your internet connection.';
      setError(message);
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const hour = new Date().getHours();
    if (hour < 4) setGreeting('Still awake?');
    else if (hour < 11) setGreeting('Good morning');
    else if (hour < 15) setGreeting('Good afternoon');
    else if (hour < 19) setGreeting('Good evening');
    else setGreeting('Good night');

    const timer = setTimeout(() => setShowQuickStats(true), 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const concertStats = concerts.reduce(
    (acc, c) => {
      if (c.approval_status === 'menunggu_persetujuan') acc.pending++;
      if (c.approval_status === 'ditolak') acc.rejected++;
      if (c.status === 'aktif' && c.approval_status === 'disetujui') acc.active++;
      return acc;
    },
    { pending: 0, rejected: 0, active: 0 }
  );

  const sortedConcerts = [...concerts]
    .sort((a, b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id))
    .slice(0, 5);

  const hasNotices = concertStats.pending > 0 || concertStats.rejected > 0;

  const upcomingConcerts = concerts
    .filter((c) => c.approval_status === 'disetujui' && c.status === 'aktif' && c.nearest_date)
    .sort((a, b) => new Date(a.nearest_date) - new Date(b.nearest_date))
    .slice(0, 1);

  const totalConcerts = concerts.length;
  const activeConcerts = concertStats.active;
  const utilizationRate = totalConcerts > 0 ? Math.round((activeConcerts / totalConcerts) * 100) : 0;
  const payoutRate = summary.total_pendapatan > 0 ? Math.round((summary.sudah_cair / summary.total_pendapatan) * 100) : 0;

  if (loading) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-[#f5ede4]">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <style>{ticketCss}</style>
            <SkeletonDashboard />
          </div>
        </div>
      </MotionConfig>
    );
  }

  if (error) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-[#f5ede4]">
          <div className="max-w-6xl mx-auto px-4 py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 border border-red-200/60 flex items-center justify-center mb-4">
              <Icon name="alert" className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="font-serif text-xl font-bold text-amber-950 mb-2">Oops, failed to fetch data</h2>
            <p className="font-serif text-sm text-amber-800 mb-1">{error}</p>
            <p className="font-serif text-xs text-amber-700/70 mb-6">Try refreshing the page or check your connection.</p>
            <button
              onClick={fetchData}
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
            >
              Reload
            </button>
          </div>
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f5ede4]">
        <div className="max-w-6xl mx-auto px-4 py-8 relative">
          <style>{ticketCss}</style>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
          >
            <div>
              <p className="font-serif text-xs uppercase tracking-[0.2em] text-amber-700/70 font-semibold mb-2">
                {greeting}, boss
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-950 leading-tight">
                {concertStats.active > 0 ? (
                  <>
                    You have <span className="text-amber-700">{concertStats.active} stage{concertStats.active > 1 ? 's' : ''}</span> running
                  </>
                ) : (
                  'Ready to build a stage?'
                )}
              </h1>
            </div>
            <Link
              to="/eo/concerts"
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors self-start sm:self-auto ${focusRing}`}
            >
              <Icon name="plus" className="w-4 h-4" />
              New concert
            </Link>
          </motion.header>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex gap-2 mb-6"
          >
            {[
              { to: '/eo/concerts', icon: 'edit', label: 'Manage concerts' },
              { to: '/eo/payouts', icon: 'wallet', label: 'Payouts' },
              { to: '/eo/reports', icon: 'chart', label: 'Reports' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className={`font-serif text-xs px-3 py-1.5 rounded-full bg-white border border-amber-200/60 text-amber-800/80 hover:text-amber-950 hover:bg-amber-50 transition-colors flex items-center gap-1.5 ${focusRing}`}
              >
                <Icon name={action.icon} className="w-3 h-3" />
                {action.label}
              </Link>
            ))}
          </motion.div>

          {/* Ticket hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mb-6"
          >
            <div className="ticket-notch-sm bg-white border border-amber-200/60 rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_var(--stub)]" style={{ '--stub': '18rem' }}>
              {/* Main stub: total revenue */}
              <div className="p-6 md:p-8 flex flex-col min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-serif text-xs uppercase tracking-[0.2em] text-amber-700/70 font-semibold">
                    Total revenue
                  </p>
                  <span className="hidden sm:flex items-center gap-1.5 font-serif text-[10px] uppercase tracking-[0.15em] text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                <p className="font-serif font-bold text-amber-950 mt-3 leading-none tabular-nums" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
                  <NumberTicker value={summary.total_pendapatan} prefix="Rp " format="id-ID" duration={1500} />
                </p>

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <p className="font-serif text-sm text-amber-800/80">
                    <NumberTicker value={summary.total_tiket_terjual} format="id-ID" /> tickets from{' '}
                    {concertStats.active} active concert{concertStats.active > 1 ? 's' : ''}
                  </p>
                  {summary.total_tiket_terjual > 0 && (
                    <span className="font-serif text-xs px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200/60 text-amber-800 flex items-center gap-1">
                      <Icon name="trending" className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-8 hidden md:block">
                  <div
                    className="h-6 w-full max-w-[220px] text-amber-200"
                    style={{ backgroundImage: BARCODE_PATTERN, backgroundRepeat: 'repeat-x' }}
                  />
                  <p className="font-serif text-[10px] uppercase tracking-[0.3em] text-amber-700/60 mt-1.5">
                    EO access · non-transferable
                  </p>
                </div>
              </div>

              {/* Side stub: breakdown */}
              <div className="order-first sm:order-last border-b sm:border-b-0 sm:border-l border-dashed border-amber-200/60 p-4 md:p-6 flex flex-col justify-center gap-1">
                <AnimatePresence>
                  {showQuickStats && (
                    <>
                      <StatMini
                        icon="wallet"
                        label="Not yet paid out"
                        to="/eo/payouts?status=pending"
                        color="text-yellow-700"
                        value={formatRupiah(summary.belum_cair)}
                        delay={0.1}
                      />
                      <StatMini
                        icon="check"
                        label="Paid out"
                        to="/eo/payouts?status=completed"
                        color="text-blue-700"
                        value={formatRupiah(summary.sudah_cair)}
                        delay={0.2}
                      />
                      <StatMini
                        icon="ticket"
                        label="Tickets sold"
                        color="text-amber-700"
                        value={summary.total_tiket_terjual.toLocaleString('id-ID')}
                        delay={0.3}
                      />
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {upcomingConcerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="md:col-span-2"
              >
                <Link
                  to={`/eo/concerts/${upcomingConcerts[0].id}`}
                  className={`bg-white border border-amber-200/60 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-300 transition-colors group h-full ${focusRing}`}
                >
                  <div className="relative w-14 h-14 rounded-lg bg-amber-100 overflow-hidden shrink-0">
                    {upcomingConcerts[0].poster ? (
                      <img src={upcomingConcerts[0].poster} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="music" className="w-5 h-5 text-amber-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[10px] uppercase tracking-[0.25em] text-amber-700 mb-0.5 flex items-center gap-1 font-semibold">
                      <Icon name="fire" className="w-3 h-3" />
                      Upcoming concert
                    </p>
                    <p className="font-serif font-medium text-amber-950 truncate group-hover:text-amber-700 transition-colors">
                      {upcomingConcerts[0].name}
                    </p>
                    <p className="font-serif text-xs text-amber-700/70 mt-0.5 flex items-center gap-1">
                      <Icon name="clock" className="w-3 h-3" />
                      {formatDate(upcomingConcerts[0].nearest_date)}
                    </p>
                  </div>
                  <Icon name="arrow" className="w-4 h-4 text-amber-500 group-hover:text-amber-700 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-amber-200/60 rounded-2xl p-5 flex flex-col justify-center"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold">
                  Quick stats
                </p>
                <Icon name="chart" className="w-3 h-3 text-amber-500" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xs text-amber-800/80">Utilization rate</span>
                  <span className="font-serif text-xs font-semibold text-amber-950 font-mono tabular-nums">{utilizationRate}%</span>
                </div>
                <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${utilizationRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-amber-600 rounded-full"
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="font-serif text-xs text-amber-800/80">Payout rate</span>
                  <span className="font-serif text-xs font-semibold text-amber-950 font-mono tabular-nums">{payoutRate}%</span>
                </div>
                <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${payoutRate}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Notice board */}
          <AnimatePresence>
            {hasNotices && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <div className="border border-dashed border-amber-300/60 bg-amber-50/50 rounded-2xl p-4">
                  <p className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold mb-2">
                    Notice board
                  </p>
                  <div className="space-y-1.5">
                    {concertStats.pending > 0 && (
                      <p className="font-serif text-sm text-amber-900">
                        <span className="text-yellow-700 font-semibold">{concertStats.pending} concert{concertStats.pending > 1 ? 's' : ''}</span>{' '}
                        {concertStats.pending > 1 ? 'are' : 'is'} still in the admin review queue. Hang tight — usually takes 1–2 business days.
                      </p>
                    )}
                    {concertStats.rejected > 0 && (
                      <p className="font-serif text-sm text-amber-900">
                        <span className="text-red-700 font-semibold">{concertStats.rejected} concert{concertStats.rejected > 1 ? 's' : ''}</span>{' '}
                        {concertStats.rejected > 1 ? 'were' : 'was'} rejected. Check the reason in{' '}
                        <Link to="/eo/concerts" className={`text-amber-700 hover:text-amber-900 font-medium underline underline-offset-2 ${focusRing}`}>
                          My Concerts
                        </Link>
                        .
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lineup */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-amber-200/60">
              <div>
                <p className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold mb-1">
                  My concerts
                </p>
                <h2 className="font-serif font-semibold text-amber-950 flex items-center gap-2">
                  <Icon name="music" className="w-4 h-4 text-amber-600" />
                  Lineup
                </h2>
              </div>
              <div className="text-right flex items-center gap-4">
                <div className="hidden sm:block">
                  <p className="font-serif text-sm text-amber-950 font-semibold font-mono tabular-nums">
                    {concertStats.active} <span className="text-amber-700/70 font-normal font-serif">active</span>
                  </p>
                </div>
                <Link
                  to="/eo/concerts"
                  className={`font-serif text-xs text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1 group ${focusRing}`}
                >
                  Manage
                  <Icon name="arrow" className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {concerts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                  <Icon name="ticket" className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-serif font-semibold text-amber-950 mb-2">No concerts yet</h3>
                <p className="font-serif text-sm text-amber-800/80 mb-4">
                  Create your first concert and watch the tickets sell themselves.
                </p>
                <Link
                  to="/eo/concerts"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                >
                  <Icon name="plus" className="w-4 h-4" />
                  Start now
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-amber-200/60">
                {sortedConcerts.map((concert, index) => (
                  <Link
                    key={concert.id}
                    to={`/eo/concerts/${concert.id}`}
                    className={`flex items-center gap-4 p-4 hover:bg-amber-50/50 transition-colors group ${focusRing}`}
                  >
                    <span className="font-serif text-xs font-mono text-amber-500 w-5 shrink-0 text-right group-hover:text-amber-700 transition-colors tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="w-12 h-12 rounded-lg bg-amber-100 overflow-hidden shrink-0 relative">
                      {concert.poster ? (
                        <img
                          src={concert.poster}
                          alt={concert.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            const fallback = parent.querySelector('.fallback-icon');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`fallback-icon ${concert.poster ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
                        <Icon name="ticket" className="w-5 h-5 text-amber-500" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif font-medium text-amber-950 truncate group-hover:text-amber-700 transition-colors">
                        {concert.name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="font-serif text-xs text-amber-800/80 flex items-center gap-1">
                          <Icon name="pin" className="w-3 h-3 text-amber-500" />
                          {concert.venue_name || 'No venue yet'}
                        </span>
                        {concert.nearest_date && (
                          <span className="font-serif text-xs text-amber-700/70 flex items-center gap-1">
                            <Icon name="calendar" className="w-3 h-3 text-amber-500" />
                            {formatDate(concert.nearest_date)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={concert.approval_status} />
                      <StatusBadge status={concert.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}