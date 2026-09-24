import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { getAllUsersWithStats, updateUserStatus } from '../../api/userApi';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    plus: 'M12 4v16m8-8H4',
    close: 'M6 18L18 6M6 6l12 12',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    check: 'M5 13l4 4L19 7',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
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

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500/60';
const PAGE_SIZE = 20;
const tableCols = 'lg:grid-cols-[minmax(0,1.6fr)_6.5rem_4.5rem_4.5rem_8rem_9.5rem]';

const emptyForm = { name: '', email: '', password: '', phone: '', role: 'petugas' };

const roleConfig = {
  admin: { label: 'Admin', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'shield' },
  petugas: { label: 'Petugas', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'check' },
  eo: { label: 'EO', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'user' },
  customer: { label: 'Customer', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'user' },
};

const roleOptions = [
  { value: 'petugas', label: 'Petugas' },
  { value: 'eo', label: 'Event organizer' },
  { value: 'admin', label: 'Admin' },
  { value: 'customer', label: 'Customer' },
];

// Static map, so Tailwind can see every class (dynamic `bg-${x}-500` gets purged)
const roleDot = {
  admin: 'bg-blue-500',
  petugas: 'bg-zinc-300',
  eo: 'bg-purple-500',
  customer: 'bg-rose-500',
};

const avatarGradients = [
  'from-flame-400 to-flame-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-purple-400 to-purple-600',
  'from-orange-400 to-orange-600',
  'from-pink-400 to-pink-600',
];

// ===== ROLE SUMMARY CARD (folder shape, also acts as the role filter) =====
// `allUsers` always holds every user (not filtered), so the avatars stay visible.
function RoleSummaryCard({ roleKey, count, allUsers, activeCount, isActiveFilter, onSelect }) {
  const role = roleConfig[roleKey];
  if (!role) return null;

  const sampleUsers = allUsers.filter((u) => u.role === roleKey).slice(0, 4);

  const theme = {
    admin: {
      folderBg: 'bg-blue-600',
      folderTabBg: 'bg-blue-600',
      folderBorder: 'border-blue-700',
      text: 'text-white',
      label: 'text-white/80',
      accent: 'text-white',
      iconBg: 'bg-white/20',
      iconBorder: 'border-white/30',
      hover: 'hover:bg-blue-500',
      avatarRing: 'ring-blue-700',
    },
    petugas: {
      folderBg: 'bg-zinc-200',
      folderTabBg: 'bg-zinc-200',
      folderBorder: 'border-zinc-300',
      text: 'text-zinc-800',
      label: 'text-zinc-500',
      accent: 'text-zinc-900',
      iconBg: 'bg-zinc-300',
      iconBorder: 'border-zinc-400/50',
      hover: 'hover:bg-zinc-100',
      avatarRing: 'ring-zinc-300',
    },
    eo: {
      folderBg: 'bg-purple-500',
      folderTabBg: 'bg-purple-500',
      folderBorder: 'border-purple-600',
      text: 'text-white',
      label: 'text-white/80',
      accent: 'text-white',
      iconBg: 'bg-white/20',
      iconBorder: 'border-white/30',
      hover: 'hover:bg-purple-400',
      avatarRing: 'ring-purple-600',
    },
    customer: {
      folderBg: 'bg-rose-500',
      folderTabBg: 'bg-rose-500',
      folderBorder: 'border-rose-600',
      text: 'text-white',
      label: 'text-white/80',
      accent: 'text-white',
      iconBg: 'bg-white/20',
      iconBorder: 'border-white/30',
      hover: 'hover:bg-rose-400',
      avatarRing: 'ring-rose-600',
    },
  }[roleKey];

  return (
    <motion.button
      type="button"
      aria-pressed={isActiveFilter}
      aria-label={`Filter ${role.label}, ${count} pengguna`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="relative text-left w-full h-[170px] group pt-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500/60"
    >
      {/* Folder tab */}
      <div
        className={`absolute top-0 left-0 h-4 w-24 rounded-t-lg border-t border-l border-r ${theme.folderBorder} ${theme.folderTabBg} transition-colors ${theme.hover}`}
      />

      {/* Folder body */}
      <div
        className={`relative h-full rounded-b-2xl rounded-tr-2xl border ${theme.folderBorder} ${theme.folderBg} p-4 flex flex-col justify-between transition-colors ${
          isActiveFilter ? 'ring-2 ring-offset-2 ring-offset-ink-950 ring-white/40' : theme.hover
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${theme.label}`}>{role.label}</span>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${theme.iconBg} ${theme.iconBorder}`}>
              <Icon name={role.icon} className={`w-3 h-3 ${theme.accent}`} />
            </div>
          </div>

          <div className="flex -space-x-2 mb-3">
            {sampleUsers.length > 0
              ? sampleUsers.map((u, i) => (
                  <div
                    key={u.id}
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${
                      avatarGradients[i % avatarGradients.length]
                    } flex items-center justify-center text-white text-[10px] font-bold ring-2 ${theme.avatarRing} shrink-0`}
                    title={u.name}
                  >
                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                ))
              : [0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full ${theme.iconBg} ring-2 ${theme.avatarRing} flex items-center justify-center text-[10px] ${theme.label} shrink-0`}
                  >
                    ?
                  </div>
                ))}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className={`text-xs ${theme.label} mb-0.5`}>Total</div>
            <div className={`text-xl font-bold font-mono tabular-nums leading-none ${theme.accent}`}>{count}</div>
          </div>
          <div className="text-right">
            <div className={`text-xs ${theme.label}`}>Aktif</div>
            <div className={`text-sm font-mono font-semibold ${theme.text}`}>{activeCount}</div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-emerald-500' : 'bg-ink-700'
      } ${focusRing}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </button>
  );
}

function SkeletonRows() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 border-t first:border-t-0 border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-ink-700" />
            <div className="space-y-2">
              <div className="h-3 w-36 bg-ink-700 rounded" />
              <div className="h-3 w-48 bg-ink-700 rounded" />
            </div>
          </div>
          <div className="h-5 w-16 bg-ink-700 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // full data (role cards and avatars)
  const [roleFilter, setRoleFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [processingId, setProcessingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const hasLoaded = useRef(false);
  const requestRef = useRef(0);

  // Debounce search so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeForm();
    };
    const prevOverflow = document.body.style.overflow;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showForm]);

  function notify(type, message) {
    setToast({ type, message, id: Date.now() });
  }

  async function fetchUsers() {
    const requestId = ++requestRef.current;
    if (!hasLoaded.current) setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await getAllUsersWithStats(params);
      if (requestId !== requestRef.current) return;
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      try {
        const res = await api.get('/users', { params: roleFilter ? { role: roleFilter } : {} });
        if (requestId !== requestRef.current) return;
        setUsers(res.data);
      } catch (fallbackErr) {
        console.error('Fallback failed:', fallbackErr);
      }
    } finally {
      if (requestId === requestRef.current) {
        hasLoaded.current = true;
        setLoading(false);
      }
    }
  }

  async function fetchAllUsers() {
    try {
      const res = await getAllUsersWithStats({});
      setAllUsers(res.data.data || []);
    } catch (err) {
      try {
        const res = await api.get('/users');
        setAllUsers(res.data);
      } catch (fallbackErr) {
        console.error('Failed to fetch all users:', fallbackErr);
      }
    }
  }

  function refreshAll() {
    fetchUsers();
    fetchAllUsers();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    const createdName = form.name;
    setSaving(true);
    try {
      await api.post('/users', form);
      closeForm();
      notify('success', `${createdName} berhasil dibuat`);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pengguna.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user) {
    setProcessingId(user.id);
    try {
      await updateUserStatus(user.id, !user.is_active);
      notify('success', `${user.name} ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
      refreshAll();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Gagal mengubah status.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(user) {
    setDeletingId(user.id);
    try {
      await api.delete(`/users/${user.id}`);
      setConfirmId(null);
      notify('success', `${user.name} dihapus`);
      refreshAll();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Gagal menghapus.');
    } finally {
      setDeletingId(null);
    }
  }

  function openForm() {
    setForm({ ...emptyForm, role: roleFilter || 'petugas' });
    setShowPassword(false);
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setError('');
  }

  function resetFilters() {
    setRoleFilter('');
    setSearchInput('');
    setSearchQuery('');
  }

  const totalStats = users.reduce(
    (acc, u) => ({
      orders: acc.orders + (u.total_orders || 0),
      paid: acc.paid + (u.total_orders_paid || 0),
    }),
    { orders: 0, paid: 0 }
  );

  // Role stats come from allUsers, so the counts stay the same while a filter is active
  const roleStats = ['admin', 'petugas', 'eo', 'customer'].reduce((acc, key) => {
    acc[key] = {
      count: allUsers.filter((u) => u.role === key).length,
      active: allUsers.filter((u) => u.role === key && u.is_active).length,
    };
    return acc;
  }, {});

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = users.slice(pageStart, pageStart + PAGE_SIZE);
  const isFiltering = !!roleFilter || !!searchQuery;

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Pengguna</h1>
            <p className="text-sm text-ink-400 mt-1">{allUsers.length} orang terdaftar</p>
          </div>
          <button onClick={openForm} className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto">
            <Icon name="plus" className="w-4 h-4" />
            Tambah pengguna
          </button>
        </header>

        {/* Role folders (also the role filter) */}
        <section className="mb-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Ringkasan role</h2>
            <span className="text-xs text-ink-400">Klik folder untuk memfilter daftar</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {['admin', 'petugas', 'eo', 'customer'].map((roleKey) => (
              <RoleSummaryCard
                key={roleKey}
                roleKey={roleKey}
                count={roleStats[roleKey].count}
                activeCount={roleStats[roleKey].active}
                allUsers={allUsers}
                isActiveFilter={roleFilter === roleKey}
                onSelect={() => setRoleFilter(roleFilter === roleKey ? '' : roleKey)}
              />
            ))}
          </div>
        </section>

        {/* Order totals for the users currently listed */}
        {!loading && users.length > 0 && (
          <div className="card grid grid-cols-2 divide-x divide-ink-700 mb-6">
            <div className="p-4">
              <p className="text-xs text-ink-400">Total order</p>
              <p className="text-xl font-bold text-white font-mono tabular-nums mt-1.5 leading-none">
                {totalStats.orders}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-ink-400">Order lunas</p>
              <p className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1.5 leading-none">
                {totalStats.paid}
              </p>
            </div>
          </div>
        )}

        {/* Search and active filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              aria-label="Cari pengguna"
              placeholder="Cari nama atau email"
              className="w-full input-field pl-10 bg-ink-800/40"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {roleFilter && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-400">Filter</span>
              <button
                onClick={() => setRoleFilter('')}
                aria-label={`Hapus filter ${roleConfig[roleFilter]?.label}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-flame-500/10 border border-flame-500/30 text-flame-400 rounded-lg text-xs font-medium hover:bg-flame-500/20 transition-colors ${focusRing}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${roleDot[roleFilter]}`} />
                {roleConfig[roleFilter]?.label}
                <Icon name="close" className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* User list */}
        {loading ? (
          <SkeletonRows />
        ) : users.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-ink-800 flex items-center justify-center mb-4">
              <Icon name="user" className="w-6 h-6 text-ink-400" />
            </div>
            {isFiltering ? (
              <>
                <h3 className="font-semibold text-white mb-1">Tidak ada pengguna yang cocok</h3>
                <p className="text-sm text-ink-400 mb-5">Ubah kata kunci atau pilih folder role lain.</p>
                <button onClick={resetFilters} className="btn-secondary">
                  Reset filter
                </button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-white mb-1">Belum ada pengguna</h3>
                <p className="text-sm text-ink-400 mb-5">Tambahkan admin, petugas, atau EO pertama.</p>
                <button onClick={openForm} className="btn-primary inline-flex items-center gap-2">
                  <Icon name="plus" className="w-4 h-4" />
                  Tambah pengguna
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-ink-700">
              <h2 className="font-semibold text-white">
                {roleFilter ? `Daftar ${roleConfig[roleFilter]?.label}` : 'Daftar pengguna'}
              </h2>
              <span className="text-xs text-ink-400">
                <span className="font-mono tabular-nums">{users.length}</span> pengguna
              </span>
            </div>

            <div className={`hidden lg:grid ${tableCols} gap-4 px-5 py-2.5 border-b border-ink-700 text-xs text-ink-400`}>
              <span>Pengguna</span>
              <span>Role</span>
              <span className="text-right">Order</span>
              <span className="text-right">Lunas</span>
              <span>Status</span>
              <span />
            </div>

            <ul className="divide-y divide-ink-700">
              {pageItems.map((user) => {
                const role = roleConfig[user.role] || roleConfig.customer;
                const totalOrders = user.total_orders || 0;
                const totalPaid = user.total_orders_paid || 0;
                const dimmed = !user.is_active ? 'opacity-60' : '';
                return (
                  <li
                    key={user.id}
                    className={`grid grid-cols-2 ${tableCols} gap-x-4 gap-y-3 items-center px-5 py-4 hover:bg-ink-800/40 transition-colors`}
                  >
                    <div className={`order-1 lg:order-none col-span-2 lg:col-span-1 flex items-center gap-3 min-w-0 ${dimmed}`}>
                      <div
                        className={`w-9 h-9 rounded-full ${role.bg} border ${role.border} flex items-center justify-center shrink-0`}
                      >
                        <span className={`text-sm font-semibold ${role.color}`}>
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-ink-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className={`order-2 lg:order-none ${dimmed}`}>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${role.bg} ${role.color} border ${role.border}`}>
                        {role.label}
                      </span>
                    </div>

                    <div className={`order-4 lg:order-none lg:text-right ${dimmed}`}>
                      <p className="text-xs text-ink-400 lg:hidden mb-0.5">Order</p>
                      <p className="text-sm font-semibold text-white font-mono tabular-nums">{totalOrders}</p>
                    </div>

                    <div className={`order-5 lg:order-none lg:text-right ${dimmed}`}>
                      <p className="text-xs text-ink-400 lg:hidden mb-0.5">Lunas</p>
                      <p className="text-sm font-semibold text-emerald-400 font-mono tabular-nums">{totalPaid}</p>
                    </div>

                    <div className="order-3 lg:order-none flex items-center gap-2.5 justify-self-end lg:justify-self-start">
                      <Switch
                        checked={!!user.is_active}
                        disabled={processingId === user.id}
                        onChange={() => toggleActive(user)}
                        label={user.is_active ? `Nonaktifkan ${user.name}` : `Aktifkan ${user.name}`}
                      />
                      <span className={`text-xs ${user.is_active ? 'text-emerald-400' : 'text-ink-400'}`}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    <div className="order-6 lg:order-none col-span-2 lg:col-span-1 flex items-center gap-2 lg:justify-end">
                      <Link
                        to={`/profile/${user.id}`}
                        className={`flex-1 lg:flex-none text-center px-3 py-1.5 rounded-md bg-ink-800 hover:bg-ink-700 text-xs font-medium text-ink-200 transition-colors ${focusRing}`}
                      >
                        Lihat profil
                      </Link>
                      <button
                        onClick={() => setConfirmId(user.id)}
                        aria-label={`Hapus ${user.name}`}
                        title="Hapus pengguna"
                        className={`p-2 rounded-lg text-ink-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ${focusRing}`}
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>

                    {confirmId === user.id && (
                      <div
                        role="alert"
                        className="order-last col-span-full flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5"
                      >
                        <p className="text-sm text-red-300">
                          Hapus <span className="font-semibold">{user.name}</span>?{' '}
                          {totalOrders > 0
                            ? `Pengguna ini punya ${totalOrders} order, menonaktifkannya lebih aman.`
                            : 'Tindakan ini tidak bisa dibatalkan.'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmId(null)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium text-ink-200 hover:bg-ink-700 transition-colors ${focusRing}`}
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={deletingId === user.id}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60 inline-flex items-center gap-1.5 ${focusRing}`}
                          >
                            {deletingId === user.id && <Spinner className="h-3 w-3" />}
                            Hapus pengguna
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {users.length > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-ink-700 text-xs text-ink-400">
                <span>
                  Menampilkan{' '}
                  <span className="text-white font-mono tabular-nums">
                    {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, users.length)}
                  </span>{' '}
                  dari <span className="font-mono tabular-nums">{users.length}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-md bg-ink-800 hover:bg-ink-700 text-ink-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-md bg-ink-800 hover:bg-ink-700 text-ink-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add user drawer */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={closeForm}
                className="fixed inset-0 bg-black/60 z-[60]"
                aria-hidden="true"
              />
              <motion.aside
                key="drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-form-title"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="fixed inset-y-0 right-0 z-[70] w-full max-w-md"
              >
                <div className="card !rounded-none !border-y-0 !border-r-0 h-full flex flex-col">
                  <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                    <div className="flex items-start justify-between gap-3 p-5 border-b border-ink-700">
                      <div>
                        <h2 id="user-form-title" className="font-semibold text-white">
                          Tambah pengguna baru
                        </h2>
                        <p className="text-xs text-ink-400 mt-0.5">Lengkapi data di bawah ini</p>
                      </div>
                      <button
                        type="button"
                        onClick={closeForm}
                        aria-label="Tutup form"
                        className={`p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors ${focusRing}`}
                      >
                        <Icon name="close" className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      <div>
                        <span className="block text-sm text-ink-200 mb-1.5">Role</span>
                        <div role="radiogroup" aria-label="Role" className="grid grid-cols-2 gap-1 p-1 bg-ink-800/40 rounded-lg">
                          {roleOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              role="radio"
                              aria-checked={form.role === opt.value}
                              onClick={() => setForm({ ...form, role: opt.value })}
                              className={`py-1.5 rounded-md text-xs font-medium transition-colors ${
                                form.role === opt.value ? 'bg-flame-500 text-white' : 'text-ink-400 hover:text-white'
                              } ${focusRing}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="user-name" className="block text-sm text-ink-200 mb-1.5">
                          Nama lengkap
                        </label>
                        <input
                          id="user-name"
                          required
                          autoFocus
                          className="w-full input-field bg-ink-800/40"
                          placeholder="Masukkan nama lengkap"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="user-email" className="block text-sm text-ink-200 mb-1.5">
                          Email
                        </label>
                        <input
                          id="user-email"
                          required
                          type="email"
                          className="w-full input-field bg-ink-800/40"
                          placeholder="email@domain.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="user-password" className="block text-sm text-ink-200">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className={`text-xs text-flame-400 hover:text-flame-300 font-medium rounded ${focusRing}`}
                          >
                            {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                          </button>
                        </div>
                        <input
                          id="user-password"
                          required
                          type={showPassword ? 'text' : 'password'}
                          minLength={6}
                          autoComplete="new-password"
                          className="w-full input-field bg-ink-800/40"
                          placeholder="Minimal 6 karakter"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="user-phone" className="block text-sm text-ink-200 mb-1.5">
                          Nomor HP <span className="text-ink-400">(opsional)</span>
                        </label>
                        <input
                          id="user-phone"
                          type="tel"
                          className="w-full input-field bg-ink-800/40"
                          placeholder="081234567890"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="p-4 border-t border-ink-700 space-y-3">
                      {error && (
                        <div
                          role="alert"
                          className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                        >
                          <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                          {error}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                        >
                          {saving ? (
                            <>
                              <Spinner />
                              Menyimpan...
                            </>
                          ) : (
                            'Simpan pengguna'
                          )}
                        </button>
                        <button type="button" onClick={closeForm} className="btn-secondary">
                          Batal
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Toast */}
        <div className="fixed bottom-6 inset-x-0 z-[80] flex justify-center px-4 pointer-events-none">
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.id}
                role="status"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18 }}
                className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium ${
                  toast.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <Icon name={toast.type === 'error' ? 'alert' : 'check'} className="w-4 h-4" />
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}