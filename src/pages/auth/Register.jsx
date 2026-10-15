import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
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

const BARS = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 3, 1];
const PERKS = ['Free to join', 'Instant tickets', 'Secure payments'];

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

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const inputCls =
  'w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

/* Ticket with a tear line between the dark and light halves.
   The notches are cut out with a mask, so they work on any background (desktop only). */
const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .register-pass { --left-w: 20rem; }
  @media (min-width: 768px) {
    .register-pass {
      -webkit-mask:
        radial-gradient(circle 11px at var(--left-w) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 11px at var(--left-w) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
      mask:
        radial-gradient(circle 11px at var(--left-w) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 11px at var(--left-w) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
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
  const [showPassword, setShowPassword] = useState(false);
  const [ticketNo] = useState(generateTicketNo);
  const { login } = useAuth();
  const navigate = useNavigate();

  // The Google button follows the form width (Google only accepts 200 to 400)
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

  const redirectAfterAuth = (user) => {
    navigate(ROUTES_BY_ROLE[user.role] || '/', { replace: true });
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Use a password with at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      redirectAfterAuth(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account. Please try again.");
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
      login(data.token, data.user);
      redirectAfterAuth(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign you up with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen relative flex items-center justify-center px-4 py-8">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80')` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/80 via-amber-950/70 to-amber-950/90" aria-hidden="true" />

        <motion.main
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-3xl relative"
        >
          <div className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
            <div className="register-pass grid md:grid-cols-[var(--left-w)_1fr] rounded-2xl overflow-hidden">
              {/* ===== Dark half: pitch ===== */}
              <section className="bg-amber-950 text-amber-50 p-7 md:p-8 flex flex-col">
                <Link to="/" className={`inline-flex items-center gap-2.5 self-start rounded-lg ${focusRing}`}>
                  <span className="w-9 h-9 rounded-full ring-2 ring-amber-400/70 flex items-center justify-center f-display text-lg font-semibold text-amber-300">
                    T
                  </span>
                  <span className="f-display text-2xl font-bold text-amber-50">
                    tiket<span className="text-amber-400">ku</span>
                  </span>
                </Link>

                <h1 className="f-display text-4xl font-semibold leading-tight mt-8 md:mt-12">
                  Join the
                  <br />
                  <span className="text-amber-300">experience.</span>
                </h1>
                <p className="text-sm text-amber-200/70 mt-3 leading-relaxed max-w-xs">
                  Create your account and never miss a beat. Your next event is one ticket away.
                </p>

                <ul className="mt-6 space-y-2">
                  {PERKS.map((label) => (
                    <li key={label} className="flex items-center gap-2 text-sm text-amber-100">
                      <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-300 flex items-center justify-center shrink-0">
                        <Icon name="check" className="w-3 h-3" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>

                <div className="hidden md:block mt-auto pt-10">
                  <div className="border-t border-dashed border-amber-800 pt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-amber-200/60">Entry pass</p>
                      <p className="f-display text-base font-semibold tabular-nums">{ticketNo}</p>
                      <p className="text-xs text-amber-200/60 mt-0.5">{issuedDate}</p>
                    </div>
                    <div className="flex items-end gap-0.5 opacity-60" aria-hidden="true">
                      {BARS.map((w, i) => (
                        <span
                          key={i}
                          className="bg-amber-300"
                          style={{ width: `${w}px`, height: i % 3 === 0 ? '28px' : '22px' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ===== Light half: form ===== */}
              <section className="bg-amber-50 p-7 md:p-10">
                <h2 className="f-display text-2xl font-semibold text-amber-950 mb-6">Sign up</h2>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      role="alert"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mb-5 flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm"
                    >
                      <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        minLength={6}
                        autoComplete="new-password"
                        className={`${inputCls} pr-16`}
                        value={form.password}
                        onChange={setField('password')}
                        placeholder="At least 6 characters"
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
                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-800 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-amber-50 text-sm font-semibold rounded-xl transition-colors ${focusRing}`}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        Creating your account…
                      </>
                    ) : (
                      <>
                        Create account
                        <Icon name="arrow" className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* "or" divider */}
                <div className="flex items-center gap-3 my-5" aria-hidden="true">
                  <span className="flex-1 border-t border-dashed border-amber-300" />
                  <span className="text-sm text-amber-700/80">or</span>
                  <span className="flex-1 border-t border-dashed border-amber-300" />
                </div>

                <div ref={googleRef} className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign-up didn't complete. Please try again.")}
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
              </section>
            </div>
          </div>
        </motion.main>
      </div>
    </MotionConfig>
  );
}