import { useEffect, useState, useRef } from 'react';
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
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    close: 'M6 18L18 6M6 6l12 12',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
    check: 'M5 13l4 4L19 7',
    image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    eye: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
    chevron: 'M19 9l-7 7-7-7',
    sparkle: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z',
    fire: 'M12 23c-4.97 0-8-3.582-8-8 0-2.5 1.5-5 3-6.5C8 7 9 5 9.5 3c.5-2 1-2.5 2-2.5.5 0 1 .5 1 1.5V3c0 1.5 1 3 2 4.5 1.5 2 2.5 3.5 2.5 6 0 4.418-2.03 9.5-5 9.5z',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// ===== FLOATING INPUT =====
function FloatingInput({ label, required, value, onChange, type = 'text' }) {
  return (
    <div className="relative">
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full px-4 pt-5 pb-2 bg-transparent border border-ink-600 focus:border-flame-500 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-flame-500/20 transition-all"
      />
      <label className="absolute left-3 -top-2 bg-ink-900 px-2 text-[10px] font-mono uppercase tracking-wider text-ink-400 transition-all peer-focus:text-flame-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink-500 peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:bg-ink-900 peer-focus:text-[10px]">
        {label} {required && <span className="text-flame-400">*</span>}
      </label>
    </div>
  );
}

// ===== FLOATING TEXTAREA =====
function FloatingTextarea({ label, value, onChange, rows = 4, required }) {
  return (
    <div className="relative">
      <textarea
        rows={rows}
        required={required}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full px-4 pt-5 pb-2 bg-transparent border border-ink-600 focus:border-flame-500 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-flame-500/20 transition-all resize-none"
      />
      <label className="absolute left-3 -top-2 bg-ink-900 px-2 text-[10px] font-mono uppercase tracking-wider text-ink-400 transition-all peer-focus:text-flame-400 peer-placeholder-shown:top-4 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink-500 peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:bg-ink-900 peer-focus:text-[10px]">
        {label} {required && <span className="text-flame-400">*</span>}
      </label>
    </div>
  );
}

// ===== FLOATING SELECT =====
function FloatingSelect({ label, value, onChange, options, placeholder, required }) {
  return (
    <div className="relative">
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="peer w-full px-4 pt-5 pb-2 bg-transparent border border-ink-600 focus:border-flame-500 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-flame-500/20 transition-all appearance-none cursor-pointer"
      >
        <option value="" className="bg-ink-900">{placeholder || 'Pilih...'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-ink-900">
            {opt.label}
          </option>
        ))}
      </select>
      <label className="absolute left-3 -top-2 bg-ink-900 px-2 text-[10px] font-mono uppercase tracking-wider text-ink-400 transition-all peer-focus:text-flame-400">
        {label} {required && <span className="text-flame-400">*</span>}
      </label>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Icon name="chevron" className="w-4 h-4 text-ink-400" />
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
        active
          ? 'bg-flame-500 text-white shadow-sm shadow-flame-500/30'
          : 'bg-ink-800 text-ink-400 hover:text-white hover:bg-ink-700 border border-ink-700/60'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
          active ? 'bg-white/20 text-white' : 'bg-ink-700 text-ink-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ===== CONCERT CARD =====
function ConcertCard({ concert, index, onEdit, onDelete }) {
  const statusConfig = {
    disetujui: {
      gradient: 'from-emerald-500/20 via-transparent to-transparent',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/10',
      accent: 'bg-emerald-500',
    },
    menunggu_persetujuan: {
      gradient: 'from-yellow-500/20 via-transparent to-transparent',
      border: 'border-yellow-500/30',
      glow: 'shadow-yellow-500/10',
      accent: 'bg-yellow-500',
    },
    ditolak: {
      gradient: 'from-red-500/20 via-transparent to-transparent',
      border: 'border-red-500/30',
      glow: 'shadow-red-500/10',
      accent: 'bg-red-500',
    },
  };

  const config = statusConfig[concert.approval_status] || statusConfig.menunggu_persetujuan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ y: -4 }}
      className="relative group"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

      <div className={`relative bg-ink-900/90 backdrop-blur-sm border ${config.border} rounded-2xl overflow-hidden transition-all duration-300 hover:border-ink-600 ${config.glow} shadow-lg`}>
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${config.accent} opacity-60`} />

        <div className="relative h-32 bg-ink-800 overflow-hidden">
          {concert.poster ? (
            <img
              src={concert.poster}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              alt=""
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="ticket" className="w-10 h-10 text-ink-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="px-2 py-1 rounded-md bg-ink-950/80 backdrop-blur-sm border border-ink-700/60">
              <span className="text-[10px] font-mono text-ink-400">
                #{String(concert.id).padStart(3, '0')}
              </span>
            </div>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <StatusBadge status={concert.approval_status} />
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-white text-base leading-tight truncate group-hover:text-flame-400 transition-colors">
              {concert.name}
            </h3>
            <p className="text-xs text-ink-400 mt-1 flex items-center gap-1.5">
              <Icon name="music" className="w-3 h-3" />
              {concert.artist || 'Artis belum diisi'}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status={concert.status} />
            {concert.approval_status === 'disetujui' && concert.status === 'aktif' && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>

          <div className="space-y-2 py-3 border-y border-ink-700/50">
            {concert.venue_name && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-500 flex items-center gap-1.5">
                  <Icon name="building" className="w-3.5 h-3.5" />
                  Venue
                </span>
                <span className="text-ink-200 font-medium truncate ml-2">{concert.venue_name}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-500 flex items-center gap-1.5">
                <Icon name="ticket" className="w-3.5 h-3.5" />
                Harga Mulai
              </span>
              <span className="text-flame-400 font-semibold font-mono">
                {concert.min_price ? formatRupiah(concert.min_price) : '—'}
              </span>
            </div>
          </div>

          {concert.approval_status === 'ditolak' && concert.rejection_reason && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 flex items-start gap-2">
              <Icon name="alert" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Ditolak:</span> {concert.rejection_reason}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 px-4 pb-4">
          <Link
            to={`/eo/concerts/${concert.id}/manage`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-white font-medium bg-flame-500 hover:bg-flame-600 rounded-lg py-2 transition-colors"
          >
            <Icon name="calendar" className="w-3.5 h-3.5" />
            Kelola
          </Link>
          <button
            onClick={() => onEdit(concert)}
            className="p-2 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors"
            title="Edit"
          >
            <Icon name="edit" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(concert.id)}
            className="p-2 rounded-lg text-ink-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Hapus"
          >
            <Icon name="trash" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
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
        setError('Ukuran file maksimal 5MB.');
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
      setError('Pilih venue dulu ya.');
      return;
    }

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
      fetchConcerts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan konser.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/concerts/${id}`);
      setShowDeleteModal(null);
      fetchConcerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus konser.');
    }
  }

  const filteredConcerts = concerts.filter(concert => {
    const matchesSearch = concert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          concert.artist?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || concert.approval_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: concerts.length,
    disetujui: concerts.filter(c => c.approval_status === 'disetujui').length,
    menunggu_persetujuan: concerts.filter(c => c.approval_status === 'menunggu_persetujuan').length,
    ditolak: concerts.filter(c => c.approval_status === 'ditolak').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-flame-500/10 border border-flame-500/20 flex items-center justify-center">
            <Icon name="music" className="w-5 h-5 text-flame-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-flame-400/80 mb-0.5">
              Manajemen Konser
            </p>
            <h1 className="text-2xl font-bold text-white">
              {concerts.length > 0 ? `${concerts.length} Konser` : 'Konser Saya'}
            </h1>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Icon name="plus" className="w-4 h-4" />
          Buat Konser
        </motion.button>
      </motion.div>

      {/* ===== INFO BANNER ===== */}
      <div className="flex items-start gap-3 p-3.5 mb-5 rounded-xl bg-ink-800/40 border border-ink-700/60">
        <div className="w-8 h-8 rounded-lg bg-flame-500/10 flex items-center justify-center shrink-0">
          <Icon name="info" className="w-4 h-4 text-flame-400" />
        </div>
        <p className="text-xs text-ink-300 leading-relaxed">
          Konser baru dan perubahan akan direview admin sebelum tayang ke publik.
        </p>
      </div>

      {/* ===== SEARCH & FILTER ===== */}
      {concerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Icon name="search" className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari konser atau artis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-field pl-10 bg-ink-800/40"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            <FilterChip label="Semua" active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} count={statusCounts.all} />
            <FilterChip label="Disetujui" active={filterStatus === 'disetujui'} onClick={() => setFilterStatus('disetujui')} count={statusCounts.disetujui} />
            <FilterChip label="Pending" active={filterStatus === 'menunggu_persetujuan'} onClick={() => setFilterStatus('menunggu_persetujuan')} count={statusCounts.menunggu_persetujuan} />
            <FilterChip label="Ditolak" active={filterStatus === 'ditolak'} onClick={() => setFilterStatus('ditolak')} count={statusCounts.ditolak} />
          </div>
        </motion.div>
      )}

      {/* ===== FORM (STEPPER LAYOUT) ===== */}
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
            <form onSubmit={handleSubmit} className="relative bg-ink-900 border border-ink-700 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
              <div className="grid lg:grid-cols-4">

                {/* ===== KIRI: STEPPER (tanpa brand) ===== */}
                <div className="lg:col-span-1 bg-ink-800/40 border-b lg:border-b-0 lg:border-r border-ink-700/60 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-8">
                    {editingId ? 'Edit Konser' : 'Konser Baru'}
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
                        { num: 1, label: 'Info Dasar', desc: 'Nama & artis', done: step1Done },
                        { num: 2, label: 'Detail Konser', desc: 'Deskripsi & lokasi', done: step2Done },
                        { num: 3, label: 'Poster & Submit', desc: 'Upload & review', done: step3Done },
                      ];

                      return steps.map((step, idx, arr) => {
                        const isDone = step.done;
                        const isCurrent = step.num === currentStep;
                        const isUpcoming = !isDone && !isCurrent;

                        return (
                          <div key={step.num} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 transition-all duration-300 ${
                                  isDone
                                    ? 'bg-flame-500 text-white shadow-lg shadow-flame-500/30'
                                    : isCurrent
                                    ? 'bg-flame-500/20 text-flame-400 border-2 border-flame-500 ring-4 ring-flame-500/10'
                                    : 'bg-ink-700 text-ink-400 border border-ink-600'
                                }`}
                              >
                                {isDone ? <Icon name="check" className="w-4 h-4" /> : step.num}
                              </div>
                              {idx < arr.length - 1 && (
                                <div
                                  className={`w-px flex-1 min-h-[40px] my-2 transition-colors duration-300 ${
                                    isDone ? 'bg-flame-500/40' : 'bg-ink-700'
                                  }`}
                                />
                              )}
                            </div>

                            <div className="pb-6">
                              <p
                                className={`text-sm font-medium transition-colors duration-300 ${
                                  isDone || isCurrent ? 'text-white' : 'text-ink-400'
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-[11px] text-ink-500 mt-0.5">
                                {isDone ? 'Selesai' : isCurrent ? 'Sedang diisi' : step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* ===== KANAN: FORM FIELDS ===== */}
                <div className="lg:col-span-3 p-6 lg:p-8">

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </motion.div>
                  )}

                  {/* SECTION 1 */}
                  <div className="mb-8">
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400 mb-4">
                      Info Dasar
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FloatingInput
                          label="Nama Konser"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <FloatingInput
                          label="Nama Artis"
                          value={form.artist}
                          onChange={(e) => setForm({ ...form, artist: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2 */}
                  <div className="mb-8">
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400 mb-4">
                      Detail Konser
                    </p>

                    <div className="mb-4">
                      <FloatingTextarea
                        label="Deskripsi Konser"
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FloatingSelect
                        label="Venue"
                        required
                        value={form.venue_id}
                        onChange={(e) => setForm({ ...form, venue_id: e.target.value })}
                        options={venues.map((v) => ({ value: v.id, label: v.name }))}
                        placeholder="Pilih venue"
                      />
                      <FloatingSelect
                        label="Kategori"
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        options={categories.map((c) => ({ value: c.id, label: c.name }))}
                        placeholder="Pilih kategori"
                      />
                    </div>
                  </div>

                  {/* SECTION 3 */}
                  <div className="mb-8">
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400 mb-4">
                      Poster Konser
                    </p>

                    <div className="flex items-start gap-4">
                      <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-ink-600 bg-ink-800/40 flex items-center justify-center overflow-hidden shrink-0 group">
                        {posterPreview ? (
                          <>
                            <img src={posterPreview} alt="Preview poster" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => { setPoster(null); setPosterPreview(''); }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <Icon name="trash" className="w-5 h-5 text-white" />
                            </button>
                          </>
                        ) : (
                          <Icon name="image" className="w-7 h-7 text-ink-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-700 hover:bg-ink-600 text-sm text-ink-200 transition-colors">
                          <Icon name="image" className="w-4 h-4" />
                          {posterPreview ? 'Ganti Poster' : 'Pilih Poster'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                        <p className="text-[11px] text-ink-500 mt-2">
                          Maks. 5MB — Format JPG, PNG, atau WebP
                        </p>
                        <p className="text-[11px] text-ink-500 mt-1 flex items-center gap-1">
                          <Icon name="info" className="w-3 h-3" />
                          Disarankan ukuran 800×1000px (rasio 4:5)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="border-t border-ink-700/60 pt-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-sm text-ink-400 hover:text-white transition-colors"
                    >
                      Batal
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-ink-500 hidden sm:inline">
                        <span className="text-flame-400">*</span> Wajib diisi
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-flame-500 hover:bg-flame-600 disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors shadow-lg shadow-flame-500/30"
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
                          <>
                            {editingId ? 'Simpan Perubahan' : 'Simpan & Ajukan'}
                            <Icon name="arrow" className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CONCERT LIST ===== */}
      {loading ? (
        <Loading />
      ) : filteredConcerts.length === 0 ? (
        searchTerm || filterStatus !== 'all' ? (
          <div className="text-center py-12">
            <Icon name="search" className="w-12 h-12 text-ink-600 mx-auto mb-3" />
            <p className="text-ink-300">Tidak ada konser yang cocok dengan filter ini.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="text-flame-400 hover:text-flame-300 text-sm mt-2"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <EmptyState text="Panggung masih kosong. Konser pertamamu tinggal satu klik." />
        )
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredConcerts.map((concert, index) => (
              <ConcertCard
                key={concert.id}
                concert={concert}
                index={index}
                onEdit={openEdit}
                onDelete={() => setShowDeleteModal(concert)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ===== DELETE MODAL ===== */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative p-6 max-w-md w-full bg-ink-900 border border-ink-700 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
                <Icon name="trash" className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">Hapus Konser?</h3>
              <p className="text-sm text-ink-300 text-center mb-6">
                <span className="text-white font-medium">{showDeleteModal.name}</span> akan dihapus permanen.
                Semua jadwal & kategori tiket terkait juga akan terhapus.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 btn-secondary">
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}