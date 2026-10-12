import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    plus: 'M12 4v16m8-8H4',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    close: 'M6 18L18 6M6 6l12 12',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
    check: 'M5 13l4 4L19 7',
    image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
    chevron: 'M19 9l-7 7-7-7',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    sparkle: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
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

const statusMeta = {
  disetujui: { label: 'Approved', text: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500', border: 'border-emerald-200/60' },
  menunggu_persetujuan: { label: 'Pending', text: 'text-yellow-700', dot: 'bg-yellow-500', bar: 'bg-yellow-500', border: 'border-yellow-200/60' },
  ditolak: { label: 'Rejected', text: 'text-red-700', dot: 'bg-red-500', bar: 'bg-red-500', border: 'border-red-200/60' },
};

function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-1.5 rounded-full font-serif text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap ${focusRing} ${
        active
          ? 'bg-amber-800 text-amber-50'
          : 'bg-white border border-amber-200/60 text-amber-800/80 hover:text-amber-950 hover:bg-amber-50'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
          active ? 'bg-amber-700 text-amber-50' : 'bg-amber-100 text-amber-800'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ===== CONCERT CARD =====
function ConcertCard({ concert, index, onEdit, onDelete }) {
  const meta = statusMeta[concert.approval_status] || statusMeta.menunggu_persetujuan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden hover:border-amber-300 transition-colors flex flex-col"
    >
      <div className="relative h-32 bg-amber-100 overflow-hidden">
        {concert.poster ? (
          <img
            src={concert.poster}
            className="w-full h-full object-cover"
            alt=""
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="ticket" className="w-10 h-10 text-amber-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/60 via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          <div className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm border border-amber-200/60">
            <span className="font-mono text-[10px] text-amber-800 tabular-nums">
              #{String(concert.id).padStart(3, '0')}
            </span>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm border ${meta.border} font-serif text-[10px] font-medium ${meta.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-serif font-semibold text-amber-950 text-base leading-tight truncate">
            {concert.name}
          </h3>
          <p className="font-serif text-xs text-amber-700/70 mt-1 flex items-center gap-1.5">
            <Icon name="music" className="w-3 h-3" />
            {concert.artist || 'Artist not set'}
          </p>
        </div>

        {concert.approval_status === 'disetujui' && concert.status === 'aktif' && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 font-serif text-[10px] text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        )}

        <div className="space-y-2 py-3 border-y border-amber-200/60 flex-1">
          {concert.venue_name && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif text-amber-700/70 flex items-center gap-1.5">
                <Icon name="building" className="w-3.5 h-3.5" />
                Venue
              </span>
              <span className="font-serif text-amber-950 font-medium truncate ml-2">{concert.venue_name}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif text-amber-700/70 flex items-center gap-1.5">
              <Icon name="ticket" className="w-3.5 h-3.5" />
              Starting price
            </span>
            <span className="font-serif text-amber-800 font-semibold font-mono tabular-nums">
              {concert.min_price ? formatRupiah(concert.min_price) : '—'}
            </span>
          </div>
        </div>

        {concert.approval_status === 'ditolak' && concert.rejection_reason && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200/60 text-[11px] text-red-700 font-serif flex items-start gap-2">
            <Icon name="alert" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Rejected:</span> {concert.rejection_reason}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 pt-3">
          <Link
            to={`/eo/concerts/${concert.id}/manage`}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 font-serif text-xs text-amber-50 font-medium bg-amber-800 hover:bg-amber-700 rounded-lg py-2 transition-colors ${focusRing}`}
          >
            <Icon name="calendar" className="w-3.5 h-3.5" />
            Manage
          </Link>
          <button
            onClick={() => onEdit(concert)}
            aria-label={`Edit ${concert.name}`}
            title="Edit"
            className={`p-2 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors ${focusRing}`}
          >
            <Icon name="edit" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(concert)}
            aria-label={`Delete ${concert.name}`}
            title="Delete"
            className={`p-2 rounded-lg text-amber-500 hover:text-red-600 hover:bg-red-50 transition-colors ${focusRing}`}
          >
            <Icon name="trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonConcerts() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden">
          <div className="h-32 bg-amber-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-32 bg-amber-100 rounded" />
            <div className="h-3 w-24 bg-amber-100 rounded" />
            <div className="h-1.5 w-full bg-amber-100 rounded-full mt-4" />
            <div className="h-8 w-full bg-amber-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
    if (!showForm) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowForm(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showForm]);

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
      notify('error', 'Failed to load concerts.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ name: '', artist: '', description: '', venue_id: '', category_id: '' });
    setPoster(null);
    setPosterPreview('');
    setEditingId(null);
    setError('');
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Maximum file size is 5MB.');
        return;
      }
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
      setError('Please select a venue first.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (poster) formData.append('poster', poster);

      if (editingId) {
        await api.put(`/concerts/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('success', `Concert "${form.name}" updated`);
      } else {
        await api.post('/concerts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        notify('success', `Concert "${form.name}" submitted`);
      }

      setShowForm(false);
      fetchConcerts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save concert.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!showDeleteModal) return;
    setDeleting(true);
    try {
      await api.delete(`/concerts/${showDeleteModal.id}`);
      notify('success', `Concert "${showDeleteModal.name}" deleted`);
      setShowDeleteModal(null);
      fetchConcerts();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to delete concert.');
      setShowDeleteModal(null);
    } finally {
      setDeleting(false);
    }
  }

  const filteredConcerts = concerts.filter((concert) => {
    const matchesSearch =
      concert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concert.artist?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all';
  const labelCls = 'block font-serif text-sm text-amber-900 mb-1.5';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f5ede4]">
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-amber-950">My concerts</h1>
              <p className="font-serif text-sm text-amber-700/70 mt-1">
                {loading ? 'Loading concerts...' : concerts.length > 0 ? `${concerts.length} concerts registered` : 'No concerts yet'}
              </p>
            </div>
            <button
              onClick={openCreate}
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors self-start sm:self-auto ${focusRing}`}
            >
              <Icon name="plus" className="w-4 h-4" />
              Create concert
            </button>
          </header>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 mb-6 rounded-2xl border border-dashed border-amber-300/60 bg-amber-50/50">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200/60 flex items-center justify-center shrink-0">
              <Icon name="info" className="w-4 h-4 text-amber-700" />
            </div>
            <p className="font-serif text-sm text-amber-800">
              New concerts and changes will be reviewed by an admin before going public.
            </p>
          </div>

          {/* Search & filter */}
          {concerts.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Icon name="search" className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="Search concerts"
                  placeholder="Search concert or artist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
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
                <form onSubmit={handleSubmit} className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden">
                  <div className="grid lg:grid-cols-4">
                    {/* Stepper */}
                    <div className="lg:col-span-1 bg-amber-50/60 border-b lg:border-b-0 lg:border-r border-amber-200/60 p-6">
                      <h2 className="font-serif font-semibold text-amber-950 mb-8">
                        {editingId ? 'Edit concert' : 'New concert'}
                      </h2>

                      <div className="space-y-0">
                        {(() => {
                          const step1Done = form.name.trim() !== '';
                          const step2Done = form.venue_id && form.category_id;
                          const step3Done = posterPreview || editingId;

                          let currentStep = 1;
                          if (step1Done) currentStep = 2;
                          if (step1Done && step2Done) currentStep = 3;
                          if (step1Done && step2Done && step3Done) currentStep = 4;

                          const steps = [
                            { num: 1, label: 'Basic info', desc: 'Name & artist', done: step1Done },
                            { num: 2, label: 'Concert details', desc: 'Description & location', done: step2Done },
                            { num: 3, label: 'Poster & submit', desc: 'Upload & review', done: step3Done },
                          ];

                          return steps.map((step, idx, arr) => {
                            const isDone = step.done;
                            const isCurrent = step.num === currentStep;
                            return (
                              <div key={step.num} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm shrink-0 transition-all ${
                                      isDone
                                        ? 'bg-amber-700 text-amber-50'
                                        : isCurrent
                                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-600'
                                        : 'bg-white text-amber-500 border border-amber-200/60'
                                    }`}
                                  >
                                    {isDone ? <Icon name="check" className="w-4 h-4" /> : step.num}
                                  </div>
                                  {idx < arr.length - 1 && (
                                    <div
                                      className={`w-px flex-1 min-h-[40px] my-2 transition-colors ${
                                        isDone ? 'bg-amber-300' : 'bg-amber-200/60'
                                      }`}
                                    />
                                  )}
                                </div>
                                <div className="pb-6">
                                  <p className={`font-serif text-sm font-medium ${isDone || isCurrent ? 'text-amber-950' : 'text-amber-700/70'}`}>
                                    {step.label}
                                  </p>
                                  <p className="font-serif text-xs text-amber-700/60 mt-0.5">
                                    {isDone ? 'Completed' : isCurrent ? 'In progress' : step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Form fields */}
                    <div className="lg:col-span-3 p-6">
                      {error && (
                        <div
                          role="alert"
                          className="flex items-start gap-2 p-3 mb-6 rounded-lg bg-red-50 border border-red-200/60 text-red-700 font-serif text-sm"
                        >
                          <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                          {error}
                        </div>
                      )}

                      {/* Section 1 */}
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name="sparkle" className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold">
                            Basic info
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label htmlFor="c-name" className={labelCls}>
                              Concert name <span className="text-amber-600">*</span>
                            </label>
                            <input
                              id="c-name"
                              required
                              className={inputCls}
                              placeholder="Example: Java Jazz Festival"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="c-artist" className={labelCls}>Artist name</label>
                            <input
                              id="c-artist"
                              className={inputCls}
                              placeholder="Example: Tulus, Raisa"
                              value={form.artist}
                              onChange={(e) => setForm({ ...form, artist: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2 */}
                      <div className="pt-6 border-t border-amber-200/60 mb-8">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name="sparkle" className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold">
                            Concert details
                          </span>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="c-desc" className={labelCls}>Concert description</label>
                          <textarea
                            id="c-desc"
                            rows={4}
                            className={`${inputCls} resize-none`}
                            placeholder="Tell us about this concert..."
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
                              <option value="">Select venue</option>
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
                              <option value="">Select category</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Section 3 */}
                      <div className="pt-6 border-t border-amber-200/60 mb-8">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name="sparkle" className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold">
                            Concert poster
                          </span>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-amber-300/60 bg-amber-50/50 flex items-center justify-center overflow-hidden shrink-0 group">
                            {posterPreview ? (
                              <>
                                <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => { setPoster(null); setPosterPreview(''); }}
                                  aria-label="Remove poster"
                                  className={`absolute inset-0 bg-amber-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${focusRing}`}
                                >
                                  <Icon name="trash" className="w-5 h-5 text-white" />
                                </button>
                              </>
                            ) : (
                              <Icon name="image" className="w-7 h-7 text-amber-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200/60 border border-amber-200/60 font-serif text-sm text-amber-900 transition-colors ${focusRing}`}>
                              <Icon name="image" className="w-4 h-4" />
                              {posterPreview ? 'Change poster' : 'Choose poster'}
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                            <p className="font-serif text-xs text-amber-700/70 mt-2">
                              Max. 5MB — JPG, PNG, or WebP format
                            </p>
                            <p className="font-serif text-xs text-amber-700/70 mt-1 flex items-center gap-1">
                              <Icon name="info" className="w-3 h-3" />
                              Recommended size 800×1000px (4:5 ratio)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="border-t border-amber-200/60 pt-5 flex items-center justify-between gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className={`font-serif text-sm text-amber-700 hover:text-amber-950 transition-colors ${focusRing}`}
                        >
                          Cancel
                        </button>

                        <div className="flex items-center gap-3">
                          <span className="font-serif text-xs text-amber-700/70 hidden sm:inline">
                            <span className="text-amber-600">*</span> Required
                          </span>
                          <button
                            type="submit"
                            disabled={saving}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                          >
                            {saving ? (
                              <>
                                <Spinner />
                                Saving...
                              </>
                            ) : (
                              <>
                                {editingId ? 'Save changes' : 'Save & submit'}
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
            <div className="bg-white border border-amber-200/60 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                <Icon name={isFiltering ? 'search' : 'music'} className="w-6 h-6 text-amber-600" />
              </div>
              {isFiltering ? (
                <>
                  <h3 className="font-serif font-semibold text-amber-950 mb-1">No matches found</h3>
                  <p className="font-serif text-sm text-amber-700/70 mb-5">
                    Try a different keyword or select another status.
                  </p>
                  <button
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                    className={`px-4 py-2 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                  >
                    Reset filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-serif font-semibold text-amber-950 mb-1">The stage is still empty</h3>
                  <p className="font-serif text-sm text-amber-700/70 mb-5">
                    Your first concert is just one click away.
                  </p>
                  <button
                    onClick={openCreate}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Create your first concert
                  </button>
                </>
              )}
            </div>
          ) : (
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredConcerts.map((concert, index) => (
                  <ConcertCard
                    key={concert.id}
                    concert={concert}
                    index={index}
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
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white border border-amber-200/60 rounded-2xl max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200/60 flex items-center justify-center mb-4 mx-auto">
                    <Icon name="trash" className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-serif font-semibold text-amber-950 text-lg text-center mb-2">
                    Delete concert?
                  </h3>
                  <p className="font-serif text-sm text-amber-800 text-center mb-6">
                    <span className="font-mono font-semibold">{showDeleteModal.name}</span> will be permanently deleted.
                    All related schedules & ticket categories will also be removed.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(null)}
                      className={`flex-1 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm font-semibold rounded-xl transition-colors ${focusRing}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className={`flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-serif text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${focusRing}`}
                    >
                      {deleting && <Spinner className="h-3.5 w-3.5" />}
                      {deleting ? 'Deleting...' : 'Delete'}
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