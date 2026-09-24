import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    plus: 'M12 4v16m8-8H4',
    close: 'M6 18L18 6M6 6l12 12',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    check: 'M5 13l4 4L19 7',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16',
    sparkle: 'M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

const emptyForm = { name: '', address: '', city: '', capacity: '', latitude: '', longitude: '' };

const venueColors = [
  { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', bar: 'bg-blue-500' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', bar: 'bg-purple-500' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-500' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', bar: 'bg-rose-500' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', bar: 'bg-cyan-500' },
];

const MAX_CAPACITY_FOR_BAR = 100000;

// ===== INPUT dengan icon prefix + helper text =====
function FormInput({ label, required, icon, value, onChange, placeholder, type = 'text', helper, autoFocus }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-300 mb-2 uppercase tracking-wider">
        {label} {required && <span className="text-flame-400">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-ink-800/60 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-flame-500/10">
            <Icon name={icon} className="w-3.5 h-3.5 text-ink-400 transition-colors group-focus-within:text-flame-400" />
          </div>
        )}
        <input
          type={type}
          required={required}
          autoFocus={autoFocus}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-14' : 'pl-4'} pr-4 py-3 bg-ink-900/50 border border-ink-700 hover:border-ink-600 rounded-xl text-sm text-white placeholder-ink-500 focus:outline-none focus:border-flame-500/60 focus:ring-2 focus:ring-flame-500/20 transition-all`}
        />
      </div>
      {helper && (
        <p className="text-[11px] text-ink-500 mt-1.5">{helper}</p>
      )}
    </div>
  );
}

// ===== MODAL FORM VENUE =====
function VenueFormModal({ open, editingId, form, setForm, error, saving, onSubmit, onClose }) {
  const nameRef = useRef(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => nameRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const [showMapPickerLocal, setShowMapPickerLocal] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [mapResults, setMapResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);

  async function searchLocation() {
    if (!mapSearch.trim()) return;
    setSearchingLocation(true);
    try {
      const query = encodeURIComponent(mapSearch);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
      const data = await res.json();
      setMapResults(data);
    } catch (err) {
      console.error('Failed to search location:', err);
      alert('Gagal mencari lokasi. Coba lagi.');
    } finally {
      setSearchingLocation(false);
    }
  }

  function selectLocation(location) {
    setForm((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lon,
      address: location.display_name.split(',').slice(0, 3).join(','),
    }));
    setMapResults([]);
    setMapSearch('');
    setShowMapPickerLocal(false);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-ink-900 border border-ink-700 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-black/50"
            >
              {/* ===== HEADER ===== */}
              <div className="relative px-6 py-5 border-b border-ink-700/60 shrink-0">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-flame-500 via-orange-500 to-transparent" />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-flame-500/10 border border-flame-500/20 flex items-center justify-center">
                      <Icon name={editingId ? 'edit' : 'plus'} className="w-5 h-5 text-flame-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white leading-tight">
                        {editingId ? 'Edit Venue' : 'Tambah Venue Baru'}
                      </h2>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {editingId ? 'Perbarui detail venue' : 'Lengkapi data venue di bawah ini'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors shrink-0"
                    aria-label="Close"
                  >
                    <Icon name="close" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ===== BODY (scrollable) ===== */}
              <form id="venue-form" onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* ===== SECTION: Info Dasar ===== */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="sparkle" className="w-3.5 h-3.5 text-flame-400" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-ink-500 font-semibold">
                      Info Dasar
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-ink-300 mb-2 uppercase tracking-wider">
                        Nama Venue <span className="text-flame-400">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-ink-800/60 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-flame-500/10">
                          <Icon name="building" className="w-3.5 h-3.5 text-ink-400 transition-colors group-focus-within:text-flame-400" />
                        </div>
                        <input
                          ref={nameRef}
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Contoh: Gelora Bung Karno"
                          className="w-full pl-14 pr-4 py-3 bg-ink-900/50 border border-ink-700 hover:border-ink-600 rounded-xl text-sm text-white placeholder-ink-500 focus:outline-none focus:border-flame-500/60 focus:ring-2 focus:ring-flame-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-ink-300 mb-2 uppercase tracking-wider">
                          Kota
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-ink-800/60 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-flame-500/10">
                            <Icon name="pin" className="w-3.5 h-3.5 text-ink-400 transition-colors group-focus-within:text-flame-400" />
                          </div>
                          <input
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            placeholder="Jakarta"
                            className="w-full pl-14 pr-4 py-3 bg-ink-900/50 border border-ink-700 hover:border-ink-600 rounded-xl text-sm text-white placeholder-ink-500 focus:outline-none focus:border-flame-500/60 focus:ring-2 focus:ring-flame-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink-300 mb-2 uppercase tracking-wider">
                          Kapasitas
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-ink-800/60 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-flame-500/10">
                            <Icon name="users" className="w-3.5 h-3.5 text-ink-400 transition-colors group-focus-within:text-flame-400" />
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={form.capacity}
                            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                            placeholder="5000"
                            className="w-full pl-14 pr-4 py-3 bg-ink-900/50 border border-ink-700 hover:border-ink-600 rounded-xl text-sm text-white placeholder-ink-500 focus:outline-none focus:border-flame-500/60 focus:ring-2 focus:ring-flame-500/20 transition-all"
                          />
                        </div>
                        {form.capacity && Number(form.capacity) > 0 && (
                          <p className="text-[11px] text-ink-500 mt-1.5">
                            ≈ {Number(form.capacity).toLocaleString('id-ID')} orang
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===== SECTION: Lokasi ===== */}
                <div className="pt-5 border-t border-ink-700/60">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="map" className="w-3.5 h-3.5 text-flame-400" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-ink-500 font-semibold">
                      Lokasi & Alamat
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-300 mb-2 uppercase tracking-wider">
                      Alamat
                    </label>
                    <div className="flex gap-2">
                      <div className="relative group flex-1">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-ink-800/60 flex items-center justify-center pointer-events-none transition-colors group-focus-within:bg-flame-500/10">
                          <Icon name="map" className="w-3.5 h-3.5 text-ink-400 transition-colors group-focus-within:text-flame-400" />
                        </div>
                        <input
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="Ketik manual atau pilih di map"
                          className="w-full pl-14 pr-4 py-3 bg-ink-900/50 border border-ink-700 hover:border-ink-600 rounded-xl text-sm text-white placeholder-ink-500 focus:outline-none focus:border-flame-500/60 focus:ring-2 focus:ring-flame-500/20 transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMapPickerLocal(true)}
                        className="inline-flex items-center gap-2 px-4 py-3 bg-flame-500/10 hover:bg-flame-500/20 border border-flame-500/30 rounded-xl text-xs font-medium text-flame-400 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Icon name="pin" className="w-4 h-4" />
                        Pilih di Map
                      </button>
                    </div>

                    {form.latitude && form.longitude && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 relative rounded-xl overflow-hidden border border-ink-700"
                      >
                        <iframe
                          title="Venue location preview"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(form.longitude) - 0.005}%2C${Number(form.latitude) - 0.005}%2C${Number(form.longitude) + 0.005}%2C${Number(form.latitude) + 0.005}&layer=mapnik&marker=${form.latitude}%2C${form.longitude}`}
                          className="w-full h-40"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          <span className="px-2 py-1 bg-ink-950/80 backdrop-blur-sm border border-ink-700 rounded-md text-[10px] text-emerald-400 flex items-center gap-1">
                            <Icon name="check" className="w-3 h-3" />
                            Lokasi dipilih
                          </span>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, latitude: '', longitude: '', address: '' }))}
                            className="p-1.5 bg-red-500/90 text-white rounded-md hover:bg-red-600 transition-colors"
                            title="Hapus lokasi"
                          >
                            <Icon name="close" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {!form.latitude && !form.longitude && (
                      <p className="text-[11px] text-ink-500 mt-1.5 flex items-center gap-1">
                        <Icon name="info" className="w-3 h-3" />
                        Pilih lokasi di map untuk menampilkan peta di halaman event
                      </p>
                    )}
                  </div>
                </div>
              </form>

              {/* ===== FOOTER (sticky) ===== */}
              <div className="px-6 py-4 bg-ink-900/80 backdrop-blur-md border-t border-ink-700/60 flex items-center justify-between gap-3 shrink-0">
                <p className="text-[11px] text-ink-500 hidden sm:block">
                  <span className="text-flame-400">*</span> Wajib diisi
                </p>
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-ink-300 hover:text-white hover:bg-ink-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="venue-form"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-flame-500 hover:bg-flame-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-flame-500/30"
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
                        <Icon name="check" className="w-4 h-4" />
                        {editingId ? 'Simpan Perubahan' : 'Tambah Venue'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAP PICKER MODAL (nested) ===== */}
      <AnimatePresence>
        {showMapPickerLocal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowMapPickerLocal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ink-900 border border-ink-700 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-ink-700 flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-white">Pilih Lokasi Venue</h3>
                <button
                  onClick={() => setShowMapPickerLocal(false)}
                  className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors"
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-ink-700 shrink-0">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-2.5 bg-ink-900/50 border border-ink-700 rounded-xl text-sm text-white placeholder-ink-500 focus:outline-none focus:border-flame-500/60 focus:ring-2 focus:ring-flame-500/20 transition-all"
                      placeholder="Cari alamat atau nama tempat..."
                      value={mapSearch}
                      onChange={(e) => setMapSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          searchLocation();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={searchLocation}
                    disabled={searchingLocation}
                    className="px-4 py-2.5 bg-flame-500 hover:bg-flame-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    {searchingLocation ? 'Mencari...' : 'Cari'}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {mapResults.length > 0 ? (
                  <div className="space-y-2">
                    {mapResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => selectLocation(result)}
                        className="w-full text-left p-3 rounded-xl bg-ink-800/50 hover:bg-ink-700 border border-transparent hover:border-flame-500/30 transition-all"
                      >
                        <p className="text-sm text-white font-medium">
                          {result.display_name.split(',')[0]}
                        </p>
                        <p className="text-xs text-ink-400 mt-0.5 line-clamp-2">
                          {result.display_name}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="pin" className="w-12 h-12 text-ink-600 mx-auto mb-3" />
                    <p className="text-sm text-ink-300">Cari lokasi venue di atas</p>
                    <p className="text-xs text-ink-500 mt-1">
                      Gunakan nama tempat atau alamat lengkap
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchVenues();
  }, []);

  async function fetchVenues() {
    setLoading(true);
    try {
      const res = await api.get('/venues');
      setVenues(res.data);
    } catch (err) {
      console.error('Failed to fetch venues:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowForm(true);
  }

  function openEdit(v) {
    setForm({
      name: v.name,
      address: v.address || '',
      city: v.city || '',
      capacity: v.capacity || '',
      latitude: v.latitude || '',
      longitude: v.longitude || '',
    });
    setEditingId(v.id);
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.capacity && Number(form.capacity) <= 0) {
      setError('Kapasitas harus lebih dari 0.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        capacity: form.capacity,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
      };

      if (editingId) {
        await api.put(`/venues/${editingId}`, payload);
        setSuccessMsg(`Venue "${form.name}" berhasil diperbarui`);
      } else {
        await api.post('/venues', payload);
        setSuccessMsg(`Venue "${form.name}" berhasil ditambahkan`);
      }
      setShowForm(false);
      fetchVenues();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan venue.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/venues/${deleteTarget.id}`);
      setSuccessMsg(`Venue "${deleteTarget.name}" berhasil dihapus`);
      setDeleteTarget(null);
      fetchVenues();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus venue.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const filteredVenues = useMemo(() => {
    let result = [...venues];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.name?.toLowerCase().includes(q) ||
          v.city?.toLowerCase().includes(q) ||
          v.address?.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'capacity-high':
        result.sort((a, b) => Number(b.capacity || 0) - Number(a.capacity || 0));
        break;
      case 'capacity-low':
        result.sort((a, b) => Number(a.capacity || 0) - Number(b.capacity || 0));
        break;
      case 'city':
        result.sort((a, b) => (a.city || '').localeCompare(b.city || ''));
        break;
      default:
        break;
    }
    return result;
  }, [venues, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const total = venues.length;
    const withMap = venues.filter((v) => v.latitude && v.longitude).length;
    const totalCapacity = venues.reduce((sum, v) => sum + (Number(v.capacity) || 0), 0);
    return { total, withMap, totalCapacity };
  }, [venues]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* HEADER */}
      <div className="relative mb-6">
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-flame-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-flame-500/10 border border-flame-500/20 flex items-center justify-center">
              <Icon name="building" className="w-5 h-5 text-flame-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Kelola Venue</h1>
              <p className="text-sm text-ink-400 mt-0.5">
                {venues.length} venue terdaftar
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-flame-500 hover:bg-flame-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-flame-500/20 self-start sm:self-auto"
          >
            <Icon name="plus" className="w-4 h-4" />
            Tambah Venue
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-ink-800/40 border border-ink-700 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="building" className="w-3.5 h-3.5 text-flame-400" />
            <p className="text-xs text-ink-400">Total Venue</p>
          </div>
          <p className="text-lg font-semibold text-white font-mono tabular-nums">{stats.total}</p>
        </div>
        <div className="bg-ink-800/40 border border-ink-700 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="map" className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs text-ink-400">Punya Map</p>
          </div>
          <p className="text-lg font-semibold text-emerald-400 font-mono tabular-nums">{stats.withMap}</p>
        </div>
        <div className="bg-ink-800/40 border border-ink-700 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="users" className="w-3.5 h-3.5 text-purple-400" />
            <p className="text-xs text-ink-400">Total Kapasitas</p>
          </div>
          <p className="text-lg font-semibold text-purple-400 font-mono tabular-nums">
            {stats.totalCapacity.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* SEARCH & SORT */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            placeholder="Cari nama, kota, atau alamat..."
            className="w-full pl-10 pr-4 py-2.5 bg-ink-800/40 border border-ink-700 rounded-xl text-sm text-white placeholder-ink-500 focus:outline-none focus:border-flame-500/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-ink-800/40 border border-ink-700 rounded-xl text-sm text-white focus:outline-none focus:border-flame-500/50 transition-colors sm:w-48"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Nama A-Z</option>
          <option value="capacity-high">Kapasitas Terbesar</option>
          <option value="capacity-low">Kapasitas Terkecil</option>
          <option value="city">Kota A-Z</option>
        </select>
      </div>

      {/* SUCCESS MESSAGE */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
          >
            <Icon name="check" className="w-4 h-4 shrink-0" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== FORM MODAL ===== */}
      <VenueFormModal
        open={showForm}
        editingId={editingId}
        form={form}
        setForm={setForm}
        error={error}
        saving={saving}
        onSubmit={handleSubmit}
        onClose={closeForm}
      />

      {/* ===== VENUES GRID ===== */}
      {loading ? (
        <Loading />
      ) : filteredVenues.length === 0 ? (
        <EmptyState text="Tidak ada venue yang ditemukan." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVenues.map((venue, index) => {
            const color = venueColors[index % venueColors.length];
            const capacity = Number(venue.capacity) || 0;
            const capacityPercent = Math.min(100, (capacity / MAX_CAPACITY_FOR_BAR) * 100);
            const hasMap = venue.latitude && venue.longitude;

            return (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -3 }}
                className="group card p-5 hover:border-flame-500/30 transition-all flex flex-col"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full ${color.bg} ${color.border} border flex items-center justify-center shrink-0`}>
                    <Icon name="building" className={`w-5 h-5 ${color.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm leading-tight truncate">
                      {venue.name}
                    </h3>
                    {venue.city && (
                      <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1 truncate">
                        <Icon name="pin" className="w-3 h-3 text-ink-500 flex-shrink-0" />
                        <span className="truncate">{venue.city}</span>
                      </p>
                    )}
                  </div>
                  {hasMap && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                      <Icon name="map" className="w-3 h-3" />
                      Map
                    </span>
                  )}
                </div>

                {venue.address && (
                  <p className="text-xs text-ink-400 mb-4 line-clamp-2 leading-relaxed">
                    {venue.address}
                  </p>
                )}

                <div className="mb-4 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-ink-400">
                      <Icon name="users" className="w-3.5 h-3.5" />
                      Kapasitas
                    </div>
                    <span className={`text-xs font-mono font-semibold ${capacity > 0 ? color.text : 'text-ink-500'}`}>
                      {capacity > 0 ? `${capacity.toLocaleString('id-ID')} orang` : 'Belum diatur'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-ink-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${capacityPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full ${color.bar} rounded-full`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-ink-700/60">
                  <button
                    onClick={() => openEdit(venue)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-ink-700/50 hover:bg-ink-700 text-ink-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Icon name="edit" className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(venue)}
                    className="p-2 rounded-lg text-ink-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Hapus"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* DELETE MODAL */}
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
              className="bg-ink-800 border border-ink-700 rounded-2xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Icon name="trash" className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white text-lg">Hapus Venue</h3>
              </div>

              <p className="text-ink-300 text-sm mb-4">
                Kamu akan menghapus: <span className="text-white font-medium">{deleteTarget.name}</span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Menghapus...' : 'Hapus'}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
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