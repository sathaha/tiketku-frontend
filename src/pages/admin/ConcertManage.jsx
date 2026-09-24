import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Loading, formatRupiah } from '../../components/Ui';

// ============================================================
// Helpers
// ============================================================

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
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
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// "2026-03-14" / "2026-03-14T00:00:00Z" -> tanggal lokal (hindari geser hari karena timezone)
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
  return [h > 0 && `${h} jam`, m > 0 && `${m} menit`].filter(Boolean).join(' ');
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900';

const btnPrimary = `inline-flex items-center gap-2 px-4 py-2 bg-flame-500 hover:bg-flame-600 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors ${focusRing}`;

const inputCls =
  'w-full px-3.5 py-2.5 bg-ink-900/50 border border-ink-700 hover:border-ink-600 rounded-lg text-sm text-white placeholder-ink-500 focus:outline-none focus:border-flame-500/60 focus:ring-2 focus:ring-flame-500/20 transition-colors [color-scheme:dark]';

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

function Modal({ open, onClose, children }) {
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col w-full max-w-md max-h-[92vh] bg-ink-900 border border-ink-700 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
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
    <Modal open={open} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-ink-400 mt-1">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className={`-mr-1.5 -mt-1 p-1.5 rounded-md text-ink-400 hover:text-white hover:bg-ink-700 transition-colors ${focusRing}`}
        >
          <Icon name="close" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col min-h-0">
        <div className="px-5 pb-5 space-y-4 overflow-y-auto">
          {error && (
            <div role="alert" className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {children}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-ink-700/60">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-sm text-ink-400 hover:text-white rounded-md transition-colors ${focusRing}`}
          >
            Batal
          </button>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? (
              <>
                <Spinner />
                Menyimpan...
              </>
            ) : (
              <>
                <Icon name="check" />
                {submitLabel || 'Simpan'}
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
      <span className="block text-sm font-medium text-ink-200 mb-1.5">
        {label}
        {required && <span className="text-flame-400"> *</span>}
        {optional && <span className="text-ink-500 font-normal"> (opsional)</span>}
      </span>
      {children}
    </label>
  );
}

function ConfirmDialog({ state, deleting, onCancel, onConfirm }) {
  // simpan state terakhir supaya teks tidak hilang saat animasi tutup
  const last = useRef(state);
  if (state) last.current = state;
  const s = last.current;

  return (
    <Modal open={!!state} onClose={deleting ? () => {} : onCancel}>
      <div className="px-5 pt-5 pb-4">
        <h3 className="font-semibold text-white">{s?.title}</h3>
        <p className="text-sm text-ink-300 mt-2 leading-relaxed">{s?.message}</p>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-ink-700/60">
        <button
          type="button"
          onClick={onCancel}
          disabled={deleting}
          className={`px-4 py-2 text-sm text-ink-400 hover:text-white rounded-md transition-colors disabled:opacity-50 ${focusRing}`}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors ${focusRing}`}
        >
          {deleting ? (
            <>
              <Spinner />
              Menghapus...
            </>
          ) : (
            <>
              <Icon name="trash" />
              Hapus
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// Jadwal
// ============================================================

function ScheduleRow({ schedule, onDelete }) {
  const date = parseLocalDate(schedule.event_date);
  const diff = daysFromToday(date);
  const isToday = diff === 0;
  const isPast = diff < 0;

  const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
  const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
  const duration = formatDuration(schedule.start_time, schedule.end_time);

  let relative = 'Selesai';
  if (isToday) relative = 'Hari ini';
  else if (diff === 1) relative = 'Besok';
  else if (diff > 1) relative = `${diff} hari lagi`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-4"
    >
      {/* Lembar kalender */}
      <div
        className={`w-14 shrink-0 rounded-lg py-2 text-center border ${
          isToday
            ? 'bg-flame-500 border-flame-500 text-white'
            : isPast
            ? 'bg-ink-800/50 border-ink-700/60 text-ink-500'
            : 'bg-ink-800 border-ink-700 text-white'
        }`}
      >
        <div className={`text-xs ${isToday ? 'text-white/80' : isPast ? 'text-ink-500' : 'text-flame-400'}`}>
          {monthName}
        </div>
        <div className="text-2xl font-bold leading-tight tabular-nums">{date.getDate()}</div>
        <div className={`text-[10px] leading-none pb-0.5 tabular-nums ${isToday ? 'text-white/70' : 'text-ink-500'}`}>
          {date.getFullYear()}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className={`font-semibold ${isPast ? 'text-ink-400' : 'text-white'}`}>{dayName}</span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs ${
              isToday ? 'text-flame-400 font-medium' : isPast ? 'text-ink-500' : 'text-ink-400'
            }`}
          >
            {isToday && <span className="w-1.5 h-1.5 rounded-full bg-flame-400 animate-pulse" />}
            {relative}
          </span>
        </div>

        <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm ${isPast ? 'text-ink-500' : 'text-ink-200'}`}>
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Icon name="clock" className="w-3.5 h-3.5 text-ink-500" />
            {schedule.start_time?.slice(0, 5)}
            {schedule.end_time ? ` – ${schedule.end_time.slice(0, 5)}` : ' – selesai'}
          </span>
          {duration && <span className="text-xs text-ink-500">{duration}</span>}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(schedule)}
        aria-label={`Hapus jadwal ${dayName}`}
        title="Hapus jadwal"
        className={`shrink-0 p-2 rounded-md text-ink-500 hover:text-red-400 hover:bg-red-500/10 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${focusRing}`}
      >
        <Icon name="trash" />
      </button>
    </motion.div>
  );
}

// ============================================================
// Tiket — dibuat seperti tiket asli: bagian utama + potongan sobekan di kanan
// ============================================================

const STUB_WIDTH = 96; // px, lebar potongan kanan

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
  let statusLabel = 'Tersedia';
  if (soldPct >= 100) {
    statusColor = 'red';
    statusLabel = 'Habis';
  } else if (soldPct >= 80) {
    statusColor = 'orange';
    statusLabel = 'Hampir habis';
  } else if (soldPct >= 50) {
    statusColor = 'yellow';
    statusLabel = 'Terjual separuh';
  }

  const colorMap = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500' },
    orange: { text: 'text-orange-400', bg: 'bg-orange-500' },
    red: { text: 'text-red-400', bg: 'bg-red-500' },
  };
  const color = colorMap[statusColor];

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={notchMask}
      className="group flex bg-ink-800/40 border border-ink-700/60 hover:border-flame-500/30 rounded-xl transition-colors"
    >
      {/* Bagian utama */}
      <div className="flex-1 min-w-0 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-semibold text-white truncate">{ticket.name}</h4>
            <p className={`mt-0.5 inline-flex items-center gap-1.5 text-xs ${color.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${color.bg}`} />
              {statusLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDelete(ticket)}
            aria-label={`Hapus kategori ${ticket.name}`}
            title="Hapus kategori"
            className={`-mr-1 -mt-1 shrink-0 p-1.5 rounded-md text-ink-500 hover:text-red-400 hover:bg-red-500/10 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${focusRing}`}
          >
            <Icon name="trash" className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="mt-3 text-lg font-semibold text-flame-400 tabular-nums">{formatRupiah(price)}</p>

        <div className="mt-3">
          <div className="h-1.5 bg-ink-900/70 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${soldPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${color.bg}`}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-ink-400 tabular-nums">
            <span>
              Terjual <span className="text-white font-medium">{sold}</span> dari {quota}
            </span>
            {sold > 0 && <span>{formatRupiah(sold * price)}</span>}
          </div>
        </div>
      </div>

      {/* Potongan tiket */}
      <div
        style={{ width: STUB_WIDTH }}
        className="shrink-0 flex flex-col items-center justify-center text-center border-l border-dashed border-ink-600 px-2"
      >
        <span className="text-xs text-ink-500">Sisa</span>
        <span className={`text-3xl font-bold leading-none my-1 tabular-nums ${remaining > 0 ? 'text-white' : 'text-red-400'}`}>
          {remaining}
        </span>
        <span className="text-xs text-ink-500">tiket</span>
      </div>
    </motion.div>
  );
}

// ============================================================
// Potongan kecil UI
// ============================================================

function Stat({ icon, label, hint, children }) {
  return (
    <div className="bg-ink-900 p-4 sm:p-5">
      <div className="flex items-center gap-1.5 text-xs text-ink-400">
        <Icon name={icon} className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="mt-2">{children}</div>
      {hint && <div className="mt-1 text-xs text-ink-500">{hint}</div>}
    </div>
  );
}

function EmptyState({ icon, title, hint, actionLabel, onAction }) {
  return (
    <div className="text-center py-14 px-4 border border-dashed border-ink-700 rounded-xl">
      <Icon name={icon} className="w-7 h-7 text-ink-500 mx-auto mb-3" />
      <p className="text-sm font-medium text-ink-200">{title}</p>
      <p className="text-xs text-ink-500 mt-1 mb-5">{hint}</p>
      <button type="button" onClick={onAction} className={btnPrimary}>
        <Icon name="plus" />
        {actionLabel}
      </button>
    </div>
  );
}

function SectionHeader({ title, subtitle, onAdd }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>
      </div>
      <button type="button" onClick={onAdd} className={btnPrimary}>
        <Icon name="plus" />
        Tambah
      </button>
    </div>
  );
}

// ============================================================
// Halaman utama
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

  // silent = refresh data tanpa menampilkan layar loading penuh
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
      setModalError(err.response?.data?.message || 'Gagal menambah jadwal.');
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
      setModalError(err.response?.data?.message || 'Gagal menambah kategori tiket.');
    } finally {
      setAddingTicket(false);
    }
  }

  function requestDeleteSchedule(s) {
    const label = parseLocalDate(s.event_date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setError('');
    setConfirmState({
      type: 'schedule',
      id: s.id,
      title: 'Hapus jadwal ini?',
      message: `Jadwal ${label} akan dihapus dari konser. Tindakan ini tidak bisa dibatalkan.`,
    });
  }

  function requestDeleteTicket(t) {
    const sold = Number(t.sold) || 0;
    setError('');
    setConfirmState({
      type: 'ticket',
      id: t.id,
      title: `Hapus kategori ${t.name}?`,
      message:
        sold > 0
          ? `Kategori ini sudah terjual ${sold} tiket. Tindakan ini tidak bisa dibatalkan.`
          : 'Kategori akan dihapus dari konser. Tindakan ini tidak bisa dibatalkan.',
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
          (type === 'schedule' ? 'Gagal menghapus jadwal.' : 'Gagal menghapus kategori tiket.')
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loading />;
  if (!concert)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Icon name="ticket" className="w-10 h-10 text-ink-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Konser tidak ditemukan</h2>
        <p className="text-ink-300 mb-6">Konser yang kamu cari mungkin sudah dihapus.</p>
        <Link to={backTo} className="btn-primary inline-block">
          Kembali
        </Link>
      </div>
    );

  // ===== Data turunan =====
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

  const tabs = [
    { key: 'schedule', label: 'Jadwal', icon: 'calendar', count: totalSchedules },
    { key: 'ticket', label: 'Tiket', icon: 'ticket', count: totalCategories },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* ===== Back link ===== */}
        <Link
          to={backTo}
          className={`group inline-flex items-center gap-2 text-sm text-ink-300 hover:text-flame-400 transition-colors mb-5 rounded-md ${focusRing}`}
        >
          <Icon name="back" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kelola Konser
        </Link>

        {/* ===== Header konser ===== */}
        <header className="relative overflow-hidden bg-ink-900 border border-ink-700 rounded-xl mb-4">
          {concert.poster && (
            <div className="absolute inset-0" aria-hidden="true">
              <img src={concert.poster} alt="" className="w-full h-full object-cover opacity-30 blur-2xl scale-125" />
              <div className="absolute inset-0 bg-ink-900/70" />
            </div>
          )}

          <div className="relative flex items-start gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="w-24 sm:w-32 aspect-[3/4] shrink-0 rounded-lg overflow-hidden bg-ink-800 border border-ink-700 shadow-xl shadow-black/40">
              {concert.poster ? (
                <img src={concert.poster} alt={concert.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="music" className="w-8 h-8 text-ink-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 self-stretch flex flex-col">
              {(concert.approval_status || concert.status) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-xs font-medium">
                  {concert.approval_status && (
                    <span className="inline-flex items-center gap-1.5 text-flame-400 capitalize">
                      <span className="w-1.5 h-1.5 rounded-full bg-flame-400" />
                      {String(concert.approval_status).replace(/_/g, ' ')}
                    </span>
                  )}
                  {concert.status && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 capitalize">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {concert.status}
                    </span>
                  )}
                </div>
              )}

              <h1 className="font-bold text-white text-2xl sm:text-3xl leading-tight tracking-tight">
                {concert.name}
              </h1>
              <p className="text-ink-300 mt-1 truncate">{concert.artist || 'Artis belum diisi'}</p>

              <div className="mt-auto pt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-300">
                {concert.venue_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="pin" className="w-4 h-4 text-ink-500" />
                    {concert.venue_name}
                  </span>
                )}
                {concert.category_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="music" className="w-4 h-4 text-ink-500" />
                    {concert.category_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ===== Ringkasan ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-700/60 border border-ink-700/60 rounded-xl overflow-hidden mb-6">
          <Stat icon="calendar" label="Jadwal" hint="tanggal pertunjukan">
            <p className="text-2xl font-bold text-white tabular-nums leading-none">{totalSchedules}</p>
          </Stat>

          <Stat icon="ticket" label="Harga mulai dari" hint={`${totalCategories} kategori tiket`}>
            <p className="text-lg sm:text-xl font-bold text-flame-400 tabular-nums leading-none">
              {minPrice !== null ? formatRupiah(minPrice) : '—'}
            </p>
          </Stat>

          <Stat icon="users" label="Tiket terjual">
            <p className="text-2xl font-bold text-emerald-400 tabular-nums leading-none">
              {totalSold}
              <span className="text-sm font-normal text-ink-500"> / {totalQuota}</span>
            </p>
            <div className="mt-2.5 h-1 bg-ink-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${soldPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </Stat>

          <Stat icon="ticket" label="Pendapatan" hint={totalSold > 0 ? `dari ${totalSold} tiket` : 'belum ada penjualan'}>
            <p className="text-lg sm:text-xl font-bold text-flame-400 tabular-nums leading-none break-words">
              {formatRupiah(totalRevenue)}
            </p>
          </Stat>
        </div>

        {/* ===== Error (hapus gagal, dll) ===== */}
        <AnimatePresence>
          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-3 p-3.5 mb-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  aria-label="Tutup pesan"
                  className="text-red-400/70 hover:text-red-400"
                >
                  <Icon name="close" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Tab ===== */}
        <div role="tablist" className="flex items-center gap-7 border-b border-ink-700/60 mb-6">
          {tabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(t.key)}
                className={`relative inline-flex items-center gap-2 py-3 text-sm font-medium transition-colors ${
                  active ? 'text-white' : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                <Icon name={t.icon} />
                {t.label}
                <span className={`text-xs tabular-nums ${active ? 'text-flame-400' : 'text-ink-500'}`}>{t.count}</span>
                {active && (
                  <motion.span
                    layoutId="manage-tab-underline"
                    className="absolute -bottom-px inset-x-0 h-0.5 bg-flame-500"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ===== Isi tab ===== */}
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SectionHeader
                title="Jadwal konser"
                subtitle={totalSchedules > 0 ? `${totalSchedules} tanggal, diurutkan dari yang terdekat` : 'Belum ada jadwal'}
                onAdd={() => setShowScheduleModal(true)}
              />

              {totalSchedules === 0 ? (
                <EmptyState
                  icon="calendar"
                  title="Belum ada jadwal"
                  hint="Tambahkan tanggal dan jam pertunjukan pertama."
                  actionLabel="Tambah jadwal"
                  onAction={() => setShowScheduleModal(true)}
                />
              ) : (
                <div className="divide-y divide-ink-700/60 border border-ink-700/60 rounded-xl bg-ink-800/30 overflow-hidden">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SectionHeader
                title="Kategori tiket"
                subtitle={totalCategories > 0 ? `${totalCategories} kategori, ${totalQuota} tiket total` : 'Belum ada kategori'}
                onAdd={() => setShowTicketModal(true)}
              />

              {totalCategories === 0 ? (
                <EmptyState
                  icon="ticket"
                  title="Belum ada kategori tiket"
                  hint="Mulai dengan kategori seperti VIP atau Reguler."
                  actionLabel="Tambah kategori"
                  onAction={() => setShowTicketModal(true)}
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
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

        {/* ===== Modal: tambah jadwal ===== */}
        <FormModal
          open={showScheduleModal}
          title="Tambah jadwal"
          subtitle="Jadwal baru langsung tampil ke pembeli."
          onClose={closeScheduleModal}
          onSubmit={addSchedule}
          saving={addingSchedule}
          submitLabel="Tambah jadwal"
          error={modalError}
        >
          <Field label="Tanggal" required>
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
            <Field label="Jam mulai" required>
              <input
                required
                type="time"
                value={scheduleForm.start_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Jam selesai" optional>
              <input
                type="time"
                value={scheduleForm.end_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-ink-500">
            <Icon name="info" className="w-3.5 h-3.5 shrink-0" />
            Jam selesai boleh dikosongkan dan diisi nanti.
          </p>
        </FormModal>

        {/* ===== Modal: tambah kategori tiket ===== */}
        <FormModal
          open={showTicketModal}
          title="Tambah kategori tiket"
          subtitle="Tentukan harga dan jumlah tiket yang dijual."
          onClose={closeTicketModal}
          onSubmit={addTicketCategory}
          saving={addingTicket}
          submitLabel="Tambah kategori"
          error={modalError}
        >
          <Field label="Nama kategori" required>
            <input
              required
              autoFocus
              value={ticketForm.name}
              onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
              placeholder="Contoh: VIP, Reguler, Early Bird"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga" required>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-500 pointer-events-none">Rp</span>
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
            <Field label="Kuota" required>
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
            <div className="flex items-center justify-between px-3.5 py-3 rounded-lg bg-flame-500/5 border border-flame-500/20">
              <span className="text-sm text-ink-300">Potensi pendapatan</span>
              <span className="text-sm font-semibold text-flame-400 tabular-nums">
                {formatRupiah(Number(ticketForm.price) * Number(ticketForm.quota))}
              </span>
            </div>
          )}
        </FormModal>

        {/* ===== Konfirmasi hapus ===== */}
        <ConfirmDialog
          state={confirmState}
          deleting={deleting}
          onCancel={() => setConfirmState(null)}
          onConfirm={runDelete}
        />
      </div>
    </MotionConfig>
  );
}