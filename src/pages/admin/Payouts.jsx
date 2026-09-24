import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    bank: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3',
    check: 'M5 13l4 4L19 7',
    close: 'M6 18L18 6M6 6l12 12',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    receipt: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] || paths.alert} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500/60';
const tableCols = 'sm:grid-cols-[minmax(0,1fr)_10rem_10rem_9rem]';

const tabs = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Perlu dicairkan' },
  { value: 'done', label: 'Beres' },
];

function SkeletonTable() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 p-5 border-t first:border-t-0 border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-ink-700" />
            <div className="space-y-2">
              <div className="h-3 w-36 bg-ink-700 rounded" />
              <div className="h-3 w-48 bg-ink-700 rounded" />
            </div>
          </div>
          <div className="h-4 w-24 bg-ink-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function Payouts() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Drawer
  const [selectedEo, setSelectedEo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [payError, setPayError] = useState('');

  // Rekening EO
  const [eoBank, setEoBank] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const [toast, setToast] = useState(null);
  const requestRef = useRef(0);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!selectedEo) return;
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
  }, [selectedEo, processing]);

  function notify(type, message) {
    setToast({ type, message, id: Date.now() });
  }

  async function fetchSummary(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/payouts/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch payout summary:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openEo(eo) {
    const requestId = ++requestRef.current;
    setSelectedEo(eo);
    setOrders([]);
    setSelectedOrderIds([]);
    setNote('');
    setEoBank(null);
    setConfirmStep(false);
    setPayError('');
    setOrdersLoading(true);
    setBankLoading(true);

    try {
      const [ordersRes, bankRes] = await Promise.all([
        api.get(`/payouts/eo/${eo.eo_id}/orders`, {
          params: { payout_status: 'belum_cair' },
        }),
        api.get(`/bank-accounts/${eo.eo_id}`).catch((err) => {
          // 404 = EO belum isi rekening, anggap null
          if (err.response?.status === 404) return { data: null };
          throw err;
        }),
      ]);
      if (requestId !== requestRef.current) return;
      setOrders(ordersRes.data);
      setEoBank(bankRes.data);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error('Failed to fetch EO data:', err);
      notify('error', 'Gagal memuat data EO.');
      setSelectedEo(null);
    } finally {
      if (requestId === requestRef.current) {
        setOrdersLoading(false);
        setBankLoading(false);
      }
    }
  }

  function closeDrawer() {
    if (processing) return;
    requestRef.current++;
    setSelectedEo(null);
    setConfirmStep(false);
    setPayError('');
  }

  function toggleOrder(id) {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    setSelectedOrderIds(selectedOrderIds.length === orders.length ? [] : orders.map((o) => o.id));
  }

  async function copyToClipboard(value, field) {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(field);
      setTimeout(() => setCopiedField((f) => (f === field ? '' : f)), 1800);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  async function handleMarkPaid() {
    if (selectedOrderIds.length === 0 || processing) return;

    if (!eoBank) {
      setPayError('EO belum mengisi data rekening. Minta EO melengkapinya dulu sebelum mencairkan dana.');
      setConfirmStep(false);
      return;
    }

    setProcessing(true);
    setPayError('');
    try {
      await api.post('/payouts/mark-paid', {
        order_ids: selectedOrderIds,
        note,
      });
      notify('success', `${selectedOrderIds.length} order untuk ${selectedEo.eo_name} ditandai sudah dicairkan`);
      requestRef.current++;
      setSelectedEo(null);
      setConfirmStep(false);
      fetchSummary(true);
    } catch (err) {
      setPayError(err.response?.data?.message || 'Gagal memproses pencairan dana.');
      setConfirmStep(false);
    } finally {
      setProcessing(false);
    }
  }

  const selectedTotal = orders
    .filter((o) => selectedOrderIds.includes(o.id))
    .reduce((sum, o) => sum + Number(o.eo_payout_amount), 0);

  const totalUnpaidAll = summary.reduce((acc, curr) => acc + Number(curr.belum_cair || 0), 0);
  const totalPaidAll = summary.reduce((acc, curr) => acc + Number(curr.sudah_cair || 0), 0);
  const eoWaiting = summary.filter((eo) => eo.jumlah_order_belum_cair > 0).length;

  const counts = {
    all: summary.length,
    pending: eoWaiting,
    done: summary.length - eoWaiting,
  };

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return summary
      .filter((eo) => {
        const matches =
          !q ||
          eo.eo_name.toLowerCase().includes(q) ||
          (eo.eo_email || '').toLowerCase().includes(q);
        if (!matches) return false;
        const pending = eo.jumlah_order_belum_cair > 0;
        if (statusFilter === 'pending') return pending;
        if (statusFilter === 'done') return !pending;
        return true;
      })
      .sort((a, b) => {
        const ap = a.jumlah_order_belum_cair > 0 ? 1 : 0;
        const bp = b.jumlah_order_belum_cair > 0 ? 1 : 0;
        if (ap !== bp) return bp - ap;
        return Number(b.belum_cair || 0) - Number(a.belum_cair || 0);
      });
  }, [summary, searchQuery, statusFilter]);

  const isFiltering = !!searchQuery.trim() || statusFilter !== 'all';
  const allSelected = orders.length > 0 && selectedOrderIds.length === orders.length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Pencairan dana EO</h1>
          <p className="text-sm text-ink-400 mt-1">
            Transfer pendapatan tiket ke event organizer, lalu tandai order yang sudah dicairkan.
          </p>
        </header>

        {/* Summary */}
        {!loading && summary.length > 0 && (
          <div className="card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink-700 mb-6">
            <div className="p-4">
              <p className="text-xs text-ink-400">Menunggu dicairkan</p>
              <p className="text-xl font-bold text-amber-400 font-mono tabular-nums mt-1.5 leading-none">
                {formatRupiah(totalUnpaidAll)}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-ink-400">Sudah dicairkan</p>
              <p className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1.5 leading-none">
                {formatRupiah(totalPaidAll)}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-ink-400">EO yang menunggu</p>
              <p className="text-xl font-bold text-white font-mono tabular-nums mt-1.5 leading-none">
                {eoWaiting}
                <span className="text-sm font-normal text-ink-400"> dari {summary.length}</span>
              </p>
            </div>
          </div>
        )}

        {/* Search and filter */}
        {!loading && summary.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-md">
              <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                aria-label="Cari EO"
                placeholder="Cari nama atau email EO"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full input-field pl-10 bg-ink-800/40"
              />
            </div>
            <div className="flex gap-1 p-1 bg-ink-800/40 rounded-lg overflow-x-auto self-start">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  aria-pressed={statusFilter === tab.value}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    statusFilter === tab.value ? 'bg-flame-500 text-white' : 'text-ink-400 hover:text-white'
                  } ${focusRing}`}
                >
                  {tab.label}
                  <span className="ml-1.5 font-mono tabular-nums opacity-70">{counts[tab.value]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EO table */}
        {loading ? (
          <SkeletonTable />
        ) : summary.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-ink-800 flex items-center justify-center mb-4">
              <Icon name="bank" className="w-6 h-6 text-ink-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Belum ada saldo EO</h3>
            <p className="text-sm text-ink-400">Saldo muncul di sini setelah tiket dari konser EO terjual.</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-ink-800 flex items-center justify-center mb-4">
              <Icon name="search" className="w-6 h-6 text-ink-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">EO tidak ditemukan</h3>
            <p className="text-sm text-ink-400 mb-5">Ubah kata kunci atau filter status.</p>
            {isFiltering && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="btn-secondary"
              >
                Reset filter
              </button>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className={`hidden sm:grid ${tableCols} gap-4 px-5 py-3 border-b border-ink-700 text-xs text-ink-400`}>
              <span>Event organizer</span>
              <span className="text-right">Belum dicairkan</span>
              <span className="text-right">Sudah dicairkan</span>
              <span />
            </div>

            <ul className="divide-y divide-ink-700">
              {rows.map((eo) => {
                const hasUnpaid = eo.jumlah_order_belum_cair > 0;
                return (
                  <li
                    key={eo.eo_id}
                    className={`grid grid-cols-2 ${tableCols} gap-x-4 gap-y-3 items-center px-5 py-4 hover:bg-ink-800/40 transition-colors`}
                  >
                    <div className="col-span-2 sm:col-span-1 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-ink-200">
                          {eo.eo_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{eo.eo_name}</p>
                        <p className="text-xs text-ink-400 truncate">{eo.eo_email}</p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-ink-400 sm:hidden mb-1">Belum dicairkan</p>
                      <p
                        className={`font-semibold font-mono tabular-nums ${
                          hasUnpaid ? 'text-amber-400' : 'text-ink-400'
                        }`}
                      >
                        {formatRupiah(eo.belum_cair)}
                      </p>
                      {hasUnpaid && (
                        <p className="text-xs text-ink-400 mt-0.5">{eo.jumlah_order_belum_cair} order</p>
                      )}
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-ink-400 sm:hidden mb-1">Sudah dicairkan</p>
                      <p className="font-mono tabular-nums text-emerald-400">{formatRupiah(eo.sudah_cair)}</p>
                    </div>

                    <div className="col-span-2 sm:col-span-1 sm:text-right">
                      {hasUnpaid ? (
                        <button
                          onClick={() => openEo(eo)}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-flame-500 hover:bg-flame-600 active:scale-[0.98] text-white rounded-lg text-sm font-medium transition-all ${focusRing}`}
                        >
                          <Icon name="bank" className="w-4 h-4" />
                          Cairkan
                        </button>
                      ) : (
                        <span className="text-xs text-ink-400">Tidak ada tagihan</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Payout drawer */}
        <AnimatePresence>
          {selectedEo && (
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
                aria-labelledby="payout-title"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="fixed inset-y-0 right-0 z-[70] w-full max-w-xl"
              >
                <div className="card !rounded-none !border-y-0 !border-r-0 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 p-5 border-b border-ink-700">
                    <div className="min-w-0">
                      <h2 id="payout-title" className="font-semibold text-white truncate">
                        Cairkan dana untuk {selectedEo.eo_name}
                      </h2>
                      <p className="text-xs text-ink-400 mt-0.5 truncate">{selectedEo.eo_email}</p>
                    </div>
                    <button
                      onClick={closeDrawer}
                      disabled={processing}
                      aria-label="Tutup"
                      className={`p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors disabled:opacity-50 ${focusRing}`}
                    >
                      <Icon name="close" className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Bank account */}
                    {bankLoading ? (
                      <div className="animate-pulse rounded-xl border border-ink-700 p-4 space-y-2.5">
                        <div className="h-3 w-24 bg-ink-700 rounded" />
                        <div className="h-4 w-40 bg-ink-700 rounded" />
                        <div className="h-3 w-32 bg-ink-700 rounded" />
                      </div>
                    ) : eoBank ? (
                      <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                        <span className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Icon name="bank" className="w-[18px] h-[18px]" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-ink-400">Rekening tujuan</p>
                          <p className="font-semibold text-white mt-1">{eoBank.bank_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="font-mono text-sm text-ink-200 tracking-wider">{eoBank.account_number}</p>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(eoBank.account_number, 'account')}
                              className={`p-1 rounded text-ink-400 hover:text-white transition-colors ${focusRing}`}
                              aria-label="Salin nomor rekening"
                              title="Salin nomor rekening"
                            >
                              <Icon
                                name={copiedField === 'account' ? 'check' : 'copy'}
                                className={`w-3.5 h-3.5 ${copiedField === 'account' ? 'text-emerald-400' : ''}`}
                              />
                            </button>
                          </div>
                          <p className="text-xs text-ink-300 mt-1">a.n. {eoBank.account_holder}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                        <span className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                          <Icon name="alert" className="w-[18px] h-[18px]" />
                        </span>
                        <div>
                          <p className="font-semibold text-white text-sm">Rekening belum diisi</p>
                          <p className="text-xs text-ink-300 mt-1">
                            EO belum mengisi data rekening. Minta EO melengkapinya dulu sebelum kamu mencairkan dana.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Orders */}
                    {ordersLoading ? (
                      <div className="animate-pulse space-y-3" aria-hidden="true">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-ink-800/60 rounded-lg" />
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-14">
                        <div className="w-14 h-14 rounded-full bg-ink-800 flex items-center justify-center mx-auto mb-3">
                          <Icon name="receipt" className="w-6 h-6 text-ink-400" />
                        </div>
                        <p className="font-semibold text-white mb-1">Semua order sudah dicairkan</p>
                        <p className="text-sm text-ink-400">Tidak ada transaksi yang menunggu untuk EO ini.</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2.5 text-sm text-ink-200 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleAll}
                                disabled={confirmStep || processing}
                                className="rounded border-ink-700 text-flame-500 focus:ring-flame-500/20 bg-ink-900 w-4 h-4 cursor-pointer"
                              />
                              Pilih semua ({orders.length} order)
                            </label>
                            <span className="text-xs text-ink-400">
                              <span className="text-white font-mono tabular-nums">{selectedOrderIds.length}</span> dipilih
                            </span>
                          </div>

                          <ul className="rounded-xl border border-ink-700 divide-y divide-ink-700 overflow-hidden">
                            {orders.map((order) => {
                              const isSelected = selectedOrderIds.includes(order.id);
                              return (
                                <li key={order.id}>
                                  <label
                                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                                      isSelected ? 'bg-flame-500/[0.06]' : 'hover:bg-ink-800/40'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleOrder(order.id)}
                                      disabled={confirmStep || processing}
                                      className="rounded border-ink-700 text-flame-500 focus:ring-flame-500/20 bg-ink-900 w-4 h-4 mt-0.5 shrink-0 cursor-pointer"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-white truncate">{order.concert_name}</p>
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                        <span className="text-xs font-mono text-ink-300 bg-ink-800 px-1.5 py-0.5 rounded">
                                          {order.order_code}
                                        </span>
                                        <span className="text-xs text-ink-400 truncate">{order.customer_name}</span>
                                      </div>
                                      <p className="flex items-center gap-1.5 text-xs text-ink-400 mt-1.5">
                                        <Icon name="calendar" className="w-3 h-3" />
                                        Lunas {formatDate(order.paid_at)}
                                      </p>
                                    </div>
                                    <span className="text-sm font-semibold text-flame-400 font-mono tabular-nums shrink-0">
                                      {formatRupiah(order.eo_payout_amount)}
                                    </span>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div>
                          <label htmlFor="payout-note" className="block text-sm text-ink-200 mb-1.5">
                            Catatan transfer atau nomor referensi <span className="text-ink-400">(opsional)</span>
                          </label>
                          <textarea
                            id="payout-note"
                            rows={2}
                            disabled={confirmStep || processing}
                            className="w-full input-field bg-ink-800/40 resize-none"
                            placeholder="Contoh: Transfer BCA a.n Admin, Ref#982371923"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  {!ordersLoading && orders.length > 0 && (
                    <div className="p-4 border-t border-ink-700 space-y-3">
                      {payError && (
                        <div
                          role="alert"
                          className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                        >
                          <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                          {payError}
                        </div>
                      )}

                      {!confirmStep ? (
                        <>
                          <div className="flex items-center justify-between px-1">
                            <span className="text-sm text-ink-400">Total dipilih</span>
                            <span className="text-lg font-bold text-flame-400 font-mono tabular-nums">
                              {formatRupiah(selectedTotal)}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <button type="button" onClick={closeDrawer} className="btn-secondary">
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={selectedOrderIds.length === 0 || !eoBank}
                              onClick={() => {
                                setPayError('');
                                setConfirmStep(true);
                              }}
                              className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                            >
                              <Icon name="check" className="w-4 h-4" />
                              Cairkan {selectedOrderIds.length > 0 ? `${selectedOrderIds.length} order` : ''}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Receipt-style confirmation */}
                          <div className="rounded-xl border border-dashed border-ink-700 divide-y divide-dashed divide-ink-700 text-sm">
                            <div className="flex items-start justify-between gap-4 p-3.5">
                              <span className="text-ink-400 text-xs pt-0.5">Transfer ke</span>
                              <div className="text-right min-w-0">
                                <p className="text-white font-medium truncate">{selectedEo.eo_name}</p>
                                <p className="text-xs text-ink-300">{eoBank?.bank_name}</p>
                                <p className="text-xs font-mono text-ink-300 tracking-wider">{eoBank?.account_number}</p>
                                <p className="text-xs text-ink-400">a.n. {eoBank?.account_holder}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3.5">
                              <span className="text-ink-400 text-xs">Jumlah order</span>
                              <span className="text-white font-mono tabular-nums">{selectedOrderIds.length}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 p-3.5">
                              <span className="text-ink-400 text-xs">Total transfer</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-flame-400 font-mono tabular-nums">
                                  {formatRupiah(selectedTotal)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(selectedTotal, 'amount')}
                                  className={`p-1 rounded text-ink-400 hover:text-white transition-colors ${focusRing}`}
                                  aria-label="Salin nominal"
                                  title="Salin nominal"
                                >
                                  <Icon
                                    name={copiedField === 'amount' ? 'check' : 'copy'}
                                    className={`w-3.5 h-3.5 ${copiedField === 'amount' ? 'text-emerald-400' : ''}`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-ink-400 px-1">
                            Tandai hanya setelah uang benar-benar sudah kamu transfer. Status order akan berubah menjadi
                            sudah dicairkan, dan ini tidak bisa dibatalkan dari halaman ini.
                          </p>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setConfirmStep(false)}
                              disabled={processing}
                              className="btn-secondary"
                            >
                              Kembali
                            </button>
                            <button
                              type="button"
                              onClick={handleMarkPaid}
                              disabled={processing}
                              className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                            >
                              {processing ? (
                                <>
                                  <Spinner />
                                  Memproses...
                                </>
                              ) : (
                                'Tandai sudah dicairkan'
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
                className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium ${
                  toast.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <Icon name={toast.type === 'error' ? 'alert' : 'check'} className="w-4 h-4" />
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}