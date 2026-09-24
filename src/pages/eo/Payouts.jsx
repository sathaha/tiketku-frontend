import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState, StatusBadge, formatRupiah, formatDate } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
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
  const path = paths[name];
  if (!path) return null;
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function TicketNotch({ position }) {
  const isTop = position === 'top';
  return (
    <div
      className={`absolute w-5 h-5 rounded-full bg-[#0a0a0a] left-1/2 -translate-x-1/2
        ${isTop ? '-top-2.5' : '-bottom-2.5'}
        md:top-1/2 md:-translate-y-1/2 md:translate-x-0
        ${isTop ? 'md:-left-2.5' : 'md:-right-2.5 md:left-auto'}`}
    />
  );
}

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

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = to;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString(format)}{suffix}
    </span>
  );
}

// ===== FILTER CHIP =====
function FilterChip({ label, active, onClick, count, color = 'flame' }) {
  const colorMap = {
    flame: 'bg-flame-500 text-white shadow-sm shadow-flame-500/30',
    yellow: 'bg-yellow-500 text-white shadow-sm shadow-yellow-500/30',
    blue: 'bg-blue-500 text-white shadow-sm shadow-blue-500/30',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
        active
          ? colorMap[color]
          : 'bg-ink-800 text-ink-400 hover:text-white hover:bg-ink-700 border border-ink-700/60'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
          active ? 'bg-white/20 text-white' : 'bg-ink-700 text-ink-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ===== ORDER CARD (detail view) =====
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
      className="group w-full text-left bg-ink-800/40 border border-ink-700/60 hover:border-flame-500/30 hover:bg-ink-800/60 rounded-2xl transition-all overflow-hidden"
    >
      <div className="flex items-stretch">
        {/* Avatar */}
        <div className="w-14 shrink-0 flex items-center justify-center border-r border-ink-700/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-flame-500/30 to-orange-500/20 border border-flame-500/30 flex items-center justify-center">
            <span className="text-sm font-semibold text-flame-400">
              {order.customer_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-sm truncate group-hover:text-flame-400 transition-colors">
                {order.customer_name || 'Customer'}
              </h3>
              <p className="text-xs text-ink-400 truncate mt-0.5">
                {order.ticket_category_name || 'Kategori tiket'} × {order.qty || 1}
              </p>
            </div>
            <StatusBadge status={order.payout_status} />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-ink-500">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyCode(order.order_code);
              }}
              className="flex items-center gap-1 hover:text-flame-400 transition-colors"
              title="Copy order code"
            >
              {isCopied ? (
                <>
                  <Icon name="check" className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  {order.order_code || '-'}
                  <Icon name="copy" className="w-3 h-3 opacity-60" />
                </>
              )}
            </button>
            <span className="text-ink-700">•</span>
            <span className="flex items-center gap-1">
              <Icon name="calendar" className="w-3 h-3" />
              {formatDate(order.created_at)}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className="shrink-0 flex flex-col items-end justify-center px-4 border-l border-ink-700/50 min-w-[130px]">
          <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-0.5">Payout EO</p>
          <p className="text-base font-bold text-flame-400 font-mono tabular-nums">
            {formatRupiah(Number(order.eo_payout_amount) || 0)}
          </p>
        </div>

        {/* Chevron */}
        <div className="shrink-0 flex items-center pr-3 text-ink-500 group-hover:text-flame-400 group-hover:translate-x-0.5 transition-all">
          <Icon name="chevronRight" className="w-4 h-4" />
        </div>
      </div>
    </motion.button>
  );
}

// ===== CONCERT CARD (list view) =====
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
      className="group w-full text-left card overflow-hidden hover:border-flame-500/30 transition-colors"
    >
      <div className="flex items-stretch">
        <div className="w-24 sm:w-28 shrink-0 bg-ink-800/60 overflow-hidden">
          {group.concert_poster ? (
            <img src={group.concert_poster} alt={group.concert_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-600">
              <Icon name="ticket" className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate group-hover:text-flame-400 transition-colors">
                {group.concert_name}
              </h3>
              {group.concert_artist && (
                <p className="text-xs text-ink-400 truncate mt-0.5">{group.concert_artist}</p>
              )}
            </div>
            <div className="shrink-0 text-ink-400 group-hover:text-flame-400 group-hover:translate-x-0.5 transition-all">
              <Icon name="chevronRight" className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-ink-700/60">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-ink-500">Pendapatan EO</p>
              <p className="text-sm font-semibold text-flame-400 tabular-nums mt-0.5">
                {formatRupiah(group.total_payout)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-ink-500">Tiket terjual</p>
              <p className="text-sm font-semibold text-white tabular-nums mt-0.5">{totalQty}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-ink-500">Order</p>
              <p className="text-sm font-semibold text-white tabular-nums mt-0.5">{totalOrders}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-ink-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-ink-500">Progress pencairan</span>
              <span className="text-[10px] text-white font-semibold">{payoutPct}%</span>
            </div>
            <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${payoutPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Icon name="clock" className="w-2.5 h-2.5" />
                {pendingCount} pending
              </span>
            )}
            {doneCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Icon name="check" className="w-2.5 h-2.5" />
                {doneCount} cair
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ===== ORDER DETAIL MODAL =====
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-ink-900 border border-ink-700 rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-5 border-b border-ink-700 shrink-0">
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-flame-400/80">
                  Detail Order
                </p>
                <h3 className="text-base font-semibold text-white truncate mt-0.5">
                  {order.concert_name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 -mt-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-ink-800/60 border border-ink-700/60">
                <span className="text-xs text-ink-400">Status Pembayaran</span>
                <StatusBadge status={order.status} />
              </div>

              <dl className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="receipt" className="w-4 h-4 text-flame-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-[10px] uppercase tracking-wider text-ink-500">Order Code</dt>
                    <dd className="mt-0.5 flex items-center gap-2">
                      <span className="text-sm text-white font-mono break-all">{order.order_code || '-'}</span>
                      <button
                        type="button"
                        onClick={() => onCopyCode(order.order_code)}
                        className="p-1 rounded-md text-ink-400 hover:text-flame-400 hover:bg-flame-500/10 transition-colors shrink-0"
                        title="Copy"
                      >
                        {isCopied ? (
                          <Icon name="check" className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Icon name="copy" className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="user" className="w-4 h-4 text-flame-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-[10px] uppercase tracking-wider text-ink-500">Customer</dt>
                    <dd className="text-sm text-white break-all">{order.customer_name || '-'}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="mail" className="w-4 h-4 text-flame-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-[10px] uppercase tracking-wider text-ink-500">Email</dt>
                    <dd className="text-sm text-white break-all">{order.customer_email || '-'}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="phone" className="w-4 h-4 text-flame-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-[10px] uppercase tracking-wider text-ink-500">No. HP</dt>
                    <dd className="text-sm text-white">{order.customer_phone || '-'}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Icon name="ticket" className="w-4 h-4 text-flame-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-[10px] uppercase tracking-wider text-ink-500">Kategori Tiket</dt>
                    <dd className="text-sm text-white">
                      {order.ticket_category_name || '-'} × {order.qty || 1}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="pt-4 border-t border-ink-700/60">
                <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-3">Rincian Harga</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-ink-300">
                    <span>Subtotal tiket</span>
                    <span className="tabular-nums text-white">
                      {formatRupiah((Number(order.unit_price) || 0) * (Number(order.qty) || 1))}
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-300">
                    <span>Biaya layanan platform</span>
                    <span className="tabular-nums text-ink-400">
                      −{formatRupiah(Number(order.platform_fee_amount) || 0)}
                    </span>
                  </div>
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-ink-300">
                      <span>Diskon promo</span>
                      <span className="tabular-nums text-emerald-400">
                        −{formatRupiah(Number(order.discount_amount) || 0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 mt-2 border-t border-dashed border-ink-700 text-white font-semibold">
                    <span>Bagian EO</span>
                    <span className="tabular-nums text-flame-400">
                      {formatRupiah(Number(order.eo_payout_amount) || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-ink-700/60">
                <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-3">Status Pencairan</p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-ink-800/60 border border-ink-700/60">
                  <StatusBadge status={order.payout_status} />
                  {order.payout_at && (
                    <span className="text-xs text-ink-400">{formatDate(order.payout_at)}</span>
                  )}
                </div>
                {order.payout_note && (
                  <div className="mt-2 p-3 rounded-xl bg-ink-800/40 border border-ink-700/60">
                    <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">Catatan Admin</p>
                    <p className="text-xs text-ink-300">{order.payout_note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-ink-700 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm font-medium text-ink-300 bg-ink-800 hover:bg-ink-700 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          concert_name: order.concert_name || 'Konser',
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
    if (payoutFilter !== 'all') {
      result = result.filter((o) => o.payout_status === payoutFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((o) =>
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.order_code || '').toLowerCase().includes(q) ||
        (o.ticket_category_name || '').toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'payout_high':
        result.sort((a, b) => Number(b.eo_payout_amount) - Number(a.eo_payout_amount));
        break;
      case 'payout_low':
        result.sort((a, b) => Number(a.eo_payout_amount) - Number(b.eo_payout_amount));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    const headers = ['Order Code', 'Customer', 'Email', 'Kategori', 'Qty', 'Unit Price', 'Payout EO', 'Status', 'Tanggal'];
    const rows = filteredOrders.map((o) => [
      o.order_code || '',
      o.customer_name || '',
      o.customer_email || '',
      o.ticket_category_name || '',
      o.qty || 1,
      Number(o.unit_price) || 0,
      Number(o.eo_payout_amount) || 0,
      o.payout_status || '',
      o.created_at || '',
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

  if (loading && !summary) return <Loading />;

  const payoutRate = Number(summary.total_pendapatan) > 0
    ? Math.round((Number(summary.sudah_cair) / Number(summary.total_pendapatan)) * 100)
    : 0;

  const totalPending = orders.filter((o) => o.payout_status === 'belum_cair').length;
  const totalDone = orders.filter((o) => o.payout_status === 'sudah_cair').length;

  // ============ DETAIL VIEW ============
  if (selectedGroup) {
    const detailTotalPayout = filteredOrders.reduce((s, o) => s + (Number(o.eo_payout_amount) || 0), 0);
    const detailTotalQty = filteredOrders.reduce((s, o) => s + (Number(o.qty) || 0), 0);

    return (
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Back */}
        <button
          onClick={() => {
            setSelectedConcertId(null);
            setSearchTerm('');
            setPayoutFilter('all');
            setSortBy('newest');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-5 text-xs rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white transition-colors"
        >
          <Icon name="chevronLeft" className="w-3.5 h-3.5" />
          Kembali ke daftar konser
        </button>

        {/* Concert header card */}
        <div className="relative overflow-hidden bg-ink-900 border border-ink-700 rounded-3xl mb-5">
          {selectedGroup.concert_poster && (
            <div className="absolute inset-0 opacity-15">
              <img src={selectedGroup.concert_poster} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-900/70" />
            </div>
          )}

          <div className="relative p-5 lg:p-6 flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-ink-800 border border-ink-700 shrink-0 shadow-lg">
              {selectedGroup.concert_poster ? (
                <img src={selectedGroup.concert_poster} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="ticket" className="w-8 h-8 text-ink-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-flame-400/80 mb-1">
                Detail Konser
              </p>
              <h1 className="font-bold text-white text-xl lg:text-2xl leading-tight mb-1 truncate">
                {selectedGroup.concert_name}
              </h1>
              {selectedGroup.concert_artist && (
                <p className="text-sm text-ink-400 truncate">{selectedGroup.concert_artist}</p>
              )}

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="text-ink-500">Payout:</span>
                  <span className="text-flame-400 font-semibold tabular-nums">
                    {formatRupiah(selectedGroup.total_payout)}
                  </span>
                </span>
                <span className="text-ink-700">•</span>
                <span className="text-ink-300">
                  <span className="text-white font-medium">{selectedGroup.orders.length}</span> order
                </span>
                <span className="text-ink-700">•</span>
                <span className="text-ink-300">
                  <span className="text-white font-medium">
                    {selectedGroup.orders.reduce((s, o) => s + (Number(o.qty) || 0), 0)}
                  </span> tiket
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative px-5 lg:px-6 pb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-ink-500">Progress pencairan</span>
              <span className="text-xs text-white font-semibold">
                {selectedGroup.total_payout > 0
                  ? Math.round((selectedGroup.total_done / selectedGroup.total_payout) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    selectedGroup.total_payout > 0
                      ? Math.round((selectedGroup.total_done / selectedGroup.total_payout) * 100)
                      : 0
                  }%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Toolbar: search + filter + sort + export */}
        <div className="bg-ink-800/40 border border-ink-700/60 rounded-2xl p-3 mb-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Icon name="search" className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari customer, order code, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ink-900/50 border border-ink-700 rounded-xl text-sm text-white placeholder-ink-500 focus:outline-none focus:border-flame-500/50 focus:ring-2 focus:ring-flame-500/20 transition-all"
            />
          </div>

          {/* Filter chips + sort + export */}
          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip
              label="Semua"
              active={payoutFilter === 'all'}
              onClick={() => setPayoutFilter('all')}
              count={detailCounts.all}
              color="flame"
            />
            <FilterChip
              label="Belum Cair"
              active={payoutFilter === 'belum_cair'}
              onClick={() => setPayoutFilter('belum_cair')}
              count={detailCounts.belum_cair}
              color="yellow"
            />
            <FilterChip
              label="Sudah Cair"
              active={payoutFilter === 'sudah_cair'}
              onClick={() => setPayoutFilter('sudah_cair')}
              count={detailCounts.sudah_cair}
              color="blue"
            />

            <div className="ml-auto flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-3.5 py-1.5 bg-ink-900/50 border border-ink-700 rounded-full text-xs text-ink-300 hover:text-white focus:outline-none focus:border-flame-500/50 transition-colors cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="payout_high">Payout Tertinggi</option>
                <option value="payout_low">Payout Terendah</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink-900/50 border border-ink-700 rounded-full text-xs text-ink-300 hover:text-white hover:bg-ink-700 transition-colors"
              >
                <Icon name="download" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex items-center justify-between px-4 py-3 mb-4 bg-ink-800/30 border border-ink-700/40 rounded-xl">
          <div className="text-xs text-ink-400">
            Menampilkan <span className="text-white font-semibold">{filteredOrders.length}</span>
            {(payoutFilter !== 'all' || searchTerm) && (
              <> dari <span className="text-white font-semibold">{selectedGroup.orders.length}</span></>
            )} order
            {detailTotalQty > 0 && (
              <> · <span className="text-white font-semibold">{detailTotalQty}</span> tiket</>
            )}
          </div>
          <div className="text-xs text-ink-400">
            Total payout:{' '}
            <span className="text-flame-400 font-bold tabular-nums">
              {formatRupiah(detailTotalPayout)}
            </span>
          </div>
        </div>

        {/* List order */}
        <AnimatePresence mode="wait">
          {filteredOrders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center mb-4">
                <Icon name="ticket" className="w-7 h-7 text-ink-500" />
              </div>
              <h3 className="font-semibold text-white mb-1">
                {searchTerm || payoutFilter !== 'all' ? 'Tidak ada order yang cocok' : 'Belum ada order'}
              </h3>
              <p className="text-sm text-ink-400 max-w-sm mx-auto">
                {searchTerm || payoutFilter !== 'all'
                  ? 'Coba ubah filter atau kata kunci pencarian.'
                  : 'Order dari customer akan muncul di sini setelah lunas.'}
              </p>
              {(searchTerm || payoutFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setPayoutFilter('all');
                  }}
                  className="mt-4 text-sm text-flame-400 hover:text-flame-300"
                >
                  Reset filter
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

        {/* Modal detail */}
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCopyCode={handleCopyCode}
          copiedCode={copiedCode}
        />
      </div>
    );
  }

  // ============ LIST VIEW ============
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs font-mono uppercase tracking-[0.35em] text-flame-400/80 mb-2">
          Rekap EO
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Pendapatan & Pencairan
        </h1>
        <p className="text-ink-300 text-sm mt-1">
          Pantau pendapatan konsermu dan status pencairan dana.
        </p>
      </motion.div>

      {/* Banner notifikasi */}
      <AnimatePresence>
        {unseenCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-flame-500/10 border border-flame-500/30 mb-6"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-flame-500/20 flex items-center justify-center text-flame-400 shrink-0">
                <Icon name="wallet" className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  {unseenCount} order baru saja dicairkan
                </p>
                <p className="text-xs text-ink-400 mt-0.5">
                  Dana sudah ditransfer oleh admin ke rekening kamu.
                </p>
              </div>
            </div>
            <button
              onClick={handleMarkSeen}
              disabled={markingSeen}
              className="px-3 py-1.5 text-xs font-medium text-flame-400 hover:bg-flame-500/10 border border-flame-500/30 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {markingSeen ? 'Memproses...' : 'Tandai dibaca'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mb-8"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-flame-500/20 via-transparent to-flame-500/20 rounded-2xl blur-xl -z-10" />
        <div className="card overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-flame-500/10 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row">
            <div className="flex-[2] p-5 md:p-8 flex flex-col">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-ink-400">
                Total Pendapatan
              </p>

              <p className="text-white mt-2 leading-none tracking-wide text-3xl sm:text-4xl font-bold tabular-nums">
                <NumberTicker value={Number(summary.total_pendapatan) || 0} prefix="Rp " format="id-ID" duration={1500} />
              </p>

              <p className="text-sm text-ink-300 mt-2">
                <NumberTicker value={Number(summary.total_tiket_terjual) || 0} format="id-ID" /> tiket terjual sejauh ini
              </p>

              <div className="mt-auto pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-ink-400">Progress pencairan</span>
                  <span className="text-xs text-white font-semibold">{payoutRate}%</span>
                </div>
                <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${payoutRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="relative border-t-2 md:border-t-0 md:border-l-2 border-dashed border-ink-600/50 mx-5 md:mx-0 my-1 md:my-6">
              <TicketNotch position="top" />
              <TicketNotch position="bottom" />
            </div>

            <div className="flex-1 p-5 md:p-6 flex flex-col justify-center gap-1">
              <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-ink-800/60 transition-colors group">
                <span className="text-sm text-ink-300 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-md bg-ink-700/50 flex items-center justify-center">
                    <Icon name="clock" className="w-4 h-4 text-yellow-400" />
                  </span>
                  Belum dicairkan
                </span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-white block tabular-nums group-hover:text-yellow-400 transition-colors">
                    {formatRupiah(Number(summary.belum_cair) || 0)}
                  </span>
                  <span className="text-[10px] text-ink-500">{totalPending} order</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-ink-800/60 transition-colors group border-t border-ink-700/60">
                <span className="text-sm text-ink-300 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-md bg-ink-700/50 flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4 text-blue-400" />
                  </span>
                  Sudah dicairkan
                </span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-white block tabular-nums group-hover:text-blue-400 transition-colors">
                    {formatRupiah(Number(summary.sudah_cair) || 0)}
                  </span>
                  <span className="text-[10px] text-ink-500">{totalDone} order</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-start gap-3 p-4 mb-6 rounded-xl border border-dashed border-ink-600/60 bg-ink-800/40"
      >
        <Icon name="info" className="w-4 h-4 text-flame-400 shrink-0 mt-0.5" />
        <p className="text-sm text-ink-300">
          Dana dicairkan manual oleh admin ke rekeningmu. Nilai yang ditampilkan adalah bagianmu
          setelah dipotong biaya layanan platform.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-5"
      >
        <Icon name="search" className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari konser..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full input-field pl-10 bg-ink-800/40"
        />
      </motion.div>

      {/* List konser */}
      <AnimatePresence mode="wait">
        {loading ? (
          <Loading key="loading" />
        ) : filteredGroups.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center mb-4">
              <Icon name="wallet" className="w-7 h-7 text-ink-500" />
            </div>
            <h3 className="font-semibold text-white mb-1">
              {searchTerm ? 'Tidak ada konser yang cocok' : 'Belum ada order lunas'}
            </h3>
            <p className="text-sm text-ink-400 max-w-sm mx-auto">
              {searchTerm
                ? 'Coba kata kunci lain atau reset pencarian.'
                : 'Pendapatan akan muncul di sini setelah ada tiket yang terjual dan lunas.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-sm text-flame-400 hover:text-flame-300"
              >
                Reset pencarian
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
  );
}