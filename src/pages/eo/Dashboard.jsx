import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, StatusBadge, formatRupiah, formatDate } from '../../components/Ui';

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
    eye: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    chart: 'M3 3v18h18M18 17V9M13 17V5M8 17v-3',
    trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    fire: 'M12 23c-4.97 0-8-3.582-8-8 0-2.5 1.5-5 3-6.5C8 7 9 5 9.5 3c.5-2 1-2.5 2-2.5.5 0 1 .5 1 1.5V3c0 1.5 1 3 2 4.5 1.5 2 2.5 3.5 2.5 6 0 4.418-2.03 9.5-5 9.5z',
    bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  };

  const path = paths[name];
  if (!path) return null;

  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function TicketNotch({ position }) {
  const isTop = position === 'top';
  return (
    <div
      className={`absolute w-5 h-5 rounded-full bg-[#0a0a0a] left-1/2 -translate-x-1/2
        ${isTop ? '-top-2.5' : '-bottom-2.5'}
        md:top-1/2 md:-translate-y-1/2 md:translate-x-0
        ${isTop ? 'md:-left-2.5' : 'md:-right-2.5 md:left-auto'}`}
    />
  );
}

const BARCODE_PATTERN = `repeating-linear-gradient(90deg,
  currentColor 0px, currentColor 2px, transparent 2px, transparent 4px,
  currentColor 4px, currentColor 5px, transparent 5px, transparent 8px,
  currentColor 8px, currentColor 11px, transparent 11px, transparent 13px,
  currentColor 13px, currentColor 14px, transparent 14px, transparent 18px,
  currentColor 18px, currentColor 21px, transparent 21px, transparent 23px,
  currentColor 23px, currentColor 24px, transparent 24px, transparent 27px)`;

// Animated gradient background
function AnimatedGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-flame-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden mb-8 animate-pulse">
      <div className="p-8">
        <div className="h-4 bg-ink-700 rounded w-40 mb-4"></div>
        <div className="h-12 bg-ink-700 rounded w-64 mb-4"></div>
        <div className="h-4 bg-ink-700 rounded w-48"></div>
      </div>
    </div>
  );
}

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
      // easeOutExpo - feels more dramatic
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

function StatMini({ icon, label, value, to, color = 'text-flame-400', delay = 0 }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between gap-3 py-3 px-4 rounded-lg hover:bg-ink-800/60 transition-all duration-200 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-flame-500/0 group-hover:to-flame-500/5 transition-all duration-300"></div>
      <span className="text-sm text-ink-300 flex items-center gap-2.5 relative z-10">
        <span className={`w-8 h-8 rounded-md bg-ink-700/50 flex items-center justify-center group-hover:scale-110 transition-transform relative`}>
          <Icon name={icon} className={`w-4 h-4 ${color}`} />
        </span>
        {label}
      </span>
      <span className="text-sm font-semibold text-white group-hover:text-flame-400 transition-colors tabular-nums relative z-10">
        {value}
      </span>
    </motion.div>
  );
  
  return to ? <Link to={to}>{content}</Link> : content;
}

function ProgressRing({ progress, size = 60, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-ink-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-flame-400 transition-all duration-1000"
      />
    </svg>
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
      const message = err.response?.data?.message || 'Gagal terhubung ke server. Periksa koneksi internetmu.';
      setError(message);
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const hour = new Date().getHours();
    if (hour < 4) setGreeting('Masih belum tidur?');
    else if (hour < 11) setGreeting('Selamat pagi');
    else if (hour < 15) setGreeting('Selamat siang');
    else if (hour < 19) setGreeting('Selamat sore');
    else setGreeting('Selamat malam');
    
    const timer = setTimeout(() => setShowQuickStats(true), 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card p-6 animate-pulse">
            <div className="h-4 bg-ink-700 rounded w-32 mb-3"></div>
            <div className="h-3 bg-ink-700 rounded w-48"></div>
          </div>
          <div className="card p-6 animate-pulse">
            <div className="h-4 bg-ink-700 rounded w-32 mb-3"></div>
            <div className="h-3 bg-ink-700 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <Icon name="alert" className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Waduh, gagal ambil data</h2>
        <p className="text-ink-300 mb-1">{error}</p>
        <p className="text-ink-400 text-sm mb-6">Coba refresh halaman atau periksa koneksimu.</p>
        <button onClick={fetchData} className="btn-primary">
          Muat ulang
        </button>
      </div>
    );
  }

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
    .filter(c => c.approval_status === 'disetujui' && c.status === 'aktif' && c.nearest_date)
    .sort((a, b) => new Date(a.nearest_date) - new Date(b.nearest_date))
    .slice(0, 1);
    
  const totalConcerts = concerts.length;
  const activeConcerts = concertStats.active;
  const utilizationRate = totalConcerts > 0 ? Math.round((activeConcerts / totalConcerts) * 100) : 0;
  const payoutRate = summary.total_pendapatan > 0 ? Math.round((summary.sudah_cair / summary.total_pendapatan) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <AnimatedGradient />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
      >
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.35em] text-flame-400/80 mb-2">
            {greeting}, boss
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            {concertStats.active > 0 ? (
              <>
                Ada <span className="text-flame-400">{concertStats.active} panggung</span> lagi jalan
              </>
            ) : (
              'Siap bikin panggung?'
            )}
          </h1>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <Link 
            to="/eo/concerts" 
            className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto relative group"
          >
            <Icon name="plus" className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Konser baru
          </Link>
        </motion.div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="hidden md:flex gap-2 mb-6"
      >
        {[
          { to: '/eo/concerts', icon: 'edit', label: 'Kelola konser' },
          { to: '/eo/payouts', icon: 'wallet', label: 'Pencairan dana' },
          { to: '/eo/reports', icon: 'chart', label: 'Laporan' },
        ].map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="text-xs px-3 py-1.5 rounded-full bg-ink-800 text-ink-300 hover:text-white hover:bg-ink-700 transition-all duration-200 flex items-center gap-1.5 hover:scale-105"
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
        className="relative mb-8"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-flame-500/20 via-transparent to-flame-500/20 rounded-2xl blur-xl -z-10"></div>
        <div className="card overflow-hidden relative">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-flame-500/10 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row">
            {/* Main stub: total pendapatan */}
            <div className="flex-[2] p-6 md:p-8 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-ink-400">
                  Total pendapatan
                </p>
                <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-flame-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-flame-400 animate-pulse"></span>
                  Live
                </span>
              </div>

              <p
                className="text-white mt-3 leading-none tracking-wide tabular-nums relative"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.75rem, 6vw, 4.25rem)' }}
              >
                <NumberTicker value={summary.total_pendapatan} prefix="Rp " format="id-ID" duration={1500} />
              </p>
              
              <div className="flex items-center gap-3 mt-3">
                <p className="text-sm text-ink-300">
                  <NumberTicker value={summary.total_tiket_terjual} format="id-ID" /> tiket di{' '}
                  {concertStats.active} konser aktif
                </p>
                {summary.total_tiket_terjual > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-flame-500/10 text-flame-400 flex items-center gap-1">
                    <Icon name="trending" className="w-3 h-3" />
                    Aktif
                  </span>
                )}
              </div>

              <div className="mt-auto pt-8 hidden md:block">
                <div
                  className="h-6 w-full max-w-[220px] text-ink-600/60"
                  style={{ backgroundImage: BARCODE_PATTERN, backgroundRepeat: 'repeat-x' }}
                />
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-500 mt-1.5">
                  Akses eo · non-transferable
                </p>
              </div>
            </div>

            {/* Perforation */}
            <div className="relative border-t-2 md:border-t-0 md:border-l-2 border-dashed border-ink-600/50 mx-6 md:mx-0 my-1 md:my-6">
              <TicketNotch position="top" />
              <TicketNotch position="bottom" />
            </div>

            {/* Side stub: rincian */}
            <div className="flex-1 p-4 md:p-6 flex flex-col justify-center gap-1">
              <AnimatePresence>
                {showQuickStats && (
                  <>
                    <StatMini
                      icon="wallet"
                      label="Belum dicairkan"
                      to="/eo/payouts?status=pending"
                      color="text-yellow-400"
                      value={formatRupiah(summary.belum_cair)}
                      delay={0.1}
                    />
                    <StatMini
                      icon="check"
                      label="Sudah dicairkan"
                      to="/eo/payouts?status=completed"
                      color="text-blue-400"
                      value={formatRupiah(summary.sudah_cair)}
                      delay={0.2}
                    />
                    <StatMini
                      icon="ticket"
                      label="Tiket terjual"
                      color="text-flame-400"
                      value={summary.total_tiket_terjual.toLocaleString('id-ID')}
                      delay={0.3}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Upcoming concert */}
        {upcomingConcerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2"
          >
            <Link 
              to={`/eo/concerts/${upcomingConcerts[0].id}`} 
              className="card p-5 flex items-center gap-4 hover:bg-ink-800/50 transition-all duration-200 group h-full"
            >
              <div className="relative w-14 h-14 rounded-lg bg-ink-700 overflow-hidden shrink-0">
                {upcomingConcerts[0].poster ? (
                  <img src={upcomingConcerts[0].poster} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="music" className="w-5 h-5 text-ink-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-flame-400 mb-0.5 flex items-center gap-1">
                  <Icon name="fire" className="w-3 h-3" />
                  Konser terdekat
                </p>
                <p className="font-medium text-white truncate group-hover:text-flame-400 transition-colors">
                  {upcomingConcerts[0].name}
                </p>
                <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
                  <Icon name="clock" className="w-3 h-3" />
                  {formatDate(upcomingConcerts[0].nearest_date)}
                </p>
              </div>
              <Icon name="arrow" className="w-4 h-4 text-ink-500 group-hover:text-flame-400 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </motion.div>
        )}

        {/* Mini stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 flex flex-col justify-center"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-ink-400">
              Statistik cepat
            </p>
            <Icon name="chart" className="w-3 h-3 text-ink-500" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-300">Tingkat utilisasi</span>
              <span className="text-xs font-semibold text-white">{utilizationRate}%</span>
            </div>
            <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${utilizationRate}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-flame-400 to-orange-500 rounded-full"
              />
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-ink-300">Tingkat pencairan</span>
              <span className="text-xs font-semibold text-white">{payoutRate}%</span>
            </div>
            <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${payoutRate}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Papan pengumuman */}
      <AnimatePresence>
        {hasNotices && (
          <motion.div
            initial={{ opacity: 0, rotate: -3 }}
            animate={{ opacity: 1, rotate: -1 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative -rotate-1 mb-10"
          >
            <div className="absolute -top-1.5 left-8 w-3 h-3 rounded-full bg-flame-400 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
            <div className="border border-ink-700 bg-ink-800/60 rounded-lg rounded-tl-none pt-4 pb-3 px-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400 mb-2">
                Papan pengumuman
              </p>
              <div className="space-y-1.5">
                {concertStats.pending > 0 && (
                  <p className="text-sm text-ink-200">
                    <span className="text-yellow-400 font-semibold">{concertStats.pending} konser</span>{' '}
                    masih dalam antrian review admin. Sabar ya, biasanya 1–2 hari kerja.
                  </p>
                )}
                {concertStats.rejected > 0 && (
                  <p className="text-sm text-ink-200">
                    <span className="text-red-400 font-semibold">{concertStats.rejected} konser</span>{' '}
                    kena tolak. Cek alasannya di{' '}
                    <Link to="/eo/concerts" className="text-flame-400 hover:text-flame-300 font-medium underline underline-offset-2">
                      Konser Saya
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
        className="card"
      >
        <div className="flex items-center justify-between p-5 border-b border-ink-700">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400 mb-1">
              Konser saya
            </p>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Icon name="music" className="w-4 h-4 text-ink-400" />
              Lineup
            </h2>
          </div>
          <div className="text-right flex items-center gap-4">
            <div className="hidden sm:block">
              <p className="text-sm text-white font-semibold">
                {concertStats.active} <span className="text-ink-400 font-normal">aktif</span>
              </p>
            </div>
            <Link
              to="/eo/concerts"
              className="text-xs text-flame-400 hover:text-flame-300 font-medium inline-flex items-center gap-1 group"
            >
              Kelola
              <Icon name="arrow" className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {concerts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-ink-700 flex items-center justify-center mb-4">
              <Icon name="ticket" className="w-8 h-8 text-ink-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Belum ada konser nih</h3>
            <p className="text-sm text-ink-300 mb-4">
              Bikin konser pertamamu, terus duduk manis lihat tiketnya laku.
            </p>
            <Link to="/eo/concerts" className="btn-primary inline-flex items-center gap-2">
              <Icon name="plus" className="w-4 h-4" />
              Mulai sekarang
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink-700">
            {sortedConcerts.map((concert, index) => (
              <Link
                key={concert.id}
                to={`/eo/concerts/${concert.id}`}
                className="flex items-center gap-4 p-4 hover:bg-ink-800/50 transition-all duration-200 group relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-flame-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                <span className="text-xs font-mono text-ink-600 w-5 shrink-0 text-right group-hover:text-flame-400 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="w-12 h-12 rounded-lg bg-ink-700 overflow-hidden shrink-0 relative">
                  {concert.poster ? (
                    <img
                      src={concert.poster}
                      alt={concert.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        const fallback = parent.querySelector('.fallback-icon');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`fallback-icon ${concert.poster ? 'hidden' : ''} w-full h-full flex items-center justify-center`}
                  >
                    <Icon name="ticket" className="w-5 h-5 text-ink-400" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white truncate group-hover:text-flame-400 transition-colors">
                    {concert.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-ink-300 flex items-center gap-1">
                      <Icon name="pin" className="w-3 h-3 text-ink-500" />
                      {concert.venue_name || 'Belum ada venue'}
                    </span>
                    {concert.nearest_date && (
                      <span className="text-xs text-ink-400 flex items-center gap-1">
                        <Icon name="calendar" className="w-3 h-3 text-ink-500" />
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
  );
}