import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useAnimationControls,
  useReducedMotion,
} from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const EASE = [0.22, 1, 0.36, 1];

/* ============ HELPERS ============ */
function generateTicketNo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TK-${code}`;
}

const ROUTES_BY_ROLE = {
  admin: '/admin/dashboard',
  petugas: '/petugas/scan',
  eo: '/eo/dashboard',
};

const BARS = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1, 4];
const PERKS = ['Free to join', 'Instant tickets', 'Secure payments'];
const MIN_PASSWORD = 6;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ============ ICONS ============ */
const ICON_PATHS = {
  check: 'M5 13l4 4L19 7',
  arrow: 'M13 7l5 5-5 5M6 12h12',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin motion-reduce:animate-none ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/* ============ ANIMASI ============ */
// Urutan saat sukses: cap "Welcome in" menghantam tiket, lalu tiket disobek dan halaman pindah.
const STAMP_MS = 620;
const TEAR_MS = 780;
const tearTransition = { duration: 0.65, ease: [0.5, 0, 0.2, 1] };

const barcodeVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025, delayChildren: 0.6 } },
};
const barVariants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

const lineVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.3 + i * 0.1, duration: 0.4, ease: 'easeOut' } }),
};

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';
const focusRingDark =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-1 focus-visible:ring-offset-amber-950';

const inputCls =
  'w-full px-4 py-3 bg-white/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .register-pass { --left-w: 19rem; }
  @media (min-width: 768px) {
    .pass-left {
      -webkit-mask:
        radial-gradient(circle 11px at 100% 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 11px at 100% 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
      mask:
        radial-gradient(circle 11px at 100% 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 11px at 100% 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
    }
    .pass-right {
      -webkit-mask:
        radial-gradient(circle 11px at 0 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 11px at 0 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
      mask:
        radial-gradient(circle 11px at 0 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 11px at 0 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
    }
  }
`;

/* ============ SMALL COMPONENTS ============ */
// Tanda centang yang tergambar saat isi field sudah valid
function Tick() {
  return (
    <motion.span
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        />
      </svg>
    </motion.span>
  );
}

function Field({ id, label, optional = false, valid = false, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-amber-900 mb-1.5">
        {label}
        {optional && <span className="font-normal text-amber-700/70"> (optional)</span>}
      </label>
      <div className="relative">
        {children}
        <AnimatePresence>{valid && <Tick key="tick" />}</AnimatePresence>
      </div>
    </div>
  );
}

// Huruf baru muncul satu per satu, huruf yang sudah ada tidak bergerak lagi
function LiveText({ text }) {
  return (
    <span aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.25, ease: EASE }}
          className="inline-block whitespace-pre"
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ============ LIVE TICKET PANEL ============ */
// Panel gelap di kiri, isinya ngikutin form yang diisi user
function LiveTicketPanel({ form, issuedDate, ticketNo, isDesktop, tearing, tearState }) {
  const firstWord = form.name.trim().split(/\s+/)[0] || '';
  const hasName = firstWord.length > 0;
  const hasEmail = form.email.trim().length > 0;
  const hasPhone = form.phone.trim().length > 0;

  return (
    <motion.section
      animate={tearing ? tearState : { x: 0, y: 0, rotate: 0, opacity: 1 }}
      transition={tearTransition}
      style={{ transformOrigin: isDesktop ? '100% 100%' : '50% 100%' }}
      className="pass-left relative bg-amber-950 text-amber-50 p-7 md:p-9 flex flex-col rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl overflow-hidden"
    >
      {/* Frame tipis di dalam */}
      <span className="pointer-events-none absolute inset-3 rounded-lg border border-amber-200/10" aria-hidden="true" />

      <Link
        to="/"
        className={`relative inline-flex items-baseline self-start rounded-lg f-display text-2xl font-bold ${focusRingDark}`}
      >
        tiket<span className="text-amber-400">ku</span>
      </Link>

      {/* === HEADER: berubah mengikuti form.name === */}
      <div className="relative mt-8 md:mt-12">
        <h1 className="f-display text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight">
          <motion.span custom={0} variants={lineVariants} initial="hidden" animate="show" className="block">
            {hasName ? 'Welcome,' : 'Join the'}
          </motion.span>
          <motion.span custom={1} variants={lineVariants} initial="hidden" animate="show" className="block">
            {hasName ? (
              <span className="text-amber-400">
                <LiveText text={firstWord} />
              </span>
            ) : (
              <>experience<span className="text-amber-400">.</span></>
            )}
          </motion.span>
        </h1>
        <motion.p
          custom={2}
          variants={lineVariants}
          initial="hidden"
          animate="show"
          className="text-sm text-amber-200/70 mt-4 leading-relaxed max-w-[15rem]"
        >
          {hasName
            ? "Your ticket is being printed. Fill in the rest and you're in."
            : 'Create your account and never miss a beat. Your next event is one ticket away.'}
        </motion.p>

        <AnimatePresence mode="wait">
          {!hasName && (
            <motion.ul
              key="perks"
              custom={3}
              variants={lineVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-2 overflow-hidden"
            >
              {PERKS.map((label) => (
                <li key={label} className="flex items-center gap-2 text-sm text-amber-100">
                  <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-400 flex items-center justify-center shrink-0">
                    <Icon name="check" className="w-3 h-3" />
                  </span>
                  {label}
                </li>
              ))}
            </motion.ul>
          )}

          {/* === LIVE PREVIEW: data user dicetak di sini === */}
          {hasName && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
              className="mt-6 space-y-3"
            >
              <LiveRow icon="user" label="Name" value={form.name} show={hasName} />
              <LiveRow icon="mail" label="Email" value={form.email} show={hasEmail} />
              <LiveRow icon="phone" label="Phone" value={form.phone} show={hasPhone} />
              {form.password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-7 h-7 rounded-lg bg-amber-900/60 flex items-center justify-center shrink-0 text-amber-400">
                    <Icon name="check" className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-amber-300/60">Password strength</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {/* Satu kotak per karakter, menyala satu per satu */}
                      <div className="flex-1 flex gap-1" aria-hidden="true">
                        {Array.from({ length: MIN_PASSWORD }).map((_, i) => {
                          const filled = form.password.length > i;
                          return (
                            <motion.span
                              key={i}
                              animate={{
                                backgroundColor: filled ? '#fbbf24' : 'rgba(120, 53, 15, 0.8)',
                                scaleY: filled ? 1 : 0.6,
                              }}
                              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                              className="flex-1 h-1.5 rounded-full origin-bottom"
                            />
                          );
                        })}
                      </div>
                      <span className="text-[10px] font-mono text-amber-300/70 tabular-nums">
                        {form.password.length}/{MIN_PASSWORD}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* === FOOTER: issued + barcode === */}
      <div className="relative hidden md:block mt-auto pt-10">
        <div className="border-t border-dashed border-amber-800 pt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-amber-200/60">Issued</p>
            <p className="f-display text-base font-semibold tabular-nums">{issuedDate}</p>
          </div>
          <div className="relative overflow-hidden">
            <motion.div
              variants={barcodeVariants}
              initial="hidden"
              animate="show"
              className="flex items-end gap-0.5 opacity-50"
              aria-hidden="true"
            >
              {BARS.map((w, i) => (
                <motion.span
                  key={i}
                  variants={barVariants}
                  className="bg-amber-200 origin-bottom"
                  style={{ width: `${w}px`, height: i % 3 === 0 ? '28px' : '22px' }}
                />
              ))}
            </motion.div>
            {/* Sinar scanner menyapu barcode sekali setelah selesai tercetak */}
            <motion.span
              aria-hidden="true"
              initial={{ left: '-20%', opacity: 0 }}
              animate={{ left: '110%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.9, delay: 1.4, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-amber-300/80 to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Nomor seri vertikal */}
      <span
        className="hidden md:block absolute right-5 top-1/2 -translate-y-1/2 rotate-180 text-xs tracking-[0.25em] text-amber-200/35 tabular-nums"
        style={{ writingMode: 'vertical-rl' }}
        aria-hidden="true"
      >
        No. {ticketNo}
      </span>
    </motion.section>
  );
}

// Baris data live di panel kiri: nilainya "dicetak" dari kiri ke kanan
function LiveRow({ icon, label, value, show }) {
  if (!show || !value.trim()) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex items-start gap-3"
    >
      <span className="w-7 h-7 rounded-lg bg-amber-900/60 flex items-center justify-center shrink-0 text-amber-400">
        <Icon name={icon} className="w-3.5 h-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-amber-300/60">{label}</p>
        <motion.p
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-sm text-amber-50 truncate"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
}

/* ============ MAIN ============ */
export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle -> stamp -> tear
  const [showPassword, setShowPassword] = useState(false);
  const [ticketNo] = useState(generateTicketNo);
  const { login } = useAuth();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const shake = useAnimationControls();

  const tearing = phase === 'tear';

  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const googleRef = useRef(null);
  const [googleWidth, setGoogleWidth] = useState(280);
  useEffect(() => {
    const el = googleRef.current;
    if (!el) return undefined;
    const update = () => setGoogleWidth(Math.max(200, Math.min(400, Math.floor(el.clientWidth))));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const issuedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const valid = {
    name: form.name.trim().length >= 2,
    email: EMAIL_RE.test(form.email.trim()),
    phone: form.phone.replace(/\D/g, '').length >= 8,
  };
  const ready = valid.name && valid.email && form.password.length >= MIN_PASSWORD;

  async function finishAuth(data) {
    if (!reduceMotion) {
      // 1. cap menghantam tiket
      setPhase('stamp');
      shake.start({
        scale: [1, 0.975, 1.01, 1],
        y: [0, 5, -2, 0],
        transition: { duration: 0.35, delay: 0.12 },
      });
      await wait(STAMP_MS);
      // 2. tiket disobek
      setPhase('tear');
      await wait(TEAR_MS);
    }
    login(data.token, data.user);
    navigate(ROUTES_BY_ROLE[data.user.role] || '/', { replace: true });
  }

  function fail(message) {
    setPhase('idle');
    setError(message);
    shake.start({ x: [0, -9, 9, -6, 6, -3, 0], transition: { duration: 0.45, ease: 'easeOut' } });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < MIN_PASSWORD) {
      fail(`Use a password with at least ${MIN_PASSWORD} characters.`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      await finishAuth(data);
    } catch (err) {
      fail(err.response?.data?.message || "Couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });
      await finishAuth(data);
    } catch (err) {
      fail(err.response?.data?.message || "Couldn't sign you up with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const leftTear = isDesktop
    ? { x: -60, y: 16, rotate: -6, opacity: 0 }
    : { x: 0, y: -40, rotate: -2, opacity: 0 };
  const rightTear = isDesktop
    ? { x: 60, y: -10, rotate: 4, opacity: 0 }
    : { x: 0, y: 40, rotate: 2, opacity: 0 };

  const passwordGap = MIN_PASSWORD - form.password.length;

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen relative flex items-center justify-center px-4 py-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80')` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        {/* Tiket naik dari bawah sambil menegak, seperti diangkat dari meja */}
        <div className="w-full max-w-3xl relative" style={{ perspective: 1400 }}>
          <motion.main
            initial={{ opacity: 0, y: 56, rotateX: 16 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ type: 'spring', stiffness: 130, damping: 17 }}
            style={{ transformOrigin: '50% 100%' }}
            className="relative"
            aria-busy={loading}
          >
            <div className="drop-shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
              <motion.div animate={shake}>
                <div className="register-pass relative grid md:grid-cols-[var(--left-w)_1fr]">

                  {/* ===== KIRI: LIVE TICKET PANEL ===== */}
                  <LiveTicketPanel
                    form={form}
                    issuedDate={issuedDate}
                    ticketNo={ticketNo}
                    isDesktop={isDesktop}
                    tearing={tearing}
                    tearState={leftTear}
                  />

                  {/* ===== KANAN: FORM ===== */}
                  <motion.section
                    animate={tearing ? rightTear : { x: 0, y: 0, rotate: 0, opacity: 1 }}
                    transition={tearTransition}
                    style={{ transformOrigin: isDesktop ? '0% 0%' : '50% 0%' }}
                    className="pass-right relative bg-[#faf6ef] p-7 md:p-10 border-t border-dashed border-amber-300/80 md:border-t-0 rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl overflow-hidden"
                  >
                    <motion.span
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
                      style={{ transformOrigin: 'top' }}
                      className="hidden md:block absolute left-0 top-6 bottom-6 border-l-2 border-dashed border-amber-300/70"
                      aria-hidden="true"
                    />

                    <h2 className="f-display text-2xl font-semibold text-amber-950">Sign up</h2>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          role="alert"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm"
                        >
                          <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                      <Field id="reg-name" label="Full name" valid={valid.name}>
                        <input
                          id="reg-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          className={`${inputCls} pr-10`}
                          value={form.name}
                          onChange={setField('name')}
                          placeholder="John Doe"
                        />
                      </Field>

                      <Field id="reg-email" label="Email" valid={valid.email}>
                        <input
                          id="reg-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          className={`${inputCls} pr-10`}
                          value={form.email}
                          onChange={setField('email')}
                          placeholder="you@example.com"
                        />
                      </Field>

                      <Field id="reg-phone" label="Phone" optional valid={valid.phone}>
                        <input
                          id="reg-phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          className={`${inputCls} pr-10`}
                          value={form.phone}
                          onChange={setField('phone')}
                          placeholder="0812xxxxxxx"
                        />
                      </Field>

                      <Field id="reg-password" label="Password">
                        <div className="relative">
                          <input
                            id="reg-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={MIN_PASSWORD}
                            autoComplete="new-password"
                            aria-describedby="reg-password-hint"
                            className={`${inputCls} pr-16`}
                            value={form.password}
                            onChange={setField('password')}
                            placeholder={`At least ${MIN_PASSWORD} characters`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-pressed={showPassword}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-sm font-medium text-amber-700 hover:text-amber-950 transition-colors ${focusRing}`}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <p id="reg-password-hint" aria-live="polite" className="text-xs text-amber-700/80 mt-1.5 min-h-[1rem]">
                          {form.password.length > 0 && passwordGap > 0
                            ? `${passwordGap} more ${passwordGap === 1 ? 'character' : 'characters'} to go`
                            : ''}
                        </p>
                      </Field>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-800 hover:bg-amber-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-amber-50 text-sm font-semibold rounded-xl transition-all ${focusRing}`}
                      >
                        {loading ? (
                          <>
                            <Spinner />
                            {phase !== 'idle' ? 'Welcome in…' : 'Creating your account…'}
                          </>
                        ) : (
                          <>
                            Create account
                            {/* Panah bergoyang pelan saat form sudah siap dikirim */}
                            <motion.span
                              animate={ready ? { x: [0, 4, 0] } : { x: 0 }}
                              transition={ready ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
                              className="inline-flex"
                            >
                              <Icon name="arrow" className="w-4 h-4" />
                            </motion.span>
                          </>
                        )}
                      </button>
                    </form>

                    <div className="flex items-center gap-3 my-5" aria-hidden="true">
                      <span className="flex-1 border-t border-dashed border-amber-300/80" />
                      <span className="text-sm text-amber-700/80">or</span>
                      <span className="flex-1 border-t border-dashed border-amber-300/80" />
                    </div>

                    <div ref={googleRef} className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => fail("Google sign-up didn't complete. Please try again.")}
                        theme="outline"
                        size="large"
                        text="signup_with"
                        shape="pill"
                        width={String(googleWidth)}
                      />
                    </div>

                    <p className="text-center text-sm text-amber-800 mt-6">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className={`font-semibold text-amber-900 underline underline-offset-4 decoration-amber-400 hover:decoration-amber-800 rounded ${focusRing}`}
                      >
                        Sign in
                      </Link>
                    </p>
                  </motion.section>

                  {/* ===== CAP "WELCOME IN": menghantam tiket sebelum disobek ===== */}
                  <AnimatePresence>
                    {phase !== 'idle' && (
                      <motion.div
                        key="stamp"
                        aria-hidden="true"
                        initial={{ scale: 2.6, opacity: 0, rotate: -24 }}
                        animate={
                          tearing
                            ? { scale: 1, opacity: 0, rotate: -10, y: -16 }
                            : { scale: 1, opacity: 1, rotate: -10, y: 0 }
                        }
                        exit={{ opacity: 0 }}
                        transition={
                          tearing
                            ? { duration: 0.3 }
                            : { type: 'spring', stiffness: 520, damping: 22, mass: 0.8 }
                        }
                        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                      >
                        <div className="relative">
                          <motion.span
                            initial={{ scale: 1, opacity: 0 }}
                            animate={{ scale: 2.2, opacity: [0, 0.6, 0] }}
                            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                            className="absolute inset-0 rounded-full border-2 border-emerald-400"
                          />
                          <div className="relative w-36 h-36 rounded-full bg-[#faf6ef] border-4 border-emerald-500 shadow-2xl shadow-black/40 flex flex-col items-center justify-center text-emerald-600">
                            <span className="absolute inset-1.5 rounded-full border border-emerald-500/50" />
                            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                              <motion.path
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3, delay: 0.15, ease: 'easeOut' }}
                              />
                            </svg>
                            <span className="f-display text-base font-bold mt-1">Welcome in</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.main>
        </div>
      </div>
    </MotionConfig>
  );
}