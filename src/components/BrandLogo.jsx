import { Link } from 'react-router-dom';

/**
 * BrandLogo — Logo TiketKu yang reusable.
 * 
 * @param {string} to          — path tujuan saat diklik (default: '/')
 * @param {'light'|'dark'} variant — 'light' untuk navbar customer (kotak amber solid),
 *                                   'dark'  untuk sidebar admin (kotak amber lebih terang)
 * @param {boolean} showText   — tampilkan teks "tiketku" atau tidak (default: true)
 * @param {string} className   — class tambahan untuk wrapper
 */
export default function BrandLogo({
  to = '/',
  variant = 'light',
  showText = true,
  className = '',
}) {
  const isDark = variant === 'dark';

  return (
    <Link to={to} className={`flex items-center gap-2.5 group ${className}`}>
      {/* Kotak icon ticket */}
      <div
        className={`w-9 h-9 rounded-sm flex items-center justify-center shadow-sm transition-colors shrink-0 ${
          isDark
            ? 'bg-amber-700 text-amber-50 shadow-amber-950/40 group-hover:bg-amber-600'
            : 'bg-amber-800 text-amber-50 shadow-amber-900/20 group-hover:bg-amber-700'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
      </div>

      {/* Text brand */}
      {showText && (
        <span
          className={`font-serif font-bold text-lg tracking-wide whitespace-nowrap ${
            isDark ? 'text-amber-50' : 'text-amber-950'
          }`}
        >
          tiket<span className="text-amber-500">ku</span>
        </span>
      )}
    </Link>
  );
}