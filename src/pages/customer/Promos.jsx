import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatDate, formatRupiah } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  sparkle: 'M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z',
  copy: 'M8 4v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H10a2 2 0 00-2 2zM16 18v2a2 2 0 01-2 2H4a2 2 0 01-2-2V10a2 2 0 012-2h2',
  check: 'M20 6L9 17l-5-5',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z',
  arrow: 'M13 7l5 5-5 5M6 12h12',
  tag: 'M20.59 13.41L11 3.83A2 2 0 009.59 3.24H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.58 9.59a2 2 0 002.83 0l4.59-4.6a2 2 0 000-2.82zM7 8h.01',
  flame: 'M12 2c1 3-2 4-2 7a2 2 0 004 0c1 1 2 2.5 2 4.5A6 6 0 016 13.5C6 9 9 6 12 2z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const ticketShadow =
  'rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_8px_16px_rgba(69,26,3,0.16)] transition-[filter] duration-200';

/*
  Tiket promo: stub di bawah (mobile) dan di kanan (sm ke atas).
  Lubang dipotong dengan mask, jadi aman di background apa pun.
*/
const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .promo-ticket {
    --stub-h: 4.5rem;
    --stub-w: 11rem;
    -webkit-mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }
  @media (min-width: 640px) {
    .promo-ticket {
      -webkit-mask:
        radial-gradient(circle 9px at calc(100% - var(--stub-w)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 9px at calc(100% - var(--stub-w)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
      mask:
        radial-gradient(circle 9px at calc(100% - var(--stub-w)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 9px at calc(100% - var(--stub-w)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
    }
  }
`;

const steps = [
  'Choose the event you want to watch',
  'On the Checkout page, click "Have a promo code?"',
  'Paste the promo code above, click Apply',
  'The discount is automatically deducted from your total payment',
];

/* ============ SMALL COMPONENTS ============ */
function Bone({ className = '' }) {
  return <div className={`bg-amber-100 rounded ${className}`} />;
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse" role="status" aria-label="Loading promos">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)]">
          <div className="bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_4.5rem] sm:grid-rows-none sm:grid-cols-[1fr_11rem]">
            <div className="p-6 space-y-3">
              <Bone className="h-3 w-24" />
              <Bone className="h-9 w-32" />
              <Bone className="h-3 w-full" />
              <Bone className="h-1.5 w-full rounded-full mt-5" />
            </div>
            <div className="bg-amber-50 border-t border-dashed border-amber-300/80 sm:border-t-0 sm:border-l flex items-center justify-center">
              <Bone className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, children }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">{title}</h3>
      {children}
    </div>
  );
}

function PromoTicket({ promo, copyState, onCopy }) {
  const quota = Number(promo.quota) || 0;
  const used = Number(promo.used) || 0;
  const remaining = Math.max(quota - used, 0);
  const usagePercentage = quota > 0 ? Math.min(Math.round((used / quota) * 100), 100) : 0;
  const almostGone = usagePercentage >= 80;

  const isThis = copyState.code === promo.code;
  const copied = isThis && copyState.ok;
  const failed = isThis && !copyState.ok;

  const discount =
    promo.discount_type === 'percentage' ? `${promo.discount_value}%` : formatRupiah(promo.discount_value);

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25 }}
      className="relative"
    >
      {almostGone && (
        <span className="absolute -top-2.5 left-6 z-10 inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
          <Icon name="flame" className="w-3 h-3" />
          Almost gone
        </span>
      )}

      <div className={ticketShadow}>
        <div className="promo-ticket bg-white rounded-2xl overflow-hidden h-full grid grid-rows-[1fr_var(--stub-h)] sm:grid-rows-none sm:grid-cols-[1fr_var(--stub-w)]">
          {/* Info */}
          <div className="p-6 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-amber-700/80">Special discount</p>
                <p className="flex items-baseline gap-2 mt-1">
                  <span className="f-display text-4xl font-semibold text-amber-800 tabular-nums">{discount}</span>
                  <span className="text-sm font-medium text-amber-700/80">off</span>
                </p>
              </div>
              <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                <Icon name="tag" className="w-[18px] h-[18px]" />
              </span>
            </div>

            {promo.description && <p className="text-sm text-amber-800/80 mb-4">{promo.description}</p>}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-700/80 mb-3">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="calendar" className="w-3.5 h-3.5 text-amber-500" />
                until {formatDate(promo.valid_until)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="users" className="w-3.5 h-3.5 text-amber-500" />
                <span className="tabular-nums">{remaining}</span> quota left
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex-1 bg-amber-100 rounded-full h-1.5 overflow-hidden"
                role="progressbar"
                aria-valuenow={usagePercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Quota used"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 motion-reduce:transition-none ${
                    almostGone ? 'bg-orange-500' : 'bg-amber-600'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              <span className="text-xs text-amber-700/80 tabular-nums">{usagePercentage}%</span>
            </div>

            <Link
              to="/"
              className={`group/link inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 rounded transition-colors ${focusRing}`}
            >
              Use this promo now
              <Icon name="arrow" className="w-4 h-4 group-hover/link:translate-x-1 transition-transform motion-reduce:transition-none" />
            </Link>
          </div>

          {/* Stub: kode */}
          <div className="bg-amber-50 border-t border-dashed border-amber-300/80 sm:border-t-0 sm:border-l px-5 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3">
            <div className="sm:text-center min-w-0">
              <p className="text-xs text-amber-700/80">Code</p>
              <p className="font-mono font-bold text-base text-amber-900 tracking-wider truncate">{promo.code}</p>
            </div>
            <button
              type="button"
              onClick={() => onCopy(promo.code)}
              aria-label={`Copy promo code ${promo.code}`}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors active:scale-95 ${focusRing} ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : failed
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-800 text-amber-50 hover:bg-amber-700'
              }`}
            >
              <Icon name={copied ? 'check' : failed ? 'alert' : 'copy'} className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : failed ? "Couldn't copy" : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

/* ============ MAIN ============ */
export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [copyState, setCopyState] = useState({ code: '', ok: true });
  const copyTimer = useRef(null);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/promos/active');
      setPromos(res.data);
      setLoadError(false);
    } catch (err) {
      console.error('Failed to fetch promos:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  async function copyCode(code) {
    let ok = true;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      ok = false;
    }
    setCopyState({ code, ok });
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState({ code: '', ok: true }), 2000);
  }

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        {/* ===== HERO ===== */}
        <div className="relative bg-ink-950 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
            aria-hidden="true"
          />
          <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" aria-hidden="true" />

          <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-3 py-1 mb-4">
                <Icon name="sparkle" className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-medium tracking-wide text-amber-400">Promos &amp; vouchers</span>
              </div>

              <h1 className="f-display text-4xl md:text-6xl font-semibold text-white leading-tight">
                Save more
                <br />
                <span className="text-amber-400 italic">on every ticket.</span>
              </h1>

              <p className="text-amber-200/70 text-sm md:text-base mt-4 max-w-lg">
                A collection of active promos with special discounts. Tear, copy the code, use it at checkout.
              </p>

              {!loading && promos.length > 0 && (
                <div className="flex items-center gap-2 mt-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
                  <span className="text-xs text-amber-300/80">
                    <span className="tabular-nums">{promos.length}</span> promos currently active
                  </span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="max-w-5xl mx-auto px-4 py-10">
          {loading ? (
            <SkeletonList />
          ) : loadError ? (
            <EmptyState icon="alert" title="Couldn't load promos">
              <p className="text-sm text-amber-800/80 mb-5">Check your connection, then try again.</p>
              <button
                type="button"
                onClick={fetchPromos}
                className={`px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
              >
                Try again
              </button>
            </EmptyState>
          ) : promos.length === 0 ? (
            <EmptyState icon="tag" title="No active promos right now">
              <p className="text-sm text-amber-800/80">Check back later!</p>
            </EmptyState>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promos.map((p) => (
                <PromoTicket key={p.id} promo={p} copyState={copyState} onCopy={copyCode} />
              ))}
            </ul>
          )}

          {/* ===== HOW TO ===== */}
          <section className="mt-10 bg-white rounded-2xl shadow-sm shadow-amber-950/5 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-amber-950 text-amber-50">
              <Icon name="sparkle" className="w-5 h-5 text-amber-200" />
              <h2 className="f-display text-xl font-semibold">How to use a promo code</h2>
            </div>

            <div className="p-6">
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {steps.map((step, idx) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-amber-800 text-amber-50 text-xs font-medium flex items-center justify-center mt-0.5 tabular-nums">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-amber-800/80">{step}</p>
                  </li>
                ))}
              </ol>

              <p className="text-xs text-amber-700/80 mt-5 pt-4 border-t border-dashed border-amber-200">
                * Payment can be made via GoPay, OVO, Dana, ShopeePay, QRIS, Virtual Account, and credit card.
              </p>
            </div>
          </section>
        </div>
      </div>
    </MotionConfig>
  );
}