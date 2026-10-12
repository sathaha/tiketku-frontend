import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';

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

/* Notches are cut out of the ticket with a mask, so they work on any background. */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const ticketCss = `
  .ticket-notch { -webkit-mask: ${notch}; mask: ${notch}; }
  @media (min-width: 640px) {
    .ticket-notch-sm { -webkit-mask: ${notch}; mask: ${notch}; }
  }
`;

const emptyForm = { name: '', address: '', city: '', capacity: '', latitude: '', longitude: '' };

const venueColors = [
  { bg: 'bg-blue-100', border: 'border-blue-200/60', text: 'text-blue-700', bar: 'bg-blue-500' },
  { bg: 'bg-emerald-100', border: 'border-emerald-200/60', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  { bg: 'bg-purple-100', border: 'border-purple-200/60', text: 'text-purple-700', bar: 'bg-purple-500' },
  { bg: 'bg-amber-100', border: 'border-amber-200/60', text: 'text-amber-700', bar: 'bg-amber-500' },
  { bg: 'bg-rose-100', border: 'border-rose-200/60', text: 'text-rose-700', bar: 'bg-rose-500' },
  { bg: 'bg-cyan-100', border: 'border-cyan-200/60', text: 'text-cyan-700', bar: 'bg-cyan-500' },
];

const MAX_CAPACITY_FOR_BAR = 100000;

// ===== VENUE FORM MODAL =====
function VenueFormModal({ open, editingId, form, setForm, error, saving, onSubmit, onClose }) {
  const nameRef = useRef(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => nameRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

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
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={onClose}
              className="fixed inset-0 bg-amber-950/50 z-[60]"
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="venue-form-title"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-md"
            >
              <div className="bg-white !rounded-none !border-y-0 !border-r-0 h-full flex flex-col border-l border-amber-200/60 shadow-2xl">
                <form id="venue-form" onSubmit={onSubmit} className="flex flex-col h-full min-h-0">
                  <div className="flex items-start justify-between gap-3 p-5 border-b border-amber-200/60">
                    <div>
                      <h2 id="venue-form-title" className="font-serif font-semibold text-amber-950">
                        {editingId ? 'Edit venue' : 'Add new venue'}
                      </h2>
                      <p className="font-serif text-xs text-amber-700/70 mt-0.5">
                        {editingId ? 'Update the venue details' : 'Fill in the venue details below'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close form"
                      className={`p-1.5 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors ${focusRing}`}
                    >
                      <Icon name="close" className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {error && (
                      <div
                        role="alert"
                        className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200/60 text-red-700 font-serif text-sm"
                      >
                        <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                        {error}
                      </div>
                    )}

                    {/* Basic Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="sparkle" className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold">
                          Basic Info
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="venue-name" className="block font-serif text-sm text-amber-900 mb-1.5">
                            Venue name <span className="text-amber-600">*</span>
                          </label>
                          <input
                            id="venue-name"
                            ref={nameRef}
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Example: Gelora Bung Karno"
                            className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="venue-city" className="block font-serif text-sm text-amber-900 mb-1.5">
                              City
                            </label>
                            <input
                              id="venue-city"
                              value={form.city}
                              onChange={(e) => setForm({ ...form, city: e.target.value })}
                              placeholder="Jakarta"
                              className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                            />
                          </div>

                          <div>
                            <label htmlFor="venue-capacity" className="block font-serif text-sm text-amber-900 mb-1.5">
                              Capacity
                            </label>
                            <input
                              id="venue-capacity"
                              type="number"
                              min="1"
                              value={form.capacity}
                              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                              placeholder="5000"
                              className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                            />
                            {form.capacity && Number(form.capacity) > 0 && (
                              <p className="font-serif text-xs text-amber-700/70 mt-1.5">
                                ≈ {Number(form.capacity).toLocaleString('en-US')} people
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="pt-5 border-t border-amber-200/60">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="map" className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-serif text-[10px] uppercase tracking-[0.2em] text-amber-700/70 font-semibold">
                          Location & Address
                        </span>
                      </div>

                      <div>
                        <label htmlFor="venue-address" className="block font-serif text-sm text-amber-900 mb-1.5">
                          Address
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="venue-address"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="Type manually or pick on the map"
                            className="flex-1 px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowMapPickerLocal(true)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-100 hover:bg-amber-200/60 border border-amber-200/60 rounded-xl font-serif text-xs font-medium text-amber-800 transition-colors whitespace-nowrap shrink-0 ${focusRing}`}
                          >
                            <Icon name="pin" className="w-4 h-4" />
                            Pick on map
                          </button>
                        </div>

                        {form.latitude && form.longitude && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 relative rounded-xl overflow-hidden border border-amber-200/60"
                          >
                            <iframe
                              title="Venue location preview"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(form.longitude) - 0.005}%2C${Number(form.latitude) - 0.005}%2C${Number(form.longitude) + 0.005}%2C${Number(form.latitude) + 0.005}&layer=mapnik&marker=${form.latitude}%2C${form.longitude}`}
                              className="w-full h-40"
                            />
                            <div className="absolute top-2 right-2 flex items-center gap-1.5">
                              <span className="px-2 py-1 bg-white/90 backdrop-blur-sm border border-emerald-200/60 rounded-md font-serif text-[10px] text-emerald-700 flex items-center gap-1">
                                <Icon name="check" className="w-3 h-3" />
                                Location selected
                              </span>
                              <button
                                type="button"
                                onClick={() => setForm((prev) => ({ ...prev, latitude: '', longitude: '', address: '' }))}
                                className={`p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${focusRing}`}
                                title="Remove location"
                              >
                                <Icon name="close" className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {!form.latitude && !form.longitude && (
                          <p className="font-serif text-xs text-amber-700/70 mt-1.5 flex items-center gap-1">
                            <Icon name="info" className="w-3 h-3" />
                            Pick a location on the map to show a map on the event page
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-amber-200/60 space-y-3">
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                      >
                        {saving ? (
                          <>
                            <Spinner />
                            Saving...
                          </>
                        ) : editingId ? (
                          'Save changes'
                        ) : (
                          'Add venue'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Map Picker Modal */}
      <AnimatePresence>
        {showMapPickerLocal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-amber-950/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={() => setShowMapPickerLocal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-amber-200/60 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-amber-200/60 flex items-center justify-between shrink-0">
                <h3 className="font-serif font-semibold text-amber-950">Pick venue location</h3>
                <button
                  onClick={() => setShowMapPickerLocal(false)}
                  aria-label="Close map picker"
                  className={`p-1.5 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors ${focusRing}`}
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-amber-200/60 shrink-0">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                      placeholder="Search address or place name..."
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
                    className={`px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm rounded-xl transition-colors whitespace-nowrap ${focusRing}`}
                  >
                    {searchingLocation ? 'Searching...' : 'Search'}
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
                        className={`w-full text-left p-3 rounded-xl bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/60 hover:border-amber-300 transition-all ${focusRing}`}
                      >
                        <p className="font-serif text-sm text-amber-950 font-medium">
                          {result.display_name.split(',')[0]}
                        </p>
                        <p className="font-serif text-xs text-amber-700/70 mt-0.5 line-clamp-2">
                          {result.display_name}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-3">
                      <Icon name="pin" className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="font-serif text-sm text-amber-950">Search for a venue location above</p>
                    <p className="font-serif text-xs text-amber-700/70 mt-1">
                      Use the place name or full address
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

function SkeletonVenues() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white border border-amber-200/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-amber-100 rounded" />
              <div className="h-3 w-20 bg-amber-100 rounded" />
            </div>
          </div>
          <div className="h-3 w-full bg-amber-100 rounded" />
          <div className="h-1.5 w-full bg-amber-100 rounded-full" />
          <div className="h-8 w-full bg-amber-100 rounded-lg" />
        </div>
      ))}
    </div>
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function notify(type, message) {
    setToast({ type, message, id: Date.now() });
  }

  async function fetchVenues() {
    setLoading(true);
    try {
      const res = await api.get('/venues');
      setVenues(res.data);
    } catch (err) {
      console.error('Failed to fetch venues:', err);
      notify('error', 'Failed to load venues.');
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
      setError('Capacity must be greater than 0.');
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
        notify('success', `Venue "${form.name}" updated`);
      } else {
        await api.post('/venues', payload);
        notify('success', `Venue "${form.name}" added`);
      }
      setShowForm(false);
      fetchVenues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save venue.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/venues/${deleteTarget.id}`);
      notify('success', `Venue "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchVenues();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to delete venue.');
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

  const isFiltering = !!searchQuery.trim() || sortBy !== 'name';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f5ede4]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <style>{ticketCss}</style>

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-amber-950">Manage venues</h1>
              <p className="font-serif text-sm text-amber-700/70 mt-1">
                {loading ? 'Loading venues...' : `${venues.length} venues registered`}
              </p>
            </div>
            <button
              onClick={openCreate}
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors self-start sm:self-auto ${focusRing}`}
            >
              <Icon name="plus" className="w-4 h-4" />
              Add venue
            </button>
          </header>

          {/* Stats */}
          {!loading && venues.length > 0 && (
            <div className="bg-white border border-amber-200/60 rounded-2xl grid grid-cols-3 divide-x divide-amber-200/60 mb-6">
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon name="building" className="w-3.5 h-3.5 text-amber-600" />
                  <p className="font-serif text-xs text-amber-700/70">Total venues</p>
                </div>
                <p className="font-serif text-xl font-bold text-amber-950 font-mono tabular-nums leading-none">
                  {stats.total}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon name="map" className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="font-serif text-xs text-amber-700/70">With map</p>
                </div>
                <p className="font-serif text-xl font-bold text-emerald-700 font-mono tabular-nums leading-none">
                  {stats.withMap}
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon name="users" className="w-3.5 h-3.5 text-purple-600" />
                  <p className="font-serif text-xs text-amber-700/70">Total capacity</p>
                </div>
                <p className="font-serif text-xl font-bold text-purple-700 font-mono tabular-nums leading-none">
                  {stats.totalCapacity.toLocaleString('en-US')}
                </p>
              </div>
            </div>
          )}

          {/* Search & sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                aria-label="Search venues"
                placeholder="Search name, city, or address..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Sort venues"
              className={`px-4 py-3 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all sm:w-52 ${focusRing}`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name A-Z</option>
              <option value="capacity-high">Largest capacity</option>
              <option value="capacity-low">Smallest capacity</option>
              <option value="city">City A-Z</option>
            </select>
          </div>

          {/* Venues grid */}
          {loading ? (
            <SkeletonVenues />
          ) : filteredVenues.length === 0 ? (
            <div className="bg-white border border-amber-200/60 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                <Icon name="building" className="w-6 h-6 text-amber-600" />
              </div>
              {isFiltering ? (
                <>
                  <h3 className="font-serif font-semibold text-amber-950 mb-1">No venues match</h3>
                  <p className="font-serif text-sm text-amber-700/70 mb-5">Change the keyword or reset the filter.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSortBy('name');
                    }}
                    className={`px-4 py-2 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                  >
                    Reset filter
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-serif font-semibold text-amber-950 mb-1">No venues yet</h3>
                  <p className="font-serif text-sm text-amber-700/70 mb-5">
                    Add a venue so concerts can be linked to a location.
                  </p>
                  <button
                    onClick={openCreate}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Add first venue
                  </button>
                </>
              )}
            </div>
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
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="bg-white border border-amber-200/60 rounded-2xl p-5 hover:border-amber-300 transition-colors flex flex-col"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full ${color.bg} ${color.border} border flex items-center justify-center shrink-0`}>
                        <Icon name="building" className={`w-5 h-5 ${color.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-amber-950 text-sm leading-tight truncate">
                          {venue.name}
                        </h3>
                        {venue.city && (
                          <p className="font-serif text-xs text-amber-700/70 mt-0.5 flex items-center gap-1 truncate">
                            <Icon name="pin" className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span className="truncate">{venue.city}</span>
                          </p>
                        )}
                      </div>
                      {hasMap && (
                        <span className="font-serif text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                          <Icon name="map" className="w-3 h-3" />
                          Map
                        </span>
                      )}
                    </div>

                    {venue.address && (
                      <p className="font-serif text-xs text-amber-700/70 mb-4 line-clamp-2 leading-relaxed">
                        {venue.address}
                      </p>
                    )}

                    <div className="mb-4 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 font-serif text-xs text-amber-700/70">
                          <Icon name="users" className="w-3.5 h-3.5" />
                          Capacity
                        </div>
                        <span className={`font-serif text-xs font-mono font-semibold ${capacity > 0 ? color.text : 'text-amber-700/60'}`}>
                          {capacity > 0 ? `${capacity.toLocaleString('en-US')} people` : 'Not set'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${capacityPercent}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`h-full ${color.bar} rounded-full`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-amber-200/60">
                      <button
                        onClick={() => openEdit(venue)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200/60 text-amber-900 rounded-lg font-serif text-xs font-medium transition-colors ${focusRing}`}
                      >
                        <Icon name="edit" className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(venue)}
                        aria-label={`Delete ${venue.name}`}
                        title="Delete venue"
                        className={`p-2 rounded-lg text-amber-500 hover:text-red-600 hover:bg-red-50 transition-colors ${focusRing}`}
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Form modal */}
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

          {/* Delete modal */}
          <AnimatePresence>
            {deleteTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
                onClick={() => setDeleteTarget(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white border border-amber-200/60 rounded-2xl max-w-sm w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200/60 flex items-center justify-center">
                      <Icon name="trash" className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-serif font-semibold text-amber-950 text-lg">Delete venue</h3>
                  </div>

                  <p className="font-serif text-sm text-amber-800 mb-4">
                    You are about to delete:{' '}
                    <span className="font-mono font-semibold">{deleteTarget.name}</span>
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className={`flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-serif text-sm font-semibold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${focusRing}`}
                    >
                      {deleting && <Spinner className="h-3.5 w-3.5" />}
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(null)}
                      className={`flex-1 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 rounded-xl font-serif text-sm font-semibold transition-colors ${focusRing}`}
                    >
                      Cancel
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