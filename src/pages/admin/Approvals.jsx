import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import api from '../../api/axios';
import { formatRupiah } from '../../components/Ui';

/* ============ ICONS ============ */
const ICON_PATHS = {
  check: 'M5 13l4 4L19 7',
  close: 'M6 18L18 6M6 6l12 12',
  pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
  alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
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
    <svg className={`animate-spin motion-reduce:animate-none ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

/* ============ STYLES ============ */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1';

const ticketShadow =
  'rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)] hover:drop-shadow-[0_8px_16px_rgba(69,26,3,0.16)] transition-[filter] duration-200';

/* Lubang tiket dipotong dengan mask, jadi aman di background apa pun. */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const pageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Figtree:wght@400;500;600&display=swap');

  .f-display { font-family: 'Fraunces', Georgia, serif; }
  .f-body { font-family: 'Figtree', system-ui, -apple-system, sans-serif; }

  @media (min-width: 640px) {
    .ticket-notch-sm { -webkit-mask: ${notch}; mask: ${notch}; }
  }
`;

const QUICK_REASONS = [
  'Poster is unclear',
  'Description is incomplete',
  'Schedule conflict',
  'Invalid venue information',
  'Unreasonable ticket price',
];

// Warna chip kategori (hue sama seperti sebelumnya, shade disesuaikan untuk background terang)
const chipColors = [
  'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  'bg-blue-50 text-blue-700 border-blue-200/60',
  'bg-orange-50 text-orange-700 border-orange-200/60',
  'bg-purple-50 text-purple-700 border-purple-200/60',
  'bg-pink-50 text-pink-700 border-pink-200/60',
  'bg-cyan-50 text-cyan-700 border-cyan-200/60',
];

// Kategori yang sama selalu dapat warna yang sama, apa pun urutan daftarnya
function chipColorFor(name = '') {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return chipColors[sum % chipColors.length];
}

/* ============ SMALL COMPONENTS ============ */
function Bone({ className = '' }) {
  return <div className={`bg-amber-100 rounded ${className}`} />;
}

function SkeletonList() {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="Loading approvals">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl drop-shadow-[0_3px_8px_rgba(69,26,3,0.10)]">
          <div className="bg-white rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_12rem]">
            <div className="p-5 flex gap-4">
              <Bone className="w-20 h-24 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <Bone className="h-5 w-48 max-w-full" />
                <Bone className="h-3 w-32" />
                <Bone className="h-3 w-56 max-w-full" />
                <Bone className="h-3 w-40" />
              </div>
            </div>
            <div className="p-4 bg-amber-50 border-t border-dashed border-amber-300/80 sm:border-t-0 sm:border-l space-y-3">
              <Bone className="h-3 w-16" />
              <Bone className="h-9 w-full rounded-lg" />
              <Bone className="h-9 w-full rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, iconClass = 'text-amber-600', title, children }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300/70 p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <Icon name={icon} className={`w-6 h-6 ${iconClass}`} />
      </div>
      <h3 className="f-display text-lg font-semibold text-amber-950 mb-1">{title}</h3>
      {children}
    </div>
  );
}

function ApprovalTicket({ concert, isRejecting, busy, onApprove, onReject }) {
  return (
    <div
      className={`${ticketShadow} ${
        isRejecting ? 'ring-2 ring-red-400/50 ring-offset-2 ring-offset-[#f5ede4]' : ''
      }`}
    >
      <div
        className="ticket-notch-sm bg-white rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_var(--stub)]"
        style={{ '--stub': '12rem' }}
      >
        {/* Info */}
        <div className="p-5 flex gap-4 min-w-0">
          <div className="w-20 h-24 rounded-xl bg-amber-100 overflow-hidden shrink-0">
            {concert.poster ? (
              <img src={concert.poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200/70 text-amber-400">
                <Icon name="mic" className="w-7 h-7" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="f-display text-lg font-semibold text-amber-950 leading-snug truncate max-w-full">
                {concert.name}
              </h3>
              {concert.category_name && (
                <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${chipColorFor(concert.category_name)}`}>
                  {concert.category_name}
                </span>
              )}
            </div>
            <p className="text-sm text-amber-700/80 truncate">{concert.artist || 'Artist not provided'}</p>

            {concert.description && (
              <p className="text-sm text-amber-800/80 mt-2 line-clamp-2">{concert.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-amber-800">
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <span
                  className="w-5 h-5 rounded-full bg-amber-800 flex items-center justify-center text-[10px] text-amber-50 font-semibold shrink-0"
                  aria-hidden="true"
                >
                  {concert.organizer_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
                <span className="truncate">{concert.organizer_name || '-'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <Icon name="pin" className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{concert.venue_name || '-'}</span>
              </span>
              {concert.concert_date && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="calendar" className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {concert.concert_date}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stub: harga + aksi */}
        <div className="bg-amber-50 border-t border-dashed border-amber-300/80 sm:border-t-0 sm:border-l p-4 flex flex-col justify-center gap-3">
          <div>
            <p className="text-xs text-amber-700/80">Tickets from</p>
            <p className="f-display text-base font-semibold text-amber-950 tabular-nums truncate">
              {concert.min_price ? formatRupiah(concert.min_price) : 'Not set'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
            <button
              type="button"
              disabled={busy || isRejecting}
              onClick={onApprove}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors disabled:opacity-40 ${focusRing}`}
            >
              <Icon name="check" className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              type="button"
              disabled={busy || isRejecting}
              onClick={onReject}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors disabled:opacity-40 ${focusRing}`}
            >
              <Icon name="close" className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ MAIN ============ */
export default function Approvals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() });
  }, []);

  const fetchPending = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await api.get('/concerts/pending-approval');
        setPending(res.data);
        setLoadError(false);
      } catch (err) {
        console.error('Failed to fetch pending approvals:', err);
        if (silent) notify('error', "Couldn't refresh the list.");
        else setLoadError(true);
      } finally {
        setLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!approveTarget && !rejectingId) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape' || processing) return;
      if (approveTarget) setApproveTarget(null);
      else {
        setRejectingId(null);
        setReason('');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [approveTarget, rejectingId, processing]);

  async function handleApprove() {
    if (!approveTarget) return;
    setProcessing(true);
    try {
      await api.post(`/concerts/${approveTarget.id}/approve`, { approve: true });
      notify('success', `"${approveTarget.name}" has been approved and published`);
      setApproveTarget(null);
      fetchPending(true);
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to approve the concert.');
      setApproveTarget(null);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(id, concertName) {
    if (!reason.trim()) return;
    setProcessing(true);
    try {
      await api.post(`/concerts/${id}/approve`, { approve: false, reason });
      notify('success', `"${concertName}" has been rejected`);
      setRejectingId(null);
      setReason('');
      fetchPending(true);
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to reject the concert.');
    } finally {
      setProcessing(false);
    }
  }

  function startReject(id) {
    setRejectingId(id);
    setReason('');
  }

  function cancelReject() {
    setRejectingId(null);
    setReason('');
  }

  return (
    <MotionConfig reducedMotion="user">
      <style>{pageCss}</style>
      <div className="f-body min-h-screen bg-[#f5ede4] px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* ===== HEADER ===== */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="f-display text-3xl font-bold text-amber-950">Concert approvals</h1>
              <p className="text-sm text-amber-700/80 mt-1">
                Review events from organizers before they go live
              </p>
            </div>
            {!loading && pending.length > 0 && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium self-start sm:self-auto">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
                </span>
                <span className="tabular-nums">{pending.length}</span> pending
              </span>
            )}
          </header>

          {/* ===== CONTENT ===== */}
          {loading ? (
            <SkeletonList />
          ) : loadError ? (
            <EmptyState icon="alert" title="Couldn't load approvals">
              <p className="text-sm text-amber-800/80 mb-5">Check your connection, then try again.</p>
              <button
                type="button"
                onClick={() => fetchPending()}
                className={`px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-50 text-sm font-medium rounded-xl transition-colors ${focusRing}`}
              >
                Try again
              </button>
            </EmptyState>
          ) : pending.length === 0 ? (
            <EmptyState icon="check" iconClass="text-emerald-600" title="All caught up">
              <p className="text-sm text-amber-800/80">There are no concerts waiting for approval.</p>
            </EmptyState>
          ) : (
            <ul className="space-y-5">
              {pending.map((concert) => {
                const isRejecting = rejectingId === concert.id;
                return (
                  <li key={concert.id}>
                    <ApprovalTicket
                      concert={concert}
                      isRejecting={isRejecting}
                      busy={processing}
                      onApprove={() => setApproveTarget(concert)}
                      onReject={() => startReject(concert.id)}
                    />

                    {/* Panel penolakan inline */}
                    <AnimatePresence initial={false}>
                      {isRejecting && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-5 rounded-2xl bg-red-50 border border-red-200/60">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                                <Icon name="alert" className="w-3.5 h-3.5 text-red-600" />
                              </span>
                              <h4 className="f-display text-base font-semibold text-red-700">Rejection reason</h4>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {QUICK_REASONS.map((qr) => (
                                <button
                                  key={qr}
                                  type="button"
                                  onClick={() => setReason(qr)}
                                  aria-pressed={reason === qr}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${focusRing} ${
                                    reason === qr
                                      ? 'bg-red-100 text-red-700 border-red-300'
                                      : 'bg-white text-amber-800 hover:bg-amber-50 border-amber-200'
                                  }`}
                                >
                                  {qr}
                                </button>
                              ))}
                            </div>

                            <label htmlFor={`reason-${concert.id}`} className="sr-only">
                              Rejection reason
                            </label>
                            <textarea
                              id={`reason-${concert.id}`}
                              rows={2}
                              className="w-full px-3.5 py-2.5 bg-white border border-amber-200 rounded-xl text-sm text-amber-950 placeholder-amber-700/40 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-300/20 transition-all mb-3 resize-none"
                              placeholder="Pick a reason above or write your own"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />

                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={cancelReject}
                                disabled={processing}
                                className={`px-4 py-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 text-sm font-medium transition-colors disabled:opacity-50 ${focusRing}`}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={processing || !reason.trim()}
                                onClick={() => handleReject(concert.id, concert.name)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium transition-colors ${focusRing}`}
                              >
                                {processing ? (
                                  <>
                                    <Spinner />
                                    Sending…
                                  </>
                                ) : (
                                  <>
                                    <Icon name="close" className="w-4 h-4" />
                                    Send rejection
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          )}

          {/* ===== APPROVE MODAL ===== */}
          <AnimatePresence>
            {approveTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-amber-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => !processing && setApproveTarget(null)}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="approve-title"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="f-body bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl shadow-amber-950/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 mx-auto">
                    <Icon name="check" className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 id="approve-title" className="f-display text-xl font-semibold text-amber-950 text-center mb-2">
                    Approve this concert?
                  </h3>
                  <p className="text-sm text-amber-900 text-center font-semibold mb-1 break-words">
                    {approveTarget.name}
                  </p>
                  <p className="text-sm text-amber-800 text-center mb-4">It will be published right away.</p>

                  {(approveTarget.artist || approveTarget.venue_name) && (
                    <div className="space-y-2 mb-6 py-3 border-y border-dashed border-amber-200 text-xs text-amber-800">
                      {approveTarget.artist && (
                        <p className="flex items-center justify-center gap-2">
                          <Icon name="mic" className="w-3.5 h-3.5 text-amber-500" />
                          {approveTarget.artist}
                        </p>
                      )}
                      {approveTarget.venue_name && (
                        <p className="flex items-center justify-center gap-2">
                          <Icon name="pin" className="w-3.5 h-3.5 text-amber-500" />
                          {approveTarget.venue_name}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setApproveTarget(null)}
                      disabled={processing}
                      className={`flex-1 py-2.5 bg-amber-100 hover:bg-amber-200/70 text-amber-900 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${focusRing}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={processing}
                      className={`flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${focusRing}`}
                    >
                      {processing ? (
                        <>
                          <Spinner />
                          Processing…
                        </>
                      ) : (
                        'Yes, approve'
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== TOAST ===== */}
          <div className="fixed bottom-6 inset-x-0 z-[90] flex justify-center px-4 pointer-events-none">
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