import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  motion, AnimatePresence, MotionConfig,
  useScroll, useTransform, useSpring, useMotionValue,
  useInView, useReducedMotion,
} from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Loading, formatRupiah, formatDate } from '../../components/Ui';
import { getImageUrl } from '../../utils/image';

/* ============ ICONS ============ */
const ICON_PATHS = {
  pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  share: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13',
  heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z',
  check: 'M20 6L9 17l-5-5',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 19l-7-7 7-7',
  map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16',
  info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
  ticket: 'M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
  lock: 'M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zM9 6a3 3 0 016 0v3H9V6z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  bolt: 'M13 2L3 14h7v8l10-12h-7V2z',
  flame: 'M12 23c-4.97 0-9-3.582-9-8 0-4.418 4.03-8.259 6.5-10.5C10.5 3.5 12 1 12 1s1.5 2.5 2.5 3.5C16.97 6.741 21 10.582 21 15c0 4.418-4.03 8-9 8z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  arrow: 'M13 7l5 5-5 5M6 12h12',
};

function Icon({ name, className = 'w-4 h-4', fill = 'none' }) {
  return (
    <svg className={className} fill={fill} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';
const focusRingDark = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');
  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  /* Panel tiket dengan stub di bawah */
  .ticket-panel {
    --stub-h: 10.5rem;
    -webkit-mask:
      radial-gradient(circle 10px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 10px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 10px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 10px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }

  /* Papan jadwal berjalan */
  @keyframes ticker-scroll { to { transform: translateX(-50%); } }
  .ticker-track { animation: ticker-scroll 40s linear infinite; }
  .ticker:hover .ticker-track, .ticker:focus-within .ticker-track { animation-play-state: paused; }
  @media (prefers-reduced-motion: reduce) { .ticker-track { animation: none; } }

  /* Pulse dot */
  @keyframes ping-slow { 75%, 100% { transform: scale(2); opacity: 0; } }
  .animate-ping-slow { animation: ping-slow 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
  @media (prefers-reduced-motion: reduce) { .animate-ping-slow { animation: none; } }
`;

const EASE = [0.22, 1, 0.36, 1];

/* ============ SAFE NUMBER HELPERS ============ */
function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function clampRating(value) {
  return Math.min(5, Math.max(0, toNumber(value, 0)));
}

/* ============ DATE HELPERS ============ */
function parseLocalDate(value) {
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function scheduleStart(s) {
  const d = parseLocalDate(s.event_date);
  const [h, m] = String(s.start_time || '00:00').split(':').map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function sortSchedules(list = []) {
  return [...list].sort(
    (a, b) =>
      String(a.event_date).slice(0, 10).localeCompare(String(b.event_date).slice(0, 10)) ||
      String(a.start_time || '').localeCompare(String(b.start_time || ''))
  );
}

/* ============ SALE STATE ============ */
function getSaleState(concert, schedules) {
  const categories = concert.ticket_categories || [];
  const totalRemaining = categories.reduce((sum, tc) => sum + toNumber(tc.remaining, 0), 0);
  const isSoldOut = categories.length > 0 && totalRemaining <= 0;

  const today = startOfToday();
  const upcoming = schedules.filter((s) => parseLocalDate(s.event_date) >= today);
  const nearest = upcoming[0] || null;
  const isPast = schedules.length > 0 && upcoming.length === 0;
  const statusLower = (concert.status || '').toLowerCase();

  const base = { nearest, upcoming };

  if (statusLower === 'draft') return { ...base, label: 'Not published', dot: 'bg-yellow-400', canBuy: false, buyLabel: 'Not on sale yet' };
  if (statusLower === 'cancelled' || statusLower === 'dibatalkan')
    return { ...base, label: 'Event cancelled', dot: 'bg-red-400', canBuy: false, buyLabel: 'Event cancelled' };
  if (statusLower === 'selesai' || statusLower === 'completed' || isPast)
    return { ...base, label: 'Event ended', dot: 'bg-stone-400', canBuy: false, buyLabel: 'Event ended' };
  if (isSoldOut) return { ...base, label: 'Sold out', dot: 'bg-red-400', canBuy: false, buyLabel: 'Sold out' };

  if (nearest) {
    const daysUntil = Math.round((parseLocalDate(nearest.event_date) - today) / 86400000);
    if (daysUntil <= 7) return { ...base, label: daysUntil === 0 ? 'Happening today' : 'Coming soon', dot: 'bg-amber-300', canBuy: true, buyLabel: 'Buy now' };
  }
  return { ...base, label: 'Tickets available', dot: 'bg-emerald-400', canBuy: true, buyLabel: 'Buy now' };
}

/* ============ MOTION HELPERS ============ */
function RevealWords({ text, className = '', delay = 0 }) {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-1">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.7, delay: delay + i * 0.08, ease: EASE }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Tag>
  );
}

function TiltCard({ children, className = '', max = 4 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 20 });

  function handleMove(e) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============ COUNTDOWN ============ */
function CountdownTimer({ target }) {
  const compute = () => {
    const distance = target.getTime() - Date.now();
    if (distance <= 0) return null;
    return {
      days: Math.floor(distance / 86400000),
      hours: Math.floor((distance % 86400000) / 3600000),
      minutes: Math.floor((distance % 3600000) / 60000),
      seconds: Math.floor((distance % 60000) / 1000),
    };
  };
  const [timeLeft, setTimeLeft] = useState(compute);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTimeLeft(compute());
    const timer = setInterval(() => {
      const next = compute();
      setTimeLeft(next);
      setTick((t) => t + 1);
      if (!next) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.getTime()]);

  if (!timeLeft) return null;

  const items = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec', pulse: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
      className="flex gap-2"
      aria-label="Time until the event starts"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + i * 0.08, duration: 0.5, ease: EASE }}
          className="text-center"
        >
          <div className="relative bg-ink-950/70 backdrop-blur rounded-xl px-3 py-2 min-w-[58px] border border-amber-500/20 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={item.value}
                initial={{ y: -14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 14, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="f-display text-2xl font-bold text-amber-300 tabular-nums block"
              >
                {String(item.value).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-xs text-amber-100/80 mt-1 block">{item.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function SectionHeading({ label, action, id, eyebrow }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-5 scroll-mt-28" id={id}>
      <div>
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600/90 uppercase tracking-wider mb-1">
            <span className="w-1 h-1 rounded-full bg-amber-500" />
            {eyebrow}
          </span>
        )}
        <h2 className="f-display text-2xl md:text-3xl font-semibold text-amber-950 tracking-tight">{label}</h2>
      </div>
      {action}
    </div>
  );
}

/* ============ STAR ROW ============ */
function StarRow({ value, size = 'w-3.5 h-3.5', animated = false }) {
  const v = clampRating(value);
  const rounded = Math.round(v);
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${v} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rounded;
        return (
          <motion.span
            key={i}
            initial={animated ? { opacity: 0, scale: 0.4 } : false}
            animate={animated ? { opacity: 1, scale: 1 } : false}
            transition={{ delay: i * 0.06, duration: 0.35, ease: EASE }}
          >
            <Icon
              name="star"
              className={`${size} ${filled ? 'text-amber-500' : 'text-amber-200'}`}
              fill={filled ? 'currentColor' : 'none'}
            />
          </motion.span>
        );
      })}
    </div>
  );
}

/* ============ INFO TICKER ============ */
function InfoTicker({ concert, sale }) {
  const items = [
    { icon: 'calendar', text: formatDate(sale.nearest?.event_date || concert.schedules?.[0]?.event_date) },
    { icon: 'pin', text: concert.venue_name ? `${concert.venue_name}${concert.city ? `, ${concert.city}` : ''}` : null },
    { icon: 'users', text: concert.sold_count > 0 ? `${concert.sold_count}+ tickets sold` : null },
    { icon: 'flame', text: sale.label },
    { icon: 'ticket', text: `${concert.ticket_categories?.length || 0} ticket categories` },
  ].filter((item) => item.text);

  return (
    <div className="ticker relative overflow-hidden bg-amber-800 border-y border-amber-600/30" aria-label="Event info">
      <div className="ticker-track flex w-max">
        {[0, 1].map((rep) => (
          <ul key={rep} className="flex items-center shrink-0" aria-hidden={rep === 1}>
            {items.map((item, i) => (
              <li key={`${rep}-${i}`} className="flex items-center gap-2.5 px-6 py-2.5 text-sm text-amber-100/90 whitespace-nowrap">
                <Icon name={item.icon} className="w-3.5 h-3.5 text-amber-300" />
                <span className="f-display font-semibold">{item.text}</span>
                <span className="w-1 h-1 rounded-full bg-amber-300/60 ml-3" aria-hidden="true" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ============ TICKET PANEL ============ */
function TicketPanel({
  schedules, selectedSchedule, setSelectedSchedule,
  categories, selectedCategory, setSelectedCategory,
  qty, setQty, total, onBuy, user, category, remaining, sale,
}) {
  const reduce = useReducedMotion();
  const disabled = !sale.canBuy || !category || remaining <= 0;
  const buyText = !sale.canBuy ? sale.buyLabel : !user ? 'Log in to buy' : remaining <= 0 ? 'Sold out' : 'Buy now';

  return (
    <TiltCard max={3} className="drop-shadow-[0_10px_18px_rgba(69,26,3,0.14)]" id="tickets">
      <div className="ticket-panel bg-white rounded-2xl overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <Icon name="ticket" className="w-4 h-4" />
            </span>
            <h2 className="f-display text-xl font-semibold text-amber-950">Get your tickets</h2>
          </div>

          {schedules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-4"
            >
              <label htmlFor="schedule-select" className="block text-sm font-medium text-amber-900 mb-1.5">Date</label>
              <div className="relative">
                <select
                  id="schedule-select"
                  className="w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none pr-9"
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                >
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {formatDate(s.event_date)}
                      {s.start_time ? `, ${s.start_time.slice(0, 5)}` : ''}
                    </option>
                  ))}
                </select>
                <Icon name="chevronDown" className="w-4 h-4 text-amber-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </motion.div>
          )}

          <fieldset className="mb-4">
            <legend className="block text-sm font-medium text-amber-900 mb-1.5">Ticket category</legend>
            <div className="space-y-2">
              {categories.map((tc, i) => {
                const selected = String(selectedCategory) === String(tc.id);
                const soldOut = toNumber(tc.remaining, 0) <= 0;
                const low = toNumber(tc.remaining, 0) <= 10 && !soldOut;
                return (
                  <motion.button
                    key={tc.id}
                    type="button"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: EASE }}
                    aria-pressed={selected}
                    disabled={soldOut}
                    onClick={() => { setSelectedCategory(tc.id); setQty(1); }}
                    className={`w-full text-left rounded-xl p-3 transition-colors border relative overflow-hidden ${focusRing} ${
                      selected ? 'border-amber-700 bg-amber-100/70' : 'border-amber-200 hover:border-amber-400 bg-white'
                    } ${soldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="selected-category-glow"
                        className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-transparent pointer-events-none"
                        transition={{ duration: 0.3, ease: EASE }}
                      />
                    )}
                    <span className="relative flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            selected ? 'bg-amber-800 border-amber-800 text-white' : 'border-amber-300'
                          }`}
                        >
                          {selected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.25, ease: EASE }}
                            >
                              <Icon name="check" className="w-3 h-3" />
                            </motion.span>
                          )}
                        </span>
                        <span className="text-sm font-semibold text-amber-950 truncate">{tc.name}</span>
                      </span>
                      <span className="f-display text-base font-semibold text-amber-800 tabular-nums shrink-0">{formatRupiah(tc.price)}</span>
                    </span>
                    <span className={`relative block text-xs mt-1 pl-6 ${soldOut || low ? 'text-red-600' : 'text-amber-700/80'}`}>
                      {soldOut ? 'Sold out' : `${tc.remaining} left`}
                      {low && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                          className="ml-1.5 inline-flex items-center gap-0.5"
                        >
                          <Icon name="flame" className="w-3 h-3" /> almost gone
                        </motion.span>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </fieldset>

          {category && remaining > 0 && sale.canBuy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mb-5"
            >
              <span className="block text-sm font-medium text-amber-900 mb-1.5">Quantity</span>
              <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className={`w-10 h-10 flex items-center justify-center text-amber-900 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-40 ${focusRing}`}
                >
                  <Icon name="minus" className="w-4 h-4" />
                </button>
                <span className="f-display text-lg font-bold text-amber-950 tabular-nums" aria-live="polite">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(remaining, q + 1))}
                  disabled={qty >= remaining}
                  aria-label="Increase quantity"
                  className={`w-10 h-10 flex items-center justify-center text-amber-900 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-40 ${focusRing}`}
                >
                  <Icon name="plus" className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="bg-amber-100 border-t border-dashed border-amber-400/70 px-5 flex flex-col justify-center gap-3" style={{ height: 'var(--stub-h, 10.5rem)' }}>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-amber-900">Total</p>
              {category && <p className="text-xs text-amber-700/80 tabular-nums truncate">{qty} × {formatRupiah(category.price)}</p>}
            </div>
            <AnimatePresence mode="popLayout">
              <motion.p
                key={total}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="f-display text-3xl font-bold text-amber-950 tabular-nums leading-none"
              >
                {formatRupiah(total)}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            onClick={onBuy}
            disabled={disabled}
            whileHover={!disabled && !reduce ? { scale: 1.02 } : {}}
            whileTap={!disabled && !reduce ? { scale: 0.98 } : {}}
            className={`w-full py-3 bg-amber-800 hover:bg-amber-700 disabled:bg-amber-300/60 disabled:text-amber-800/60 disabled:cursor-not-allowed text-amber-50 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${focusRing}`}
          >
            {buyText}
            {!disabled && <Icon name="arrow" className="w-4 h-4" />}
          </motion.button>
          <p className="text-xs text-amber-700/80 text-center flex items-center justify-center gap-1">
            <Icon name="info" className="w-3 h-3" />
            Non-refundable unless the organizer cancels
          </p>
        </div>
      </div>
    </TiltCard>
  );
}

/* ============ FAQ ============ */
const FAQS = [
  { question: 'How do I get my e-ticket?', answer: 'E-tickets will be sent to your email after payment is successful. You can also view them in your My Tickets page.' },
  { question: 'Are tickets refundable?', answer: 'Tickets are non-refundable, unless the event is cancelled by the organizer.' },
  { question: 'Can I bring a professional camera?', answer: 'Professional cameras with interchangeable lenses are not allowed. Compact cameras and smartphones are permitted.' },
  { question: 'Is there an age limit?', answer: 'Some events have age restrictions. Please check the event description for more information.' },
];

function FaqItem({ question, answer, open, onToggle, id }) {
  return (
    <div className={`rounded-2xl overflow-hidden transition-colors ${open ? 'bg-amber-50 ring-1 ring-amber-300' : 'bg-transparent'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-button`}
        className={`w-full flex items-center gap-3 py-4 px-4 text-left rounded-2xl ${focusRing}`}
      >
        <span className="flex-1 text-sm font-semibold text-amber-950 f-display text-base">{question}</span>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-amber-700 text-amber-50' : 'bg-amber-100 text-amber-700'}`}>
          <Icon name={open ? 'minus' : 'plus'} className="w-3.5 h-3.5" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-amber-800/80 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ MAIN ============ */
export default function ConcertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const heroRef = useRef(null);

  /* ----- Parallax hero ----- */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchDetail() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/concerts/${id}`);
      const data = res.data;

      const normalizedReviews = (data.reviews || []).map((r, idx) => ({
        ...r,
        id: r.id ?? `local-${idx}`,
        user_name: r.user_name || r.name || 'Anonymous',
        initials: r.initials || null,
        rating: clampRating(r.rating ?? r.stars ?? r.score),
        comment: r.comment || r.text || '',
        source: r.source || 'review',
      }));

      const explicitCount = toNumber(data.review_count, NaN);
      const reviewCount = Number.isFinite(explicitCount) ? explicitCount : normalizedReviews.length;

      const ratings = normalizedReviews.map((r) => r.rating).filter((n) => n > 0);
      const computedAvg = ratings.length
        ? Number((ratings.reduce((s, n) => s + n, 0) / ratings.length).toFixed(1))
        : 0;

      const normalized = {
        ...data,
        ticket_categories: (data.ticket_categories || []).map((tc) => ({
          ...tc,
          price: toNumber(tc.price, 0),
          remaining: toNumber(tc.remaining, 0),
        })),
        sold_count: toNumber(data.sold_count, 0),
        avg_rating: clampRating(data.avg_rating ?? computedAvg),
        review_count: reviewCount,
        reviews: normalizedReviews,
      };

      setConcert(normalized);

      const schedules = sortSchedules(normalized.schedules);
      const today = startOfToday();
      const firstUpcoming = schedules.find((s) => parseLocalDate(s.event_date) >= today) || schedules[0];
      if (firstUpcoming) setSelectedSchedule(firstUpcoming.id);

      const cats = normalized.ticket_categories;
      const firstAvailable = cats.find((c) => c.remaining > 0) || cats[0];
      if (firstAvailable) setSelectedCategory(firstAvailable.id);
    } catch (err) {
      setError("We couldn't load this concert. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBuy() {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    if (!selectedCategory) return;
    navigate('/checkout', {
      state: { concert_id: concert.id, schedule_id: selectedSchedule || null, ticket_category_id: selectedCategory, qty },
    });
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: concert.name, text: `Check out ${concert.name} by ${concert.artist}!`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast('Link copied');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') setToast("Couldn't copy the link");
    }
  }

  if (loading) {
    return (
      <MotionConfig reducedMotion="user">
        <style>{pageCss}</style>
        <div className="f-body min-h-screen bg-[#f5ede4]">
          <div className="relative h-[56vh] bg-amber-950 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 animate-pulse" />
          </div>
          <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-40 bg-white rounded-2xl animate-pulse" />
              <div className="h-60 bg-white rounded-2xl animate-pulse" />
            </div>
            <div className="h-96 bg-white rounded-2xl animate-pulse" />
          </div>
        </div>
      </MotionConfig>
    );
  }

  if (!concert) {
    return (
      <MotionConfig reducedMotion="user">
        <style>{pageCss}</style>
        <div className="f-body min-h-screen bg-[#f5ede4] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm shadow-amber-900/5"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Icon name="alert" className="w-6 h-6" />
            </div>
            <h1 className="f-display text-xl font-semibold text-amber-950 mb-2">Concert not found</h1>
            <p className="text-sm text-amber-800/80 mb-6">{error || 'It may have been removed, or the link is wrong.'}</p>
            <div className="flex gap-3 justify-center">
              {error && (
                <button onClick={fetchDetail} className={`px-5 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}>
                  Try again
                </button>
              )}
              <Link to="/" className={`px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}>
                Back home
              </Link>
            </div>
          </motion.div>
        </div>
      </MotionConfig>
    );
  }

  const categories = concert.ticket_categories || [];
  const allSchedules = sortSchedules(concert.schedules);
  const sale = getSaleState(concert, allSchedules);
  const selectableSchedules = sale.upcoming.length > 0 ? sale.upcoming : allSchedules;

  const category = categories.find((c) => String(c.id) === String(selectedCategory));
  const remaining = category ? toNumber(category.remaining, 0) : 0;
  const total = toNumber(category?.price, 0) * qty;
  const heroSchedule = sale.nearest || allSchedules[0];
  const countdownTarget = sale.nearest ? scheduleStart(sale.nearest) : null;
  const reviews = showAllReviews ? concert.reviews : concert.reviews?.slice(0, 3);
  const hasRating = concert.avg_rating > 0 || concert.review_count > 0;

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        {/* ===== HERO with Parallax ===== */}
        <div ref={heroRef} className="relative min-h-[24rem] h-[58vh] md:h-[68vh] overflow-hidden bg-ink-950">
          <motion.div
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0"
          >
            <motion.div
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: EASE }}
              className="absolute inset-0"
            >
              {concert.poster ? (
                <img src={getImageUrl(concert.poster)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-700/40">
                  <Icon name="mic" className="w-20 h-20" />
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* overlay dots */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
            aria-hidden="true"
          />
          <div className="absolute -right-32 -top-24 w-[32rem] h-[32rem] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/40" aria-hidden="true" />

          {/* top nav */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute top-4 inset-x-4 max-w-7xl mx-auto flex items-center justify-between z-20"
          >
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur text-white text-sm font-medium transition-colors ${focusRingDark}`}
            >
              <Icon name="chevronLeft" className="w-4 h-4" />
              Back
            </Link>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsFavorite(!isFavorite)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={`p-2.5 rounded-full backdrop-blur transition-colors ${focusRingDark} ${
                  isFavorite ? 'bg-amber-400 text-amber-950' : 'bg-black/30 hover:bg-black/45 text-white'
                }`}
              >
                <motion.span
                  animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Icon name="heart" className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                </motion.span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                aria-label="Share this concert"
                className={`p-2.5 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur text-white transition-colors ${focusRingDark}`}
              >
                <Icon name="share" className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* hero content */}
          <motion.div
            style={{ opacity: heroOpacity, y: contentY }}
            className="absolute bottom-0 inset-x-0 z-10"
          >
            <div className="max-w-7xl mx-auto px-4 pb-10 flex items-end justify-between gap-6">
              <div className="min-w-0">
                <motion.span
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-amber-50 text-sm font-medium mb-3"
                >
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className={`animate-ping-slow motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full ${sale.dot} opacity-60`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${sale.dot}`} />
                  </span>
                  {sale.label}
                </motion.span>

                <h1 className="f-display text-4xl md:text-6xl font-bold text-white leading-[0.95] tracking-tight break-words">
                  <RevealWords text={concert.name} delay={0.3} />
                </h1>
                {concert.artist && (
                  <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
                    className="text-lg md:text-xl text-amber-300 mt-2"
                  >
                    {concert.artist}
                  </motion.p>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.85, ease: EASE }}
                  className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-amber-50/90"
                >
                  {heroSchedule && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="calendar" className="w-4 h-4 text-amber-300" />
                      {formatDate(heroSchedule.event_date)}
                      {heroSchedule.start_time ? `, ${heroSchedule.start_time.slice(0, 5)}` : ''}
                    </span>
                  )}
                  {concert.venue_name && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="pin" className="w-4 h-4 text-amber-300" />
                      {concert.venue_name}
                      {concert.city ? `, ${concert.city}` : ''}
                    </span>
                  )}
                  {concert.avg_rating > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="star" className="w-4 h-4 text-amber-300" fill="currentColor" />
                      {concert.avg_rating.toFixed(1)}
                      <span className="text-amber-200/70">({concert.review_count})</span>
                    </span>
                  )}
                </motion.div>
              </div>

              {countdownTarget && (
                <div className="hidden md:block shrink-0">
                  <CountdownTimer target={countdownTarget} />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ===== TICKER ===== */}
        <InfoTicker concert={concert} sale={sale} />

        {/* ===== MAIN CONTENT ===== */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.nav
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-amber-700/80 mb-6 min-w-0"
          >
            <Link to="/" className={`hover:text-amber-950 transition-colors inline-flex items-center gap-1 rounded ${focusRing}`}>
              <Icon name="home" className="w-3.5 h-3.5" />
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span>{concert.category_name || 'Events'}</span>
            <span aria-hidden="true">/</span>
            <span className="text-amber-950 truncate">{concert.name}</span>
          </motion.nav>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <motion.aside
              className="order-first lg:order-none lg:col-start-3 lg:row-start-1 lg:sticky lg:top-6 space-y-4"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
            >
              <TicketPanel
                schedules={selectableSchedules}
                selectedSchedule={selectedSchedule}
                setSelectedSchedule={setSelectedSchedule}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                qty={qty}
                setQty={setQty}
                total={total}
                onBuy={handleBuy}
                user={user}
                category={category}
                remaining={remaining}
                sale={sale}
              />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
                className="bg-white rounded-2xl p-4 grid grid-cols-3 gap-2 divide-x divide-dashed divide-amber-200"
              >
                {[
                  { icon: 'lock', label: 'Secure payment' },
                  { icon: 'shield', label: 'Guaranteed tickets' },
                  { icon: 'check', label: 'Instant e-ticket' },
                ].map((b, i) => (
                  <motion.div
                    key={b.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.08, duration: 0.4 }}
                    className="flex flex-col items-center text-center gap-1.5 px-1"
                  >
                    <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <Icon name={b.icon} className="w-4 h-4" />
                    </span>
                    <span className="text-xs text-amber-800 leading-tight">{b.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.aside>

            <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 space-y-6">
              {concert.description && (
                <Reveal as="section" className="bg-white rounded-2xl p-6" delay={0.1}>
                  <SectionHeading eyebrow="About" label="About the event" />
                  <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{concert.description}</p>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-4 border-t border-dashed border-amber-200 text-sm text-amber-800">
                    <span className="flex items-center gap-1.5">
                      <Icon name="pin" className="w-4 h-4 text-amber-600" />
                      {concert.venue_name || '-'}
                      {concert.city ? `, ${concert.city}` : ''}
                    </span>
                    {heroSchedule && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="calendar" className="w-4 h-4 text-amber-600" />
                        {formatDate(heroSchedule.event_date)}
                      </span>
                    )}
                    {concert.sold_count > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="users" className="w-4 h-4 text-amber-600" />
                        {concert.sold_count}+ tickets sold
                      </span>
                    )}
                  </div>
                </Reveal>
              )}

              <Reveal as="section" className="bg-white rounded-2xl p-6" id="venue" delay={0.15}>
                <SectionHeading eyebrow="Location" label="Venue" />
                <div className="flex items-start gap-3 mb-4">
                  <motion.span
                    whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
                    className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 text-amber-700"
                  >
                    <Icon name="pin" className="w-5 h-5" />
                  </motion.span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-950">{concert.venue_name || '-'}</p>
                    {concert.venue_address && <p className="text-sm text-amber-800/80 mt-0.5">{concert.venue_address}</p>}
                    {concert.city && <p className="text-sm text-amber-700/70 mt-0.5">{concert.city}</p>}
                  </div>
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={
                      concert.venue_latitude && concert.venue_longitude
                        ? `https://www.google.com/maps?q=${concert.venue_latitude},${concert.venue_longitude}`
                        : `https://www.google.com/maps/search/${encodeURIComponent(`${concert.venue_name} ${concert.venue_address || ''} ${concert.city || ''}`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200/70 rounded-xl px-3.5 py-2 shrink-0 transition-colors ${focusRing}`}
                  >
                    <Icon name="map" className="w-4 h-4" />
                    Open map
                  </motion.a>
                </div>

                {concert.venue_latitude && concert.venue_longitude && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="rounded-xl overflow-hidden ring-1 ring-amber-200"
                  >
                    <iframe
                      title="Venue location"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(concert.venue_longitude) - 0.005}%2C${Number(concert.venue_latitude) - 0.005}%2C${Number(concert.venue_longitude) + 0.005}%2C${Number(concert.venue_latitude) + 0.005}&layer=mapnik&marker=${concert.venue_latitude}%2C${concert.venue_longitude}`}
                      className="w-full h-64 border-0"
                      loading="lazy"
                    />
                  </motion.div>
                )}
              </Reveal>

              <Reveal as="section" className="bg-white rounded-2xl p-6" id="reviews" delay={0.2}>
                <SectionHeading
                  eyebrow="Reviews"
                  label="Ratings and reviews"
                  action={
                    concert.reviews?.length > 3 && (
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className={`text-sm font-medium text-amber-800 hover:text-amber-950 rounded transition-colors inline-flex items-center gap-1 ${focusRing}`}
                      >
                        {showAllReviews ? 'Show less' : `View all ${concert.reviews.length}`}
                        <motion.span animate={{ rotate: showAllReviews ? 180 : 0 }} transition={{ duration: 0.25 }}>
                          <Icon name="chevronDown" className="w-3.5 h-3.5" />
                        </motion.span>
                      </button>
                    )
                  }
                />

                {hasRating && (
                  <div className="flex items-center gap-5 mb-5 pb-5 border-b border-dashed border-amber-200">
                    <div className="text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="f-display text-5xl font-bold text-amber-800 leading-none"
                      >
                        {concert.avg_rating > 0 ? concert.avg_rating.toFixed(1) : '—'}
                      </motion.div>
                      <div className="text-xs text-amber-700/80 mt-1">out of 5</div>
                    </div>
                    <div className="flex-1">
                      <StarRow value={concert.avg_rating} size="w-5 h-5" animated />
                      <p className="text-sm text-amber-700/80 mt-1">
                        {concert.review_count} {concert.review_count === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>
                )}

                {!concert.reviews?.length ? (
                  <p className="text-sm text-amber-700/80">No reviews yet. Be the first after you attend.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <AnimatePresence>
                      {reviews?.map((r, i) => (
                        <motion.div
                          key={r.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                          className="bg-amber-50 rounded-xl p-4 hover:bg-amber-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 f-display font-semibold text-sm flex items-center justify-center shrink-0">
                              {r.initials || r.user_name?.charAt(0).toUpperCase()}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-amber-950 truncate">{r.user_name}</p>
                              <div className="flex items-center gap-2">
                                <StarRow value={r.rating} size="w-3.5 h-3.5" />
                                {r.source === 'testimonial' && (
                                  <span className="text-[10px] text-amber-600/70 uppercase tracking-wider">
                                    Platform
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {r.comment && <p className="text-sm text-amber-900 leading-relaxed">{r.comment}</p>}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </Reveal>

              <Reveal as="section" className="bg-white rounded-2xl p-6" id="faq" delay={0.25}>
                <SectionHeading eyebrow="Need to know" label="Good to know" />
                <div className="divide-y divide-dashed divide-amber-200 -my-1">
                  {FAQS.map((faq, idx) => (
                    <FaqItem
                      key={faq.question}
                      id={`faq-${idx}`}
                      question={faq.question}
                      answer={faq.answer}
                      open={openFaq === idx}
                      onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    />
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-950 text-amber-50 text-sm shadow-lg shadow-amber-950/30"
            >
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Icon name="check" className="w-4 h-4 text-emerald-400" />
              </motion.span>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}