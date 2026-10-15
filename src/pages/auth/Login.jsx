import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

/* Demo shortcuts fill the form for quick testing.
   Set to false before deploying: the password below ships in the client bundle. */
const SHOW_DEMO_ACCOUNTS = true;
const DEMO_PASSWORD = 'Nabil261108';
const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'azz@gmail.com' },
  { role: 'Staff', email: 'jaden@gmail.com' },
  { role: 'Customer', email: 'azzami@gmail.com' },
  { role: 'EO', email: 'sat@gmail.com' },
];

function generateTicketNo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TK-${code}`;
}

const BARS = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1, 4, 1, 2, 1, 3];

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  /* Ticket with a tear line between the dark and light halves (desktop only) */
  .login-pass { --left-w: 20rem; }
  @media (min-width: 768px) {
    .login-pass {
      -webkit-mask:
        radial-gradient(circle 11px at var(--left-w) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 11px at var(--left-w) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
      mask:
        radial-gradient(circle 11px at var(--left-w) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 11px at var(--left-w) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
    }
  }
`;

const inputCls =
  'w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ticketNo] = useState(generateTicketNo);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const issuedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const redirectAfterLogin = (user) => {
    // 1. Check the URL query param (?from=/checkout), set by the axios interceptor
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('from');

    // 2. Check location.state (from ProtectedRoute)
    const fromState = location.state?.from;

    // 3. Priority: query param first, then state
    const from = fromQuery || fromState;

    // only follow in-app paths ("/something", never "//host")
    const isSafe = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//');

    if (isSafe && from !== '/login' && from !== '/register') {
      navigate(from, { replace: true });
    } else {
      const routes = {
        admin: '/admin/dashboard',
        petugas: '/petugas/scan',
        eo: '/eo/dashboard',
      };
      navigate(routes[user.role] || '/', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      redirectAfterLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign you in. Please try again.");
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
      redirectAfterLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign you in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => {
    setForm({ email, password: DEMO_PASSWORD });
    setError('');
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
          {/* Ticket */}
          <div className="drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
            <div className="login-pass grid md:grid-cols-[var(--left-w)_1fr] rounded-2xl overflow-hidden">
              {/* Dark half */}
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
                  Welcome
                  <br />
                  <span className="text-amber-300">back.</span>
                </h1>
                <p className="text-sm text-amber-200/70 mt-3 leading-relaxed max-w-xs">
                  No more digging through emails. Your tickets are already at the door.
                </p>

                <div className="hidden md:block mt-auto pt-10">
                  <div className="border-t border-dashed border-amber-800 pt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-amber-200/60">Entry pass</p>
                      <p className="f-display text-base font-semibold tabular-nums">{ticketNo}</p>
                      <p className="text-xs text-amber-200/60 mt-0.5">{issuedDate}</p>
                    </div>
                    <div className="flex items-end gap-0.5 opacity-60" aria-hidden="true">
                      {BARS.slice(0, 16).map((w, i) => (
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

              {/* Light half */}
              <section className="bg-amber-50 p-7 md:p-10">
                <h2 className="f-display text-2xl font-semibold text-amber-950 mb-6">Sign in</h2>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      role="alert"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mb-5 flex items-start gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-700"
                    >
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z" />
                      </svg>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-amber-900 mb-1.5">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="username"
                      className={inputCls}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="login-password" className="block text-sm font-medium text-amber-900">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className={`text-sm text-amber-700 hover:text-amber-950 rounded transition-colors ${focusRing}`}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        className={`${inputCls} pr-16`}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-pressed={showPassword}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm font-medium text-amber-700 hover:text-amber-950 rounded-md transition-colors ${focusRing}`}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${focusRing}`}
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-amber-200/40 border-t-amber-200 rounded-full animate-spin" aria-hidden="true" />
                        Signing in…
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5" aria-hidden="true">
                  <span className="flex-1 border-t border-dashed border-amber-300" />
                  <span className="text-sm text-amber-700/80">or</span>
                  <span className="flex-1 border-t border-dashed border-amber-300" />
                </div>

                {/* Google */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign-in didn't complete. Please try again.")}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="pill"
                    width="280"
                  />
                </div>

                <p className="text-center text-sm text-amber-800 mt-6">
                  New to Tiketku?{' '}
                  <Link
                    to="/register"
                    className={`font-semibold text-amber-900 underline underline-offset-4 decoration-amber-400 hover:decoration-amber-800 rounded ${focusRing}`}
                  >
                    Create an account
                  </Link>
                </p>
              </section>
            </div>
          </div>

          {/* Demo accounts */}
          {SHOW_DEMO_ACCOUNTS && (
            <div className="mt-6 flex flex-wrap items-center gap-2 justify-center">
              <span className="text-sm text-amber-100/70">Try a demo account:</span>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className={`text-sm font-medium text-amber-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 transition-colors ${focusRing}`}
                >
                  {acc.role}
                </button>
              ))}
            </div>
          )}
        </motion.main>
      </div>
    </MotionConfig>
  );
}