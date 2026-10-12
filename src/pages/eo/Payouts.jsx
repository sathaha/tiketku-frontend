import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

/* ============ ICONS ============ */
function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
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
    music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    chart: 'M3 3v18h18M18 17V9M13 17V5M8 17v-3',
    trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    fire: 'M12 23c-4.97 0-8-3.582-8-8 0-2.5 1.5-5 3-6.5C8 7 9 5 9.5 3c.5-2 1-2.5 2-2.5.5 0 1 .5 1 1.5V3c0 1.5 1 3 2 4.5 1.5 2 2.5 3.5 2.5 6 0 4.418-2.03 9.5-5 9.5z',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  };
  const path = paths[name];
  if (!path) return null;
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60';

/* ============ STATUS BADGE (matching dashboard) ============ */
const statusBadge = {
  belum_cair: { label: 'Not paid out', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200/60', bg: 'bg-yellow-50' },
  sudah_cair: { label: 'Paid out', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200/60', bg: 'bg-emerald-50' },
  lunas: { label: 'Paid', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200/60', bg: 'bg-emerald-50' },
  pending: { label: 'Pending', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200/60', bg: 'bg-yellow-50' },
};

function StatusBadge({ status }) {
  const meta = statusBadge[status] || { label: status || '-', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200/60', bg: 'bg-amber-50' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${meta.bg} border ${meta.border} font-serif text-[10px] font-medium ${meta.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/* ============ TICKET NOTCH (from dashboard) ============ */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const ticketCss = `
  .ticket-notch { -webkit-mask: ${notch}; mask: ${notch}; }
  @media (min-width: 640px) {
    .ticket-notch-sm { -webkit-mask: ${notch}; mask: ${notch}; }
  }
`;

/* ============ NUMBER TICKER ============ */
function NumberTicker({ value, format = 'id-ID', prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const from = prevValueRef.current;
    const to = Number(value) || 0;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
      else prevValueRef.current = to;
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString(format)}{suffix}
    </span>
  );
}

/* ============ FILTER CHIP (amber theme) ============ */
function FilterChip({ label, active, onClick, count, color = 'amber' }) {
  const colorMap = {
    amber: 'bg-amber-800 text-amber-50 shadow-sm shadow-amber-800/30',
    yellow: 'bg-yellow-600 text-white shadow-sm shadow-yellow-600/30',
    blue: 'bg-blue-600 text-white shadow-sm shadow-blue-600/30',
  };
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full font-serif text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${focusRing} ${
        active
          ? colorMap[color]
          : 'bg-white text-amber-800/80 hover:text-amber-950 border border-amber-200/60 hover:bg-amber-50'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
          active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ============ STAT MINI (from dashboard) ============ */
function StatMini({ icon, label, value, color = 'text-amber-700', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="flex items-center justify-between gap-3 py-3 px-3 rounded-lg"
    >
      <span className="font-serif text-sm text-amber-800/80 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-md bg-amber-100 border border-amber-200/60 flex items-center justify-center">
          <Icon name={icon} className={`w-4 h-4 ${color}`} />
        </span>
        {label}
      </span>
      <span className="font-serif text-sm font-semibold text-amber-950 font-mono tabular-nums">
        {value}
      </span>
    </motion.div>
  );
}

/* ============ ORDER CARD (paper theme) ============ */
function OrderCard({ order, index, onClick, onCopyCode, copiedCode }) {
  const isCopied = copiedCode === order.order_code;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      whileHover={{ y: -2 }}
      className={`group w-full text-left bg-white border border-amber-200/60 hover:border-amber-300 rounded-2xl transition-all overflow-hidden ${focusRing}`}
    >
      <div className="flex items-stretch">
        <div className="w-14 shrink-0 flex items-center justify-center border-r border-dashed border-amber-200/60">
          <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center">
            <span className="font-serif text-sm font-semibold text-amber-700">
              {order.customer_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-serif font-semibold text-amber-950 text-sm truncate group-hover:text-amber-700 transition-colors">
                {order.customer_name || 'Customer'}
              </h3>
              <p className="font-serif text-xs text-amber-800/70 truncate mt-0.5">
                {order.ticket_category_name || 'Ticket category'} × {order.qty || 1}
              </p>
            </div>
            <StatusBadge status={order.payout_status} />
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-amber-700/70">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyCode(order.order_code);
              }}
              className="flex items-center gap-1 hover:text-amber-900 transition-colors"
              title="Copy order code"
            >
              {isCopied ? (
                <>
                  <Icon name="check" className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-serif">Copied</span>
                </>
              ) : (
                <>
                  {order.order_code || '-'}
                  <Icon name="copy" className="w-3 h-3 opacity-60" />
                </>
              )}
            </button>
            <span className="text-amber-300">•</span>
            <span className="flex items-center gap-1">
              <Icon name="calendar" className="w-3 h-3" />
              {formatDate(order.created_at)}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end justify-center px-4 border-l border-dashed border-amber-200/60 min-w-[130px]">
          <p className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70 mb-0.5">EO payout</p>
          <p className="font-serif text-base font-bold text-amber-800 font-mono tabular-nums">
            {formatRupiah(Number(order.eo_payout_amount) || 0)}
          </p>
        </div>

        <div className="shrink-0 flex items-center pr-3 text-amber-500 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all">
          <Icon name="chevronRight" className="w-4 h-4" />
        </div>
      </div>
    </motion.button>
  );
}

/* ============ CONCERT CARD (paper theme) ============ */
function ConcertCard({ group, onClick }) {
  const totalOrders = group.orders.length;
  const pendingCount = group.orders.filter((o) => o.payout_status === 'belum_cair').length;
  const doneCount = totalOrders - pendingCount;
  const totalQty = group.orders.reduce((sum, o) => sum + (Number(o.qty) || 0), 0);
  const payoutPct = group.total_payout > 0 ? Math.round((group.total_done / group.total_payout) * 100) : 0;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`group w-full text-left bg-white border border-amber-200/60 hover:border-amber-300 rounded-2xl overflow-hidden transition-colors ${focusRing}`}
    >
      <div className="flex items-stretch">
        <div className="w-24 sm:w-28 shrink-0 bg-amber-100 overflow-hidden border-r border-dashed border-amber-200/60">
          {group.concert_poster ? (
            <img src={group.concert_poster} alt={group.concert_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-500">
              <Icon name="ticket" className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-serif font-semibold text-amber-950 truncate group-hover:text-amber-700 transition-colors">
                {group.concert_name}
              </h3>
              {group.concert_artist && (
                <p className="font-serif text-xs text-amber-800/70 truncate mt-0.5">{group.concert_artist}</p>
              )}
            </div>
            <div className="shrink-0 text-amber-500 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all">
              <Icon name="chevronRight" className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-dashed border-amber-200/60">
            <div>
              <p className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">EO revenue</p>
              <p className="font-serif text-sm font-semibold text-amber-800 tabular-nums mt-0.5">
                {formatRupiah(group.total_payout)}
              </p>
            </div>
            <div>
              <p className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">Tickets sold</p>
              <p className="font-serif text-sm font-semibold text-amber-950 tabular-nums mt-0.5">{totalQty}</p>
            </div>
            <div>
              <p className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">Orders</p>
              <p className="font-serif text-sm font-semibold text-amber-950 tabular-nums mt-0.5">{totalOrders}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-dashed border-amber-200/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">Payout progress</span>
              <span className="font-serif text-[10px] text-amber-950 font-semibold tabular-nums">{payoutPct}%</span>
            </div>
            <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${payoutPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 font-serif text-[10px] font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200/60">
                <Icon name="clock" className="w-2.5 h-2.5" />
                {pendingCount} pending
              </span>
            )}
            {doneCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 font-serif text-[10px] font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                <Icon name="check" className="w-2.5 h-2.5" />
                {doneCount} paid
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ============ ORDER DETAIL MODAL (paper theme) ============ */
function OrderDetailModal({ order, onClose, onCopyCode, copiedCode }) {
  if (!order) return null;
  const isCopied = copiedCode === order.order_code;

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-amber-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white border border-amber-200/60 rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-5 border-b border-dashed border-amber-200/60 shrink-0">
              <div className="min-w-0">
                <p className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold">
                  Order Details
                </p>
                <h3 className="font-serif text-base font-semibold text-amber-950 truncate mt-0.5">
                  {order.concert_name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 -mr-1.5 -mt-1.5 rounded-lg text-amber-700/70 hover:text-amber-950 hover:bg-amber-50 transition-colors ${focusRing}`}
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200/60">
                <span className="font-serif text-xs text-amber-800/80">Payment Status</span>
                <StatusBadge status={order.status} />
              </div>

              <dl className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="receipt" className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">Order Code</dt>
                    <dd className="mt-0.5 flex items-center gap-2">
                      <span className="font-serif text-sm text-amber-950 font-mono break-all">{order.order_code || '-'}</span>
                      <button
                        type="button"
                        onClick={() => onCopyCode(order.order_code)}
                        className={`p-1 rounded-md text-amber-700/70 hover:text-amber-900 hover:bg-amber-100 transition-colors shrink-0 ${focusRing}`}
                        title="Copy"
                      >
                        {isCopied ? (
                          <Icon name="check" className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Icon name="copy" className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="user" className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">Customer</dt>
                    <dd className="font-serif text-sm text-amber-950 break-all">{order.customer_name || '-'}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="mail" className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">Email</dt>
                    <dd className="font-serif text-sm text-amber-950 break-all">{order.customer_email || '-'}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="phone" className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">Phone</dt>
                    <dd className="font-serif text-sm text-amber-950">{order.customer_phone || '-'}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="ticket" className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">Ticket Category</dt>
                    <dd className="font-serif text-sm text-amber-950">
                      {order.ticket_category_name || '-'} × {order.qty || 1}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="pt-4 border-t border-dashed border-amber-200/60">
                <p className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70 mb-3">Price Breakdown</p>
                <div className="space-y-2 font-serif text-sm">
                  <div className="flex justify-between text-amber-800/80">
                    <span>Ticket subtotal</span>
                    <span className="tabular-nums text-amber-950">
                      {formatRupiah((Number(order.unit_price) || 0) * (Number(order.qty) || 1))}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-800/80">
                    <span>Platform service fee</span>
                    <span className="tabular-nums text-amber-700/70">
                      −{formatRupiah(Number(order.platform_fee_amount) || 0)}
                    </span>
                  </div>
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-amber-800/80">
                      <span>Promo discount</span>
                      <span className="tabular-nums text-emerald-600">
                        −{formatRupiah(Number(order.discount_amount) || 0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 mt-2 border-t border-dashed border-amber-200/60 text-amber-950 font-semibold">
                    <span>EO share</span>
                    <span className="tabular-nums text-amber-800">
                      {formatRupiah(Number(order.eo_payout_amount) || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-amber-200/60">
                <p className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70 mb-3">Payout Status</p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200/60">
                  <StatusBadge status={order.payout_status} />
                  {order.payout_at && (
                    <span className="font-serif text-xs text-amber-800/80">{formatDate(order.payout_at)}</span>
                  )}
                </div>
                {order.payout_note && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-50/60 border border-dashed border-amber-200/60">
                    <p className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70 mb-1">Admin Note</p>
                    <p className="font-serif text-xs text-amber-800">{order.payout_note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-dashed border-amber-200/60 shrink-0">
              <button
                onClick={onClose}
                className={`w-full py-2.5 font-serif text-sm font-medium text-amber-50 bg-amber-800 hover:bg-amber-700 rounded-xl transition-colors ${focusRing}`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

  const totalPending = orders.filter((o) => o.payout_status === 'belum_cair').length;
  const totalDone = orders.filter((o) => o.payout_status === 'sudah_cair').length;

  /* ============ DETAIL VIEW ============ */
  if (selectedGroup) {
    const detailTotalPayout = filteredOrders.reduce((s, o) => s + (Number(o.eo_payout_amount) || 0), 0);
    const detailTotalQty = filteredOrders.reduce((s, o) => s + (Number(o.qty) || 0), 0);
    const progressPct = selectedGroup.total_payout > 0
      ? Math.round((selectedGroup.total_done / selectedGroup.total_payout) * 100)
      : 0;

    return (
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-[#f5ede4]">
          <div className="max-w-4xl mx-auto px-4 py-8 relative">
            <style>{ticketCss}</style>

            {/* Back */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                setSelectedConcertId(null);
                setSearchTerm('');
                setPayoutFilter('all');
                setSortBy('newest');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 mb-5 font-serif text-xs rounded-full bg-white border border-amber-200/60 text-amber-800/80 hover:text-amber-950 hover:bg-amber-50 transition-colors ${focusRing}`}
            >
              <Icon name="chevronLeft" className="w-3.5 h-3.5" />
              Back to concert list
            </motion.button>

            {/* Concert header card — ticket style */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative mb-5"
            >
              <div className="relative overflow-hidden bg-white border border-amber-200/60 rounded-2xl">
                {selectedGroup.concert_poster && (
                  <div className="absolute inset-0 opacity-10">
                    <img src={selectedGroup.concert_poster} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70" />
                  </div>
                )}

                <div className="relative p-5 lg:p-6 flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-100 border border-amber-200/60 shrink-0 shadow-sm">
                    {selectedGroup.concert_poster ? (
                      <img src={selectedGroup.concert_poster} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="ticket" className="w-8 h-8 text-amber-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold mb-1">
                      Concert Details
                    </p>
                    <h1 className="font-serif font-bold text-amber-950 text-xl lg:text-2xl leading-tight mb-1 truncate">
                      {selectedGroup.concert_name}
                    </h1>
                    {selectedGroup.concert_artist && (
                      <p className="font-serif text-sm text-amber-800/80 truncate">{selectedGroup.concert_artist}</p>
                    )}

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 font-serif text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="text-amber-700/70">Payout:</span>
                        <span className="text-amber-800 font-semibold tabular-nums">
                          {formatRupiah(selectedGroup.total_payout)}
                        </span>
                      </span>
                      <span className="text-amber-300">•</span>
                      <span className="text-amber-800/80">
                        <span className="text-amber-950 font-medium">{selectedGroup.orders.length}</span> order{selectedGroup.orders.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-amber-300">•</span>
                      <span className="text-amber-800/80">
                        <span className="text-amber-950 font-medium">
                          {selectedGroup.orders.reduce((s, o) => s + (Number(o.qty) || 0), 0)}
                        </span> tickets
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative px-5 lg:px-6 pb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-[10px] uppercase tracking-wider text-amber-700/70">Payout progress</span>
                    <span className="font-serif text-xs text-amber-950 font-semibold tabular-nums">{progressPct}%</span>
                  </div>
                  <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-amber-200/60 rounded-2xl p-3 mb-4 space-y-3"
            >
              <div className="relative">
                <Icon name="search" className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, order code, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-700/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all ${focusRing}`}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <FilterChip label="All" active={payoutFilter === 'all'} onClick={() => setPayoutFilter('all')} count={detailCounts.all} color="amber" />
                <FilterChip label="Not paid" active={payoutFilter === 'belum_cair'} onClick={() => setPayoutFilter('belum_cair')} count={detailCounts.belum_cair} color="yellow" />
                <FilterChip label="Paid" active={payoutFilter === 'sudah_cair'} onClick={() => setPayoutFilter('sudah_cair')} count={detailCounts.sudah_cair} color="blue" />

                <div className="ml-auto flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`appearance-none px-3.5 py-1.5 bg-white border border-amber-200/60 rounded-full font-serif text-xs text-amber-800/80 hover:text-amber-950 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer ${focusRing}`}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="payout_high">Highest payout</option>
                    <option value="payout_low">Lowest payout</option>
                  </select>

                  <button
                    onClick={handleExportCSV}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200/60 rounded-full font-serif text-xs text-amber-800/80 hover:text-amber-950 hover:bg-amber-50 transition-colors ${focusRing}`}
                  >
                    <Icon name="download" className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Summary bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center justify-between px-4 py-3 mb-4 bg-amber-50/60 border border-dashed border-amber-300/60 rounded-xl"
            >
              <div className="font-serif text-xs text-amber-800/80">
                Showing <span className="text-amber-950 font-semibold tabular-nums">{filteredOrders.length}</span>
                {(payoutFilter !== 'all' || searchTerm) && (
                  <> of <span className="text-amber-950 font-semibold tabular-nums">{selectedGroup.orders.length}</span></>
                )} order{filteredOrders.length !== 1 ? 's' : ''}
                {detailTotalQty > 0 && (
                  <> · <span className="text-amber-950 font-semibold tabular-nums">{detailTotalQty}</span> tickets</>
                )}
              </div>
              <div className="font-serif text-xs text-amber-800/80">
                Total payout:{' '}
                <span className="text-amber-800 font-bold tabular-nums">
                  {formatRupiah(detailTotalPayout)}
                </span>
              </div>
            </motion.div>

            {/* Orders list */}
            <AnimatePresence mode="wait">
              {filteredOrders.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                    <Icon name="ticket" className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="font-serif font-semibold text-amber-950 mb-1">
                    {searchTerm || payoutFilter !== 'all' ? 'No matching orders' : 'No orders yet'}
                  </h3>
                  <p className="font-serif text-sm text-amber-800/80 max-w-sm mx-auto">
                    {searchTerm || payoutFilter !== 'all'
                      ? 'Try adjusting the filter or search keyword.'
                      : 'Customer orders will appear here once paid.'}
                  </p>
                  {(searchTerm || payoutFilter !== 'all') && (
                    <button
                      onClick={() => { setSearchTerm(''); setPayoutFilter('all'); }}
                      className={`mt-4 font-serif text-sm text-amber-700 hover:text-amber-900 underline underline-offset-2 ${focusRing}`}
                    >
                      Reset filters
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2.5"
                >
                  {filteredOrders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      index={index}
                      onClick={() => setSelectedOrder(order)}
                      onCopyCode={handleCopyCode}
                      copiedCode={copiedCode}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <OrderDetailModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onCopyCode={handleCopyCode}
              copiedCode={copiedCode}
            />
          </div>
        </div>
      </MotionConfig>
    );
  }

  /* ============ LIST VIEW ============ */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f5ede4]">
        <div className="max-w-4xl mx-auto px-4 py-8 relative">
          <style>{ticketCss}</style>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="font-serif text-xs uppercase tracking-[0.2em] text-amber-700/70 font-semibold mb-2">
              EO Summary
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-950 leading-tight">
              Revenue & Payouts
            </h1>
            <p className="font-serif text-amber-800/80 text-sm mt-1">
              Track your concert revenue and payout status.
            </p>
          </motion.div>

          {/* Notification banner */}
          <AnimatePresence>
            {unseenCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/50 border border-dashed border-amber-300/60 mb-6"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
                    <Icon name="wallet" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-sm font-semibold text-amber-950">
                      {unseenCount} order{unseenCount !== 1 ? 's' : ''} just got paid out
                    </p>
                    <p className="font-serif text-xs text-amber-800/80 mt-0.5">
                      The funds have been transferred by admin to your account.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleMarkSeen}
                  disabled={markingSeen}
                  className={`px-3 py-1.5 font-serif text-xs font-medium text-amber-800 hover:bg-amber-100 border border-amber-300/60 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 ${focusRing}`}
                >
                  {markingSeen ? 'Processing...' : 'Mark as read'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary — ticket hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mb-6"
          >
            <div className="ticket-notch-sm bg-white border border-amber-200/60 rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_var(--stub)]" style={{ '--stub': '18rem' }}>
              {/* Main stub */}
              <div className="p-6 md:p-8 flex flex-col min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-serif text-xs uppercase tracking-[0.2em] text-amber-700/70 font-semibold">
                    Total Revenue
                  </p>
                  <span className="hidden sm:flex items-center gap-1.5 font-serif text-[10px] uppercase tracking-[0.15em] text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>

                <p className="font-serif font-bold text-amber-950 mt-3 leading-none tabular-nums" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                  <NumberTicker value={Number(summary.total_pendapatan) || 0} prefix="Rp " format="id-ID" duration={1500} />
                </p>

                <p className="font-serif text-sm text-amber-800/80 mt-3">
                  <NumberTicker value={Number(summary.total_tiket_terjual) || 0} format="id-ID" /> tickets sold so far
                </p>

                <div className="mt-auto pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-xs text-amber-800/80">Payout progress</span>
                    <span className="font-serif text-xs text-amber-950 font-semibold tabular-nums">{payoutRate}%</span>
                  </div>
                  <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${payoutRate}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Side stub */}
              <div className="order-first sm:order-last border-b sm:border-b-0 sm:border-l border-dashed border-amber-200/60 p-4 md:p-6 flex flex-col justify-center gap-1">
                <StatMini
                  icon="clock"
                  label="Not paid out"
                  color="text-yellow-700"
                  value={formatRupiah(Number(summary.belum_cair) || 0)}
                  delay={0.1}
                />
                <div className="border-t border-dashed border-amber-200/60 my-1" />
                <StatMini
                  icon="check"
                  label="Paid out"
                  color="text-blue-700"
                  value={formatRupiah(Number(summary.sudah_cair) || 0)}
                  delay={0.2}
                />
                <div className="border-t border-dashed border-amber-200/60 my-1" />
                <StatMini
                  icon="ticket"
                  label="Tickets sold"
                  color="text-amber-700"
                  value={(Number(summary.total_tiket_terjual) || 0).toLocaleString('id-ID')}
                  delay={0.3}
                />
              </div>
            </div>
          </motion.div>

          {/* Info note */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-start gap-3 p-4 mb-6 rounded-2xl border border-dashed border-amber-300/60 bg-amber-50/50"
          >
            <Icon name="info" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-serif text-sm text-amber-800">
              Funds are paid out manually by admin to your account. The amount shown is your share
              after deducting the platform service fee.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-5"
          >
            <Icon name="search" className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search concert..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-700/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all ${focusRing}`}
            />
          </motion.div>

          {/* Concert list */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white border border-amber-200/60 rounded-2xl p-5">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-amber-100 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-40 bg-amber-100 rounded" />
                        <div className="h-3 w-32 bg-amber-100 rounded" />
                        <div className="h-3 w-48 bg-amber-100 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : filteredGroups.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                  <Icon name="wallet" className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-serif font-semibold text-amber-950 mb-1">
                  {searchTerm ? 'No matching concerts' : 'No paid orders yet'}
                </h3>
                <p className="font-serif text-sm text-amber-800/80 max-w-sm mx-auto">
                  {searchTerm
                    ? 'Try a different keyword or reset the search.'
                    : 'Revenue will appear here once tickets are sold and paid.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`mt-4 font-serif text-sm text-amber-700 hover:text-amber-900 underline underline-offset-2 ${focusRing}`}
                  >
                    Reset search
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="groups"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}