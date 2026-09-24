import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// ===== ICON COMPONENT =====
function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'M6 18L18 6M6 6l12 12',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    chevronDown: 'M6 9l6 6 6-6',
    inbox: 'M5 13l4 4L19 7 M3 3h18v18H3V3z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// ===== BRAND MARK =====
function BrandMark({ to = '/' }) {
  return (
    <Link
      to={to}
      className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 hover:bg-amber-50 transition-colors shrink-0 shadow-md shadow-black/30"
      aria-label="TiketKu Home"
    >
      <Icon name="ticket" className="w-5 h-5" />
    </Link>
  );
}

// ===== MAIN NAVBAR =====
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // ===== LOGOUT → REDIRECT KE LANDING PAGE =====
  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  const links = {
    customer: [
      { to: '/', label: 'Home' },
      { to: '/promos', label: 'Promo' },
      { to: '/my-orders', label: 'Orders' },
      { to: '/contact-history', label: 'Pesan Saya', requiresAuth: true },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/concerts', label: 'Concerts' },
      { to: '/admin/approvals', label: 'Approvals' },
      { to: '/admin/venues', label: 'Venues' },
      { to: '/admin/categories', label: 'Categories' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/orders', label: 'Orders' },
      { to: '/admin/payouts', label: 'Payouts' },
      { to: '/admin/promos', label: 'Promos' },
      { to: '/admin/reports', label: 'Reports' },
      { to: '/admin/contact-messages', label: 'Pesan Masuk' },
    ],
    petugas: [
      { to: '/petugas/scan', label: 'Scan Ticket' },
      { to: '/petugas/history', label: 'History' },
    ],
    eo: [
      { to: '/eo/dashboard', label: 'Dashboard' },
      { to: '/eo/concerts', label: 'Concerts' },
      { to: '/eo/payouts', label: 'Revenue' },
    ],
  };

  const items = user ? (links[user.role] || []).filter(item => !item.requiresAuth || user) : [];
  const homePath =
    user?.role === 'admin' ? '/admin/dashboard' :
    user?.role === 'petugas' ? '/petugas/scan' :
    user?.role === 'eo' ? '/eo/dashboard' : '/';

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const profilePath =
    user?.role === 'admin' ? `/profile/${user.id}` :
    user?.role === 'eo' ? `/profile/${user.id}` :
    '/profile';

  const guestLinks = [
    { to: '/', label: 'Home' },
    { to: '/promos', label: 'Promo' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const navLinks = user ? items : guestLinks;

  return (
    <div className="sticky top-0 z-50 pt-3 pb-2 px-3 sm:px-4">
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="max-w-6xl mx-auto"
      >
        {/* ===== PILL CONTAINER — GLASS COKLAT ===== */}
        <div
          className={`rounded-full
            backdrop-blur-xl
            border border-amber-200/20
            ring-1 ring-inset ring-white/5
            px-2 py-2 flex items-center gap-2 sm:gap-3
            transition-all duration-300 ${
            scrolled
              ? 'bg-amber-950/60 shadow-2xl shadow-amber-950/50'
              : 'bg-amber-950/40 shadow-xl shadow-amber-950/30'
          }`}
        >

          {/* KIRI — Brand icon pill */}
          <BrandMark to={homePath} />

          {/* TENGAH — Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`relative px-3.5 py-2 text-sm font-serif rounded-full transition-all ${
                  isActive(item.to)
                    ? 'text-amber-50 bg-amber-500/25 backdrop-blur-sm'
                    : 'text-amber-100/70 hover:text-amber-50 hover:bg-amber-500/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile: spacer */}
          <div className="flex-1 md:hidden" />

          {/* KANAN — User pill / Auth buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* User pill */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-amber-100/95 hover:bg-amber-50 rounded-full pl-1 pr-3 py-1 transition-colors shadow-md shadow-black/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center text-amber-50 text-sm font-serif font-semibold shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-xs font-serif font-medium text-amber-950 max-w-[120px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-14 w-56 bg-white border border-amber-200/50 rounded-2xl shadow-xl shadow-amber-950/10 overflow-hidden z-20"
                        >
                          <div className="p-4 border-b border-amber-200/30">
                            <p className="font-serif font-medium text-amber-950">{user.name}</p>
                            <p className="text-xs font-serif text-amber-600/50 truncate">{user.email}</p>
                          </div>
                          <div className="p-1">
                            <Link
                              to={profilePath}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm font-serif text-amber-700/60 hover:bg-amber-50/80 hover:text-amber-950 rounded-xl transition-colors"
                            >
                              <Icon name="user" className="w-4 h-4" />
                              My Profile
                            </Link>
                            {user.role === 'customer' && (
                              <>
                                <Link
                                  to="/my-orders"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm font-serif text-amber-700/60 hover:bg-amber-50/80 hover:text-amber-950 rounded-xl transition-colors"
                                >
                                  <Icon name="ticket" className="w-4 h-4" />
                                  Order History
                                </Link>
                                <Link
                                  to="/contact-history"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm font-serif text-amber-700/60 hover:bg-amber-50/80 hover:text-amber-950 rounded-xl transition-colors"
                                >
                                  <Icon name="inbox" className="w-4 h-4" />
                                  Pesan Saya
                                </Link>
                              </>
                            )}
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-serif text-red-500 hover:bg-red-50/80 rounded-xl transition-colors"
                            >
                              <Icon name="logout" className="w-4 h-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden w-10 h-10 rounded-full bg-amber-100/20 hover:bg-amber-100/30 flex items-center justify-center text-amber-100 transition-colors shrink-0 border border-amber-200/20"
                  aria-label="Toggle menu"
                >
                  <Icon name={mobileMenuOpen ? 'close' : 'menu'} className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2 text-xs font-serif text-amber-100/80 hover:text-amber-50 rounded-full transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-serif font-semibold text-amber-950 bg-amber-100/95 hover:bg-amber-50 rounded-full transition-colors shadow-md shadow-black/20 whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ===== MOBILE MENU (dropdown di bawah pill) ===== */}
        <AnimatePresence>
          {mobileMenuOpen && user && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 bg-amber-950/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-amber-950/40 border border-amber-200/20 ring-1 ring-inset ring-white/5 overflow-hidden"
            >
              <div className="p-2 space-y-0.5">
                {items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-2xl text-sm font-serif transition-colors ${
                      isActive(item.to)
                        ? 'text-amber-50 bg-amber-500/25'
                        : 'text-amber-100/80 hover:text-amber-50 hover:bg-amber-500/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-1 mt-1 border-t border-amber-200/15">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-serif text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Icon name="logout" className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}