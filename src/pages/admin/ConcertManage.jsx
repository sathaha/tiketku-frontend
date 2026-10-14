import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Loading, formatRupiah } from '../../components/Ui';

// ============================================================
// Helpers
// ============================================================

const ICON_PATHS = {
  back: 'M15 19l-7-7 7-7',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  plus: 'M12 4v16m8-8H4',
  pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  close: 'M6 18L18 6M6 6l12 12',
  check: 'M5 13l4 4L19 7',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z',
  wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

// "2026-03-14" / "2026-03-14T00:00:00Z" -> local date (avoid day shifting due to timezone)
function parseLocalDate(value) {
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function daysFromToday(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date - today) / 86400000);
}

function formatDuration(start, end) {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h > 0 && `${h}h`, m > 0 && `${m}m`].filter(Boolean).join(' ');
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const btnPrimary = `inline-flex items-center gap-2 px-4 py-2 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`;

const inputCls =
  'w-full px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all';

const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');
  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }
`;

// API values -> English labels (unknown values fall back to a readable version of the raw value)
const approvalMeta = {
  disetujui: { label: 'Approved', cls: 'text-emerald-300 bg-emerald-950/60', dot: 'bg-emerald-400' },
  menunggu_persetujuan: { label: 'Pending review', cls: 'text-yellow-300 bg-yellow-950/60', dot: 'bg-yellow-400' },
  ditolak: { label: 'Rejected', cls: 'text-red-300 bg-red-950/60', dot: 'bg-red-400' },
};
const statusLabels = { aktif: 'Active', nonaktif: 'Inactive' };
const prettify = (v) => {
  const s = String(v).replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function useEscape(active, handler) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => e.key === 'Escape' && handler();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, handler]);
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ============================================================
// Modal
// ============================================================

function Modal({ open, onClose, label, children }) {
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-amber-950/50 backdrop-blur-sm sm:p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="f-body flex flex-col w-full max-w-md max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-xl shadow-amber-950/20 overflow-hidden"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FormModal({ open, title, subtitle, onClose, onSubmit, saving, submitLabel, error, children }) {
  return (
    <Modal open={open} onClose={onClose} label={title}>
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
        <div>
          <h3 className="f-display text-xl font-semibold text-amber-950">{title}</h3>
          {subtitle && <p className="text-sm text-amber-700/80 mt-1">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`-mr-1.5 -mt-1 p-1.5 rounded-lg text-amber-600 hover:text-amber-950 hover:bg-amber-100 transition-colors ${focusRing}`}
        >
          <Icon name="close" className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col min-h-0">
        <div className="px-6 pb-5 space-y-4 overflow-y-auto">
          {error && (
            <div role="alert" className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {children}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-dashed border-amber-200">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 rounded-xl transition-colors ${focusRing}`}
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? (
              <>
                <Spinner />
                Saving…
              </>
            ) : (
              <>
                <Icon name="check" />
                {submitLabel || 'Save'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, optional, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-amber-900 mb-1.5">
        {label}
        {required && <span className="text-amber-600"> *</span>}
        {optional && <span className="text-amber-700/60 font-normal"> (optional)</span>}
      </span>
      {children}
    </label>
  );
}

function ConfirmDialog({ state, deleting, onCancel, onConfirm }) {
  // keep the last state so the text doesn't disappear during the close animation
  const last = useRef(state);
  if (state) last.current = state;
  const s = last.current;

  return (
    <Modal open={!!state} onClose={deleting ? () => {} : onCancel} label={s?.title}>
      <div className="px-6 pt-6 pb-5">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <Icon name="trash" className="w-6 h-6" />
        </div>
        <h3 className="f-display text-xl font-semibold text-amber-950">{s?.title}</h3>
        <p className="text-sm text-amber-800 mt-2 leading-relaxed">{s?.message}</p>
      </div>
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-dashed border-amber-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={deleting}
          className={`px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 rounded-xl transition-colors disabled:opacity-50 ${focusRing}`}
        >
          Keep it
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors ${focusRing}`}
        >
          {deleting ? (
            <>
              <Spinner />
              Deleting…
            </>
          ) : (
            <>
              <Icon name="trash" />
              Delete
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// Schedule
// ============================================================

function ScheduleRow({ schedule, onDelete }) {
  const date = parseLocalDate(schedule.event_date);
  const diff = daysFromToday(date);
  const isToday = diff === 0;
  const isPast = diff < 0;

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  const duration = formatDuration(schedule.start_time, schedule.end_time);

  let relative = 'Finished';
  if (isToday) relative = 'Today';
  else if (diff === 1) relative = 'Tomorrow';
  else if (diff > 1) relative = `In ${diff} days`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-4"
    >
      {/* Calendar leaf */}
      <div
        className={`w-14 shrink-0 rounded-xl py-2 text-center ${
          isToday
            ? 'bg-amber-800 text-amber-50'
            : isPast
            ? 'bg-amber-50 text-amber-600/50'
            : 'bg-amber-100 text-amber-950'
        }`}
      >
        <div className={`text-xs ${isToday ? 'text-amber-100/80' : isPast ? 'text-amber-600/50' : 'text-amber-700'}`}>{monthName}</div>
        <div className="f-display text-2xl font-bold leading-tight tabular-nums">{date.getDate()}</div>
        <div className={`text-[10px] leading-none pb-0.5 tabular-nums ${isToday ? 'text-amber-100/70' : 'text-amber-600/60'}`}>
          {date.getFullYear()}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`f-display text-lg font-semibold ${isPast ? 'text-amber-700/50' : 'text-amber-950'}`}>{dayName}</span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
              isToday ? 'text-amber-800 bg-amber-100' : isPast ? 'text-amber-600/60 bg-amber-50' : 'text-amber-700 bg-amber-50'
            }`}
          >
            {isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />}
            {relative}
          </span>
        </div>

        <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm ${isPast ? 'text-amber-700/50' : 'text-amber-900'}`}>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Icon name="clock" className="w-3.5 h-3.5 text-amber-500" />
            {schedule.start_time?.slice(0, 5)}
            {schedule.end_time ? ` – ${schedule.end_time.slice(0, 5)}` : ', end time not set'}
          </span>
          {duration && <span className="text-xs text-amber-700/70">{duration}</span>}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(schedule)}
        aria-label={`Delete schedule for ${dayName}`}
        title="Delete schedule"
        className={`shrink-0 p-2 rounded-lg text-amber-600 hover:text-red-600 hover:bg-red-50 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${focusRing}`}
      >
        <Icon name="trash" />
      </button>
    </motion.div>
  );
}

// ============================================================
// Ticket: main section + tear-off stub on the right
// ============================================================

const STUB_WIDTH = 100; // px, width of the right stub

const notchMask = {
  WebkitMaskImage: `radial-gradient(circle at calc(100% - ${STUB_WIDTH}px) 0, #0000 9px, #000 9.5px), radial-gradient(circle at calc(100% - ${STUB_WIDTH}px) 100%, #0000 9px, #000 9.5px)`,
  maskImage: `radial-gradient(circle at calc(100% - ${STUB_WIDTH}px) 0, #0000 9px, #000 9.5px), radial-gradient(circle at calc(100% - ${STUB_WIDTH}px) 100%, #0000 9px, #000 9.5px)`,
  WebkitMaskComposite: 'source-in',
  maskComposite: 'intersect',
};

function TicketCard({ ticket, onDelete }) {
  const sold = Number(ticket.sold) || 0;
  const quota = Number(ticket.quota) || 0;
  const price = Number(ticket.price) || 0;
  const remaining = Math.max(quota - sold, 0);
  const soldPct = quota > 0 ? Math.min((sold / quota) * 100, 100) : 0;

  let statusColor = 'emerald';
  let statusLabel = 'Available';
  if (soldPct >= 100) {
    statusColor = 'red';
    statusLabel = 'Sold out';
  } else if (soldPct >= 80) {
    statusColor = 'orange';
    statusLabel = 'Almost sold out';
  } else if (soldPct >= 50) {
    statusColor = 'yellow';
    statusLabel = 'Half sold';
  }

  const colorMap = {
    emerald: { text: 'text-emerald-700', bg: 'bg-emerald-500' },
    yellow: { text: 'text-yellow-700', bg: 'bg-yellow-500' },
    orange: { text: 'text-orange-700', bg: 'bg-orange-500' },
    red: { text: 'text-red-700', bg: 'bg-red-500' },
  };
  const color = colorMap[statusColor];

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_8px_16px_rgba(69,26,3,0.16)] transition-[filter] duration-200"
    >
      <div style={notchMask} className="group flex bg-white rounded-2xl overflow-hidden">
        {/* Main section */}
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="f-display text-lg font-semibold text-amber-950 truncate">{ticket.name}</h4>
              <p className={`mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium ${color.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${color.bg}`} />
                {statusLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(ticket)}
              aria-label={`Delete category ${ticket.name}`}
              title="Delete category"
              className={`-mr-1 -mt-1 shrink-0 p-1.5 rounded-lg text-amber-600 hover:text-red-600 hover:bg-red-50 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${focusRing}`}
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-3 f-display text-xl font-semibold text-amber-800 tabular-nums">{formatRupiah(price)}</p>

          <div className="mt-3">
            <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${soldPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full ${color.bg}`}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-amber-700/80 tabular-nums">
              <span>
                Sold <span className="text-amber-950 font-semibold">{sold}</span> of {quota}
              </span>
              {sold > 0 && <span>{formatRupiah(sold * price)}</span>}
            </div>
          </div>
        </div>

        {/* Ticket stub */}
        <div
          style={{ width: STUB_WIDTH }}
          className="shrink-0 flex flex-col items-center justify-center text-center bg-amber-100 border-l border-dashed border-amber-400/70 px-2"
        >
          <span className="text-xs text-amber-700/80">Left</span>
          <span className={`f-display text-3xl font-bold leading-none my-1 tabular-nums ${remaining > 0 ? 'text-amber-950' : 'text-red-600'}`}>
            {remaining}
          </span>
          <span className="text-xs text-amber-700/80">{remaining === 1 ? 'ticket' : 'tickets'}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Small UI pieces
// ============================================================

function Stat({ icon, label, hint, children }) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <div className="flex items-center gap-1.5 text-sm text-amber-700/90">
        <Icon name={icon} className="w-4 h-4 text-amber-500" />
        {label}
      </div>
      <div className="mt-2">{children}</div>
      {hint && <div className="mt-1 text-xs text-amber-700/70">{hint}</div>}
    </div>
  );
}

function EmptyState({ icon, title, hint, actionLabel, onAction }) {
  return (
    <div className="text-center py-14 px-4 border-2 border-dashed border-amber-300/70 rounded-2xl">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <p className="f-display text-lg font-semibold text-amber-950">{title}</p>
      <p className="text-sm text-amber-800/80 mt-1 mb-5">{hint}</p>
      <button type="button" onClick={onAction} className={btnPrimary}>
        <Icon name="plus" />
        {actionLabel}
      </button>
    </div>
  );
}

function SectionHeader({ title, subtitle, addLabel, onAdd }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="f-display text-xl font-semibold text-amber-950">{title}</h2>
        <p className="text-sm text-amber-700/80 mt-0.5">{subtitle}</p>
      </div>
      <button type="button" onClick={onAdd} className={btnPrimary}>
        <Icon name="plus" />
        {addLabel}
      </button>
    </div>
  );
}

// ============================================================
// Main page
// ============================================================

const EMPTY_SCHEDULE = { event_date: '', start_time: '', end_time: '' };
const EMPTY_TICKET = { name: '', price: '', quota: '' };

export default function ConcertManage() {
  const { id } = useParams();
  const { user } = useAuth();
  const backTo = user?.role === 'eo' ? '/eo/concerts' : '/admin/concerts';

  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const [error, setError] = useState('');

  const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE);
  const [ticketForm, setTicketForm] = useState(EMPTY_TICKET);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [addingTicket, setAddingTicket] = useState(false);
  const [modalError, setModalError] = useState('');

  const [confirmState, setConfirmState] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchConcert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // silent = refresh data without showing the full loading screen
  async function fetchConcert({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/concerts/${id}`);
      setConcert(res.data);
    } catch (err) {
      console.error('Failed to fetch concert:', err);
    } finally {
      setLoading(false);
    }
  }

  function closeScheduleModal() {
    setShowScheduleModal(false);
    setScheduleForm(EMPTY_SCHEDULE);
    setModalError('');
  }

  function closeTicketModal() {
    setShowTicketModal(false);
    setTicketForm(EMPTY_TICKET);
    setModalError('');
  }

  async function addSchedule(e) {
    e.preventDefault();
    setModalError('');
    setAddingSchedule(true);
    try {
      await api.post('/schedules', { concert_id: id, ...scheduleForm });
      closeScheduleModal();
      fetchConcert({ silent: true });
    } catch (err) {
      setModalError(err.response?.data?.message || "Couldn't add the schedule. Please try again.");
    } finally {
      setAddingSchedule(false);
    }
  }

  async function addTicketCategory(e) {
    e.preventDefault();
    setModalError('');
    setAddingTicket(true);
    try {
      await api.post('/ticket-categories', { concert_id: id, ...ticketForm });
      closeTicketModal();
      fetchConcert({ silent: true });
    } catch (err) {
      setModalError(err.response?.data?.message || "Couldn't add the ticket category. Please try again.");
    } finally {
      setAddingTicket(false);
    }
  }

  function requestDeleteSchedule(s) {
    const label = parseLocalDate(s.event_date).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setError('');
    setConfirmState({
      type: 'schedule',
      id: s.id,
      title: 'Delete this schedule?',
      message: `The schedule on ${label} will be removed from the concert. This can't be undone.`,
    });
  }

  function requestDeleteTicket(t) {
    const sold = Number(t.sold) || 0;
    setError('');
    setConfirmState({
      type: 'ticket',
      id: t.id,
      title: `Delete the ${t.name} category?`,
      message:
        sold > 0
          ? `This category has already sold ${sold} ${sold === 1 ? 'ticket' : 'tickets'}. This can't be undone.`
          : "The category will be removed from the concert. This can't be undone.",
    });
  }

  async function runDelete() {
    if (!confirmState) return;
    const { type, id: targetId } = confirmState;
    setDeleting(true);
    try {
      await api.delete(type === 'schedule' ? `/schedules/${targetId}` : `/ticket-categories/${targetId}`);
      setConfirmState(null);
      fetchConcert({ silent: true });
    } catch (err) {
      setConfirmState(null);
      setError(
        err.response?.data?.message ||
          (type === 'schedule' ? "Couldn't delete the schedule. Please try again." : "Couldn't delete the ticket category. Please try again.")
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loading />;
  if (!concert)
    return (
      <MotionConfig reducedMotion="user">
        <style>{pageCss}</style>
        <div className="f-body min-h-screen bg-[#f5ede4] flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-sm bg-white rounded-3xl p-8 shadow-sm shadow-amber-900/5">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Icon name="ticket" className="w-5 h-5" />
            </div>
            <h2 className="f-display text-xl font-semibold text-amber-950 mb-2">Concert not found</h2>
            <p className="text-sm text-amber-800/80 mb-6">It may have been deleted, or the link is wrong.</p>
            <Link
              to={backTo}
              className={`inline-flex items-center gap-2 px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
            >
              Back to concerts
            </Link>
          </div>
        </div>
      </MotionConfig>
    );

  // ===== Derived data =====
  const schedules = [...(concert.schedules || [])].sort(
    (a, b) =>
      String(a.event_date).slice(0, 10).localeCompare(String(b.event_date).slice(0, 10)) ||
      String(a.start_time || '').localeCompare(String(b.start_time || ''))
  );
  const categories = concert.ticket_categories || [];

  const totalSchedules = schedules.length;
  const totalCategories = categories.length;
  const totalSold = categories.reduce((sum, t) => sum + (Number(t.sold) || 0), 0);
  const totalQuota = categories.reduce((sum, t) => sum + (Number(t.quota) || 0), 0);
  const soldPct = totalQuota > 0 ? Math.min((totalSold / totalQuota) * 100, 100) : 0;
  const minPrice = categories.reduce((min, t) => {
    const p = Number(t.price) || 0;
    if (min === null) return p;
    return p < min ? p : min;
  }, null);
  const totalRevenue = categories.reduce(
    (sum, t) => sum + (Number(t.sold) || 0) * (Number(t.price) || 0),
    0
  );

  const approval = concert.approval_status
    ? approvalMeta[concert.approval_status] || { label: prettify(concert.approval_status), cls: 'text-amber-200 bg-amber-900', dot: 'bg-amber-400' }
    : null;
  const statusText = concert.status ? statusLabels[concert.status] || prettify(concert.status) : null;

  const tabs = [
    { key: 'schedule', label: 'Schedule', icon: 'calendar', count: totalSchedules },
    { key: 'ticket', label: 'Tickets', icon: 'ticket', count: totalCategories },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4]">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* ===== Back link ===== */}
          <Link
            to={backTo}
            className={`group inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-5 text-sm rounded-full bg-white text-amber-800 hover:text-amber-950 hover:bg-amber-50 transition-colors ${focusRing}`}
          >
            <Icon name="back" className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            My concerts
          </Link>

          {/* ===== Concert header ===== */}
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative overflow-hidden bg-amber-950 text-amber-50 rounded-2xl mb-4 drop-shadow-[0_10px_18px_rgba(69,26,3,0.18)]"
          >
            {concert.poster && (
              <div className="absolute inset-0" aria-hidden="true">
                <img src={concert.poster} alt="" className="w-full h-full object-cover opacity-25 blur-2xl scale-125" />
                <div className="absolute inset-0 bg-amber-950/70" />
              </div>
            )}

            <div className="relative flex items-start gap-4 sm:gap-6 p-4 sm:p-6">
              <div className="w-24 sm:w-32 aspect-[3/4] shrink-0 rounded-xl overflow-hidden bg-amber-900 ring-2 ring-amber-400/70 ring-offset-2 ring-offset-amber-950 shadow-lg">
                {concert.poster ? (
                  <img src={concert.poster} alt={`${concert.name} poster`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-300/80">
                    <Icon name="music" className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 self-stretch flex flex-col">
                {(approval || statusText) && (
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    {approval && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${approval.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${approval.dot}`} />
                        {approval.label}
                      </span>
                    )}
                    {statusText && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full text-amber-100 bg-amber-900">
                        {statusText}
                      </span>
                    )}
                  </div>
                )}

                <h1 className="f-display font-semibold text-2xl sm:text-3xl leading-tight break-words">{concert.name}</h1>
                <p className="text-amber-200/70 mt-1 truncate">{concert.artist || 'Artist not set'}</p>

                <div className="mt-auto pt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-amber-100/80">
                  {concert.venue_name && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="pin" className="w-4 h-4 text-amber-400" />
                      {concert.venue_name}
                    </span>
                  )}
                  {concert.category_name && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="music" className="w-4 h-4 text-amber-400" />
                      {concert.category_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.header>

          {/* ===== Summary ===== */}
          <section aria-label="Summary" className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-amber-200/70 rounded-2xl overflow-hidden mb-6">
            <Stat icon="calendar" label="Schedules" hint={totalSchedules === 1 ? 'performance date' : 'performance dates'}>
              <p className="f-display text-2xl font-bold text-amber-950 tabular-nums leading-none">{totalSchedules}</p>
            </Stat>

            <Stat icon="ticket" label="Starting price" hint={`${totalCategories} ticket ${totalCategories === 1 ? 'category' : 'categories'}`}>
              <p className="f-display text-lg sm:text-xl font-bold text-amber-800 tabular-nums leading-none">
                {minPrice !== null ? formatRupiah(minPrice) : '-'}
              </p>
            </Stat>

            <Stat icon="users" label="Tickets sold">
              <p className="f-display text-2xl font-bold text-emerald-700 tabular-nums leading-none">
                {totalSold}
                <span className="text-sm font-normal text-amber-700/70"> / {totalQuota}</span>
              </p>
              <div className="mt-2.5 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${soldPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </Stat>

            <Stat icon="wallet" label="Revenue" hint={totalSold > 0 ? `from ${totalSold} ${totalSold === 1 ? 'ticket' : 'tickets'}` : 'no sales yet'}>
              <p className="f-display text-lg sm:text-xl font-bold text-amber-800 tabular-nums leading-none break-words">
                {formatRupiah(totalRevenue)}
              </p>
            </Stat>
          </section>

          {/* ===== Error (delete failed, etc) ===== */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 p-3.5 mb-5 rounded-xl bg-red-50 text-red-700 text-sm">
                  <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">{error}</div>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    aria-label="Dismiss message"
                    className={`text-red-500 hover:text-red-700 rounded ${focusRing}`}
                  >
                    <Icon name="close" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== Tabs ===== */}
          <div role="tablist" className="flex items-center gap-7 border-b border-dashed border-amber-300 mb-6">
            {tabs.map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(t.key)}
                  className={`relative inline-flex items-center gap-2 py-3 text-sm font-medium transition-colors rounded-t ${focusRing} ${
                    active ? 'text-amber-950' : 'text-amber-700/70 hover:text-amber-900'
                  }`}
                >
                  <Icon name={t.icon} />
                  {t.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                      active ? 'bg-amber-950 text-amber-50' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {t.count}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="manage-tab-underline"
                      className="absolute -bottom-px inset-x-0 h-0.5 bg-amber-800 rounded-full"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ===== Tab content ===== */}
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                role="tabpanel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SectionHeader
                  title="Schedule"
                  subtitle={totalSchedules > 0 ? `${totalSchedules} ${totalSchedules === 1 ? 'date' : 'dates'}, earliest first` : 'No dates yet'}
                  addLabel="Add schedule"
                  onAdd={() => setShowScheduleModal(true)}
                />

                {totalSchedules === 0 ? (
                  <EmptyState
                    icon="calendar"
                    title="No schedule yet"
                    hint="Add the first performance date and start time."
                    actionLabel="Add schedule"
                    onAction={() => setShowScheduleModal(true)}
                  />
                ) : (
                  <div className="divide-y divide-dashed divide-amber-200 bg-white rounded-2xl overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {schedules.map((s) => (
                        <ScheduleRow key={s.id} schedule={s} onDelete={requestDeleteSchedule} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'ticket' && (
              <motion.div
                key="ticket"
                role="tabpanel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SectionHeader
                  title="Ticket categories"
                  subtitle={totalCategories > 0 ? `${totalCategories} ${totalCategories === 1 ? 'category' : 'categories'}, ${totalQuota} tickets in total` : 'No categories yet'}
                  addLabel="Add category"
                  onAdd={() => setShowTicketModal(true)}
                />

                {totalCategories === 0 ? (
                  <EmptyState
                    icon="ticket"
                    title="No ticket categories yet"
                    hint="Start with something like VIP or Regular."
                    actionLabel="Add category"
                    onAction={() => setShowTicketModal(true)}
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {categories.map((t) => (
                        <TicketCard key={t.id} ticket={t} onDelete={requestDeleteTicket} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== Modal: add schedule ===== */}
          <FormModal
            open={showScheduleModal}
            title="Add schedule"
            subtitle="Buyers see new schedules right away."
            onClose={closeScheduleModal}
            onSubmit={addSchedule}
            saving={addingSchedule}
            submitLabel="Add schedule"
            error={modalError}
          >
            <Field label="Date" required>
              <input
                required
                autoFocus
                type="date"
                value={scheduleForm.event_date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, event_date: e.target.value })}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start time" required>
                <input
                  required
                  type="time"
                  value={scheduleForm.start_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="End time" optional>
                <input
                  type="time"
                  value={scheduleForm.end_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>

            <p className="flex items-center gap-1.5 text-sm text-amber-700/80">
              <Icon name="info" className="w-4 h-4 shrink-0" />
              You can leave the end time empty and add it later.
            </p>
          </FormModal>

          {/* ===== Modal: add ticket category ===== */}
          <FormModal
            open={showTicketModal}
            title="Add ticket category"
            subtitle="Set the price and how many tickets you'll sell."
            onClose={closeTicketModal}
            onSubmit={addTicketCategory}
            saving={addingTicket}
            submitLabel="Add category"
            error={modalError}
          >
            <Field label="Category name" required>
              <input
                required
                autoFocus
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                placeholder="VIP, Regular, Early bird"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price" required>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-amber-600 pointer-events-none">Rp</span>
                  <input
                    required
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={ticketForm.price}
                    onChange={(e) => setTicketForm({ ...ticketForm, price: e.target.value })}
                    placeholder="500000"
                    className={`${inputCls} pl-10 tabular-nums`}
                  />
                </div>
              </Field>
              <Field label="Quota" required>
                <input
                  required
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={ticketForm.quota}
                  onChange={(e) => setTicketForm({ ...ticketForm, quota: e.target.value })}
                  placeholder="100"
                  className={`${inputCls} tabular-nums`}
                />
              </Field>
            </div>

            {ticketForm.price && ticketForm.quota && (
              <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-amber-100">
                <span className="text-sm text-amber-900">Revenue if sold out</span>
                <span className="f-display text-base font-semibold text-amber-950 tabular-nums">
                  {formatRupiah(Number(ticketForm.price) * Number(ticketForm.quota))}
                </span>
              </div>
            )}
          </FormModal>

          {/* ===== Delete confirmation ===== */}
          <ConfirmDialog
            state={confirmState}
            deleting={deleting}
            onCancel={() => setConfirmState(null)}
            onConfirm={runDelete}
          />
        </div>
      </div>
    </MotionConfig>
  );
}