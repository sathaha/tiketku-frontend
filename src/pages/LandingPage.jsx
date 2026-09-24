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
} from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ===================================================================
// HELPERS
// ===================================================================
function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    scan: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    music: 'M12 2v8M12 10a3 3 0 100 6 3 3 0 000-6z M12 2l4 1v3l-4-1',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    check: 'M20 6L9 17l-5-5',
    close: 'M6 6l12 12M18 6L6 18',
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    copy: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v2M10 4h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

const fmtDate = (d, month = 'long') => {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month, year: 'numeric' });
};

const rupiah = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

// ===================================================================
// SHARED UI
// ===================================================================
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-0.5 bg-amber-500 origin-left z-[60]"
    />
  );
}

// Tepi bergerigi ala tiket. `flip` untuk dipasang di bawah section gelap.
function Perforation({ flip = false }) {
  const mask = 'radial-gradient(circle at 10px 0, transparent 7px, #000 7.5px)';
  return (
    <div
      aria-hidden
      className={`h-[10px] bg-ink-950 ${flip ? 'rotate-180' : ''}`}
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskSize: '20px 10px',
        maskSize: '20px 10px',
        WebkitMaskRepeat: 'repeat-x',
        maskRepeat: 'repeat-x',
      }}
    />
  );
}

function ScrollReveal({ children, direction = 'up', delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const directions = { up: { y: 32 }, down: { y: -32 }, left: { x: -32 }, right: { x: 32 } };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function RevealWords({ text, className = '', delay = 0 }) {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-1">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.8, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Field({ label, value, bold }) {
  return (
    <div>
      <p className="font-serif text-[9px] tracking-[0.25em] text-amber-500/70 uppercase mb-1">{label}</p>
      <p className={`font-serif text-sm text-amber-900 ${bold ? 'font-bold' : ''}`}>{value}</p>
    </div>
  );
}

function SectionHead({ eyebrow, children, aside, dark = false }) {
  return (
    <ScrollReveal>
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <span className={`font-serif text-[10px] tracking-[0.4em] uppercase ${dark ? 'text-amber-400/80' : 'text-amber-600/80'}`}>
            {eyebrow}
          </span>
          <h2 className={`font-serif text-4xl md:text-5xl mt-3 leading-tight ${dark ? 'text-white' : 'text-amber-950'}`}>
            {children}
          </h2>
        </div>
        {aside}
      </div>
    </ScrollReveal>
  );
}

// Modal dipakai bersama (kunci scroll, Esc, klik backdrop)
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
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-950/75 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${className}`}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-ink-950/80 text-amber-100 flex items-center justify-center hover:bg-ink-950 transition-colors"
        >
          <Icon name="close" className="w-4 h-4" />
        </button>
        <div className="max-h-[90vh] overflow-y-auto rounded-2xl bg-[#faf6ef] shadow-2xl">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ===================================================================
// HERO TICKET
// ===================================================================
const BARS = Array.from({ length: 44 }, (_, i) => ({
  w: ((i * 7 + 3) % 4) + 1,
  h: i % 5 === 0 ? 100 : 78,
}));

function HeroTicket() {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 20 });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <div className="-rotate-3 w-full max-w-sm mx-auto">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        className="relative"
      >
        <div className="relative bg-[#faf6ef] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="px-7 pt-6 pb-7">
            <div className="flex items-center justify-between pb-4 border-b border-amber-300/60">
              <span className="font-serif text-[10px] tracking-[0.35em] text-amber-600/80 uppercase">Admission</span>
              <span className="font-serif text-[10px] tracking-[0.35em] text-amber-600/80 uppercase">No. 0042</span>
            </div>

            <p className="font-serif text-[10px] tracking-[0.3em] text-amber-500/70 uppercase mt-6 mb-2">Live Concert</p>
            <h3 className="font-serif text-4xl text-amber-900 leading-[1.02]">
              Midnight
              <br />
              <span className="italic text-amber-600">Sessions.</span>
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-5 mt-8">
              <Field label="Date" value="14 Mar 2026" />
              <Field label="Gate" value="A-12" />
              <Field label="Seat" value="VIP 03" />
              <Field label="Price" value="Rp 850K" bold />
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-amber-300/70">
            <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-ink-950" />
            <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-ink-950" />
          </div>

          <div className="px-7 py-5 bg-amber-100/40">
            <div className="flex items-end gap-[2px] h-11">
              {BARS.map((b, i) => (
                <div key={i} className="bg-amber-900/85" style={{ width: `${b.w}px`, height: `${b.h}%` }} />
              ))}
            </div>
            <p className="font-serif text-[9px] tracking-[0.35em] text-amber-600/70 uppercase mt-3">
              Scan di pintu masuk
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===================================================================
// CONCERT MODAL + HORIZONTAL GALLERY
// ===================================================================
function ConcertModal({ item, onClose }) {
  const date = fmtDate(item.date || item.start_date);

  return (
    <Modal onClose={onClose} label={item.name} className="max-w-3xl">
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-900">
        {item.poster ? (
          <img src={item.poster} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-600">
            <Icon name="music" className="w-14 h-14" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf6ef] via-[#faf6ef]/20 to-transparent" />
        <div className="absolute top-5 left-5 font-serif text-[10px] tracking-[0.3em] text-amber-100 uppercase bg-ink-950/70 backdrop-blur px-3 py-1.5 rounded-full">
          {item.category_name || 'Event'}
        </div>
      </div>

      <div className="p-7 md:p-9 -mt-8 relative">
        <h3 className="font-serif text-3xl md:text-4xl text-amber-950 leading-tight">{item.name}</h3>
        {item.artist && <p className="font-serif text-sm text-amber-700/80 mt-2 italic">{item.artist}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-5 mt-8 pt-6 border-t border-dashed border-amber-300/60">
          {item.city && <Field label="Kota" value={item.city} />}
          {item.venue && <Field label="Venue" value={item.venue} />}
          {date && <Field label="Tanggal" value={date} />}
          {item.time && <Field label="Waktu" value={item.time} />}
          {item.min_price && <Field label="Mulai dari" value={rupiah(item.min_price)} bold />}
          {item.gate && <Field label="Gate" value={item.gate} />}
        </div>

        {item.description && (
          <div className="mt-8">
            <p className="font-serif text-[10px] tracking-[0.3em] text-amber-600/70 uppercase mb-3">Tentang Event</p>
            <p className="font-serif text-sm text-amber-900/80 leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-9 pt-6 border-t border-dashed border-amber-300/60">
          <Link
            to={`/concerts/${item.id}`}
            className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase rounded-full transition-colors shadow-lg shadow-amber-900/30"
          >
            Beli Tiket
            <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center px-7 py-3.5 font-serif text-xs tracking-[0.2em] uppercase text-amber-800 hover:text-amber-600 border border-amber-700/30 hover:border-amber-700/60 rounded-full transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}

function HorizontalGallery({ items = [] }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const dist = useMotionValue(0);
  const [distance, setDistance] = useState(0);
  const [selected, setSelected] = useState(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Jarak geser diukur dari lebar track sebenarnya
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
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
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (!items.length) return null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#f5ede4]"
      style={{ height: `calc(100vh + ${distance}px)` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 mb-8 w-full flex items-end justify-between gap-6">
          <div>
            <span className="font-serif text-[10px] tracking-[0.4em] text-amber-600/80 uppercase">Featured Events</span>
            <h2 className="font-serif text-3xl md:text-5xl text-amber-950 mt-2 leading-tight">
              Pilihan <span className="italic text-amber-600">Minggu Ini</span>
            </h2>
          </div>
          <Link
            to="/concerts"
            className="hidden sm:inline-flex items-center gap-2 font-serif text-xs tracking-[0.2em] uppercase text-amber-800 hover:text-amber-600 transition-colors"
          >
            Semua konser <Icon name="arrow" className="w-4 h-4" />
          </Link>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-5 px-4 md:px-[max(1rem,calc((100vw-1280px)/2+1rem))] will-change-transform w-max"
        >
          {items.map((item, idx) => (
            <button
              type="button"
              onClick={() => setSelected(item)}
              key={item.id || idx}
              className="group flex-shrink-0 w-[78vw] sm:w-[320px] md:w-[380px] aspect-[3/4] rounded-2xl overflow-hidden relative bg-ink-900 text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
            >
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-600">
                  <Icon name="music" className="w-12 h-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

              <div className="absolute top-5 left-5 font-serif text-[10px] tracking-[0.3em] text-amber-200/80 uppercase tabular-nums">
                No. {String(idx + 1).padStart(2, '0')}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="font-serif text-[9px] tracking-[0.3em] text-amber-400 uppercase">
                  {item.category_name || 'Event'}
                </span>
                <h3 className="font-serif text-2xl text-white mt-1 leading-tight line-clamp-2">{item.name}</h3>
                <p className="font-serif text-xs text-amber-200/70 mt-1.5 truncate">{item.artist}</p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-amber-200/25">
                  <span className="flex items-center gap-1.5 text-[11px] font-serif text-amber-200/70">
                    {item.city && (
                      <>
                        <Icon name="pin" className="w-3 h-3" />
                        {item.city}
                      </>
                    )}
                  </span>
                  {item.min_price && (
                    <span className="font-serif text-sm text-amber-400 tabular-nums">{rupiah(item.min_price)}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
          <div className="flex-shrink-0 w-4" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 mt-8 w-full">
          <div className="h-px bg-amber-900/20 relative">
            <motion.div style={{ width: progress }} className="absolute top-0 left-0 h-full bg-amber-700" />
          </div>
          <div className="flex justify-between mt-3">
            <span className="font-serif text-[10px] tracking-[0.3em] text-amber-600/70 uppercase">
              Scroll untuk menjelajah
            </span>
            <span className="font-serif text-[10px] tracking-[0.3em] text-amber-600/70 uppercase">
              {items.length} events
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && <ConcertModal item={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}

// ===================================================================
// PROMO
// ===================================================================
function discountLabel(type, value) {
  if (value === '' || value == null || Number.isNaN(Number(value))) return '-';
  return type === 'percentage' ? `${Number(value)}%` : `Rp${Number(value).toLocaleString('id-ID')}`;
}

function PromoTicket({ promo, featured = false, onClick, index = 0 }) {
  const label = discountLabel(promo.discount_type, promo.discount_value);
  const used = promo.used || 0;
  const quota = promo.quota || 0;
  const sisa = Math.max(0, quota - used);
  const pct = quota > 0 ? Math.min(Math.round((used / quota) * 100), 100) : 0;
  const until = fmtDate(promo.valid_until, 'short');

  return (
    <ScrollReveal delay={index * 0.08} className="h-full">
      <button
        type="button"
        onClick={onClick}
        className={`group relative w-full h-full text-left overflow-hidden rounded-2xl bg-ink-950 flex flex-col md:flex-row transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 ${
          featured ? 'md:min-h-[17rem]' : ''
        }`}
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Info */}
        <div className="relative flex-1 p-8 md:p-10 flex flex-col justify-between gap-8">
          <div>
            <span className="inline-flex items-center gap-2 font-serif text-[9px] tracking-[0.35em] text-emerald-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Promo Aktif
            </span>
            <h3
              className={`font-serif text-white leading-[1.08] mt-4 ${
                featured ? 'text-3xl md:text-5xl' : 'text-2xl'
              }`}
            >
              {promo.description || 'Promo spesial untukmu'}
            </h3>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 text-amber-200/60 font-serif text-xs">
              {until && (
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" className="w-3.5 h-3.5" />
                  s/d {until}
                </span>
              )}
              {sisa > 0 && sisa <= 50 && (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Icon name="zap" className="w-3.5 h-3.5" />
                  Sisa {sisa}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="px-4 py-2 rounded-full border border-dashed border-amber-500/40 font-mono font-bold text-amber-400 tracking-widest text-sm">
              {promo.code}
            </span>
            <span className="inline-flex items-center gap-2 font-serif text-[10px] tracking-[0.3em] text-amber-300/70 uppercase group-hover:text-amber-300 transition-colors">
              Detail
              <Icon name="arrow" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* Stub */}
        <div
          className={`relative flex flex-col items-center justify-center text-center px-8 py-8 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-amber-500/25 ${
            featured ? 'md:w-72' : 'md:w-52'
          }`}
        >
          <span className="absolute w-6 h-6 rounded-full bg-[#f5ede4] -top-3 -right-3 md:top-auto md:right-auto md:-bottom-3 md:-left-3" />
          <span className="absolute w-6 h-6 rounded-full bg-[#f5ede4] -top-3 -left-3" />

          <p className="font-serif text-[10px] tracking-[0.4em] text-amber-400/80 uppercase">
            {promo.discount_type === 'percentage' ? 'Diskon' : 'Potongan'}
          </p>
          <p
            className={`font-serif text-amber-400 leading-none mt-2 tabular-nums ${
              featured ? 'text-6xl md:text-7xl' : 'text-5xl'
            }`}
          >
            {label}
          </p>
          <div className="mt-5 w-28 h-1 rounded-full bg-amber-500/15 overflow-hidden">
            <div
              className={`h-full ${pct >= 100 ? 'bg-orange-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-amber-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="font-serif text-[10px] tracking-[0.2em] text-amber-300/50 uppercase mt-2">
            {used} / {quota} terpakai
          </p>
        </div>
      </button>
    </ScrollReveal>
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
      /* clipboard tidak tersedia */
    }
  };

  return (
    <Modal onClose={onClose} label="Detail promo" className="max-w-md">
      <div className="relative bg-ink-950 px-7 pt-10 pb-10 text-center">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative">
          <p className="font-serif text-[10px] tracking-[0.4em] text-amber-400/80 uppercase">Promo Spesial</p>
          <p className="font-serif text-6xl text-amber-400 mt-3 leading-none tabular-nums">{label}</p>
          <p className="font-serif text-xs text-amber-200/60 mt-3">
            {promo.discount_type === 'percentage' ? 'diskon' : 'potongan harga'}
          </p>
        </div>
      </div>
      <div className="border-t-2 border-dashed border-amber-300/70" />

      <div className="px-7 pt-7 pb-7">
        <div className="rounded-xl border border-dashed border-amber-300/70 p-4 text-center">
          <p className="font-serif text-[9px] tracking-[0.3em] text-amber-600/70 uppercase mb-1.5">Kode Promo</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono font-bold text-2xl text-amber-900 tracking-wider">{promo.code}</span>
            <button
              onClick={handleCopy}
              aria-label="Salin kode"
              className="p-2 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <Icon name={copied ? 'check' : 'copy'} className="w-4 h-4" />
            </button>
          </div>
          <p role="status" className="h-4 font-serif text-[10px] tracking-[0.2em] text-emerald-600 uppercase mt-2">
            {copied ? 'Kode tersalin' : ''}
          </p>
        </div>

        {promo.description && (
          <p className="font-serif text-sm text-amber-900/80 leading-relaxed text-center mt-5">{promo.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mt-7 pt-6 border-t border-dashed border-amber-300/60">
          <Field label="Berlaku dari" value={fmtDate(promo.valid_from) || '-'} />
          <Field label="Berlaku sampai" value={fmtDate(promo.valid_until) || '-'} />
          <Field label="Kuota" value={`${promo.used || 0} / ${promo.quota}`} />
          <Field label="Sisa" value={`${Math.max(0, (promo.quota || 0) - (promo.used || 0))} kupon`} bold />
        </div>

        <Link
          to="/concerts"
          onClick={onClose}
          className="group mt-7 w-full inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase rounded-full transition-colors shadow-lg shadow-amber-900/30"
        >
          Pakai di Konser
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
    return () => { mounted = false; };
  }, []);

  const [featured, ...rest] = promos;
  const others = rest.slice(0, 2);

  return (
    <section className="py-24 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <SectionHead
          eyebrow="Penawaran Spesial"
          aside={
            <p className="hidden md:block font-serif text-sm text-amber-700/70 max-w-xs text-right leading-relaxed">
              Salin kodenya, pakai saat checkout.
            </p>
          }
        >
          Promo <span className="italic text-amber-600">Aktif</span>
        </SectionHead>

        {loading ? (
          <div className="space-y-6">
            <div className="h-72 rounded-2xl bg-ink-950/80 animate-pulse" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-56 rounded-2xl bg-ink-950/60 animate-pulse" />
              <div className="h-56 rounded-2xl bg-ink-950/60 animate-pulse" />
            </div>
          </div>
        ) : !featured ? (
          <div className="py-14 text-center border-y border-dashed border-amber-900/25">
            <h3 className="font-serif text-xl text-amber-950 mb-1">Belum ada promo aktif</h3>
            <p className="font-serif text-sm text-amber-700/60">Pantau terus, promo baru akan segera hadir.</p>
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

      <AnimatePresence>
        {selected && <PromoModal promo={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}

// ===================================================================
// TESTIMONIALS (section gelap, tanpa efek 3D)
// ===================================================================
function Stars({ n, main }) {
  return (
    <div className="flex gap-1" aria-label={`Rating ${n} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          className={`w-3.5 h-3.5 ${i < n ? 'text-amber-500' : main ? 'text-amber-200' : 'text-amber-200/20'}`}
        />
      ))}
    </div>
  );
}

function Testimonial({ t, main = false, index = 0 }) {
  return (
    <ScrollReveal delay={index * 0.08} className="h-full">
      <figure
        className={`h-full flex flex-col rounded-2xl ${
          main ? 'bg-[#faf6ef] p-8 md:p-12' : 'border border-amber-500/20 p-7'
        }`}
      >
        <Stars n={t.rating} main={main} />

        <blockquote
          className={`font-serif flex-1 mt-6 ${
            main ? 'text-2xl md:text-3xl leading-snug text-amber-950' : 'text-sm leading-relaxed text-amber-100/80'
          }`}
        >
          &ldquo;{t.text}&rdquo;
        </blockquote>

        {t.concert && (
          <Link
            to={`/concerts/${t.concert.id}`}
            className={`group/c mt-7 flex items-center gap-3 pt-5 border-t border-dashed ${
              main ? 'border-amber-300/60' : 'border-amber-500/20'
            }`}
          >
            {t.concert.poster && (
              <img
                src={t.concert.poster}
                alt=""
                loading="lazy"
                className="w-10 h-10 rounded-md object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className={`font-serif text-[9px] tracking-[0.3em] uppercase ${main ? 'text-amber-600/70' : 'text-amber-400/60'}`}>
                Menonton
              </p>
              <p className={`font-serif text-sm truncate transition-colors ${main ? 'text-amber-950 group-hover/c:text-amber-700' : 'text-white group-hover/c:text-amber-400'}`}>
                {t.concert.name}
              </p>
            </div>
            <Icon
              name="arrow"
              className={`w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover/c:translate-x-0.5 ${main ? 'text-amber-500' : 'text-amber-400/60'}`}
            />
          </Link>
        )}

        <figcaption className={`flex items-center gap-3 pt-5 ${t.concert ? '' : 'mt-7 border-t border-dashed ' + (main ? 'border-amber-300/60' : 'border-amber-500/20')}`}>
          <div className="w-9 h-9 rounded-full bg-amber-800 text-amber-50 flex items-center justify-center font-serif text-xs font-semibold flex-shrink-0">
            {t.initials}
          </div>
          <div className="min-w-0">
            <p className={`font-serif text-sm truncate ${main ? 'text-amber-950' : 'text-white'}`}>{t.name}</p>
            <p className={`font-serif text-[10px] tracking-[0.2em] uppercase truncate ${main ? 'text-amber-600/70' : 'text-amber-300/50'}`}>
              {t.role}
            </p>
          </div>
        </figcaption>
      </figure>
    </ScrollReveal>
  );
}

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .get('/testimonials', { params: { limit: 6 } })
      .then((res) => {
        if (!mounted) return;
        setTestimonials(
          (res.data || []).map((t, idx) => ({
            id: t.id ?? idx,
            name: t.name || 'Anonim',
            role: t.role || 'Penonton',
            text: t.text || '',
            rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
            initials: t.initials || getInitials(t.name || ''),
            concert: t.concert || null,
          }))
        );
      })
      .catch((err) => {
        console.error('Failed to load testimonials:', err);
        if (mounted) setError(true);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const [main, ...rest] = testimonials;
  const side = rest.slice(0, 2);
  const more = rest.slice(2, 5);

  return (
    <>
      <Perforation />
      <section className="py-24 px-4 relative z-10 bg-ink-950 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <SectionHead eyebrow="Kata Mereka" dark>
            Cerita dari <span className="italic text-amber-400">Penonton</span>
          </SectionHead>

          {loading ? (
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 h-80 rounded-2xl bg-white/5 animate-pulse" />
              <div className="lg:col-span-5 grid gap-6">
                <div className="h-36 rounded-2xl bg-white/5 animate-pulse" />
                <div className="h-36 rounded-2xl bg-white/5 animate-pulse" />
              </div>
            </div>
          ) : !main ? (
            <p className="font-serif text-sm text-amber-200/50 italic">
              {error ? 'Belum ada testimoni saat ini.' : 'Jadilah yang pertama memberi testimoni!'}
            </p>
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
      </section>
      <Perforation flip />
    </>
  );
}

// ===================================================================
// FOOTER + NEWSLETTER
// ===================================================================
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    setMessage('');

    try {
      const baseURL = (api.defaults?.baseURL || '').replace(/\/$/, '');
      const res = await fetch(`${baseURL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || 'Gagal berlangganan.');
      }

      setStatus('success');
      setMessage(data?.message || 'Cek inbox kamu untuk konfirmasi.');
      setEmail('');

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 4000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Gagal berlangganan. Coba lagi.');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 4000);
    }
  };

  const isDone = status === 'success';
  const isLoading = status === 'loading';
  const isError = status === 'error';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <label
        htmlFor="newsletter-email"
        className="font-serif text-[10px] tracking-[0.35em] text-amber-400/80 uppercase"
      >
        Newsletter
      </label>

      <div className="mt-3 flex flex-col sm:flex-row gap-3">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isDone || isLoading}
          placeholder="email@kamu.com"
          className={`flex-1 px-5 py-3.5 bg-white/5 border rounded-full text-white placeholder-amber-200/40 font-serif text-sm focus:outline-none transition-colors disabled:opacity-50 ${
            isError
              ? 'border-red-500/50 focus:border-red-400'
              : 'border-amber-500/20 focus:border-amber-400/60'
          }`}
        />

        <button
          type="submit"
          disabled={isDone || isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap min-w-[9.5rem]"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memproses
            </>
          ) : isDone ? (
            <>
              <Icon name="check" className="w-4 h-4" />
              Terkirim
            </>
          ) : (
            <>
              Subscribe
              <Icon name="arrow" className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`font-serif text-[11px] mt-3 min-h-[1rem] ${
          isError ? 'text-red-400' : isDone ? 'text-emerald-400' : 'text-amber-300/50'
        }`}
      >
        {message ||
          (isDone
            ? 'Cek inbox kamu untuk konfirmasi.'
            : 'Info konser, promo, dan presale. Tanpa spam.')}
      </p>
    </form>
  );
}

function Footer({ user }) {
  return (
    <footer className="border-t border-amber-900/20 pt-16 pb-10 px-4 relative z-10 bg-ink-950">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 pb-12 border-b border-amber-500/15">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-800/40 border border-amber-500/30 flex items-center justify-center">
                <Icon name="ticket" className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-serif text-xl text-amber-200 tracking-wide">
                tiket<span className="text-amber-500">ku</span>
              </span>
            </Link>
            <p className="font-serif text-2xl md:text-3xl text-white leading-snug mt-6 max-w-sm">
              Jangan lewatkan <span className="italic text-amber-400">event berikutnya.</span>
            </p>
          </div>
          <div className="md:justify-self-end w-full flex md:justify-end">
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-5 pt-8">
          <nav className="flex items-center gap-8 font-serif text-xs tracking-[0.2em] uppercase text-amber-300/60">
            <Link to="/concerts" className="hover:text-amber-400 transition-colors">Konser</Link>
            {!user && <Link to="/register" className="hover:text-amber-400 transition-colors">Daftar</Link>}
          </nav>
          <p className="font-serif text-xs text-amber-300/40">© 2026 Tiketku. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}

// ===================================================================
// MAIN
// ===================================================================
export default function LandingPage() {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [concerts, setConcerts] = useState([]);
  useEffect(() => {
    api.get('/concerts')
      .then((res) => setConcerts(res.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  const features = [
    { icon: 'ticket', title: 'E-Ticket Instan', desc: 'Tiket langsung terbit setelah pembayaran, QR code siap discan di venue.' },
    { icon: 'scan', title: 'Scan & Go', desc: 'Cukup tunjukkan QR code, petugas scan, dan kamu masuk.' },
    { icon: 'shield', title: 'Pembayaran Aman', desc: 'Ditenagai Xendit dengan berbagai metode pembayaran.' },
    { icon: 'zap', title: 'Cepat & Mudah', desc: 'Beli tiket dalam hitungan detik, tanpa antri.' },
  ];

  const steps = [
    { number: '01', title: 'Pilih Konser', desc: 'Cari dan pilih konser favoritmu' },
    { number: '02', title: 'Beli Tiket', desc: 'Pilih kategori tiket dan bayar' },
    { number: '03', title: 'Dapatkan E-Ticket', desc: 'QR code langsung terbit' },
    { number: '04', title: 'Scan & Masuk', desc: 'Tunjukkan QR di pintu masuk' },
  ];

  const stats = [
    { value: '100+', label: 'Konser' },
    { value: '50K+', label: 'Tiket Terjual' },
    { value: '10K+', label: 'Pengguna' },
    { value: '4.9', label: 'Rating' },
  ];

  const ctaTo = user ? '/' : '/register';

  return (
    <MotionConfig reducedMotion="user">
      {/* overflow-x-clip (bukan hidden) supaya sticky di gallery tetap jalan */}
      <div className="min-h-screen bg-[#f5ede4] relative overflow-x-clip">
        <ScrollProgress />

        {/* ===== HERO ===== */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center px-4 pt-28 pb-20 bg-ink-950 overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
          />
          <div className="absolute -right-40 top-1/4 w-[34rem] h-[34rem] rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-14 items-center">
            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="lg:col-span-7">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-3 mb-7 font-serif text-[11px] tracking-[0.35em] text-amber-400 uppercase"
              >
                <span className="w-8 h-px bg-amber-400" />
                Tiket konser digital
              </motion.p>

              <h1 className="font-serif text-5xl sm:text-6xl xl:text-8xl text-white leading-[0.95] mb-7">
                <RevealWords text="Rasakan" delay={0.3} />
                <br />
                <RevealWords text="Energi Panggung" className="text-amber-400 italic" delay={0.45} />
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-amber-200/60 text-base md:text-lg font-serif max-w-md mb-9 leading-relaxed"
              >
                Dari konser intimate sampai festival raksasa, semua tiket ada di satu gerbang.
                E-ticket langsung terbit, tinggal scan di pintu masuk.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6 }}
                className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8"
              >
                <Link
                  to={ctaTo}
                  className="group inline-flex items-center justify-center gap-3 px-7 py-4 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-sm tracking-[0.15em] uppercase rounded-full shadow-lg shadow-amber-900/40 transition-colors"
                >
                  {user ? 'Jelajahi Event' : 'Daftar Gratis'}
                  <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/concerts"
                  className="group inline-flex items-center gap-2 font-serif text-sm tracking-[0.15em] uppercase text-amber-100 hover:text-amber-400 transition-colors"
                >
                  <span className="border-b border-amber-400/40 group-hover:border-amber-400 pb-0.5 transition-colors">
                    Lihat Konser
                  </span>
                </Link>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { delayChildren: 1.3, staggerChildren: 0.08 } } }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 mt-14 pt-8 border-t border-amber-500/15"
              >
                {stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                    className={idx > 0 ? 'sm:pl-6 sm:border-l sm:border-amber-500/15' : ''}
                  >
                    <p className="font-serif text-3xl text-amber-400 tabular-nums">{stat.value}</p>
                    <p className="font-serif text-[10px] tracking-[0.2em] text-amber-200/50 uppercase mt-1">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block lg:col-span-5"
            >
              <HeroTicket />
            </motion.div>
          </div>
        </section>

        <Perforation />

        {/* ===== FEATURES ===== */}
        <section className="py-24 px-4 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
              <ScrollReveal>
                <span className="font-serif text-[10px] tracking-[0.4em] text-amber-600/80 uppercase">
                  Kenapa TiketKu?
                </span>
                <h2 className="font-serif text-4xl md:text-5xl text-amber-950 mt-3 leading-[1.05]">
                  Fitur <span className="italic text-amber-600">Unggulan</span>
                </h2>
                <p className="font-serif text-sm text-amber-800/70 mt-5 leading-relaxed max-w-xs">
                  Dari bayar sampai masuk venue, semuanya dibuat supaya kamu tinggal fokus menikmati konser.
                </p>
              </ScrollReveal>
            </div>

            <ul className="lg:col-span-8 border-t border-amber-900/20">
              {features.map((f, idx) => (
                <li key={f.title} className="list-none">
                  <ScrollReveal delay={idx * 0.06}>
                    <div className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-8 py-7 border-b border-amber-900/20 transition-colors hover:bg-amber-100/40 px-2 -mx-2 rounded-sm">
                      <span className="font-serif text-sm text-amber-600/70 tabular-nums w-6">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-serif text-xl md:text-2xl text-amber-950 transition-transform duration-300 group-hover:translate-x-1">
                          {f.title}
                        </h3>
                        <p className="font-serif text-sm text-amber-800/70 mt-1.5 leading-relaxed max-w-md">{f.desc}</p>
                      </div>
                      <div className="w-11 h-11 rounded-full border border-amber-700/30 flex items-center justify-center text-amber-700 transition-colors group-hover:bg-amber-800 group-hover:text-amber-50 group-hover:border-amber-800">
                        <Icon name={f.icon} className="w-5 h-5" />
                      </div>
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===== GALLERY ===== */}
        {concerts.length > 0 && <HorizontalGallery items={concerts} />}

        {/* ===== PROMO ===== */}
        <PromoSection />

        {/* ===== HOW IT WORKS ===== */}
        <section className="pb-24 px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <SectionHead eyebrow="Cara Kerja">
              4 Langkah <span className="italic text-amber-600">Mudah</span>
            </SectionHead>

            <ol className="grid md:grid-cols-4 gap-x-8 gap-y-10">
              {steps.map((step, idx) => (
                <li key={step.number} className="relative pt-6">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-0 left-0 right-0 h-px bg-amber-800 origin-left"
                  />
                  <ScrollReveal delay={idx * 0.1}>
                    <span className="font-serif text-6xl text-amber-800/25 leading-none tabular-nums">{step.number}</span>
                    <h3 className="font-serif text-xl text-amber-950 mt-4 mb-2">{step.title}</h3>
                    <p className="font-serif text-sm text-amber-800/70 leading-relaxed">{step.desc}</p>
                  </ScrollReveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== TESTIMONI ===== */}
        <Testimonials />

        {/* ===== CTA ===== */}
        <section className="py-24 px-4 relative z-10">
          <ScrollReveal>
            <div className="relative max-w-5xl mx-auto bg-ink-950 rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              <span className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f5ede4]" />
              <span className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f5ede4]" />

              <div className="relative grid md:grid-cols-[1fr_auto] items-stretch">
                <div className="p-10 md:p-14">
                  <span className="font-serif text-[10px] tracking-[0.4em] text-amber-400/80 uppercase">Admit one</span>
                  <h2 className="font-serif text-4xl md:text-6xl text-white mt-4 leading-[1.02]">
                    Siap Nonton
                    <br />
                    <span className="italic text-amber-400">Konser?</span>
                  </h2>
                  <p className="font-serif text-amber-200/60 mt-5 max-w-sm leading-relaxed">
                    Daftar sekarang dan dapatkan akses ke konser-konser terbaik di kotamu.
                  </p>
                </div>

                <div className="border-t-2 md:border-t-0 md:border-l-2 border-dashed border-amber-500/25 p-10 md:p-14 flex items-center justify-center">
                  <Link
                    to={ctaTo}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-sm tracking-[0.2em] uppercase rounded-full shadow-lg shadow-amber-900/40 transition-colors"
                  >
                    {user ? 'Jelajahi Sekarang' : 'Daftar Gratis'}
                    <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        <Footer user={user} />
      </div>
    </MotionConfig>
  );
}