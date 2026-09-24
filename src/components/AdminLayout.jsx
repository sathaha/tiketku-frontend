import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    inbox: 'M5 13l4 4L19 7 M3 3h18v18H3V3z',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    bell: 'M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// ===== TRAFFIC-LIGHT WINDOW DOTS =====
function TrafficLights() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-red-500/90 ring-1 ring-black/20" />
      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90 ring-1 ring-black/20" />
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 ring-1 ring-black/20" />
    </div>
  );
}

// ===== TOOLTIP FOR COLLAPSED SIDEBAR =====
function SideTooltip({ label, badge }) {
  return (
    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-ink-900/70 backdrop-blur-xl border border-white/10 rounded-md text-xs font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-150 z-50 shadow-xl flex items-center gap-2">
      {label}
      {badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-flame-500 text-white text-[9px] font-bold">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unseenPayouts, setUnseenPayouts] = useState(0);
  const navRef = useRef(null);

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

  const menuItems = {
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/admin/concerts', label: 'Konser', icon: 'concert' },
      { to: '/admin/approvals', label: 'Approval EO', icon: 'approval' },
      { to: '/admin/venues', label: 'Venue', icon: 'venue' },
      { to: '/admin/categories', label: 'Kategori', icon: 'category' },
      { to: '/admin/users', label: 'Pengguna', icon: 'users' },
      { to: '/admin/orders', label: 'Transaksi', icon: 'orders' },
      { to: '/admin/payouts', label: 'Pencairan Dana', icon: 'payouts' },
      { to: '/admin/promos', label: 'Promo', icon: 'promos' },
      { to: '/admin/reports', label: 'Laporan', icon: 'reports' },
      { to: '/admin/contact-messages', label: 'Pesan Masuk', icon: 'inbox', badge: unreadCount },
      { to: '/admin/profile', label: 'Profil', icon: 'profile' },
    ],
    eo: [
      { to: '/eo/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/eo/concerts', label: 'Konser Saya', icon: 'concert' },
      { to: '/eo/payouts', label: 'Pendapatan', icon: 'payouts', badge: unseenPayouts },
      { to: '/eo/bank-account', label: 'Rekening', icon: 'bank' },
      { to: '/eo/profile', label: 'Profil', icon: 'profile' },
    ],
  };

  const items = menuItems[user?.role] || [];
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Event Organizer';
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/eo/dashboard';

  const isActive = (path) => {
    if (path === dashboardPath) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const activeIndex = items.findIndex(item => isActive(item.to));
  const activeItem = items[activeIndex];
  const totalBadges = unreadCount + unseenPayouts;

  return (
    <div className="min-h-screen bg-ink-950 flex relative overflow-hidden">
      {/* Decorative blurred backdrop — what the glass panel reveals underneath */}
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

      {/* Sidebar — floating glass panel */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 lg:left-auto lg:my-4 lg:ml-4 z-50 bg-ink-900/40 backdrop-blur-2xl border border-white/10 lg:rounded-2xl shadow-2xl shadow-black/40 flex flex-col transform transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          collapsed ? 'w-[72px]' : 'w-64'
        } lg:h-[calc(100vh-2rem)]`}
      >
        {/* ===== WINDOW CHROME ===== */}
        <div className={`h-11 flex items-center border-b border-white/10 shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
          <TrafficLights />
          <button
            onClick={() => setSidebarOpen(false)}
            className={`ml-auto lg:hidden p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? 'hidden' : ''}`}
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* ===== LOGO ===== */}
        <div className={`h-16 flex items-center border-b border-white/10 shrink-0 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
          <BrandLogo to={dashboardPath} variant="dark" showText={!collapsed} />
        </div>

        {/* Toggle collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-8 border-b border-white/10 text-ink-500 hover:text-flame-400 hover:bg-white/5 transition-colors shrink-0 group"
        >
          <Icon name="chevron" className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Role chip */}
        {!collapsed && (
          <div className="px-5 py-3 border-b border-white/10 shrink-0 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-200 bg-white/5 rounded-full px-2.5 py-1 border border-white/10">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-flame-400 opacity-60" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-flame-400" />
              </span>
              {roleLabel}
            </span>
            {totalBadges > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-ink-500">
                <Icon name="bell" className="w-3 h-3 text-flame-400/70" />
              </span>
            )}
          </div>
        )}

        {/* Nav — scrollbar disembunyikan */}
        <nav ref={navRef} className="flex-1 overflow-y-auto py-4 relative no-scrollbar">
          {activeIndex >= 0 && !collapsed && (
            <motion.div
              layoutId="sidebar-indicator"
              className="absolute left-0 w-[3px] h-9 bg-gradient-to-b from-flame-400 to-flame-600 rounded-r-full shadow-[0_0_12px_rgba(249,115,22,0.4)]"
              style={{ top: `${activeIndex * 44 + 16}px` }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          <div className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
            {items.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive(item.to)
                    ? 'text-white bg-gradient-to-r from-flame-500/20 to-white/5 backdrop-blur-sm font-medium'
                    : 'text-ink-300 hover:text-white hover:bg-white/5 hover:pl-3.5'
                } ${collapsed ? 'justify-center hover:pl-0' : ''}`}
              >
                <Icon
                  name={item.icon}
                  className={`w-5 h-5 shrink-0 transition-colors ${isActive(item.to) ? 'text-flame-400' : 'text-ink-400 group-hover:text-ink-200'}`}
                />

                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-flame-500 text-white text-[10px] font-bold shadow-sm shadow-flame-500/40">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    {isActive(item.to) && !item.badge && (
                      <span className="text-[10px] text-flame-400/50 font-mono tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    )}
                  </>
                )}

                {collapsed && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-flame-500 ring-2 ring-ink-900" />
                )}

                {collapsed && <SideTooltip label={item.label} badge={item.badge} />}
              </Link>
            ))}
          </div>

          {/* fade hint at bottom when scrollable */}
          <div className="sticky bottom-0 h-6 bg-gradient-to-t from-ink-900/60 to-transparent pointer-events-none -mt-6" />
        </nav>

        {/* User & logout */}
        <div className={`p-4 border-t border-white/10 shrink-0 ${collapsed ? 'px-2' : ''}`}>
          <div className={`group relative flex items-center gap-3 mb-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flame-400 to-flame-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-flame-500/20 ring-2 ring-white/10">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-ink-900/60" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-ink-400 truncate">{user?.email}</p>
              </div>
            )}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-ink-900/70 backdrop-blur-xl border border-white/10 rounded-md text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl">
                <p className="font-medium text-white">{user?.name}</p>
                <p className="text-ink-400 text-[10px]">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Keluar' : ''}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-300 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon name="logout" className="w-4 h-4 shrink-0" />
            {!collapsed && 'Keluar'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile */}
        <header className="h-16 bg-ink-900/80 backdrop-blur-xl border-b border-ink-700 flex items-center px-4 sticky top-0 z-30 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-ink-400 hover:text-white hover:bg-ink-700 transition-colors"
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
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-flame-400" />
                <span className="text-sm font-medium text-ink-300">{roleLabel}</span>
              </>
            )}
          </div>
          {totalBadges > 0 && (
            <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-flame-500 text-white text-[10px] font-bold">
              {totalBadges > 99 ? '99+' : totalBadges}
            </span>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}