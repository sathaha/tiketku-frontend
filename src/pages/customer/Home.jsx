import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState, formatRupiah, formatDate } from '../../components/Ui';

// ===== ICON COMPONENT =====
function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    ticket: 'M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    flame: 'M12 23c-4.97 0-9-3.582-9-8 0-4.418 4.03-8.259 6.5-10.5C10.5 3.5 12 1 12 1s1.5 2.5 2.5 3.5C16.97 6.741 21 10.582 21 15c0 4.418-4.03 8-9 8z',
    music: 'M12 2v8M12 10a3 3 0 100 6 3 3 0 000-6z M12 2l4 1v3l-4-1',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    grid: 'M3 3h7v7H3V3zM14 3h7v7h-7V3zM3 14h7v7H3v-7zM14 14h7v7h-7v-7z',
    chevronLeft: 'M15 19l-7-7 7-7',
    chevronRight: 'M9 5l7 7-7 7',
    chevronDown: 'M6 9l6 6 6-6',
    close: 'M6 18L18 6M6 6l12 12',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
    twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
    instagram: 'M16 3H8a5 5 0 00-5 5v8a5 5 0 005 5h8a5 5 0 005-5V8a5 5 0 00-5-5zM12 16a4 4 0 110-8 4 4 0 010 8zM17.5 6.5h.01',
    bolt: 'M13 2L3 14h7v8l10-12h-7V2z',
    filter: 'M4 6h16M7 12h10M10 18h4',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    globe: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z',
    wallet: 'M3 7a2 2 0 012-2h13a2 2 0 012 2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2zM17 13h.01',
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    check: 'M20 6L9 17l-5-5',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// ===== SKELETON =====
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-amber-200/30 rounded-2xl h-48 mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-amber-200/30 rounded w-3/4" />
        <div className="h-3 bg-amber-200/20 rounded w-1/2" />
      </div>
    </div>
  );
}

// ===== MARQUEE STRIP =====
function TicketMarquee() {
  const text = 'NOW SELLING • DON\u2019T MISS OUT • GRAB YOUR TICKET • NOW SELLING • DON\u2019T MISS OUT • GRAB YOUR TICKET • ';
  return (
    <div className="relative overflow-hidden bg-amber-800 border-y border-amber-600/30 py-2">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1].map((rep) => (
          <span key={rep} className="font-serif text-[11px] tracking-[0.3em] text-amber-200/80 uppercase px-4">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ===== ANIMATED NUMBER (counting up) =====
function AnimatedNumber({ value, prefix = 'Rp ', duration = 1.2 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView || !value) return;
    let start = 0;
    const end = Number(value);
    const startTime = performance.now();

    function tick(now) {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      start = Math.floor(end * eased);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(end);
    }
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  if (!value) return <span ref={ref}>—</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{display.toLocaleString('id-ID')}
    </span>
  );
}

// ===== MAGNETIC BUTTON =====
function MagneticButton({ children, className = '', strength = 20, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set((relX / rect.width) * strength);
    y.set((relY / rect.height) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ===== 3D TILT CARD =====
function TiltCard({ children, className = '', max = 8 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 20 });

  function handleMove(e) {
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
      style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== HERO TEXT REVEAL (per kata) =====
function RevealWords({ text, className = '', delay = 0 }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ===== CATEGORY PILL =====
function CategoryPill({ category, isActive, onClick }) {
  const icons = {
    Konser: 'music',
    Festival: 'flame',
    Teater: 'ticket',
    Exhibition: 'star',
    All: 'grid',
  };
  const iconName = icons[category?.name] || 'ticket';

  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      className={`flex-shrink-0 flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border transition-all font-serif text-sm ${
        isActive
          ? 'bg-amber-800 border-amber-700 text-amber-100 shadow-md shadow-amber-900/20'
          : 'bg-white/70 border-amber-200/50 text-amber-800/80 hover:border-amber-400/60 hover:bg-white'
      }`}
    >
      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${isActive ? 'bg-amber-600/40' : 'bg-amber-100'}`}>
        <Icon name={iconName} className="w-3 h-3" />
      </span>
      {category?.name || 'All'}
    </button>
  );
}

// ===== FEATURED POSTER (hero style) =====
function HeroPoster({ concert }) {
  if (!concert) return null;
  return (
    <div className="absolute inset-0">
      {concert.poster ? (
        <img
          src={concert.poster}
          alt={concert.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-ink-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/70 via-transparent to-transparent" />
    </div>
  );
}

// ===== PROMO CARD (with 3D tilt + shine + counting price) =====
function PromoCard({ concert }) {
  if (!concert) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="grid md:grid-cols-5 gap-4 bg-white/60 border border-amber-200/40 rounded-2xl p-4 md:p-5"
    >
      {/* Poster kiri with tilt */}
      <TiltCard className="md:col-span-3">
        <Link
          to={`/concerts/${concert.id}`}
          className="relative block aspect-[16/10] md:aspect-auto md:h-64 rounded-xl overflow-hidden group bg-ink-900"
        >
          {concert.poster ? (
            <img
              src={concert.poster}
              alt={concert.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-600">
              <Icon name="music" className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />

          {/* Shine sweep on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          />

          <div className="absolute bottom-4 left-4 right-4">
            <span className="font-serif text-[9px] tracking-[0.3em] text-amber-400 uppercase">
              {concert.category_name || 'Event'}
            </span>
            <h3 className="font-serif text-white text-lg md:text-xl mt-1 leading-tight">
              {concert.name}
            </h3>
          </div>
        </Link>
      </TiltCard>

      {/* Right card */}
      <div className="md:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon name="flame" className="w-4 h-4 text-amber-600" />
            <span className="font-serif text-[10px] tracking-[0.25em] text-amber-700 uppercase">
              Promo Spesial
            </span>
          </div>

          <p className="text-xs font-serif text-amber-700/60 mb-3 leading-relaxed">
            Tickets cost {concert.min_price ? formatRupiah(concert.min_price) : 'Segera'}
            {concert.city ? ` — ${concert.city}` : ''}
          </p>

          {/* Price mini cards (ala referensi card "Buy") */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-white border border-amber-200/50 rounded-xl p-3">
              <div className="text-[9px] font-serif tracking-[0.2em] text-amber-600/60 uppercase mb-1">
                Mulai dari
              </div>
              <div className="font-serif text-base font-bold text-amber-800">
                <AnimatedNumber value={concert.min_price} />
              </div>
            </div>
            <Link
              to={`/concerts/${concert.id}`}
              className="bg-amber-800 hover:bg-amber-700 text-amber-50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-colors group"
            >
              <Icon name="arrow" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span className="text-[10px] font-serif tracking-[0.2em] uppercase">
                Pilih
              </span>
            </Link>
          </div>
        </div>

        <Link
          to={`/concerts/${concert.id}`}
          className="inline-flex items-center justify-center gap-2 py-2.5 border border-amber-400/50 rounded-full text-xs font-serif text-amber-800 hover:bg-amber-50 transition-colors"
        >
          <Icon name="calendar" className="w-3.5 h-3.5" />
          Pilih Tanggal
        </Link>
      </div>
    </motion.div>
  );
}

// ===== STEP CARD (with animated number reveal) =====
function StepCard({ number, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white/70 border border-amber-200/40 rounded-2xl p-5 pt-8 text-center"
    >
      <motion.span
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
        className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-800 text-amber-50 flex items-center justify-center font-serif font-bold text-sm shadow-lg shadow-amber-900/20"
      >
        {number}
      </motion.span>
      <h4 className="font-serif text-sm tracking-[0.15em] text-amber-900 uppercase mb-2">
        {title}
      </h4>
      <p className="text-xs font-serif text-amber-700/60 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

// ===== WHY CARD (bento grid "Why buy from us") =====
function WhyCard({ variant = 'light', title, subtitle, icon, delay = 0 }) {
  const variants = {
    light: 'bg-white/70 border-amber-200/40 text-amber-900',
    dark: 'bg-ink-950 border-ink-800 text-amber-100',
    amber: 'bg-amber-700 border-amber-600 text-amber-50',
  };
  const cls = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`${cls} border rounded-2xl p-5 flex flex-col justify-between min-h-[120px]`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`font-serif text-sm tracking-[0.15em] uppercase ${variant === 'light' ? 'text-amber-800' : 'text-inherit'}`}>
          {title}
        </h4>
        {icon && <Icon name={icon} className="w-4 h-4 opacity-60" />}
      </div>
      <p className={`text-xs font-serif leading-relaxed ${variant === 'light' ? 'text-amber-700/60' : 'opacity-70'}`}>
        {subtitle}
      </p>
    </motion.div>
  );
}

// ===== FAQ ITEM (ala "Frequent questions") =====
function FaqItem({ question, answer, open, onToggle }) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${
      open
        ? 'bg-amber-50 border-amber-300'
        : 'bg-white/70 border-amber-200/50'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <span className="flex-1 font-serif text-sm text-amber-900">
          {question}
        </span>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          open ? 'bg-amber-700 text-amber-50' : 'bg-amber-100 text-amber-700'
        }`}>
          <Icon name={open ? 'minus' : 'plus'} className="w-3 h-3" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-4 pb-4 text-xs font-serif text-amber-700/70 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== EVENT ROW (All Events) with poster zoom + info slide =====
function EventRow({ concert, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: Math.min(0.03 * index, 0.4) }}
    >
      <Link
        to={`/concerts/${concert.id}`}
        className="group flex items-center gap-4 md:gap-6 py-4 border-b border-amber-900/10 hover:bg-white/40 transition-colors -mx-3 px-3 rounded-sm"
      >
        <span className="hidden sm:block font-serif text-xs text-amber-400/50 w-6 flex-shrink-0 tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-ink-800 flex-shrink-0">
          {concert.poster ? (
            <img
              src={concert.poster}
              alt={concert.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-600">
              <Icon name="music" className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-sm md:text-base text-amber-950 group-hover:text-amber-700 transition-colors truncate">
            {concert.name}
          </h4>
          <motion.div
            className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-amber-700/50 font-serif"
            initial={false}
          >
            <span className="truncate">{concert.artist}</span>
            <span className="hidden sm:flex items-center gap-1">
              <Icon name="pin" className="w-3 h-3" />
              {concert.city || '-'}
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Icon name="calendar" className="w-3 h-3" />
              {concert.nearest_date ? formatDate(concert.nearest_date) : 'TBA'}
            </span>
          </motion.div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-sm font-serif text-amber-800 font-semibold">
            {concert.min_price ? formatRupiah(concert.min_price) : 'Segera'}
          </div>
          {Number(concert.avg_rating) > 0 && (
            <div className="text-[10px] text-amber-600/60 font-serif flex items-center gap-1 justify-end mt-0.5">
              <Icon name="star" className="w-2.5 h-2.5" />
              {Number(concert.avg_rating)}
            </div>
          )}
        </div>

        <Icon
          name="arrow"
          className="hidden sm:block w-4 h-4 text-amber-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all flex-shrink-0"
        />
      </Link>
    </motion.div>
  );
}

// ===== FAQ DATA =====
const FAQS = [
  {
    q: 'Bagaimana cara mendapatkan e-ticket?',
    a: 'E-ticket akan dikirim ke email kamu setelah pembayaran berhasil. Kamu juga bisa melihatnya di halaman My Tickets.',
  },
  {
    q: 'Apakah tiket bisa di-refund?',
    a: 'Tiket tidak dapat dikembalikan, kecuali event dibatalkan oleh penyelenggara.',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Kami mendukung Virtual Account, QRIS, e-wallet (GoPay, OVO, Dana, ShopeePay), dan kartu kredit melalui Xendit.',
  },
  {
    q: 'Apakah ada diskon untuk pelajar?',
    a: 'Beberapa event menyediakan kategori tiket khusus dengan harga lebih rendah. Cek halaman event untuk detailnya.',
  },
  {
    q: 'Bagaimana cara mengubah tanggal tiket?',
    a: 'Hubungi customer support kami melalui halaman Contact untuk perubahan jadwal (jika diizinkan oleh penyelenggara).',
  },
  {
    q: 'Apa yang perlu dibawa saat masuk venue?',
    a: 'Cukup tunjukkan e-ticket (QR code) di pintu masuk. Beberapa venue juga memerlukan KTP asli untuk verifikasi.',
  },
];

// ===== SECTION WRAPPER (reusable reveal) =====
function RevealSection({ children, delay = 0, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ===== MAIN HOME COMPONENT =====
export default function Home() {
  const [concerts, setConcerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [emailSub, setEmailSub] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');

  // Hero parallax
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/banners').then((res) => setBanners(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
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

  useEffect(() => {
    fetchConcerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, categoryId, debouncedCity]);

  async function fetchConcerts() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryId) params.category_id = categoryId;
      if (debouncedCity) params.city = debouncedCity;
      const res = await api.get('/concerts', { params });
      setConcerts(res.data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch('');
    setCity('');
    setCategoryId('');
    setActiveCategory('all');
    setDebouncedSearch('');
    setDebouncedCity('');
  }

  const featured = concerts[0];
  const promoConcerts = concerts.slice(1, 3);
  const restEvents = concerts.slice(featured ? 3 : 0);
  const bannerUrl = banners[currentBanner]?.image_url || '';
  const hasActiveFilters = search || city || categoryId;
  const isSearching = search !== debouncedSearch || city !== debouncedCity;

  return (
    <div className="min-h-screen bg-[#f5ede4]">

      {/* ===== HERO with parallax ===== */}
      <div ref={heroRef} className="relative h-[420px] md:h-[520px] bg-ink-950 overflow-hidden">
        <motion.div
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0"
        >
          <AnimatePresence mode="wait">
            {bannerUrl ? (
              <motion.div
                key={bannerUrl}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 0.5, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${bannerUrl}')` }}
              />
            ) : featured ? (
              <HeroPoster concert={featured} />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950" />
            )}
          </AnimatePresence>
        </motion.div>

        <div className="absolute -right-32 -top-24 w-[32rem] h-[32rem] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 w-72 h-72 rounded-full bg-amber-400/5 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/60" />

        <div className="relative h-full max-w-7xl mx-auto px-4 pt-12 md:pt-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-4 border border-amber-500/20 rounded-full px-3 py-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] font-serif tracking-[0.3em] text-amber-400 uppercase">Live Events</span>
            </motion.div>

            <h1 className="font-serif text-4xl md:text-6xl text-white leading-[0.95]">
              <RevealWords text="Temukan event" delay={0.2} />
              <br />
              <RevealWords text="favoritmu." className="text-amber-400 italic" delay={0.5} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-amber-300/50 text-sm md:text-base font-serif mt-4 max-w-md"
            >
              Ribuan event, satu tiket. Dari konser hingga festival — gerbangmu menanti.
            </motion.p>
          </div>
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentBanner ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== SEARCH PANEL ===== */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl shadow-2xl shadow-amber-950/30 border border-amber-200/50 overflow-hidden"
        >
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-amber-100">
            {['Konser', 'Festival', 'Teater', 'Semua'].map((tab) => {
              const isAll = tab === 'Semua';
              return (
                <button
                  key={tab}
                  onClick={() => {
                    if (isAll) {
                      setActiveCategory('all');
                      setCategoryId('');
                    }
                  }}
                  className={`relative px-4 py-2 text-xs font-serif tracking-wide transition-colors ${
                    isAll && activeCategory === 'all'
                      ? 'text-amber-900'
                      : 'text-amber-700/50 hover:text-amber-900'
                  }`}
                >
                  {tab}
                  {isAll && activeCategory === 'all' && (
                    <motion.div
                      layoutId="searchTabUnderline"
                      className="absolute left-2 right-2 -bottom-px h-0.5 bg-amber-700 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="col-span-2 md:col-span-2 flex items-center gap-2 bg-amber-50/60 rounded-xl px-3 h-12">
              <Icon name="search" className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <input
                className="flex-1 bg-transparent text-amber-950 placeholder-amber-400/70 focus:outline-none font-serif text-sm"
                placeholder="Cari event, artis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-span-2 md:col-span-1 flex items-center gap-2 bg-amber-50/60 rounded-xl px-3 h-12">
              <Icon name="pin" className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <input
                className="flex-1 bg-transparent text-amber-950 placeholder-amber-400/70 focus:outline-none font-serif text-sm w-full"
                placeholder="Kota"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="hidden md:flex col-span-1 items-center gap-2 bg-amber-50/60 rounded-xl px-3 h-12 cursor-pointer hover:bg-amber-100/60 transition-colors">
              <Icon name="calendar" className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-serif text-sm text-amber-400/70">
                Tanggal
              </span>
            </div>

            <MagneticButton
              onClick={fetchConcerts}
              className="col-span-2 md:col-span-1 h-12 rounded-xl bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="search" className="w-4 h-4" />
              Cari
            </MagneticButton>
          </div>
        </motion.div>

        {(hasActiveFilters || isSearching) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 px-1 text-xs font-serif text-amber-700/70">
            {isSearching ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Mencari...
              </span>
            ) : (
              <>
                <span>Filter aktif:</span>
                {search && <span className="bg-amber-100/70 px-2 py-0.5 rounded-full">"{search}"</span>}
                {city && (
                  <span className="bg-amber-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Icon name="pin" className="w-2.5 h-2.5" />
                    {city}
                  </span>
                )}
                <button onClick={clearFilters} className="text-amber-600 hover:text-amber-800 underline ml-1">
                  Clear all
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <TicketMarquee />

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-amber-800/60 font-serif mb-4">{error}</p>
            <button
              onClick={fetchConcerts}
              className="px-6 py-2.5 bg-amber-800 text-amber-200 font-serif text-sm rounded-full hover:bg-amber-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : concerts.length === 0 ? (
          <div className="text-center py-16">
            <EmptyState text="No events found. Try adjusting your filters." />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 border border-amber-400/40 text-amber-700 font-serif text-sm rounded-full hover:bg-amber-100/50 transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* ===== PROMOTIONAL TICKETS ===== */}
            {promoConcerts.length > 0 && (
              <RevealSection className="mb-14">
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl text-amber-950">
                      Promotional tickets
                    </h2>
                    <p className="text-sm font-serif text-amber-700/60 mt-1">
                      Event pilihan dengan harga spesial minggu ini
                    </p>
                  </div>
                  <Link
                    to="/promos"
                    className="text-xs font-serif text-amber-700 hover:text-amber-900 flex items-center gap-1 group"
                  >
                    Lihat semua
                    <Icon name="arrow" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {promoConcerts.map((c) => (
                    <PromoCard key={c.id} concert={c} />
                  ))}
                </div>
              </RevealSection>
            )}

            {/* ===== BOOK IN 3 STEPS ===== */}
            <RevealSection delay={0.05} className="mb-14">
              <div className="mb-8">
                <h2 className="font-serif text-2xl md:text-3xl text-amber-950">
                  Pesan tiket dalam 3 langkah
                </h2>
                <p className="text-sm font-serif text-amber-700/60 mt-1">
                  Nggak sampai 5 menit — janji!
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6 pt-4">
                <StepCard
                  number="01"
                  title="Pilih Event"
                  description="Tentukan konser, festival, atau teater yang ingin kamu tonton."
                />
                <StepCard
                  number="02"
                  title="Pilih Tiket"
                  description="Pilih kategori tiket, jadwal, dan jumlah yang kamu butuhkan."
                />
                <StepCard
                  number="03"
                  title="Bayar"
                  description="Selesaikan pembayaran via VA, QRIS, atau e-wallet favoritmu."
                />
              </div>
            </RevealSection>

            {/* ===== WHY BUY FROM US ===== */}
            <RevealSection delay={0.05} className="mb-14">
              <div className="mb-8">
                <h2 className="font-serif text-2xl md:text-3xl text-amber-950">
                  Kenapa beli tiket di TiketKu?
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-2">
                  <WhyCard
                    variant="light"
                    title="Convenience"
                    subtitle="Beli tiket, ubah, atau refund dengan mudah lewat satu platform."
                    icon="wallet"
                    delay={0}
                  />
                </div>
                <div>
                  <WhyCard
                    variant="amber"
                    title="Diskon 10%"
                    subtitle="Harga tiket lebih murah untuk pengguna baru."
                    icon="flame"
                    delay={0.05}
                  />
                </div>
                <div>
                  <WhyCard
                    variant="light"
                    title="+80"
                    subtitle="Event organizer bekerja sama dengan kami."
                    icon="users"
                    delay={0.1}
                  />
                </div>
                <div>
                  <WhyCard
                    variant="dark"
                    title="Dalam 5 Menit"
                    subtitle="Proses pemesanan kilat, tanpa ribet."
                    icon="bolt"
                    delay={0.15}
                  />
                </div>
                <div>
                  <WhyCard
                    variant="light"
                    title="+8 Ribu"
                    subtitle="Tiket berhasil terjual lewat platform kami."
                    icon="ticket"
                    delay={0.2}
                  />
                </div>
                <div className="col-span-2">
                  <WhyCard
                    variant="light"
                    title="Aman & Terpercaya"
                    subtitle="Setiap pembayaran diverifikasi dan e-ticket dijamin asli."
                    icon="shield"
                    delay={0.25}
                  />
                </div>
              </div>
            </RevealSection>

            {/* ===== ALL EVENTS (list) ===== */}
            <RevealSection delay={0.05} className="mb-14">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-amber-600" />
                <h2 className="font-serif text-2xl md:text-3xl text-amber-950">
                  Semua Event
                </h2>
                <span className="text-[10px] font-serif tracking-[0.25em] text-amber-400/60 uppercase">
                  {concerts.length} events
                </span>
              </div>

              <div>
                {restEvents.map((c, index) => (
                  <EventRow key={c.id} concert={c} index={index} />
                ))}
              </div>
            </RevealSection>

            {/* ===== FAQ ===== */}
            <RevealSection delay={0.05} className="mb-14">
              <div className="mb-8">
                <h2 className="font-serif text-2xl md:text-3xl text-amber-950">
                  Pertanyaan umum
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {FAQS.map((faq, idx) => (
                  <FaqItem
                    key={idx}
                    question={faq.q}
                    answer={faq.a}
                    open={openFaq === idx}
                    onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 border border-amber-200/40 rounded-2xl p-5">
                <div>
                  <p className="font-serif text-amber-900 font-semibold">
                    Masih ada pertanyaan?
                  </p>
                  <p className="text-xs font-serif text-amber-700/60 mt-1">
                    Tim kami siap membantu kamu.
                  </p>
                </div>
                <Link
                  to="/contact"
                  className="px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase rounded-full transition-colors inline-flex items-center gap-2"
                >
                  Hubungi Kami
                  <Icon name="arrow" className="w-3.5 h-3.5" />
                </Link>
              </div>
            </RevealSection>

            {/* ===== CTA BANNER ===== */}
            <RevealSection delay={0.05}>
              <div className="relative rounded-3xl overflow-hidden">
                <div className="relative h-64 md:h-72 bg-ink-950">
                  {featured?.poster && (
                    <img
                      src={featured.poster}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-transparent" />
                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
                      backgroundSize: '26px 26px',
                    }}
                  />

                  <div className="relative h-full max-w-2xl mx-auto px-6 flex flex-col items-center justify-center text-center">
                    <h2 className="font-serif text-2xl md:text-3xl text-white leading-tight mb-2">
                      Perjalanan Seru Dimulai di Sini
                    </h2>
                    <p className="text-amber-300/60 text-sm font-serif mb-5 max-w-md">
                      Berlangganan untuk mendapatkan info event terbaru dan promo eksklusif.
                    </p>

                    <form
                      onSubmit={(e) => { e.preventDefault(); setEmailSub(''); }}
                      className="w-full max-w-md flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-1.5 border border-white/20"
                    >
                      <div className="flex-1 flex items-center gap-2 pl-3">
                        <Icon name="mail" className="w-4 h-4 text-amber-300/80 flex-shrink-0" />
                        <input
                          type="email"
                          required
                          value={emailSub}
                          onChange={(e) => setEmailSub(e.target.value)}
                          placeholder="Email kamu"
                          className="flex-1 bg-transparent text-white placeholder-amber-200/50 focus:outline-none font-serif text-sm py-2"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-serif text-xs tracking-[0.2em] uppercase rounded-full transition-colors"
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </RevealSection>
          </motion.div>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="bg-ink-950 border-t border-amber-900/20 mt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-800/30 border border-amber-500/20 flex items-center justify-center">
                  <Icon name="ticket" className="w-4 h-4 text-amber-400" />
                </div>
                <span className="font-serif text-lg text-amber-200 tracking-wide">TiketKu</span>
              </div>
              <p className="text-xs text-amber-300/50 font-serif leading-relaxed">
                Your gateway to unforgettable experiences. From intimate concerts to grand festivals.
              </p>
              <div className="flex gap-2 mt-4">
                {['facebook', 'twitter', 'instagram'].map((social) => (
                  <motion.button
                    key={social}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-full border border-amber-500/20 bg-amber-800/20 flex items-center justify-center text-amber-400 hover:bg-amber-700/30 hover:border-amber-500/40 transition-colors"
                    aria-label={`Follow us on ${social}`}
                  >
                    <Icon name={social} className="w-3.5 h-3.5" />
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-serif text-xs tracking-[0.3em] text-amber-400/80 uppercase mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Promo & Diskon', href: '/promos' },
                  { label: 'My Tickets', href: '/my-orders' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-xs text-amber-300/60 font-serif hover:text-amber-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-xs tracking-[0.3em] text-amber-400/80 uppercase mb-3">Categories</h4>
              <ul className="space-y-2">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setCategoryId(cat.id);
                        setActiveCategory(cat.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-xs text-amber-300/60 font-serif hover:text-amber-300 transition-colors"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-xs tracking-[0.3em] text-amber-400/80 uppercase mb-3">Stay Updated</h4>
              <p className="text-xs text-amber-300/50 font-serif mb-3">Get the latest events and exclusive offers.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-ink-900/50 border border-amber-500/20 rounded-full text-xs text-amber-200 placeholder-amber-300/30 focus:outline-none focus:border-amber-500/40 transition-all font-serif"
                />
                <button className="px-4 py-2 bg-amber-800/80 hover:bg-amber-700 text-amber-200 text-xs font-serif rounded-full transition-colors border border-amber-500/30">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-900/20 mt-8 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-amber-300/40 font-serif">© 2026 TiketKu. All rights reserved.</p>
              <div className="flex gap-4">
                {['Privacy Policy', 'Terms of Service', 'FAQ'].map((item) => (
                  <button key={item} className="text-[10px] text-amber-300/40 font-serif hover:text-amber-300/60 transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 bg-gradient-to-r from-amber-900/20 via-amber-800/10 to-amber-900/20 flex items-center justify-center gap-3">
          <div className="w-16 h-px bg-amber-500/20" />
          <Icon name="music" className="w-3 h-3 text-amber-500/30" />
          <div className="w-16 h-px bg-amber-500/20" />
        </div>
      </footer>
    </div>
  );
}