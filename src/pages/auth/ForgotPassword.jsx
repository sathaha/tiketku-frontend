import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(
        res.data?.message ||
          'Kalau email terdaftar, kami sudah kirim link reset password ke inbox kamu.'
      );
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Gagal mengirim email. Coba lagi.');
    }
  };

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 py-12 relative">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      <div className="relative w-full max-w-md bg-[#faf6ef] rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-800/40 border border-amber-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </Link>
          <h1 className="font-serif text-3xl text-amber-950">Lupa Password?</h1>
          <p className="font-serif text-sm text-amber-700/70 mt-2">
            Masukkan email kamu, kami akan kirim link untuk reset password.
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-serif text-sm text-amber-900/80 leading-relaxed mb-6">{message}</p>
            <p className="font-serif text-xs text-amber-700/60 mb-6">
              Tidak dapat email? Cek folder Spam atau Promotions.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase rounded-full transition-colors"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block font-serif text-sm text-amber-900 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="email@kamu.com"
                className="w-full px-5 py-3.5 bg-white border border-amber-300/60 rounded-full font-serif text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500/60 transition-colors disabled:opacity-50"
              />
            </div>

            {isError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase rounded-full transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>

            <p className="text-center font-serif text-sm text-amber-700/70">
              Ingat password?{' '}
              <Link to="/login" className="text-amber-700 hover:text-amber-600 font-medium">
                Masuk di sini
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}