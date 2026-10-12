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

// Color gradients for category icons (index-based)
const categoryColors = [
  { bg: 'bg-blue-100', border: 'border-blue-200/60', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', border: 'border-emerald-200/60', text: 'text-emerald-700' },
  { bg: 'bg-purple-100', border: 'border-purple-200/60', text: 'text-purple-700' },
  { bg: 'bg-amber-100', border: 'border-amber-200/60', text: 'text-amber-700' },
  { bg: 'bg-rose-100', border: 'border-rose-200/60', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', border: 'border-cyan-200/60', text: 'text-cyan-700' },
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
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, categoryName) {
    if (!window.confirm(`Delete category "${categoryName}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
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

  // Summary stats
  const stats = useMemo(() => {
    const total = categories.length;
    const longest = categories.reduce((max, c) => (c.name.length > max.length ? c : max), { name: '' });
    return { total, longest: longest.name };
  }, [categories]);

  return (
    <div className="min-h-screen bg-[#f5ede4] px-4 py-6">
      <div className="max-w-7xl mx-auto">

        {/* ===== HEADER ===== */}
        <div className="relative mb-6">
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200/60 flex items-center justify-center">
                <Icon name="tag" className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h1 className="font-serif text-2xl text-amber-950">Manage Categories</h1>
                <p className="font-serif text-sm text-amber-700/60 mt-0.5">
                  {categories.length} categories registered
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 2-COLUMN GRID ===== */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* ===== LEFT (2/3): FORM + LIST ===== */}
          <div className="lg:col-span-2 space-y-5">

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="relative bg-white/90 border border-amber-200/60 rounded-2xl p-5 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Icon name="tag" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input
                    ref={inputRef}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                    placeholder={editingId ? 'Edit category name...' : 'New category name...'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="inline-flex items-center gap-2 whitespace-nowrap px-5 py-3 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm tracking-wide rounded-xl transition-colors"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Icon name="check" className="w-4 h-4" />
                      Update
                    </>
                  ) : (
                    <>
                      <Icon name="plus" className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="whitespace-nowrap px-4 py-3 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors"
                  >
                    Cancel
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
                    <p className="font-serif text-sm text-red-600 mt-3 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* SEARCH (if more than 5 categories) */}
            {categories.length > 5 && (
              <div className="relative">
                <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <input
                  className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                  placeholder="Search categories..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            )}

            {/* CATEGORY LIST */}
            {loading ? (
              <Loading />
            ) : categories.length === 0 ? (
              <EmptyState text="No categories yet. Add your first category!" />
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center">
                  <Icon name="search" className="w-6 h-6 text-amber-500" />
                </div>
                <p className="font-serif text-sm text-amber-700/60">
                  No categories match &quot;{query}&quot;
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
                        className={`group relative bg-white/90 border rounded-2xl p-4 transition-all duration-200 ${
                          isEditing
                            ? 'border-amber-400 bg-amber-50/60'
                            : 'border-amber-200/60 hover:border-amber-300/80 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Icon with rotating color */}
                            <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.border} border flex items-center justify-center flex-shrink-0`}>
                              <Icon name="tag" className={`w-4 h-4 ${color.text}`} />
                            </div>
                            <div className="min-w-0">
                              <span className="font-serif font-semibold text-amber-950 block truncate">
                                {category.name}
                              </span>
                              <span className="font-serif text-xs text-amber-700/60 mt-0.5 block">
                                {isEditing ? 'Currently editing' : 'Event category'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEdit(category)}
                              className="p-2 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-all"
                              aria-label={`Edit category ${category.name}`}
                            >
                              <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id, category.name)}
                              className="p-2 rounded-lg text-amber-500 hover:text-red-600 hover:bg-red-50 transition-all"
                              aria-label={`Delete category ${category.name}`}
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
              <p className="font-serif text-xs text-amber-600/60 text-center mt-4">
                Total {categories.length} categories • Click the edit icon to modify
              </p>
            )}
          </div>

          {/* ===== RIGHT (1/3): SIDEBAR PANEL ===== */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">

            {/* Card: Summary */}
            <div className="bg-white/90 border border-amber-200/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Icon name="sparkle" className="w-4 h-4 text-amber-700" />
                </div>
                <h3 className="font-serif font-semibold text-amber-950">Summary</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xs text-amber-700/70">Total Categories</span>
                  <span className="font-serif text-sm font-bold text-amber-950 font-mono tabular-nums">
                    {stats.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xs text-amber-700/70">Displayed</span>
                  <span className="font-serif text-sm font-bold text-amber-950 font-mono tabular-nums">
                    {filtered.length}
                  </span>
                </div>
                {stats.longest && (
                  <div className="pt-3 border-t border-amber-200/50">
                    <span className="font-serif text-[10px] text-amber-600/70 uppercase tracking-wider block mb-1">
                      Longest name
                    </span>
                    <span className="font-serif text-xs text-amber-900 break-all">
                      {stats.longest}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="info" className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif font-semibold text-amber-950 text-sm">Tips</h3>
              </div>
              <ul className="space-y-2 font-serif text-xs text-amber-800/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Use short and clear category names.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Categories will appear in the user's event filter.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Press <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-200/60 rounded text-[10px] font-mono text-amber-900">Esc</kbd> to cancel editing.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}