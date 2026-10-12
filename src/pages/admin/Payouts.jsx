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

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60';
const tableCols = 'sm:grid-cols-[minmax(0,1fr)_10rem_10rem_9rem]';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Needs payout' },
  { value: 'done', label: 'Settled' },
];

function SkeletonTable() {
  return (
    <div className="bg-white border border-amber-200/60 rounded-2xl animate-pulse" aria-hidden="true">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 p-5 border-t first:border-t-0 border-amber-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100" />
            <div className="space-y-2">
              <div className="h-3 w-36 bg-amber-100 rounded" />
              <div className="h-3 w-48 bg-amber-100 rounded" />
            </div>
          </div>
          <div className="h-4 w-24 bg-amber-100 rounded" />
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

  // EO bank account
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
          // 404 = EO has not added a bank account yet, treat as null
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
      notify('error', 'Failed to load EO data.');
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
      setPayError('The EO has not filled in their bank account details. Ask the EO to complete them before paying out.');
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
      notify('success', `${selectedOrderIds.length} orders for ${selectedEo.eo_name} marked as paid out`);
      requestRef.current++;
      setSelectedEo(null);
      setConfirmStep(false);
      fetchSummary(true);
    } catch (err) {
      setPayError(err.response?.data?.message || 'Failed to process the payout.');
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
      <div className="min-h-screen bg-[#f5ede4] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-6">
            <h1 className="font-serif text-2xl font-bold text-amber-950">EO Payouts</h1>
            <p className="font-serif text-sm text-amber-700/70 mt-1">
              Transfer ticket revenue to event organizers, then mark the orders as paid out.
            </p>
          </header>

          {/* Summary */}
          {!loading && summary.length > 0 && (
            <div className="bg-white border border-amber-200/60 rounded-2xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-200/60 mb-6">
              <div className="p-4">
                <p className="font-serif text-xs text-amber-700/70">Awaiting payout</p>
                <p className="font-serif text-xl font-bold text-amber-700 font-mono tabular-nums mt-1.5 leading-none">
                  {formatRupiah(totalUnpaidAll)}
                </p>
              </div>
              <div className="p-4">
                <p className="font-serif text-xs text-amber-700/70">Paid out</p>
                <p className="font-serif text-xl font-bold text-emerald-700 font-mono tabular-nums mt-1.5 leading-none">
                  {formatRupiah(totalPaidAll)}
                </p>
              </div>
              <div className="p-4">
                <p className="font-serif text-xs text-amber-700/70">EOs waiting</p>
                <p className="font-serif text-xl font-bold text-amber-950 font-mono tabular-nums mt-1.5 leading-none">
                  {eoWaiting}
                  <span className="text-sm font-normal text-amber-700/60"> of {summary.length}</span>
                </p>
              </div>
            </div>
          )}

          {/* Search and filter */}
          {!loading && summary.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  aria-label="Search EO"
                  placeholder="Search EO name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                />
              </div>
              <div className="flex gap-1 p-1 bg-white border border-amber-200/60 rounded-xl overflow-x-auto self-start">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    aria-pressed={statusFilter === tab.value}
                    className={`px-3 py-1.5 rounded-lg font-serif text-xs whitespace-nowrap transition-colors ${
                      statusFilter === tab.value
                        ? 'bg-amber-800 text-amber-50'
                        : 'text-amber-700/70 hover:text-amber-900'
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
            <div className="bg-white border border-amber-200/60 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                <Icon name="bank" className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-serif font-semibold text-amber-950 mb-1">No EO balance yet</h3>
              <p className="font-serif text-sm text-amber-700/70">Balances will appear here once tickets from an EO's concert are sold.</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-white border border-amber-200/60 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                <Icon name="search" className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-serif font-semibold text-amber-950 mb-1">No EO found</h3>
              <p className="font-serif text-sm text-amber-700/70 mb-5">Change the keyword or status filter.</p>
              {isFiltering && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors"
                >
                  Reset filter
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden">
              <div className={`hidden sm:grid ${tableCols} gap-4 px-5 py-3 border-b border-amber-200/60 font-serif text-xs text-amber-700/70`}>
                <span>Event organizer</span>
                <span className="text-right">Unpaid</span>
                <span className="text-right">Paid out</span>
                <span />
              </div>

              <ul className="divide-y divide-amber-200/60">
                {rows.map((eo) => {
                  const hasUnpaid = eo.jumlah_order_belum_cair > 0;
                  return (
                    <li
                      key={eo.eo_id}
                      className={`grid grid-cols-2 ${tableCols} gap-x-4 gap-y-3 items-center px-5 py-4 hover:bg-amber-50/60 transition-colors`}
                    >
                      <div className="col-span-2 sm:col-span-1 flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-amber-800 flex items-center justify-center shrink-0">
                          <span className="font-serif text-sm font-semibold text-amber-50">
                            {eo.eo_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-medium text-amber-950 truncate">{eo.eo_name}</p>
                          <p className="font-serif text-xs text-amber-700/60 truncate">{eo.eo_email}</p>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="font-serif text-xs text-amber-700/60 sm:hidden mb-1">Unpaid</p>
                        <p
                          className={`font-serif font-semibold font-mono tabular-nums ${
                            hasUnpaid ? 'text-amber-700' : 'text-amber-700/50'
                          }`}
                        >
                          {formatRupiah(eo.belum_cair)}
                        </p>
                        {hasUnpaid && (
                          <p className="font-serif text-xs text-amber-700/60 mt-0.5">{eo.jumlah_order_belum_cair} orders</p>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <p className="font-serif text-xs text-amber-700/60 sm:hidden mb-1">Paid out</p>
                        <p className="font-serif font-mono tabular-nums text-emerald-700">{formatRupiah(eo.sudah_cair)}</p>
                      </div>

                      <div className="col-span-2 sm:col-span-1 sm:text-right">
                        {hasUnpaid ? (
                          <button
                            onClick={() => openEo(eo)}
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-amber-800 hover:bg-amber-700 active:scale-[0.98] text-amber-50 rounded-lg font-serif text-sm font-medium transition-all ${focusRing}`}
                          >
                            <Icon name="bank" className="w-4 h-4" />
                            Pay out
                          </button>
                        ) : (
                          <span className="font-serif text-xs text-amber-700/60">No outstanding balance</span>
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
                  className="fixed inset-0 bg-amber-950/50 z-[60]"
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
                  <div className="bg-white !rounded-none !border-y-0 !border-r-0 h-full flex flex-col border-l border-amber-200/60 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 p-5 border-b border-amber-200/60">
                      <div className="min-w-0">
                        <h2 id="payout-title" className="font-serif font-semibold text-amber-950 truncate">
                          Pay out funds to {selectedEo.eo_name}
                        </h2>
                        <p className="font-serif text-xs text-amber-700/70 mt-0.5 truncate">{selectedEo.eo_email}</p>
                      </div>
                      <button
                        onClick={closeDrawer}
                        disabled={processing}
                        aria-label="Close"
                        className={`p-1.5 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors disabled:opacity-50 ${focusRing}`}
                      >
                        <Icon name="close" className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      {/* Bank account */}
                      {bankLoading ? (
                        <div className="animate-pulse rounded-xl border border-amber-200/60 p-4 space-y-2.5">
                          <div className="h-3 w-24 bg-amber-100 rounded" />
                          <div className="h-4 w-40 bg-amber-100 rounded" />
                          <div className="h-3 w-32 bg-amber-100 rounded" />
                        </div>
                      ) : eoBank ? (
                        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200/60 bg-emerald-50">
                          <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Icon name="bank" className="w-[18px] h-[18px]" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-xs text-amber-700/70">Destination account</p>
                            <p className="font-serif font-semibold text-amber-950 mt-1">{eoBank.bank_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="font-mono text-sm text-amber-800 tracking-wider">{eoBank.account_number}</p>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(eoBank.account_number, 'account')}
                                className={`p-1 rounded text-amber-600 hover:text-amber-900 transition-colors ${focusRing}`}
                                aria-label="Copy account number"
                                title="Copy account number"
                              >
                                <Icon
                                  name={copiedField === 'account' ? 'check' : 'copy'}
                                  className={`w-3.5 h-3.5 ${copiedField === 'account' ? 'text-emerald-600' : ''}`}
                                />
                              </button>
                            </div>
                            <p className="font-serif text-xs text-amber-800/80 mt-1">a.n. {eoBank.account_holder}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200/60 bg-amber-50">
                          <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Icon name="alert" className="w-[18px] h-[18px]" />
                          </span>
                          <div>
                            <p className="font-serif font-semibold text-amber-950 text-sm">Bank account not set</p>
                            <p className="font-serif text-xs text-amber-800/80 mt-1">
                              The EO has not added bank account details. Ask the EO to complete them before you pay out.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Orders */}
                      {ordersLoading ? (
                        <div className="animate-pulse space-y-3" aria-hidden="true">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-amber-100 rounded-lg" />
                          ))}
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-14">
                          <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mx-auto mb-3">
                            <Icon name="receipt" className="w-6 h-6 text-amber-600" />
                          </div>
                          <p className="font-serif font-semibold text-amber-950 mb-1">All orders have been paid out</p>
                          <p className="font-serif text-sm text-amber-700/70">There are no transactions waiting for this EO.</p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="flex items-center gap-2.5 font-serif text-sm text-amber-900 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={toggleAll}
                                  disabled={confirmStep || processing}
                                  className="rounded border-amber-300 text-amber-700 focus:ring-amber-500/20 bg-white w-4 h-4 cursor-pointer"
                                />
                                Select all ({orders.length} orders)
                              </label>
                              <span className="font-serif text-xs text-amber-700/60">
                                <span className="text-amber-950 font-mono tabular-nums">{selectedOrderIds.length}</span> selected
                              </span>
                            </div>

                            <ul className="rounded-xl border border-amber-200/60 divide-y divide-amber-200/60 overflow-hidden">
                              {orders.map((order) => {
                                const isSelected = selectedOrderIds.includes(order.id);
                                return (
                                  <li key={order.id}>
                                    <label
                                      className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                                        isSelected ? 'bg-amber-50' : 'hover:bg-amber-50/60'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleOrder(order.id)}
                                        disabled={confirmStep || processing}
                                        className="rounded border-amber-300 text-amber-700 focus:ring-amber-500/20 bg-white w-4 h-4 mt-0.5 shrink-0 cursor-pointer"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-serif text-sm font-medium text-amber-950 truncate">{order.concert_name}</p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                          <span className="font-mono text-xs text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200/60">
                                            {order.order_code}
                                          </span>
                                          <span className="font-serif text-xs text-amber-700/70 truncate">{order.customer_name}</span>
                                        </div>
                                        <p className="flex items-center gap-1.5 font-serif text-xs text-amber-700/60 mt-1.5">
                                          <Icon name="calendar" className="w-3 h-3" />
                                          Paid {formatDate(order.paid_at)}
                                        </p>
                                      </div>
                                      <span className="font-serif text-sm font-semibold text-amber-700 font-mono tabular-nums shrink-0">
                                        {formatRupiah(order.eo_payout_amount)}
                                      </span>
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          <div>
                            <label htmlFor="payout-note" className="block font-serif text-sm text-amber-900 mb-1.5">
                              Transfer note or reference number <span className="text-amber-700/60">(optional)</span>
                            </label>
                            <textarea
                              id="payout-note"
                              rows={2}
                              disabled={confirmStep || processing}
                              className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all resize-none"
                              placeholder="Example: BCA transfer a.n Admin, Ref#982371923"
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Footer */}
                    {!ordersLoading && orders.length > 0 && (
                      <div className="p-4 border-t border-amber-200/60 space-y-3">
                        {payError && (
                          <div
                            role="alert"
                            className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200/60 text-red-700 font-serif text-sm"
                          >
                            <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                            {payError}
                          </div>
                        )}

                        {!confirmStep ? (
                          <>
                            <div className="flex items-center justify-between px-1">
                              <span className="font-serif text-sm text-amber-700/70">Selected total</span>
                              <span className="font-serif text-lg font-bold text-amber-700 font-mono tabular-nums">
                                {formatRupiah(selectedTotal)}
                              </span>
                            </div>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={closeDrawer}
                                className="px-4 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={selectedOrderIds.length === 0 || !eoBank}
                                onClick={() => {
                                  setPayError('');
                                  setConfirmStep(true);
                                }}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm rounded-xl transition-colors"
                              >
                                <Icon name="check" className="w-4 h-4" />
                                Pay out {selectedOrderIds.length > 0 ? `${selectedOrderIds.length} orders` : ''}
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Receipt-style confirmation */}
                            <div className="rounded-xl border border-dashed border-amber-200/60 divide-y divide-dashed divide-amber-200/60 font-serif text-sm">
                              <div className="flex items-start justify-between gap-4 p-3.5">
                                <span className="text-amber-700/70 text-xs pt-0.5">Transfer to</span>
                                <div className="text-right min-w-0">
                                  <p className="text-amber-950 font-medium truncate">{selectedEo.eo_name}</p>
                                  <p className="text-xs text-amber-800/80">{eoBank?.bank_name}</p>
                                  <p className="text-xs font-mono text-amber-800/80 tracking-wider">{eoBank?.account_number}</p>
                                  <p className="text-xs text-amber-700/70">a.n. {eoBank?.account_holder}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3.5">
                                <span className="text-amber-700/70 text-xs">Number of orders</span>
                                <span className="text-amber-950 font-mono tabular-nums">{selectedOrderIds.length}</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 p-3.5">
                                <span className="text-amber-700/70 text-xs">Transfer total</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-amber-700 font-mono tabular-nums">
                                    {formatRupiah(selectedTotal)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(selectedTotal, 'amount')}
                                    className={`p-1 rounded text-amber-600 hover:text-amber-900 transition-colors ${focusRing}`}
                                    aria-label="Copy amount"
                                    title="Copy amount"
                                  >
                                    <Icon
                                      name={copiedField === 'amount' ? 'check' : 'copy'}
                                      className={`w-3.5 h-3.5 ${copiedField === 'amount' ? 'text-emerald-600' : ''}`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <p className="font-serif text-xs text-amber-700/70 px-1">
                              Mark this only after you have actually transferred the money. The order status will change to
                              paid out, and this cannot be undone from this page.
                            </p>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => setConfirmStep(false)}
                                disabled={processing}
                                className="px-4 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors"
                              >
                                Back
                              </button>
                              <button
                                type="button"
                                onClick={handleMarkPaid}
                                disabled={processing}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm rounded-xl transition-colors"
                              >
                                {processing ? (
                                  <>
                                    <Spinner />
                                    Processing...
                                  </>
                                ) : (
                                  'Mark as paid out'
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
                  className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg border font-serif text-sm font-medium ${
                    toast.type === 'error'
                      ? 'bg-red-50 border-red-200/60 text-red-700'
                      : 'bg-emerald-50 border-emerald-200/60 text-emerald-700'
                  }`}
                >
                  <Icon name={toast.type === 'error' ? 'alert' : 'check'} className="w-4 h-4" />
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