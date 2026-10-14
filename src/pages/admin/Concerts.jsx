import { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { Loading, formatRupiah } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  plus: 'M12 4v16m8-8H4',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  close: 'M6 18L18 6M6 6l12 12',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  arrow: 'M13 7l5 5-5 5M6 12h12',
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  check: 'M5 13l4 4L19 7',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
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

/* ============ CONSTANTS ============ */
const emptyForm = {
  name: '',
  artist: '',
  description: '',
  venue_id: '',
  category_id: '',
  status: 'draft',
};

// values match the API; labels are for display only
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'selesai', label: 'Completed' },
];

const statusMeta = {
  draft: { label: 'Draft', text: 'text-amber-800', dot: 'bg-amber-500' },
  published: { label: 'Published', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', text: 'text-red-700', dot: 'bg-red-500' },
  selesai: { label: 'Completed', text: 'text-slate-700', dot: 'bg-slate-500' },
};

function StatusPill({ status, dark = false }) {
  const meta = statusMeta[status] || {
    label: status ? String(status).replace(/_/g, ' ') : '-',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        dark ? 'bg-amber-900 text-amber-100' : `bg-white/95 ${meta.text}`
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

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
      <span className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${active ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'}`}>
        {count}
      </span>
    </button>
  );
}

/* ============ CONCERT TICKET CARD ============ */
function ConcertCard({ concert, isSelected, onSelect }) {
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_8px_16px_rgba(69,26,3,0.16)] transition-[filter] duration-200 ${
        isSelected ? 'ring-2 ring-amber-600 ring-offset-2 ring-offset-[#f5ede4]' : ''
      }`}
    >
      <div className="ticket-card bg-white rounded-2xl overflow-hidden grid grid-rows-[1fr_var(--stub-h)] h-full">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={isSelected}
          aria-label={`${isSelected ? 'Hide' : 'Show'} details for ${concert.name}`}
          className={`text-left flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/70`}
        >
          <span className="relative block h-32 bg-amber-100 overflow-hidden">
            {concert.poster ? (
              <img src={concert.poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200/70 text-amber-400">
                <Icon name="ticket" className="w-9 h-9" />
              </span>
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-amber-950/60 via-transparent to-transparent" />
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-amber-950/70 backdrop-blur-sm text-xs text-amber-100 tabular-nums">
              #{String(concert.id).padStart(3, '0')}
            </span>
            <span className="absolute top-3 right-3">
              <StatusPill status={concert.status} />
            </span>
          </span>

          <span className="block p-4 space-y-2.5">
            <span className="block min-w-0">
              <span className="block f-display text-lg font-semibold text-amber-950 leading-snug truncate">{concert.name}</span>
              <span className="block text-sm text-amber-700/80 truncate">{concert.artist || 'Artist not set'}</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm text-amber-900 truncate">
              <Icon name="building" className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span className="truncate">{concert.venue_name || 'No venue'}</span>
            </span>
            {concert.organizer_name && (
              <span className="flex items-center gap-1.5 text-sm text-amber-900 truncate">
                <Icon name="user" className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span className="truncate">{concert.organizer_name}</span>
              </span>
            )}
          </span>
        </button>

        <div className="border-t border-dashed border-amber-300/80 bg-amber-50 px-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-amber-700/80">Tickets from</p>
            <p className="f-display text-base font-semibold text-amber-950 tabular-nums truncate">
              {concert.min_price ? formatRupiah(concert.min_price) : 'Not set'}
            </p>
          </div>
          <Link
            to={`/admin/concerts/${concert.id}/manage`}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-50 bg-amber-800 hover:bg-amber-700 rounded-lg transition-colors shrink-0 ${focusRing}`}
          >
            <Icon name="calendar" className="w-3.5 h-3.5" />
            Manage
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/* ============ DETAIL PANEL ============ */
function DetailRow({ icon, label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="text-amber-700/80 flex items-center gap-1.5 shrink-0">
        <Icon name={icon} className="w-3.5 h-3.5 text-amber-500" />
        {label}
      </span>
      <span className="text-amber-950 font-medium truncate text-right">{children}</span>
    </div>
  );
}

function DetailContent({ concert, onClose, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="bg-amber-950 text-amber-50 p-5">
        <div className="flex items-start justify-between gap-3">
          <StatusPill status={concert.status} dark />
          <button
            onClick={onClose}
            aria-label="Close details"
            className={`-mr-1.5 -mt-1 p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors ${focusRing}`}
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <h2 className="f-display text-2xl font-semibold leading-tight mt-3 break-words">{concert.name}</h2>
        <p className="text-sm text-amber-200/70 mt-0.5">{concert.artist || 'Artist not set'}</p>
      </div>

      <div className="p-5 space-y-4">
        {concert.poster && (
          <img src={concert.poster} alt={`${concert.name} poster`} className="w-full h-44 object-cover rounded-xl" />
        )}

        {concert.description && (
          <div>
            <h3 className="f-display text-base font-semibold text-amber-950 mb-1">About</h3>
            <p className="text-sm text-amber-800 leading-relaxed line-clamp-4">{concert.description}</p>
          </div>
        )}

        <div className="divide-y divide-dashed divide-amber-200 border-y border-dashed border-amber-200">
          <DetailRow icon="building" label="Venue">{concert.venue_name || '-'}</DetailRow>
          <DetailRow icon="music" label="Category">{concert.category_name || '-'}</DetailRow>
          <DetailRow icon="user" label="Organizer">{concert.organizer_name || '-'}</DetailRow>
          <DetailRow icon="clock" label="Created">{formatDate(concert.created_at)}</DetailRow>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-amber-700/80">Tickets from</span>
          <span className="f-display text-xl font-semibold text-amber-950 tabular-nums">
            {concert.min_price ? formatRupiah(concert.min_price) : 'Not set'}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <Link
            to={`/admin/concerts/${concert.id}/manage`}
            className={`w-full inline-flex items-center justify-center gap-2 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
          >
            <Icon name="calendar" className="w-4 h-4" />
            Manage schedule and tickets
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(concert)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 rounded-xl text-sm font-medium transition-colors ${focusRing}`}
            >
              <Icon name="edit" className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(concert)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors ${focusRing}`}
            >
              <Icon name="trash" className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
        <Icon name="info" className="w-6 h-6" />
      </div>
      <p className="f-display text-lg font-semibold text-amber-950">Pick a concert</p>
      <p className="text-sm text-amber-800/80 mt-1">Select a card to see its details and actions here.</p>
    </div>
  );
}

/* ============ MAIN ============ */
export default function Concerts() {
  const [concerts, setConcerts] = useState([]);
  const [venues, setVenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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
    if (!deleteTarget && !showForm && !selectedConcert) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (deleteTarget) setDeleteTarget(null);
      else if (showForm) setShowForm(false);
      else setSelectedConcert(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleteTarget, showForm, selectedConcert]);

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
      notify('error', "Couldn't load concerts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function scrollToForm() {
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  function openCreate() {
    setForm(emptyForm);
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
      status: c.status,
    });
    setPoster(null);
    setPosterPreview(c.poster || '');
    setEditingId(c.id);
    setError('');
    setShowForm(true);
    // on small screens the details open as a sheet over the form, so close it
    if (window.innerWidth < 1024) setSelectedConcert(null);
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
        notify('success', `"${form.name}" created`);
      }

      setShowForm(false);
      setSelectedConcert(null);
      fetchConcerts();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the concert. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/concerts/${deleteTarget.id}`);
      notify('success', `"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      setSelectedConcert(null);
      fetchConcerts();
    } catch (err) {
      notify('error', err.response?.data?.message || "Couldn't delete the concert. Please try again.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const statusCounts = useMemo(() => {
    const counts = { all: concerts.length };
    statusOptions.forEach((o) => {
      counts[o.value] = concerts.filter((c) => c.status === o.value).length;
    });
    return counts;
  }, [concerts]);

  const filteredConcerts = useMemo(() => {
    let result = [...concerts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.artist?.toLowerCase().includes(q) ||
          c.venue_name?.toLowerCase().includes(q) ||
          c.organizer_name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'price':
        result.sort((a, b) => (a.min_price || 0) - (b.min_price || 0));
        break;
      default:
        break;
    }

    return result;
  }, [concerts, searchQuery, statusFilter, sortBy]);

  const inputCls =
    'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';
  const labelCls = 'block text-sm font-medium text-amber-900 mb-1.5';

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4] px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* ===== HEADER ===== */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="f-display text-3xl font-bold text-amber-950">Manage concerts</h1>
              <p className="text-sm text-amber-700/80 mt-1">
                {loading ? 'Loading concerts…' : `Showing ${filteredConcerts.length} of ${concerts.length} concerts`}
              </p>
            </div>
            <button
              onClick={openCreate}
              className={`inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
            >
              <Icon name="plus" className="w-4 h-4" />
              Add concert
            </button>
          </header>

          {/* ===== SEARCH, FILTER, SORT ===== */}
          <div className="space-y-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  aria-label="Search concerts"
                  placeholder="Search by name, artist, venue or organizer"
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                aria-label="Sort concerts"
                className={`sm:w-48 px-3.5 py-3 bg-white rounded-xl text-sm text-amber-950 cursor-pointer ${focusRing}`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name, A to Z</option>
                <option value="price">Lowest price</option>
              </select>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <FilterChip label="All" active={statusFilter === ''} onClick={() => setStatusFilter('')} count={statusCounts.all} />
              {statusOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={statusFilter === opt.value}
                  onClick={() => setStatusFilter(statusFilter === opt.value ? '' : opt.value)}
                  count={statusCounts[opt.value]}
                />
              ))}
            </div>
          </div>

          {/* ===== FORM ===== */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                ref={formRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden mb-6"
              >
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-amber-950/5">
                  <div className="flex items-center justify-between gap-3 px-6 py-4 bg-amber-950 text-amber-50">
                    <h2 className="f-display text-xl font-semibold">{editingId ? 'Edit concert' : 'New concert'}</h2>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      aria-label="Close form"
                      className={`p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors ${focusRing}`}
                    >
                      <Icon name="close" className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    {error && (
                      <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                        <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                        {error}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="a-name" className={labelCls}>
                          Concert name <span className="text-amber-600">*</span>
                        </label>
                        <input
                          id="a-name"
                          required
                          className={inputCls}
                          placeholder="Jazz Night Festival"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="a-artist" className={labelCls}>Artist</label>
                        <input
                          id="a-artist"
                          className={inputCls}
                          placeholder="Indra Lesmana"
                          value={form.artist}
                          onChange={(e) => setForm({ ...form, artist: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="a-desc" className={labelCls}>Description</label>
                      <textarea
                        id="a-desc"
                        className={`${inputCls} resize-none`}
                        rows={4}
                        placeholder="What should people know about this concert?"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-5 border-t border-dashed border-amber-200">
                      <div>
                        <label htmlFor="a-venue" className={labelCls}>Venue</label>
                        <select
                          id="a-venue"
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
                        <label htmlFor="a-category" className={labelCls}>Category</label>
                        <select
                          id="a-category"
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
                      <div>
                        <label htmlFor="a-status" className={labelCls}>Status</label>
                        <select
                          id="a-status"
                          className={inputCls}
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className={labelCls}>Poster</span>
                        <div className="flex items-center gap-3">
                          {posterPreview && (
                            <div className="relative group shrink-0">
                              <img src={posterPreview} alt="Poster preview" className="w-16 h-20 rounded-lg object-cover" />
                              <button
                                type="button"
                                onClick={() => { setPoster(null); setPosterPreview(''); }}
                                aria-label="Remove poster"
                                className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity ${focusRing}`}
                              >
                                <Icon name="close" className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200/70 text-sm font-medium text-amber-900 transition-colors focus-within:ring-2 focus-within:ring-amber-500/70">
                            <Icon name="image" className="w-4 h-4" />
                            {posterPreview ? 'Change poster' : 'Choose poster'}
                            <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                          </label>
                        </div>
                        <p className="text-xs text-amber-700/80 mt-2">JPG, PNG or WebP, up to 5MB.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-5 border-t border-dashed border-amber-200 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium text-amber-700 hover:text-amber-950 hover:bg-amber-50 transition-colors ${focusRing}`}
                      >
                        Cancel
                      </button>
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
                            {editingId ? 'Save changes' : 'Create concert'}
                            <Icon name="arrow" className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== MAIN CONTENT ===== */}
          {loading ? (
            <Loading />
          ) : filteredConcerts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                <Icon name={concerts.length === 0 ? 'music' : 'search'} className="w-6 h-6" />
              </div>
              {concerts.length === 0 ? (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No concerts yet</h3>
                  <p className="text-sm text-amber-800/80 mb-5">Add the first concert to get started.</p>
                  <button
                    onClick={openCreate}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Add concert
                  </button>
                </>
              ) : (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No concerts match</h3>
                  <p className="text-sm text-amber-800/80 mb-5">Try another keyword or status.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                    className={`px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              {/* Cards */}
              <div className="lg:col-span-2">
                <div className="grid sm:grid-cols-2 gap-5">
                  {filteredConcerts.map((concert) => (
                    <ConcertCard
                      key={concert.id}
                      concert={concert}
                      isSelected={selectedConcert?.id === concert.id}
                      onSelect={() =>
                        setSelectedConcert(selectedConcert?.id === concert.id ? null : concert)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Detail panel (desktop) */}
              <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-6">
                {selectedConcert ? (
                  <motion.div key={selectedConcert.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <DetailContent
                      concert={selectedConcert}
                      onClose={() => setSelectedConcert(null)}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  </motion.div>
                ) : (
                  <EmptyDetail />
                )}
              </div>
            </div>
          )}

          {/* ===== DETAIL SHEET (mobile / tablet) ===== */}
          <AnimatePresence>
            {selectedConcert && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-amber-950/50 backdrop-blur-sm flex items-end"
                onClick={() => setSelectedConcert(null)}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Concert details"
                  initial={{ y: 48 }}
                  animate={{ y: 0 }}
                  exit={{ y: 48 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DetailContent
                    concert={selectedConcert}
                    onClose={() => setSelectedConcert(null)}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== DELETE MODAL ===== */}
          <AnimatePresence>
            {deleteTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => !deleting && setDeleteTarget(null)}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Delete concert"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="f-body bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl shadow-amber-950/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
                    <Icon name="trash" className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="f-display text-xl font-semibold text-amber-950 text-center mb-2">Delete this concert?</h3>
                  <p className="text-sm text-amber-900 text-center font-semibold mb-1 break-words">{deleteTarget.name}</p>
                  <p className="text-sm text-amber-800 text-center mb-6">
                    All schedules, ticket categories and related data will be permanently deleted. This can't be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteTarget(null)}
                      disabled={deleting}
                      className={`flex-1 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${focusRing}`}
                    >
                      Keep concert
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className={`flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${focusRing}`}
                    >
                      {deleting && <Spinner />}
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== TOAST ===== */}
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