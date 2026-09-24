import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'azz@gmail.com' },
  { role: 'Petugas', email: 'jaden@gmail.com' },
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

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 60 + 15,
  left: Math.random() * 100,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 15,
  x1: Math.random() * 100,
  x2: Math.random() * 100,
  opacity: Math.random() * 0.12 + 0.02,
}));

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ticketNo] = useState(generateTicketNo);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const issuedDate = new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();

  const redirectAfterLogin = (user) => {
    const from = location.state?.from;
    if (from && from !== '/login' && from !== '/register') {
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
      setError(err.response?.data?.message || 'Gagal login.');
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
      setError(err.response?.data?.message || 'Gagal login dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => {
    setForm({ email, password: 'Nabil261108' });
    setError('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Floating Bubbles */}
      {BUBBLES.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full border border-white/10"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            top: '110%',
            opacity: bubble.opacity,
          }}
          animate={{
            y: ['0vh', '-120vh'],
            x: [`${bubble.x1}%`, `${bubble.x2}%`],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: bubble.delay,
          }}
        />
      ))}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-4xl relative"
      >
        <div className="absolute -inset-8 bg-amber-400/5 rounded-3xl blur-3xl" />

        <div className="relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#f5ede4] border-2 border-amber-300/50 z-20 shadow-inner" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-6 bg-amber-400/30 -rotate-3" />
          <div className="absolute -top-8 left-[46%] w-px h-8 bg-amber-400/20 rotate-3" />

          <div className="bg-[#faf6ef] border-2 border-amber-300/50 shadow-2xl overflow-hidden rounded-2xl relative">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-700/20 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-700/20 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-700/20 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-700/20 rounded-br-2xl" />

            <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-[#f5ede4] border border-amber-300/50 shadow-inner" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#f5ede4] border border-amber-300/50 shadow-inner" />
            <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-[#f5ede4] border border-amber-300/50 shadow-inner" />
            <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-[#f5ede4] border border-amber-300/50 shadow-inner" />

            <div className="grid md:grid-cols-2 relative">
              {/* PEMBATAS TIKET */}
              <div className="hidden md:block absolute left-1/2 top-8 bottom-8 -translate-x-1/2 z-10 w-6">
                <div
                  className="absolute inset-0 bg-amber-700/[0.06]"
                  style={{
                    WebkitMaskImage:
                      'radial-gradient(circle 7px at 0 7px, transparent 99%, #000 100%), radial-gradient(circle 7px at 100% 7px, transparent 99%, #000 100%)',
                    maskImage:
                      'radial-gradient(circle 7px at 0 7px, transparent 99%, #000 100%), radial-gradient(circle 7px at 100% 7px, transparent 99%, #000 100%)',
                    WebkitMaskSize: '100% 18px, 100% 18px',
                    maskSize: '100% 18px, 100% 18px',
                    WebkitMaskRepeat: 'repeat-y, repeat-y',
                    maskRepeat: 'repeat-y, repeat-y',
                  }}
                />
                <div
                  className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, rgba(180,83,9,0.35) 0 4px, transparent 4px 9px)',
                  }}
                />
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#faf6ef] border border-amber-300/50 shadow-inner" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#faf6ef] border border-amber-300/50 shadow-inner" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#faf6ef] px-1.5 py-3 rounded-full border border-amber-300/40 shadow-sm">
                  <span
                    className="text-[8px] font-serif tracking-[0.25em] text-amber-500/70"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    TICKET
                  </span>
                </div>
              </div>

              {/* LEFT */}
              <div className="p-8 md:p-10 bg-gradient-to-br from-amber-50/50 to-transparent pr-6 md:pr-8">
                <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-700/50 flex items-center justify-center text-amber-700 font-serif text-xl bg-white/50 transition-transform group-hover:scale-105 duration-300">
                    T
                  </div>
                  <span className="font-serif font-bold text-2xl text-amber-900">
                    tiket<span className="text-amber-600">ku</span>
                  </span>
                </Link>

                <h1 className="font-serif text-4xl text-amber-900 leading-tight mb-2">
                  Welcome
                  <br />
                  <span className="text-amber-600 italic">Back.</span>
                </h1>

                <div className="w-16 h-[2px] bg-amber-700/30 my-4" />

                <p className="text-amber-800/60 text-sm max-w-sm font-light leading-relaxed">
                  No more digging through emails. Your tickets are already at the door.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {['EST. 2024', 'LIVE', 'EXCLUSIVE'].map((label) => (
                    <span
                      key={label}
                      className="font-serif text-[10px] tracking-[0.2em] text-amber-600 border border-amber-700/20 rounded-full px-4 py-1 uppercase bg-white/30"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* RIGHT */}
              <div className="p-8 md:p-10 pl-6 md:pl-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl text-amber-900">Sign In</h2>
                  <div className="text-right">
                    <p className="text-[9px] font-serif tracking-[0.3em] text-amber-600 uppercase">
                      Entry Pass
                    </p>
                    <p className="text-[10px] text-amber-800/50 font-light tracking-wider">
                      {issuedDate}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-5 flex items-center gap-2 p-3 bg-red-50/80 border border-red-200/50 rounded-xl"
                    >
                      <span className="font-serif text-[9px] tracking-[0.2em] text-red-600 uppercase border border-red-300/50 px-2 py-0.5 rounded">
                        Invalid
                      </span>
                      <span className="text-red-700/80 text-sm font-light">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-serif tracking-[0.3em] text-amber-700/60 uppercase mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      onFocus={() => setIsFocused({ ...isFocused, email: true })}
                      onBlur={() => setIsFocused({ ...isFocused, email: false })}
                      className={`w-full px-4 py-3 bg-white/70 border transition-all duration-300 text-amber-900 placeholder-amber-400/50 font-light text-sm rounded-xl ${
                        isFocused.email
                          ? 'border-amber-500/60 ring-2 ring-amber-500/10'
                          : 'border-amber-200/60'
                      }`}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-serif tracking-[0.3em] text-amber-700/60 uppercase">
                        Password
                      </label>
                      <div className="flex items-center gap-3">
                        <Link
                          to="/forgot-password"
                          className="text-[9px] font-serif text-amber-600/80 hover:text-amber-700 transition-colors duration-200 tracking-wide"
                        >
                          Lupa password?
                        </Link>
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="text-[9px] font-serif text-amber-600/60 hover:text-amber-700 transition-colors duration-200"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      onFocus={() => setIsFocused({ ...isFocused, password: true })}
                      onBlur={() => setIsFocused({ ...isFocused, password: false })}
                      className={`w-full px-4 py-3 pr-11 bg-white/70 border transition-all duration-300 text-amber-900 placeholder-amber-400/50 font-light text-sm rounded-xl ${
                        isFocused.password
                          ? 'border-amber-500/60 ring-2 ring-amber-500/10'
                          : 'border-amber-200/60'
                      }`}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="relative py-2">
                    <div className="border-t border-amber-200/30" />
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 bg-[#faf6ef] px-3">
                      <span className="text-[8px] font-serif tracking-[0.5em] text-amber-400/50">✦</span>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative w-full py-3.5 px-4 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif tracking-[0.3em] uppercase text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group rounded-xl overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-amber-200/40 border-t-amber-200 rounded-full animate-spin" />
                        <span className="text-[10px]">Processing...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] group-hover:translate-x-1 transition-transform duration-300">→</span>
                        <span className="text-[10px]">Enter the gate</span>
                      </>
                    )}
                  </motion.button>
                </form>

                {/* ===== DIVIDER ===== */}
                <div className="relative py-3 my-4">
                  <div className="border-t border-amber-200/40" />
                  <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-[#faf6ef] px-3">
                    <span className="text-[9px] font-serif tracking-[0.3em] text-amber-400/60 uppercase">
                      atau
                    </span>
                  </div>
                </div>

                {/* ===== GOOGLE BUTTON ===== */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Login Google dibatalkan.')}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="pill"
                    width="320"
                  />
                </div>

                <p className="text-center text-amber-700/50 text-xs mt-5 font-serif tracking-wide">
                  first time here?{' '}
                  <Link
                    to="/register"
                    className="text-amber-700 hover:text-amber-800 border-b border-amber-700/20 hover:border-amber-700 transition-colors duration-200"
                  >
                    create account
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-amber-50/50 px-8 py-3 border-t border-amber-200/30 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-[8px] font-serif tracking-[0.4em] text-amber-600/40 uppercase">
                  No.{ticketNo}
                </span>
                <div className="h-4 w-px bg-amber-200/30" />
                <div className="flex gap-0.5 opacity-20">
                  {[2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1].map((w, i) => (
                    <div
                      key={i}
                      className="bg-amber-700"
                      style={{ width: `${w}px`, height: i % 3 === 0 ? '14px' : '10px' }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[8px] font-serif tracking-[0.4em] text-amber-400/40 uppercase">
                tear here
              </span>
            </div>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {DEMO_ACCOUNTS.map((acc) => (
            <motion.button
              key={acc.role}
              type="button"
              onClick={() => fillDemo(acc.email)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="font-serif text-[9px] tracking-[0.2em] text-amber-200/80 hover:text-amber-100 border border-amber-400/30 hover:border-amber-400/50 rounded-full px-4 py-1.5 bg-white/10 backdrop-blur-sm transition-all duration-200 uppercase"
            >
              {acc.role}
            </motion.button>
          ))}
        </div>

        <p className="text-center text-[8px] font-serif tracking-[0.3em] text-amber-400/30 mt-4">
          designed with ♥ for live events
        </p>
      </motion.div>
    </div>
  );
}