import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import api from '../../api/axios';
import { Loading, formatRupiah, formatDate } from '../../components/Ui';

const EASE = [0.22, 1, 0.36, 1];

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
    copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
    download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
    checkCircle: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    qr: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
    external: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16',
    navigation: 'M12 2l9 19-9-5-9 5 9-19z',
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
    creditCard: 'M3 10h18M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    quote: 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
    close: 'M6 18L18 6M6 6l12 12',
    send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
    spark: 'M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// ===== STATUS BADGE =====
function StatusBadge({ status }) {
  const configs = {
    menunggu_pembayaran: { label: 'Pending Payment', class: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
    lunas: { label: 'Confirmed', class: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
    kadaluarsa: { label: 'Expired', class: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
    dibatalkan: { label: 'Cancelled', class: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
  };
  const config = configs[status] || configs.menunggu_pembayaran;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-serif tracking-wide border ${config.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ===== COUNTDOWN TIMER =====
function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const distance = new Date(expiresAt).getTime() - Date.now();
      if (distance <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        hours: Math.floor(distance / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!timeLeft) return <span className="text-red-600 font-mono tabular-nums">00:00:00</span>;

  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 5;
  return (
    <span className={`font-mono font-bold tabular-nums ${isUrgent ? 'text-red-600' : 'text-amber-700'}`}>
      {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
    </span>
  );
}

// ===== SUCCESS BURST =====
function SuccessBurst({ onDone }) {
  const reduce = useReducedMotion();
  const particles = Array.from({ length: 16 });

  useEffect(() => {
    if (reduce) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone, reduce]);

  if (reduce) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl"
        >
          <Icon name="check" className="w-12 h-12 text-white" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
    >
      {/* Backdrop flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.35, 0] }}
        transition={{ duration: 1.0, times: [0, 0.3, 1] }}
        className="absolute inset-0 bg-amber-300"
        aria-hidden="true"
      />

      {/* Checkmark spring */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative w-28 h-28 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
      >
        <svg viewBox="0 0 24 24" className="w-16 h-16 text-white" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M20 6L9 17l-5-5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      {/* Radial spark particles */}
      {particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 90 + Math.random() * 40;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x, y, scale: [0, 1, 0.6], opacity: [1, 1, 0] }}
            transition={{ duration: 0.9, delay: 0.2 + Math.random() * 0.1, ease: 'easeOut' }}
            className="absolute w-2 h-2 rounded-full bg-amber-500"
            aria-hidden="true"
          />
        );
      })}
    </motion.div>
  );
}

// ===== EMERGING TICKET WRAPPER =====
function EmergingTicketWrapper({ children, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, clipPath: 'inset(0 0 100% 0)' }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      style={{ willChange: 'clip-path, transform' }}
    >
      {children}
    </motion.div>
  );
}

// ===== TICKET CARD =====
function TicketCard({ ticket, index }) {
  const [copied, setCopied] = useState(false);

  async function copyTicketCode() {
    try {
      await navigator.clipboard.writeText(ticket.ticket_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  }

  return (
    <div className="relative bg-white border border-amber-200/50 rounded-xl overflow-hidden shadow-sm">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-serif text-[9px] tracking-[0.3em] text-amber-600/60 uppercase">
            E-Ticket #{index + 1}
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-amber-600/40 bg-amber-50 border border-amber-200/40 rounded-sm px-1.5 py-0.5">
            {ticket.ticket_code}
          </span>
        </div>

        <div className="relative flex justify-center mb-4">
          <div className="p-3 bg-white rounded-lg border border-amber-200/40 shadow-sm">
            <img src={ticket.qr_code} alt={`Ticket QR ${index + 1}`} className="w-36 h-36" />
          </div>
          {ticket.is_checked_in && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-lg">
              <span className="bg-emerald-700 text-white text-xs font-serif px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-md">
                <Icon name="check" className="w-3.5 h-3.5" />
                Checked In
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={copyTicketCode}
            className="flex items-center gap-1 text-xs font-serif text-amber-700 hover:text-amber-900 transition-colors"
          >
            {copied ? (
              <>
                <Icon name="check" className="w-3 h-3 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Icon name="copy" className="w-3 h-3" />
                Copy Code
              </>
            )}
          </button>
          <span className="w-px h-4 bg-amber-200/40" />
          <a
            href={ticket.qr_code}
            download={`eticket-${ticket.ticket_code}.png`}
            className="flex items-center gap-1 text-xs font-serif text-amber-700 hover:text-amber-900 transition-colors"
          >
            <Icon name="download" className="w-3 h-3" />
            Download QR
          </a>
        </div>
      </div>
    </div>
  );
}

// ===== STEPPER =====
function Stepper({ currentStep }) {
  const steps = ['Select tickets', 'Concert Detail', 'Payment', 'E-ticket'];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
      {steps.map((step, idx) => {
        const isDone = idx < currentStep;
        const isCurrent = idx === currentStep;
        return (
          <div key={step} className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-amber-700 text-white'
                    : 'bg-white border border-amber-200/60 text-amber-400'
                }`}
              >
                {isDone ? <Icon name="check" className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-xs md:text-sm font-serif hidden sm:inline ${
                  isCurrent ? 'text-amber-950 font-semibold' : 'text-amber-700/50'
                }`}
              >
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-6 md:w-12 h-px ${isDone ? 'bg-emerald-400' : 'bg-amber-200/60'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== TESTIMONIAL SECTION =====
function TestimonialSection({ orderId }) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const MAX_CHARS = 500;
  const MIN_CHARS = 10;
  const remaining = MAX_CHARS - text.length;
  const isValid = text.trim().length >= MIN_CHARS && text.length <= MAX_CHARS;

  useEffect(() => {
    let mounted = true;
    api
      .get('/testimonials/check', { params: { order_id: orderId } })
      .then((res) => {
        if (!mounted) return;
        setHasSubmitted(res.data.hasSubmitted);
        if (!res.data.hasSubmitted) setShowForm(true);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setChecking(false);
      });
    return () => { mounted = false; };
  }, [orderId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/testimonials', { text: text.trim(), rating, order_id: orderId });
      setSuccess(true);
      setHasSubmitted(true);
      setTimeout(() => setShowForm(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit testimonial');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="bg-white/90 border border-amber-200/40 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-amber-100/60 rounded w-1/3 mb-4" />
        <div className="h-20 bg-amber-50/60 rounded" />
      </div>
    );
  }

  if (hasSubmitted && !showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50/80 border border-emerald-200/50 rounded-2xl p-5 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200/60 flex items-center justify-center flex-shrink-0">
          <Icon name="checkCircle" className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-sm font-semibold text-emerald-900">Testimonial submitted</p>
          <p className="font-serif text-xs text-emerald-700/70 mt-0.5">Thank you for sharing your experience!</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-xs font-serif text-emerald-700 hover:text-emerald-900 underline"
        >
          View
        </button>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-amber-50 border-2 border-amber-300/60 rounded-2xl p-8 text-center shadow-lg"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-700 text-amber-50 mb-4"
        >
          <Icon name="check" className="w-8 h-8" />
        </motion.div>
        <h3 className="font-serif text-2xl text-amber-950 mb-2">Thank you!</h3>
        <p className="font-serif text-sm text-amber-800/70">
          Your testimonial has been received and will appear on the homepage soon.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-[#faf6ef] border-2 border-amber-300/50 rounded-2xl p-6 md:p-8 shadow-xl"
    >
      {hasSubmitted && (
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-700 transition-colors"
          aria-label="Close"
        >
          <Icon name="close" className="w-4 h-4" />
        </button>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-700/10 border border-amber-700/20 mb-3">
          <Icon name="quote" className="w-6 h-6 text-amber-700" />
        </div>
        <span className="block font-serif text-[10px] tracking-[0.4em] text-amber-600/80 uppercase mb-2">
          How Was Your Experience?
        </span>
        <h3 className="font-serif text-2xl md:text-3xl text-amber-950 leading-tight">
          Tell Us Your <span className="italic text-amber-600">Experience</span>
        </h3>
        <p className="font-serif text-xs text-amber-700/60 mt-2">
          Help other fans find the best concerts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <label className="block font-serif text-[10px] tracking-[0.3em] text-amber-700/70 uppercase mb-3">
            Your Rating
          </label>
          <div className="inline-flex gap-2" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="focus:outline-none"
                  aria-label={`Rate ${star}`}
                >
                  <svg
                    className={`w-9 h-9 transition-colors duration-150 ${active ? 'text-amber-500' : 'text-amber-200'}`}
                    fill={active ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </motion.button>
              );
            })}
          </div>
          <p className="font-serif text-xs text-amber-600/60 mt-2">
            {['', 'Bad', 'Poor', 'Okay', 'Good', 'Amazing!'][hoverRating || rating]}
          </p>
        </div>

        <div>
          <label className="block font-serif text-[10px] tracking-[0.3em] text-amber-700/70 uppercase mb-2">
            Tell Us Your Experience
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How was the ticket-buying experience, the concert atmosphere, the venue facilities..."
            rows={5}
            maxLength={MAX_CHARS}
            className="w-full px-4 py-3 bg-white/70 border border-amber-200/60 rounded-xl text-amber-900 placeholder-amber-400/50 font-serif text-sm focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none"
          />
          <div className="flex items-center justify-between mt-2 text-[10px] font-serif text-amber-600/50">
            <span>Min. {MIN_CHARS} characters</span>
            <span className={remaining < 50 ? 'text-red-500' : ''}>{remaining} characters left</span>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-red-50 border border-red-200/50 rounded-xl text-red-700 text-sm font-serif"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={submitting || !isValid}
          whileHover={isValid && !submitting ? { scale: 1.01 } : {}}
          whileTap={isValid && !submitting ? { scale: 0.98 } : {}}
          className="w-full py-3.5 px-4 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif tracking-[0.3em] uppercase text-xs rounded-xl shadow-lg shadow-amber-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {submitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-amber-200/40 border-t-amber-200 rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Icon name="send" className="w-4 h-4" />
              Submit Testimonial
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

// ===== MAIN COMPONENT =====
export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkMsg, setCheckMsg] = useState('');
  const [checkOk, setCheckOk] = useState(null);
  const [eticket, setEticket] = useState(null);
  const [copiedVa, setCopiedVa] = useState(false);

  // 🎉 State animasi kemenangan
  const [showBurst, setShowBurst] = useState(false);
  const [justPaid, setJustPaid] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      if (res.data.status === 'lunas') {
        const t = await api.get(`/orders/${id}/ticket`);
        setEticket(t.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckStatus() {
    setChecking(true);
    setCheckMsg('');
    setCheckOk(null);
    try {
      const res = await api.get(`/orders/${id}/check-payment`);
      if (res.data.status === 'lunas') {
        // 🎉 Trigger burst + emerge
        setShowBurst(true);
        setCheckMsg('Payment confirmed! Your tickets are ready.');
        setCheckOk('success');
        setJustPaid(true);
        await fetchOrder();
      } else if (res.data.status === 'kadaluarsa') {
        setCheckMsg('The payment window has expired.');
        setCheckOk('expired');
        fetchOrder();
      } else {
        setCheckMsg('We have not received your payment yet. Have you completed the payment?');
        setCheckOk('pending');
        fetchOrder();
      }
    } catch (err) {
      setCheckMsg(err.response?.data?.message || 'Failed to check payment status.');
      setCheckOk('pending');
    } finally {
      setChecking(false);
    }
  }

  async function copyVaNumber() {
    try {
      await navigator.clipboard.writeText(order.va_number || '');
      setCopiedVa(true);
      setTimeout(() => setCopiedVa(false), 2000);
    } catch {
      // silent
    }
  }

  if (loading) return <Loading />;

  if (!order)
    return (
      <div className="min-h-screen bg-[#f5ede4] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-amber-100/70 border border-amber-200/50 flex items-center justify-center mx-auto mb-5">
            <Icon name="search" className="w-7 h-7 text-amber-400/60" />
          </div>
          <h2 className="font-serif text-xl text-amber-950 mb-2">Order Not Found</h2>
          <p className="font-serif text-amber-700/50 mb-6 text-sm">
            The order you are looking for may have been deleted or is invalid.
          </p>
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm tracking-wide transition-colors rounded-md shadow-sm"
          >
            <Icon name="chevronLeft" className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );

  const currentStep =
    order.status === 'lunas' ? 3 :
    order.status === 'menunggu_pembayaran' ? 2 : 2;

  const statusInfo = {
    menunggu_pembayaran: {
      label: 'Awaiting Payment',
      description: 'Complete your payment before time runs out',
      icon: 'clock',
      color: 'text-amber-700',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/50',
    },
    lunas: {
      label: 'Payment Successful',
      description: 'Your tickets are ready to use',
      icon: 'checkCircle',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/50',
    },
    kadaluarsa: {
      label: 'Payment Expired',
      description: 'The payment window for this order has ended',
      icon: 'alert',
      color: 'text-red-600',
      bg: 'bg-red-50/80',
      border: 'border-red-200/50',
    },
    dibatalkan: {
      label: 'Order Cancelled',
      description: 'This order has been cancelled',
      icon: 'alert',
      color: 'text-gray-500',
      bg: 'bg-gray-50/80',
      border: 'border-gray-200/50',
    },
  };

  const currentStatus = statusInfo[order.status] || statusInfo.menunggu_pembayaran;

  const checkMsgStyle =
    {
      success: 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/40',
      expired: 'bg-red-50/80 text-red-600 border border-red-200/40',
      pending: 'bg-amber-50/80 text-amber-700 border border-amber-200/40',
    }[checkOk] || 'bg-amber-50/80 text-amber-700 border border-amber-200/40';

  return (
    <div className="min-h-screen bg-[#f5ede4]">

      {/* Texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
        aria-hidden="true"
      />

      {/* 🎉 SUCCESS BURST — overlay saat pembayaran baru lunas */}
      <AnimatePresence>
        {showBurst && <SuccessBurst onDone={() => setShowBurst(false)} />}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-8 relative">

        <Link
          to="/my-orders"
          className="inline-flex items-center gap-1 text-sm font-serif text-amber-700/50 hover:text-amber-900 transition-colors group mb-6"
        >
          <Icon name="chevronLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          My Orders
        </Link>

        {/* ===== STEPPER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Stepper currentStep={currentStep} />
        </motion.div>

        {/* ===== CONFIRMED BANNER ===== */}
        {order.status === 'lunas' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={justPaid ? { delay: 1.4, duration: 0.6, ease: EASE } : { duration: 0.5 }}
            className="bg-emerald-50/80 border border-emerald-200/50 rounded-2xl p-5 mb-6 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200/60 flex items-center justify-center flex-shrink-0">
              <Icon name="check" className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-base font-semibold text-emerald-900">
                Your order is confirmed
              </h3>
              <p className="text-xs font-serif text-emerald-800/70 mt-1 leading-relaxed">
                Your e-tickets are ready. Show the QR code at the venue entrance.
                Don't forget to arrive on time!
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== 2-COLUMN GRID ===== */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:col-span-2 space-y-5">

            {/* BOOKING DETAILS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 border border-amber-200/40 rounded-2xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-base font-semibold text-amber-950 mb-5">
                Order Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1.5">Customer</p>
                  <p className="font-serif text-sm text-amber-950 font-medium">{order.customer_name || '-'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1.5">Order Code</p>
                  <p className="font-mono text-sm text-amber-950">#{order.order_code}</p>
                </div>

                <div>
                  <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1.5">Email</p>
                  <p className="font-serif text-sm text-amber-950 break-all">{order.customer_email || '-'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1.5">Order Date</p>
                  <p className="font-serif text-sm text-amber-950">{formatDate(order.created_at)}</p>
                </div>

                {order.event_date && (
                  <div>
                    <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1.5">Event Date</p>
                    <p className="font-serif text-sm text-amber-950">
                      {formatDate(order.event_date)}
                      {order.start_time && (
                        <span className="text-amber-700/60"> · {order.start_time.slice(0, 5)}</span>
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1.5">Ticket Category</p>
                  <p className="font-serif text-sm text-amber-950">
                    {order.ticket_category_name} · {order.qty}× tickets
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ===== E-TICKET SECTION ===== */}
            {eticket && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={justPaid ? { delay: 0.4, duration: 0.5, ease: EASE } : { delay: 0.05 }}
                className="bg-white/90 border border-amber-200/40 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50/80 border border-emerald-200/40 flex items-center justify-center">
                    <Icon name="qr" className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-semibold text-amber-950">
                      Your E-Tickets
                    </h2>
                    <p className="text-xs font-serif text-amber-700/50">
                      Show these QR codes at the venue entrance
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {eticket.tickets.map((t, index) => (
                    <EmergingTicketWrapper
                      key={t.id}
                      delay={justPaid ? 0.9 + index * 0.15 : 0}
                    >
                      <TicketCard ticket={t} index={index} />
                    </EmergingTicketWrapper>
                  ))}
                </div>
              </motion.div>
            )}

            {/* VENUE & MAP */}
            {eticket && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={justPaid ? { delay: 1.4, duration: 0.5, ease: EASE } : { delay: 0.1 }}
                className="bg-white/90 border border-amber-200/40 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/60 border border-amber-200/40 flex items-center justify-center">
                    <Icon name="pin" className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base font-semibold text-amber-950">Venue Location</h2>
                    <p className="text-xs font-serif text-amber-700/50">Navigate to the concert location</p>
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-200/40 rounded-xl p-4 mb-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-serif font-medium text-amber-900">{order.venue_name || '-'}</p>
                      {order.venue_address && (
                        <p className="text-sm font-serif text-amber-700/60 mt-1">{order.venue_address}</p>
                      )}
                      {order.city && (
                        <p className="text-sm font-serif text-amber-600/50 mt-1">{order.city}</p>
                      )}
                    </div>

                    {order.venue_latitude && order.venue_longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${order.venue_latitude},${order.venue_longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-serif text-amber-700 hover:text-amber-900 transition-colors flex-shrink-0 bg-white border border-amber-200/40 rounded-md px-3 py-2"
                      >
                        <Icon name="map" className="w-4 h-4" />
                        Open Map
                      </a>
                    ) : (
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(`${order.venue_name} ${order.venue_address || ''} ${order.city || ''}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-serif text-amber-700 hover:text-amber-900 transition-colors flex-shrink-0 bg-white border border-amber-200/40 rounded-md px-3 py-2"
                      >
                        <Icon name="map" className="w-4 h-4" />
                        Open Map
                      </a>
                    )}
                  </div>
                </div>

                {order.venue_latitude && order.venue_longitude ? (
                  <div className="relative rounded-xl overflow-hidden border border-amber-200/40 mb-4">
                    <iframe
                      title="Venue location"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(order.venue_longitude) - 0.005}%2C${Number(order.venue_latitude) - 0.005}%2C${Number(order.venue_longitude) + 0.005}%2C${Number(order.venue_latitude) + 0.005}&layer=mapnik&marker=${order.venue_latitude}%2C${order.venue_longitude}`}
                      className="w-full h-64"
                    />
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border border-amber-200/30 rounded-xl p-6 text-center mb-4">
                    <Icon name="pin" className="w-10 h-10 text-amber-300/50 mx-auto mb-2" />
                    <p className="text-sm font-serif text-amber-700/50">Map is not available for this venue</p>
                  </div>
                )}

                {order.venue_latitude && order.venue_longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.venue_latitude},${order.venue_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif tracking-[0.3em] uppercase text-xs transition-colors flex items-center justify-center gap-2 rounded-lg shadow-sm"
                  >
                    <Icon name="navigation" className="w-4 h-4" />
                    Get Directions
                  </a>
                )}
              </motion.div>
            )}

            {/* PAYMENT SECTION */}
            <AnimatePresence>
              {order.status === 'menunggu_pembayaran' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/90 border border-amber-200/40 rounded-2xl p-6 shadow-sm"
                >
                  <h2 className="font-serif text-base font-semibold text-amber-950 mb-5">
                    Payment Instructions
                  </h2>

                  <div className="bg-amber-50/60 border border-amber-200/40 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-serif text-amber-600/50 uppercase tracking-wider">
                        Total Payment
                      </span>
                      <span className="text-lg font-serif font-bold text-amber-800 tabular-nums">
                        {formatRupiah(order.total_price)}
                      </span>
                    </div>
                    <p className="text-xs font-serif text-amber-600/40">
                      via Xendit · Virtual Account, QRIS, e-wallet, or credit card
                    </p>
                  </div>

                  {order.va_number && (
                    <div className="bg-amber-50/60 border border-amber-200/40 rounded-xl p-4 mb-4">
                      <p className="text-[10px] font-serif text-amber-600/50 uppercase tracking-wider mb-2">
                        Virtual Account Number
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-amber-950 tracking-wide">
                          {order.va_number}
                        </span>
                        <button
                          type="button"
                          onClick={copyVaNumber}
                          className="p-2 hover:bg-amber-100/50 rounded-md transition-colors"
                          aria-label="Copy VA number"
                        >
                          {copiedVa ? (
                            <Icon name="check" className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Icon name="copy" className="w-4 h-4 text-amber-500" />
                          )}
                        </button>
                      </div>
                      <AnimatePresence>
                        {copiedVa && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-emerald-700 font-serif mt-1"
                          >
                            VA number copied!
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="space-y-2">
                    {order.xendit_invoice_url && (
                      <a
                        href={order.xendit_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif tracking-[0.3em] uppercase text-xs transition-colors flex items-center justify-center gap-2 rounded-lg shadow-sm"
                      >
                        <Icon name="external" className="w-4 h-4" />
                        Open Payment Page
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleCheckStatus}
                      disabled={checking}
                      className="w-full py-3 bg-white/80 border border-amber-200/40 hover:border-amber-500/50 text-amber-950 font-serif text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-lg"
                    >
                      {checking ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Checking...
                        </>
                      ) : (
                        <>
                          <Icon name="refresh" className="w-4 h-4" />
                          Check Payment Status
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {checkMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mt-3 p-3 rounded-lg text-sm font-serif flex items-start gap-2 ${checkMsgStyle}`}
                      >
                        <Icon
                          name={checkOk === 'success' ? 'checkCircle' : checkOk === 'expired' ? 'alert' : 'clock'}
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                        />
                        {checkMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TESTIMONIAL SECTION */}
            {order.status === 'lunas' && (
              <TestimonialSection orderId={order.id} />
            )}
          </div>

          {/* ===== RIGHT COLUMN — SIDEBAR ===== */}
          <div className="lg:col-span-1 space-y-5">

            {/* RESERVATION SUMMARY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/90 border border-amber-200/40 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="font-serif text-base font-semibold text-amber-950 mb-4">
                Reservation Summary
              </h3>

              <div className="mb-4">
                <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1">
                  Concert
                </p>
                <p className="font-serif text-sm text-amber-950 font-medium leading-snug">
                  {order.concert_name}
                </p>
                {order.artist && (
                  <p className="text-xs font-serif text-amber-700/60 mt-0.5">{order.artist}</p>
                )}
              </div>

              {order.event_date && (
                <div className="mb-4">
                  <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1">Schedule</p>
                  <p className="font-serif text-sm text-amber-950 flex items-center gap-1.5">
                    <Icon name="calendar" className="w-3.5 h-3.5 text-amber-500" />
                    {formatDate(order.event_date)}
                  </p>
                  {order.start_time && (
                    <p className="font-serif text-xs text-amber-700/60 mt-1 flex items-center gap-1.5">
                      <Icon name="clock" className="w-3 h-3" />
                      {order.start_time.slice(0, 5)}
                    </p>
                  )}
                </div>
              )}

              {order.venue_name && (
                <div className="mb-4">
                  <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1">Venue</p>
                  <p className="font-serif text-sm text-amber-950 flex items-start gap-1.5">
                    <Icon name="pin" className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{order.venue_name}{order.city ? `, ${order.city}` : ''}</span>
                  </p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-[10px] font-serif tracking-[0.2em] text-amber-600/50 uppercase mb-1">Tickets</p>
                <p className="font-serif text-sm text-amber-950">
                  {order.ticket_category_name} × {order.qty}
                </p>
              </div>
            </motion.div>

            {/* PRICE SUMMARY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 border border-amber-200/40 rounded-2xl p-5 shadow-sm"
            >
              <h3 className="font-serif text-base font-semibold text-amber-950 mb-4">
                Price Summary
              </h3>

              <div className="space-y-2 text-sm font-serif">
                <div className="flex justify-between text-amber-800/70">
                  <span>Tickets ({order.qty}×)</span>
                  <span className="font-mono tabular-nums">
                    {formatRupiah((order.unit_price || 0) * order.qty)}
                  </span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">−{formatRupiah(order.discount_amount)}</span>
                  </div>
                )}

                {order.platform_fee_amount > 0 && (
                  <div className="flex justify-between text-amber-800/70">
                    <span>Platform fee</span>
                    <span className="font-mono tabular-nums">{formatRupiah(order.platform_fee_amount)}</span>
                  </div>
                )}

                <div className="pt-3 mt-3 border-t border-amber-200/40 flex justify-between items-baseline">
                  <span className="text-[10px] font-serif tracking-[0.2em] text-amber-700/60 uppercase">Total</span>
                  <span className="font-serif text-xl font-bold text-amber-800 tabular-nums">
                    {formatRupiah(order.total_price)}
                  </span>
                </div>
              </div>

              {order.status === 'lunas' && eticket ? (
                <a
                  href={eticket.tickets[0]?.qr_code}
                  download={`eticket-${order.order_code}.png`}
                  className="mt-5 w-full py-3 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 rounded-lg shadow-sm"
                >
                  <Icon name="download" className="w-4 h-4" />
                  Download Tickets
                </a>
              ) : order.status === 'menunggu_pembayaran' && order.xendit_invoice_url ? (
                <a
                  href={order.xendit_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full py-3 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 rounded-lg shadow-sm"
                >
                  <Icon name="creditCard" className="w-4 h-4" />
                  Pay Now
                </a>
              ) : null}

              <p className="text-[10px] font-serif text-amber-600/40 text-center mt-3">
                Powered by TiketKu
              </p>
            </motion.div>

            {/* EXPIRED/CANCELLED NOTICE */}
            {(order.status === 'kadaluarsa' || order.status === 'dibatalkan') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/90 border border-red-200/40 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50/80 border border-red-200/40 flex items-center justify-center flex-shrink-0">
                    <Icon name="alert" className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="font-serif text-amber-800/70 text-sm">
                    {order.status === 'kadaluarsa'
                      ? 'The payment window for this order has ended. Please create a new order.'
                      : 'This order has been cancelled.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* COUNTDOWN */}
            {order.status === 'menunggu_pembayaran' && order.expires_at && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-50/80 border border-amber-200/50 rounded-2xl p-4 flex items-center justify-between"
              >
                <span className="text-xs font-serif text-amber-700/70 flex items-center gap-2">
                  <Icon name="clock" className="w-3.5 h-3.5 text-amber-500" />
                  Time remaining
                </span>
                <CountdownTimer expiresAt={order.expires_at} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}