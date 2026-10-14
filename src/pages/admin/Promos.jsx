import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  plus: 'M12 4v16m8-8H4',
  close: 'M6 18L18 6M6 6l12 12',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  check: 'M5 13l4 4L19 7',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin motion-reduce:animate-none ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const panel = 'bg-white rounded-2xl shadow-sm shadow-amber-950/5';
const ticketShadow = 'rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_8px_16px_rgba(69,26,3,0.16)] transition-[filter] duration-200';

const inputCls =
  'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';
const labelCls = 'block text-sm font-medium text-amber-900 mb-1.5';

/* Lubang tiket dipotong dengan mask, jadi aman di background apa pun. */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .ticket-notch { -webkit-mask: ${notch}; mask: ${notch}; }
  @media (min-width: 640px) {
    .ticket-notch-sm { -webkit-mask: ${notch}; mask: ${notch}; }
  }
`;

/* ============ CONSTANTS & HELPERS ============ */
const emptyForm = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  quota: '',
  valid_from: '',
  valid_until: '',
};

const SAMPLE_PRICE = 500000;

const statusMeta = {
  active: { label: 'Active', text: 'text-emerald-700', dot: 'bg-emerald-500', stub: 'text-amber-700' },
  scheduled: { label: 'Scheduled', text: 'text-blue-700', dot: 'bg-blue-500', stub: 'text-blue-700' },
  usedUp: { label: 'Quota exhausted', text: 'text-orange-700', dot: 'bg-orange-500', stub: 'text-orange-700' },
  expired: { label: 'Expired', text: 'text-amber-700', dot: 'bg-amber-500', stub: 'text-amber-700' },
  inactive: { label: 'Inactive', text: 'text-amber-700/60', dot: 'bg-amber-500/60', stub: 'text-amber-700/60' },
};

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ended', label: 'Ended' },
  { value: 'inactive', label: 'Inactive' },
];

function getStatus(p) {
  if (!p.is_active) return 'inactive';
  const now = new Date();
  const end = p.valid_until ? new Date(p.valid_until) : null;
  if (end) end.setHours(23, 59, 59, 999);
  const start = p.valid_from ? new Date(p.valid_from) : null;
  if (start) start.setHours(0, 0, 0, 0);
  if (end && end < now) return 'expired';
  if ((p.used || 0) >= p.quota) return 'usedUp';
  if (start && start > now) return 'scheduled';
  return 'active';
}

function discountLabel(type, value) {
  if (value === '' || value == null || Number.isNaN(Number(value))) return '-';
  return type === 'percentage'
    ? `${Number(value)}%`
    : `Rp${Number(value).toLocaleString('id-ID')}`;
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

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

function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-emerald-500' : 'bg-amber-300'
      } ${focusRing}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </button>
  );
}

function PromoRow({ promo, status, processing, confirming, deleting, onEdit, onToggle, onAskDelete, onCancelDelete, onDelete }) {
  const meta = statusMeta[status];
  const used = promo.used || 0;
  const pct = promo.quota > 0 ? Math.min(Math.round((used / promo.quota) * 100), 100) : 0;
  const label = discountLabel(promo.discount_type, promo.discount_value);
  const dimmed = status === 'inactive' ? 'opacity-60' : '';

  return (
    <li className={ticketShadow}>
      <div
        className="ticket-notch-sm bg-white rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_var(--stub)]"
        style={{ '--stub': '10rem' }}
      >
        <div className="p-5 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className={`min-w-0 ${dimmed}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span
                  className={`px-2.5 py-1 rounded-md font-mono font-bold text-sm border ${
                    status === 'active'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-white text-amber-900 border-amber-200'
                  }`}
                >
                  {promo.code}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-xs font-medium ${meta.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              </div>
              {promo.description && <p className="text-sm text-amber-800/80 mt-2">{promo.description}</p>}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Switch
                checked={!!promo.is_active}
                disabled={processing}
                onChange={onToggle}
                label={promo.is_active ? `Deactivate ${promo.code}` : `Activate ${promo.code}`}
              />
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Edit ${promo.code}`}
                title="Edit promo"
                className={`p-2 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors ${focusRing}`}
              >
                <Icon name="edit" className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onAskDelete}
                aria-label={`Delete ${promo.code}`}
                title="Delete promo"
                className={`p-2 rounded-lg text-amber-500 hover:text-red-600 hover:bg-red-50 transition-colors ${focusRing}`}
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={dimmed}>
            <p className="flex items-center gap-1.5 text-xs text-amber-700/80 mt-3">
              <Icon name="calendar" className="w-3.5 h-3.5 text-amber-500" />
              {formatDate(promo.valid_from)} to {formatDate(promo.valid_until)}
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-amber-700/80 mb-1.5">
                <span>
                  Used <span className="text-amber-950 font-medium tabular-nums">{used}</span> of{' '}
                  <span className="tabular-nums">{promo.quota}</span>
                </span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div
                className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Quota usage"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 motion-reduce:transition-none ${
                    pct >= 100 ? 'bg-orange-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {confirming && (
            <div
              role="alert"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-3.5 py-3"
            >
              <p className="text-sm text-red-700">
                Delete <span className="font-semibold">{promo.code}</span>?{' '}
                {used > 0
                  ? `It has been used ${used} times, deactivating it is safer.`
                  : 'This action cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancelDelete}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors ${focusRing}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60 inline-flex items-center gap-1.5 ${focusRing}`}
                >
                  {deleting && <Spinner className="h-3 w-3" />}
                  Delete promo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stub */}
        <div className="order-first sm:order-last flex flex-col justify-center px-4 py-4 sm:text-center bg-amber-50 border-b border-dashed border-amber-300/80 sm:border-b-0 sm:border-l">
          <div className={dimmed}>
            <p
              className={`f-display font-semibold tabular-nums leading-none ${
                label.length > 9 ? 'text-xl' : 'text-3xl'
              } ${meta.stub}`}
            >
              {label}
            </p>
            <p className="text-xs text-amber-700/80 mt-1.5">off</p>
          </div>
        </div>
      </div>
    </li>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="Loading promos">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={ticketShadow}>
          <div className="bg-white rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_10rem]">
            <div className="p-5 space-y-3">
              <Bone className="h-6 w-32" />
              <Bone className="h-3 w-56 max-w-full" />
              <Bone className="h-1.5 w-full rounded-full mt-6" />
            </div>
            <div className="p-5 bg-amber-50 border-t border-dashed border-amber-300/80 sm:border-t-0 sm:border-l flex items-center justify-center">
              <Bone className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ MAIN ============ */
export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const notify = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() });
  }, []);

  const fetchPromos = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await api.get('/promos');
        setPromos(res.data);
        setLoadError(false);
      } catch (err) {
        console.error('Failed to fetch promos:', err);
        if (silent) notify('error', "Couldn't refresh the promo list.");
        else setLoadError(true);
      } finally {
        setLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  useEffect(() => {
    if (!showForm) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') resetForm();
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showForm]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) {
      setError('Discount percentage cannot be greater than 100%.');
      return;
    }
    if (Number(form.discount_value) <= 0) {
      setError('Discount value must be greater than 0.');
      return;
    }
    if (Number(form.quota) <= 0) {
      setError('Quota must be greater than 0.');
      return;
    }
    if (form.valid_from && form.valid_until && form.valid_from > form.valid_until) {
      setError('Start date cannot be after the end date.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/promos/${editingId}`, form);
        notify('success', 'Promo updated');
      } else {
        await api.post('/promos', form);
        notify('success', 'Promo saved');
      }
      resetForm();
      fetchPromos(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save promo.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p) {
    setProcessingId(p.id);
    try {
      await api.put(`/promos/${p.id}`, { ...p, is_active: !p.is_active });
      notify('success', p.is_active ? `${p.code} deactivated` : `${p.code} activated`);
      await fetchPromos(true);
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to change promo status.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(promo) {
    setDeletingId(promo.id);
    try {
      await api.delete(`/promos/${promo.id}`);
      setConfirmId(null);
      notify('success', `${promo.code} deleted`);
      fetchPromos(true);
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to delete promo.');
    } finally {
      setDeletingId(null);
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function openEditForm(promo) {
    setEditingId(promo.id);
    setForm({
      code: promo.code || '',
      description: promo.description || '',
      discount_type: promo.discount_type || 'percentage',
      discount_value: promo.discount_value || '',
      quota: promo.quota || '',
      valid_from: promo.valid_from ? promo.valid_from.split('T')[0] : '',
      valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
    });
    setError('');
    setShowForm(true);
  }

  function resetFilters() {
    setSearchQuery('');
    setStatusFilter('all');
  }

  const items = useMemo(() => promos.map((p) => ({ promo: p, status: getStatus(p) })), [promos]);

  const counts = useMemo(() => {
    const c = { all: items.length, active: 0, scheduled: 0, ended: 0, inactive: 0 };
    items.forEach(({ status }) => {
      if (status === 'active') c.active++;
      else if (status === 'scheduled') c.scheduled++;
      else if (status === 'inactive') c.inactive++;
      else c.ended++;
    });
    return c;
  }, [items]);

  const totalUsed = promos.reduce((sum, p) => sum + (p.used || 0), 0);
  const nearlyOut = items.filter(
    ({ promo, status }) => status === 'active' && promo.quota > 0 && (promo.used || 0) / promo.quota >= 0.8
  ).length;

  const q = searchQuery.trim().toLowerCase();
  const filtered = items.filter(({ promo, status }) => {
    const matchesSearch =
      !q || promo.code.toLowerCase().includes(q) || (promo.description || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'ended') return status === 'expired' || status === 'usedUp';
    return status === statusFilter;
  });

  const isFiltering = !!q || statusFilter !== 'all';
  const hasData = !loading && !loadError && promos.length > 0;

  // Preview langsung untuk form
  const isFixed = form.discount_type === 'fixed';
  const previewValue = Number(form.discount_value);
  const previewValid = form.discount_value !== '' && previewValue > 0;
  const previewPrice = previewValid
    ? isFixed
      ? Math.max(0, SAMPLE_PRICE - previewValue)
      : Math.round(SAMPLE_PRICE * (1 - Math.min(previewValue, 100) / 100))
    : null;
  const previewLabel = discountLabel(form.discount_type, form.discount_value);
  const editingPromo = editingId ? promos.find((p) => p.id === editingId) : null;

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4] px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ===== HEADER ===== */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="f-display text-3xl font-bold text-amber-950">Promos &amp; vouchers</h1>
              <p className="text-sm text-amber-700/80 mt-1">
                {loading ? 'Loading promos…' : `${promos.length} promos registered`}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className={`inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
            >
              <Icon name="plus" className="w-4 h-4" />
              Add promo
            </button>
          </header>

          {/* ===== SUMMARY ===== */}
          {hasData && (
            <div className={`${panel} grid grid-cols-3 divide-x divide-dashed divide-amber-200 mb-6`}>
              {[
                { value: counts.active, label: 'Running promos' },
                { value: totalUsed, label: 'Coupons used' },
                { value: nearlyOut, label: 'Quota nearly used up' },
              ].map((s) => (
                <div key={s.label} className="p-4 min-w-0">
                  <p className="f-display text-2xl font-semibold text-amber-950 tabular-nums leading-none">{s.value}</p>
                  <p className="text-xs text-amber-700/80 mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ===== SEARCH + FILTER ===== */}
          {hasData && (
            <div className="space-y-3 mb-6">
              <div className="relative">
                <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  aria-label="Search promos"
                  placeholder="Search code or description"
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

          {/* ===== LIST ===== */}
          {loading ? (
            <SkeletonList />
          ) : loadError ? (
            <EmptyState icon="alert" title="Couldn't load promos">
              <p className="text-sm text-amber-800/80 mb-5">Check your connection, then try again.</p>
              <button
                type="button"
                onClick={() => fetchPromos()}
                className={`px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
              >
                Try again
              </button>
            </EmptyState>
          ) : filtered.length === 0 ? (
            isFiltering ? (
              <EmptyState icon="search" title="No promos match">
                <p className="text-sm text-amber-800/80 mb-5">Change the keyword or status filter.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                >
                  Reset filter
                </button>
              </EmptyState>
            ) : (
              <EmptyState icon="ticket" title="No promos yet">
                <p className="text-sm text-amber-800/80 mb-5">
                  Create a promo code to boost sales for concerts that still need more attendees.
                </p>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                >
                  <Icon name="plus" className="w-4 h-4" />
                  Create first promo
                </button>
              </EmptyState>
            )
          ) : (
            <ul className="space-y-4">
              {filtered.map(({ promo, status }) => (
                <PromoRow
                  key={promo.id}
                  promo={promo}
                  status={status}
                  processing={processingId === promo.id}
                  confirming={confirmId === promo.id}
                  deleting={deletingId === promo.id}
                  onEdit={() => openEditForm(promo)}
                  onToggle={() => toggleActive(promo)}
                  onAskDelete={() => setConfirmId(promo.id)}
                  onCancelDelete={() => setConfirmId(null)}
                  onDelete={() => handleDelete(promo)}
                />
              ))}
            </ul>
          )}

          {/* ===== FORM DRAWER ===== */}
          <AnimatePresence>
            {showForm && (
              <>
                <motion.div
                  key="overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={resetForm}
                  className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-[60]"
                  aria-hidden="true"
                />
                <motion.aside
                  key="drawer"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="promo-form-title"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="fixed inset-y-0 right-0 z-[70] w-full max-w-md"
                >
                  <div className="f-body bg-white h-full flex flex-col shadow-2xl shadow-amber-950/30">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 px-6 py-4 bg-amber-950 text-amber-50">
                        <div className="min-w-0">
                          <h2 id="promo-form-title" className="f-display text-xl font-semibold">
                            {editingId ? 'Edit promo' : 'Create new promo'}
                          </h2>
                          <p className="text-xs text-amber-200/70 mt-0.5">
                            {editingId ? 'Update the promo details' : 'Fill in the promo details below'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={resetForm}
                          aria-label="Close form"
                          className={`-mr-1.5 p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors ${focusRing}`}
                        >
                          <Icon name="close" className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Body */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Preview langsung */}
                        <div>
                          <div
                            className="ticket-notch grid grid-cols-[1fr_var(--stub)] rounded-xl border border-amber-200 bg-white"
                            style={{ '--stub': '7.5rem' }}
                          >
                            <div className="p-4 min-w-0">
                              <p className="font-mono font-bold text-amber-700 truncate">
                                {form.code || 'PROMOCODE'}
                              </p>
                              <p className="text-xs text-amber-700/80 mt-1 truncate">
                                {form.description || 'Promo description'}
                              </p>
                            </div>
                            <div className="flex flex-col justify-center text-center px-3 py-4 bg-amber-50 border-l border-dashed border-amber-300/80 rounded-r-xl">
                              <p
                                className={`f-display font-semibold tabular-nums leading-none text-amber-700 ${
                                  previewLabel.length > 8 ? 'text-lg' : 'text-2xl'
                                }`}
                              >
                                {previewLabel}
                              </p>
                              <p className="text-xs text-amber-700/80 mt-1.5">off</p>
                            </div>
                          </div>
                          <p className="text-xs text-amber-700/80 mt-2.5">
                            {previewValid
                              ? `Example: a ${formatRupiah(SAMPLE_PRICE)} ticket becomes ${formatRupiah(previewPrice)}`
                              : 'Enter a discount value to see a sample discount.'}
                          </p>
                        </div>

                        {/* Kode */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label htmlFor="promo-code" className="block text-sm font-medium text-amber-900">
                                Promo code
                              </label>
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, code: randomCode() })}
                                className={`text-xs text-amber-700 hover:text-amber-900 font-medium rounded ${focusRing}`}
                              >
                                Generate random code
                              </button>
                            </div>
                            <input
                              id="promo-code"
                              required
                              autoFocus
                              className={`${inputCls} font-mono uppercase`}
                              placeholder="TIKETKU10"
                              value={form.code}
                              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            />
                          </div>

                          <div>
                            <label htmlFor="promo-desc" className={labelCls}>
                              Description <span className="font-normal text-amber-700/70">(optional)</span>
                            </label>
                            <input
                              id="promo-desc"
                              className={inputCls}
                              placeholder="Example: 10% off for all concerts"
                              value={form.description}
                              onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Diskon */}
                        <div className="pt-6 border-t border-dashed border-amber-200 space-y-4">
                          <h3 className="f-display text-base font-semibold text-amber-950">Discount</h3>
                          <div
                            role="radiogroup"
                            aria-label="Discount type"
                            className="grid grid-cols-2 gap-1 p-1 bg-amber-100 rounded-xl"
                          >
                            {[
                              { value: 'percentage', label: 'Percentage (%)' },
                              { value: 'fixed', label: 'Fixed amount (Rp)' },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                role="radio"
                                aria-checked={form.discount_type === opt.value}
                                onClick={() => setForm({ ...form, discount_type: opt.value })}
                                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                                  form.discount_type === opt.value
                                    ? 'bg-amber-950 text-amber-50'
                                    : 'text-amber-800 hover:text-amber-950'
                                } ${focusRing}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          <div>
                            <label htmlFor="promo-value" className={labelCls}>
                              Discount value
                            </label>
                            <div className="relative">
                              {isFixed && (
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-amber-500">Rp</span>
                              )}
                              <input
                                id="promo-value"
                                required
                                type="number"
                                min="0"
                                max={isFixed ? undefined : 100}
                                className={`${inputCls} ${isFixed ? 'pl-10' : 'pr-9'}`}
                                placeholder={isFixed ? '50000' : '10'}
                                value={form.discount_value}
                                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                              />
                              {!isFixed && (
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-amber-500">%</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Kuota dan periode */}
                        <div className="pt-6 border-t border-dashed border-amber-200 space-y-4">
                          <h3 className="f-display text-base font-semibold text-amber-950">Quota and period</h3>
                          <div>
                            <label htmlFor="promo-quota" className={labelCls}>
                              Usage quota
                            </label>
                            <input
                              id="promo-quota"
                              required
                              type="number"
                              min="1"
                              className={inputCls}
                              placeholder="100"
                              value={form.quota}
                              onChange={(e) => setForm({ ...form, quota: e.target.value })}
                            />
                            {editingPromo && (
                              <p className="text-xs text-amber-700/80 mt-1.5">
                                Already used {editingPromo.used || 0} times.
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="promo-from" className={labelCls}>
                                Valid from
                              </label>
                              <input
                                id="promo-from"
                                required
                                type="date"
                                className={inputCls}
                                value={form.valid_from}
                                onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                              />
                            </div>
                            <div>
                              <label htmlFor="promo-until" className={labelCls}>
                                Valid until
                              </label>
                              <input
                                id="promo-until"
                                required
                                type="date"
                                min={form.valid_from || undefined}
                                className={inputCls}
                                value={form.valid_until}
                                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer (stub) */}
                      <div className="p-4 border-t border-dashed border-amber-300/80 bg-amber-50 space-y-3">
                        {error && (
                          <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                            <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                            {error}
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={resetForm}
                            className={`px-4 py-2.5 bg-white hover:bg-amber-100 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                          >
                            {saving ? (
                              <>
                                <Spinner />
                                Saving…
                              </>
                            ) : editingId ? (
                              'Update promo'
                            ) : (
                              'Save promo'
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
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