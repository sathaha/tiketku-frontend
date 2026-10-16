import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  useVelocity,
  useAnimationFrame,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/image';

/* ============ ICONS ============ */
const ICON_PATHS = {
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  arrow: 'M13 7l5 5-5 5M6 12h12',
  pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  check: 'M20 6L9 17l-5-5',
  close: 'M6 6l12 12M18 6L6 18',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  copy: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v2M10 4h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2z',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ============ STYLES ============ */
const EASE = [0.22, 1, 0.36, 1];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';
const focusRingDark = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  /* Ticket with a stub at the bottom */
  .ticket-card {
    -webkit-mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }

  /* Ticket with a stub on the right (from sm up) */
  .promo-ticket { --stub-w: 11rem; }
  .promo-ticket.is-featured { --stub-w: 16rem; }
  .step-ticket { --stub-w: 9rem; }
  @media (min-width: 640px) {
    .promo-ticket, .step-ticket {
      -webkit-mask:
        radial-gradient(circle 10px at calc(100% - var(--stub-w)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 10px at calc(100% - var(--stub-w)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
      mask:
        radial-gradient(circle 10px at calc(100% - var(--stub-w)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 10px at calc(100% - var(--stub-w)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
    }
  }

  @keyframes scan-sweep { 0%, 100% { top: 6%; } 50% { top: 90%; } }
  .scan-line { animation: scan-sweep 2.6s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .scan-line { animation: none; top: 50%; } }
`;

/* ============ HELPERS ============ */
const fmtDate = (d, month = 'long') => {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString('en-US', { day: 'numeric', month, year: 'numeric' });
};

const rupiah = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

const wrap = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

function barsFor(seed) {
  let s = (Number(seed) || 7) * 9301 + 49297;
  const bars = [];
  for (let i = 0; i < 26; i++) {
    s = (s * 9301 + 49297) % 233280;
    bars.push(1 + Math.floor((s / 233280) * 3));
  }
  return bars;
}

function Barcode({ seed, className = '' }) {
  const bars = barsFor(seed);
  return (
    <div className={`flex items-end gap-[2px] h-9 ${className}`} aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} className="bg-amber-950/80" style={{ width: `${w}px`, height: i % 4 === 0 ? '100%' : '78%' }} />
      ))}
    </div>
  );
}

function CountUp({ value, format = (n) => n.toLocaleString('en-US') }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const end = Number(value) || 0;
    if (reduce || !end) {
      setN(end);
      return undefined;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 1200, 1);
      setN(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(n)}
    </span>
  );
}

function Reveal({ children, delay = 0, className = '', y = 28 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ title, subtitle, dark = false, aside }) {
  return (
    <Reveal>
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <h2 className={`f-display text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] ${dark ? 'text-white' : 'text-amber-950'}`}>
            {title}
          </h2>
          {subtitle && <p className={`text-sm mt-2 max-w-md ${dark ? 'text-amber-200/70' : 'text-amber-800/80'}`}>{subtitle}</p>}
        </div>
        {aside}
      </div>
    </Reveal>
  );
}

function Field({ label, value, bold }) {
  return (
    <div>
      <p className="text-xs text-amber-700/80 mb-0.5">{label}</p>
      <p className={`text-sm text-amber-950 ${bold ? 'f-display font-semibold' : ''}`}>{value}</p>
    </div>
  );
}

/* Shared modal: locks scroll, closes on Esc and backdrop click */
function Modal({ onClose, label, className = 'max-w-md', children }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-ink-950/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className={`f-body relative w-full ${className}`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-ink-950/80 text-amber-100 flex items-center justify-center hover:bg-ink-950 transition-colors ${focusRingDark}`}
        >
          <Icon name="close" className="w-4 h-4" />
        </button>
        <div className="max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">{children}</div>
      </motion.div>
    </motion.div>
  );
}

/* ============ HERO: A TICKET THAT PRINTS ============ */
const FALLBACK_EVENT = {
  id: 0,
  name: 'Your next show',
  artist: 'Find it on TiketKu',
  city: 'Anywhere',
  nearest_date: null,
  min_price: null,
  category_name: 'Live',
};

function TicketFace({ concert }) {
  const date = fmtDate(concert.nearest_date, 'short');
  return (
    <div
      className="ticket-card bg-[#faf6ef] rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)]"
      style={{ '--stub-h': '5.5rem' }}
    >
      <div>
        <div className="relative h-44 bg-ink-900 overflow-hidden">
          {concert.poster ? (
            <img src={getImageUrl(concert.poster)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-400/50">
              <Icon name="music" className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-xs font-medium text-amber-800">
            {concert.category_name || 'Live'}
          </span>
        </div>
        <div className="p-5">
          <h3 className="f-display text-2xl font-semibold text-amber-950 leading-tight truncate">{concert.name}</h3>
          <p className="text-sm text-amber-700/80 truncate">{concert.artist}</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field label="Date" value={date || 'To be announced'} />
            <Field label="City" value={concert.city || '-'} />
          </div>
        </div>
      </div>
      <div className="px-5 flex items-center justify-between gap-4 border-t border-dashed border-amber-300 bg-amber-100/60">
        <div className="min-w-0">
          <p className="text-xs text-amber-700/80">Tickets from</p>
          <p className="f-display text-lg font-semibold text-amber-950 truncate">
            {concert.min_price ? rupiah(concert.min_price) : 'Soon'}
          </p>
        </div>
        <Barcode seed={concert.id} className="shrink-0" />
      </div>
    </div>
  );
}

/* Tilts with the cursor and catches a light sheen, like a laminated pass */
function TiltGlare({ children, className = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 160, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 160, damping: 18 });
  const gx = useTransform(x, [-0.5, 0.5], [0, 100]);
  const gy = useTransform(y, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.32), transparent 55%)`;

  const move = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className={`relative ${className}`}
    >
      {children}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-soft-light"
        />
      )}
    </motion.div>
  );
}

function PrintedTicket({ events, index, onPick, onHover }) {
  const reduce = useReducedMotion();
  const concert = events[index] || FALLBACK_EVENT;

  return (
    <div onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <TiltGlare className="w-full max-w-sm mx-auto drop-shadow-[0_24px_36px_rgba(0,0,0,0.45)]">
        {/* the slot the ticket comes out of */}
        <div className="relative z-10 mx-2 h-3.5 rounded-full bg-black/70" />
        <div className="overflow-hidden -mt-2 pb-1" style={{ minHeight: '26.5rem' }}>
          <AnimatePresence mode="wait" initial>
            <motion.div
              key={concert.id}
              initial={reduce ? false : { y: '-100%' }}
              animate={{ y: 0 }}
              exit={reduce ? undefined : { y: '100%' }}
              transition={{ duration: reduce ? 0 : 1.05, ease: EASE }}
            >
              <Link
                to={concert.id ? `/concerts/${concert.id}` : '/concerts'}
                className={`block rounded-2xl ${focusRingDark}`}
                aria-label={`Open ${concert.name}`}
              >
                <TicketFace concert={concert} />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </TiltGlare>

      {events.length > 1 && (
        <div className="flex justify-center gap-2 mt-6" role="group" aria-label="Choose an event to preview">
          {events.map((e, i) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onPick(i)}
              aria-label={`Show ${e.name}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${focusRingDark} ${i === index ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ MARQUEE THAT SPEEDS UP WHEN YOU SCROLL ============ */
function VelocityMarquee({ children, base = -2.5 }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = dir.current * base * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() + move);
  });

  return (
    <div className="overflow-hidden">
      <motion.div style={{ x }} className="flex w-max whitespace-nowrap">
        {children}
        {children}
      </motion.div>
    </div>
  );
}

function MarqueeBand({ events }) {
  const words = events.length
    ? events.map((e) => e.name)
    : ['Concerts', 'Festivals', 'Live shows', 'Stand-up', 'Theater'];
  const loop = [];
  while (loop.length < 8) loop.push(...words);

  const set = (
    <ul className="flex items-center shrink-0" aria-hidden="true">
      {loop.map((w, i) => (
        <li key={i} className="flex items-center gap-8 pr-8">
          <span className="f-display text-4xl md:text-6xl font-semibold text-amber-50">{w}</span>
          <Icon name="ticket" className="w-7 h-7 md:w-9 md:h-9 text-amber-300 shrink-0" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bg-amber-800 py-5 md:py-6" role="presentation">
      <span className="sr-only">Now on sale: {words.join(', ')}</span>
      <VelocityMarquee>{set}</VelocityMarquee>
    </div>
  );
}

/* ============ FEATURES: SMALL ANIMATIONS THAT SHOW THE POINT ============ */
const QR_CELLS = Array.from({ length: 49 }, (_, i) => {
  const r = Math.floor(i / 7);
  const c = i % 7;
  const finder = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
  return finder || (i * 37 + 11) % 5 < 3;
});

function QrVisual({ scan = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} className="relative w-28 h-28 mx-auto">
      <div className="grid grid-cols-7 gap-1 w-full h-full">
        {QR_CELLS.map((on, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.25, delay: i * 0.018, ease: EASE }}
            className={`rounded-[3px] ${on ? 'bg-amber-900' : 'bg-amber-200/60'}`}
          />
        ))}
      </div>
      {scan && (
        <>
          <span className="scan-line absolute -left-2 -right-2 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
          <motion.span
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 1.1, type: 'spring', stiffness: 300, damping: 16 }}
            className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white"
          >
            <Icon name="check" className="w-4 h-4" />
          </motion.span>
        </>
      )}
    </div>
  );
}

function ShieldVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <svg ref={ref} viewBox="0 0 48 48" className="w-28 h-28 mx-auto text-amber-800" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path d="M24 44s16-8 16-20V10L24 4 8 10v14c0 12 16 20 16 20z" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1, ease: 'easeInOut' }} />
      <motion.path d="M16 24l6 6 11-12" className="text-emerald-600" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 0.5, delay: 0.9 }} />
    </svg>
  );
}

function RingVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90" fill="none" strokeWidth="3" aria-hidden="true">
        <circle cx="24" cy="24" r="20" className="stroke-amber-200/70" />
        <motion.circle cx="24" cy="24" r="20" className="stroke-amber-700" strokeLinecap="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.1, ease: EASE }} />
      </svg>
      <motion.span
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 16 }}
        className="absolute inset-0 flex items-center justify-center text-amber-800"
      >
        <Icon name="zap" className="w-9 h-9" />
      </motion.span>
    </div>
  );
}

const FEATURES = [
  { title: 'Instant e-ticket', text: 'Your QR code is issued the moment payment clears.', visual: <QrVisual /> },
  { title: 'Scan and go', text: "Show the code, staff scan it, you're in.", visual: <QrVisual scan /> },
  { title: 'Secure payment', text: 'Pay through Xendit with the method you already use.', visual: <ShieldVisual /> },
  { title: 'Fast and easy', text: 'Buy in seconds, with no queue to stand in.', visual: <RingVisual /> },
];

/* ============ GALLERY: PINNED, SCROLLS SIDEWAYS ============ */
function ConcertModal({ item, onClose }) {
  const date = fmtDate(item.date || item.start_date || item.nearest_date);
  return (
    <Modal onClose={onClose} label={item.name} className="max-w-3xl">
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-900">
        {item.poster ? (
          <img src={getImageUrl(item.poster)} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-amber-400/50">
            <Icon name="music" className="w-14 h-14" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
      </div>
      <div className="p-7 md:p-9 -mt-10 relative">
        <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-xs font-medium text-amber-800 mb-3">
          {item.category_name || 'Event'}
        </span>
        <h3 className="f-display text-3xl md:text-4xl font-semibold text-amber-950 leading-tight">{item.name}</h3>
        {item.artist && <p className="text-amber-700/80 mt-1">{item.artist}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-7 pt-6 border-t border-dashed border-amber-300">
          {item.city && <Field label="City" value={item.city} />}
          {item.venue && <Field label="Venue" value={item.venue} />}
          {date && <Field label="Date" value={date} />}
          {item.time && <Field label="Time" value={item.time} />}
          {item.min_price && <Field label="Tickets from" value={rupiah(item.min_price)} bold />}
          {item.gate && <Field label="Gate" value={item.gate} />}
        </div>

        {item.description && (
          <div className="mt-7">
            <h4 className="f-display text-lg font-semibold text-amber-950 mb-2">About the event</h4>
            <p className="text-sm text-amber-900/80 leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-dashed border-amber-300">
          <Link
            to={`/concerts/${item.id}`}
            className={`group inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-semibold rounded-xl transition-colors ${focusRing}`}
          >
            Buy tickets
            <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            onClick={onClose}
            className={`px-6 py-3 text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200/70 rounded-xl transition-colors ${focusRing}`}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Gallery({ items = [] }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const dist = useMotionValue(0);
  const [distance, setDistance] = useState(0);
  const [selected, setSelected] = useState(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // Scroll distance comes from the real track width
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const measure = () => {
      const d = Math.max(0, el.scrollWidth - window.innerWidth);
      dist.set(d);
      setDistance(d);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [items, dist]);

  const x = useTransform([scrollYProgress, dist], ([p, d]) => -p * d);
  const imgX = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (!items.length) return null;

  return (
    <section ref={sectionRef} className="relative bg-[#f5ede4]" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 mb-8 w-full flex items-end justify-between gap-6">
          <div>
            <h2 className="f-display text-4xl md:text-5xl font-semibold text-amber-950 tracking-tight">On sale now</h2>
            <p className="text-sm text-amber-800/80 mt-2">Keep scrolling to move along. Tap a poster for the details.</p>
          </div>
          <Link
            to="/concerts"
            className={`group hidden sm:inline-flex items-center gap-2 text-sm font-medium text-amber-800 hover:text-amber-950 rounded ${focusRing}`}
          >
            All concerts
            <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-6 px-4 md:px-[max(1rem,calc((100vw-1280px)/2+1rem))] will-change-transform w-max py-2"
        >
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="shrink-0 w-[78vw] sm:w-[320px] md:w-[380px] drop-shadow-[0_6px_14px_rgba(69,26,3,0.14)] hover:drop-shadow-[0_14px_24px_rgba(69,26,3,0.24)] transition-[filter] duration-300"
            >
              <button
                type="button"
                onClick={() => setSelected(item)}
                aria-label={`Open details for ${item.name}`}
                style={{ '--stub-h': '4.75rem' }}
                className={`ticket-card group w-full h-[27rem] md:h-[30rem] grid grid-rows-[1fr_var(--stub-h)] bg-white rounded-2xl overflow-hidden text-left ${focusRing}`}
              >
                <span className="relative block overflow-hidden bg-ink-900">
                  {item.poster ? (
                    <motion.img
                      src={getImageUrl(item.poster)}
                      alt=""
                      loading="lazy"
                      style={{ x: imgX }}
                      className="absolute inset-y-0 left-0 w-[118%] max-w-none h-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-amber-400/50">
                      <Icon name="music" className="w-12 h-12" />
                    </span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-white/95 text-xs font-medium text-amber-800">
                    {item.category_name || 'Event'}
                  </span>
                  <span className="absolute top-4 right-4 f-display text-sm text-amber-100/90 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="absolute bottom-0 inset-x-0 p-5 block">
                    <span className="block f-display text-2xl font-semibold text-white leading-tight line-clamp-2">{item.name}</span>
                    <span className="block text-sm text-amber-200/80 mt-1 truncate">{item.artist}</span>
                  </span>
                </span>

                <span className="flex items-center justify-between gap-3 px-5 bg-amber-50 border-t border-dashed border-amber-300">
                  <span className="block min-w-0">
                    <span className="flex items-center gap-1.5 text-xs text-amber-700/80 truncate">
                      {item.city && (
                        <>
                          <Icon name="pin" className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.city}</span>
                        </>
                      )}
                    </span>
                    <span className="block f-display text-base font-semibold text-amber-950 tabular-nums truncate">
                      {item.min_price ? rupiah(item.min_price) : 'Coming soon'}
                    </span>
                  </span>
                  <span className="w-9 h-9 rounded-full bg-amber-800 group-hover:bg-amber-700 text-amber-50 flex items-center justify-center shrink-0 transition-colors">
                    <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </button>
            </div>
          ))}
          <div className="shrink-0 w-4" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 mt-8 w-full">
          <div className="h-0.5 bg-amber-900/15 relative rounded-full overflow-hidden">
            <motion.div style={{ width: progress }} className="absolute top-0 left-0 h-full bg-amber-700" />
          </div>
          <p className="text-xs text-amber-700/80 mt-2 tabular-nums">{items.length} events</p>
        </div>
      </div>

      <AnimatePresence>{selected && <ConcertModal item={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </section>
  );
}

/* ============ STEPS: TICKETS THAT STACK AS YOU SCROLL ============ */
const STEPS = [
  { title: 'Pick a concert', text: 'Search by artist, city or category and choose the show you want.', icon: 'music', tone: 'bg-white text-amber-950', stub: 'bg-amber-100 text-amber-800' },
  { title: 'Buy tickets', text: 'Choose a ticket category and pay with QRIS, virtual account or an e-wallet.', icon: 'ticket', tone: 'bg-amber-100 text-amber-950', stub: 'bg-amber-200 text-amber-900' },
  { title: 'Get your e-ticket', text: 'The QR code lands in your account the moment payment clears.', icon: 'check', tone: 'bg-amber-200 text-amber-950', stub: 'bg-amber-300 text-amber-950' },
  { title: 'Scan and enter', text: 'Show the QR code at the gate. Staff scan it and you walk in.', icon: 'zap', tone: 'bg-amber-800 text-amber-50', stub: 'bg-amber-950 text-amber-300' },
];

function StepCard({ step, i, n, progress }) {
  const target = 1 - (n - 1 - i) * 0.05;
  const scale = useTransform(progress, [i / n, 1], [1, target]);
  return (
    <div style={{ height: '58vh' }}>
      <div className="sticky" style={{ top: `${96 + i * 18}px` }}>
        <motion.div style={{ scale, transformOrigin: 'top center' }} className="drop-shadow-[0_10px_20px_rgba(69,26,3,0.16)]">
          <div className={`step-ticket grid sm:grid-cols-[1fr_var(--stub-w)] rounded-2xl overflow-hidden ${step.tone}`}>
            <div className="p-7 md:p-9 min-h-[11rem]">
              <p className="f-display text-6xl md:text-7xl font-semibold leading-none opacity-30 tabular-nums">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="f-display text-2xl md:text-3xl font-semibold mt-4">{step.title}</h3>
              <p className="text-sm md:text-base opacity-80 mt-2 max-w-md leading-relaxed">{step.text}</p>
            </div>
            <div className={`flex items-center justify-center py-5 sm:py-0 border-t sm:border-t-0 sm:border-l border-dashed border-current/30 ${step.stub}`}>
              <Icon name={step.icon} className="w-10 h-10" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StackedSteps() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  return (
    <div ref={ref}>
      {STEPS.map((s, i) => (
        <StepCard key={s.title} step={s} i={i} n={STEPS.length} progress={scrollYProgress} />
      ))}
    </div>
  );
}

/* ============ PROMOS ============ */
function discountLabel(type, value) {
  if (value === '' || value == null || Number.isNaN(Number(value))) return '-';
  return type === 'percentage' ? `${Number(value)}%` : `Rp${Number(value).toLocaleString('id-ID')}`;
}

function PromoTicket({ promo, featured = false, onClick, index = 0 }) {
  const label = discountLabel(promo.discount_type, promo.discount_value);
  const used = promo.used || 0;
  const quota = promo.quota || 0;
  const remaining = Math.max(0, quota - used);
  const pct = quota > 0 ? Math.min(Math.round((used / quota) * 100), 100) : 0;
  const until = fmtDate(promo.valid_until, 'short');

  return (
    <Reveal delay={index * 0.08} className="h-full">
      <div className="h-full drop-shadow-[0_6px_14px_rgba(69,26,3,0.16)] hover:drop-shadow-[0_14px_24px_rgba(69,26,3,0.26)] transition-[filter] duration-300">
        <button
          type="button"
          onClick={onClick}
          aria-label={`Promo ${promo.code}, details`}
          className={`promo-ticket ${featured ? 'is-featured' : ''} group w-full h-full text-left grid sm:grid-cols-[1fr_var(--stub-w)] bg-ink-950 rounded-2xl overflow-hidden ${focusRing}`}
        >
          <span className="flex flex-col justify-between gap-8 p-7 md:p-9">
            <span>
              <span className="inline-flex items-center gap-2 text-sm text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
              <span className={`block f-display font-semibold text-white leading-[1.1] mt-3 ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                {promo.description || 'A special promo, just for you'}
              </span>
              <span className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-sm text-amber-200/70">
                {until && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="calendar" className="w-3.5 h-3.5" />
                    until {until}
                  </span>
                )}
                {remaining > 0 && remaining <= 50 && (
                  <span className="inline-flex items-center gap-1.5 text-amber-300">
                    <Icon name="zap" className="w-3.5 h-3.5" />
                    {remaining} left
                  </span>
                )}
              </span>
            </span>
            <span className="flex items-center justify-between gap-4">
              <span className="px-4 py-2 rounded-lg border border-dashed border-amber-500/50 font-mono font-bold text-amber-400 tracking-widest text-sm">
                {promo.code}
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-amber-300/80 group-hover:text-amber-300 transition-colors">
                Details
                <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </span>
          </span>

          <span className="flex flex-col items-center justify-center text-center px-6 py-7 bg-amber-800 text-amber-50 border-t sm:border-t-0 sm:border-l border-dashed border-amber-400/50">
            <span className="text-sm text-amber-100/80">{promo.discount_type === 'percentage' ? 'Discount' : 'Off'}</span>
            <span className={`f-display font-bold leading-none mt-1 tabular-nums ${featured ? 'text-6xl' : 'text-5xl'}`}>{label}</span>
            <span className="block mt-5 w-28 h-1.5 rounded-full bg-amber-950/40 overflow-hidden">
              <span className="block h-full bg-amber-300" style={{ width: `${pct}%` }} />
            </span>
            <span className="text-xs text-amber-100/80 mt-2 tabular-nums">{used} / {quota} used</span>
          </span>
        </button>
      </div>
    </Reveal>
  );
}

function PromoModal({ promo, onClose }) {
  const [copied, setCopied] = useState(false);
  const label = discountLabel(promo.discount_type, promo.discount_value);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <Modal onClose={onClose} label="Promo details" className="max-w-md">
      <div className="bg-ink-950 px-7 pt-10 pb-9 text-center">
        <p className="text-sm text-amber-300/80">{promo.discount_type === 'percentage' ? 'Discount' : 'Off'}</p>
        <p className="f-display text-6xl font-bold text-amber-400 mt-1 leading-none tabular-nums">{label}</p>
      </div>
      <div className="border-t-2 border-dashed border-amber-300" />
      <div className="px-7 pt-7 pb-7">
        <div className="rounded-xl border border-dashed border-amber-300 p-4 text-center">
          <p className="text-xs text-amber-700/80 mb-1">Promo code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono font-bold text-2xl text-amber-950 tracking-wider">{promo.code}</span>
            <button
              onClick={handleCopy}
              aria-label="Copy code"
              className={`p-2 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors ${focusRing}`}
            >
              <Icon name={copied ? 'check' : 'copy'} className="w-4 h-4" />
            </button>
          </div>
          <p role="status" className="h-4 text-xs text-emerald-600 mt-1.5">{copied ? 'Code copied' : ''}</p>
        </div>

        {promo.description && <p className="text-sm text-amber-900/80 leading-relaxed text-center mt-5">{promo.description}</p>}

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-dashed border-amber-300">
          <Field label="Valid from" value={fmtDate(promo.valid_from) || '-'} />
          <Field label="Valid until" value={fmtDate(promo.valid_until) || '-'} />
          <Field label="Used" value={`${promo.used || 0} / ${promo.quota}`} />
          <Field label="Left" value={`${Math.max(0, (promo.quota || 0) - (promo.used || 0))} coupons`} bold />
        </div>

        <Link
          to="/concerts"
          onClick={onClose}
          className={`group mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-semibold rounded-xl transition-colors ${focusRing}`}
        >
          Use it on a concert
          <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Modal>
  );
}

function PromoSection() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/promos/active')
      .then((res) => {
        if (!mounted) return;
        const d = res.data;
        setPromos(Array.isArray(d) ? d : d?.data || []);
      })
      .catch(() => mounted && setPromos([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const [featured, ...rest] = promos;
  const others = rest.slice(0, 2);

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title="Promo codes" subtitle="Copy a code and use it at checkout." />

        {loading ? (
          <div className="space-y-6">
            <div className="h-72 rounded-2xl bg-ink-950/80 animate-pulse" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-56 rounded-2xl bg-ink-950/60 animate-pulse" />
              <div className="h-56 rounded-2xl bg-ink-950/60 animate-pulse" />
            </div>
          </div>
        ) : !featured ? (
          <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
            <h3 className="f-display text-xl font-semibold text-amber-950 mb-1">No active promos right now</h3>
            <p className="text-sm text-amber-800/80">New ones show up here as soon as they go live.</p>
          </div>
        ) : (
          <>
            <PromoTicket promo={featured} featured index={0} onClick={() => setSelected(featured)} />
            {others.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {others.map((p, i) => (
                  <PromoTicket key={p.id} promo={p} index={i + 1} onClick={() => setSelected(p)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>{selected && <PromoModal promo={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </section>
  );
}

/* ============ TESTIMONIALS ============ */
function Stars({ n, light }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${n} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" className={`w-4 h-4 ${i < n ? 'text-amber-500' : light ? 'text-amber-200' : 'text-white/15'}`} />
      ))}
    </div>
  );
}

function Testimonial({ t, main = false, index = 0 }) {
  const divider = main ? 'border-amber-300' : 'border-white/15';
  return (
    <Reveal delay={index * 0.08} className="h-full">
      <figure className={`h-full flex flex-col rounded-2xl ${main ? 'bg-[#faf6ef] p-8 md:p-11' : 'bg-white/5 p-6'}`}>
        <Stars n={t.rating} light={main} />
        <blockquote
          className={`f-display flex-1 mt-5 ${main ? 'text-2xl md:text-3xl leading-snug text-amber-950 font-medium' : 'text-base leading-relaxed text-amber-50/90'}`}
        >
          &ldquo;{t.text}&rdquo;
        </blockquote>

        {t.concert && (
          <Link to={`/concerts/${t.concert.id}`} className={`group/c mt-6 flex items-center gap-3 pt-5 border-t border-dashed ${divider}`}>
            {t.concert.poster && (
              <img src={getImageUrl(t.concert.poster)} alt="" loading="lazy" className="w-10 h-10 rounded-md object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-xs ${main ? 'text-amber-700/80' : 'text-amber-300/70'}`}>Went to</p>
              <p className={`text-sm font-medium truncate transition-colors ${main ? 'text-amber-950 group-hover/c:text-amber-700' : 'text-white group-hover/c:text-amber-400'}`}>
                {t.concert.name}
              </p>
            </div>
            <Icon name="arrow" className={`w-4 h-4 shrink-0 transition-transform group-hover/c:translate-x-0.5 ${main ? 'text-amber-600' : 'text-amber-400/70'}`} />
          </Link>
        )}

        <figcaption className={`flex items-center gap-3 pt-5 ${t.concert ? '' : `mt-6 border-t border-dashed ${divider}`}`}>
          <span className="w-9 h-9 rounded-full bg-amber-800 text-amber-50 flex items-center justify-center f-display text-sm font-semibold shrink-0">
            {t.initials}
          </span>
          <span className="min-w-0 block">
            <span className={`block text-sm font-semibold truncate ${main ? 'text-amber-950' : 'text-white'}`}>{t.name}</span>
            <span className={`block text-xs truncate ${main ? 'text-amber-700/80' : 'text-amber-300/70'}`}>{t.role}</span>
          </span>
        </figcaption>
      </figure>
    </Reveal>
  );
}

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get('/testimonials', { params: { limit: 6 } })
      .then((res) => {
        if (!mounted) return;
        setTestimonials(
          (res.data || []).map((t, idx) => ({
            id: t.id ?? idx,
            name: t.name || 'Anonymous',
            role: t.role || 'Attendee',
            text: t.text || '',
            rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
            initials: t.initials || getInitials(t.name || ''),
            concert: t.concert || null,
          }))
        );
      })
      .catch((err) => console.error('Failed to load testimonials:', err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const [main, ...rest] = testimonials;
  const side = rest.slice(0, 2);
  const more = rest.slice(2, 5);

  return (
    <section className="px-3 sm:px-4 py-4">
      <div className="max-w-7xl mx-auto bg-ink-950 rounded-[2rem] px-5 sm:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionTitle dark title="What fans say" subtitle="Real words from people who bought a ticket and showed up." />

          {loading ? (
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 h-80 rounded-2xl bg-white/5 animate-pulse" />
              <div className="lg:col-span-5 grid gap-6">
                <div className="h-36 rounded-2xl bg-white/5 animate-pulse" />
                <div className="h-36 rounded-2xl bg-white/5 animate-pulse" />
              </div>
            </div>
          ) : !main ? (
            <p className="text-sm text-amber-200/70">No testimonials yet. Be the first to leave one after a show.</p>
          ) : (
            <>
              <div className="grid lg:grid-cols-12 gap-6">
                <div className={side.length ? 'lg:col-span-7' : 'lg:col-span-12'}>
                  <Testimonial t={main} main />
                </div>
                {side.length > 0 && (
                  <div className="lg:col-span-5 grid gap-6 content-start">
                    {side.map((t, i) => (
                      <Testimonial key={t.id} t={t} index={i + 1} />
                    ))}
                  </div>
                )}
              </div>
              {more.length > 0 && (
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  {more.map((t, i) => (
                    <Testimonial key={t.id} t={t} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============ CTA: THE STUB TEARS OFF ============ */
function TearCTA({ user }) {
  const reduce = useReducedMotion();
  const ctaTo = user ? '/' : '/register';
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto relative flex flex-col md:flex-row drop-shadow-[0_14px_28px_rgba(69,26,3,0.22)]">
        <div className="flex-1 bg-ink-950 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl p-10 md:p-14">
          <h2 className="f-display text-4xl md:text-6xl font-semibold text-white leading-[1.02] tracking-tight">
            Your seat is waiting.
          </h2>
          <p className="text-amber-200/70 mt-5 max-w-sm leading-relaxed">
            Register for free and find your next show. It takes less time than the queue would.
          </p>
        </div>

        <motion.div
          initial={{ x: 0, y: 0, rotate: 0 }}
          whileInView={reduce ? undefined : { x: 10, y: 8, rotate: 2.5 }}
          viewport={{ once: true, margin: '-140px' }}
          transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
          className="relative bg-amber-800 rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl md:w-72 p-10 flex flex-col items-center justify-center text-center gap-3 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-amber-400/60"
        >
          <span className="hidden md:block absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#f5ede4]" aria-hidden="true" />
          <span className="hidden md:block absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-[#f5ede4]" aria-hidden="true" />
          <Link
            to={ctaTo}
            className={`group inline-flex items-center gap-2 px-7 py-3.5 bg-amber-50 hover:bg-white text-amber-950 text-sm font-semibold rounded-xl transition-colors ${focusRingDark}`}
          >
            {user ? 'Explore events' : 'Register free'}
            <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <span className="text-xs text-amber-100/80">{user ? 'New shows are added often' : 'No fee to join'}</span>
        </motion.div>
      </div>
    </section>
  );
}

/* ============ FOOTER + NEWSLETTER ============ */
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const reset = () => {
    setStatus('idle');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    setMessage('');

    try {
      const baseURL = (api.defaults?.baseURL || '').replace(/\/$/, '');
      const res = await fetch(`${baseURL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to subscribe.');

      setStatus('success');
      setMessage(data?.message || 'Check your inbox to confirm.');
      setEmail('');
      setTimeout(reset, 4000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || "Couldn't subscribe. Please try again.");
      setTimeout(reset, 4000);
    }
  };

  const isDone = status === 'success';
  const isLoading = status === 'loading';
  const isError = status === 'error';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <label htmlFor="newsletter-email" className="text-sm font-medium text-amber-300">
        Get show alerts and promo codes
      </label>

      <div className="mt-3 flex flex-col sm:flex-row gap-3">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isDone || isLoading}
          placeholder="you@example.com"
          className={`flex-1 px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-amber-200/40 text-sm focus:outline-none transition-colors disabled:opacity-50 ${
            isError ? 'border-red-500/60 focus:border-red-400' : 'border-white/15 focus:border-amber-400/70'
          }`}
        />
        <button
          type="submit"
          disabled={isDone || isLoading}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-700 hover:bg-amber-600 text-amber-50 text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap min-w-[9rem] ${focusRingDark}`}
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending…
            </>
          ) : isDone ? (
            <>
              <Icon name="check" className="w-4 h-4" />
              Subscribed
            </>
          ) : (
            <>
              Subscribe
              <Icon name="arrow" className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <p role="status" aria-live="polite" className={`text-xs mt-3 min-h-[1rem] ${isError ? 'text-red-400' : isDone ? 'text-emerald-400' : 'text-amber-300/70'}`}>
        {message || (isDone ? 'Check your inbox to confirm.' : 'Concert news, promos and presale access. No spam.')}
      </p>
    </form>
  );
}

function Footer({ user }) {
  const link = `text-sm text-amber-300/70 hover:text-amber-200 rounded transition-colors ${focusRingDark}`;
  return (
    <footer className="bg-ink-950 mt-8 pt-16 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 pb-12 border-b border-dashed border-amber-500/25">
          <div>
            <Link to="/" className={`inline-flex items-center gap-2.5 rounded-lg ${focusRingDark}`}>
              <span className="w-9 h-9 rounded-full ring-2 ring-amber-400/70 flex items-center justify-center text-amber-300">
                <Icon name="ticket" className="w-4 h-4" />
              </span>
              <span className="f-display text-2xl font-bold text-amber-50">
                tiket<span className="text-amber-400">ku</span>
              </span>
            </Link>
            <p className="f-display text-3xl md:text-4xl font-semibold text-white leading-tight mt-6 max-w-sm">
              Don't miss the next show.
            </p>
          </div>
          <div className="w-full flex md:justify-end">
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-5 pt-8">
          <nav className="flex items-center gap-8" aria-label="Footer">
            <Link to="/concerts" className={link}>Concerts</Link>
            <Link to="/promos" className={link}>Promos</Link>
            <Link to="/contact" className={link}>Contact</Link>
            {!user && <Link to="/register" className={link}>Register</Link>}
          </nav>
          <p className="text-xs text-amber-300/60">© {new Date().getFullYear()} TiketKu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ============ MAIN ============ */
export default function LandingPage() {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [concerts, setConcerts] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  useEffect(() => {
    api
      .get('/concerts')
      .then((res) => setConcerts(res.data))
      .catch(() => {});
  }, []);

  const heroEvents = concerts.slice(0, 4);
  const galleryItems = concerts.slice(0, 8);

  // The hero ticket moves on to the next event every few seconds
  useEffect(() => {
    if (reduce || heroPaused || heroEvents.length < 2) return undefined;
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % heroEvents.length), 6500);
    return () => clearInterval(id);
  }, [reduce, heroPaused, heroEvents.length]);

  const activeHero = heroEvents[heroIndex];

  // Numbers come from the real event list, nothing made up
  const cityCount = new Set(concerts.map((c) => c.city).filter(Boolean)).size;
  const prices = concerts.map((c) => Number(c.min_price)).filter((n) => n > 0);
  const cheapest = prices.length ? Math.min(...prices) : 0;

  const ctaTo = user ? '/concerts' : '/register';

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      {/* overflow-x-clip (not hidden) so the sticky sections keep working */}
      <div className="f-body min-h-screen bg-[#f5ede4] relative overflow-x-clip">
        {/* ===== HERO ===== */}
        <section className="relative min-h-[100svh] flex items-center px-4 pt-28 pb-20 bg-ink-950 overflow-hidden">
          <AnimatePresence>
            {activeHero?.poster && (
              <motion.img
                key={activeHero.id}
                src={getImageUrl(activeHero.poster)}
                alt=""
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.28 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/70" aria-hidden="true" />

          <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-amber-300"
              >
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                {concerts.length > 0 ? `${concerts.length} ${concerts.length === 1 ? 'event' : 'events'} on sale now` : 'Digital concert tickets'}
              </motion.p>

              <h1 className="f-display text-5xl sm:text-6xl xl:text-8xl font-semibold text-white leading-[0.98] tracking-tight">
                <span className="block overflow-hidden pb-2">
                  <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: EASE }}>
                    Be there when
                  </motion.span>
                </span>
                <span className="block overflow-hidden pb-2">
                  <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: EASE }}>
                    the{' '}
                    <motion.span
                      className="text-amber-400"
                      animate={reduce ? undefined : { opacity: [1, 0.3, 1, 0.55, 1] }}
                      transition={{ duration: 2.2, delay: 1.3, times: [0, 0.15, 0.3, 0.45, 1] }}
                    >
                      lights
                    </motion.span>{' '}
                    go down.
                  </motion.span>
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.6 }}
                className="text-amber-200/70 text-base md:text-lg max-w-md mt-6 leading-relaxed"
              >
                Browse concerts and festivals, pay with QRIS, a virtual account or an e-wallet, and walk in with the QR code on your phone.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-8"
              >
                <Link
                  to={ctaTo}
                  className={`group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-700 hover:bg-amber-600 text-amber-50 text-sm font-semibold rounded-xl transition-colors ${focusRingDark}`}
                >
                  {user ? 'Explore events' : 'Register free'}
                  <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/concerts"
                  className={`inline-flex items-center gap-2 text-sm font-medium text-amber-100 hover:text-amber-400 transition-colors rounded ${focusRingDark}`}
                >
                  <span className="border-b border-amber-400/40 hover:border-amber-400 pb-0.5">Browse concerts</span>
                </Link>
              </motion.div>

              {concerts.length > 0 && (
                <motion.dl
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.25, duration: 0.6 }}
                  className="flex flex-wrap gap-x-10 gap-y-4 mt-12 pt-7 border-t border-dashed border-amber-500/25"
                >
                  <div>
                    <dt className="text-xs text-amber-300/70">Events</dt>
                    <dd className="f-display text-3xl font-semibold text-amber-300"><CountUp value={concerts.length} /></dd>
                  </div>
                  {cityCount > 0 && (
                    <div>
                      <dt className="text-xs text-amber-300/70">Cities</dt>
                      <dd className="f-display text-3xl font-semibold text-amber-300"><CountUp value={cityCount} /></dd>
                    </div>
                  )}
                  {cheapest > 0 && (
                    <div>
                      <dt className="text-xs text-amber-300/70">Tickets from</dt>
                      <dd className="f-display text-3xl font-semibold text-amber-300"><CountUp value={cheapest} format={rupiah} /></dd>
                    </div>
                  )}
                </motion.dl>
              )}
            </div>

            <div className="hidden lg:block">
              <PrintedTicket events={heroEvents} index={heroIndex} onPick={setHeroIndex} onHover={setHeroPaused} />
            </div>
          </div>
        </section>

        <MarqueeBand events={heroEvents.length ? concerts.slice(0, 8) : []} />

        {/* ===== FEATURES ===== */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16">
            <div className="lg:sticky lg:top-28 self-start">
              <Reveal>
                <h2 className="f-display text-4xl md:text-5xl font-semibold text-amber-950 tracking-tight leading-[1.05]">
                  Built for the walk to the gate
                </h2>
                <p className="text-amber-800/80 mt-5 leading-relaxed max-w-xs">
                  Payment, ticket and entry all happen on your phone, so there is nothing to print and nothing to forget.
                </p>
              </Reveal>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={(i % 2) * 0.1} className={i % 2 === 1 ? 'sm:mt-10' : ''}>
                  <div className="h-full bg-white rounded-2xl p-6 shadow-sm shadow-amber-950/5">
                    <div className="h-36 flex items-center justify-center rounded-xl bg-amber-50 mb-5">{f.visual}</div>
                    <h3 className="f-display text-xl font-semibold text-amber-950">{f.title}</h3>
                    <p className="text-sm text-amber-800/80 mt-1.5 leading-relaxed">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GALLERY ===== */}
        <Gallery items={galleryItems} />

        {/* ===== STEPS ===== */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.7fr_1.3fr] gap-10 lg:gap-16">
            <div className="lg:sticky lg:top-28 self-start">
              <Reveal>
                <h2 className="f-display text-4xl md:text-5xl font-semibold text-amber-950 tracking-tight leading-[1.05]">
                  Four steps to your seat
                </h2>
                <p className="text-amber-800/80 mt-5 leading-relaxed max-w-xs">Keep scrolling. Each ticket stacks on the last, just like your next night out.</p>
              </Reveal>
            </div>
            <StackedSteps />
          </div>
        </section>

        {/* ===== PROMOS ===== */}
        <PromoSection />

        {/* ===== TESTIMONIALS ===== */}
        <Testimonials />

        {/* ===== CTA ===== */}
        <TearCTA user={user} />

        <Footer user={user} />
      </div>
    </MotionConfig>
  );
}