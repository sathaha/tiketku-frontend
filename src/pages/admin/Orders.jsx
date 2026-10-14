import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  close: 'M6 18L18 6M6 6l12 12',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  bank: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3',
  copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  receipt: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name] || ICON_PATHS.alert} />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  /* Receipt: notches on the tear line above the total */
  .receipt {
    --tail-h: 6rem;
    -webkit-mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--tail-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--tail-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--tail-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--tail-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }
`;

/* ============ CONSTANTS ============ */
const PAGE_SIZE = 20;

// values match the API
const statusTabs = [
  { value: '', label: 'All' },
  { value: 'menunggu_pembayaran', label: 'Pending' },
  { value: 'lunas', label: 'Paid' },
  { value: 'kadaluarsa', label: 'Expired' },
  { value: 'dibatalkan', label: 'Cancelled' },
];

const tableCols = 'lg:grid-cols-[9.5rem_minmax(0,1fr)_minmax(0,1.2fr)_8.5rem_8rem_6.5rem]';

const statusMeta = {
  lunas: { label: 'Paid', light: 'bg-emerald-50 text-emerald-700', dark: 'bg-emerald-950/60 text-emerald-300', dot: 'bg-emerald-500', darkDot: 'bg-emerald-400' },
  menunggu_pembayaran: { label: 'Pending', light: 'bg-yellow-50 text-yellow-700', dark: 'bg-yellow-950/60 text-yellow-300', dot: 'bg-yellow-500', darkDot: 'bg-yellow-400' },
  kadaluarsa: { label: 'Expired', light: 'bg-stone-100 text-stone-600', dark: 'bg-amber-900 text-amber-200', dot: 'bg-stone-400', darkDot: 'bg-amber-400' },
  dibatalkan: { label: 'Cancelled', light: 'bg-red-50 text-red-700', dark: 'bg-red-950/60 text-red-300', dot: 'bg-red-500', darkDot: 'bg-red-400' },
  belum_cair: { label: 'Not paid out', light: 'bg-yellow-50 text-yellow-700', dark: 'bg-yellow-950/60 text-yellow-300', dot: 'bg-yellow-500', darkDot: 'bg-yellow-400' },
  sudah_cair: { label: 'Paid out', light: 'bg-emerald-50 text-emerald-700', dark: 'bg-emerald-950/60 text-emerald-300', dot: 'bg-emerald-500', darkDot: 'bg-emerald-400' },
};

function StatusPill({ status, dark = false }) {
  const meta = statusMeta[status] || {
    label: status ? String(status).replace(/_/g, ' ') : '-',
    light: 'bg-amber-50 text-amber-800',
    dark: 'bg-amber-900 text-amber-100',
    dot: 'bg-amber-500',
    darkDot: 'bg-amber-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${dark ? meta.dark : meta.light}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dark ? meta.darkDot : meta.dot}`} />
      {meta.label}
    </span>
  );
}

function formatTime(d) {
  return d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
}

const num = (v) => Number(v) || 0;

function SkeletonRows() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse" role="status" aria-label="Loading transactions">
      <div className="h-12 bg-amber-950/90" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 border-t border-dashed border-amber-200">
          <div className="flex items-center gap-6">
            <div className="h-3 w-24 bg-amber-100 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-36 bg-amber-100 rounded" />
              <div className="h-3 w-28 bg-amber-100 rounded" />
            </div>
          </div>
          <div className="h-4 w-20 bg-amber-100 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ============ MAIN ============ */
export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const search = searchParams.get('q') || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const requestRef = useRef(0);
  const listRequestRef = useRef(0);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, [status]);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  useEffect(() => {
    if (window.matchMedia?.('(hover: hover)').matches) searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedId]);

  function updateParams(next, replace = false) {
    const merged = { status, q: search, ...next };
    const clean = {};
    if (merged.status) clean.status = merged.status;
    if (merged.q) clean.q = merged.q;
    setSearchParams(clean, { replace });
  }

  async function fetchOrders() {
    const requestId = ++listRequestRef.current;
    setLoading(true);
    try {
      const res = await api.get('/orders', { params: status ? { status } : {} });
      if (requestId !== listRequestRef.current) return;
      setOrders(res.data);
    } catch (err) {
      if (requestId !== listRequestRef.current) return;
      console.error('Failed to fetch orders:', err);
      setToast({ message: "Couldn't load transactions. Please try again.", id: Date.now() });
    } finally {
      if (requestId === listRequestRef.current) setLoading(false);
    }
  }

  async function openDetail(id) {
    const requestId = ++requestRef.current;
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      if (requestId !== requestRef.current) return;
      setDetail(res.data);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error('Failed to fetch order detail:', err);
      setToast({ message: "Couldn't load the transaction details. Please try again.", id: Date.now() });
      setSelectedId(null);
    } finally {
      if (requestId === requestRef.current) setDetailLoading(false);
    }
  }

  function closeDrawer() {
    requestRef.current++;
    setSelectedId(null);
    setDetail(null);
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        (o.order_code || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_email || '').toLowerCase().includes(q) ||
        (o.concert_name || '').toLowerCase().includes(q)
    );
  }, [orders, search]);

  const paidOrders = filteredOrders.filter((o) => o.status === 'lunas');
  const paidRevenue = paidOrders.reduce((sum, o) => sum + num(o.total_price), 0);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredOrders.slice(pageStart, pageStart + PAGE_SIZE);

  const isFiltering = !!search.trim() || !!status;
  const base = detail || orders.find((o) => o.id === selectedId) || null;
  const activeTab = statusTabs.find((t) => t.value === status);

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4] px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-6">
            <h1 className="f-display text-3xl font-bold text-amber-950">Transactions</h1>
            <p className="text-sm text-amber-700/80 mt-1">
              Statuses update on their own when customers pay through Xendit. No manual verification needed.
            </p>
          </header>

          {/* Summary */}
          {!loading && orders.length > 0 && (
            <section aria-label="Summary" className="bg-white rounded-2xl grid grid-cols-3 divide-x divide-dashed divide-amber-200 mb-6">
              <div className="p-4">
                <p className="text-sm text-amber-700/90">Transactions</p>
                <p className="f-display text-2xl font-bold text-amber-950 tabular-nums mt-1.5 leading-none">
                  {filteredOrders.length}
                </p>
              </div>
              <div className="p-4">
                <p className="text-sm text-amber-700/90">Paid</p>
                <p className="f-display text-2xl font-bold text-emerald-700 tabular-nums mt-1.5 leading-none">
                  {paidOrders.length}
                </p>
              </div>
              <div className="p-4 min-w-0">
                <p className="text-sm text-amber-700/90">Paid revenue</p>
                <p className="f-display text-lg sm:text-2xl font-bold text-amber-800 tabular-nums mt-1.5 leading-none truncate">
                  {formatRupiah(paidRevenue)}
                </p>
              </div>
            </section>
          )}

          {/* Status tabs and search */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
            <div role="group" aria-label="Filter by status" className="flex gap-1 p-1 bg-white rounded-xl overflow-x-auto self-start max-w-full">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => updateParams({ status: tab.value })}
                  aria-pressed={status === tab.value}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    status === tab.value ? 'bg-amber-950 text-amber-50' : 'text-amber-700 hover:text-amber-950 hover:bg-amber-50'
                  } ${focusRing}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 lg:max-w-sm lg:ml-auto">
              <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
              <input
                ref={searchRef}
                type="text"
                aria-label="Search transactions"
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                placeholder="Search by order code, name, email or concert"
                value={search}
                onChange={(e) => updateParams({ q: e.target.value }, true)}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <SkeletonRows />
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                <Icon name="receipt" className="w-6 h-6" />
              </div>
              {isFiltering ? (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No transactions match</h3>
                  <p className="text-sm text-amber-800/80 mb-5">Change the keyword or the status.</p>
                  <button
                    onClick={() => setSearchParams({})}
                    className={`px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No transactions yet</h3>
                  <p className="text-sm text-amber-800/80">They'll show up here after the first ticket is ordered.</p>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-amber-950/5">
              <div className="flex items-center justify-between px-5 py-3.5 bg-amber-950 text-amber-50">
                <h2 className="f-display text-lg font-semibold">{activeTab?.value ? `${activeTab.label} transactions` : 'All transactions'}</h2>
                <span className="text-sm text-amber-200/70 tabular-nums">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'result' : 'results'}
                </span>
              </div>

              <div className={`hidden lg:grid ${tableCols} gap-4 px-5 py-2.5 bg-amber-50 border-b border-dashed border-amber-200 text-xs font-medium text-amber-700`}>
                <span>Order code</span>
                <span>Customer</span>
                <span>Concert</span>
                <span className="text-right">Total</span>
                <span>Status</span>
                <span className="text-right">Created</span>
              </div>

              <ul className="divide-y divide-dashed divide-amber-200">
                {pageItems.map((order) => (
                  <li
                    key={order.id}
                    className={`relative grid grid-cols-2 ${tableCols} gap-x-4 gap-y-2 items-center px-5 py-4 hover:bg-amber-50/60 transition-colors`}
                  >
                    <div className="order-1 lg:order-none">
                      <button
                        type="button"
                        onClick={() => copyCode(order.order_code)}
                        title="Copy order code"
                        aria-label={`Copy order code ${order.order_code}`}
                        className={`relative z-10 inline-flex items-center gap-1.5 font-mono text-xs text-amber-800 hover:text-amber-950 transition-colors rounded ${focusRing}`}
                      >
                        {copiedCode === order.order_code ? 'Copied' : order.order_code}
                        <Icon
                          name={copiedCode === order.order_code ? 'check' : 'copy'}
                          className={`w-3 h-3 ${copiedCode === order.order_code ? 'text-emerald-600' : ''}`}
                        />
                      </button>
                    </div>

                    <div className="order-3 lg:order-none col-span-2 lg:col-span-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => openDetail(order.id)}
                        aria-label={`Open transaction ${order.order_code} from ${order.customer_name}`}
                        className={`text-left text-sm font-semibold text-amber-950 truncate max-w-full rounded after:absolute after:inset-0 after:content-[''] ${focusRing}`}
                      >
                        {order.customer_name}
                      </button>
                      {order.customer_email && <p className="text-xs text-amber-700/80 truncate">{order.customer_email}</p>}
                    </div>

                    <div className="order-4 lg:order-none col-span-2 lg:col-span-1 min-w-0">
                      <p className="text-sm text-amber-900 truncate">{order.concert_name}</p>
                      <p className="text-xs text-amber-700/80 truncate">
                        {order.ticket_category_name} × {order.qty}
                      </p>
                    </div>

                    <div className="order-5 lg:order-none lg:text-right">
                      <p className="f-display text-base font-semibold text-amber-950 tabular-nums">{formatRupiah(order.total_price)}</p>
                    </div>

                    <div className="order-2 lg:order-none justify-self-end lg:justify-self-start">
                      <StatusPill status={order.status} />
                    </div>

                    <div className="order-6 lg:order-none text-right justify-self-end">
                      <p className="text-xs text-amber-900">{formatDate(order.created_at)}</p>
                      <p className="text-xs text-amber-700/70 tabular-nums">{formatTime(order.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {filteredOrders.length > PAGE_SIZE && (
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-dashed border-amber-200 text-sm text-amber-700/80">
                  <span>
                    Showing{' '}
                    <span className="text-amber-950 font-medium tabular-nums">
                      {pageStart + 1} to {Math.min(pageStart + PAGE_SIZE, filteredOrders.length)}
                    </span>{' '}
                    of <span className="tabular-nums">{filteredOrders.length}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200/70 text-amber-900 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200/70 text-amber-900 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detail drawer */}
          <AnimatePresence>
            {selectedId && (
              <>
                <motion.div
                  key="overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={closeDrawer}
                  className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-[60]"
                  aria-hidden="true"
                />
                <motion.aside
                  key="drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="order-title"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="f-body fixed inset-y-0 right-0 z-[70] w-full max-w-md"
                >
                  <div className="bg-white h-full flex flex-col shadow-2xl shadow-amber-950/30">
                    <div className="p-5 bg-amber-950 text-amber-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {base && (
                            <button
                              type="button"
                              onClick={() => copyCode(base.order_code)}
                              title="Copy order code"
                              aria-label={`Copy order code ${base.order_code}`}
                              className={`inline-flex items-center gap-1.5 font-mono text-xs text-amber-200/80 hover:text-white transition-colors rounded ${focusRing}`}
                            >
                              {copiedCode === base.order_code ? 'Copied' : base.order_code}
                              <Icon
                                name={copiedCode === base.order_code ? 'check' : 'copy'}
                                className={`w-3 h-3 ${copiedCode === base.order_code ? 'text-emerald-400' : ''}`}
                              />
                            </button>
                          )}
                          <h2 id="order-title" className="f-display text-xl font-semibold mt-1 break-words">
                            {base?.concert_name || 'Transaction details'}
                          </h2>
                        </div>
                        <button
                          onClick={closeDrawer}
                          aria-label="Close"
                          className={`-mr-1.5 -mt-1 p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors ${focusRing}`}
                        >
                          <Icon name="close" className="w-5 h-5" />
                        </button>
                      </div>
                      {base && (
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <StatusPill status={base.status} dark />
                          <span className="text-sm text-amber-200/70">
                            {formatDate(base.created_at)}, {formatTime(base.created_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      {base && (
                        <div className="rounded-2xl bg-amber-50 divide-y divide-dashed divide-amber-200">
                          <div className="flex items-center gap-3 p-4">
                            <span className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 f-display font-semibold flex items-center justify-center shrink-0">
                              {base.customer_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-amber-950 truncate">{base.customer_name}</p>
                              {(detail?.customer_email || base.customer_email) && (
                                <p className="text-xs text-amber-700/80 truncate">{detail?.customer_email || base.customer_email}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 p-4">
                            <div className="flex items-center gap-2.5 text-sm text-amber-900 min-w-0">
                              <Icon name="ticket" className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="truncate">{base.ticket_category_name}</span>
                            </div>
                            <span className="text-sm font-semibold text-amber-950 tabular-nums shrink-0">× {base.qty}</span>
                          </div>
                        </div>
                      )}

                      {detailLoading || !detail ? (
                        <div className="animate-pulse space-y-3" role="status" aria-label="Loading details">
                          <div className="h-40 bg-amber-100 rounded-2xl" />
                          <div className="h-16 bg-amber-100 rounded-2xl" />
                        </div>
                      ) : (
                        <>
                          {/* Receipt */}
                          <div className="receipt bg-amber-50 rounded-2xl overflow-hidden">
                            <div className="p-4 space-y-2 text-sm">
                              <div className="flex justify-between text-amber-800">
                                <span>Ticket subtotal</span>
                                <span className="tabular-nums text-amber-950">{formatRupiah(num(detail.unit_price) * num(detail.qty))}</span>
                              </div>
                              <div className="flex justify-between text-amber-800">
                                <span>Service fee</span>
                                <span className="tabular-nums text-amber-950">{formatRupiah(detail.platform_fee_amount)}</span>
                              </div>
                              {num(detail.discount_amount) > 0 && (
                                <div className="flex justify-between text-emerald-700">
                                  <span>Discount</span>
                                  <span className="tabular-nums">−{formatRupiah(detail.discount_amount)}</span>
                                </div>
                              )}
                            </div>
                            <div className="h-24 border-t border-dashed border-amber-300 bg-amber-100 px-4 flex flex-col justify-center gap-1.5">
                              <div className="flex items-baseline justify-between">
                                <span className="text-sm font-semibold text-amber-950">Total paid</span>
                                <span className="f-display text-2xl font-bold text-amber-950 tabular-nums">{formatRupiah(detail.total_price)}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-amber-800/80">
                                <span>Organizer's share</span>
                                <span className="tabular-nums">{formatRupiah(detail.eo_payout_amount)}</span>
                              </div>
                            </div>
                          </div>

                          {detail.xendit_payment_channel && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50">
                              <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <Icon name="bank" className="w-[18px] h-[18px]" />
                              </span>
                              <div>
                                <p className="text-xs text-amber-700/80">Paid via</p>
                                <p className="text-sm font-semibold text-amber-950 mt-0.5">{detail.xendit_payment_channel}</p>
                                {detail.paid_at && (
                                  <p className="text-xs text-amber-700/80 mt-0.5">
                                    {formatDate(detail.paid_at)}, {formatTime(detail.paid_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {detail.status === 'lunas' && (
                            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50">
                              <span className="flex items-center gap-2 text-sm text-amber-900">
                                <Icon name="wallet" className="w-4 h-4 text-amber-600" />
                                Payout to organizer
                              </span>
                              <StatusPill status={detail.payout_status} />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="p-4 border-t border-dashed border-amber-200">
                      <button
                        onClick={closeDrawer}
                        className={`w-full py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Toast */}
          <div className="fixed bottom-6 inset-x-0 z-[80] flex justify-center px-4 pointer-events-none">
            <AnimatePresence>
              {toast && (
                <motion.div
                  key={toast.id}
                  role="status"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-950 text-amber-50 text-sm shadow-lg shadow-amber-950/30"
                >
                  <Icon name="alert" className="w-4 h-4 text-red-400" />
                  {toast.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}