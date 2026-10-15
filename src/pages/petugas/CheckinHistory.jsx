import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatDate } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  check: 'M5 13l4 4L19 7',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  chevronLeft: 'M15 19l-7-7 7-7',
  close: 'M6 18L18 6M6 6l12 12',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  stamp: 'M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
};

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';
// Elemen bertopeng (mask) memotong ring luar, jadi ring dibuat di dalam.
const focusRingInset =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/70';

const ticketShadow =
  'rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_8px_16px_rgba(69,26,3,0.16)] transition-[filter] duration-200';

/* Lubang tiket dipotong dengan mask, jadi aman di background apa pun. */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  .ticket-notch { -webkit-mask: ${notch}; mask: ${notch}; }

  .ticket-card {
    --stub-h: 4.5rem;
    -webkit-mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
    mask:
      radial-gradient(circle 9px at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
      radial-gradient(circle 9px at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
  }
`;

/* ============ HELPERS ============ */
const formatTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

/* ============ SMALL COMPONENTS ============ */
function Bone({ className = '' }) {
  return <div className={`bg-amber-100 rounded ${className}`} />;
}

function SkeletonRows({ count = 3 }) {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="Loading">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)]">
          <div className="bg-white rounded-2xl overflow-hidden grid grid-cols-[1fr_7rem]">
            <div className="p-4 flex items-center gap-3">
              <Bone className="w-16 h-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Bone className="h-4 w-40 max-w-full" />
                <Bone className="h-3 w-24" />
                <Bone className="h-3 w-32" />
              </div>
            </div>
            <div className="bg-amber-50 border-l border-dashed border-amber-300/80 flex flex-col items-center justify-center gap-2 px-3">
              <Bone className="h-6 w-12" />
              <Bone className="h-1.5 w-full rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, children }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">{title}</h3>
      {children}
    </div>
  );
}

function RetryButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-4 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
    >
      Try again
    </button>
  );
}

function ConcertRow({ concert, onOpen }) {
  const total = concert.total_tickets || 0;
  const done = concert.total_checkin || 0;
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={ticketShadow}
    >
      <button
        type="button"
        onClick={() => onOpen(concert)}
        aria-label={`Open check-in history for ${concert.name}`}
        className={`ticket-notch w-full text-left grid grid-cols-[1fr_var(--stub)] bg-white rounded-2xl overflow-hidden ${focusRingInset}`}
        style={{ '--stub': '7rem' }}
      >
        <span className="flex items-center gap-3 p-4 min-w-0">
          <span className="block w-16 h-16 rounded-xl bg-amber-100 overflow-hidden shrink-0">
            {concert.poster ? (
              <img src={concert.poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200/70 text-amber-400">
                <Icon name="ticket" className="w-6 h-6" />
              </span>
            )}
          </span>

          <span className="block min-w-0 flex-1">
            <span className="block f-display font-semibold text-amber-950 truncate">{concert.name}</span>
            <span className="block text-sm text-amber-700/80 truncate">{concert.artist || '-'}</span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-amber-800/80">
              {concert.nearest_date && (
                <span className="inline-flex items-center gap-1">
                  <Icon name="calendar" className="w-3 h-3 text-amber-500" />
                  {formatDate(concert.nearest_date)}
                </span>
              )}
              {concert.venue_name && (
                <span className="inline-flex items-center gap-1 min-w-0">
                  <Icon name="pin" className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">{concert.venue_name}</span>
                </span>
              )}
            </span>
          </span>
        </span>

        <span className="flex flex-col items-center justify-center px-3 py-4 bg-amber-50 border-l border-dashed border-amber-300/80">
          <span className="f-display text-2xl font-semibold text-amber-950 leading-none tabular-nums">
            {done}
            <span className="text-xs font-normal text-amber-700/70">/{total}</span>
          </span>
          <span className="text-xs text-amber-700/80 mt-1 mb-2">attended</span>
          <span
            className="block w-full h-1.5 rounded-full bg-amber-200/70 overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Attendance"
          >
            <span className="block h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
          </span>
        </span>
      </button>
    </motion.li>
  );
}

function HistoryRow({ item, onOpen }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={ticketShadow}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        aria-label={`Show check-in details for ${item.customer_name}`}
        className={`ticket-notch w-full text-left grid grid-cols-[1fr_var(--stub)] bg-white rounded-2xl overflow-hidden ${focusRingInset}`}
        style={{ '--stub': '7rem' }}
      >
        <span className="flex items-start gap-3 p-4 min-w-0">
          <span className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-800">
            <Icon name="user" className="w-4 h-4" />
          </span>
          <span className="block min-w-0 flex-1">
            <span className="block f-display font-semibold text-amber-950 truncate">{item.customer_name}</span>
            <span className="block text-sm text-amber-700/80 truncate">{item.ticket_category_name}</span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-amber-800/80">
              <span className="inline-flex items-center gap-1">
                <Icon name="clock" className="w-3 h-3 text-amber-500" />
                {formatDate(item.checked_in_at)} · <span className="tabular-nums">{formatTime(item.checked_in_at)}</span>
              </span>
              {item.ticket_code && (
                <span className="font-mono text-amber-700/70 truncate">{item.ticket_code}</span>
              )}
            </span>
          </span>
        </span>

        <span className="flex flex-col items-center justify-center px-3 py-4 bg-amber-50 border-l border-dashed border-amber-300/80 min-w-0">
          <span className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-1.5 text-emerald-700">
            <Icon name="check" className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-emerald-700">Checked</span>
          {item.petugas_name && (
            <span className="text-xs text-amber-700/80 mt-0.5 truncate w-full text-center">{item.petugas_name}</span>
          )}
        </span>
      </button>
    </motion.li>
  );
}

function DetailLine({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-amber-700/80">{label}</p>
        <p className="text-sm text-amber-950 break-words">{children}</p>
      </div>
    </div>
  );
}

/* ============ MAIN ============ */
export default function CheckinHistory() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [search, setSearch] = useState('');
  const [detailTicket, setDetailTicket] = useState(null);
  const requestRef = useRef(0);

  const fetchConcerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/checkin/concerts');
      setConcerts(res.data);
      setLoadError(false);
    } catch (err) {
      console.error('Failed to fetch concerts:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConcerts();
  }, [fetchConcerts]);

  useEffect(() => {
    if (!detailTicket) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setDetailTicket(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [detailTicket]);

  async function openConcert(concert) {
    const requestId = ++requestRef.current;
    setSelectedConcert(concert);
    setHistory([]);
    setHistoryError(false);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/checkin/history/concert/${concert.id}`);
      if (requestId !== requestRef.current) return;
      setHistory(res.data);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error('Failed to fetch check-in history:', err);
      setHistoryError(true);
    } finally {
      if (requestId === requestRef.current) setHistoryLoading(false);
    }
  }

  function backToConcerts() {
    requestRef.current++;
    setSelectedConcert(null);
    setHistory([]);
    setHistoryError(false);
    setSearch('');
  }

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (h) =>
        h.customer_name?.toLowerCase().includes(q) ||
        h.ticket_code?.toLowerCase().includes(q) ||
        h.order_code?.toLowerCase().includes(q)
    );
  }, [history, search]);

  const isSearching = !!search.trim();

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* ===== HEADER ===== */}
          <header className="mb-6">
            <h1 className="f-display text-3xl font-bold text-amber-950">
              {selectedConcert ? 'Check-in history' : 'Select a concert'}
            </h1>
            <p className="text-sm text-amber-700/80 mt-1 truncate">
              {selectedConcert ? selectedConcert.name : 'Pick a concert to view its check-in history'}
            </p>
          </header>

          {/* ===== VIEW 1: CONCERT LIST ===== */}
          {!selectedConcert &&
            (loading ? (
              <SkeletonRows />
            ) : loadError ? (
              <EmptyState icon="alert" title="Couldn't load concerts">
                <p className="text-sm text-amber-800/80">Check your connection, then try again.</p>
                <RetryButton onClick={fetchConcerts} />
              </EmptyState>
            ) : concerts.length === 0 ? (
              <EmptyState icon="ticket" title="No concerts yet">
                <p className="text-sm text-amber-800/80">No concerts available yet.</p>
              </EmptyState>
            ) : (
              <ul className="space-y-4">
                {concerts.map((c) => (
                  <ConcertRow key={c.id} concert={c} onOpen={openConcert} />
                ))}
              </ul>
            ))}

          {/* ===== VIEW 2: HISTORY PER CONCERT ===== */}
          {selectedConcert && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={backToConcerts}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-amber-50 text-sm font-medium text-amber-800 rounded-xl transition-colors ${focusRing}`}
                >
                  <Icon name="chevronLeft" className="w-4 h-4" />
                  Back
                </button>
                <div className="relative flex-1">
                  <Icon name="search" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type="text"
                    aria-label="Search tickets"
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                    placeholder="Search by name or ticket code"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {!historyLoading && !historyError && history.length > 0 && (
                <p className="text-xs text-amber-700/80 mb-4" aria-live="polite">
                  <span className="tabular-nums">{filteredHistory.length}</span> of{' '}
                  <span className="tabular-nums">{history.length}</span> tickets found
                </p>
              )}

              {historyLoading ? (
                <SkeletonRows />
              ) : historyError ? (
                <EmptyState icon="alert" title="Couldn't load the history">
                  <p className="text-sm text-amber-800/80">Check your connection, then try again.</p>
                  <RetryButton onClick={() => openConcert(selectedConcert)} />
                </EmptyState>
              ) : filteredHistory.length === 0 ? (
                <EmptyState icon={isSearching ? 'search' : 'stamp'} title={isSearching ? 'No matching tickets' : 'No check-ins yet'}>
                  <p className="text-sm text-amber-800/80">
                    {isSearching
                      ? 'Try another name or ticket code.'
                      : 'No tickets have been checked in for this concert yet.'}
                  </p>
                </EmptyState>
              ) : (
                <ul className="space-y-4">
                  {filteredHistory.map((h) => (
                    <HistoryRow key={h.id} item={h} onOpen={setDetailTicket} />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* ===== TICKET DETAIL MODAL ===== */}
        <AnimatePresence>
          {detailTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setDetailTicket(null)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkin-detail-title"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="w-full max-w-sm rounded-2xl drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="f-body ticket-card bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 px-5 py-4 bg-amber-950 text-amber-50 shrink-0">
                    <div className="min-w-0">
                      <h2 id="checkin-detail-title" className="f-display text-xl font-semibold truncate">
                        {detailTicket.customer_name}
                      </h2>
                      <p className="font-mono text-xs text-amber-200/70 mt-0.5 truncate">{detailTicket.ticket_code}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailTicket(null)}
                      aria-label="Close details"
                      className={`-mr-1.5 -mt-1 p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-900 transition-colors ${focusRing}`}
                    >
                      <Icon name="close" className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl">
                      <span className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700">
                        <Icon name="stamp" className="w-[18px] h-[18px]" />
                      </span>
                      <div>
                        <p className="text-xs text-emerald-700/80">Check-in time</p>
                        <p className="text-sm font-semibold text-emerald-900 tabular-nums">
                          {new Date(detailTicket.checked_in_at).toLocaleString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3.5 pt-4 border-t border-dashed border-amber-200">
                      <DetailLine icon="mail" label="Email">
                        <span className="break-all">{detailTicket.customer_email || '-'}</span>
                      </DetailLine>
                      <DetailLine icon="phone" label="Phone">
                        {detailTicket.customer_phone || '-'}
                      </DetailLine>
                      <DetailLine icon="ticket" label="Category">
                        {detailTicket.ticket_category_name || '-'}
                      </DetailLine>
                      <DetailLine icon="calendar" label="Concert schedule">
                        {detailTicket.event_date
                          ? `${formatDate(detailTicket.event_date)}${
                              detailTicket.start_time ? ' · ' + detailTicket.start_time.slice(0, 5) : ''
                            }`
                          : '-'}
                      </DetailLine>
                      <DetailLine icon="pin" label="Venue">
                        {detailTicket.venue_name || '-'}
                        {detailTicket.venue_city ? `, ${detailTicket.venue_city}` : ''}
                      </DetailLine>
                      <DetailLine icon="user" label="Scanned by">
                        {detailTicket.petugas_name || '-'}
                      </DetailLine>
                    </div>
                  </div>

                  {/* Stub */}
                  <div className="h-[var(--stub-h)] shrink-0 border-t border-dashed border-amber-300/80 bg-amber-50 px-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-amber-700/80">Order ID</p>
                      <p className="font-mono text-sm font-semibold text-amber-950 truncate">{detailTicket.order_code}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailTicket(null)}
                      className={`px-4 py-2 text-sm font-medium text-amber-50 bg-amber-800 hover:bg-amber-700 rounded-lg transition-colors shrink-0 ${focusRing}`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}