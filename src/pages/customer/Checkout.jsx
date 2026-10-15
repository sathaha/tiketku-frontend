import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';
import { getImageUrl } from '../../utils/image';

/* ============ ICONS ============ */
const ICON_PATHS = {
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  ticket: 'M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
  check: 'M20 6L9 17l-5-5',
  chevronLeft: 'M15 19l-7-7 7-7',
  chevronRight: 'M9 6l6 6-6 6',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  sparkle: 'M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z',
  lock: 'M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zM9 6a3 3 0 016 0v3H9V6z',
  arrow: 'M13 7l5 5-5 5M6 12h12',
  bank: 'M3 21h18M4 21V10M20 10V21M6 10V21M18 21V10M2 10l10-6 10 6M8 21v-5a1 1 0 011-1h6a1 1 0 011 1v5',
  qr: 'M3 3h7v7H3V3zM14 3h7v7h-7V3zM3 14h7v7H3v-7zM14 14h3v3M20 14v3h-3M14 20h3v1M20 20v1',
  wallet: 'M3 7a2 2 0 012-2h13a2 2 0 012 2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2zM17 13h.01',
  card: 'M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zM2 10h20M6 15h4',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
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
    <svg className={`animate-spin motion-reduce:animate-none ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const panel = 'bg-white rounded-2xl shadow-sm shadow-amber-950/5';
const ticketShadow = 'rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)]';

const inputCls =
  'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .ticket-card {
    --stub-h: 4.75rem;
    -webkit-mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }
`;

const FEE_PERCENT = 5;

const STEPS = ['Details', 'Payment', 'E-ticket'];

const PAYMENT_METHODS = [
  { icon: 'bank', label: 'Virtual account' },
  { icon: 'qr', label: 'QRIS' },
  { icon: 'wallet', label: 'E-wallet' },
  { icon: 'card', label: 'Card' },
];

const TRUST_POINTS = [
  { icon: 'shield', label: 'Secure checkout' },
  { icon: 'wallet', label: 'Multiple payments' },
  { icon: 'check', label: 'Instant e-ticket' },
];

/* ============ SMALL COMPONENTS ============ */
function CountdownTimer({ minutes = 15 }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 300;

  return (
    <div
      role="timer"
      className={`flex items-center gap-2 ${urgent ? 'text-red-600' : 'text-amber-700'}`}
    >
      <Icon name="clock" className={`w-4 h-4 ${urgent ? 'animate-pulse motion-reduce:animate-none' : ''}`} />
      <span className="f-display font-semibold tabular-nums">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}

function StepProgress({ current = 0 }) {
  return (
    <ol className="flex items-center gap-3 md:gap-4 flex-wrap" aria-label="Checkout steps">
      {STEPS.map((label, idx) => {
        const isCurrent = idx === current;
        const isDone = idx < current;
        return (
          <li key={label} className="flex items-center gap-3 md:gap-4" aria-current={isCurrent ? 'step' : undefined}>
            <span className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold tabular-nums transition-colors ${
                  isCurrent || isDone
                    ? 'bg-amber-700 text-white'
                    : 'bg-white border-2 border-amber-200 text-amber-400'
                }`}
              >
                {isDone ? <Icon name="check" className="w-3.5 h-3.5" /> : idx + 1}
              </span>
              <span className={`text-sm ${isCurrent ? 'text-amber-950 font-semibold' : 'text-amber-700/70'}`}>
                {label}
              </span>
            </span>
            {idx < STEPS.length - 1 && (
              <span className="w-8 md:w-16 border-t-2 border-dashed border-amber-300/70" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function DetailRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
        <Icon name={icon} className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-amber-700/80">{label}</p>
        <div className="text-sm text-amber-950 mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="f-display text-xl font-semibold text-amber-950 mb-3">{children}</h2>;
}

/* ============ MAIN ============ */
export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [concert, setConcert] = useState(null);
  const [category, setCategory] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoChecking, setPromoChecking] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const fetchConcert = useCallback(async () => {
    if (!state) return;
    setLoadError(false);
    try {
      const res = await api.get(`/concerts/${state.concert_id}`);
      const cat = res.data.ticket_categories?.find((c) => String(c.id) === String(state.ticket_category_id));
      if (!cat) {
        setLoadError(true);
        return;
      }
      setConcert(res.data);
      setCategory(cat);
      setSchedule(res.data.schedules?.find((s) => String(s.id) === String(state.schedule_id)));
    } catch (err) {
      console.error('Failed to load checkout details:', err);
      setLoadError(true);
    }
  }, [state]);

  useEffect(() => {
    if (!state) {
      navigate('/');
      return;
    }
    fetchConcert();
  }, [state, navigate, fetchConcert]);

  if (!state) return null;

  if (loadError) {
    return (
      <div className="f-body min-h-screen bg-[#f5ede4] flex items-center justify-center px-4">
        <style>{pageCss}</style>
        <div className="max-w-md w-full rounded-2xl border-2 border-dashed border-amber-300/70 p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
            <Icon name="alert" className="w-6 h-6" />
          </div>
          <h1 className="f-display text-lg font-semibold text-amber-950 mb-1">Couldn't load your order</h1>
          <p className="text-sm text-amber-800/80 mb-5">Check your connection, or go back and pick your tickets again.</p>
          <div className="flex justify-center gap-3">
            <Link
              to={`/concerts/${state.concert_id}`}
              className={`px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
            >
              Back to event
            </Link>
            <button
              type="button"
              onClick={fetchConcert}
              className={`px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!concert || !category) {
    return (
      <div className="f-body min-h-screen bg-[#f5ede4] flex items-center justify-center">
        <style>{pageCss}</style>
        <div className="text-center" role="status">
          <Spinner className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <p className="text-amber-700/80">Loading order details…</p>
        </div>
      </div>
    );
  }

  const subtotal = category.price * state.qty;
  const platformFee = Math.round(subtotal * (FEE_PERCENT / 100));
  const listTotal = subtotal + platformFee;
  const discount = promo
    ? Math.min(
        promo.discount_type === 'percentage'
          ? Math.round(listTotal * (promo.discount_value / 100))
          : Number(promo.discount_value),
        listTotal
      )
    : 0;
  const total = Math.max(listTotal - discount, 0);
  const ticketWord = state.qty === 1 ? 'ticket' : 'tickets';

  async function checkPromo(e) {
    e?.preventDefault();
    setPromoError('');
    if (!promoCode) return;
    setPromoChecking(true);
    try {
      const res = await api.get(`/promos/validate/${encodeURIComponent(promoCode)}`);
      setPromo(res.data);
    } catch (err) {
      setPromo(null);
      setPromoError(err.response?.data?.message || 'Invalid promo code.');
    } finally {
      setPromoChecking(false);
    }
  }

  function removePromo() {
    setPromo(null);
    setPromoCode('');
    setPromoError('');
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/orders', {
        concert_id: state.concert_id,
        schedule_id: state.schedule_id,
        ticket_category_id: state.ticket_category_id,
        qty: state.qty,
        promo_code: promo ? promo.code : undefined,
      });
      const { id, payment_url } = res.data.order;
      if (payment_url) {
        window.location.href = payment_url;
      } else {
        navigate(`/orders/${id}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order.');
      setLoading(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* ===== TOP BAR ===== */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to={`/concerts/${concert.id}`}
              className={`group inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 rounded transition-colors ${focusRing}`}
            >
              <Icon name="chevronLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform motion-reduce:transition-none" />
              Back to event
            </Link>

            <div className="flex items-center gap-2 text-xs text-amber-700/80">
              <Icon name="lock" className="w-4 h-4 text-amber-600" />
              Secure checkout
            </div>
          </div>

          {/* ===== HEADER ===== */}
          <header className="mb-8">
            <h1 className="f-display text-4xl md:text-5xl font-bold text-amber-950 mb-6">Checkout</h1>
            <StepProgress current={0} />
          </header>

          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
            {/* ===== LEFT: DETAILS ===== */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-3 space-y-6 min-w-0"
            >
              {/* Timer */}
              <div className={`${panel} flex items-center justify-between gap-3 px-5 py-4`}>
                <div className="flex items-center gap-2 text-sm text-amber-800/80">
                  <Icon name="alert" className="w-4 h-4 text-amber-600 shrink-0" />
                  Complete payment within
                </div>
                <CountdownTimer minutes={15} />
              </div>

              {/* Contact */}
              <section>
                <SectionTitle>Contact information</SectionTitle>
                <div className={`${panel} px-5 py-1`}>
                  <DetailRow icon="mail" label="Email address">
                    <span className="truncate block">{concert.customer_email || 'Your login email'}</span>
                  </DetailRow>
                </div>
              </section>

              {/* Event details */}
              <section>
                <SectionTitle>Event details</SectionTitle>
                <div className={`${panel} px-5 divide-y divide-dashed divide-amber-200`}>
                  <DetailRow icon="music" label="Concert">
                    <span className="f-display font-semibold text-base block">{concert.name}</span>
                    {concert.artist && <span className="text-xs text-amber-700/80 block mt-0.5">{concert.artist}</span>}
                  </DetailRow>
                  <DetailRow icon="ticket" label="Ticket category">
                    {category.name} × <span className="tabular-nums">{state.qty}</span> {ticketWord}
                  </DetailRow>
                  {schedule && (
                    <DetailRow icon="calendar" label="Schedule">
                      {formatDate(schedule.event_date)}
                      {schedule.start_time && (
                        <span className="text-amber-700/80"> · {schedule.start_time.slice(0, 5)}</span>
                      )}
                    </DetailRow>
                  )}
                  <DetailRow icon="pin" label="Venue">
                    {concert.venue_name || '-'}
                    {concert.city ? `, ${concert.city}` : ''}
                  </DetailRow>
                </div>
              </section>

              {/* Promo */}
              <section>
                <SectionTitle>Promo code</SectionTitle>
                <div className={`${panel} p-5`}>
                  <button
                    type="button"
                    onClick={() => setShowPromoInput((s) => !s)}
                    aria-expanded={showPromoInput}
                    aria-controls="promo-panel"
                    className={`w-full flex items-center justify-between text-left group rounded ${focusRing}`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon name="sparkle" className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">
                        {promo ? `Promo ${promo.code} applied` : 'Have a promo code?'}
                      </span>
                    </span>
                    <Icon
                      name="chevronRight"
                      className={`w-4 h-4 text-amber-400 transition-transform group-hover:text-amber-600 motion-reduce:transition-none ${
                        showPromoInput ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {showPromoInput && (
                      <motion.div
                        id="promo-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <form onSubmit={checkPromo} className="flex gap-2 mt-4">
                          <label htmlFor="promo-input" className="sr-only">
                            Promo code
                          </label>
                          <input
                            id="promo-input"
                            className={`${inputCls} flex-1 uppercase`}
                            placeholder="Enter promo code"
                            value={promoCode}
                            autoComplete="off"
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase());
                              setPromo(null);
                              setPromoError('');
                            }}
                          />
                          <button
                            type="submit"
                            disabled={promoChecking || !promoCode}
                            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 text-sm font-medium transition-colors rounded-xl ${focusRing}`}
                          >
                            {promoChecking ? <Spinner /> : 'Apply'}
                          </button>
                        </form>

                        {promoError && (
                          <p role="alert" className="text-red-600 text-xs mt-2">
                            {promoError}
                          </p>
                        )}
                        {promo && (
                          <div className="flex items-center justify-between gap-3 mt-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-sm">
                            <span className="flex items-center gap-2">
                              <Icon name="check" className="w-4 h-4" />
                              Promo {promo.code} applied successfully!
                            </span>
                            <button
                              type="button"
                              onClick={removePromo}
                              className={`text-xs font-medium underline underline-offset-2 hover:text-emerald-900 rounded ${focusRing}`}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </motion.div>

            {/* ===== RIGHT: SUMMARY ===== */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="lg:col-span-2 min-w-0"
            >
              <div className="lg:sticky lg:top-8 space-y-5">
                {/* Order summary: tiket dengan stub total */}
                <div className={ticketShadow}>
                  <div className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)]">
                    <div className="p-6">
                      <h3 className="f-display text-lg font-semibold text-amber-950 mb-5">Order summary</h3>

                      <div className="flex gap-4 pb-5 border-b border-dashed border-amber-200">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-amber-100 shrink-0">
                          {concert.poster ? (
                            <img src={getImageUrl(concert.poster)} alt={concert.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200/70 text-amber-400">
                              <Icon name="ticket" className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="f-display font-semibold text-amber-950 leading-snug">{concert.name}</p>
                          <p className="text-xs text-amber-700/80 mt-1">{category.name}</p>
                          <p className="text-xs text-amber-700/80">
                            <span className="tabular-nums">{state.qty}</span> {ticketWord}
                          </p>
                        </div>
                      </div>

                      <dl className="pt-5 space-y-2.5 text-sm">
                        <div className="flex justify-between text-amber-800/80">
                          <dt>Subtotal</dt>
                          <dd className="tabular-nums">{formatRupiah(subtotal)}</dd>
                        </div>
                        <div className="flex justify-between text-amber-800/80">
                          <dt>Service fee ({FEE_PERCENT}%)</dt>
                          <dd className="tabular-nums">{formatRupiah(platformFee)}</dd>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <dt>Discount</dt>
                            <dd className="tabular-nums">−{formatRupiah(discount)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div className="border-t border-dashed border-amber-300/80 bg-amber-50 px-6 flex items-center justify-between gap-3">
                      <span className="f-display font-semibold text-amber-950">Total</span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={total}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="f-display text-2xl font-bold text-amber-800 tabular-nums"
                        >
                          {formatRupiah(total)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Error + CTA */}
                {error && (
                  <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                    <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-3.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 ${focusRing}`}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Processing…
                    </>
                  ) : (
                    <>
                      Continue to payment
                      <Icon name="arrow" className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Payment methods */}
                <div className={`${panel} p-5`}>
                  <ul className="grid grid-cols-3 gap-2 pb-4 mb-4 border-b border-dashed border-amber-200">
                    {TRUST_POINTS.map((b) => (
                      <li key={b.label} className="flex flex-col items-center text-center gap-1.5">
                        <span className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                          <Icon name={b.icon} className="w-4 h-4" />
                        </span>
                        <span className="text-xs text-amber-700/80 leading-tight">{b.label}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs font-medium text-amber-700/80 text-center mb-3">Payment methods</p>
                  <ul className="flex items-start justify-center gap-4 flex-wrap">
                    {PAYMENT_METHODS.map((m) => (
                      <li key={m.label} className="flex flex-col items-center gap-1 text-amber-700/80 w-16">
                        <span className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                          <Icon name={m.icon} className="w-4 h-4" />
                        </span>
                        <span className="text-xs text-center leading-tight">{m.label}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-start gap-2 mt-4 pt-4 border-t border-dashed border-amber-200">
                    <Icon name="shield" className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700/80 leading-relaxed">
                      Secure payment via <strong className="text-amber-800">Xendit</strong>. You will be redirected to
                      the payment page after clicking Continue.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}