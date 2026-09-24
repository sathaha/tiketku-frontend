import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    plus: 'M12 4v16m8-8H4',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    tag: 'M20.59 13.41L11 3.83A2 2 0 009.59 3.24H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.58 9.59a2 2 0 002.83 0l4.59-4.6a2 2 0 000-2.82zM7 8h.01',
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
    check: 'M5 13l4 4L19 7',
    music: 'M9 18V5l12-2v13',
    close: 'M6 18L18 6M6 6l12 12',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    sparkle: 'M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// Gradient warna untuk icon kategori (index-based)
const categoryColors = [
  { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', gradient: 'from-emerald-500 to-emerald-600' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 to-purple-600' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', gradient: 'from-amber-500 to-amber-600' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', gradient: 'from-rose-500 to-rose-600' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500 to-cyan-600' },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && editingId) cancelEdit();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name: trimmed });
      } else {
        await api.post('/categories', { name: trimmed });
      }
      setName('');
      setEditingId(null);
      await fetchCategories();
      inputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan kategori.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, categoryName) {
    if (!window.confirm(`Hapus kategori "${categoryName}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori.');
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setError('');
    inputRef.current?.focus();
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setError('');
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  // Statistik ringkas
  const stats = useMemo(() => {
    const total = categories.length;
    const longest = categories.reduce((max, c) => (c.name.length > max.length ? c : max), { name: '' });
    return { total, longest: longest.name };
  }, [categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ===== HEADER ===== */}
      <div className="relative mb-6">
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-flame-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-flame-500/10 border border-flame-500/20 flex items-center justify-center">
              <Icon name="tag" className="w-5 h-5 text-flame-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Kelola Kategori</h1>
              <p className="text-sm text-ink-400 mt-0.5">
                {categories.length} kategori terdaftar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== GRID 2 KOLOM ===== */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ===== LEFT (2/3): FORM + LIST ===== */}
        <div className="lg:col-span-2 space-y-5">

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="relative card p-5 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-flame-500/20 to-transparent" />
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Icon name="tag" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input
                  ref={inputRef}
                  required
                  className="w-full input-field pl-10 bg-ink-800/50"
                  placeholder={editingId ? 'Edit nama kategori...' : 'Nama kategori baru...'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="btn-primary inline-flex items-center gap-2 whitespace-nowrap px-5"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : editingId ? (
                  <>
                    <Icon name="check" className="w-4 h-4" />
                    Update
                  </>
                ) : (
                  <>
                    <Icon name="plus" className="w-4 h-4" />
                    Tambah
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-secondary whitespace-nowrap px-4"
                >
                  Batal
                </button>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-red-400 mt-3 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* SEARCH (kalau kategori > 5) */}
          {categories.length > 5 && (
            <div className="relative">
              <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                className="w-full input-field pl-10 bg-ink-800/50"
                placeholder="Cari kategori..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}

          {/* LIST CATEGORIES */}
          {loading ? (
            <Loading />
          ) : categories.length === 0 ? (
            <EmptyState text="Belum ada kategori. Tambahkan kategori pertamamu!" />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-800 flex items-center justify-center">
                <Icon name="search" className="w-6 h-6 text-ink-500" />
              </div>
              <p className="text-sm text-ink-400">
                Tidak ada kategori yang cocok dengan &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {filtered.map((category, index) => {
                  const isEditing = editingId === category.id;
                  const color = categoryColors[index % categoryColors.length];
                  return (
                    <motion.div
                      key={category.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={`group relative card p-4 transition-all duration-200 ${
                        isEditing
                          ? 'border-flame-500/30 bg-flame-500/5'
                          : 'hover:bg-ink-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Icon dengan warna bergilir */}
                          <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.border} border flex items-center justify-center flex-shrink-0`}>
                            <Icon name="tag" className={`w-4 h-4 ${color.text}`} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-white block truncate">
                              {category.name}
                            </span>
                            <span className="text-xs text-ink-400 mt-0.5 block">
                              {isEditing ? 'Sedang diedit' : 'Kategori event'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(category)}
                            className="p-2 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-all"
                            aria-label={`Edit kategori ${category.name}`}
                          >
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="p-2 rounded-lg text-ink-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            aria-label={`Hapus kategori ${category.name}`}
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && categories.length > 0 && (
            <p className="text-xs text-ink-500 text-center mt-4">
              Total {categories.length} kategori • Klik ikon edit untuk mengubah
            </p>
          )}
        </div>

        {/* ===== RIGHT (1/3): SIDEBAR PANEL ===== */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">

          {/* Card: Ringkasan */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-flame-500/10 flex items-center justify-center">
                <Icon name="sparkle" className="w-4 h-4 text-flame-400" />
              </div>
              <h3 className="font-semibold text-white">Ringkasan</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400">Total Kategori</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">
                  {stats.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400">Ditampilkan</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">
                  {filtered.length}
                </span>
              </div>
              {stats.longest && (
                <div className="pt-3 border-t border-ink-700/50">
                  <span className="text-[10px] text-ink-500 uppercase tracking-wider block mb-1">
                    Nama terpanjang
                  </span>
                  <span className="text-xs text-ink-200 break-all">
                    {stats.longest}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Tips */}
          <div className="card p-5 bg-gradient-to-br from-flame-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="info" className="w-4 h-4 text-flame-400" />
              <h3 className="font-semibold text-white text-sm">Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-ink-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-flame-400 mt-1.5 flex-shrink-0" />
                Gunakan nama kategori yang singkat dan jelas.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-flame-400 mt-1.5 flex-shrink-0" />
                Kategori akan muncul di filter event user.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-flame-400 mt-1.5 flex-shrink-0" />
                Tekan <kbd className="px-1 py-0.5 bg-ink-800 rounded text-[10px] font-mono">Esc</kbd> untuk batal edit.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}