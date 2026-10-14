import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  check: 'M5 13l4 4L19 7',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  close: 'M6 18L18 6M6 6l12 12',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  receipt: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  chevronLeft: 'M15 19l-7-7 7-7',
  chevronRight: 'M9 6l6 6-6 6',
  copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const activateOnKey = (fn) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};

/* ============ STYLES ============ */
const vNotch = (r) =>
  `radial-gradient(circle ${r}px at calc(100% - var(--stub-w)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle ${r}px at calc(100% - var(--stub-w)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .hero-pass { --stub-w: 17rem; }
  .concert-ticket { --stub-w: 10.5rem; }
  @media (min-width: 640px) {
    .hero-pass { -webkit-mask: ${vNotch(10)}; mask: ${vNotch(10)}; }
    .concert-ticket { -webkit-mask: ${vNotch(9)}; mask: ${vNotch(9)}; }
  }
`;

/* ============ STATUS BADGE ============ */
const statusBadge = {
  belum_cair: { label: 'Not paid out', text: 'text-yellow-700', dot: 'bg-yellow-500', bg: 'bg-yellow-50' },
  sudah_cair: { label: 'Paid out', text: 'text-emerald-700', dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
  lunas: { label: 'Paid', text: 'text-emerald-700', dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
  pending: { label: 'Pending', text: 'text-yellow-700', dot: 'bg-yellow-500', bg: 'bg-yellow-50' },
};

function StatusBadge({ status }) {
  const meta = statusBadge[status] || { label: status || '-', text: 'text-amber-700', dot: 'bg-amber-500', bg: 'bg-amber-50' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${meta.bg} text-xs font-medium ${meta.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/* ============ NUMBER TICKER ============ */
function NumberTicker({ value, format = 'id-ID', prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const to = Number(value) || 0;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(to);
      prevValueRef.current = to;
      return;
    }
    const start = performance.now();
    const from = prevValueRef.current;
    let raf;

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
      else prevValueRef.current = to;
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {display.toLocaleString(format)}
      {suffix}
    </span>
  );
}

/* ============ SHELL ============ */
function Shell({ children, maxW = 'max-w-4xl' }) {
  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        <div className={`${maxW} mx-auto px-4 py-8`}>{children}</div>
      </div>
    </MotionConfig>
  );
}

/* ============ FILTER CHIP ============ */
function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${focusRing} ${
        active ? 'bg-amber-950 text-amber-50' : 'bg-amber-50 text-amber-800 hover:text-amber-950 hover:bg-amber-100'
      }`}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${active ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'}`}>
        {count}
      </span>
    </button>
  );
}

/* ============ STAT ROW (hero stub) ============ */
function StatRow({ icon, label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-sm text-amber-900 flex items-center gap-2.5">
        <span className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${tone}`}>
          <Icon name={icon} className="w-4 h-4" />
        </span>
        {label}
      </span>
      <span className="f-display text-sm font-semibold text-amber-950 tabular-nums">{value}</span>
    </div>
  );
}

/* ============ ORDER CARD ============ */
function OrderCard({ order, onClick, onCopyCode, copiedCode }) {
  const isCopied = copiedCode === order.order_code;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={activateOnKey(onClick)}
      className={`group flex items-center gap-3 sm:gap-4 w-full text-left bg-white rounded-2xl px-4 py-3.5 cursor-pointer border border-transparent hover:border-amber-300 transition-colors ${focusRing}`}
    >
      <span className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 f-display font-semibold flex items-center justify-center shrink-0">
        {order.customer_name?.charAt(0)?.toUpperCase() || '?'}
      </span>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-amber-950 truncate">{order.customer_name || 'Customer'}</h3>
        <p className="text-xs text-amber-800/80 truncate mt-0.5">
          {order.ticket_category_name || 'Ticket category'} × {order.qty || 1}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-amber-700/80">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCopyCode(order.order_code);
            }}
            className={`flex items-center gap-1 hover:text-amber-950 transition-colors rounded ${focusRing}`}
            title="Copy order code"
            aria-label={`Copy order code ${order.order_code || ''}`}
          >
            {isCopied ? (
              <>
                <Icon name="check" className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <span className="font-mono">{order.order_code || '-'}</span>
                <Icon name="copy" className="w-3 h-3 opacity-60" />
              </>
            )}
          </button>
          <span className="flex items-center gap-1">
            <Icon name="calendar" className="w-3 h-3" />
            {formatDate(order.created_at)}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <StatusBadge status={order.payout_status} />
        <p className="f-display text-base font-semibold text-amber-950 tabular-nums">
          {formatRupiah(Number(order.eo_payout_amount) || 0)}
        </p>
      </div>

      <Icon name="chevronRight" className="hidden sm:block w-4 h-4 text-amber-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0" />
    </div>
  );
}

/* ============ CONCERT TICKET CARD ============ */
function ConcertCard({ group, onClick }) {
  const totalOrders = group.orders.length;
  const pendingCount = group.orders.filter((o) => o.payout_status === 'belum_cair').length;
  const doneCount = totalOrders - pendingCount;
  const totalQty = group.orders.reduce((sum, o) => sum + (Number(o.qty) || 0), 0);
  const payoutPct = group.total_payout > 0 ? Math.round((group.total_done / group.total_payout) * 100) : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={activateOnKey(onClick)}
      aria-label={`Open ${group.concert_name}`}
      className={`group cursor-pointer rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_8px_16px_rgba(69,26,3,0.16)] transition-[filter] duration-200 ${focusRing}`}
    >
      <div className="concert-ticket bg-white rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_var(--stub-w)]">
        {/* Main */}
        <div className="flex items-stretch min-w-0">
          <div className="w-24 sm:w-28 shrink-0 bg-amber-100 overflow-hidden">
            {group.concert_poster ? (
              <img src={group.concert_poster} alt={`${group.concert_name} poster`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-500 bg-gradient-to-br from-amber-100 to-amber-200/70">
                <Icon name="ticket" className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="f-display text-lg font-semibold text-amber-950 leading-snug truncate">{group.concert_name}</h3>
                {group.concert_artist && <p className="text-sm text-amber-800/80 truncate">{group.concert_artist}</p>}
              </div>
              <Icon name="chevronRight" className="w-4 h-4 text-amber-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5" />
            </div>

            <p className="text-sm text-amber-900 mt-2 tabular-nums">
              {totalQty} {totalQty === 1 ? 'ticket' : 'tickets'} in {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
            </p>

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700">
                  <Icon name="clock" className="w-3 h-3" />
                  {pendingCount} not paid out
                </span>
              )}
              {doneCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
                  <Icon name="check" className="w-3 h-3" />
                  {doneCount} paid out
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stub */}
        <div className="bg-amber-50 border-t sm:border-t-0 sm:border-l border-dashed border-amber-300/80 px-4 py-3.5 sm:py-4 flex flex-col justify-center gap-2">
          <div>
            <p className="text-xs text-amber-700/80">Your revenue</p>
            <p className="f-display text-lg font-semibold text-amber-950 tabular-nums leading-tight">
              {formatRupiah(group.total_payout)}
            </p>
          </div>
          <div>
            <div className="h-1.5 bg-amber-200/70 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${payoutPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-amber-800/80 mt-1 tabular-nums">{payoutPct}% paid out</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ ORDER DETAIL MODAL ============ */
function DetailRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
        <Icon name={icon} className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <dt className="text-xs text-amber-700/80">{label}</dt>
        <dd className="text-sm text-amber-950 break-words mt-0.5">{children}</dd>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onCopyCode, copiedCode }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isCopied = copiedCode === order.order_code;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        initial={{ opacity: 0, scale: 0.97, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 40 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="f-body bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden max-h-[92vh] flex flex-col shadow-xl shadow-amber-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 bg-amber-950 text-amber-50 shrink-0">
          <div className="min-w-0">
            <p className="text-sm text-amber-300">Order details</p>
            <h3 className="f-display text-xl font-semibold truncate mt-0.5">{order.concert_name}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-1.5 -mr-1.5 -mt-1 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors ${focusRing}`}
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
            <span className="text-sm text-amber-800">Payment status</span>
            <StatusBadge status={order.status} />
          </div>

          <dl className="space-y-3.5">
            <DetailRow icon="receipt" label="Order code">
              <span className="flex items-center gap-2">
                <span className="font-mono break-all">{order.order_code || '-'}</span>
                <button
                  type="button"
                  onClick={() => onCopyCode(order.order_code)}
                  aria-label="Copy order code"
                  className={`p-1 rounded-md text-amber-700/80 hover:text-amber-950 hover:bg-amber-100 transition-colors shrink-0 ${focusRing}`}
                >
                  <Icon name={isCopied ? 'check' : 'copy'} className={`w-3.5 h-3.5 ${isCopied ? 'text-emerald-600' : ''}`} />
                </button>
              </span>
            </DetailRow>
            <DetailRow icon="user" label="Customer">{order.customer_name || '-'}</DetailRow>
            <DetailRow icon="mail" label="Email">{order.customer_email || '-'}</DetailRow>
            <DetailRow icon="phone" label="Phone">{order.customer_phone || '-'}</DetailRow>
            <DetailRow icon="ticket" label="Ticket category">
              {order.ticket_category_name || '-'} × {order.qty || 1}
            </DetailRow>
          </dl>

          <div className="pt-5 border-t border-dashed border-amber-200">
            <h4 className="f-display text-base font-semibold text-amber-950 mb-3">Price breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-amber-800">
                <span>Ticket subtotal</span>
                <span className="tabular-nums text-amber-950">
                  {formatRupiah((Number(order.unit_price) || 0) * (Number(order.qty) || 1))}
                </span>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Platform service fee</span>
                <span className="tabular-nums">−{formatRupiah(Number(order.platform_fee_amount) || 0)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Promo discount</span>
                  <span className="tabular-nums text-emerald-600">−{formatRupiah(Number(order.discount_amount) || 0)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-3 mt-3 border-t border-dashed border-amber-200 text-amber-950 font-semibold">
                <span>Your share</span>
                <span className="f-display text-lg tabular-nums">{formatRupiah(Number(order.eo_payout_amount) || 0)}</span>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-dashed border-amber-200">
            <h4 className="f-display text-base font-semibold text-amber-950 mb-3">Payout</h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
              <StatusBadge status={order.payout_status} />
              {order.payout_at && <span className="text-sm text-amber-800">{formatDate(order.payout_at)}</span>}
            </div>
            {order.payout_note && (
              <div className="mt-2 p-3 rounded-xl border border-dashed border-amber-300/70">
                <p className="text-xs text-amber-700/80 mb-1">Note from admin</p>
                <p className="text-sm text-amber-900">{order.payout_note}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-dashed border-amber-200 shrink-0">
          <button
            onClick={onClose}
            className={`w-full py-2.5 text-sm font-medium text-amber-50 bg-amber-800 hover:bg-amber-700 rounded-xl transition-colors ${focusRing}`}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============ EMPTY STATE ============ */
function EmptyState({ icon, title, text, actionLabel, onAction }) {
  return (
    <div className="text-center rounded-2xl border-2 border-dashed border-amber-300/70 py-14 px-6">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">{title}</h3>
      <p className="text-sm text-amber-800/80 max-w-sm mx-auto">{text}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className={`mt-4 px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ============ MAIN ============ */
export default function EoPayouts() {
  const [summary, setSummary] = useState({
    total_pendapatan: 0,
    belum_cair: 0,
    sudah_cair: 0,
    total_tiket_terjual: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcertId, setSelectedConcertId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [unseenCount, setUnseenCount] = useState(0);
  const [markingSeen, setMarkingSeen] = useState(false);
  const [payoutFilter, setPayoutFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [copiedCode, setCopiedCode] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, ordersRes] = await Promise.all([
        api.get('/payouts/my-summary'),
        api.get('/orders/eo/my', { params: { status: 'lunas' } }),
      ]);
      setSummary(summaryRes.data || { total_pendapatan: 0, belum_cair: 0, sudah_cair: 0, total_tiket_terjual: 0 });
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    api.get('/orders/eo/unseen-payouts')
      .then((res) => setUnseenCount(res.data.count || 0))
      .catch((err) => console.error(err));
  }, []);

  const closeOrder = useCallback(() => setSelectedOrder(null), []);

  async function handleMarkSeen() {
    setMarkingSeen(true);
    try {
      await api.post('/orders/eo/mark-payouts-seen');
      setUnseenCount(0);
    } catch (err) {
      console.error('Failed to mark payouts as seen:', err);
    } finally {
      setMarkingSeen(false);
    }
  }

  function handleCopyCode(code) {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((c) => (c === code ? '' : c)), 1500);
  }

  const concertGroups = useMemo(() => {
    const groups = new Map();
    orders.forEach((order) => {
      const key = order.concert_id;
      if (!groups.has(key)) {
        groups.set(key, {
          concert_id: key,
          concert_name: order.concert_name || 'Concert',
          concert_artist: order.concert_artist,
          concert_poster: order.concert_poster,
          orders: [],
          total_payout: 0,
          total_done: 0,
        });
      }
      const g = groups.get(key);
      g.orders.push(order);
      g.total_payout += Number(order.eo_payout_amount) || 0;
      if (order.payout_status === 'sudah_cair') {
        g.total_done += Number(order.eo_payout_amount) || 0;
      }
    });
    return Array.from(groups.values()).sort((a, b) => b.total_payout - a.total_payout);
  }, [orders]);

  const selectedGroup = selectedConcertId
    ? concertGroups.find((g) => g.concert_id === selectedConcertId)
    : null;

  const filteredOrders = useMemo(() => {
    if (!selectedGroup) return [];
    let result = [...selectedGroup.orders];
    if (payoutFilter !== 'all') result = result.filter((o) => o.payout_status === payoutFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((o) =>
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.order_code || '').toLowerCase().includes(q) ||
        (o.ticket_category_name || '').toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'oldest': result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
      case 'payout_high': result.sort((a, b) => Number(b.eo_payout_amount) - Number(a.eo_payout_amount)); break;
      case 'payout_low': result.sort((a, b) => Number(a.eo_payout_amount) - Number(b.eo_payout_amount)); break;
      default: result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return result;
  }, [selectedGroup, searchTerm, payoutFilter, sortBy]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return concertGroups;
    const q = searchTerm.toLowerCase();
    return concertGroups.filter((g) =>
      g.concert_name.toLowerCase().includes(q) ||
      (g.concert_artist || '').toLowerCase().includes(q)
    );
  }, [concertGroups, searchTerm]);

  const detailCounts = useMemo(() => {
    if (!selectedGroup) return { all: 0, belum_cair: 0, sudah_cair: 0 };
    return {
      all: selectedGroup.orders.length,
      belum_cair: selectedGroup.orders.filter((o) => o.payout_status === 'belum_cair').length,
      sudah_cair: selectedGroup.orders.filter((o) => o.payout_status === 'sudah_cair').length,
    };
  }, [selectedGroup]);

  function handleExportCSV() {
    if (!selectedGroup) return;
    const headers = ['Order Code', 'Customer', 'Email', 'Category', 'Qty', 'Unit Price', 'EO Payout', 'Status', 'Date'];
    const rows = filteredOrders.map((o) => [
      o.order_code || '', o.customer_name || '', o.customer_email || '', o.ticket_category_name || '',
      o.qty || 1, Number(o.unit_price) || 0, Number(o.eo_payout_amount) || 0, o.payout_status || '', o.created_at || '',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payout-${selectedGroup.concert_name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const payoutRate = Number(summary.total_pendapatan) > 0
    ? Math.round((Number(summary.sudah_cair) / Number(summary.total_pendapatan)) * 100)
    : 0;

  const orderModal = (
    <AnimatePresence>
      {selectedOrder && (
        <OrderDetailModal
          key={selectedOrder.id}
          order={selectedOrder}
          onClose={closeOrder}
          onCopyCode={handleCopyCode}
          copiedCode={copiedCode}
        />
      )}
    </AnimatePresence>
  );

  /* ============ DETAIL VIEW ============ */
  if (selectedGroup) {
    const detailTotalPayout = filteredOrders.reduce((s, o) => s + (Number(o.eo_payout_amount) || 0), 0);
    const detailTotalQty = filteredOrders.reduce((s, o) => s + (Number(o.qty) || 0), 0);
    const concertQty = selectedGroup.orders.reduce((s, o) => s + (Number(o.qty) || 0), 0);
    const progressPct = selectedGroup.total_payout > 0
      ? Math.round((selectedGroup.total_done / selectedGroup.total_payout) * 100)
      : 0;
    const isFiltered = payoutFilter !== 'all' || !!searchTerm;

    return (
      <Shell>
        <button
          onClick={() => {
            setSelectedConcertId(null);
            setSearchTerm('');
            setPayoutFilter('all');
            setSortBy('newest');
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-5 text-sm rounded-full bg-white text-amber-800 hover:text-amber-950 hover:bg-amber-50 transition-colors ${focusRing}`}
        >
          <Icon name="chevronLeft" className="w-3.5 h-3.5" />
          All concerts
        </button>

        {/* Concert header */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-amber-950 text-amber-50 rounded-2xl p-5 lg:p-6 mb-5 drop-shadow-[0_10px_18px_rgba(69,26,3,0.18)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-900 ring-2 ring-amber-400/70 ring-offset-2 ring-offset-amber-950 shrink-0">
              {selectedGroup.concert_poster ? (
                <img src={selectedGroup.concert_poster} alt={`${selectedGroup.concert_name} poster`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-300/80">
                  <Icon name="ticket" className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="f-display text-2xl font-semibold leading-tight break-words">{selectedGroup.concert_name}</h1>
              {selectedGroup.concert_artist && <p className="text-sm text-amber-200/70 mt-0.5">{selectedGroup.concert_artist}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-dashed border-amber-800">
            <div className="min-w-0">
              <p className="text-sm text-amber-200/70">Your revenue</p>
              <p className="f-display text-lg sm:text-2xl font-bold text-amber-300 tabular-nums leading-tight truncate">
                {formatRupiah(selectedGroup.total_payout)}
              </p>
            </div>
            <div>
              <p className="text-sm text-amber-200/70">Orders</p>
              <p className="f-display text-lg sm:text-2xl font-semibold tabular-nums leading-tight">{selectedGroup.orders.length}</p>
            </div>
            <div>
              <p className="text-sm text-amber-200/70">Tickets</p>
              <p className="f-display text-lg sm:text-2xl font-semibold tabular-nums leading-tight">{concertQty}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5 text-sm">
              <span className="text-amber-200/70">Paid out</span>
              <span className="font-semibold tabular-nums">{progressPct}%</span>
            </div>
            <div className="h-2 bg-amber-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-emerald-400 rounded-full"
              />
            </div>
          </div>
        </motion.section>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-3 mb-4 space-y-3">
          <div className="relative">
            <Icon name="search" className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search orders"
              placeholder="Search by customer, order code or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip label="All" active={payoutFilter === 'all'} onClick={() => setPayoutFilter('all')} count={detailCounts.all} />
            <FilterChip label="Not paid out" active={payoutFilter === 'belum_cair'} onClick={() => setPayoutFilter('belum_cair')} count={detailCounts.belum_cair} />
            <FilterChip label="Paid out" active={payoutFilter === 'sudah_cair'} onClick={() => setPayoutFilter('sudah_cair')} count={detailCounts.sudah_cair} />

            <div className="ml-auto flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort orders"
                className={`px-3.5 py-1.5 bg-amber-50 rounded-full text-sm text-amber-800 hover:text-amber-950 focus:outline-none cursor-pointer ${focusRing}`}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="payout_high">Highest payout</option>
                <option value="payout_low">Lowest payout</option>
              </select>
              <button
                onClick={handleExportCSV}
                aria-label="Export CSV"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 rounded-full text-sm text-amber-800 hover:text-amber-950 hover:bg-amber-100 transition-colors ${focusRing}`}
              >
                <Icon name="download" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary line */}
        <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3 mb-4 border border-dashed border-amber-400/60 bg-amber-100/60 rounded-xl text-sm text-amber-900">
          <p>
            Showing <strong className="font-semibold tabular-nums">{filteredOrders.length}</strong>
            {isFiltered && <> of <strong className="font-semibold tabular-nums">{selectedGroup.orders.length}</strong></>}{' '}
            {filteredOrders.length === 1 ? 'order' : 'orders'}
            {detailTotalQty > 0 && <>, <strong className="font-semibold tabular-nums">{detailTotalQty}</strong> tickets</>}
          </p>
          <p>
            Payout total{' '}
            <strong className="f-display font-semibold text-amber-950 tabular-nums">{formatRupiah(detailTotalPayout)}</strong>
          </p>
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="ticket"
            title={isFiltered ? 'No orders match' : 'No orders yet'}
            text={isFiltered ? 'Try another filter or search keyword.' : 'Orders show up here once customers have paid.'}
            actionLabel={isFiltered ? 'Clear filters' : undefined}
            onAction={() => { setSearchTerm(''); setPayoutFilter('all'); }}
          />
        ) : (
          <div className="space-y-2.5">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => setSelectedOrder(order)}
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              />
            ))}
          </div>
        )}

        {orderModal}
      </Shell>
    );
  }

  /* ============ LIST VIEW ============ */
  return (
    <Shell>
      {/* Header */}
      <header className="mb-6">
        <h1 className="f-display text-3xl font-bold text-amber-950 leading-tight">Revenue and payouts</h1>
        <p className="text-sm text-amber-800/80 mt-1">See what each concert has earned and what admin has already paid out.</p>
      </header>

      {/* Payout notification */}
      <AnimatePresence>
        {unseenCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="status"
            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 mb-6"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Icon name="wallet" className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-900">
                  {unseenCount} {unseenCount === 1 ? 'order was' : 'orders were'} just paid out
                </p>
                <p className="text-sm text-emerald-800/80">Admin has transferred the funds to your account.</p>
              </div>
            </div>
            <button
              onClick={handleMarkSeen}
              disabled={markingSeen}
              className={`px-3.5 py-1.5 text-sm font-medium text-emerald-800 bg-white hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 ${focusRing}`}
            >
              {markingSeen ? 'Updating…' : 'Mark as read'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero pass */}
      <motion.section
        aria-label="Revenue summary"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mb-6 drop-shadow-[0_10px_18px_rgba(69,26,3,0.18)]"
      >
        <div className="hero-pass rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_var(--stub-w)]">
          <div className="bg-amber-950 text-amber-50 p-6 md:p-8 flex flex-col min-w-0">
            <p className="text-sm text-amber-300">Total revenue</p>
            <p
              className="f-display font-bold text-amber-300 mt-2 leading-none tabular-nums"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
            >
              <NumberTicker value={Number(summary.total_pendapatan) || 0} prefix="Rp " duration={1500} />
            </p>
            <p className="text-sm text-amber-200/70 mt-3">
              <NumberTicker value={Number(summary.total_tiket_terjual) || 0} /> tickets sold so far
            </p>

            <div className="mt-auto pt-7">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-amber-200/70">Paid out so far</span>
                <span className="font-semibold tabular-nums">{payoutRate}%</span>
              </div>
              <div className="h-2 bg-amber-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${payoutRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-emerald-400 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-100 border-t sm:border-t-0 sm:border-l border-dashed border-amber-400/70 px-5 py-3 sm:py-4 flex flex-col justify-center divide-y divide-dashed divide-amber-300">
            <StatRow icon="clock" label="Not paid out" tone="text-yellow-600" value={formatRupiah(Number(summary.belum_cair) || 0)} />
            <StatRow icon="check" label="Paid out" tone="text-emerald-600" value={formatRupiah(Number(summary.sudah_cair) || 0)} />
            <StatRow icon="ticket" label="Tickets sold" tone="text-amber-700" value={(Number(summary.total_tiket_terjual) || 0).toLocaleString('id-ID')} />
          </div>
        </div>
      </motion.section>

      {/* Info note */}
      <div className="flex items-start gap-3 px-4 py-3 mb-6 rounded-2xl border border-dashed border-amber-400/60 bg-amber-100/60">
        <Icon name="info" className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900">
          Admin pays out funds manually to your account. Amounts shown are your share after the platform service fee.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Icon name="search" className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          aria-label="Search concerts"
          placeholder="Search by concert or artist"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
        />
      </div>

      {/* Concert list */}
      {loading ? (
        <div className="space-y-4 animate-pulse" role="status" aria-label="Loading payouts">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-4">
              <div className="w-24 h-24 bg-amber-100 rounded-xl" />
              <div className="flex-1 space-y-2.5 pt-1">
                <div className="h-5 w-44 bg-amber-100 rounded" />
                <div className="h-3.5 w-32 bg-amber-100 rounded" />
                <div className="h-3.5 w-48 bg-amber-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <EmptyState
          icon="wallet"
          title={searchTerm ? 'No concerts match' : 'No paid orders yet'}
          text={searchTerm ? 'Try a different keyword.' : 'Revenue will appear here once tickets are sold and paid for.'}
          actionLabel={searchTerm ? 'Clear search' : undefined}
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <ConcertCard
              key={group.concert_id}
              group={group}
              onClick={() => {
                setSelectedConcertId(group.concert_id);
                setSearchTerm('');
                setPayoutFilter('all');
                setSortBy('newest');
              }}
            />
          ))}
        </div>
      )}
    </Shell>
  );
}