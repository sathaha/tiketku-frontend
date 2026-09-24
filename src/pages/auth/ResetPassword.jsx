import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setStatus('error');
      setMessage('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setMessage('Konfirmasi password tidak cocok.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await api.post('/auth/reset-password', { token, password });
      setStatus('success');
      setMessage('Password berhasil direset!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Gagal reset password. Coba lagi.');
    }
  };

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  if (!token) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#faf6ef] rounded-2xl shadow-2xl p-8 text-center">
          <h1 className="font-serif text-2xl text-amber-950 mb-3">Link Tidak Valid</h1>
          <p className="font-serif text-sm text-amber-700/70 mb-6">
            Token reset password tidak ditemukan di URL. Minta link baru.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase rounded-full"
          >
            Minta Link Baru
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="font-serif text-3xl text-amber-950">Buat Password Baru</h1>
          <p className="font-serif text-sm text-amber-700/70 mt-2">Minimal 6 karakter.</p>
        </div>

        {isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-serif text-sm text-amber-900/80 mb-2">{message}</p>
            <p className="font-serif text-xs text-amber-700/60">Mengalihkan ke login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block font-serif text-sm text-amber-900 mb-2">
                Password Baru
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-white border border-amber-300/60 rounded-full font-serif text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500/60 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block font-serif text-sm text-amber-900 mb-2">
                Konfirmasi Password
              </label>
              <input
                id="confirm"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
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
              {isLoading ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}