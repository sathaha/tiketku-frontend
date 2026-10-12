import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
    inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// ===== MENU DATA =====
const links = {
  customer: [
    { to: '/', label: 'Home' },
    { to: '/promos', label: 'Promos' },
    { to: '/my-orders', label: 'Orders' },
    { to: '/contact-history', label: 'My Messages' },
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
    { to: '/admin/contact-messages', label: 'Inbox' },
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

const guestLinks = [
  { to: '/', label: 'Home' },
  { to: '/promos', label: 'Promos' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const roleLabel = {
  customer: 'Customer',
  admin: 'Admin',
  eo: 'Event Organizer',
  petugas: 'Staff',
};

// If there are more menu items than this, the rest go into a "More" dropdown
const MAX_VISIBLE = 6;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70';

// ===== BRAND =====
function Brand({ to = '/' }) {
  return (
    <Link
      to={to}
      aria-label="TiketKu Home"
      className={`flex items-center gap-2.5 shrink-0 rounded-full pr-1 lg:pr-3 ${focusRing}`}
    >
      <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 hover:bg-amber-50 transition-colors shadow-md shadow-black/30">
        <Icon name="ticket" className="w-5 h-5" />
      </span>
      <span className="hidden lg:block font-serif text-lg font-semibold text-amber-50 tracking-tight">
        TiketKu
      </span>
    </Link>
  );
}

// ===== MAIN NAVBAR =====
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menu, setMenu] = useState(null); // 'user' | 'more' | null
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenu(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ===== LOGOUT → REDIRECT TO LANDING PAGE =====
  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  const navLinks = user ? links[user.role] || [] : guestLinks;

  const homePath =
    user?.role === 'admin' ? '/admin/dashboard' :
    user?.role === 'petugas' ? '/petugas/scan' :
    user?.role === 'eo' ? '/eo/dashboard' : '/';

  const profilePath =
    user?.role === 'admin' || user?.role === 'eo' ? `/profile/${user.id}` : '/profile';

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const overflow = navLinks.length > MAX_VISIBLE;
  const visibleLinks = overflow ? navLinks.slice(0, MAX_VISIBLE - 1) : navLinks;
  const moreLinks = overflow ? navLinks.slice(MAX_VISIBLE - 1) : [];
  const moreActive = moreLinks.some((l) => isActive(l.to));

  const slide = reduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 380, damping: 32 };

  const dropdownMotion = {
    initial: { opacity: 0, y: 8, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.97 },
    transition: { duration: 0.15 },
  };

  const menuItem =
    'flex items-center gap-2.5 px-3 py-2 text-sm font-serif rounded-xl transition-colors';

  return (
    <div className="sticky top-0 z-50 pt-3 pb-2 px-3 sm:px-4">
      {/* Outside-click catcher for the dropdown. Placed outside the nav so it truly covers the screen. */}
      {menu && <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} aria-hidden="true" />}

      <motion.nav
        initial={reduceMotion ? false : { y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="relative z-20 max-w-6xl mx-auto"
      >
        {/* ===== PILL CONTAINER — BROWN GLASS ===== */}
        <div
          className={`rounded-full backdrop-blur-xl border border-amber-200/20 ring-1 ring-inset ring-white/5 px-2 py-2 flex items-center gap-2 sm:gap-3 transition-all duration-300 ${
            scrolled
              ? 'bg-amber-950/60 shadow-2xl shadow-amber-950/50'
              : 'bg-amber-950/40 shadow-xl shadow-amber-950/30'
          }`}
        >
          {/* LEFT */}
          <Brand to={homePath} />

          {/* CENTER — nav links (desktop) */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {visibleLinks.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-sm font-serif rounded-full transition-colors ${focusRing} ${
                    active ? 'text-amber-50' : 'text-amber-100/70 hover:text-amber-50 hover:bg-amber-500/10'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={slide}
                      className="absolute inset-0 rounded-full bg-amber-500/25"
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}

            {overflow && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenu(menu === 'more' ? null : 'more')}
                  aria-expanded={menu === 'more'}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1 px-3.5 py-2 text-sm font-serif rounded-full transition-colors ${focusRing} ${
                    moreActive
                      ? 'text-amber-50 bg-amber-500/25'
                      : 'text-amber-100/70 hover:text-amber-50 hover:bg-amber-500/10'
                  }`}
                >
                  More
                  <Icon
                    name="chevronDown"
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${menu === 'more' ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {menu === 'more' && (
                    <motion.div
                      {...dropdownMotion}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-52 bg-amber-950/95 backdrop-blur-xl border border-amber-200/20 rounded-2xl shadow-2xl shadow-amber-950/50 p-1.5 z-20"
                    >
                      {moreLinks.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMenu(null)}
                          aria-current={isActive(item.to) ? 'page' : undefined}
                          className={`${menuItem} ${
                            isActive(item.to)
                              ? 'text-amber-50 bg-amber-500/25'
                              : 'text-amber-100/80 hover:text-amber-50 hover:bg-amber-500/10'
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile: spacer */}
          <div className="flex-1 md:hidden" />

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenu(menu === 'user' ? null : 'user')}
                  aria-expanded={menu === 'user'}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 bg-amber-100/95 hover:bg-amber-50 rounded-full pl-1 pr-3 py-1 transition-colors shadow-md shadow-black/20 ${focusRing}`}
                >
                  <span className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center text-amber-50 text-sm font-serif font-semibold shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:block text-xs font-serif font-medium text-amber-950 max-w-[110px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <Icon
                    name="chevronDown"
                    className={`w-3.5 h-3.5 text-amber-900/70 transition-transform duration-200 ${menu === 'user' ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {menu === 'user' && (
                    <motion.div
                      {...dropdownMotion}
                      className="absolute right-0 top-full mt-3 w-60 bg-white border border-amber-200/50 rounded-2xl shadow-xl shadow-amber-950/10 overflow-hidden z-20"
                    >
                      <div className="px-4 py-3.5 border-b border-amber-200/40 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-amber-800 flex items-center justify-center text-amber-50 font-serif font-semibold shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-serif font-medium text-amber-950 truncate">{user.name}</p>
                          <p className="text-xs font-serif text-amber-700/70 truncate">{user.email}</p>
                          <p className="text-xs font-serif text-amber-800 mt-0.5">{roleLabel[user.role] || user.role}</p>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <Link
                          to={profilePath}
                          className={`${menuItem} text-amber-800/80 hover:bg-amber-50 hover:text-amber-950`}
                        >
                          <Icon name="user" className="w-4 h-4" />
                          My Profile
                        </Link>
                        {user.role === 'customer' && (
                          <>
                            <Link
                              to="/my-orders"
                              className={`${menuItem} text-amber-800/80 hover:bg-amber-50 hover:text-amber-950`}
                            >
                              <Icon name="ticket" className="w-4 h-4" />
                              Order History
                            </Link>
                            <Link
                              to="/contact-history"
                              className={`${menuItem} text-amber-800/80 hover:bg-amber-50 hover:text-amber-950`}
                            >
                              <Icon name="inbox" className="w-4 h-4" />
                              My Messages
                            </Link>
                          </>
                        )}
                        <div className="my-1.5 border-t border-amber-200/40" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className={`${menuItem} w-full text-red-500 hover:bg-red-50/80`}
                        >
                          <Icon name="logout" className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`hidden sm:block px-4 py-2 text-xs font-serif text-amber-100/80 hover:text-amber-50 rounded-full transition-colors ${focusRing}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 text-xs font-serif font-semibold text-amber-950 bg-amber-100/95 hover:bg-amber-50 rounded-full transition-colors shadow-md shadow-black/20 whitespace-nowrap ${focusRing}`}
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile menu toggle — now also available for guests */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className={`md:hidden w-10 h-10 rounded-full bg-amber-100/20 hover:bg-amber-100/30 flex items-center justify-center text-amber-100 transition-colors shrink-0 border border-amber-200/20 ${focusRing}`}
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="md:hidden mt-2 bg-amber-950/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-amber-950/40 border border-amber-200/20 ring-1 ring-inset ring-white/5 overflow-hidden"
            >
              <div className="p-2 space-y-0.5">
                {navLinks.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`block px-4 py-2.5 rounded-2xl text-sm font-serif transition-colors ${
                        active
                          ? 'text-amber-50 bg-amber-500/25'
                          : 'text-amber-100/80 hover:text-amber-50 hover:bg-amber-500/10'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="pt-2 mt-1 border-t border-amber-200/15">
                  {user ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-serif text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Icon name="logout" className="w-4 h-4" />
                      Logout
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pb-1">
                      <Link
                        to="/login"
                        className="text-center px-4 py-2.5 rounded-2xl text-sm font-serif text-amber-100 border border-amber-200/30 hover:bg-amber-500/10 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="text-center px-4 py-2.5 rounded-2xl text-sm font-serif font-semibold text-amber-950 bg-amber-100/95 hover:bg-amber-50 transition-colors"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}