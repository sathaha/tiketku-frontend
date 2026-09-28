import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import BrandLogo from './BrandLogo';

function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    concert: 'M9 19V6l12-2v13M9 19a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
    approval: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    venue: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    category: 'M20.59 13.41L11 3.83A2 2 0 009.59 3.24H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.58 9.59a2 2 0 002.83 0l4.59-4.6a2 2 0 000-2.82zM7 8h.01',
    users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    orders: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    payouts: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    promos: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    reports: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    profile: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'M6 18L18 6M6 6l12 12',
    chevron: 'M9 5l7 7-7 7',
    bank: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3',
    inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-400/60';

function Badge({ count, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-flame-500 text-white text-[10px] font-bold ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [unseenPayouts, setUnseenPayouts] = useState(0);

  // Mode ringkas hanya berlaku di desktop; drawer mobile selalu lebar penuh
  const compact = collapsed && isDesktop;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSidebarOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === 'eo') {
      fetchUnseenPayouts();
      const interval = setInterval(fetchUnseenPayouts, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.role, location.pathname]);

  async function fetchUnreadCount() {
    try {
      const res = await api.get('/contact-messages/unread-count');
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      // silent
    }
  }

  async function fetchUnseenPayouts() {
    try {
      const res = await api.get('/orders/eo/unseen-payouts');
      setUnseenPayouts(res.data.count || 0);
    } catch (err) {
      // silent
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
      } catch {
        // abaikan
      }
      return next;
    });
  }

  // Menu dikelompokkan supaya 12 item admin tidak jadi satu daftar panjang
  const menuGroups = {
    admin: [
      { items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' }] },
      {
        label: 'Event',
        items: [
          { to: '/admin/concerts', label: 'Konser', icon: 'concert' },
          { to: '/admin/approvals', label: 'Approval EO', icon: 'approval' },
          { to: '/admin/venues', label: 'Venue', icon: 'venue' },
          { to: '/admin/categories', label: 'Kategori', icon: 'category' },
        ],
      },
      {
        label: 'Keuangan',
        items: [
          { to: '/admin/orders', label: 'Transaksi', icon: 'orders' },
          { to: '/admin/payouts', label: 'Pencairan Dana', icon: 'payouts' },
          { to: '/admin/promos', label: 'Promo', icon: 'promos' },
          { to: '/admin/reports', label: 'Laporan', icon: 'reports' },
        ],
      },
      {
        label: 'Lainnya',
        items: [
          { to: '/admin/users', label: 'Pengguna', icon: 'users' },
          { to: '/admin/contact-messages', label: 'Pesan Masuk', icon: 'inbox', badge: unreadCount },
          { to: '/admin/profile', label: 'Profil', icon: 'profile' },
        ],
      },
    ],
    eo: [
      {
        items: [
          { to: '/eo/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { to: '/eo/concerts', label: 'Konser Saya', icon: 'concert' },
          { to: '/eo/payouts', label: 'Pendapatan', icon: 'payouts', badge: unseenPayouts },
          { to: '/eo/bank-account', label: 'Rekening', icon: 'bank' },
          { to: '/eo/profile', label: 'Profil', icon: 'profile' },
        ],
      },
    ],
  };

  const groups = menuGroups[user?.role] || [];
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Event Organizer';
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/eo/dashboard';

  const isActive = (path) => {
    if (path === dashboardPath) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const activeItem = groups.flatMap((g) => g.items).find((item) => isActive(item.to));
  const totalBadges = unreadCount + unseenPayouts;

  const slide = reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 34 };

  return (
    <div className="min-h-screen bg-ink-950 flex relative">
      {/* Latar blur yang terlihat menembus panel kaca di sidebar */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[32rem] h-[32rem] rounded-full bg-flame-600/20 blur-[100px]" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-flame-400/10 blur-[110px]" />
        <div className="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] rounded-full bg-ink-700/40 blur-[100px]" />
      </div>

      {/* Overlay mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-ink-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 transition-[transform,width] duration-300
          lg:sticky lg:top-4 lg:bottom-auto lg:self-start lg:my-4 lg:ml-4 lg:h-[calc(100vh-2rem)] lg:rounded-2xl lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${compact ? 'w-[72px]' : 'w-64'}`}
      >
        {/* Toggle collapse — menempel di tepi sidebar */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Perbesar sidebar' : 'Kecilkan sidebar'}
          className={`hidden lg:flex absolute -right-3 top-5 z-10 w-6 h-6 items-center justify-center rounded-full bg-ink-700 border border-ink-500 text-ink-300 hover:text-flame-400 transition-colors ${focusRing}`}
        >
          <Icon name="chevron" className={`w-3.5 h-3.5 transition-transform duration-300 ${compact ? '' : 'rotate-180'}`} />
        </button>

        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-white/10 shrink-0 ${compact ? 'justify-center px-2' : 'px-5'}`}>
          <BrandLogo to={dashboardPath} variant="dark" showText={!compact} />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
            className={`ml-auto lg:hidden p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-white/10 transition-colors ${focusRing}`}
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav aria-label="Menu utama" className="flex-1 overflow-y-auto py-4 no-scrollbar">
          {!compact && <p className="px-6 pb-3 text-xs text-ink-500">{roleLabel}</p>}

          {groups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
              {group.label &&
                (compact ? (
                  <div className="mx-4 mb-2 border-t border-white/10" />
                ) : (
                  <p className="px-6 pb-1.5 text-xs text-ink-500">{group.label}</p>
                ))}

              <div className={`space-y-0.5 ${compact ? 'px-2' : 'px-3'}`}>
                {group.items.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      title={compact ? item.label : undefined}
                      aria-label={compact ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${focusRing} ${
                        active ? 'text-white font-medium' : 'text-ink-300 hover:text-white hover:bg-white/5'
                      } ${compact ? 'justify-center' : ''}`}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          transition={slide}
                          className="absolute inset-0 rounded-lg bg-flame-500/15"
                        >
                          <span className="absolute left-0 inset-y-2 w-[3px] rounded-r-full bg-flame-400" />
                        </motion.span>
                      )}

                      <Icon
                        name={item.icon}
                        className={`relative w-5 h-5 shrink-0 transition-colors ${
                          active ? 'text-flame-400' : 'text-ink-400 group-hover:text-ink-200'
                        }`}
                      />

                      {!compact && <span className="relative flex-1 truncate">{item.label}</span>}
                      {!compact && item.badge > 0 && <Badge count={item.badge} className="relative" />}

                      {compact && item.badge > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-flame-500 ring-2 ring-ink-900" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User & logout */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <div
            className={`flex items-center gap-3 px-1 pb-3 ${compact ? 'justify-center' : ''}`}
            title={compact ? user?.name : undefined}
          >
            <div className="w-9 h-9 rounded-full bg-flame-500 flex items-center justify-center text-white font-semibold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!compact && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-ink-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={compact ? 'Keluar' : undefined}
            aria-label={compact ? 'Keluar' : undefined}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-300 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors ${focusRing} ${
              compact ? 'justify-center' : ''
            }`}
          >
            <Icon name="logout" className="w-4 h-4 shrink-0" />
            {!compact && 'Keluar'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="relative z-[1] flex-1 flex flex-col min-w-0">
        {/* Top bar mobile */}
        <header className="h-16 bg-ink-900/80 backdrop-blur-xl border-b border-ink-700 flex items-center px-4 sticky top-0 z-30 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
            className={`p-2 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors ${focusRing}`}
          >
            <Icon name="menu" />
          </button>
          <div className="ml-3 flex items-center gap-2 min-w-0">
            {activeItem ? (
              <>
                <Icon name={activeItem.icon} className="w-4 h-4 text-flame-400 shrink-0" />
                <span className="text-sm font-medium text-white truncate">{activeItem.label}</span>
              </>
            ) : (
              <span className="text-sm font-medium text-ink-300">{roleLabel}</span>
            )}
          </div>
          {totalBadges > 0 && <Badge count={totalBadges} className="ml-auto" />}
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}