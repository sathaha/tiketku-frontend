import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { Loading } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  plus: 'M12 4v16m8-8H4',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  tag: 'M20.59 13.41L11 3.83A2 2 0 009.59 3.24H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.58 9.59a2 2 0 002.83 0l4.59-4.6a2 2 0 000-2.82zM7 8h.01',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
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

const inputCls =
  'w-full pl-10 pr-4 py-3 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

/* ============ MAIN ============ */
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Escape') return;
      if (deleteTarget) {
        if (!deleting) setDeleteTarget(null);
      } else if (editingId) {
        cancelEdit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, deleteTarget, deleting]);

  function notify(type, message) {
    setToast({ type, message, id: Date.now() });
  }

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      notify('error', "Couldn't load categories. Please try again.");
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
    const wasEditing = !!editingId;
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name: trimmed });
      } else {
        await api.post('/categories', { name: trimmed });
      }
      setName('');
      setEditingId(null);
      notify('success', wasEditing ? `"${trimmed}" updated` : `"${trimmed}" added`);
      await fetchCategories();
      inputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the category. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      notify('success', `"${deleteTarget.name}" deleted`);
      if (editingId === deleteTarget.id) cancelEdit();
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      notify('error', err.response?.data?.message || "Couldn't delete the category. Please try again.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setError('');
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const stats = useMemo(() => {
    const total = categories.length;
    const longest = categories.reduce((max, c) => (c.name.length > max.length ? c.name : max), '');
    return { total, longest };
  }, [categories]);

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4] px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* ===== HEADER ===== */}
          <header className="mb-6">
            <h1 className="f-display text-3xl font-bold text-amber-950">Manage categories</h1>
            <p className="text-sm text-amber-700/80 mt-1">
              {loading ? 'Loading categories…' : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'} registered`}
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* ===== LEFT: FORM + LIST ===== */}
            <div className="lg:col-span-2 space-y-5">
              {/* Form */}
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm shadow-amber-950/5">
                <label htmlFor="category-name" className="f-display text-lg font-semibold text-amber-950 block mb-3">
                  {editingId ? 'Edit category' : 'Add a category'}
                </label>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px] relative">
                    <Icon name="tag" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <input
                      id="category-name"
                      ref={inputRef}
                      required
                      className={inputCls}
                      placeholder={editingId ? 'Rename this category' : 'Rock, Jazz, Festival'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className={`inline-flex items-center gap-2 whitespace-nowrap px-5 py-3 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    {saving ? (
                      <>
                        <Spinner />
                        Saving…
                      </>
                    ) : editingId ? (
                      <>
                        <Icon name="check" className="w-4 h-4" />
                        Save changes
                      </>
                    ) : (
                      <>
                        <Icon name="plus" className="w-4 h-4" />
                        Add category
                      </>
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className={`whitespace-nowrap px-4 py-3 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-red-700 mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50">
                        <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Search (only when the list gets long) */}
              {categories.length > 5 && (
                <div className="relative">
                  <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                  <input
                    aria-label="Search categories"
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                    placeholder="Search categories"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              )}

              {/* List */}
              {loading ? (
                <Loading />
              ) : categories.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                    <Icon name="tag" className="w-6 h-6" />
                  </div>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No categories yet</h3>
                  <p className="text-sm text-amber-800/80 mb-5">Add the first one above and it will show up in the event filter.</p>
                  <button
                    onClick={() => inputRef.current?.focus()}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Add a category
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                    <Icon name="search" className="w-6 h-6" />
                  </div>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No categories match</h3>
                  <p className="text-sm text-amber-800/80 mb-5">Nothing matches &quot;{query}&quot;.</p>
                  <button
                    onClick={() => setQuery('')}
                    className={`px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <ul className="bg-white rounded-2xl divide-y divide-dashed divide-amber-200 overflow-hidden shadow-sm shadow-amber-950/5">
                  <AnimatePresence initial={false} mode="popLayout">
                    {filtered.map((category) => {
                      const isEditing = editingId === category.id;
                      return (
                        <motion.li
                          key={category.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className={`flex items-center justify-between gap-3 px-4 py-3.5 transition-colors ${
                            isEditing ? 'bg-amber-100/70' : 'hover:bg-amber-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Icon name="tag" className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-amber-950 block truncate">{category.name}</span>
                              {isEditing && <span className="text-xs text-amber-700 block">Editing now</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => startEdit(category)}
                              className={`p-2 rounded-lg text-amber-600 hover:text-amber-950 hover:bg-amber-100 transition-colors ${focusRing}`}
                              aria-label={`Edit category ${category.name}`}
                              title="Edit"
                            >
                              <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(category)}
                              className={`p-2 rounded-lg text-amber-600 hover:text-red-600 hover:bg-red-50 transition-colors ${focusRing}`}
                              aria-label={`Delete category ${category.name}`}
                              title="Delete"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* ===== RIGHT: SIDEBAR ===== */}
            <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">
              {/* Summary */}
              <section aria-label="Summary" className="bg-amber-950 text-amber-50 rounded-2xl p-5 drop-shadow-[0_10px_18px_rgba(69,26,3,0.18)]">
                <p className="text-sm text-amber-300">Total categories</p>
                <p className="f-display text-5xl font-bold text-amber-300 tabular-nums leading-none mt-2">{stats.total}</p>

                <div className="mt-5 pt-4 border-t border-dashed border-amber-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-200/70">Showing</span>
                    <span className="font-semibold tabular-nums">{filtered.length}</span>
                  </div>
                  {stats.longest && (
                    <div>
                      <span className="text-sm text-amber-200/70 block mb-0.5">Longest name</span>
                      <span className="text-sm break-words">{stats.longest}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Tips */}
              <section className="rounded-2xl border border-dashed border-amber-400/60 bg-amber-100/60 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="info" className="w-4 h-4 text-amber-700" />
                  <h3 className="f-display text-base font-semibold text-amber-950">Good to know</h3>
                </div>
                <ul className="space-y-2 text-sm text-amber-900 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 shrink-0" />
                    Keep names short and clear.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 shrink-0" />
                    Categories show up in the event filter that customers use.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 shrink-0" />
                    <span>
                      Press <kbd className="px-1.5 py-0.5 bg-white rounded text-xs text-amber-900">Esc</kbd> to stop editing.
                    </span>
                  </li>
                </ul>
              </section>
            </aside>
          </div>

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
                  aria-label="Delete category"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="f-body bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl shadow-amber-950/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
                    <Icon name="trash" className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="f-display text-xl font-semibold text-amber-950 text-center mb-2">Delete this category?</h3>
                  <p className="text-sm text-amber-900 text-center font-semibold mb-1 break-words">{deleteTarget.name}</p>
                  <p className="text-sm text-amber-800 text-center mb-6">It will disappear from the event filter. This can't be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteTarget(null)}
                      disabled={deleting}
                      className={`flex-1 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${focusRing}`}
                    >
                      Keep it
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