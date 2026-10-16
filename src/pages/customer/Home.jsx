import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';
import { getImageUrl } from '../../utils/image';

/* ============ ICONS ============ */
const ICON_PATHS = {
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  ticket: 'M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  flame: 'M12 23c-4.97 0-9-3.582-9-8 0-4.418 4.03-8.259 6.5-10.5C10.5 3.5 12 1 12 1s1.5 2.5 2.5 3.5C16.97 6.741 21 10.582 21 15c0 4.418-4.03 8-9 8z',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
  arrow: 'M13 7l5 5-5 5M6 12h12',
  close: 'M6 18L18 6M6 6l12 12',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  instagram: 'M16 3H8a5 5 0 00-5 5v8a5 5 0 005 5h8a5 5 0 005-5V8a5 5 0 00-5-5zM12 16a4 4 0 110-8 4 4 0 010 8zM17.5 6.5h.01',
  bolt: 'M13 2L3 14h7v8l10-12h-7V2z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z',
  wallet: 'M3 7a2 2 0 012-2h13a2 2 0 012 2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2zM17 13h.01',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
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
const focusRingInset =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/70';
const focusRingDark =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70';

const ticketShadow =
  'rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_10px_20px_rgba(69,26,3,0.18)] transition-[filter] duration-200';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  /* Tiket dengan stub di bawah */
  .ticket-card {
    --stub-h: 4.5rem;
    -webkit-mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }

  /* Panel pencarian: tombol cari jadi stub di kanan (sm ke atas) */
  @media (min-width: 640px) {
    .search-pass {
      --stub-w: 9.5rem;
      -webkit-mask:
        radial-gradient(circle 9px at calc(100% - var(--stub-w)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 9px at calc(100% - var(--stub-w)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
      mask:
        radial-gradient(circle 9px at calc(100% - var(--stub-w)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 9px at calc(100% - var(--stub-w)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
    }
  }

  /* Papan jadwal berjalan */
  @keyframes ticker-scroll { to { transform: translateX(-50%); } }
  .ticker-track { animation: ticker-scroll 55s linear infinite; }
  .ticker:hover .ticker-track, .ticker:focus-within .ticker-track { animation-play-state: paused; }
  @media (prefers-reduced-motion: reduce) { .ticker-track { animation: none; } }
`;

const EASE = [0.22, 1, 0.36, 1];

const FAQS = [
  {
    q: 'How do I get my e-ticket?',
    a: 'E-tickets will be sent to your email after payment is successful. You can also view them on the My Tickets page.',
  },
  {
    q: 'Are tickets refundable?',
    a: 'Tickets are non-refundable, unless the event is cancelled by the organizer.',
  },
  {
    q: 'What payment methods are available?',
    a: 'We support Virtual Account, QRIS, e-wallets (GoPay, OVO, Dana, ShopeePay), and credit cards through Xendit.',
  },
  {
    q: 'Is there a student discount?',
    a: 'Some events offer special ticket categories with lower prices. Check the event page for details.',
  },
  {
    q: 'How do I change my ticket date?',
    a: 'Contact our customer support through the Contact page for schedule changes (if allowed by the organizer).',
  },
  {
    q: 'What do I need to bring when entering the venue?',
    a: 'Simply show your e-ticket (QR code) at the entrance. Some venues also require a valid ID for verification.',
  },
];

const STEPS = [
  { title: 'Choose an event', description: 'Pick the concert, festival, or theater show you want to watch.' },
  { title: 'Choose your tickets', description: 'Select the ticket category, schedule, and quantity you need.' },
  { title: 'Pay and go', description: 'Pay with VA, QRIS, or your favorite e-wallet. Your e-ticket arrives instantly.' },
];

const FOOTER_LINKS = [
  { label: 'Promos & vouchers', to: '/promos' },
  { label: 'My tickets', to: '/my-orders' },
  { label: 'About us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

/* ============ HOOKS & MOTION HELPERS ============ */

/* Angka naik saat terlihat. Sesuai pengaturan reduced motion, langsung ke nilai akhir. */
function AnimatedValue({ value, format = (n) => n.toLocaleString('en-US'), duration = 1.2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = Number(value) || 0;
    if (!inView) return undefined;
    if (reduce || !end) {
      setDisplay(end);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(display)}
    </span>
  );
}

/* Kartu miring mengikuti kursor (tidak aktif untuk reduced motion) */
function TiltCard({ children, className = '', max = 5 }) {
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
  function handleLeave() {
    x.set(0);
    y.set(0);
  }

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

/* Judul muncul kata demi kata */
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

function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="f-display text-3xl md:text-4xl font-semibold text-amber-950 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-amber-700/80 mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ============ HERO: POSTER FAN ============ */
const FAN = [
  { rotate: -10, x: -118, y: 34, depth: 16 },
  { rotate: 7, x: 96, y: 8, depth: -12 },
  { rotate: -2, x: -6, y: -16, depth: 6 },
];

function FanCard({ concert, slot, mx, my, delay }) {
  const px = useTransform(mx, [-1, 1], [-slot.depth, slot.depth]);
  const py = useTransform(my, [-1, 1], [-slot.depth * 0.6, slot.depth * 0.6]);

  return (
    <motion.div style={{ x: px, y: py }} className="absolute left-1/2 top-1/2 -ml-[6.5rem] -mt-[10rem] w-52">
      <motion.div
        initial={{ opacity: 0, y: 140, rotate: 0, x: 0 }}
        animate={{ opacity: 1, y: slot.y, rotate: slot.rotate, x: slot.x }}
        transition={{ type: 'spring', stiffness: 90, damping: 16, delay }}
        whileHover={{ y: slot.y - 10, rotate: slot.rotate * 0.6, transition: { duration: 0.2 } }}
      >
        <Link
          to={`/concerts/${concert.id}`}
          aria-label={concert.name}
          className={`block rounded-lg bg-[#faf6ef] p-2 pb-9 shadow-2xl shadow-black/50 ${focusRingDark}`}
        >
          <span className="block aspect-[3/4] rounded bg-ink-900 overflow-hidden">
            {concert.poster ? (
              <img src={getImageUrl(concert.poster)} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-amber-400/60">
                <Icon name="music" className="w-10 h-10" />
              </span>
            )}
          </span>
          <span className="absolute bottom-2.5 left-3 right-3 f-display text-xs font-semibold text-amber-950 truncate">
            {concert.name}
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function PosterFan({ concerts, mx, my }) {
  if (!concerts.length) return null;
  const list = concerts.slice(0, 3);
  // Yang pertama paling depan, jadi digambar paling akhir
  const order = [...list.keys()].reverse();
  return (
    <div className="hidden lg:block relative h-[27rem]" aria-label="Featured events">
      {order.map((i, n) => (
        <FanCard key={list[i].id} concert={list[i]} slot={FAN[i]} mx={mx} my={my} delay={0.9 + n * 0.12} />
      ))}
    </div>
  );
}

/* ============ PAPAN JADWAL ============ */
function EventTicker({ concerts }) {
  const items = concerts.slice(0, 8);
  if (items.length === 0) return null;

  return (
    <div className="ticker relative overflow-hidden bg-amber-800 border-y border-amber-600/30" aria-label="Now on sale">
      <div className="ticker-track flex w-max">
        {[0, 1].map((rep) => (
          <ul key={rep} className="flex items-center shrink-0" aria-hidden={rep === 1}>
            {items.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/concerts/${c.id}`}
                  tabIndex={rep === 1 ? -1 : 0}
                  className={`flex items-center gap-2.5 px-6 py-2.5 text-sm text-amber-100/90 hover:text-white whitespace-nowrap transition-colors ${focusRingDark}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300" aria-hidden="true" />
                  <span className="f-display font-semibold">{c.name}</span>
                  {c.city && <span className="text-amber-200/70">{c.city}</span>}
                  {c.nearest_date && <span className="text-amber-200/70 tabular-nums">{formatDate(c.nearest_date)}</span>}
                  {c.min_price ? (
                    <span className="text-amber-200 tabular-nums">from {formatRupiah(c.min_price)}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ============ KARTU & BARIS EVENT ============ */
function EventTicket({ concert, featured = false }) {
  return (
    <TiltCard className="min-w-0">
      <div className={ticketShadow}>
        <Link
          to={`/concerts/${concert.id}`}
          className={`ticket-card group h-full grid grid-rows-[1fr_var(--stub-h)] bg-white rounded-2xl overflow-hidden ${focusRingInset}`}
        >
          <span className="block">
            <span className={`relative block overflow-hidden bg-ink-900 ${featured ? 'h-64' : 'h-44'}`}>
              {concert.poster ? (
                <img
                  src={getImageUrl(concert.poster)}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200/70 text-amber-400">
                  <Icon name="ticket" className="w-10 h-10" />
                </span>
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent" />
              {concert.category_name && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-xs font-medium text-amber-800">
                  {concert.category_name}
                </span>
              )}
              {Number(concert.avg_rating) > 0 && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-ink-950/70 text-xs text-amber-100 tabular-nums">
                  <Icon name="star" className="w-3 h-3 text-amber-400" />
                  {Number(concert.avg_rating)}
                </span>
              )}
            </span>

            <span className="block p-4">
              <span className={`block f-display font-semibold text-amber-950 leading-snug ${featured ? 'text-xl' : 'text-lg'} truncate`}>
                {concert.name}
              </span>
              <span className="block text-sm text-amber-700/80 truncate">{concert.artist}</span>
              <span className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-amber-800/80">
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <Icon name="pin" className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{concert.city || '-'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="calendar" className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {concert.nearest_date ? formatDate(concert.nearest_date) : 'TBA'}
                </span>
              </span>
            </span>
          </span>

          <span className="flex items-center justify-between gap-3 px-4 bg-amber-50 border-t border-dashed border-amber-300/80">
            <span className="block min-w-0">
              <span className="block text-xs text-amber-700/80">Tickets from</span>
              <span className="block f-display text-base font-semibold text-amber-950 truncate">
                {concert.min_price ? <AnimatedValue value={concert.min_price} format={formatRupiah} /> : 'Coming soon'}
              </span>
            </span>
            <span className="w-9 h-9 rounded-full bg-amber-800 group-hover:bg-amber-700 text-amber-50 flex items-center justify-center shrink-0 transition-colors">
              <Icon name="arrow" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" />
            </span>
          </span>
        </Link>
      </div>
    </TiltCard>
  );
}

function EventRow({ concert, index }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: Math.min(0.03 * (index % 8), 0.2) }}
    >
      <Link
        to={`/concerts/${concert.id}`}
        className={`group flex items-center gap-4 md:gap-6 py-4 px-3 -mx-3 rounded-xl hover:bg-white/60 transition-colors ${focusRing}`}
      >
        <span className="hidden sm:block f-display text-sm text-amber-500/70 w-7 shrink-0 tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-ink-800 shrink-0">
          {concert.poster ? (
            <img
              src={getImageUrl(concert.poster)}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-amber-400/60">
              <Icon name="music" className="w-6 h-6" />
            </span>
          )}
        </span>

        <span className="flex-1 min-w-0">
          <span className="block f-display font-semibold text-amber-950 group-hover:text-amber-700 transition-colors truncate">
            {concert.name}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-amber-700/80">
            <span className="truncate">{concert.artist}</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <Icon name="pin" className="w-3 h-3" />
              {concert.city || '-'}
            </span>
            <span className="hidden md:inline-flex items-center gap-1">
              <Icon name="calendar" className="w-3 h-3" />
              {concert.nearest_date ? formatDate(concert.nearest_date) : 'TBA'}
            </span>
          </span>
        </span>

        <span className="text-right shrink-0">
          <span className="block f-display text-sm font-semibold text-amber-800 tabular-nums">
            {concert.min_price ? formatRupiah(concert.min_price) : 'Coming soon'}
          </span>
          {Number(concert.avg_rating) > 0 && (
            <span className="inline-flex items-center gap-1 justify-end text-xs text-amber-600/80 mt-0.5 tabular-nums">
              <Icon name="star" className="w-3 h-3" />
              {Number(concert.avg_rating)}
            </span>
          )}
        </span>

        <Icon
          name="arrow"
          className="hidden sm:block w-4 h-4 text-amber-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all motion-reduce:transition-none shrink-0"
        />
      </Link>
    </motion.li>
  );
}

function SkeletonTicket() {
  return (
    <div className="rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] animate-pulse">
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="h-44 bg-amber-100" />
        <div className="p-4 space-y-2.5">
          <div className="h-5 bg-amber-100 rounded w-3/4" />
          <div className="h-3 bg-amber-100 rounded w-1/2" />
          <div className="h-3 bg-amber-100 rounded w-2/3" />
        </div>
        <div className="h-[4.5rem] bg-amber-50 border-t border-dashed border-amber-300/80" />
      </div>
    </div>
  );
}

/* ============ LANGKAH & KEUNGGULAN ============ */
function HowItWorks() {
  return (
    <ol className="relative grid md:grid-cols-3 gap-8 md:gap-10">
      {/* Garis putus-putus yang tergambar saat masuk layar */}
      <motion.div
        aria-hidden="true"
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
        className="hidden md:block absolute top-5 left-[8%] right-[8%] border-t-2 border-dashed border-amber-400/70"
      />
      {STEPS.map((step, i) => (
        <motion.li
          key={step.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.15 * i, ease: EASE }}
          className="relative"
        >
          <span className="relative z-10 w-10 h-10 rounded-full bg-amber-800 text-amber-50 flex items-center justify-center f-display font-semibold tabular-nums ring-8 ring-[#f5ede4]">
            {i + 1}
          </span>
          <h3 className="f-display text-xl font-semibold text-amber-950 mt-4 mb-1.5">{step.title}</h3>
          <p className="text-sm text-amber-800/80 leading-relaxed max-w-xs">{step.description}</p>
        </motion.li>
      ))}
    </ol>
  );
}

const TILE = {
  light: { box: 'bg-white text-amber-950', sub: 'text-amber-800/80', icon: 'text-amber-500' },
  amber: { box: 'bg-amber-700 text-amber-50', sub: 'text-amber-100/80', icon: 'text-amber-200' },
  dark: { box: 'bg-ink-950 text-amber-100', sub: 'text-amber-200/70', icon: 'text-amber-400' },
};

function WhyTile({ variant = 'light', big, label, text, icon, className = '', delay = 0 }) {
  const t = TILE[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      className={`${t.box} ${className} rounded-2xl p-6 flex flex-col justify-between min-h-[10rem] shadow-sm shadow-amber-950/5`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="f-display text-4xl md:text-5xl font-semibold leading-none tracking-tight">{big}</p>
        <Icon name={icon} className={`w-5 h-5 shrink-0 ${t.icon}`} />
      </div>
      <div className="mt-6">
        <p className="text-sm font-semibold">{label}</p>
        <p className={`text-sm leading-relaxed mt-1 ${t.sub}`}>{text}</p>
      </div>
    </motion.div>
  );
}

function FaqItem({ question, answer, open, onToggle, id }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-colors shadow-sm shadow-amber-950/5 ${
        open ? 'bg-amber-50 ring-1 ring-amber-300' : 'bg-white'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-button`}
        className={`w-full flex items-center justify-between gap-3 p-4 text-left rounded-2xl ${focusRingInset}`}
      >
        <span className="flex-1 f-display font-semibold text-amber-950">{question}</span>
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            open ? 'bg-amber-700 text-amber-50' : 'bg-amber-100 text-amber-700'
          }`}
        >
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
const PAGE_SIZE = 8;

export default function Home() {
  const [concerts, setConcerts] = useState([]);
  const [heroConcerts, setHeroConcerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [emailSub, setEmailSub] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');

  const requestRef = useRef(0);

  /* ----- Parallax hero ----- */
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  /* ----- Kursor di hero menggerakkan poster ----- */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mx = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const my = useSpring(mouseY, { stiffness: 60, damping: 18 });

  function handleHeroMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  }

  /* ----- Data ----- */
  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/banners').then((res) => setBanners(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCity(city), 500);
    return () => clearTimeout(timer);
  }, [city]);

  const fetchConcerts = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryId) params.category_id = categoryId;
      if (debouncedCity) params.city = debouncedCity;
      const res = await api.get('/concerts', { params });
      if (requestId !== requestRef.current) return; // ada permintaan yang lebih baru
      setConcerts(res.data);
      setVisibleCount(PAGE_SIZE);
      // Poster hero dan papan jadwal diambil dari daftar penuh, supaya tidak berganti saat mengetik
      if (!params.search && !params.category_id && !params.city) {
        setHeroConcerts((prev) => (prev.length ? prev : res.data));
      }
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error(err);
      setError("Couldn't load events. Please try again.");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [debouncedSearch, categoryId, debouncedCity]);

  useEffect(() => {
    fetchConcerts();
  }, [fetchConcerts]);

  function handleSearch(e) {
    e.preventDefault();
    if (search === debouncedSearch && city === debouncedCity) {
      fetchConcerts();
    } else {
      setDebouncedSearch(search);
      setDebouncedCity(city);
    }
  }

  function clearFilters() {
    setSearch('');
    setCity('');
    setCategoryId('');
    setDebouncedSearch('');
    setDebouncedCity('');
  }

  /* ----- Turunan ----- */
  const activeCategory = categories.find((c) => String(c.id) === String(categoryId));
  const hasActiveFilters = !!(debouncedSearch || debouncedCity || categoryId);
  const isSearching = search !== debouncedSearch || city !== debouncedCity;
  const featuredList = concerts.slice(0, 3);
  const restEvents = concerts.slice(3);
  const shownRest = restEvents.slice(0, visibleCount);
  const bannerUrl = banners[currentBanner]?.image_url || '';
  const onSaleCount = heroConcerts.length;

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        {/* ===== HERO ===== */}
        <div
          ref={heroRef}
          onMouseMove={handleHeroMove}
          className="relative h-[500px] md:h-[580px] bg-ink-950 overflow-hidden"
        >
          <motion.div style={{ y: heroY, scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
            <AnimatePresence mode="wait">
              {bannerUrl ? (
                <motion.div
                  key={bannerUrl}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: EASE }}
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('${bannerUrl}')` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950" />
              )}
            </AnimatePresence>
          </motion.div>

          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
            aria-hidden="true"
          />
          <div className="absolute -right-32 -top-24 w-[32rem] h-[32rem] rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/60" aria-hidden="true" />

          <div className="relative h-full max-w-7xl mx-auto px-4 pt-12 md:pt-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 mb-5 border border-amber-500/25 rounded-full px-3.5 py-1"
              >
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                </span>
                <span className="text-xs font-medium text-amber-300 tabular-nums">
                  {onSaleCount > 0 ? `${onSaleCount} events on sale now` : 'Live events'}
                </span>
              </motion.div>

              <h1 className="f-display text-5xl md:text-7xl font-semibold text-white leading-[0.95] tracking-tight">
                <RevealWords text="Find your" delay={0.2} />
                <br />
                <RevealWords text="next night out." className="text-amber-400" delay={0.5} />
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.95 }}
                className="text-amber-200/70 text-base mt-5 max-w-md leading-relaxed"
              >
                Concerts, festivals and shows. Find one you like, pick your seat, and your e-ticket is on your phone in minutes.
              </motion.p>
            </div>

            <PosterFan concerts={heroConcerts} mx={mx} my={my} />
          </div>

          {banners.length > 1 && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentBanner(i)}
                  className={`h-1.5 rounded-full transition-all ${focusRingDark} ${
                    i === currentBanner ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to banner ${i + 1}`}
                  aria-current={i === currentBanner}
                />
              ))}
            </div>
          )}
        </div>

        {/* ===== PANEL PENCARIAN: TIKET ===== */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="max-w-5xl mx-auto px-4 -mt-20 relative z-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0, ease: EASE }}
            className="rounded-2xl drop-shadow-[0_20px_40px_rgba(69,26,3,0.28)]"
          >
            <div className="search-pass bg-white rounded-2xl overflow-hidden grid sm:grid-cols-[1fr_var(--stub-w,9.5rem)]">
              <div className="min-w-0">
                <div
                  role="tablist"
                  aria-label="Event categories"
                  className="flex gap-1 px-3 pt-3 border-b border-amber-100 overflow-x-auto"
                >
                  {[{ id: '', name: 'All' }, ...categories].map((cat) => {
                    const active = String(categoryId) === String(cat.id);
                    return (
                      <button
                        key={cat.id || 'all'}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setCategoryId(cat.id)}
                        className={`relative px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${focusRing} ${
                          active ? 'text-amber-950' : 'text-amber-700/70 hover:text-amber-900'
                        }`}
                      >
                        {cat.name}
                        {active && (
                          <motion.span
                            layoutId="category-underline"
                            className="absolute left-2 right-2 -bottom-px h-0.5 bg-amber-700 rounded-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 grid sm:grid-cols-[2fr_1fr] gap-2">
                  <label className="flex items-center gap-2 bg-amber-50/70 rounded-xl px-3 h-12 focus-within:ring-2 focus-within:ring-amber-500/30 transition-shadow">
                    <span className="sr-only">Search events or artists</span>
                    <Icon name="search" className="w-4 h-4 text-amber-500 shrink-0" />
                    <input
                      className="flex-1 min-w-0 bg-transparent text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none"
                      placeholder="Search events, artists…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <label className="flex items-center gap-2 bg-amber-50/70 rounded-xl px-3 h-12 focus-within:ring-2 focus-within:ring-amber-500/30 transition-shadow">
                    <span className="sr-only">City</span>
                    <Icon name="pin" className="w-4 h-4 text-amber-500 shrink-0" />
                    <input
                      className="flex-1 min-w-0 bg-transparent text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="bg-amber-50 border-t border-dashed border-amber-300/80 sm:border-t-0 sm:border-l p-3 flex">
                <button
                  type="submit"
                  className={`flex-1 h-12 sm:h-auto rounded-xl bg-amber-700 hover:bg-amber-600 active:scale-[0.98] text-amber-50 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${focusRing}`}
                >
                  <Icon name="search" className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>
          </motion.div>

          {(hasActiveFilters || isSearching) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 px-1 text-xs text-amber-800" aria-live="polite">
              {isSearching ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
                  Searching…
                </span>
              ) : (
                <>
                  <span>Filters:</span>
                  {debouncedSearch && (
                    <button
                      type="button"
                      onClick={() => { setSearch(''); setDebouncedSearch(''); }}
                      className={`inline-flex items-center gap-1 bg-white pl-2.5 pr-2 py-1 rounded-full hover:bg-amber-50 ${focusRing}`}
                      aria-label={`Remove search filter ${debouncedSearch}`}
                    >
                      “{debouncedSearch}”
                      <Icon name="close" className="w-3 h-3" />
                    </button>
                  )}
                  {debouncedCity && (
                    <button
                      type="button"
                      onClick={() => { setCity(''); setDebouncedCity(''); }}
                      className={`inline-flex items-center gap-1 bg-white pl-2.5 pr-2 py-1 rounded-full hover:bg-amber-50 ${focusRing}`}
                      aria-label={`Remove city filter ${debouncedCity}`}
                    >
                      <Icon name="pin" className="w-3 h-3" />
                      {debouncedCity}
                      <Icon name="close" className="w-3 h-3" />
                    </button>
                  )}
                  {activeCategory && (
                    <button
                      type="button"
                      onClick={() => setCategoryId('')}
                      className={`inline-flex items-center gap-1 bg-white pl-2.5 pr-2 py-1 rounded-full hover:bg-amber-50 ${focusRing}`}
                      aria-label={`Remove category filter ${activeCategory.name}`}
                    >
                      {activeCategory.name}
                      <Icon name="close" className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`font-medium text-amber-700 hover:text-amber-950 underline underline-offset-2 rounded ${focusRing}`}
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          )}
        </form>

        <div className="mt-10">
          <EventTicker concerts={heroConcerts} />
        </div>

        {/* ===== KONTEN ===== */}
        <div className="max-w-7xl mx-auto px-4 py-14">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6" role="status" aria-label="Loading events">
              {[...Array(3)].map((_, i) => (
                <SkeletonTicket key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto rounded-2xl border-2 border-dashed border-amber-300/70 p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                <Icon name="alert" className="w-6 h-6" />
              </div>
              <h2 className="f-display text-lg font-semibold text-amber-950 mb-1">{error}</h2>
              <p className="text-sm text-amber-800/80 mb-5">Check your connection, then try again.</p>
              <button
                type="button"
                onClick={fetchConcerts}
                className={`px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
              >
                Try again
              </button>
            </div>
          ) : concerts.length === 0 ? (
            <div className="max-w-md mx-auto rounded-2xl border-2 border-dashed border-amber-300/70 p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                <Icon name="search" className="w-6 h-6" />
              </div>
              <h2 className="f-display text-lg font-semibold text-amber-950 mb-1">No events found</h2>
              <p className="text-sm text-amber-800/80 mb-5">Try adjusting your filters.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Unggulan / hasil pencarian */}
              <Reveal as="section" className="mb-20" key={hasActiveFilters ? 'results' : 'featured'}>
                <SectionHeading
                  title={hasActiveFilters ? 'Results' : 'Featured events'}
                  subtitle={
                    hasActiveFilters
                      ? `${concerts.length} ${concerts.length === 1 ? 'event matches' : 'events match'} your filters`
                      : 'Hand-picked events on sale this week'
                  }
                  action={
                    <Link
                      to="/promos"
                      className={`group hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 rounded ${focusRing}`}
                    >
                      See promos
                      <Icon name="arrow" className="w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transition-none" />
                    </Link>
                  }
                />
                <div className="grid lg:grid-cols-[1.35fr_1fr_1fr] md:grid-cols-2 gap-6">
                  {featuredList.map((c, i) => (
                    <EventTicket key={c.id} concert={c} featured={i === 0} />
                  ))}
                </div>
              </Reveal>

              {/* Langkah pemesanan */}
              {!hasActiveFilters && (
                <Reveal as="section" className="mb-20">
                  <SectionHeading title="Book in three steps" subtitle="It takes a few minutes, from pick to e-ticket." />
                  <HowItWorks />
                </Reveal>
              )}

              {/* Semua event */}
              {restEvents.length > 0 && (
                <Reveal as="section" className="mb-20">
                  <SectionHeading
                    title={hasActiveFilters ? 'More results' : 'More events'}
                    subtitle={`${restEvents.length} more ${restEvents.length === 1 ? 'event' : 'events'}`}
                  />
                  <ul className="divide-y divide-dashed divide-amber-900/15">
                    {shownRest.map((c, index) => (
                      <EventRow key={c.id} concert={c} index={index + 3} />
                    ))}
                  </ul>
                  {shownRest.length < restEvents.length && (
                    <div className="mt-6 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                        className={`px-5 py-2.5 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl shadow-sm shadow-amber-950/5 transition-colors ${focusRing}`}
                      >
                        Show more events ({restEvents.length - shownRest.length} left)
                      </button>
                    </div>
                  )}
                </Reveal>
              )}
            </>
          )}

          {/* Keunggulan */}
          {!hasActiveFilters && (
            <Reveal as="section" className="mb-20">
              <SectionHeading title="Why TiketKu?" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <WhyTile
                  className="col-span-2"
                  variant="light"
                  icon="wallet"
                  big="1 place"
                  label="Convenience"
                  text="Find, buy, and manage your tickets on one platform."
                />
                <WhyTile
                  variant="amber"
                  icon="flame"
                  big={<AnimatedValue value={10} format={(n) => `${n}%`} />}
                  label="Off for new users"
                  text="A cheaper first ticket."
                  delay={0.05}
                />
                <WhyTile
                  variant="light"
                  icon="users"
                  big={<AnimatedValue value={80} format={(n) => `${n}+`} />}
                  label="Organizers"
                  text="Event organizers working with us."
                  delay={0.1}
                />
                <WhyTile
                  variant="dark"
                  icon="bolt"
                  big="5 min"
                  label="Fast booking"
                  text="From pick to e-ticket, no hassle."
                  delay={0.15}
                />
                <WhyTile
                  variant="light"
                  icon="ticket"
                  big={<AnimatedValue value={8000} format={(n) => `${n.toLocaleString('en-US')}+`} />}
                  label="Tickets sold"
                  text="Sold through our platform."
                  delay={0.2}
                />
                <WhyTile
                  className="col-span-2"
                  variant="light"
                  icon="shield"
                  big="100%"
                  label="Safe and trusted"
                  text="Every payment is verified and e-tickets are guaranteed authentic."
                  delay={0.25}
                />
              </div>
            </Reveal>
          )}

          {/* FAQ */}
          <Reveal as="section" className="mb-20" >
            <div id="faq" className="scroll-mt-24">
              <SectionHeading title="Frequently asked questions" />
              <div className="grid md:grid-cols-2 gap-3 items-start">
                {FAQS.map((faq, idx) => (
                  <FaqItem
                    key={faq.q}
                    id={`faq-${idx}`}
                    question={faq.q}
                    answer={faq.a}
                    open={openFaq === idx}
                    onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 shadow-sm shadow-amber-950/5">
                <div>
                  <p className="f-display font-semibold text-amber-950">Still have questions?</p>
                  <p className="text-sm text-amber-700/80 mt-0.5">Our team is ready to help you.</p>
                </div>
                <Link
                  to="/contact"
                  className={`px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2 ${focusRing}`}
                >
                  Contact us
                  <Icon name="arrow" className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Ajakan berlangganan */}
          <Reveal as="section">
            <div className="relative rounded-3xl overflow-hidden bg-ink-950">
              {heroConcerts[0]?.poster && (
                <img
                  src={getImageUrl(heroConcerts[0].poster)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-25"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-transparent" aria-hidden="true" />
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
                  backgroundSize: '26px 26px',
                }}
                aria-hidden="true"
              />

              <div className="relative max-w-2xl mx-auto px-6 py-16 flex flex-col items-center text-center">
                <h2 className="f-display text-3xl md:text-4xl font-semibold text-white leading-tight mb-2">
                  Your next night out starts here
                </h2>
                <p className="text-amber-200/70 text-sm mb-6 max-w-md">
                  Subscribe to get the latest event info and exclusive promos.
                </p>

                {/* TODO: belum terhubung ke endpoint newsletter, saat ini hanya mengosongkan kolom. */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setEmailSub('');
                  }}
                  className="w-full max-w-md flex items-center gap-2 bg-white/10 rounded-full p-1.5 border border-white/20"
                >
                  <label htmlFor="cta-email" className="sr-only">
                    Email address
                  </label>
                  <span className="flex-1 flex items-center gap-2 pl-3">
                    <Icon name="mail" className="w-4 h-4 text-amber-300/80 shrink-0" />
                    <input
                      id="cta-email"
                      type="email"
                      required
                      value={emailSub}
                      onChange={(e) => setEmailSub(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 min-w-0 bg-transparent text-white placeholder-amber-200/50 focus:outline-none text-sm py-2"
                    />
                  </span>
                  <button
                    type="submit"
                    className={`px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-full transition-colors ${focusRingDark}`}
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ===== FOOTER ===== */}
        <footer className="bg-ink-950 border-t border-amber-500/20 mt-8">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-9 h-9 rounded-full bg-amber-800/30 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Icon name="ticket" className="w-4 h-4" />
                  </span>
                  <span className="f-display text-xl font-semibold text-amber-200">TiketKu</span>
                </div>
                <p className="text-sm text-amber-300/70 leading-relaxed">
                  Your gateway to unforgettable experiences. From intimate concerts to grand festivals.
                </p>
                <div className="flex gap-2 mt-4">
                  {['facebook', 'twitter', 'instagram'].map((social) => (
                    <button
                      key={social}
                      type="button"
                      className={`w-9 h-9 rounded-full border border-amber-500/20 bg-amber-800/20 flex items-center justify-center text-amber-400 hover:bg-amber-700/30 hover:border-amber-500/40 transition-all ${focusRingDark}`}
                      aria-label={`Follow us on ${social}`}
                    >
                      <Icon name={social} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-amber-400/90 mb-3">Quick links</h3>
                <ul className="space-y-2">
                  {FOOTER_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className={`text-sm text-amber-300/70 hover:text-amber-200 rounded transition-colors ${focusRingDark}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <a href="#faq" className={`text-sm text-amber-300/70 hover:text-amber-200 rounded transition-colors ${focusRingDark}`}>
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-amber-400/90 mb-3">Categories</h3>
                <ul className="space-y-2">
                  {categories.slice(0, 5).map((cat) => (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryId(cat.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`text-sm text-amber-300/70 hover:text-amber-200 rounded transition-colors ${focusRingDark}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-amber-400/90 mb-3">Contact</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-amber-300/70">
                    <Icon name="pin" className="w-4 h-4 text-amber-500/70 shrink-0" />
                    Jakarta, Indonesia
                  </li>
                  <li>
                    <a href="tel:+6281234567890" className={`flex items-center gap-2 text-sm text-amber-300/70 hover:text-amber-200 rounded transition-colors ${focusRingDark}`}>
                      <Icon name="phone" className="w-4 h-4 text-amber-500/70 shrink-0" />
                      +62 812-3456-7890
                    </a>
                  </li>
                  <li>
                    <a href="mailto:support@tiketku.id" className={`flex items-center gap-2 text-sm text-amber-300/70 hover:text-amber-200 rounded transition-colors ${focusRingDark}`}>
                      <Icon name="mail" className="w-4 h-4 text-amber-500/70 shrink-0" />
                      support@tiketku.id
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-dashed border-amber-500/20 mt-10 pt-6">
              <p className="text-xs text-amber-300/60 text-center">
                © {new Date().getFullYear()} TiketKu. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}