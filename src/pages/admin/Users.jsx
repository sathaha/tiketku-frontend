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
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
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
const PAGE_SIZE = 20;
const tableCols = 'lg:grid-cols-[minmax(0,1.6fr)_6.5rem_4.5rem_4.5rem_8rem_9.5rem]';

const emptyForm = { name: '', email: '', password: '', phone: '', role: 'petugas' };

const roleConfig = {
  admin: { label: 'Admin', text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200/60', icon: 'shield' },
  petugas: { label: 'Staff', text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200/60', icon: 'check' },
  eo: { label: 'EO', text: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200/60', icon: 'user' },
  customer: { label: 'Customer', text: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200/60', icon: 'user' },
};

const roleOptions = [
  { value: 'petugas', label: 'Staff' },
  { value: 'eo', label: 'Event organizer' },
  { value: 'admin', label: 'Admin' },
  { value: 'customer', label: 'Customer' },
];

const roleDot = {
  admin: 'bg-blue-500',
  petugas: 'bg-amber-500',
  eo: 'bg-purple-500',
  customer: 'bg-emerald-500',
};

const avatarGradients = [
  'from-amber-400 to-amber-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-purple-400 to-purple-600',
  'from-orange-400 to-orange-600',
  'from-pink-400 to-pink-600',
];

/* Notches are cut out of the ticket with a mask, so they work on any background. */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const ticketCss = `
  .ticket-notch { -webkit-mask: ${notch}; mask: ${notch}; }
  @media (min-width: 640px) {
    .ticket-notch-sm { -webkit-mask: ${notch}; mask: ${notch}; }
  }
`;

// ===== ROLE SUMMARY CARD (folder shape, also acts as the role filter) =====
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
      folderBg: 'bg-amber-200',
      folderTabBg: 'bg-amber-200',
      folderBorder: 'border-amber-300',
      text: 'text-amber-900',
      label: 'text-amber-700/70',
      accent: 'text-amber-950',
      iconBg: 'bg-amber-300',
      iconBorder: 'border-amber-400/50',
      hover: 'hover:bg-amber-100',
      avatarRing: 'ring-amber-300',
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
      folderBg: 'bg-emerald-500',
      folderTabBg: 'bg-emerald-500',
      folderBorder: 'border-emerald-600',
      text: 'text-white',
      label: 'text-white/80',
      accent: 'text-white',
      iconBg: 'bg-white/20',
      iconBorder: 'border-white/30',
      hover: 'hover:bg-emerald-400',
      avatarRing: 'ring-emerald-600',
    },
  }[roleKey];

  return (
    <motion.button
      type="button"
      aria-pressed={isActiveFilter}
      aria-label={`Filter ${role.label}, ${count} users`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative text-left w-full h-[170px] group pt-3 rounded-2xl ${focusRing}`}
    >
      {/* Folder tab */}
      <div
        className={`absolute top-0 left-0 h-4 w-24 rounded-t-lg border-t border-l border-r ${theme.folderBorder} ${theme.folderTabBg} transition-colors ${theme.hover}`}
      />

      {/* Folder body */}
      <div
        className={`relative h-full rounded-b-2xl rounded-tr-2xl border ${theme.folderBorder} ${theme.folderBg} p-4 flex flex-col justify-between transition-colors ${
          isActiveFilter ? 'ring-2 ring-offset-2 ring-offset-[#f5ede4] ring-amber-500/60' : theme.hover
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-serif text-xs font-semibold ${theme.label}`}>{role.label}</span>
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
            <div className={`font-serif text-xs ${theme.label} mb-0.5`}>Total</div>
            <div className={`font-serif text-xl font-bold font-mono tabular-nums leading-none ${theme.accent}`}>{count}</div>
          </div>
          <div className="text-right">
            <div className={`font-serif text-xs ${theme.label}`}>Active</div>
            <div className={`font-serif text-sm font-mono font-semibold ${theme.text}`}>{activeCount}</div>
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
        checked ? 'bg-emerald-500' : 'bg-amber-300'
      } ${focusRing}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </button>
  );
}

function SkeletonRows() {
  return (
    <div className="bg-white border border-amber-200/60 rounded-2xl animate-pulse" aria-hidden="true">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 border-t first:border-t-0 border-amber-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100" />
            <div className="space-y-2">
              <div className="h-3 w-36 bg-amber-100 rounded" />
              <div className="h-3 w-48 bg-amber-100 rounded" />
            </div>
          </div>
          <div className="h-5 w-16 bg-amber-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
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
      setError('Password must be at least 6 characters.');
      return;
    }
    const createdName = form.name;
    setSaving(true);
    try {
      await api.post('/users', form);
      closeForm();
      notify('success', `${createdName} created successfully`);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user) {
    setProcessingId(user.id);
    try {
      await updateUserStatus(user.id, !user.is_active);
      notify('success', `${user.name} ${user.is_active ? 'deactivated' : 'activated'}`);
      refreshAll();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to change status.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(user) {
    setDeletingId(user.id);
    try {
      await api.delete(`/users/${user.id}`);
      setConfirmId(null);
      notify('success', `${user.name} deleted`);
      refreshAll();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to delete.');
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
      <div className="min-h-screen bg-[#f5ede4]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <style>{ticketCss}</style>

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-amber-950">Users</h1>
              <p className="font-serif text-sm text-amber-700/70 mt-1">
                {allUsers.length} users registered
              </p>
            </div>
            <button
              onClick={openForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors self-start sm:self-auto"
            >
              <Icon name="plus" className="w-4 h-4" />
              Add user
            </button>
          </header>

          {/* Role folders (also the role filter) */}
          <section className="mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-serif text-sm font-semibold text-amber-950">Role summary</h2>
              <span className="font-serif text-xs text-amber-700/70">Click a folder to filter the list</span>
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
            <div className="bg-white border border-amber-200/60 rounded-2xl grid grid-cols-2 divide-x divide-amber-200/60 mb-6">
              <div className="p-4">
                <p className="font-serif text-xs text-amber-700/70">Total orders</p>
                <p className="font-serif text-xl font-bold text-amber-950 font-mono tabular-nums mt-1.5 leading-none">
                  {totalStats.orders}
                </p>
              </div>
              <div className="p-4">
                <p className="font-serif text-xs text-amber-700/70">Paid orders</p>
                <p className="font-serif text-xl font-bold text-emerald-700 font-mono tabular-nums mt-1.5 leading-none">
                  {totalStats.paid}
                </p>
              </div>
            </div>
          )}

          {/* Search and active filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-md">
              <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                aria-label="Search users"
                placeholder="Search name or email"
                className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {roleFilter && (
              <div className="flex items-center gap-2">
                <span className="font-serif text-xs text-amber-700/70">Filter</span>
                <button
                  onClick={() => setRoleFilter('')}
                  aria-label={`Remove filter ${roleConfig[roleFilter]?.label}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-amber-200/60 text-amber-800 rounded-lg font-serif text-xs font-medium hover:bg-amber-200/60 transition-colors ${focusRing}`}
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
            <div className="bg-white border border-amber-200/60 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center mb-4">
                <Icon name="user" className="w-6 h-6 text-amber-600" />
              </div>
              {isFiltering ? (
                <>
                  <h3 className="font-serif font-semibold text-amber-950 mb-1">No matching users</h3>
                  <p className="font-serif text-sm text-amber-700/70 mb-5">Change the keyword or pick another role folder.</p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors"
                  >
                    Reset filter
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-serif font-semibold text-amber-950 mb-1">No users yet</h3>
                  <p className="font-serif text-sm text-amber-700/70 mb-5">Add the first admin, staff, or EO.</p>
                  <button
                    onClick={openForm}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 font-serif text-sm rounded-xl transition-colors"
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Add user
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white border border-amber-200/60 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-amber-200/60">
                <h2 className="font-serif font-semibold text-amber-950">
                  {roleFilter ? `${roleConfig[roleFilter]?.label} list` : 'User list'}
                </h2>
                <span className="font-serif text-xs text-amber-700/70">
                  <span className="font-mono tabular-nums">{users.length}</span> users
                </span>
              </div>

              <div className={`hidden lg:grid ${tableCols} gap-4 px-5 py-2.5 border-b border-amber-200/60 font-serif text-xs text-amber-700/70`}>
                <span>User</span>
                <span>Role</span>
                <span className="text-right">Orders</span>
                <span className="text-right">Paid</span>
                <span>Status</span>
                <span />
              </div>

              <ul className="divide-y divide-amber-200/60">
                {pageItems.map((user) => {
                  const role = roleConfig[user.role] || roleConfig.customer;
                  const totalOrders = user.total_orders || 0;
                  const totalPaid = user.total_orders_paid || 0;
                  const dimmed = !user.is_active ? 'opacity-60' : '';
                  return (
                    <li
                      key={user.id}
                      className={`grid grid-cols-2 ${tableCols} gap-x-4 gap-y-3 items-center px-5 py-4 hover:bg-amber-50/50 transition-colors`}
                    >
                      <div className={`order-1 lg:order-none col-span-2 lg:col-span-1 flex items-center gap-3 min-w-0 ${dimmed}`}>
                        <div className={`w-9 h-9 rounded-full ${role.bg} border ${role.border} flex items-center justify-center shrink-0`}>
                          <span className={`font-serif text-sm font-semibold ${role.text}`}>
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-medium text-amber-950 truncate">{user.name}</p>
                          <p className="font-serif text-xs text-amber-700/70 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className={`order-2 lg:order-none ${dimmed}`}>
                        <span className={`font-serif text-xs px-2 py-0.5 rounded-full ${role.bg} ${role.text} border ${role.border}`}>
                          {role.label}
                        </span>
                      </div>

                      <div className={`order-4 lg:order-none lg:text-right ${dimmed}`}>
                        <p className="font-serif text-xs text-amber-700/70 lg:hidden mb-0.5">Orders</p>
                        <p className="font-serif text-sm font-semibold text-amber-950 font-mono tabular-nums">{totalOrders}</p>
                      </div>

                      <div className={`order-5 lg:order-none lg:text-right ${dimmed}`}>
                        <p className="font-serif text-xs text-amber-700/70 lg:hidden mb-0.5">Paid</p>
                        <p className="font-serif text-sm font-semibold text-emerald-700 font-mono tabular-nums">{totalPaid}</p>
                      </div>

                      <div className="order-3 lg:order-none flex items-center gap-2.5 justify-self-end lg:justify-self-start">
                        <Switch
                          checked={!!user.is_active}
                          disabled={processingId === user.id}
                          onChange={() => toggleActive(user)}
                          label={user.is_active ? `Deactivate ${user.name}` : `Activate ${user.name}`}
                        />
                        <span className={`font-serif text-xs ${user.is_active ? 'text-emerald-700' : 'text-amber-700/60'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="order-6 lg:order-none col-span-2 lg:col-span-1 flex items-center gap-2 lg:justify-end">
                        <Link
                          to={`/profile/${user.id}`}
                          className={`flex-1 lg:flex-none text-center px-3 py-1.5 rounded-md bg-amber-100 hover:bg-amber-200/60 font-serif text-xs font-medium text-amber-900 transition-colors ${focusRing}`}
                        >
                          View profile
                        </Link>
                        <button
                          onClick={() => setConfirmId(user.id)}
                          aria-label={`Delete ${user.name}`}
                          title="Delete user"
                          className={`p-2 rounded-lg text-amber-500 hover:text-red-600 hover:bg-red-50 transition-colors ${focusRing}`}
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>

                      {confirmId === user.id && (
                        <div
                          role="alert"
                          className="order-last col-span-full flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 border border-red-200/60 px-3 py-2.5"
                        >
                          <p className="font-serif text-sm text-red-700">
                            Delete <span className="font-mono font-semibold">{user.name}</span>?{' '}
                            {totalOrders > 0
                              ? `This user has ${totalOrders} orders, deactivating them is safer.`
                              : 'This action cannot be undone.'}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmId(null)}
                              className={`px-3 py-1.5 rounded-md font-serif text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors ${focusRing}`}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={deletingId === user.id}
                              className={`px-3 py-1.5 rounded-md font-serif text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60 inline-flex items-center gap-1.5 ${focusRing}`}
                            >
                              {deletingId === user.id && <Spinner className="h-3 w-3" />}
                              Delete user
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {users.length > PAGE_SIZE && (
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-amber-200/60 font-serif text-xs text-amber-700/70">
                  <span>
                    Showing{' '}
                    <span className="text-amber-950 font-mono tabular-nums">
                      {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, users.length)}
                    </span>{' '}
                    of <span className="font-mono tabular-nums">{users.length}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-md bg-amber-100 hover:bg-amber-200/60 text-amber-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded-md bg-amber-100 hover:bg-amber-200/60 text-amber-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                    >
                      Next
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
                  className="fixed inset-0 bg-amber-950/50 z-[60]"
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
                  <div className="bg-white !rounded-none !border-y-0 !border-r-0 h-full flex flex-col border-l border-amber-200/60 shadow-2xl">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                      <div className="flex items-start justify-between gap-3 p-5 border-b border-amber-200/60">
                        <div>
                          <h2 id="user-form-title" className="font-serif font-semibold text-amber-950">
                            Add new user
                          </h2>
                          <p className="font-serif text-xs text-amber-700/70 mt-0.5">Fill in the details below</p>
                        </div>
                        <button
                          type="button"
                          onClick={closeForm}
                          aria-label="Close form"
                          className={`p-1.5 rounded-lg text-amber-500 hover:text-amber-900 hover:bg-amber-100 transition-colors ${focusRing}`}
                        >
                          <Icon name="close" className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        <div>
                          <span className="block font-serif text-sm text-amber-900 mb-1.5">Role</span>
                          <div role="radiogroup" aria-label="Role" className="grid grid-cols-2 gap-1 p-1 bg-white border border-amber-200/60 rounded-xl">
                            {roleOptions.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                role="radio"
                                aria-checked={form.role === opt.value}
                                onClick={() => setForm({ ...form, role: opt.value })}
                                className={`py-1.5 rounded-lg font-serif text-xs transition-colors ${
                                  form.role === opt.value
                                    ? 'bg-amber-800 text-amber-50'
                                    : 'text-amber-700/70 hover:text-amber-900'
                                } ${focusRing}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="user-name" className="block font-serif text-sm text-amber-900 mb-1.5">
                            Full name
                          </label>
                          <input
                            id="user-name"
                            required
                            autoFocus
                            className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                            placeholder="Enter full name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label htmlFor="user-email" className="block font-serif text-sm text-amber-900 mb-1.5">
                            Email
                          </label>
                          <input
                            id="user-email"
                            required
                            type="email"
                            className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                            placeholder="email@domain.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="user-password" className="block font-serif text-sm text-amber-900">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className={`font-serif text-xs text-amber-700 hover:text-amber-900 font-medium rounded ${focusRing}`}
                            >
                              {showPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <input
                            id="user-password"
                            required
                            type={showPassword ? 'text' : 'password'}
                            minLength={6}
                            autoComplete="new-password"
                            className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                            placeholder="At least 6 characters"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                          />
                        </div>

                        <div>
                          <label htmlFor="user-phone" className="block font-serif text-sm text-amber-900 mb-1.5">
                            Phone number <span className="text-amber-700/60">(optional)</span>
                          </label>
                          <input
                            id="user-phone"
                            type="tel"
                            className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                            placeholder="081234567890"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="p-4 border-t border-amber-200/60 space-y-3">
                        {error && (
                          <div
                            role="alert"
                            className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200/60 text-red-700 font-serif text-sm"
                          >
                            <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                            {error}
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm rounded-xl transition-colors"
                          >
                            {saving ? (
                              <>
                                <Spinner />
                                Saving...
                              </>
                            ) : (
                              'Save user'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={closeForm}
                            className="px-4 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors"
                          >
                            Cancel
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