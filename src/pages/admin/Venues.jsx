import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';

/* ============ ICONS ============ */
const ICON_PATHS = {
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
  map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
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

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');
  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }
`;

/* Ticket notches: cut out with a mask so they work on any background */
const STUB_WIDTH = 104;
const notchMask = {
  WebkitMaskImage: `radial-gradient(circle at calc(100% - ${STUB_WIDTH}px) 0, #0000 9px, #000 9.5px), radial-gradient(circle at calc(100% - ${STUB_WIDTH}px) 100%, #0000 9px, #000 9.5px)`,
  maskImage: `radial-gradient(circle at calc(100% - ${STUB_WIDTH}px) 0, #0000 9px, #000 9.5px), radial-gradient(circle at calc(100% - ${STUB_WIDTH}px) 100%, #0000 9px, #000 9.5px)`,
  WebkitMaskComposite: 'source-in',
  maskComposite: 'intersect',
};

const emptyForm = { name: '', address: '', city: '', capacity: '', latitude: '', longitude: '' };

const inputCls =
  'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';
const labelCls = 'block text-sm font-medium text-amber-900 mb-1.5';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const formatCapacity = (n) => (n >= 10000 ? compact.format(n) : n.toLocaleString('en-US'));

/* ============ VENUE FORM DRAWER + MAP PICKER ============ */
function VenueFormModal({ open, editingId, form, setForm, error, saving, onSubmit, onClose }) {
  const nameRef = useRef(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [mapResults, setMapResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => nameRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (showMapPicker) setShowMapPicker(false);
      else onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, showMapPicker]);

  function closeMapPicker() {
    setShowMapPicker(false);
    setMapResults([]);
    setMapSearch('');
    setSearchError('');
    setHasSearched(false);
  }

  async function searchLocation() {
    if (!mapSearch.trim()) return;
    setSearchingLocation(true);
    setSearchError('');
    try {
      const query = encodeURIComponent(mapSearch);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setMapResults(data);
      setHasSearched(true);
    } catch (err) {
      console.error('Failed to search location:', err);
      setSearchError("Couldn't search right now. Check your connection and try again.");
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
    closeMapPicker();
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
              className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-[60]"
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
              className="f-body fixed inset-y-0 right-0 z-[70] w-full max-w-md"
            >
              <div className="bg-white h-full flex flex-col shadow-2xl shadow-amber-950/30">
                <form id="venue-form" onSubmit={onSubmit} className="flex flex-col h-full min-h-0">
                  <div className="flex items-start justify-between gap-3 p-5 bg-amber-950 text-amber-50">
                    <div>
                      <h2 id="venue-form-title" className="f-display text-xl font-semibold">
                        {editingId ? 'Edit venue' : 'Add a venue'}
                      </h2>
                      <p className="text-sm text-amber-200/70 mt-0.5">
                        {editingId ? 'Update the details below.' : 'Concerts can be linked to it once it exists.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close form"
                      className={`-mr-1.5 -mt-1 p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors ${focusRing}`}
                    >
                      <Icon name="close" className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {error && (
                      <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                        <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                        {error}
                      </div>
                    )}

                    {/* Basic info */}
                    <section>
                      <h3 className="f-display text-lg font-semibold text-amber-950 mb-3">Basic info</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="venue-name" className={labelCls}>
                            Venue name <span className="text-amber-600">*</span>
                          </label>
                          <input
                            id="venue-name"
                            ref={nameRef}
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Gelora Bung Karno"
                            className={inputCls}
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="venue-city" className={labelCls}>City</label>
                            <input
                              id="venue-city"
                              value={form.city}
                              onChange={(e) => setForm({ ...form, city: e.target.value })}
                              placeholder="Jakarta"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label htmlFor="venue-capacity" className={labelCls}>Capacity</label>
                            <input
                              id="venue-capacity"
                              type="number"
                              min="1"
                              inputMode="numeric"
                              value={form.capacity}
                              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                              placeholder="5000"
                              className={`${inputCls} tabular-nums`}
                            />
                            {form.capacity && Number(form.capacity) > 0 && (
                              <p className="text-xs text-amber-700/80 mt-1.5 tabular-nums">
                                About {Number(form.capacity).toLocaleString('en-US')} people
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Location */}
                    <section className="pt-6 border-t border-dashed border-amber-200">
                      <h3 className="f-display text-lg font-semibold text-amber-950 mb-3">Location</h3>

                      <label htmlFor="venue-address" className={labelCls}>Address</label>
                      <div className="flex gap-2">
                        <input
                          id="venue-address"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="Type it, or pick on the map"
                          className={`${inputCls} flex-1 min-w-0`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowMapPicker(true)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200/70 rounded-xl text-sm font-medium text-amber-900 transition-colors whitespace-nowrap shrink-0 ${focusRing}`}
                        >
                          <Icon name="pin" className="w-4 h-4" />
                          Pick on map
                        </button>
                      </div>

                      {form.latitude && form.longitude ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 relative rounded-xl overflow-hidden ring-1 ring-amber-200"
                        >
                          <iframe
                            title="Venue location preview"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(form.longitude) - 0.005}%2C${Number(form.latitude) - 0.005}%2C${Number(form.longitude) + 0.005}%2C${Number(form.latitude) + 0.005}&layer=mapnik&marker=${form.latitude}%2C${form.longitude}`}
                            className="w-full h-40"
                          />
                          <div className="absolute top-2 right-2 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 bg-white/95 rounded-full text-xs font-medium text-emerald-700 flex items-center gap-1">
                              <Icon name="check" className="w-3 h-3" />
                              Location set
                            </span>
                            <button
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, latitude: '', longitude: '', address: '' }))}
                              aria-label="Remove location"
                              className={`p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors ${focusRing}`}
                              title="Remove location"
                            >
                              <Icon name="close" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <p className="text-sm text-amber-700/80 mt-2 flex items-start gap-1.5">
                          <Icon name="info" className="w-4 h-4 shrink-0 mt-0.5" />
                          Pick a spot on the map so the event page can show where the venue is.
                        </p>
                      )}
                    </section>
                  </div>

                  <div className="p-4 border-t border-dashed border-amber-200">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
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
                          'Save changes'
                        ) : (
                          'Add venue'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Map picker */}
      <AnimatePresence>
        {open && showMapPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-amber-950/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={closeMapPicker}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Pick venue location"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="f-body bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl shadow-amber-950/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 bg-amber-950 text-amber-50 flex items-center justify-between shrink-0">
                <h3 className="f-display text-xl font-semibold">Find the venue</h3>
                <button
                  onClick={closeMapPicker}
                  aria-label="Close map picker"
                  className={`p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors ${focusRing}`}
                >
                  <Icon name="close" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-dashed border-amber-200 shrink-0">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <input
                      type="text"
                      autoFocus
                      aria-label="Search address or place name"
                      className={`${inputCls} pl-10`}
                      placeholder="Search by place name or address"
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
                    type="button"
                    onClick={searchLocation}
                    disabled={searchingLocation}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${focusRing}`}
                  >
                    {searchingLocation && <Spinner />}
                    {searchingLocation ? 'Searching…' : 'Search'}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {searchError ? (
                  <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                    {searchError}
                  </div>
                ) : mapResults.length > 0 ? (
                  <ul className="space-y-2">
                    {mapResults.map((result, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => selectLocation(result)}
                          className={`w-full text-left p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors ${focusRing}`}
                        >
                          <p className="text-sm text-amber-950 font-semibold">{result.display_name.split(',')[0]}</p>
                          <p className="text-xs text-amber-700/80 mt-0.5 line-clamp-2">{result.display_name}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3 text-amber-600">
                      <Icon name="pin" className="w-6 h-6" />
                    </div>
                    <p className="f-display text-lg font-semibold text-amber-950">
                      {hasSearched ? 'Nothing found' : 'Search for the venue'}
                    </p>
                    <p className="text-sm text-amber-800/80 mt-1">
                      {hasSearched ? 'Try the full address or a nearby landmark.' : 'Use the place name or the full address.'}
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

/* ============ VENUE TICKET CARD ============ */
function VenueCard({ venue, onEdit, onDelete }) {
  const capacity = Number(venue.capacity) || 0;
  const hasMap = venue.latitude && venue.longitude;

  return (
    <motion.article
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_8px_16px_rgba(69,26,3,0.16)] transition-[filter] duration-200"
    >
      <div style={notchMask} className="flex bg-white rounded-2xl overflow-hidden h-full">
        {/* Main section */}
        <div className="flex-1 min-w-0 p-4 flex flex-col">
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Icon name="building" className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="f-display text-lg font-semibold text-amber-950 leading-snug truncate">{venue.name}</h3>
              <p className="text-sm text-amber-700/80 flex items-center gap-1 truncate">
                <Icon name="pin" className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{venue.city || 'City not set'}</span>
              </p>
            </div>
          </div>

          {venue.address ? (
            <p className="text-sm text-amber-800 mt-3 line-clamp-2 leading-relaxed">{venue.address}</p>
          ) : (
            <p className="text-sm text-amber-700/60 mt-3">No address yet</p>
          )}

          {hasMap && (
            <span className="mt-3 self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-xs font-medium text-emerald-700">
              <Icon name="map" className="w-3 h-3" />
              Map ready
            </span>
          )}

          <div className="flex items-center gap-2 mt-auto pt-4">
            <button
              onClick={() => onEdit(venue)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200/70 text-amber-900 rounded-lg text-xs font-medium transition-colors ${focusRing}`}
            >
              <Icon name="edit" className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => onDelete(venue)}
              aria-label={`Delete ${venue.name}`}
              title="Delete venue"
              className={`p-2 rounded-lg text-amber-600 hover:text-red-600 hover:bg-red-50 transition-colors ${focusRing}`}
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Capacity stub */}
        <div
          style={{ width: STUB_WIDTH }}
          className="shrink-0 flex flex-col items-center justify-center text-center bg-amber-100 border-l border-dashed border-amber-400/70 px-2"
        >
          <Icon name="users" className="w-4 h-4 text-amber-600" />
          <span className="text-xs text-amber-700/80 mt-1">Capacity</span>
          <span
            className={`f-display text-2xl font-bold leading-none my-1 tabular-nums ${capacity > 0 ? 'text-amber-950' : 'text-amber-700/50'}`}
            title={capacity > 0 ? `${capacity.toLocaleString('en-US')} people` : undefined}
          >
            {capacity > 0 ? formatCapacity(capacity) : '-'}
          </span>
          <span className="text-xs text-amber-700/80">{capacity > 0 ? 'people' : 'not set'}</span>
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonVenues() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse" role="status" aria-label="Loading venues">
      {[...Array(6)].map((_, i) => (
        <div key={i} style={notchMask} className="flex bg-white rounded-2xl overflow-hidden h-44">
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-32 bg-amber-100 rounded" />
                <div className="h-3 w-20 bg-amber-100 rounded" />
              </div>
            </div>
            <div className="h-3 w-full bg-amber-100 rounded" />
            <div className="h-3 w-2/3 bg-amber-100 rounded" />
          </div>
          <div style={{ width: STUB_WIDTH }} className="bg-amber-100 border-l border-dashed border-amber-300" />
        </div>
      ))}
    </div>
  );
}

/* ============ MAIN ============ */
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

  useEffect(() => {
    if (!deleteTarget) return;
    const onKey = (e) => e.key === 'Escape' && !deleting && setDeleteTarget(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleteTarget, deleting]);

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
      notify('error', "Couldn't load venues. Please try again.");
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

  const closeForm = useCallback(() => {
    setShowForm(false);
    setError('');
  }, []);

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
        notify('success', `"${form.name}" updated`);
      } else {
        await api.post('/venues', payload);
        notify('success', `"${form.name}" added`);
      }
      setShowForm(false);
      fetchVenues();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the venue. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/venues/${deleteTarget.id}`);
      notify('success', `"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchVenues();
    } catch (err) {
      notify('error', err.response?.data?.message || "Couldn't delete the venue. Please try again.");
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
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="f-display text-3xl font-bold text-amber-950">Manage venues</h1>
              <p className="text-sm text-amber-700/80 mt-1">
                {loading ? 'Loading venues…' : `${venues.length} ${venues.length === 1 ? 'venue' : 'venues'} registered`}
              </p>
            </div>
            <button
              onClick={openCreate}
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors self-start sm:self-auto ${focusRing}`}
            >
              <Icon name="plus" className="w-4 h-4" />
              Add venue
            </button>
          </header>

          {/* Stats */}
          {!loading && venues.length > 0 && (
            <section aria-label="Summary" className="bg-white rounded-2xl grid grid-cols-3 divide-x divide-dashed divide-amber-200 mb-6">
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-1.5 text-sm text-amber-700/90">
                  <Icon name="building" className="w-4 h-4 text-amber-500" />
                  Venues
                </div>
                <p className="f-display text-2xl font-bold text-amber-950 tabular-nums leading-none">{stats.total}</p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-1.5 text-sm text-amber-700/90">
                  <Icon name="map" className="w-4 h-4 text-emerald-600" />
                  With a map
                </div>
                <p className="f-display text-2xl font-bold text-emerald-700 tabular-nums leading-none">{stats.withMap}</p>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-1.5 text-sm text-amber-700/90">
                  <Icon name="users" className="w-4 h-4 text-amber-500" />
                  Total capacity
                </div>
                <p className="f-display text-2xl font-bold text-amber-950 tabular-nums leading-none">
                  {stats.totalCapacity.toLocaleString('en-US')}
                </p>
              </div>
            </section>
          )}

          {/* Search and sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                aria-label="Search venues"
                placeholder="Search by name, city or address"
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Sort venues"
              className={`px-4 py-3 bg-white rounded-xl text-sm text-amber-950 sm:w-52 cursor-pointer ${focusRing}`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name, A to Z</option>
              <option value="capacity-high">Largest capacity</option>
              <option value="capacity-low">Smallest capacity</option>
              <option value="city">City, A to Z</option>
            </select>
          </div>

          {/* Venues grid */}
          {loading ? (
            <SkeletonVenues />
          ) : filteredVenues.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                <Icon name="building" className="w-6 h-6" />
              </div>
              {isFiltering ? (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No venues match</h3>
                  <p className="text-sm text-amber-800/80 mb-5">Change the keyword or reset the filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSortBy('name');
                    }}
                    className={`px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No venues yet</h3>
                  <p className="text-sm text-amber-800/80 mb-5">Add a venue so concerts can be linked to a location.</p>
                  <button
                    onClick={openCreate}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Add the first venue
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} onEdit={openEdit} onDelete={setDeleteTarget} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Form drawer */}
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
                onClick={() => !deleting && setDeleteTarget(null)}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Delete venue"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="f-body bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl shadow-amber-950/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
                    <Icon name="trash" className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="f-display text-xl font-semibold text-amber-950 text-center mb-2">Delete this venue?</h3>
                  <p className="text-sm text-amber-900 text-center font-semibold mb-1 break-words">{deleteTarget.name}</p>
                  <p className="text-sm text-amber-800 text-center mb-6">This can't be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteTarget(null)}
                      disabled={deleting}
                      className={`flex-1 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${focusRing}`}
                    >
                      Keep venue
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