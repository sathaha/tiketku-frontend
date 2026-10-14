import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { getAllUsersWithStats, updateUserStatus } from '../../api/userApi';

/* ============ ICONS ============ */
const ICON_PATHS = {
  plus: 'M12 4v16m8-8H4',
  close: 'M6 18L18 6M6 6l12 12',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  check: 'M5 13l4 4L19 7',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
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

/* ============ CONSTANTS ============ */
const PAGE_SIZE = 20;
const tableCols = 'lg:grid-cols-[minmax(0,1.6fr)_7rem_4.5rem_4.5rem_8rem_9.5rem]';
const ROLE_KEYS = ['admin', 'petugas', 'eo', 'customer'];

const emptyForm = { name: '', email: '', password: '', phone: '', role: 'petugas' };

// Keys match the API. Pills and avatars (rows) plus folder themes (summary cards).
const roleConfig = {
  admin: {
    label: 'Admin',
    icon: 'shield',
    dot: 'bg-amber-950',
    pill: 'bg-amber-950 text-amber-50',
    avatar: 'bg-amber-950 text-amber-100',
    folder: { bg: 'bg-amber-950', text: 'text-amber-50', sub: 'text-amber-200/70', chip: 'bg-amber-900', avatar: 'bg-amber-800 text-amber-100', ring: 'ring-amber-950' },
  },
  petugas: {
    label: 'Staff',
    icon: 'check',
    dot: 'bg-amber-400',
    pill: 'bg-amber-200 text-amber-900',
    avatar: 'bg-amber-200 text-amber-900',
    folder: { bg: 'bg-amber-300', text: 'text-amber-950', sub: 'text-amber-900/70', chip: 'bg-amber-400/60', avatar: 'bg-amber-100 text-amber-900', ring: 'ring-amber-300' },
  },
  eo: {
    label: 'Organizer',
    icon: 'music',
    dot: 'bg-orange-600',
    pill: 'bg-orange-100 text-orange-800',
    avatar: 'bg-orange-100 text-orange-800',
    folder: { bg: 'bg-orange-600', text: 'text-orange-50', sub: 'text-orange-100/80', chip: 'bg-orange-700', avatar: 'bg-orange-200 text-orange-900', ring: 'ring-orange-600' },
  },
  customer: {
    label: 'Customer',
    icon: 'ticket',
    dot: 'bg-emerald-600',
    pill: 'bg-emerald-100 text-emerald-800',
    avatar: 'bg-emerald-100 text-emerald-800',
    folder: { bg: 'bg-emerald-700', text: 'text-emerald-50', sub: 'text-emerald-100/80', chip: 'bg-emerald-800', avatar: 'bg-emerald-200 text-emerald-900', ring: 'ring-emerald-700' },
  },
};

const roleOptions = [
  { value: 'petugas', label: 'Staff' },
  { value: 'eo', label: 'Event organizer' },
  { value: 'admin', label: 'Admin' },
  { value: 'customer', label: 'Customer' },
];

/* ============ ROLE FOLDER (also the role filter) ============ */
function RoleSummaryCard({ roleKey, count, allUsers, activeCount, isActiveFilter, onSelect }) {
  const role = roleConfig[roleKey];
  const t = role.folder;
  const sampleUsers = allUsers.filter((u) => u.role === roleKey).slice(0, 4);

  return (
    <button
      type="button"
      aria-pressed={isActiveFilter}
      aria-label={`${isActiveFilter ? 'Remove filter' : 'Filter by'} ${role.label}, ${count} users`}
      onClick={onSelect}
      className={`relative text-left w-full h-[170px] pt-3 rounded-2xl transition-[filter,transform] hover:brightness-110 active:scale-[0.98] ${focusRing}`}
    >
      {/* Folder tab */}
      <span className={`absolute top-0 left-0 h-4 w-24 rounded-t-lg ${t.bg}`} />

      {/* Folder body */}
      <span
        className={`relative h-full rounded-b-2xl rounded-tr-2xl ${t.bg} ${t.text} p-4 flex flex-col justify-between ${
          isActiveFilter ? 'ring-2 ring-offset-2 ring-offset-[#f5ede4] ring-amber-600' : ''
        }`}
      >
        <span className="block">
          <span className="flex items-center justify-between mb-3">
            <span className="f-display text-base font-semibold">{role.label}</span>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.chip}`}>
              <Icon name={role.icon} className="w-3.5 h-3.5" />
            </span>
          </span>

          <span className="flex -space-x-2">
            {sampleUsers.length > 0
              ? sampleUsers.map((u) => (
                  <span
                    key={u.id}
                    title={u.name}
                    className={`w-7 h-7 rounded-full ${t.avatar} flex items-center justify-center text-xs font-semibold ring-2 ${t.ring} shrink-0`}
                  >
                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                ))
              : [0, 1, 2].map((i) => (
                  <span key={i} className={`w-7 h-7 rounded-full ${t.chip} ring-2 ${t.ring} shrink-0`} />
                ))}
          </span>
        </span>

        <span className="flex items-end justify-between">
          <span>
            <span className={`block text-xs ${t.sub}`}>Total</span>
            <span className="block f-display text-3xl font-bold tabular-nums leading-none">{count}</span>
          </span>
          <span className="text-right">
            <span className={`block text-xs ${t.sub}`}>Active</span>
            <span className="block f-display text-base font-semibold tabular-nums">{activeCount}</span>
          </span>
        </span>
      </span>
    </button>
  );
}

/* ============ SWITCH ============ */
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
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse" role="status" aria-label="Loading users">
      <div className="h-12 bg-amber-950/90" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 border-t border-dashed border-amber-200">
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

const inputCls =
  'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';
const labelCls = 'block text-sm font-medium text-amber-900 mb-1.5';

/* ============ MAIN ============ */
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

  useEffect(() => {
    if (confirmId === null) return;
    const onKey = (e) => e.key === 'Escape' && setConfirmId(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmId]);

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
      setError('Use a password with at least 6 characters.');
      return;
    }
    const createdName = form.name;
    setSaving(true);
    try {
      await api.post('/users', form);
      closeForm();
      notify('success', `${createdName} was added`);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create the user. Please try again.");
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
      notify('error', err.response?.data?.message || "Couldn't change the status. Please try again.");
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
      notify('error', err.response?.data?.message || "Couldn't delete the user. Please try again.");
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

  const roleStats = ROLE_KEYS.reduce((acc, key) => {
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
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="f-display text-3xl font-bold text-amber-950">Users</h1>
              <p className="text-sm text-amber-700/80 mt-1">
                {allUsers.length} {allUsers.length === 1 ? 'user' : 'users'} registered
              </p>
            </div>
            <button
              onClick={openForm}
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors self-start sm:self-auto ${focusRing}`}
            >
              <Icon name="plus" className="w-4 h-4" />
              Add user
            </button>
          </header>

          {/* Role folders (also the role filter) */}
          <section className="mb-6" aria-label="Roles">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h2 className="f-display text-lg font-semibold text-amber-950">Roles</h2>
              <span className="text-sm text-amber-700/80">Select a folder to filter the list</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {ROLE_KEYS.map((roleKey) => (
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
            <div className="bg-white rounded-2xl grid grid-cols-2 divide-x divide-dashed divide-amber-200 mb-6">
              <div className="p-4">
                <p className="text-sm text-amber-700/80">Orders from these users</p>
                <p className="f-display text-2xl font-bold text-amber-950 tabular-nums mt-1.5 leading-none">
                  {totalStats.orders}
                </p>
              </div>
              <div className="p-4">
                <p className="text-sm text-amber-700/80">Paid orders</p>
                <p className="f-display text-2xl font-bold text-emerald-700 tabular-nums mt-1.5 leading-none">
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
                placeholder="Search by name or email"
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {roleFilter && (
              <button
                onClick={() => setRoleFilter('')}
                aria-label={`Remove filter ${roleConfig[roleFilter]?.label}`}
                className={`inline-flex items-center gap-2 self-start px-3.5 py-2 bg-amber-950 text-amber-50 rounded-full text-sm font-medium hover:bg-amber-900 transition-colors ${focusRing}`}
              >
                <span className={`w-2 h-2 rounded-full ${roleConfig[roleFilter]?.dot} ring-1 ring-amber-50/60`} />
                {roleConfig[roleFilter]?.label}
                <Icon name="close" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User list */}
          {loading ? (
            <SkeletonRows />
          ) : users.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                <Icon name="user" className="w-6 h-6" />
              </div>
              {isFiltering ? (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No users match</h3>
                  <p className="text-sm text-amber-800/80 mb-5">Change the keyword or pick another role folder.</p>
                  <button
                    onClick={resetFilters}
                    className={`px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">No users yet</h3>
                  <p className="text-sm text-amber-800/80 mb-5">Add the first admin, staff member or organizer.</p>
                  <button
                    onClick={openForm}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Add user
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-amber-950/5">
              <div className="flex items-center justify-between px-5 py-3.5 bg-amber-950 text-amber-50">
                <h2 className="f-display text-lg font-semibold">
                  {roleFilter ? `${roleConfig[roleFilter]?.label} users` : 'All users'}
                </h2>
                <span className="text-sm text-amber-200/70 tabular-nums">
                  {users.length} {users.length === 1 ? 'user' : 'users'}
                </span>
              </div>

              <div className={`hidden lg:grid ${tableCols} gap-4 px-5 py-2.5 bg-amber-50 border-b border-dashed border-amber-200 text-xs font-medium text-amber-700`}>
                <span>User</span>
                <span>Role</span>
                <span className="text-right">Orders</span>
                <span className="text-right">Paid</span>
                <span>Status</span>
                <span />
              </div>

              <ul className="divide-y divide-dashed divide-amber-200">
                {pageItems.map((user) => {
                  const role = roleConfig[user.role] || roleConfig.customer;
                  const totalOrders = user.total_orders || 0;
                  const totalPaid = user.total_orders_paid || 0;
                  const dimmed = !user.is_active ? 'opacity-60' : '';
                  return (
                    <li
                      key={user.id}
                      className={`grid grid-cols-2 ${tableCols} gap-x-4 gap-y-3 items-center px-5 py-4 hover:bg-amber-50/60 transition-colors`}
                    >
                      <div className={`order-1 lg:order-none col-span-2 lg:col-span-1 flex items-center gap-3 min-w-0 ${dimmed}`}>
                        <span className={`w-10 h-10 rounded-full ${role.avatar} f-display text-base font-semibold flex items-center justify-center shrink-0`}>
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-amber-950 truncate">{user.name}</p>
                          <p className="text-xs text-amber-700/80 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className={`order-2 lg:order-none ${dimmed}`}>
                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${role.pill}`}>
                          {role.label}
                        </span>
                      </div>

                      <div className={`order-4 lg:order-none lg:text-right ${dimmed}`}>
                        <p className="text-xs text-amber-700/80 lg:hidden mb-0.5">Orders</p>
                        <p className="text-sm font-semibold text-amber-950 tabular-nums">{totalOrders}</p>
                      </div>

                      <div className={`order-5 lg:order-none lg:text-right ${dimmed}`}>
                        <p className="text-xs text-amber-700/80 lg:hidden mb-0.5">Paid</p>
                        <p className="text-sm font-semibold text-emerald-700 tabular-nums">{totalPaid}</p>
                      </div>

                      <div className="order-3 lg:order-none flex items-center gap-2.5 justify-self-end lg:justify-self-start">
                        <Switch
                          checked={!!user.is_active}
                          disabled={processingId === user.id}
                          onChange={() => toggleActive(user)}
                          label={user.is_active ? `Deactivate ${user.name}` : `Activate ${user.name}`}
                        />
                        <span className={`text-xs font-medium ${user.is_active ? 'text-emerald-700' : 'text-amber-700/70'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="order-6 lg:order-none col-span-2 lg:col-span-1 flex items-center gap-2 lg:justify-end">
                        <Link
                          to={`/profile/${user.id}`}
                          className={`flex-1 lg:flex-none text-center px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200/70 text-xs font-medium text-amber-900 transition-colors ${focusRing}`}
                        >
                          View profile
                        </Link>
                        <button
                          onClick={() => setConfirmId(user.id)}
                          aria-label={`Delete ${user.name}`}
                          title="Delete user"
                          className={`p-2 rounded-lg text-amber-600 hover:text-red-600 hover:bg-red-50 transition-colors ${focusRing}`}
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>

                      {confirmId === user.id && (
                        <div
                          role="alert"
                          className="order-last col-span-full flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3"
                        >
                          <p className="text-sm text-red-700">
                            Delete <span className="font-semibold">{user.name}</span>?{' '}
                            {totalOrders > 0
                              ? `They have ${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'}, so deactivating is the safer choice.`
                              : "This can't be undone."}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmId(null)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 bg-white hover:bg-amber-50 transition-colors ${focusRing}`}
                            >
                              Keep user
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={deletingId === user.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60 inline-flex items-center gap-1.5 ${focusRing}`}
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
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-dashed border-amber-200 text-sm text-amber-700/80">
                  <span>
                    Showing{' '}
                    <span className="text-amber-950 font-medium tabular-nums">
                      {pageStart + 1} to {Math.min(pageStart + PAGE_SIZE, users.length)}
                    </span>{' '}
                    of <span className="tabular-nums">{users.length}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200/70 text-amber-900 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200/70 text-amber-900 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
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
                  className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-[60]"
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
                  className="f-body fixed inset-y-0 right-0 z-[70] w-full max-w-md"
                >
                  <div className="bg-white h-full flex flex-col shadow-2xl shadow-amber-950/30">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                      <div className="flex items-start justify-between gap-3 p-5 bg-amber-950 text-amber-50">
                        <div>
                          <h2 id="user-form-title" className="f-display text-xl font-semibold">
                            Add a user
                          </h2>
                          <p className="text-sm text-amber-200/70 mt-0.5">Pick a role, then fill in their details.</p>
                        </div>
                        <button
                          type="button"
                          onClick={closeForm}
                          aria-label="Close form"
                          className={`-mr-1.5 -mt-1 p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors ${focusRing}`}
                        >
                          <Icon name="close" className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        <div>
                          <span id="role-label" className={labelCls}>Role</span>
                          <div role="radiogroup" aria-labelledby="role-label" className="grid grid-cols-2 gap-2">
                            {roleOptions.map((opt) => {
                              const selected = form.role === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  onClick={() => setForm({ ...form, role: opt.value })}
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    selected
                                      ? 'bg-amber-950 text-amber-50'
                                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  } ${focusRing}`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${roleConfig[opt.value].dot} ${selected ? 'ring-1 ring-amber-50/60' : ''}`} />
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-4 pt-5 border-t border-dashed border-amber-200">
                          <div>
                            <label htmlFor="user-name" className={labelCls}>Full name</label>
                            <input
                              id="user-name"
                              required
                              autoFocus
                              autoComplete="name"
                              className={inputCls}
                              placeholder="Enter their full name"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                          </div>

                          <div>
                            <label htmlFor="user-email" className={labelCls}>Email</label>
                            <input
                              id="user-email"
                              required
                              type="email"
                              autoComplete="email"
                              className={inputCls}
                              placeholder="name@example.com"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label htmlFor="user-password" className="block text-sm font-medium text-amber-900">
                                Password
                              </label>
                              <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className={`text-sm text-amber-700 hover:text-amber-950 font-medium rounded ${focusRing}`}
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
                              className={inputCls}
                              placeholder="At least 6 characters"
                              value={form.password}
                              onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                          </div>

                          <div>
                            <label htmlFor="user-phone" className={labelCls}>
                              Phone number <span className="text-amber-700/60 font-normal">(optional)</span>
                            </label>
                            <input
                              id="user-phone"
                              type="tel"
                              autoComplete="tel"
                              className={inputCls}
                              placeholder="081234567890"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-dashed border-amber-200 space-y-3">
                        {error && (
                          <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                            <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                            {error}
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={closeForm}
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
                            ) : (
                              'Add user'
                            )}
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