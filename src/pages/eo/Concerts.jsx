import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  plus: 'M12 4v16m8-8H4',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  check: 'M5 13l4 4L19 7',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  arrow: 'M13 7l5 5-5 5M6 12h12',
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
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

/* ============ STYLES ============ */
const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  /* Concert ticket: notches on the tear line above the stub */
  .ticket-card {
    --stub-h: 4.25rem;
    -webkit-mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }
`;

/* ============ STATUS META (keys match the API values) ============ */
const statusMeta = {
  disetujui: { label: 'Approved', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  menunggu_persetujuan: { label: 'Pending review', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  ditolak: { label: 'Rejected', text: 'text-red-700', dot: 'bg-red-500' },
};

/* ============ FILTER CHIP ============ */
function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${focusRing} ${
        active ? 'bg-amber-950 text-amber-50' : 'bg-white text-amber-800 hover:text-amber-950 hover:bg-amber-50'
      }`}
    >
      {label}
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
          active ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* ============ CONCERT TICKET CARD ============ */
function ConcertCard({ concert, onEdit, onDelete }) {
  const meta = statusMeta[concert.approval_status] || statusMeta.menunggu_persetujuan;
  const isLive = concert.approval_status === 'disetujui' && concert.status === 'aktif';

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_8px_16px_rgba(69,26,3,0.16)] transition-[filter] duration-200"
    >
      <div className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)] h-full">
        <div className="flex flex-col">
          {/* Poster */}
          <div className="relative h-40 bg-amber-100 overflow-hidden">
            {concert.poster ? (
              <img src={concert.poster} className="w-full h-full object-cover" alt={`${concert.name} poster`} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200/70">
                <Icon name="ticket" className="w-10 h-10 text-amber-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-950/70 via-transparent to-transparent" />

            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-amber-950/70 backdrop-blur-sm text-xs text-amber-100 tabular-nums">
              #{String(concert.id).padStart(3, '0')}
            </span>
            <span
              className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-xs font-medium ${meta.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>

            {isLive && (
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                On sale now
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col gap-3 flex-1">
            <div className="min-w-0">
              <h3 className="f-display text-lg font-semibold text-amber-950 leading-snug truncate">{concert.name}</h3>
              <p className="text-sm text-amber-700/80 mt-0.5 flex items-center gap-1.5 truncate">
                <Icon name="music" className="w-3.5 h-3.5 shrink-0" />
                {concert.artist || 'Artist not set'}
              </p>
            </div>

            {concert.venue_name && (
              <p className="text-sm text-amber-900 flex items-center gap-1.5 truncate">
                <Icon name="building" className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                {concert.venue_name}
              </p>
            )}

            {concert.approval_status === 'ditolak' && concert.rejection_reason && (
              <div className="p-2.5 rounded-lg bg-red-50 text-xs text-red-700 flex items-start gap-2">
                <Icon name="alert" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold">Rejected:</span> {concert.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stub */}
        <div className="border-t border-dashed border-amber-300/80 bg-amber-50 px-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-amber-700/80">Tickets from</p>
            <p className="f-display text-base font-semibold text-amber-950 tabular-nums truncate">
              {concert.min_price ? formatRupiah(concert.min_price) : '-'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to={`/eo/concerts/${concert.id}/manage`}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-50 bg-amber-800 hover:bg-amber-700 rounded-lg transition-colors ${focusRing}`}
            >
              <Icon name="calendar" className="w-3.5 h-3.5" />
              Manage
            </Link>
            <button
              onClick={() => onEdit(concert)}
              aria-label={`Edit ${concert.name}`}
              title="Edit"
              className={`p-2 rounded-lg text-amber-600 hover:text-amber-950 hover:bg-amber-100 transition-colors ${focusRing}`}
            >
              <Icon name="edit" className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(concert)}
              aria-label={`Delete ${concert.name}`}
              title="Delete"
              className={`p-2 rounded-lg text-amber-600 hover:text-red-600 hover:bg-red-50 transition-colors ${focusRing}`}
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonConcerts() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse" role="status" aria-label="Loading concerts">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)]">
          <div>
            <div className="h-40 bg-amber-100" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-40 bg-amber-100 rounded" />
              <div className="h-3.5 w-28 bg-amber-100 rounded" />
              <div className="h-3.5 w-32 bg-amber-100 rounded" />
            </div>
          </div>
          <div className="bg-amber-50 border-t border-dashed border-amber-200" />
        </div>
      ))}
    </div>
  );
}

/* ============ FORM STEPPER ============ */
function Stepper({ form, posterPreview, editingId }) {
  const step1Done = form.name.trim() !== '';
  const step2Done = !!(form.venue_id && form.category_id);
  const step3Done = !!(posterPreview || editingId);

  let currentStep = 1;
  if (step1Done) currentStep = 2;
  if (step1Done && step2Done) currentStep = 3;
  if (step1Done && step2Done && step3Done) currentStep = 4;

  const steps = [
    { num: 1, label: 'Basic info', desc: 'Name and artist', done: step1Done },
    { num: 2, label: 'Details', desc: 'Description and venue', done: step2Done },
    { num: 3, label: 'Poster', desc: 'Upload and submit', done: step3Done },
  ];

  return (
    <ol className="flex lg:flex-col gap-4 lg:gap-0">
      {steps.map((step, idx) => {
        const isCurrent = step.num === currentStep;
        return (
          <li key={step.num} className="flex gap-3 lg:flex-1 lg:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                  step.done
                    ? 'bg-amber-400 text-amber-950'
                    : isCurrent
                    ? 'border-2 border-amber-400 text-amber-300'
                    : 'border border-amber-800 text-amber-400/60'
                }`}
              >
                {step.done ? <Icon name="check" className="w-4 h-4" /> : step.num}
              </span>
              {idx < steps.length - 1 && (
                <span
                  className={`hidden lg:block w-px flex-1 min-h-[36px] my-2 ${step.done ? 'bg-amber-400/60' : 'bg-amber-800'}`}
                />
              )}
            </div>
            <div className="lg:pb-5 self-center lg:self-start">
              <p className={`text-sm font-medium ${step.done || isCurrent ? 'text-amber-50' : 'text-amber-300/60'}`}>
                {step.label}
              </p>
              <p className="hidden lg:block text-xs text-amber-300/60 mt-0.5">
                {step.done ? 'Done' : isCurrent ? 'In progress' : step.desc}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ============ MAIN ============ */
export default function EoConcerts() {
  const [concerts, setConcerts] = useState([]);
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', artist: '', description: '', venue_id: '', category_id: '' });
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    fetchConcerts();
    api.get('/venues').then((res) => setVenues(res.data)).catch(() => {});
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!showForm && !showDeleteModal) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (showDeleteModal) setShowDeleteModal(null);
      else setShowForm(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showForm, showDeleteModal]);

  function notify(type, message) {
    setToast({ type, message, id: Date.now() });
  }

  async function fetchConcerts() {
    setLoading(true);
    try {
      const res = await api.get('/concerts');
      setConcerts(res.data);
    } catch (err) {
      console.error('Failed to fetch concerts:', err);
      notify('error', "Couldn't load your concerts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function scrollToForm() {
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  function openCreate() {
    setForm({ name: '', artist: '', description: '', venue_id: '', category_id: '' });
    setPoster(null);
    setPosterPreview('');
    setEditingId(null);
    setError('');
    setShowForm(true);
    scrollToForm();
  }

  function openEdit(c) {
    setForm({
      name: c.name,
      artist: c.artist || '',
      description: c.description || '',
      venue_id: c.venue_id || '',
      category_id: c.category_id || '',
    });
    setPoster(null);
    setPosterPreview(c.poster || '');
    setEditingId(c.id);
    setError('');
    setShowForm(true);
    scrollToForm();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('The poster is larger than 5MB. Please choose a smaller image.');
        return;
      }
      setError('');
      setPoster(file);
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.venue_id) {
      setError('Select a venue before saving.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (poster) formData.append('poster', poster);

      if (editingId) {
        await api.put(`/concerts/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('success', `"${form.name}" updated`);
      } else {
        await api.post('/concerts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('success', `"${form.name}" submitted for review`);
      }

      setShowForm(false);
      fetchConcerts();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the concert. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!showDeleteModal) return;
    setDeleting(true);
    try {
      await api.delete(`/concerts/${showDeleteModal.id}`);
      notify('success', `"${showDeleteModal.name}" deleted`);
      setShowDeleteModal(null);
      fetchConcerts();
    } catch (err) {
      notify('error', err.response?.data?.message || "Couldn't delete the concert. Please try again.");
      setShowDeleteModal(null);
    } finally {
      setDeleting(false);
    }
  }

  const q = searchTerm.toLowerCase();
  const filteredConcerts = concerts.filter((concert) => {
    const matchesSearch =
      concert.name.toLowerCase().includes(q) || concert.artist?.toLowerCase().includes(q);
    const matchesFilter = filterStatus === 'all' || concert.approval_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: concerts.length,
    disetujui: concerts.filter((c) => c.approval_status === 'disetujui').length,
    menunggu_persetujuan: concerts.filter((c) => c.approval_status === 'menunggu_persetujuan').length,
    ditolak: concerts.filter((c) => c.approval_status === 'ditolak').length,
  };

  const isFiltering = !!searchTerm.trim() || filterStatus !== 'all';

  const inputCls =
    'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';
  const labelCls = 'block text-sm font-medium text-amber-900 mb-1.5';
  const sectionTitleCls = 'f-display text-lg font-semibold text-amber-950 mb-3';

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="f-display text-3xl font-bold text-amber-950">My concerts</h1>
              <p className="text-sm text-amber-700/80 mt-1">
                {loading
                  ? 'Loading your concerts…'
                  : concerts.length > 0
                  ? `${concerts.length} ${concerts.length === 1 ? 'concert' : 'concerts'}, ${statusCounts.disetujui} approved`
                  : 'Nothing here yet'}
              </p>
            </div>
            <button
              onClick={openCreate}
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors self-start sm:self-auto ${focusRing}`}
            >
              <Icon name="plus" className="w-4 h-4" />
              Create concert
            </button>
          </header>

          {/* Info banner */}
          <div className="flex items-start gap-3 px-4 py-3 mb-6 rounded-2xl border border-dashed border-amber-400/60 bg-amber-100/60">
            <Icon name="info" className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              An admin reviews new concerts and any changes before they go public.
            </p>
          </div>

          {/* Search & filter */}
          {concerts.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-3 mb-6">
              <div className="relative flex-1">
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
              <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                <FilterChip label="All" active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} count={statusCounts.all} />
                <FilterChip label="Approved" active={filterStatus === 'disetujui'} onClick={() => setFilterStatus('disetujui')} count={statusCounts.disetujui} />
                <FilterChip label="Pending" active={filterStatus === 'menunggu_persetujuan'} onClick={() => setFilterStatus('menunggu_persetujuan')} count={statusCounts.menunggu_persetujuan} />
                <FilterChip label="Rejected" active={filterStatus === 'ditolak'} onClick={() => setFilterStatus('ditolak')} count={statusCounts.ditolak} />
              </div>
            </div>
          )}

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                ref={formRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden mb-6"
              >
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-amber-950/5">
                  <div className="grid lg:grid-cols-4">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 bg-amber-950 text-amber-50 p-6">
                      <h2 className="f-display text-xl font-semibold">{editingId ? 'Edit concert' : 'New concert'}</h2>
                      <p className="text-sm text-amber-200/70 mt-1 mb-6 lg:mb-8">
                        {editingId ? 'Changes are reviewed again before they go live.' : 'Fill in three short steps.'}
                      </p>
                      <Stepper form={form} posterPreview={posterPreview} editingId={editingId} />
                    </div>

                    {/* Fields */}
                    <div className="lg:col-span-3 p-6">
                      {error && (
                        <div role="alert" className="flex items-start gap-2 p-3 mb-6 rounded-lg bg-red-50 text-red-700 text-sm">
                          <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                          {error}
                        </div>
                      )}

                      {/* Section 1 */}
                      <section className="mb-8">
                        <h3 className={sectionTitleCls}>Basic info</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label htmlFor="c-name" className={labelCls}>
                              Concert name <span className="text-amber-600">*</span>
                            </label>
                            <input
                              id="c-name"
                              required
                              className={inputCls}
                              placeholder="Java Jazz Festival"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="c-artist" className={labelCls}>Artist</label>
                            <input
                              id="c-artist"
                              className={inputCls}
                              placeholder="Tulus, Raisa"
                              value={form.artist}
                              onChange={(e) => setForm({ ...form, artist: e.target.value })}
                            />
                          </div>
                        </div>
                      </section>

                      {/* Section 2 */}
                      <section className="pt-6 border-t border-dashed border-amber-200 mb-8">
                        <h3 className={sectionTitleCls}>Details</h3>
                        <div className="mb-4">
                          <label htmlFor="c-desc" className={labelCls}>Description</label>
                          <textarea
                            id="c-desc"
                            rows={4}
                            className={`${inputCls} resize-none`}
                            placeholder="What should people know about this concert?"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="c-venue" className={labelCls}>
                              Venue <span className="text-amber-600">*</span>
                            </label>
                            <select
                              id="c-venue"
                              required
                              className={inputCls}
                              value={form.venue_id}
                              onChange={(e) => setForm({ ...form, venue_id: e.target.value })}
                            >
                              <option value="">Select a venue</option>
                              {venues.map((v) => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="c-category" className={labelCls}>Category</label>
                            <select
                              id="c-category"
                              className={inputCls}
                              value={form.category_id}
                              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            >
                              <option value="">Select a category</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </section>

                      {/* Section 3 */}
                      <section className="pt-6 border-t border-dashed border-amber-200 mb-8">
                        <h3 className={sectionTitleCls}>Poster</h3>
                        <div className="flex items-start gap-4">
                          <div className="relative w-24 h-28 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 flex items-center justify-center overflow-hidden shrink-0 group">
                            {posterPreview ? (
                              <>
                                <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => { setPoster(null); setPosterPreview(''); }}
                                  aria-label="Remove poster"
                                  className={`absolute inset-0 bg-amber-950/60 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center ${focusRing}`}
                                >
                                  <Icon name="trash" className="w-5 h-5 text-white" />
                                </button>
                              </>
                            ) : (
                              <Icon name="image" className="w-7 h-7 text-amber-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200/70 text-sm font-medium text-amber-900 transition-colors focus-within:ring-2 focus-within:ring-amber-500/70 ${focusRing}`}>
                              <Icon name="image" className="w-4 h-4" />
                              {posterPreview ? 'Change poster' : 'Choose poster'}
                              <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                            </label>
                            <p className="text-sm text-amber-700/80 mt-2">JPG, PNG or WebP, up to 5MB.</p>
                            <p className="text-sm text-amber-700/80 mt-0.5">Best at 800×1000px (4:5).</p>
                          </div>
                        </div>
                      </section>

                      {/* Footer */}
                      <div className="border-t border-dashed border-amber-200 pt-5 flex items-center justify-between gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:text-amber-950 hover:bg-amber-50 transition-colors ${focusRing}`}
                        >
                          Cancel
                        </button>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-amber-700/80 hidden sm:inline">
                            <span className="text-amber-600">*</span> Required
                          </span>
                          <button
                            type="submit"
                            disabled={saving}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                          >
                            {saving ? (
                              <>
                                <Spinner />
                                Saving…
                              </>
                            ) : (
                              <>
                                {editingId ? 'Save changes' : 'Submit for review'}
                                <Icon name="arrow" className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Concert list */}
          {loading ? (
            <SkeletonConcerts />
          ) : filteredConcerts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Icon name={isFiltering ? 'search' : 'music'} className="w-6 h-6 text-amber-600" />
              </div>
              {isFiltering ? (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No concerts match</h3>
                  <p className="text-sm text-amber-700/80 mb-5">Try another keyword or a different status.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                    className={`px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">The stage is still empty</h3>
                  <p className="text-sm text-amber-700/80 mb-5">Create your first concert and send it for review.</p>
                  <button
                    onClick={openCreate}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Create concert
                  </button>
                </>
              )}
            </div>
          ) : (
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredConcerts.map((concert) => (
                  <ConcertCard
                    key={concert.id}
                    concert={concert}
                    onEdit={openEdit}
                    onDelete={setShowDeleteModal}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Delete modal */}
          <AnimatePresence>
            {showDeleteModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
                onClick={() => setShowDeleteModal(null)}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Delete concert"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="f-body bg-white rounded-3xl max-w-md w-full p-6 shadow-xl shadow-amber-950/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
                    <Icon name="trash" className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="f-display text-xl font-semibold text-amber-950 text-center mb-2">Delete this concert?</h3>
                  <p className="text-sm text-amber-800 text-center mb-6">
                    <span className="font-semibold">{showDeleteModal.name}</span> will be permanently deleted, along with
                    its schedules and ticket categories. This can't be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(null)}
                      className={`flex-1 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                    >
                      Keep concert
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className={`flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${focusRing}`}
                    >
                      {deleting && <Spinner className="h-3.5 w-3.5" />}
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast */}
          <div className="fixed bottom-6 inset-x-0 z-[90] flex justify-center px-4 pointer-events-none">
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