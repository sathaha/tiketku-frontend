import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  bank: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3',
  check: 'M5 13l4 4L19 7',
  close: 'M6 18L18 6M6 6l12 12',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  receipt: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name] || ICON_PATHS.alert} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin motion-reduce:animate-none ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const panel = 'bg-white rounded-2xl shadow-sm shadow-amber-950/5';
const ticketShadow = 'rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)]';
const tableCols = 'sm:grid-cols-[minmax(0,1fr)_10rem_10rem_9rem]';

const inputCls =
  'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-60';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .ticket-card {
    --stub-h: 4.5rem;
    -webkit-mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }
`;

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Needs payout' },
  { value: 'done', label: 'Settled' },
];

/* ============ SMALL COMPONENTS ============ */
function Bone({ className = '' }) {
  return <div className={`bg-amber-100 rounded ${className}`} />;
}

function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${focusRing} ${
        active ? 'bg-amber-950 text-amber-50' : 'bg-white text-amber-800 hover:text-amber-950 hover:bg-amber-50'
      }`}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${active ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'}`}>
        {count}
      </span>
    </button>
  );
}

function EmptyState({ icon, title, children }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">{title}</h3>
      {children}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading payouts">
      <div className={ticketShadow}>
        <div className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)]">
          <div className="p-6 space-y-4">
            <Bone className="h-3 w-28" />
            <Bone className="h-12 w-72 max-w-full" />
          </div>
          <div className="border-t border-dashed border-amber-300/80 bg-amber-50 px-6 flex items-center gap-8">
            <Bone className="h-8 w-28" />
            <Bone className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className={`${panel} overflow-hidden`}>
        <div className="px-6 py-3.5 bg-amber-950">
          <div className="h-3 w-32 bg-amber-900 rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-6 py-4 border-t first:border-t-0 border-dashed border-amber-200">
            <div className="flex items-center gap-3">
              <Bone className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-2">
                <Bone className="h-3 w-36" />
                <Bone className="h-3 w-48 max-w-full" />
              </div>
            </div>
            <Bone className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyButton({ copied, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`p-1 rounded text-amber-600 hover:text-amber-900 transition-colors ${focusRing}`}
    >
      <Icon name={copied ? 'check' : 'copy'} className={`w-3.5 h-3.5 ${copied ? 'text-emerald-600' : ''}`} />
    </button>
  );
}

/* ============ MAIN ============ */
export default function Payouts() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
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
  const copyTimer = useRef(null);

  const notify = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() });
  }, []);

  const fetchSummary = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await api.get('/payouts/summary');
        setSummary(res.data);
        setLoadError(false);
      } catch (err) {
        console.error('Failed to fetch payout summary:', err);
        if (silent) notify('error', "Couldn't refresh the payout list.");
        else setLoadError(true);
      } finally {
        setLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  function closeDrawer() {
    if (processing) return;
    requestRef.current++;
    setSelectedEo(null);
    setConfirmStep(false);
    setPayError('');
  }

  useEffect(() => {
    if (!selectedEo) return undefined;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEo, processing]);

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
          // 404 = EO belum mengisi rekening, anggap null
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
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedField(''), 1800);
    } catch (err) {
      console.error('Copy failed:', err);
      notify('error', "Couldn't copy to the clipboard.");
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
  const hasData = !loading && summary.length > 0;

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* ===== HEADER ===== */}
          <header className="mb-6">
            <h1 className="f-display text-3xl font-bold text-amber-950">EO Payouts</h1>
            <p className="text-sm text-amber-700/80 mt-1">
              Transfer ticket revenue to event organizers, then mark the orders as paid out.
            </p>
          </header>

          {/* ===== SUMMARY: tiket dengan stub ===== */}
          {hasData && (
            <div className={`${ticketShadow} mb-6`}>
              <div className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)]">
                <div className="p-6 min-w-0">
                  <p className="text-sm text-amber-700/80">Awaiting payout</p>
                  <p className="mt-2 f-display text-4xl sm:text-5xl font-semibold text-amber-700 tabular-nums tracking-tight break-words">
                    {formatRupiah(totalUnpaidAll)}
                  </p>
                </div>

                <div className="border-t border-dashed border-amber-300/80 bg-amber-50 grid grid-cols-2 divide-x divide-dashed divide-amber-300/80">
                  <div className="px-6 flex flex-col justify-center min-w-0">
                    <p className="text-xs text-amber-700/80">Paid out</p>
                    <p className="f-display text-base font-semibold text-emerald-700 tabular-nums truncate">
                      {formatRupiah(totalPaidAll)}
                    </p>
                  </div>
                  <div className="px-6 flex flex-col justify-center min-w-0">
                    <p className="text-xs text-amber-700/80">EOs waiting</p>
                    <p className="f-display text-base font-semibold text-amber-950 tabular-nums">
                      {eoWaiting}
                      <span className="text-sm font-normal text-amber-700/70"> of {summary.length}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SEARCH + FILTER ===== */}
          {hasData && (
            <div className="space-y-3 mb-6">
              <div className="relative max-w-md">
                <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  aria-label="Search EO"
                  placeholder="Search EO name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <FilterChip
                    key={tab.value}
                    label={tab.label}
                    active={statusFilter === tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    count={counts[tab.value]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ===== EO LIST ===== */}
          {loading ? (
            <SkeletonLoader />
          ) : loadError ? (
            <EmptyState icon="alert" title="Couldn't load payouts">
              <p className="text-sm text-amber-800/80 mb-5">Check your connection, then try again.</p>
              <button
                type="button"
                onClick={() => fetchSummary()}
                className={`px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
              >
                Try again
              </button>
            </EmptyState>
          ) : summary.length === 0 ? (
            <EmptyState icon="bank" title="No EO balance yet">
              <p className="text-sm text-amber-800/80">Balances will appear here once tickets from an EO's concert are sold.</p>
            </EmptyState>
          ) : rows.length === 0 ? (
            <EmptyState icon="search" title="No EO found">
              <p className="text-sm text-amber-800/80 mb-5">Change the keyword or status filter.</p>
              {isFiltering && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className={`px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                >
                  Reset filter
                </button>
              )}
            </EmptyState>
          ) : (
            <div className={`${panel} overflow-hidden`}>
              <div className={`hidden sm:grid ${tableCols} gap-4 px-6 py-3.5 bg-amber-950 text-xs font-medium text-amber-200`}>
                <span>Event organizer</span>
                <span className="text-right">Unpaid</span>
                <span className="text-right">Paid out</span>
                <span />
              </div>

              <ul className="divide-y divide-dashed divide-amber-200">
                {rows.map((eo) => {
                  const hasUnpaid = eo.jumlah_order_belum_cair > 0;
                  return (
                    <li
                      key={eo.eo_id}
                      className={`grid grid-cols-2 ${tableCols} gap-x-4 gap-y-3 items-center px-6 py-4 hover:bg-amber-50/60 transition-colors`}
                    >
                      <div className="col-span-2 sm:col-span-1 flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-amber-800 flex items-center justify-center shrink-0" aria-hidden="true">
                          <span className="f-display text-sm font-semibold text-amber-50">
                            {eo.eo_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="f-display font-semibold text-amber-950 truncate">{eo.eo_name}</p>
                          <p className="text-xs text-amber-700/70 truncate">{eo.eo_email}</p>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs text-amber-700/70 sm:hidden mb-1">Unpaid</p>
                        <p className={`f-display font-semibold tabular-nums ${hasUnpaid ? 'text-amber-700' : 'text-amber-700/50'}`}>
                          {formatRupiah(eo.belum_cair)}
                        </p>
                        {hasUnpaid && (
                          <p className="text-xs text-amber-700/70 mt-0.5">{eo.jumlah_order_belum_cair} orders</p>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs text-amber-700/70 sm:hidden mb-1">Paid out</p>
                        <p className="f-display font-semibold tabular-nums text-emerald-700">{formatRupiah(eo.sudah_cair)}</p>
                      </div>

                      <div className="col-span-2 sm:col-span-1 sm:text-right">
                        {hasUnpaid ? (
                          <button
                            type="button"
                            onClick={() => openEo(eo)}
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-amber-800 hover:bg-amber-700 text-amber-50 rounded-lg text-sm font-medium transition-colors ${focusRing}`}
                          >
                            <Icon name="bank" className="w-4 h-4" />
                            Pay out
                          </button>
                        ) : (
                          <span className="text-xs text-amber-700/70">No outstanding balance</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* ===== PAYOUT DRAWER ===== */}
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
                  className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-[60]"
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
                  <div className="f-body bg-white h-full flex flex-col shadow-2xl shadow-amber-950/30">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 px-6 py-4 bg-amber-950 text-amber-50">
                      <div className="min-w-0">
                        <h2 id="payout-title" className="f-display text-xl font-semibold truncate">
                          Pay out funds to {selectedEo.eo_name}
                        </h2>
                        <p className="text-xs text-amber-200/70 mt-0.5 truncate">{selectedEo.eo_email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={closeDrawer}
                        disabled={processing}
                        aria-label="Close"
                        className={`-mr-1.5 p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors disabled:opacity-50 ${focusRing}`}
                      >
                        <Icon name="close" className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                      {/* Bank account */}
                      {bankLoading ? (
                        <div className="animate-pulse rounded-xl bg-amber-50 p-4 space-y-2.5">
                          <Bone className="h-3 w-24 bg-amber-100" />
                          <Bone className="h-4 w-40 bg-amber-100" />
                          <Bone className="h-3 w-32 bg-amber-100" />
                        </div>
                      ) : eoBank ? (
                        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200/60 bg-emerald-50">
                          <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Icon name="bank" className="w-[18px] h-[18px]" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-amber-700/80">Destination account</p>
                            <p className="f-display font-semibold text-amber-950 mt-1">{eoBank.bank_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-sm text-amber-800 tabular-nums tracking-wider">{eoBank.account_number}</p>
                              <CopyButton
                                copied={copiedField === 'account'}
                                onClick={() => copyToClipboard(eoBank.account_number, 'account')}
                                label="Copy account number"
                              />
                            </div>
                            <p className="text-xs text-amber-800/80 mt-1">a.n. {eoBank.account_holder}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
                          <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Icon name="alert" className="w-[18px] h-[18px]" />
                          </span>
                          <div>
                            <p className="f-display font-semibold text-amber-950">Bank account not set</p>
                            <p className="text-xs text-amber-800/80 mt-1">
                              The EO has not added bank account details. Ask the EO to complete them before you pay out.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Orders */}
                      {ordersLoading ? (
                        <div className="animate-pulse space-y-3" role="status" aria-label="Loading orders">
                          {[...Array(3)].map((_, i) => (
                            <Bone key={i} className="h-16 rounded-xl" />
                          ))}
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-10 text-center">
                          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3 text-amber-600">
                            <Icon name="receipt" className="w-6 h-6" />
                          </div>
                          <p className="f-display text-lg font-semibold text-amber-950 mb-1">All orders have been paid out</p>
                          <p className="text-sm text-amber-800/80">There are no transactions waiting for this EO.</p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="flex items-center gap-2.5 text-sm text-amber-900 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={toggleAll}
                                  disabled={confirmStep || processing}
                                  className="rounded border-amber-300 text-amber-700 accent-amber-800 focus:ring-amber-500/20 bg-white w-4 h-4 cursor-pointer"
                                />
                                Select all ({orders.length} orders)
                              </label>
                              <span className="text-xs text-amber-700/80">
                                <span className="text-amber-950 font-medium tabular-nums">{selectedOrderIds.length}</span> selected
                              </span>
                            </div>

                            <ul className="rounded-xl border border-dashed border-amber-200 divide-y divide-dashed divide-amber-200 overflow-hidden">
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
                                        className="rounded border-amber-300 text-amber-700 accent-amber-800 focus:ring-amber-500/20 bg-white w-4 h-4 mt-0.5 shrink-0 cursor-pointer"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="f-display text-sm font-semibold text-amber-950 truncate">{order.concert_name}</p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                          <span className="text-[11px] text-amber-800 tabular-nums bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                            {order.order_code}
                                          </span>
                                          <span className="text-xs text-amber-700/80 truncate">{order.customer_name}</span>
                                        </div>
                                        <p className="flex items-center gap-1.5 text-xs text-amber-700/70 mt-1.5">
                                          <Icon name="calendar" className="w-3 h-3" />
                                          Paid {formatDate(order.paid_at)}
                                        </p>
                                      </div>
                                      <span className="f-display text-sm font-semibold text-amber-700 tabular-nums shrink-0">
                                        {formatRupiah(order.eo_payout_amount)}
                                      </span>
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          <div>
                            <label htmlFor="payout-note" className="block text-sm font-medium text-amber-900 mb-1.5">
                              Transfer note or reference number <span className="font-normal text-amber-700/70">(optional)</span>
                            </label>
                            <textarea
                              id="payout-note"
                              rows={2}
                              disabled={confirmStep || processing}
                              className={`${inputCls} resize-none`}
                              placeholder="Example: BCA transfer a.n Admin, Ref#982371923"
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Footer (stub) */}
                    {!ordersLoading && orders.length > 0 && (
                      <div className="p-4 border-t border-dashed border-amber-300/80 bg-amber-50 space-y-3">
                        {payError && (
                          <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                            <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                            {payError}
                          </div>
                        )}

                        {!confirmStep ? (
                          <>
                            <div className="flex items-center justify-between px-1">
                              <span className="text-sm text-amber-700/80">Selected total</span>
                              <span className="f-display text-xl font-semibold text-amber-700 tabular-nums">
                                {formatRupiah(selectedTotal)}
                              </span>
                            </div>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={closeDrawer}
                                className={`px-4 py-2.5 bg-white hover:bg-amber-100 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
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
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                              >
                                <Icon name="check" className="w-4 h-4" />
                                Pay out {selectedOrderIds.length > 0 ? `${selectedOrderIds.length} orders` : ''}
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Konfirmasi bergaya struk */}
                            <div className="rounded-xl bg-white border border-dashed border-amber-300/80 divide-y divide-dashed divide-amber-200 text-sm">
                              <div className="flex items-start justify-between gap-4 p-3.5">
                                <span className="text-amber-700/80 text-xs pt-0.5">Transfer to</span>
                                <div className="text-right min-w-0">
                                  <p className="text-amber-950 font-medium truncate">{selectedEo.eo_name}</p>
                                  <p className="text-xs text-amber-800/80">{eoBank?.bank_name}</p>
                                  <p className="text-xs text-amber-800/80 tabular-nums tracking-wider">{eoBank?.account_number}</p>
                                  <p className="text-xs text-amber-700/80">a.n. {eoBank?.account_holder}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3.5">
                                <span className="text-amber-700/80 text-xs">Number of orders</span>
                                <span className="text-amber-950 font-medium tabular-nums">{selectedOrderIds.length}</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 p-3.5">
                                <span className="text-amber-700/80 text-xs">Transfer total</span>
                                <div className="flex items-center gap-2">
                                  <span className="f-display text-lg font-semibold text-amber-700 tabular-nums">
                                    {formatRupiah(selectedTotal)}
                                  </span>
                                  <CopyButton
                                    copied={copiedField === 'amount'}
                                    onClick={() => copyToClipboard(selectedTotal, 'amount')}
                                    label="Copy amount"
                                  />
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-amber-700/80 px-1">
                              Mark this only after you have actually transferred the money. The order status will change to
                              paid out, and this cannot be undone from this page.
                            </p>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => setConfirmStep(false)}
                                disabled={processing}
                                className={`px-4 py-2.5 bg-white hover:bg-amber-100 text-amber-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${focusRing}`}
                              >
                                Back
                              </button>
                              <button
                                type="button"
                                onClick={handleMarkPaid}
                                disabled={processing}
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                              >
                                {processing ? (
                                  <>
                                    <Spinner />
                                    Processing…
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

          {/* ===== TOAST ===== */}
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
                  <Icon
                    name={toast.type === 'error' ? 'alert' : 'check'}
                    className={`w-4 h-4 ${toast.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
                  />
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