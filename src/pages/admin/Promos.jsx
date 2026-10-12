import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
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
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60';

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

/* Notches are cut out of the ticket with a mask, so they work on any background. */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const ticketCss = `
  .ticket-notch { -webkit-mask: ${notch}; mask: ${notch}; }
  @media (min-width: 640px) {
    .ticket-notch-sm { -webkit-mask: ${notch}; mask: ${notch}; }
  }
`;

const statusMeta = {
  active: { label: 'Active', text: 'text-emerald-700', dot: 'bg-emerald-500', stub: 'text-amber-700' },
  scheduled: { label: 'Scheduled', text: 'text-blue-700', dot: 'bg-blue-500', stub: 'text-blue-700' },
  usedUp: { label: 'Quota exhausted', text: 'text-orange-700', dot: 'bg-orange-500', stub: 'text-orange-700' },
  expired: { label: 'Expired', text: 'text-amber-700', dot: 'bg-amber-500', stub: 'text-amber-700' },
  inactive: { label: 'Inactive', text: 'text-amber-700/60', dot: 'bg-amber-500/60', stub: 'text-amber-700/60' },
};

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
    <li
      className="ticket-notch-sm bg-white border border-amber-200/60 rounded-2xl grid grid-cols-1 sm:grid-cols-[1fr_var(--stub)]"
      style={{ '--stub': '10rem' }}
    >
      <div className="p-5 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className={`min-w-0 ${dimmed}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span
                className={`px-2.5 py-1 rounded-md font-mono font-bold text-sm border ${
                  status === 'active'
                    ? 'bg-amber-100 text-amber-800 border-amber-200/60'
                    : 'bg-white text-amber-900 border-amber-200/60'
                }`}
              >
                {promo.code}
              </span>
              <span className={`inline-flex items-center gap-1.5 font-serif text-xs font-medium ${meta.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
            {promo.description && <p className="font-serif text-sm text-amber-800/80 mt-2">{promo.description}</p>}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Switch
              checked={!!promo.is_active}
              disabled={processing}
              onChange={onToggle}
              label={promo.is_active ? `Deactivate ${promo.code}` : `Activate ${promo.code}`}
            />
            <button
              onClick={onEdit}
              aria-label={`Edit ${promo.code}`}
              title="Edit promo"
              className={`p-2 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors ${focusRing}`}
            >
              <Icon name="edit" className="w-4 h-4" />
            </button>
            <button
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
          <p className="flex items-center gap-1.5 font-serif text-xs text-amber-700/60 mt-3">
            <Icon name="calendar" className="w-3.5 h-3.5" />
            {formatDate(promo.valid_from)} to {formatDate(promo.valid_until)}
          </p>

          <div className="mt-4">
            <div className="flex items-center justify-between font-serif text-xs text-amber-700/70 mb-1.5">
              <span>
                Used <span className="text-amber-950 font-mono tabular-nums">{used}</span> of{' '}
                <span className="font-mono tabular-nums">{promo.quota}</span>
              </span>
              <span className="font-mono tabular-nums">{pct}%</span>
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
                className={`h-full rounded-full transition-all duration-500 ${
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
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 border border-red-200/60 px-3 py-2.5"
          >
            <p className="font-serif text-sm text-red-700">
              Delete <span className="font-mono font-semibold">{promo.code}</span>?{' '}
              {used > 0
                ? `It has been used ${used} times, deactivating it is safer.`
                : 'This action cannot be undone.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onCancelDelete}
                className={`px-3 py-1.5 rounded-md font-serif text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors ${focusRing}`}
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                disabled={deleting}
                className={`px-3 py-1.5 rounded-md font-serif text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60 inline-flex items-center gap-1.5 ${focusRing}`}
              >
                {deleting && <Spinner className="h-3 w-3" />}
                Delete promo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stub */}
      <div
        className={`order-first sm:order-last flex flex-col justify-center px-4 py-4 sm:text-center border-b border-dashed border-amber-200/60 sm:border-b-0 sm:border-l ${dimmed}`}
      >
        <p
          className={`font-serif font-bold font-mono tabular-nums leading-none ${
            label.length > 9 ? 'text-lg' : 'text-2xl'
          } ${meta.stub}`}
        >
          {label}
        </p>
        <p className="font-serif text-xs text-amber-700/60 mt-1.5">
          {promo.discount_type === 'percentage' ? 'off' : 'off'}
        </p>
      </div>
    </li>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3 animate-pulse" aria-hidden="true">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-amber-200/60 rounded-2xl grid grid-cols-1 sm:grid-cols-[1fr_10rem]">
          <div className="p-5 space-y-3">
            <div className="h-6 w-32 bg-amber-100 rounded" />
            <div className="h-3 w-56 bg-amber-100 rounded" />
            <div className="h-1.5 w-full bg-amber-100 rounded-full mt-6" />
          </div>
          <div className="p-5 border-t border-dashed border-amber-200/60 sm:border-t-0 sm:border-l flex items-center justify-center">
            <div className="h-7 w-16 bg-amber-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ended', label: 'Ended' },
  { value: 'inactive', label: 'Inactive' },
];

export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchPromos();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!showForm) return;
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

  function notify(type, message) {
    setToast({ type, message, id: Date.now() });
  }

  async function fetchPromos(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/promos');
      setPromos(res.data);
    } catch (err) {
      console.error('Failed to fetch promos:', err);
    } finally {
      setLoading(false);
    }
  }

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

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
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

  // Live preview values for the form
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
      <div className="min-h-screen bg-[#f5ede4]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <style>{ticketCss}</style>

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-amber-950">Promos & vouchers</h1>
              <p className="font-serif text-sm text-amber-700/70 mt-1">
                {loading ? 'Loading promos...' : `${promos.length} promos registered`}
              </p>
            </div>
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors self-start sm:self-auto"
            >
              <Icon name="plus" className="w-4 h-4" />
              Add promo
            </button>
          </header>

          {/* Summary */}
          {!loading && promos.length > 0 && (
            <div className="bg-white border border-amber-200/60 rounded-2xl grid grid-cols-3 divide-x divide-amber-200/60 mb-6">
              {[
                { value: counts.active, label: 'Running promos' },
                { value: totalUsed, label: 'Coupons used' },
                { value: nearlyOut, label: 'Quota nearly used up' },
              ].map((s) => (
                <div key={s.label} className="p-4">
                  <p className="font-serif text-xl font-bold text-amber-950 font-mono tabular-nums leading-none">{s.value}</p>
                  <p className="font-serif text-xs text-amber-700/70 mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                aria-label="Search promos"
                placeholder="Search code or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
              />
            </div>
            <div className="flex gap-1 p-1 bg-white border border-amber-200/60 rounded-xl overflow-x-auto">
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

          {/* List */}
          {loading ? (
            <SkeletonList />
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-amber-200/60 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                <Icon name="ticket" className="w-6 h-6 text-amber-600" />
              </div>
              {isFiltering ? (
                <>
                  <h3 className="font-serif font-semibold text-amber-950 mb-1">No promos match</h3>
                  <p className="font-serif text-sm text-amber-700/70 mb-5">Change the keyword or status filter.</p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors"
                  >
                    Reset filter
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-serif font-semibold text-amber-950 mb-1">No promos yet</h3>
                  <p className="font-serif text-sm text-amber-700/70 mb-5">
                    Create a promo code to boost sales for concerts that still need more attendees.
                  </p>
                  <button
                    onClick={openCreateForm}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors"
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Create first promo
                  </button>
                </>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
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

          {/* Form drawer */}
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
                  className="fixed inset-0 bg-amber-950/50 z-[60]"
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
                  <div className="bg-white !rounded-none !border-y-0 !border-r-0 h-full flex flex-col border-l border-amber-200/60 shadow-2xl">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                      <div className="flex items-start justify-between gap-3 p-5 border-b border-amber-200/60">
                        <div>
                          <h2 id="promo-form-title" className="font-serif font-semibold text-amber-950">
                            {editingId ? 'Edit promo' : 'Create new promo'}
                          </h2>
                          <p className="font-serif text-xs text-amber-700/70 mt-0.5">
                            {editingId ? 'Update the promo details' : 'Fill in the promo details below'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={resetForm}
                          aria-label="Close form"
                          className={`p-1.5 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors ${focusRing}`}
                        >
                          <Icon name="close" className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {/* Live preview */}
                        <div>
                          <div
                            className="ticket-notch grid grid-cols-[1fr_var(--stub)] rounded-xl border border-amber-200/60 bg-amber-50/50"
                            style={{ '--stub': '7.5rem' }}
                          >
                            <div className="p-4 min-w-0">
                              <p className="font-mono font-bold text-amber-700 truncate">
                                {form.code || 'PROMOCODE'}
                              </p>
                              <p className="font-serif text-xs text-amber-700/70 mt-1 truncate">
                                {form.description || 'Promo description'}
                              </p>
                            </div>
                            <div className="flex flex-col justify-center text-center px-3 py-4 border-l border-dashed border-amber-200/60">
                              <p
                                className={`font-serif font-bold font-mono tabular-nums leading-none text-amber-700 ${
                                  previewLabel.length > 8 ? 'text-base' : 'text-xl'
                                }`}
                              >
                                {previewLabel}
                              </p>
                              <p className="font-serif text-xs text-amber-700/70 mt-1.5">{isFixed ? 'off' : 'off'}</p>
                            </div>
                          </div>
                          <p className="font-serif text-xs text-amber-700/70 mt-2.5">
                            {previewValid
                              ? `Example: a ${formatRupiah(SAMPLE_PRICE)} ticket becomes ${formatRupiah(previewPrice)}`
                              : 'Enter a discount value to see a sample discount.'}
                          </p>
                        </div>

                        {/* Code */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label htmlFor="promo-code" className="block font-serif text-sm text-amber-900">
                                Promo code
                              </label>
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, code: randomCode() })}
                                className={`font-serif text-xs text-amber-700 hover:text-amber-900 font-medium rounded ${focusRing}`}
                              >
                                Generate random code
                              </button>
                            </div>
                            <input
                              id="promo-code"
                              required
                              autoFocus
                              className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-mono uppercase text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                              placeholder="TIKETKU10"
                              value={form.code}
                              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            />
                          </div>

                          <div>
                            <label htmlFor="promo-desc" className="block font-serif text-sm text-amber-900 mb-1.5">
                              Description <span className="text-amber-700/60">(optional)</span>
                            </label>
                            <input
                              id="promo-desc"
                              className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                              placeholder="Example: 10% off for all concerts"
                              value={form.description}
                              onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Discount */}
                        <div className="pt-6 border-t border-amber-200/60 space-y-4">
                          <h3 className="font-serif font-semibold text-amber-950 text-sm">Discount</h3>
                          <div
                            role="radiogroup"
                            aria-label="Discount type"
                            className="grid grid-cols-2 gap-1 p-1 bg-white border border-amber-200/60 rounded-xl"
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
                                className={`py-1.5 rounded-lg font-serif text-xs transition-colors ${
                                  form.discount_type === opt.value
                                    ? 'bg-amber-800 text-amber-50'
                                    : 'text-amber-700/70 hover:text-amber-900'
                                } ${focusRing}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>

                          <div>
                            <label htmlFor="promo-value" className="block font-serif text-sm text-amber-900 mb-1.5">
                              Discount value
                            </label>
                            <div className="relative">
                              {isFixed && (
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-serif text-sm text-amber-500">
                                  Rp
                                </span>
                              )}
                              <input
                                id="promo-value"
                                required
                                type="number"
                                min="0"
                                max={isFixed ? undefined : 100}
                                className={`w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all ${isFixed ? 'pl-10' : 'pr-9'}`}
                                placeholder={isFixed ? '50000' : '10'}
                                value={form.discount_value}
                                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                              />
                              {!isFixed && (
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-serif text-sm text-amber-500">
                                  %
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quota and period */}
                        <div className="pt-6 border-t border-amber-200/60 space-y-4">
                          <h3 className="font-serif font-semibold text-amber-950 text-sm">Quota and period</h3>
                          <div>
                            <label htmlFor="promo-quota" className="block font-serif text-sm text-amber-900 mb-1.5">
                              Usage quota
                            </label>
                            <input
                              id="promo-quota"
                              required
                              type="number"
                              min="1"
                              className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                              placeholder="100"
                              value={form.quota}
                              onChange={(e) => setForm({ ...form, quota: e.target.value })}
                            />
                            {editingPromo && (
                              <p className="font-serif text-xs text-amber-700/70 mt-1.5">
                                Already used {editingPromo.used || 0} times.
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="promo-from" className="block font-serif text-sm text-amber-900 mb-1.5">
                                Valid from
                              </label>
                              <input
                                id="promo-from"
                                required
                                type="date"
                                className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                                value={form.valid_from}
                                onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                              />
                            </div>
                            <div>
                              <label htmlFor="promo-until" className="block font-serif text-sm text-amber-900 mb-1.5">
                                Valid until
                              </label>
                              <input
                                id="promo-until"
                                required
                                type="date"
                                min={form.valid_from || undefined}
                                className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                                value={form.valid_until}
                                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-amber-200/60 space-y-3">
                        {error && (
                          <div
                            role="alert"
                            className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200/60 text-red-700 font-serif text-sm"
                          >
                            <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                            {error}
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm rounded-xl transition-colors"
                          >
                            {saving ? (
                              <>
                                <Spinner />
                                Saving...
                              </>
                            ) : editingId ? (
                              'Update promo'
                            ) : (
                              'Save promo'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
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