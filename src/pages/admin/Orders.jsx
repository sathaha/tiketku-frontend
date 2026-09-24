import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { StatusBadge, formatRupiah, formatDate } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
    close: 'M6 18L18 6M6 6l12 12',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    bank: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3',
    copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
    check: 'M5 13l4 4L19 7',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
    receipt: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] || paths.alert} />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500/60';
const PAGE_SIZE = 20;

const statusTabs = [
  { value: '', label: 'Semua' },
  { value: 'menunggu_pembayaran', label: 'Menunggu' },
  { value: 'lunas', label: 'Lunas' },
  { value: 'kadaluarsa', label: 'Kadaluarsa' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

const tableCols = 'lg:grid-cols-[9.5rem_minmax(0,1fr)_minmax(0,1.2fr)_8.5rem_7.5rem_6.5rem]';

function formatTime(d) {
  return d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
}

function SkeletonRows() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 border-t first:border-t-0 border-ink-700">
          <div className="flex items-center gap-6">
            <div className="h-3 w-24 bg-ink-700 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-36 bg-ink-700 rounded" />
              <div className="h-3 w-28 bg-ink-700 rounded" />
            </div>
          </div>
          <div className="h-4 w-20 bg-ink-700 rounded" />
        </div>
      ))}
    </div>
  );
}

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
    setLoading(true);
    try {
      const res = await api.get('/orders', { params: status ? { status } : {} });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
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
      setToast({ message: 'Gagal memuat detail transaksi.', id: Date.now() });
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

  const paidRevenue = filteredOrders
    .filter((o) => o.status === 'lunas')
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredOrders.slice(pageStart, pageStart + PAGE_SIZE);

  const isFiltering = !!search.trim() || !!status;
  const base = detail || orders.find((o) => o.id === selectedId) || null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Transaksi</h1>
          <p className="text-sm text-ink-400 mt-1">
            Status berubah otomatis saat customer membayar lewat Xendit, tanpa verifikasi manual.
          </p>
        </header>

        {/* Summary */}
        {!loading && orders.length > 0 && (
          <div className="card grid grid-cols-2 divide-x divide-ink-700 mb-6">
            <div className="p-4">
              <p className="text-xs text-ink-400">Transaksi ditemukan</p>
              <p className="text-xl font-bold text-white font-mono tabular-nums mt-1.5 leading-none">
                {filteredOrders.length}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-ink-400">Pendapatan lunas</p>
              <p className="text-xl font-bold text-flame-400 font-mono tabular-nums mt-1.5 leading-none">
                {formatRupiah(paidRevenue)}
              </p>
            </div>
          </div>
        )}

        {/* Search and status */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
          <div className="flex gap-1 p-1 bg-ink-800/40 rounded-lg overflow-x-auto self-start">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => updateParams({ status: tab.value })}
                aria-pressed={status === tab.value}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  status === tab.value ? 'bg-flame-500 text-white' : 'text-ink-400 hover:text-white'
                } ${focusRing}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 lg:max-w-sm lg:ml-auto">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              ref={searchRef}
              type="text"
              aria-label="Cari transaksi"
              className="w-full input-field pl-10 bg-ink-800/40"
              placeholder="Cari kode order, nama, email, atau konser"
              value={search}
              onChange={(e) => updateParams({ q: e.target.value }, true)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <SkeletonRows />
        ) : filteredOrders.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-ink-800 flex items-center justify-center mb-4">
              <Icon name="receipt" className="w-6 h-6 text-ink-400" />
            </div>
            {isFiltering ? (
              <>
                <h3 className="font-semibold text-white mb-1">Tidak ada transaksi yang cocok</h3>
                <p className="text-sm text-ink-400 mb-5">Ubah kata kunci atau filter status.</p>
                <button onClick={() => setSearchParams({})} className="btn-secondary">
                  Reset filter
                </button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-white mb-1">Belum ada transaksi</h3>
                <p className="text-sm text-ink-400">Transaksi muncul di sini setelah tiket pertama dipesan.</p>
              </>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className={`hidden lg:grid ${tableCols} gap-4 px-5 py-3 border-b border-ink-700 text-xs text-ink-400`}>
              <span>Kode order</span>
              <span>Customer</span>
              <span>Konser</span>
              <span className="text-right">Total</span>
              <span>Status</span>
              <span className="text-right">Dibuat</span>
            </div>

            <ul className="divide-y divide-ink-700">
              {pageItems.map((order) => (
                <li
                  key={order.id}
                  className={`relative grid grid-cols-2 ${tableCols} gap-x-4 gap-y-2 items-center px-5 py-4 hover:bg-ink-800/40 transition-colors`}
                >
                  <div className="order-1 lg:order-none">
                    <button
                      type="button"
                      onClick={() => copyCode(order.order_code)}
                      title="Salin kode order"
                      className={`relative z-10 inline-flex items-center gap-1.5 text-xs font-mono text-ink-300 hover:text-white transition-colors rounded ${focusRing}`}
                    >
                      {copiedCode === order.order_code ? 'Disalin' : order.order_code}
                      <Icon
                        name={copiedCode === order.order_code ? 'check' : 'copy'}
                        className={`w-3 h-3 ${copiedCode === order.order_code ? 'text-emerald-400' : ''}`}
                      />
                    </button>
                  </div>

                  <div className="order-3 lg:order-none col-span-2 lg:col-span-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => openDetail(order.id)}
                      className={`text-left font-medium text-white truncate max-w-full rounded after:absolute after:inset-0 after:content-[''] ${focusRing}`}
                    >
                      {order.customer_name}
                    </button>
                    {order.customer_email && (
                      <p className="text-xs text-ink-400 truncate">{order.customer_email}</p>
                    )}
                  </div>

                  <div className="order-4 lg:order-none col-span-2 lg:col-span-1 min-w-0">
                    <p className="text-sm text-ink-200 truncate">{order.concert_name}</p>
                    <p className="text-xs text-ink-400 truncate">
                      {order.ticket_category_name} × {order.qty}
                    </p>
                  </div>

                  <div className="order-5 lg:order-none lg:text-right">
                    <p className="font-semibold text-flame-400 font-mono tabular-nums">
                      {formatRupiah(order.total_price)}
                    </p>
                  </div>

                  <div className="order-2 lg:order-none justify-self-end lg:justify-self-start">
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="order-6 lg:order-none text-right justify-self-end">
                    <p className="text-xs text-ink-300">{formatDate(order.created_at)}</p>
                    <p className="text-xs text-ink-400 font-mono tabular-nums">{formatTime(order.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>

            {filteredOrders.length > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-ink-700 text-xs text-ink-400">
                <span>
                  Menampilkan{' '}
                  <span className="text-white font-mono tabular-nums">
                    {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredOrders.length)}
                  </span>{' '}
                  dari <span className="font-mono tabular-nums">{filteredOrders.length}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-md bg-ink-800 hover:bg-ink-700 text-ink-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-md bg-ink-800 hover:bg-ink-700 text-ink-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    Berikutnya
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
                className="fixed inset-0 bg-black/60 z-[60]"
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
                className="fixed inset-y-0 right-0 z-[70] w-full max-w-md"
              >
                <div className="card !rounded-none !border-y-0 !border-r-0 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3 p-5 border-b border-ink-700">
                    <div className="min-w-0">
                      {base && (
                        <button
                          type="button"
                          onClick={() => copyCode(base.order_code)}
                          title="Salin kode order"
                          className={`inline-flex items-center gap-1.5 text-xs font-mono text-ink-400 hover:text-white transition-colors rounded ${focusRing}`}
                        >
                          {copiedCode === base.order_code ? 'Disalin' : base.order_code}
                          <Icon
                            name={copiedCode === base.order_code ? 'check' : 'copy'}
                            className={`w-3 h-3 ${copiedCode === base.order_code ? 'text-emerald-400' : ''}`}
                          />
                        </button>
                      )}
                      <h2 id="order-title" className="font-semibold text-white mt-1 truncate">
                        {base?.concert_name || 'Detail transaksi'}
                      </h2>
                    </div>
                    <button
                      onClick={closeDrawer}
                      aria-label="Tutup"
                      className={`p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors ${focusRing}`}
                    >
                      <Icon name="close" className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {base && (
                      <div className="flex items-center gap-3">
                        <StatusBadge status={base.status} />
                        <span className="text-xs text-ink-400">
                          Dibuat {formatDate(base.created_at)}, {formatTime(base.created_at)}
                        </span>
                      </div>
                    )}

                    {base && (
                      <div className="rounded-xl border border-ink-700 divide-y divide-ink-700">
                        <div className="p-4">
                          <p className="text-sm font-medium text-white">{base.customer_name}</p>
                          {(detail?.customer_email || base.customer_email) && (
                            <p className="text-xs text-ink-400 mt-0.5">
                              {detail?.customer_email || base.customer_email}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 p-4">
                          <div className="flex items-center gap-2.5 text-sm text-ink-200 min-w-0">
                            <Icon name="ticket" className="w-4 h-4 text-flame-400 shrink-0" />
                            <span className="truncate">{base.ticket_category_name}</span>
                          </div>
                          <span className="text-sm text-white font-mono tabular-nums shrink-0">× {base.qty}</span>
                        </div>
                      </div>
                    )}

                    {detailLoading || !detail ? (
                      <div className="animate-pulse space-y-3" aria-hidden="true">
                        <div className="h-32 bg-ink-800/60 rounded-xl" />
                        <div className="h-16 bg-ink-800/60 rounded-xl" />
                      </div>
                    ) : (
                      <>
                        {/* Receipt */}
                        <div className="rounded-xl border border-dashed border-ink-700 divide-y divide-dashed divide-ink-700 text-sm">
                          <div className="p-4 space-y-2">
                            <div className="flex justify-between text-ink-300">
                              <span>Subtotal tiket</span>
                              <span className="font-mono tabular-nums">
                                {formatRupiah(detail.unit_price * detail.qty)}
                              </span>
                            </div>
                            <div className="flex justify-between text-ink-300">
                              <span>Biaya layanan</span>
                              <span className="font-mono tabular-nums">{formatRupiah(detail.platform_fee_amount)}</span>
                            </div>
                            {detail.discount_amount > 0 && (
                              <div className="flex justify-between text-emerald-400">
                                <span>Diskon</span>
                                <span className="font-mono tabular-nums">-{formatRupiah(detail.discount_amount)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between p-4">
                            <span className="font-semibold text-white">Total dibayar</span>
                            <span className="text-lg font-bold text-flame-400 font-mono tabular-nums">
                              {formatRupiah(detail.total_price)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between px-4 py-3 text-xs text-ink-400">
                            <span>Bagian EO</span>
                            <span className="font-mono tabular-nums">{formatRupiah(detail.eo_payout_amount)}</span>
                          </div>
                        </div>

                        {detail.xendit_payment_channel && (
                          <div className="flex items-start gap-3 p-4 rounded-xl border border-ink-700">
                            <span className="w-9 h-9 rounded-lg bg-flame-500/10 text-flame-400 flex items-center justify-center shrink-0">
                              <Icon name="bank" className="w-[18px] h-[18px]" />
                            </span>
                            <div>
                              <p className="text-xs text-ink-400">Dibayar lewat</p>
                              <p className="text-sm font-medium text-white mt-0.5">{detail.xendit_payment_channel}</p>
                              <p className="text-xs text-ink-400 mt-0.5">
                                {formatDate(detail.paid_at)}, {formatTime(detail.paid_at)}
                              </p>
                            </div>
                          </div>
                        )}

                        {detail.status === 'lunas' && (
                          <div className="flex items-center justify-between p-4 rounded-xl border border-ink-700">
                            <span className="text-sm text-ink-300">Pencairan ke EO</span>
                            <StatusBadge status={detail.payout_status} />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="p-4 border-t border-ink-700">
                    <button onClick={closeDrawer} className="btn-secondary w-full">
                      Tutup
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
                className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium bg-red-500/10 border-red-500/30 text-red-300"
              >
                <Icon name="alert" className="w-4 h-4" />
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}