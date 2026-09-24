import { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState, StatusBadge, formatRupiah } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    plus: 'M12 4v16m8-8H4',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    close: 'M6 18L18 6M6 6l12 12',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    check: 'M5 13l4 4L19 7',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    flame: 'M12 23c-4.97 0-9-3.582-9-8 0-4.418 4.03-8.259 6.5-10.5C10.5 3.5 12 1 12 1s1.5 2.5 2.5 3.5C16.97 6.741 21 10.582 21 15c0 4.418-4.03 8-9 8z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

const emptyForm = {
  name: '',
  artist: '',
  description: '',
  venue_id: '',
  category_id: '',
  status: 'draft'
};

// Warna tab ID (bergilir per index)
const idBadgeColors = [
  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
];

// ===== CONCERT CARD (ala referensi) =====
function ConcertCard({ concert, index, isSelected, onClick }) {
  const idColor = idBadgeColors[index % idBadgeColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={`group cursor-pointer rounded-2xl border transition-all duration-200 p-4 ${
        isSelected
          ? 'bg-flame-500/5 border-flame-500/50 ring-2 ring-flame-500/20'
          : 'bg-ink-800/40 border-ink-700/60 hover:border-flame-500/30 hover:bg-ink-800/60'
      }`}
    >
      {/* ===== HEADER: ID badge + nama + status ===== */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 font-bold text-sm ${idColor}`}>
            {concert.id}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm leading-tight truncate">
              {concert.name}
            </h3>
            <p className="text-[11px] text-ink-400 font-mono mt-0.5">
              {concert.artist || 'Artist not set'}
            </p>
          </div>
        </div>
        <StatusBadge status={concert.status} />
      </div>

      {/* ===== META ROW: date + EO ===== */}
      <div className="flex items-center justify-between text-[11px] text-ink-400 mb-3 pb-3 border-b border-ink-700/50">
        <span className="flex items-center gap-1 truncate">
          <Icon name="calendar" className="w-3 h-3" />
          {concert.created_at
            ? new Date(concert.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
              })
            : '-'}
        </span>
        {concert.organizer_name && (
          <span className="flex items-center gap-1 truncate">
            <Icon name="user" className="w-3 h-3" />
            {concert.organizer_name}
          </span>
        )}
      </div>

      {/* ===== INFO LIST ===== */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-400 flex items-center gap-1.5">
            <Icon name="building" className="w-3.5 h-3.5" />
            Venue
          </span>
          <span className="text-white font-medium truncate ml-2">
            {concert.venue_name || '-'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-400 flex items-center gap-1.5">
            <Icon name="flame" className="w-3.5 h-3.5" />
            Kategori
          </span>
          <span className="text-white font-medium truncate ml-2">
            {concert.category_name || '-'}
          </span>
        </div>
      </div>

      {/* ===== TOTAL ===== */}
      <div className="flex items-center justify-between pt-3 border-t border-ink-700/50 mb-3">
        <span className="text-[10px] text-ink-500 uppercase tracking-wider">Mulai dari</span>
        <span className="text-sm font-bold text-flame-400 font-mono tabular-nums">
          {concert.min_price ? formatRupiah(concert.min_price) : 'Belum diatur'}
        </span>
      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="flex items-center gap-2">
        <Link
          to={`/admin/concerts/${concert.id}/manage`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-ink-700/60 hover:bg-ink-700 text-ink-200 rounded-lg text-xs font-medium transition-colors"
        >
          <Icon name="calendar" className="w-3.5 h-3.5" />
          Kelola
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            isSelected
              ? 'bg-flame-500 text-white'
              : 'bg-flame-500/90 hover:bg-flame-500 text-white'
          }`}
        >
          <Icon name="info" className="w-3.5 h-3.5" />
          {isSelected ? 'Dipilih' : 'Detail'}
        </button>
      </div>
    </motion.div>
  );
}

// ===== DETAIL PANEL (kanan) =====
function DetailPanel({ concert, onClose, onEdit, onDelete }) {
  if (!concert) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-14 h-14 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center mb-4">
          <Icon name="info" className="w-6 h-6 text-ink-500" />
        </div>
        <p className="text-sm text-ink-400">
          Pilih konser untuk melihat detail
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={concert.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="card p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-4 border-b border-ink-700/60">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={concert.status} />
          </div>
          <h3 className="font-bold text-white text-base leading-tight">
            {concert.name}
          </h3>
          <p className="text-xs text-ink-400 mt-1">
            {concert.artist || 'Artist not set'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors shrink-0"
          aria-label="Close detail"
        >
          <Icon name="close" className="w-4 h-4" />
        </button>
      </div>

      {/* Poster preview */}
      {concert.poster && (
        <div className="rounded-xl overflow-hidden border border-ink-700">
          <img src={concert.poster} alt={concert.name} className="w-full h-40 object-cover" />
        </div>
      )}

      {/* Deskripsi */}
      {concert.description && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-1.5">Deskripsi</p>
          <p className="text-xs text-ink-300 leading-relaxed line-clamp-4">
            {concert.description}
          </p>
        </div>
      )}

      {/* Info Grid */}
      <div className="space-y-2.5 pt-2 border-t border-ink-700/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-400 flex items-center gap-1.5">
            <Icon name="building" className="w-3.5 h-3.5" />
            Venue
          </span>
          <span className="text-white font-medium truncate ml-2">
            {concert.venue_name || '-'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-400 flex items-center gap-1.5">
            <Icon name="flame" className="w-3.5 h-3.5" />
            Kategori
          </span>
          <span className="text-white font-medium truncate ml-2">
            {concert.category_name || '-'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-400 flex items-center gap-1.5">
            <Icon name="user" className="w-3.5 h-3.5" />
            Event Organizer
          </span>
          <span className="text-white font-medium truncate ml-2">
            {concert.organizer_name || '-'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-400 flex items-center gap-1.5">
            <Icon name="clock" className="w-3.5 h-3.5" />
            Dibuat
          </span>
          <span className="text-white font-medium font-mono">
            {concert.created_at
              ? new Date(concert.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })
              : '-'}
          </span>
        </div>
      </div>

      {/* Harga */}
      <div className="pt-3 border-t border-ink-700/60 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-ink-500">Mulai dari</span>
        <span className="text-base font-bold text-flame-400 font-mono tabular-nums">
          {concert.min_price ? formatRupiah(concert.min_price) : 'Belum diatur'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-3 border-t border-ink-700/60">
        <Link
          to={`/admin/concerts/${concert.id}/manage`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-flame-500 hover:bg-flame-600 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Icon name="calendar" className="w-4 h-4" />
          Kelola Jadwal & Tiket
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(concert)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-ink-700/60 hover:bg-ink-700 text-ink-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Icon name="edit" className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(concert)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors"
          >
            <Icon name="trash" className="w-3.5 h-3.5" />
            Hapus
          </button>
        </div>
      </div>
    </motion.div>
  );
}

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

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const formRef = useRef(null);

  useEffect(() => {
    fetchConcerts();
    api.get('/venues').then((res) => setVenues(res.data)).catch(() => {});
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  async function fetchConcerts() {
    setLoading(true);
    try {
      const res = await api.get('/concerts');
      setConcerts(res.data);
    } catch (err) {
      console.error('Failed to fetch concerts:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(emptyForm);
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
      status: c.status,
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
      } else {
        await api.post('/concerts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setShowForm(false);
      setSelectedConcert(null);
      fetchConcerts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save concert.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/concerts/${deleteTarget.id}`);
      setDeleteTarget(null);
      setSelectedConcert(null);
      fetchConcerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete concert.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'selesai', label: 'Completed' },
  ];

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-flame-500/10 border border-flame-500/20 flex items-center justify-center">
            <Icon name="mic" className="w-5 h-5 text-flame-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Concerts</h1>
            <p className="text-sm text-ink-400 mt-0.5">
              {filteredConcerts.length} dari {concerts.length} konser
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Icon name="plus" className="w-4 h-4" />
          Tambah Konser
        </button>
      </div>

      {/* ===== SEARCH & FILTER ===== */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            placeholder="Cari nama, artis, venue, atau EO..."
            className="w-full input-field pl-10 bg-ink-800/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="input-field sm:w-40 bg-ink-800/40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="input-field sm:w-40 bg-ink-800/40"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="name">Nama A-Z</option>
            <option value="price">Harga Terendah</option>
          </select>
        </div>
      </div>

      {/* ===== FORM ===== (tidak diubah dari yang sebelumnya) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={handleSubmit} className="card p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-flame-500 via-orange-500 to-transparent" />

              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">
                  {editingId ? 'Edit Konser' : 'Konser Baru'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors"
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-ink-200 mb-1.5">Nama Konser *</label>
                    <input
                      required
                      className="w-full input-field"
                      placeholder="Contoh: Jazz Night Festival"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink-200 mb-1.5">Nama Artis</label>
                    <input
                      className="w-full input-field"
                      placeholder="Contoh: Indra Lesmana"
                      value={form.artist}
                      onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-ink-200 mb-1.5">Deskripsi</label>
                  <textarea
                    className="w-full input-field"
                    rows={4}
                    placeholder="Jelaskan detail konser..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-ink-200 mb-1.5">Venue</label>
                    <select
                      className="w-full input-field"
                      value={form.venue_id}
                      onChange={(e) => setForm({ ...form, venue_id: e.target.value })}
                    >
                      <option value="">Pilih Venue</option>
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-ink-200 mb-1.5">Kategori</label>
                    <select
                      className="w-full input-field"
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-ink-200 mb-1.5">Status</label>
                    <select
                      className="w-full input-field"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-ink-200 mb-1.5">Poster Konser</label>
                    <div className="flex items-center gap-3">
                      {posterPreview && (
                        <div className="relative group">
                          <img
                            src={posterPreview}
                            alt="Poster preview"
                            className="w-16 h-16 rounded-lg object-cover border border-ink-700"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPoster(null);
                              setPosterPreview('');
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon name="close" className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-700 hover:bg-ink-600 text-sm text-ink-200 transition-colors">
                        <Icon name="image" className="w-4 h-4" />
                        {posterPreview ? 'Ganti File' : 'Pilih File'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT: GRID + DETAIL PANEL ===== */}
      {loading ? (
        <Loading />
      ) : filteredConcerts.length === 0 ? (
        concerts.length === 0 ? (
          <EmptyState text="Belum ada konser. Tambahkan konser pertamamu!" />
        ) : (
          <div className="text-center py-16">
            <p className="text-ink-300 mb-2">Tidak ada konser yang cocok dengan filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="text-sm text-flame-400 hover:text-flame-300"
            >
              Reset filter
            </button>
          </div>
        )
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* ===== LEFT (2/3): GRID CARDS ===== */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredConcerts.map((concert, index) => (
                <ConcertCard
                  key={concert.id}
                  concert={concert}
                  index={index}
                  isSelected={selectedConcert?.id === concert.id}
                  onClick={() =>
                    setSelectedConcert(
                      selectedConcert?.id === concert.id ? null : concert
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* ===== RIGHT (1/3): DETAIL PANEL ===== */}
          <div className="lg:col-span-1 lg:sticky lg:top-6">
            <DetailPanel
              concert={selectedConcert}
              onClose={() => setSelectedConcert(null)}
              onEdit={openEdit}
              onDelete={(c) => setDeleteTarget(c)}
            />
          </div>
        </div>
      )}

      {/* ===== DELETE MODAL ===== (tidak diubah) */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ink-800 border border-ink-700 rounded-2xl max-w-sm w-full p-6 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <Icon name="trash" className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white text-lg">Hapus Konser</h3>
              </div>

              <p className="text-ink-300 text-sm mb-2">
                Kamu akan menghapus:
              </p>
              <p className="text-white font-medium mb-4">
                {deleteTarget.name}
              </p>

              <p className="text-ink-400 text-xs mb-6">
                Semua jadwal, kategori tiket, dan data terkait akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Menghapus...
                    </>
                  ) : (
                    'Hapus'
                  )}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-ink-700 hover:bg-ink-600 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}