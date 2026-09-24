import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

// ===== ICON COMPONENT =====
function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    ticket: 'M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
    check: 'M20 6L9 17l-5-5',
    chevronLeft: 'M15 19l-7-7 7-7',
    chevronRight: 'M9 6l6 6-6 6',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
    alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
    sparkle: 'M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z',
    lock: 'M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zM9 6a3 3 0 016 0v3H9V6z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    bank: 'M3 21h18M4 21V10M20 10V21M6 10V21M18 21V10M2 10l10-6 10 6M8 21v-5a1 1 0 011-1h6a1 1 0 011 1v5',
    qr: 'M3 3h7v7H3V3zM14 3h7v7h-7V3zM3 14h7v7H3v-7zM14 14h3v3M20 14v3h-3M14 20h3v1M20 20v1',
    wallet: 'M3 7a2 2 0 012-2h13a2 2 0 012 2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2zM17 13h.01',
    card: 'M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zM2 10h20M6 15h4',
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// ===== COUNTDOWN TIMER =====
function CountdownTimer({ minutes = 15 }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 300;

  return (
    <div className={`flex items-center gap-2 font-serif ${urgent ? 'text-red-600' : 'text-amber-700'}`}>
      <Icon name="clock" className={`w-4 h-4 ${urgent ? 'animate-pulse' : ''}`} />
      <span className="font-mono font-semibold text-sm tabular-nums">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}

// ===== STEP PROGRESS =====
function StepProgress() {
  const steps = [
    { label: 'Shipping', icon: null },
    { label: 'Payment', icon: null },
    { label: 'Review', icon: null },
  ];

  return (
    <div className="flex items-center gap-3 md:gap-4 flex-wrap">
      {steps.map((step, idx) => {
        const isCurrent = idx === 0;
        const isUpcoming = idx > 0;
        return (
          <div key={step.label} className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-bold transition-colors ${
                  isCurrent
                    ? 'bg-amber-700 text-white'
                    : isUpcoming
                    ? 'bg-white border-2 border-amber-200 text-amber-400'
                    : 'bg-amber-700 text-white'
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-sm font-serif ${
                  isCurrent ? 'text-amber-950 font-semibold' : 'text-amber-700/50'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="w-8 md:w-16 h-px bg-amber-200/60" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== MAIN CHECKOUT COMPONENT =====
export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [concert, setConcert] = useState(null);
  const [category, setCategory] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoChecking, setPromoChecking] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const FEE_PERCENT = 5;

  useEffect(() => {
    if (!state) return navigate('/');
    api.get(`/concerts/${state.concert_id}`).then((res) => {
      setConcert(res.data);
      setCategory(res.data.ticket_categories.find((c) => String(c.id) === String(state.ticket_category_id)));
      setSchedule(res.data.schedules?.find((s) => String(s.id) === String(state.schedule_id)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!state) return null;
  if (!concert || !category)
    return (
      <div className="min-h-screen bg-[#f5ede4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="font-serif text-amber-700/60">Loading order details...</p>
        </div>
      </div>
    );

  const subtotal = category.price * state.qty;
  const platformFee = Math.round(subtotal * (FEE_PERCENT / 100));
  const listTotal = subtotal + platformFee;
  const discount = promo
    ? Math.min(
        promo.discount_type === 'percentage' ? Math.round(listTotal * (promo.discount_value / 100)) : Number(promo.discount_value),
        listTotal
      )
    : 0;
  const total = Math.max(listTotal - discount, 0);

  async function checkPromo() {
    setPromoError('');
    if (!promoCode) return;
    setPromoChecking(true);
    try {
      const res = await api.get(`/promos/validate/${promoCode}`);
      setPromo(res.data);
    } catch (err) {
      setPromo(null);
      setPromoError(err.response?.data?.message || 'Invalid promo code.');
    } finally {
      setPromoChecking(false);
    }
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
    <div className="min-h-screen bg-[#f5ede4]">

      {/* Texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 relative">

        {/* ===== TOP BAR: Back + Secure Checkout ===== */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to={`/concerts/${concert.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-serif text-amber-700/70 hover:text-amber-900 transition-colors group"
          >
            <Icon name="chevronLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Event
          </Link>

          <div className="flex items-center gap-2 text-xs font-serif text-amber-700/60">
            <Icon name="lock" className="w-4 h-4 text-amber-600" />
            Secure Checkout
          </div>
        </div>

        {/* ===== HEADER ===== */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl text-amber-950 mb-6">Checkout</h1>

          {/* Stepper */}
          <StepProgress />
        </div>

        {/* ===== GRID 2 KOLOM ===== */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">

          {/* ===== LEFT COLUMN (3/5) — FORM ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* ===== COUNTDOWN WARNING ===== */}
            <div className="flex items-center justify-between bg-white border border-amber-200/40 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-serif text-amber-800/70">
                <Icon name="alert" className="w-4 h-4 text-amber-600" />
                Complete payment within
              </div>
              <CountdownTimer minutes={15} />
            </div>

            {/* ===== CONTACT INFORMATION ===== */}
            <div>
              <h2 className="font-serif text-xl text-amber-950 mb-4">
                Contact Information
              </h2>
              <div className="bg-white border border-amber-200/40 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="mail" className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-serif tracking-[0.15em] text-amber-600/60 uppercase mb-0.5">
                      Email Address
                    </p>
                    <p className="font-serif text-sm text-amber-950 truncate">
                      {concert.customer_email || 'Login email kamu'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== EVENT & SHIPPING DETAILS ===== */}
            <div>
              <h2 className="font-serif text-xl text-amber-950 mb-4">
                Detail Event
              </h2>

              <div className="bg-white border border-amber-200/40 rounded-2xl p-5 space-y-4">
                {/* Nama Konser */}
                <div>
                  <p className="text-[10px] font-serif tracking-[0.15em] text-amber-600/60 uppercase mb-1">
                    Konser
                  </p>
                  <p className="font-serif text-base text-amber-950 font-medium">
                    {concert.name}
                  </p>
                  {concert.artist && (
                    <p className="font-serif text-xs text-amber-700/60 mt-0.5">
                      {concert.artist}
                    </p>
                  )}
                </div>

                {/* Kategori */}
                <div className="pt-4 border-t border-amber-100">
                  <p className="text-[10px] font-serif tracking-[0.15em] text-amber-600/60 uppercase mb-1">
                    Kategori Tiket
                  </p>
                  <p className="font-serif text-sm text-amber-950">
                    {category.name} × {state.qty} tiket
                  </p>
                </div>

                {/* Schedule */}
                {schedule && (
                  <div className="pt-4 border-t border-amber-100">
                    <p className="text-[10px] font-serif tracking-[0.15em] text-amber-600/60 uppercase mb-1">
                      Jadwal
                    </p>
                    <p className="font-serif text-sm text-amber-950 flex items-center gap-1.5">
                      <Icon name="calendar" className="w-3.5 h-3.5 text-amber-500" />
                      {formatDate(schedule.event_date)}
                      {schedule.start_time && (
                        <span className="text-amber-700/60"> · {schedule.start_time.slice(0, 5)}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Venue */}
                <div className="pt-4 border-t border-amber-100">
                  <p className="text-[10px] font-serif tracking-[0.15em] text-amber-600/60 uppercase mb-1">
                    Venue
                  </p>
                  <p className="font-serif text-sm text-amber-950 flex items-start gap-1.5">
                    <Icon name="pin" className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {concert.venue_name || '-'}
                      {concert.city ? `, ${concert.city}` : ''}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* ===== PROMO CODE ===== */}
            <div>
              <h2 className="font-serif text-xl text-amber-950 mb-4">
                Kode Promo
              </h2>
              <div className="bg-white border border-amber-200/40 rounded-2xl p-5">
                <button
                  onClick={() => setShowPromoInput(!showPromoInput)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="sparkle" className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-serif text-amber-900">
                      {promo ? `Promo ${promo.code} diterapkan` : 'Punya kode promo?'}
                    </span>
                  </div>
                  <Icon
                    name="chevronRight"
                    className={`w-4 h-4 text-amber-400/60 transition-transform group-hover:text-amber-600 ${
                      showPromoInput ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showPromoInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 mt-4">
                        <input
                          className="flex-1 px-4 py-2.5 bg-amber-50/50 border border-amber-200/40 text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all font-serif text-sm uppercase rounded-xl"
                          placeholder="Masukkan kode promo"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromo(null);
                            setPromoError('');
                          }}
                        />
                        <button
                          onClick={checkPromo}
                          disabled={promoChecking || !promoCode}
                          className="px-5 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm transition-colors rounded-xl"
                        >
                          {promoChecking ? '...' : 'Pakai'}
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-red-600 text-xs font-serif mt-2">{promoError}</p>
                      )}
                      {promo && (
                        <div className="flex items-center gap-2 mt-3 text-emerald-700 text-sm font-serif">
                          <Icon name="check" className="w-4 h-4" />
                          Promo {promo.code} berhasil diterapkan!
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ===== ERROR ===== */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50/80 border border-red-200/50 text-red-700 text-sm font-serif rounded-xl px-4 py-3">
                <Icon name="alert" className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* ===== CONTINUE TO PAYMENT BUTTON (mobile only — desktop di sidebar) ===== */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="lg:hidden w-full py-4 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-serif tracking-[0.15em] text-sm transition-colors rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  Lanjut ke Pembayaran
                  <Icon name="arrow" className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>

          {/* ===== RIGHT COLUMN (2/5) — ORDER SUMMARY ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="lg:sticky lg:top-8 space-y-5">

              {/* ===== ORDER SUMMARY CARD ===== */}
              <div className="bg-white border border-amber-200/40 rounded-2xl p-6">
                <h3 className="font-serif text-lg text-amber-950 mb-5">
                  Order Summary
                </h3>

                {/* Poster + info */}
                <div className="flex gap-4 pb-5 border-b border-amber-100">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0">
                    {concert.poster ? (
                      <img
                        src={concert.poster}
                        alt={concert.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-400/40">
                        <Icon name="ticket" className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm font-semibold text-amber-950 leading-snug">
                      {concert.name}
                    </p>
                    <p className="font-serif text-xs text-amber-700/60 mt-1">
                      {category.name}
                    </p>
                    <p className="font-serif text-xs text-amber-700/60">
                      {state.qty} tiket
                    </p>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="py-5 space-y-2.5 text-sm font-serif border-b border-amber-100">
                  <div className="flex justify-between text-amber-800/70">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-800/70">
                    <span>Biaya layanan ({FEE_PERCENT}%)</span>
                    <span className="font-mono tabular-nums">
                      {formatRupiah(platformFee)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Diskon</span>
                      <span className="font-mono tabular-nums">
                        −{formatRupiah(discount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-5 flex items-center justify-between">
                  <span className="font-serif text-base font-semibold text-amber-950">
                    Total
                  </span>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={total}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="font-serif text-2xl font-bold text-amber-800 tabular-nums"
                    >
                      {formatRupiah(total)}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t border-amber-100 grid grid-cols-3 gap-2">
                  {[
                    { icon: 'shield', label: 'Secure\nCheckout' },
                    { icon: 'wallet', label: 'Multiple\nPayments' },
                    { icon: 'check', label: 'Instant\nE-Ticket' },
                  ].map((b) => (
                    <div key={b.label} className="flex flex-col items-center text-center gap-1.5">
                      <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
                        <Icon name={b.icon} className="w-4 h-4 text-amber-700" />
                      </div>
                      <span className="text-[9px] font-serif text-amber-700/70 leading-tight whitespace-pre-line">
                        {b.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ===== CONTINUE BUTTON (desktop) ===== */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="hidden lg:flex w-full py-4 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-serif tracking-[0.15em] text-sm transition-colors rounded-2xl items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjut ke Pembayaran
                    <Icon name="arrow" className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Payment methods row */}
              <div className="bg-white border border-amber-200/40 rounded-2xl p-4">
                <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/60 uppercase text-center mb-3">
                  Metode Pembayaran
                </p>
                <div className="flex items-center justify-center gap-3">
                  {[
                    { icon: 'bank', label: 'VA' },
                    { icon: 'qr', label: 'QRIS' },
                    { icon: 'wallet', label: 'e-Wallet' },
                    { icon: 'card', label: 'Card' },
                  ].map((m) => (
                    <div key={m.label} className="flex flex-col items-center gap-1 text-amber-600/60">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                        <Icon name={m.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-serif uppercase tracking-wide">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 mt-4 pt-4 border-t border-amber-100">
                  <Icon name="shield" className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-serif text-amber-700/60 leading-relaxed">
                    Pembayaran aman via <strong className="text-amber-800">Xendit</strong>.
                    Kamu akan diarahkan ke halaman pembayaran setelah klik Lanjut.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}