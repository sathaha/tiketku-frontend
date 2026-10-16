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
    arrowRight: 'M5 12h14M12 5l7 7-7 7',
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

const MAX_VISIBLE = 6;

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

// ===== BRAND =====
function Brand({ to = '/' }) {
  return (
    <Link
      to={to}
      aria-label="TiketKu Home"
      className={`flex items-center gap-2.5 shrink-0 rounded-lg ${focusRing}`}
    >
      <span className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-950">
        <Icon name="ticket" className="w-4 h-4" />
      </span>
      <span className="hidden lg:block font-serif text-lg font-semibold text-amber-50 tracking-tight">
        tiket<span className="text-amber-400">ku</span>
      </span>
    </Link>
  );
}

// ===== DROPDOWN ITEM =====
function DropdownItem({ to, icon, label, onClick, danger = false }) {
  const baseColor = danger ? 'text-red-600' : 'text-amber-900';
  const hoverBg = danger ? 'hover:bg-red-50' : 'hover:bg-amber-50';
  const iconBg = danger ? 'bg-red-100 group-hover:bg-red-200/70' : 'bg-amber-100 group-hover:bg-amber-200/70';
  const iconColor = danger ? 'text-red-600' : 'text-amber-800';
  const arrowColor = danger ? 'text-red-400' : 'text-amber-400';

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${baseColor} ${hoverBg}`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${iconBg}`}>
        <Icon name={icon} className={`w-4 h-4 ${iconColor}`} />
      </span>
      <span className="flex-1">{label}</span>
      <Icon
        name="arrowRight"
        className={`w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ${arrowColor}`}
      />
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
  const [menu, setMenu] = useState(null);
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

  const dropdownMotion = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
    transition: { duration: reduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] },
  };

  const mobileListVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.03,
        delayChildren: 0.05,
      },
    },
  };
  const mobileItemVariants = {
    hidden: { opacity: 0, y: -4 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } },
  };

  const menuItem = 'flex items-center gap-2.5 px-3 py-2 text-sm font-serif rounded-lg transition-colors';

  return (
    <div className="sticky top-0 z-50 pt-3 pb-2 px-3 sm:px-4">
      {menu && <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} aria-hidden="true" />}

      <motion.nav
        initial={reduceMotion ? false : { y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="relative z-20 max-w-6xl mx-auto"
      >
        {/* ===== PILL CONTAINER ===== */}
        <div
          className={`rounded-2xl border transition-colors duration-200 px-2.5 py-2 flex items-center gap-2 sm:gap-3 ${
            scrolled
              ? 'bg-amber-950 border-amber-900 shadow-sm'
              : 'bg-amber-950/85 border-amber-900/60'
          }`}
        >
          {/* LEFT — Brand */}
          <Brand to={homePath} />

          {/* CENTER — Nav links (desktop) — flex-1 justify-center biar di tengah */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {visibleLinks.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative px-3 py-2 text-sm font-serif rounded-lg transition-colors ${focusRing} ${
                    active
                      ? 'text-amber-50 bg-amber-900/70'
                      : 'text-amber-100/60 hover:text-amber-50 hover:bg-amber-900/40'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {/* Underline amber tipis di bawah text */}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute left-3 right-3 bottom-1 h-px bg-amber-400/80"
                      aria-hidden="true"
                    />
                  )}
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
                  className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-serif rounded-lg transition-colors ${focusRing} ${
                    moreActive
                      ? 'text-amber-50 bg-amber-900/70'
                      : 'text-amber-100/60 hover:text-amber-50 hover:bg-amber-900/40'
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
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-52 bg-white border border-amber-200 rounded-xl shadow-lg overflow-hidden p-1 z-20"
                    >
                      {moreLinks.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMenu(null)}
                          aria-current={isActive(item.to) ? 'page' : undefined}
                          className={`${menuItem} ${
                            isActive(item.to)
                              ? 'text-amber-950 bg-amber-100'
                              : 'text-amber-900 hover:bg-amber-50'
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

          {/* RIGHT — User / Login / Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenu(menu === 'user' ? null : 'user')}
                  aria-expanded={menu === 'user'}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-colors ${focusRing} ${
                    menu === 'user' ? 'bg-amber-100' : 'bg-amber-100/90 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-amber-900 flex items-center justify-center text-amber-50 text-xs font-serif font-semibold shrink-0">
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
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-3 w-72 bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden z-20"
                    >
                      {/* Header */}
                      <div className="relative bg-amber-950 px-4 py-4 overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-[0.06] pointer-events-none"
                          style={{
                            backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
                            backgroundSize: '18px 18px',
                          }}
                          aria-hidden="true"
                        />
                        <div className="relative flex items-center gap-3">
                          <motion.span
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
                            className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-950 font-serif font-bold text-lg shrink-0 ring-2 ring-amber-500/40 ring-offset-2 ring-offset-amber-950"
                          >
                            {user.name?.charAt(0).toUpperCase()}
                          </motion.span>
                          <div className="min-w-0 flex-1">
                            <p className="font-serif font-semibold text-amber-50 truncate leading-tight">
                              {user.name}
                            </p>
                            <p className="text-xs font-serif text-amber-200/70 truncate mt-0.5">
                              {user.email}
                            </p>
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-dashed border-amber-400/60 text-[10px] font-serif tracking-wider text-amber-300 uppercase">
                              <span className="w-1 h-1 rounded-full bg-amber-400" />
                              {roleLabel[user.role] || user.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-2">
                        <DropdownItem to={profilePath} icon="user" label="My Profile" onClick={() => setMenu(null)} />
                        {user.role === 'customer' && (
                          <>
                            <DropdownItem to="/my-orders" icon="ticket" label="Order History" onClick={() => setMenu(null)} />
                            <DropdownItem to="/contact-history" icon="inbox" label="My Messages" onClick={() => setMenu(null)} />
                          </>
                        )}

                        <div className="my-1.5 mx-2 border-t border-dashed border-amber-200/80" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-serif text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                        >
                          <span className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200/70 flex items-center justify-center shrink-0 transition-colors">
                            <Icon name="logout" className="w-4 h-4 text-red-600" />
                          </span>
                          <span className="flex-1 text-left">Logout</span>
                          <Icon
                            name="arrowRight"
                            className="w-4 h-4 text-red-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                          />
                        </button>
                      </div>

                      {/* Serial footer */}
                      <div className="px-4 py-2 bg-amber-50/60 border-t border-dashed border-amber-200 flex items-center justify-between text-[10px] font-serif text-amber-700/60 tabular-nums">
                        <span>✂ No. TK-{String(user.id || 0).padStart(4, '0')}</span>
                        <span>Signed in</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`hidden sm:block px-3.5 py-2 text-sm font-serif text-amber-100/80 hover:text-amber-50 rounded-lg transition-colors ${focusRing}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-3.5 py-2 text-sm font-serif font-medium text-amber-950 bg-amber-100 hover:bg-amber-50 rounded-lg transition-colors whitespace-nowrap ${focusRing}`}
                >
                  Register
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className={`md:hidden w-9 h-9 rounded-lg bg-amber-900/60 hover:bg-amber-900 flex items-center justify-center text-amber-50 transition-colors shrink-0 ${focusRing}`}
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="md:hidden mt-2 overflow-hidden"
            >
              <div className="bg-white border border-amber-200 rounded-xl shadow-lg overflow-hidden">
                <motion.div
                  variants={mobileListVariants}
                  initial="hidden"
                  animate="show"
                  className="p-1.5 space-y-0.5"
                >
                  {navLinks.map((item) => {
                    const active = isActive(item.to);
                    return (
                      <motion.div key={item.to} variants={mobileItemVariants}>
                        <Link
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={`block px-3.5 py-2.5 rounded-lg text-sm font-serif transition-colors ${
                            active
                              ? 'text-amber-950 bg-amber-100'
                              : 'text-amber-900 hover:bg-amber-50'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}

                  <motion.div
                    variants={mobileItemVariants}
                    className="pt-2 mt-1 border-t border-dashed border-amber-200/70"
                  >
                    {user ? (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-serif text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Icon name="logout" className="w-4 h-4" />
                        Logout
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 p-1">
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-center px-3 py-2.5 rounded-lg text-sm font-serif text-amber-900 border border-amber-200 hover:bg-amber-50 transition-colors"
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-center px-3 py-2.5 rounded-lg text-sm font-serif font-medium text-amber-950 bg-amber-100 hover:bg-amber-50 transition-colors"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}