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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ============ ICONS ============ */
const ICON_PATHS = {
  check: 'M5 13l4 4L19 7',
  arrow: 'M13 7l5 5-5 5M6 12h12',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
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

/*
  Tiket terdiri dari dua bagian yang masing-masing punya lubang sendiri di sisi sobekan,
  jadi keduanya bisa terpisah saat disobek.
*/
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

function Field({ id, label, optional = false, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-amber-900 mb-1.5">
        {label}
        {optional && <span className="font-normal text-amber-700/70"> (optional)</span>}
      </label>
      {children}
    </div>
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
  const [tearing, setTearing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ticketNo] = useState(generateTicketNo);
  const { login } = useAuth();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const shake = useAnimationControls();

  // Arah sobekan mengikuti tata letak: menyamping di desktop, atas-bawah di mobile
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Tombol Google mengikuti lebar form (Google hanya menerima angka 200 sampai 400)
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

  // Tiket disobek dulu, baru sesi dimulai dan halaman berpindah
  async function finishAuth(data) {
    setTearing(true);
    if (!reduceMotion) await wait(TEAR_MS);
    login(data.token, data.user);
    navigate(ROUTES_BY_ROLE[data.user.role] || '/', { replace: true });
  }

  function fail(message) {
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
      setTearing(false);
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
      setTearing(false);
      fail(err.response?.data?.message || "Couldn't sign you up with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Posisi akhir tiap bagian saat disobek
  const restState = { x: 0, y: 0, rotate: 0, opacity: 1 };
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
        {/* Foto latar: gelap netral, sama seperti halaman Login */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80')` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        <motion.main
          initial={{ opacity: 0, y: 36, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          className="w-full max-w-3xl relative"
          aria-busy={loading}
        >
          <div className="drop-shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
            <motion.div animate={shake}>
              <div className="register-pass grid md:grid-cols-[var(--left-w)_1fr]">
                {/* ===== Bagian gelap: ajakan ===== */}
                <motion.section
                  animate={tearing ? leftTear : restState}
                  transition={tearTransition}
                  style={{ transformOrigin: isDesktop ? '100% 100%' : '50% 100%' }}
                  className="pass-left relative bg-amber-950 text-amber-50 p-7 md:p-9 flex flex-col rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl overflow-hidden"
                >
                  {/* Garis bingkai tipis di dalam, seperti tiket cetak */}
                  <span className="pointer-events-none absolute inset-3 rounded-lg border border-amber-200/10" aria-hidden="true" />

                  <Link
                    to="/"
                    className={`relative inline-flex items-baseline self-start rounded-lg f-display text-2xl font-bold ${focusRingDark}`}
                  >
                    tiket<span className="text-amber-400">ku</span>
                  </Link>

                  <div className="relative mt-8 md:mt-12">
                    <h1 className="f-display text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight">
                      <motion.span custom={0} variants={lineVariants} initial="hidden" animate="show" className="block">
                        Join the
                      </motion.span>
                      <motion.span custom={1} variants={lineVariants} initial="hidden" animate="show" className="block">
                        experience<span className="text-amber-400">.</span>
                      </motion.span>
                    </h1>
                    <motion.p
                      custom={2}
                      variants={lineVariants}
                      initial="hidden"
                      animate="show"
                      className="text-sm text-amber-200/70 mt-4 leading-relaxed max-w-[15rem]"
                    >
                      Create your account and never miss a beat. Your next event is one ticket away.
                    </motion.p>

                    <motion.ul custom={3} variants={lineVariants} initial="hidden" animate="show" className="mt-6 space-y-2">
                      {PERKS.map((label) => (
                        <li key={label} className="flex items-center gap-2 text-sm text-amber-100">
                          <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-400 flex items-center justify-center shrink-0">
                            <Icon name="check" className="w-3 h-3" />
                          </span>
                          {label}
                        </li>
                      ))}
                    </motion.ul>
                  </div>

                  <div className="relative hidden md:block mt-auto pt-10">
                    <div className="border-t border-dashed border-amber-800 pt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-amber-200/60">Issued</p>
                        <p className="f-display text-base font-semibold tabular-nums">{issuedDate}</p>
                      </div>
                      {/* Barcode tercetak batang demi batang */}
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
                    </div>
                  </div>

                  {/* Nomor seri, dicetak tegak di tepi sobekan */}
                  <span
                    className="hidden md:block absolute right-5 top-1/2 -translate-y-1/2 rotate-180 text-xs tracking-[0.25em] text-amber-200/35 tabular-nums"
                    style={{ writingMode: 'vertical-rl' }}
                    aria-hidden="true"
                  >
                    No. {ticketNo}
                  </span>
                </motion.section>

                {/* ===== Bagian terang: form ===== */}
                <motion.section
                  animate={tearing ? rightTear : restState}
                  transition={tearTransition}
                  style={{ transformOrigin: isDesktop ? '0% 0%' : '50% 0%' }}
                  className="pass-right relative bg-[#faf6ef] p-7 md:p-10 border-t border-dashed border-amber-300/80 md:border-t-0 rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl overflow-hidden"
                >
                  <span
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
                    <Field id="reg-name" label="Full name">
                      <input
                        id="reg-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        className={inputCls}
                        value={form.name}
                        onChange={setField('name')}
                        placeholder="John Doe"
                      />
                    </Field>

                    <Field id="reg-email" label="Email">
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className={inputCls}
                        value={form.email}
                        onChange={setField('email')}
                        placeholder="you@example.com"
                      />
                    </Field>

                    <Field id="reg-phone" label="Phone" optional>
                      <input
                        id="reg-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className={inputCls}
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
                      <p
                        id="reg-password-hint"
                        aria-live="polite"
                        className="text-xs text-amber-700/80 mt-1.5 min-h-[1rem]"
                      >
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
                          {tearing ? 'Welcome in…' : 'Creating your account…'}
                        </>
                      ) : (
                        <>
                          Create account
                          <Icon name="arrow" className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Pemisah "or" */}
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
              </div>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </MotionConfig>
  );
}