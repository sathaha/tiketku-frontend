import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, MotionConfig, useReducedMotion, useInView } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getUserWithStats } from '../../api/userApi';

const EASE = [0.22, 1, 0.36, 1];

/* ============ ICONS ============ */
const ICON_PATHS = {
  camera: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  lock: 'M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zM9 6a3 3 0 016 0v3H9V6z',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  x: 'M18 6L6 18M6 6l12 12',
  mail: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6',
  phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
  arrowLeft: 'M10 19l-7-7m0 0l7-7m-7 7h18',
  arrowRight: 'M14 5l7 7m0 0l-7 7m7-7H3',
  package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
  check: 'M5 13l4 4L19 7',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
  scan: 'M4 4h16v16H4V4z M8 8h8v8H8V8z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

/* ============ STYLES ============ */
const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .pass {
    --stub-h: 6.5rem;
    --stub-w: 9.5rem;
    -webkit-mask:
      radial-gradient(circle 10px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 10px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 10px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 10px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }
  @media (min-width: 640px) {
    .pass {
      -webkit-mask:
        radial-gradient(circle 10px at calc(100% - var(--stub-w)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 10px at calc(100% - var(--stub-w)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
      mask:
        radial-gradient(circle 10px at calc(100% - var(--stub-w)) 0, #0000 97%, #000) top / 100% 51% no-repeat,
        radial-gradient(circle 10px at calc(100% - var(--stub-w)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat;
    }
  }
`;

/* ============ ROLE META ============ */
const roleMeta = {
  customer: { label: 'Customer', icon: 'ticket', tagline: 'Never misses opening night' },
  admin: { label: 'Admin', icon: 'star', tagline: 'Keeps the whole show running' },
  eo: { label: 'Event Organizer', icon: 'music', tagline: 'Builds the stage' },
  petugas: { label: 'Check-in Staff', icon: 'scan', tagline: 'First face at the gate' },
};

/* ============ FORMATTERS ============ */
function formatRupiah(amount) {
  if (!amount) return 'Rp 0';
  const rounded = Math.round(amount);
  if (rounded >= 1_000_000) return `Rp ${(rounded / 1_000_000).toFixed(1)}M`;
  return `Rp ${rounded.toLocaleString('id-ID')}`;
}
function formatRupiahFull(amount) {
  if (!amount) return 'Rp 0';
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}

/* ============ STATS CONFIG ============ */
function getStatsConfig(role, u) {
  if (role === 'admin') {
    return [
      { icon: 'users', label: 'Users', value: u.total_users || 0, numeric: true },
      { icon: 'package', label: 'Orders', value: u.total_orders || 0, numeric: true },
      { icon: 'chart', label: 'Revenue', value: formatRupiah(u.total_spent || 0), small: true, numeric: false },
      { icon: 'scan', label: 'Check-ins', value: u.total_checkins || 0, numeric: true },
    ];
  }
  if (role === 'eo') {
    return [
      { icon: 'music', label: 'Events', value: u.total_events || 0, numeric: true },
      { icon: 'ticket', label: 'Tickets sold', value: u.total_tickets_sold || 0, numeric: true },
      { icon: 'wallet', label: 'Revenue', value: formatRupiah(u.eo_revenue || 0), small: true, numeric: false },
      { icon: 'calendar', label: 'Active', value: u.active_events || 0, numeric: true },
    ];
  }
  if (role === 'petugas') {
    return [
      { icon: 'scan', label: 'Today', value: u.today_scans || 0, numeric: true },
      { icon: 'calendar', label: 'This week', value: u.weekly_scans || 0, numeric: true },
      { icon: 'check', label: 'All time', value: u.total_checkins || 0, numeric: true },
      { icon: 'music', label: 'Events', value: u.active_events || 0, numeric: true },
    ];
  }
  return [
    { icon: 'package', label: 'Orders', value: u.total_orders || 0, numeric: true },
    { icon: 'check', label: 'Paid', value: u.total_orders_paid || 0, numeric: true },
    { icon: 'ticket', label: 'Tickets', value: u.active_tickets || 0, numeric: true },
    { icon: 'star', label: 'Reviews', value: u.total_ratings || 0, numeric: true },
  ];
}

function getHighlight(role, u) {
  if (role === 'eo') return { label: 'Total revenue', value: formatRupiahFull(u.eo_revenue || 0), numericValue: u.eo_revenue || 0 };
  if (role === 'admin') return { label: 'Platform revenue', value: formatRupiahFull(u.total_spent || 0), numericValue: u.total_spent || 0 };
  if (role === 'petugas') return { label: 'Total scans', value: (u.total_checkins || 0).toLocaleString('en-US'), numericValue: u.total_checkins || 0 };
  return { label: 'Total spent', value: formatRupiahFull(u.total_spent || 0), numericValue: u.total_spent || 0 };
}

/* ============ ANIMATED NUMBER ============ */
function AnimatedNumber({ value, format = (n) => n.toLocaleString('en-US'), duration = 1.2, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = Number(value) || 0;
    if (!inView) return undefined;
    if (reduce || !end) { setDisplay(end); return undefined; }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  return <span ref={ref} className={`tabular-nums ${className}`}>{format(display)}</span>;
}

/* ============ BARCODE ============ */
function useBarcode(seed) {
  return useMemo(() => {
    let s = (Number(seed) || 7) * 9301 + 49297;
    const bars = [];
    let x = 0;
    for (let i = 0; i < 34; i++) {
      s = (s * 9301 + 49297) % 233280;
      const w = 1 + Math.floor((s / 233280) * 3);
      bars.push({ x, w });
      x += w + 1 + (s % 2);
    }
    return { bars, width: x };
  }, [seed]);
}

function Barcode({ seed, className }) {
  const { bars, width } = useBarcode(seed);
  return (
    <svg viewBox={`0 0 ${width} 24`} preserveAspectRatio="none" className={className} role="img" aria-label="Member barcode">
      {bars.map((b, i) => (
        <motion.rect
          key={i}
          x={b.x}
          y={0}
          width={b.w}
          height={24}
          className="fill-amber-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + i * 0.015, duration: 0.15 }}
        />
      ))}
    </svg>
  );
}

/* ============ AVATAR ============ */
function Avatar({ user, preview, canEdit, onClick }) {
  const img = preview || user?.profile_picture;
  const Wrapper = canEdit ? 'button' : 'div';
  return (
    <Wrapper
      {...(canEdit ? { type: 'button', onClick, 'aria-label': 'Change profile photo' } : {})}
      className={`relative w-20 h-20 shrink-0 rounded-full bg-amber-900 ring-2 ring-amber-400/70 ring-offset-2 ring-offset-amber-950 overflow-hidden transition-all ${
        canEdit ? `group cursor-pointer hover:ring-amber-300 ${focusRing}` : ''
      }`}
    >
      {img ? (
        <img src={img} className="w-full h-full object-cover" alt={user?.name ? `${user.name}'s profile photo` : 'Profile photo'} />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-amber-300/80">
          <Icon name="user" className="w-8 h-8" />
        </span>
      )}
      {canEdit && (
        <span className="absolute inset-0 bg-amber-950/60 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center">
          <Icon name="camera" className="w-5 h-5 text-amber-50" />
        </span>
      )}
    </Wrapper>
  );
}

/* ============ STAT CELL ============ */
function StatCell({ icon, label, value, small, numeric, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className="px-2 py-4 text-center min-w-0"
    >
      <Icon name={icon} className="w-4 h-4 mx-auto text-amber-600" />
      <p className={`f-display font-semibold text-amber-950 leading-none mt-2 truncate ${small ? 'text-sm' : 'text-xl'}`}>
        {numeric ? <AnimatedNumber value={value} /> : value}
      </p>
      <p className="text-xs text-amber-700/80 mt-1.5 truncate">{label}</p>
    </motion.div>
  );
}

/* ============ INFO ROW ============ */
function InfoRow({ icon, label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className="flex items-center gap-3 py-3.5"
    >
      <span className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
        <Icon name={icon} className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-amber-700/80">{label}</p>
        <p className="text-sm text-amber-950 truncate">{value || '-'}</p>
      </div>
    </motion.div>
  );
}

/* ============ SETTINGS ROW ============ */
function SettingsRow({ icon, label, hint, onClick, danger = false, delay = 0 }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors group ${focusRing} ${
        danger ? 'hover:bg-red-50' : 'hover:bg-amber-50'
      }`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
      }`}>
        <Icon name={icon} className="w-4 h-4" />
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-sm font-medium ${danger ? 'text-red-700' : 'text-amber-950'}`}>{label}</span>
        {hint && <span className="block text-xs text-amber-700/70">{hint}</span>}
      </span>
      <Icon name="arrowRight" className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
    </motion.button>
  );
}

/* ============ MODAL ============ */
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="f-body bg-white w-full max-w-sm p-6 rounded-t-3xl sm:rounded-3xl shadow-xl shadow-amber-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="f-display text-xl font-semibold text-amber-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`p-1.5 rounded-lg text-amber-700/70 hover:text-amber-950 hover:bg-amber-50 transition-colors ${focusRing}`}
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Field({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-amber-900 mb-1.5">{label}</label>
      <input
        id={id}
        className="w-full px-4 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
        {...props}
      />
    </div>
  );
}

function PrimaryButton({ loading, loadingText, children, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full py-3 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${focusRing}`}
      disabled={loading}
      {...props}
    >
      {loading ? loadingText : children}
    </motion.button>
  );
}

/* ============ MAIN ============ */
export default function Profile() {
  const { id } = useParams();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', phone: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef(null);

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwMessage, setPwMessage] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [toast, setToast] = useState('');
  const [mounted, setMounted] = useState(false);

  const isOwnProfile = !id || user?.id === parseInt(id);
  const targetId = id || user?.id;

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(''), 2800);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (reduce) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, [reduce]);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      if (!user) { navigate('/login'); return; }
      try {
        setLoading(true);
        setError('');
        const res = await getUserWithStats(targetId);
        if (cancelled) return;
        setProfileUser(res.data.data);
        if (isOwnProfile) {
          setForm({ name: res.data.data.name || '', phone: res.data.data.phone || '' });
          setPreview(res.data.data.profile_picture || '');
        }
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 403) setError("You don't have permission to view this profile.");
        else if (err.response?.status === 404) setError('This user could not be found.');
        else setError("We couldn't load this profile. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, [id, user, navigate]);

  const openEdit = () => { setMessage(''); setShowEditModal(true); };

  const closeEdit = useCallback(() => {
    setShowEditModal(false);
    setFile(null);
    setMessage('');
    if (profileUser) {
      setForm({ name: profileUser.name || '', phone: profileUser.phone || '' });
      setPreview(profileUser.profile_picture || '');
    }
  }, [profileUser]);

  const closePassword = useCallback(() => {
    setShowPasswordModal(false);
    setPwMessage('');
    setPwForm({ old_password: '', new_password: '', confirm: '' });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      if (file) formData.append('profile_picture', file);
      const res = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.user);
      const refreshRes = await getUserWithStats(targetId);
      setProfileUser(refreshRes.data.data);
      setPreview(refreshRes.data.data.profile_picture || '');
      setFile(null);
      setShowEditModal(false);
      showToast('Profile updated');
    } catch (err) {
      setMessage(err.response?.data?.message || "Couldn't update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMessage('');
    if (pwForm.new_password !== pwForm.confirm) {
      setPwMessage("The new passwords don't match.");
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { old_password: pwForm.old_password, new_password: pwForm.new_password });
      closePassword();
      showToast('Password changed');
    } catch (err) {
      setPwMessage(err.response?.data?.message || "Couldn't change your password. Please try again.");
    } finally {
      setPwLoading(false);
    }
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    }
  }

  function pickPhoto() {
    if (!isOwnProfile) return;
    if (!showEditModal) openEdit();
    fileInputRef.current?.click();
  }

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <MotionConfig reducedMotion="user">
        <style>{pageCss}</style>
        <div className="f-body min-h-screen bg-[#f5ede4] flex items-center justify-center" role="status">
          <div className="text-center">
            <div className="animate-spin rounded-full h-9 w-9 border-2 border-amber-300 border-t-amber-800 mx-auto" />
            <p className="mt-3 text-sm text-amber-700/80">Loading profile…</p>
          </div>
        </div>
      </MotionConfig>
    );
  }

  /* ===== ERROR ===== */
  if (error) {
    return (
      <MotionConfig reducedMotion="user">
        <style>{pageCss}</style>
        <div className="f-body min-h-screen bg-[#f5ede4] flex items-center justify-center px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm shadow-amber-900/5"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-700">
              <Icon name="lock" className="w-5 h-5" />
            </div>
            <h1 className="f-display text-lg font-semibold text-amber-950">Can't open this profile</h1>
            <p className="text-sm text-amber-800/80 mt-1.5">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className={`mt-6 px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
            >
              Go back
            </button>
          </motion.div>
        </div>
      </MotionConfig>
    );
  }

  if (!profileUser) return null;

  const role = profileUser.role || 'customer';
  const meta = roleMeta[role] || roleMeta.customer;
  const canEdit = isOwnProfile;
  const isAdminView = !isOwnProfile && user?.role === 'admin';
  const stats = getStatsConfig(role, profileUser);
  const highlight = getHighlight(role, profileUser);
  const memberNo = String(profileUser.id ?? 0).padStart(6, '0');
  const joinedDate = profileUser.created_at
    ? new Date(profileUser.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        <div className="max-w-xl mx-auto px-4 py-8">
          {/* Back button */}
          {!isOwnProfile && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
              onClick={() => navigate(-1)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-5 text-sm rounded-full bg-white text-amber-800 hover:text-amber-950 hover:bg-amber-50 transition-colors ${focusRing}`}
            >
              <Icon name="arrowLeft" className="w-3.5 h-3.5" />
              Back
            </motion.button>
          )}

          {/* Admin notice */}
          {isAdminView && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
              className="mb-4 px-4 py-3 bg-amber-100/70 border border-dashed border-amber-400/60 rounded-2xl text-sm text-amber-900"
            >
              Admin view: you're looking at <strong className="font-semibold">{profileUser.name}</strong>'s profile.
            </motion.div>
          )}

          {/* ===== MEMBER PASS — clipPath emerge ===== */}
          <motion.section
            aria-label="Member pass"
            initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={
              mounted
                ? reduce
                  ? { opacity: 1 }
                  : { opacity: 1, clipPath: 'inset(0 0 0% 0)' }
                : reduce
                ? { opacity: 0 }
                : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }
            }
            transition={{ duration: 0.7, ease: EASE }}
            style={{ willChange: 'clip-path, opacity' }}
            className="mb-4 drop-shadow-[0_10px_18px_rgba(69,26,3,0.18)]"
          >
            <div className="pass grid grid-cols-1 grid-rows-[auto_var(--stub-h)] sm:grid-cols-[1fr_var(--stub-w)] sm:grid-rows-none rounded-2xl overflow-hidden">
              {/* Main body */}
              <div className="bg-amber-950 text-amber-50 p-5 sm:p-6 flex flex-col min-w-0">
                <div className="flex items-center justify-between">
                  <span className="f-display text-base font-semibold text-amber-300">Tiketku</span>
                  {canEdit && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={openEdit}
                      className={`inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 text-xs font-medium rounded-full bg-amber-900 text-amber-100 hover:bg-amber-800 transition-colors ${focusRing}`}
                    >
                      <Icon name="edit" className="w-3.5 h-3.5" />
                      Edit profile
                    </motion.button>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-5">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
                  >
                    <Avatar user={profileUser} preview={preview} canEdit={canEdit} onClick={pickPhoto} />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <motion.h1
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
                      className="f-display text-2xl font-semibold leading-tight break-words"
                    >
                      {profileUser.name}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
                      className="text-sm text-amber-200/70 mt-0.5"
                    >
                      {meta.tagline}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.55, ease: EASE }}
                      className="flex items-center gap-2 mt-2.5 flex-wrap"
                    >
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-100 bg-amber-900 rounded-full">
                        <Icon name={meta.icon} className="w-3 h-3" />
                        {meta.label}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${
                        profileUser.is_active ? 'text-emerald-300 bg-emerald-950/60' : 'text-red-300 bg-red-950/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${profileUser.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {profileUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.65, ease: EASE }}
                  className="mt-5 pt-4 border-t border-dashed border-amber-800 flex items-end justify-between gap-3"
                >
                  <span className="text-sm text-amber-200/70">{highlight.label}</span>
                  <span className="f-display text-2xl font-bold text-amber-300 tabular-nums leading-none">
                    <AnimatedNumber
                      value={highlight.numericValue}
                      format={(n) => (role === 'petugas' ? n.toLocaleString('en-US') : formatRupiahFull(n))}
                    />
                  </span>
                </motion.div>
              </div>

              {/* Stub: member number + barcode */}
              <div className="bg-amber-100 text-amber-950 border-t sm:border-t-0 sm:border-l border-dashed border-amber-400/70 px-5 sm:px-4 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 sm:gap-3">
                <div className="sm:text-center">
                  <p className="text-xs text-amber-700/80">Member no.</p>
                  <p className="f-display text-xl font-semibold tabular-nums">{memberNo}</p>
                </div>
                <Barcode seed={profileUser.id} className="h-11 w-32 sm:h-12 sm:w-full" />
              </div>
            </div>
          </motion.section>

          {/* ===== STATS ===== */}
          <section
            aria-label="Statistics"
            className="grid grid-cols-4 divide-x divide-dashed divide-amber-200 bg-white rounded-2xl mb-4"
          >
            {stats.map((s, i) => (
              <StatCell key={s.label} {...s} delay={0.8 + i * 0.08} />
            ))}
          </section>

          {/* ===== INFO ===== */}
          <section className="bg-white rounded-2xl px-5 py-4 mb-4">
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.1, ease: EASE }}
              className="f-display text-base font-semibold text-amber-950"
            >
              Contact and details
            </motion.h2>
            <div className="divide-y divide-dashed divide-amber-200 mt-1">
              <InfoRow icon="mail" label="Email" value={profileUser.email} delay={1.15} />
              {profileUser.phone && <InfoRow icon="phone" label="Phone" value={profileUser.phone} delay={1.2} />}
              <InfoRow icon="calendar" label="Member since" value={joinedDate} delay={1.25} />
            </div>
          </section>

          {/* ===== SETTINGS ===== */}
          {canEdit && (
            <section aria-label="Account" className="bg-white rounded-2xl overflow-hidden divide-y divide-dashed divide-amber-200">
              <SettingsRow
                icon="lock"
                label="Change password"
                hint="Use a password you don't use anywhere else"
                onClick={() => setShowPasswordModal(true)}
                delay={1.35}
              />
              <SettingsRow icon="logout" label="Log out" onClick={logout} danger delay={1.4} />
            </section>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* EDIT MODAL */}
        <AnimatePresence>
          {showEditModal && (
            <Modal title="Edit profile" onClose={closeEdit}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 overflow-hidden flex items-center justify-center text-amber-600 shrink-0">
                    {preview ? <img src={preview} alt="Profile preview" className="w-full h-full object-cover" /> : <Icon name="user" className="w-6 h-6" />}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200/70 rounded-lg transition-colors ${focusRing}`}
                    >
                      <Icon name="camera" className="w-4 h-4" />
                      Change photo
                    </button>
                    <p className="text-xs text-amber-700/70 mt-1">{file ? file.name : 'JPG or PNG'}</p>
                  </div>
                </div>

                <Field id="profile-name" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
                <Field id="profile-phone" label="Phone number" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />

                <PrimaryButton type="submit" loading={saving} loadingText="Saving…">Save changes</PrimaryButton>
                {message && <p role="alert" className="text-sm text-red-600 text-center">{message}</p>}
              </form>
            </Modal>
          )}
        </AnimatePresence>

        {/* PASSWORD MODAL */}
        <AnimatePresence>
          {showPasswordModal && (
            <Modal title="Change password" onClose={closePassword}>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Field id="pw-old" label="Current password" type="password" required autoComplete="current-password" value={pwForm.old_password} onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })} />
                <Field id="pw-new" label="New password" type="password" required autoComplete="new-password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
                <Field id="pw-confirm" label="Confirm new password" type="password" required autoComplete="new-password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
                <PrimaryButton type="submit" loading={pwLoading} loadingText="Saving…">Change password</PrimaryButton>
                {pwMessage && <p role="alert" className="text-sm text-red-600 text-center">{pwMessage}</p>}
              </form>
            </Modal>
          )}
        </AnimatePresence>

        {/* TOAST */}
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="f-body fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-950 text-amber-50 text-sm shadow-lg shadow-amber-950/30"
            >
              <Icon name="check" className="w-4 h-4 text-emerald-400" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}