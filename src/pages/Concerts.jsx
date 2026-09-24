import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import api from '../api/axios';
import { getImageUrl } from '../utils/image';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    music: 'M12 2v8M12 10a3 3 0 100 6 3 3 0 000-6z M12 2l4 1v3l-4-1',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    close: 'M6 6l12 12M18 6L6 18',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

const rupiah = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

const eventDate = (item) => {
  const raw = item.date || item.start_date;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const SORTS = [
  { value: 'default', label: 'Rekomendasi' },
  { value: 'date', label: 'Tanggal terdekat' },
  { value: 'price', label: 'Harga terendah' },
];

// ===== KARTU KONSER (bentuk tiket) =====
function ConcertCard({ item, index }) {
  const d = eventDate(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/concerts/${item.id}`}
        className="group flex flex-col h-full bg-[#faf6ef] border border-amber-300/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
      >
        {/* Poster */}
        <div className="relative aspect-[4/5] bg-ink-900 overflow-hidden">
          {item.poster ? (
            <img
              src={getImageUrl(item.poster)}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-600">
              <Icon name="music" className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950/50 to-transparent" />

          <span className="absolute top-4 left-4 font-serif text-[9px] tracking-[0.3em] text-amber-100 uppercase bg-ink-950/70 backdrop-blur px-3 py-1.5 rounded-full">
            {item.category_name || 'Event'}
          </span>

          {d && (
            <div className="absolute top-4 right-4 bg-[#faf6ef] rounded-lg px-3 py-2 text-center leading-none shadow-md">
              <p className="font-serif text-2xl text-amber-950 tabular-nums">{d.getDate()}</p>
              <p className="font-serif text-[9px] tracking-[0.25em] text-amber-600 uppercase mt-1">
                {d.toLocaleDateString('id-ID', { month: 'short' })}
              </p>
            </div>
          )}
        </div>

        {/* Garis sobekan + takik */}
        <div className="relative border-t-2 border-dashed border-amber-300/70">
          <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#f5ede4] border border-amber-300/50" />
          <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#f5ede4] border border-amber-300/50" />
        </div>

        {/* Stub */}
        <div className="flex flex-col flex-1 p-5 pt-6">
          <h3 className="font-serif text-xl text-amber-950 leading-snug line-clamp-2 transition-colors group-hover:text-amber-700">
            {item.name}
          </h3>
          {item.artist && (
            <p className="font-serif text-sm italic text-amber-700/80 mt-1 truncate">{item.artist}</p>
          )}

          <div className="flex items-end justify-between gap-3 mt-auto pt-5">
            <span className="flex items-center gap-1.5 font-serif text-xs text-amber-800/70 min-w-0">
              {item.city && (
                <>
                  <Icon name="pin" className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{item.city}</span>
                </>
              )}
            </span>
            {item.min_price ? (
              <div className="text-right flex-shrink-0">
                <p className="font-serif text-[9px] tracking-[0.25em] text-amber-500/70 uppercase">Mulai dari</p>
                <p className="font-serif text-base font-bold text-amber-900 tabular-nums">{rupiah(item.min_price)}</p>
              </div>
            ) : (
              <Icon name="arrow" className="w-4 h-4 text-amber-600" />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-[#faf6ef] border border-amber-300/40 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-amber-200/40" />
      <div className="border-t-2 border-dashed border-amber-300/50" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-amber-200/50 rounded w-4/5" />
        <div className="h-3 bg-amber-200/40 rounded w-1/2" />
        <div className="h-4 bg-amber-200/50 rounded w-2/5 mt-6" />
      </div>
    </div>
  );
}

// ===== HALAMAN =====
export default function Concerts() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    api
      .get('/concerts')
      .then((res) => mounted && setConcerts(res.data || []))
      .catch((err) => {
        console.error('Failed to load concerts:', err);
        if (mounted) {
          setConcerts([]);
          setError(true);
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [reloadKey]);

  const cities = useMemo(
    () => ['all', ...new Set(concerts.map((c) => c.city).filter(Boolean))],
    [concerts]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = concerts.filter((c) => {
      const matchSearch =
        !q || c.name?.toLowerCase().includes(q) || c.artist?.toLowerCase().includes(q);
      const matchCity = cityFilter === 'all' || c.city === cityFilter;
      return matchSearch && matchCity;
    });

    if (sort === 'date') {
      const t = (c) => eventDate(c)?.getTime() ?? Infinity;
      return [...list].sort((a, b) => t(a) - t(b));
    }
    if (sort === 'price') {
      const p = (c) => (c.min_price ? Number(c.min_price) : Infinity);
      return [...list].sort((a, b) => p(a) - p(b));
    }
    return list;
  }, [concerts, search, cityFilter, sort]);

  const isFiltering = search.trim() !== '' || cityFilter !== 'all';
  const resetFilters = () => {
    setSearch('');
    setCityFilter('all');
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f5ede4] px-4 pt-14 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between gap-6 pb-8 mb-8 border-b border-dashed border-amber-900/25">
            <div>
              <span className="font-serif text-[10px] tracking-[0.4em] text-amber-600/80 uppercase">
                Semua Event
              </span>
              <h1 className="font-serif text-5xl md:text-6xl text-amber-950 mt-3 leading-[0.95]">
                Cari <span className="italic text-amber-600">Konser</span>
              </h1>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-serif text-5xl md:text-6xl text-amber-800/30 leading-none tabular-nums">
                {loading ? '--' : String(concerts.length).padStart(2, '0')}
              </p>
              <p className="font-serif text-[10px] tracking-[0.3em] text-amber-600/70 uppercase mt-2">
                konser tersedia
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="space-y-4 mb-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <label htmlFor="concert-search" className="sr-only">Cari konser</label>
                <Icon
                  name="search"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600/60 w-4 h-4 pointer-events-none"
                />
                <input
                  id="concert-search"
                  type="text"
                  placeholder="Cari nama konser atau artis..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 bg-[#faf6ef] border border-amber-300/60 rounded-full font-serif text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    <Icon name="close" className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="concert-sort" className="sr-only">Urutkan</label>
                <select
                  id="concert-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full sm:w-auto px-5 py-3.5 bg-[#faf6ef] border border-amber-300/60 rounded-full font-serif text-sm text-amber-950 focus:outline-none focus:border-amber-500/60 transition-colors"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {cities.length > 2 && (
              <div
                className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label="Filter kota"
              >
                {cities.map((c) => {
                  const active = cityFilter === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCityFilter(c)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full font-serif text-xs tracking-[0.15em] uppercase border transition-colors ${
                        active
                          ? 'bg-amber-800 border-amber-800 text-amber-50'
                          : 'border-amber-700/30 text-amber-800 hover:border-amber-700/60 hover:bg-amber-100/50'
                      }`}
                    >
                      {c === 'all' ? 'Semua Kota' : c}
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && !error && isFiltering && (
              <p className="font-serif text-xs text-amber-700/70" role="status">
                Menampilkan {filtered.length} dari {concerts.length} konser
                <button
                  type="button"
                  onClick={resetFilters}
                  className="ml-3 border-b border-amber-700/40 hover:border-amber-600 text-amber-800 hover:text-amber-600 transition-colors"
                >
                  Reset filter
                </button>
              </p>
            )}
          </div>

          {/* Konten */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="py-20 text-center border-y border-dashed border-amber-900/25">
              <h3 className="font-serif text-2xl text-amber-950 mb-2">Gagal memuat konser</h3>
              <p className="font-serif text-sm text-amber-700/70 mb-6">
                Periksa koneksi kamu, lalu coba lagi.
              </p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="px-7 py-3.5 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-xs tracking-[0.2em] uppercase rounded-full transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center border-y border-dashed border-amber-900/25">
              <Icon name="music" className="w-8 h-8 text-amber-600/70 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-amber-950 mb-2">Konser tidak ditemukan</h3>
              <p className="font-serif text-sm text-amber-700/70 mb-6">
                Coba ubah kata kunci atau filter kota.
              </p>
              {isFiltering && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-7 py-3.5 border border-amber-700/30 hover:border-amber-700/60 text-amber-800 hover:text-amber-600 font-serif text-xs tracking-[0.2em] uppercase rounded-full transition-colors"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => (
                <ConcertCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}