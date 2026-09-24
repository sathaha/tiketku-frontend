import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    check: 'M5 13l4 4L19 7',
    close: 'M6 18L18 6M6 6l12 12',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    tag: 'M20.59 13.41L11 3.83A2 2 0 009.59 3.24H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.58 9.59a2 2 0 002.83 0l4.59-4.6a2 2 0 000-2.82zM7 8h.01',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    mic: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
    alert: 'M12 9v2m0 4h.01M5.071 19h13.858a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    grid: 'M3 3h7v7H3V3zM14 3h7v7h-7V3zM3 14h7v7H3v-7zM14 14h7v7h-7v-7z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

const QUICK_REASONS = [
  'Poster tidak jelas',
  'Deskripsi kurang lengkap',
  'Jadwal bentrok',
  'Informasi venue tidak valid',
  'Harga tiket tidak wajar',
];

// Warna chip untuk kategori
const chipColors = [
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'bg-pink-500/15 text-pink-300 border-pink-500/30',
  'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
];

export default function Approvals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [approveTarget, setApproveTarget] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    setLoading(true);
    try {
      const res = await api.get('/concerts/pending-approval');
      setPending(res.data);
    } catch (err) {
      console.error('Failed to fetch pending approvals:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!approveTarget) return;
    setProcessing(true);
    try {
      await api.post(`/concerts/${approveTarget.id}/approve`, { approve: true });
      setSuccessMsg(`"${approveTarget.name}" berhasil disetujui dan dipublikasikan`);
      setApproveTarget(null);
      fetchPending();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyetujui konser.');
      setApproveTarget(null);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(id, concertName) {
    if (!reason.trim()) {
      alert('Mohon isi alasan penolakan.');
      return;
    }
    setProcessing(true);
    try {
      await api.post(`/concerts/${id}/approve`, { approve: false, reason });
      setSuccessMsg(`"${concertName}" telah ditolak`);
      setRejectingId(null);
      setReason('');
      fetchPending();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menolak konser.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Icon name="check" className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Approval Konser</h1>
            <p className="text-sm text-ink-400 mt-0.5">
              Review event dari EO sebelum tayang
            </p>
          </div>
        </div>
        {!loading && pending.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium self-start sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
            </span>
            {pending.length} menunggu
          </span>
        )}
      </div>

      {/* ===== SUCCESS MESSAGE ===== */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
          >
            <Icon name="check" className="w-4 h-4 shrink-0" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <Loading />
      ) : pending.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full bg-ink-800 flex items-center justify-center mb-4">
            <Icon name="check" className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white text-lg mb-1">Semua beres</h3>
          <p className="text-ink-400 text-sm">Tidak ada konser yang menunggu persetujuan.</p>
        </div>
      ) : (
        <>

          {/* ===== TABLE HEADER (desktop) ===== */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-ink-800/60 border border-ink-700/60 rounded-t-xl text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
            <div className="col-span-1 flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-ink-600" />
            </div>
            <div className="col-span-3">Konser</div>
            <div className="col-span-2">Penyelenggara</div>
            <div className="col-span-3">Info Event</div>
            <div className="col-span-2">Venue</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>

          {/* ===== TABLE ROWS ===== */}
          <div className="space-y-2 lg:space-y-0">
            {pending.map((concert, index) => {
              const chipColor = chipColors[index % chipColors.length];
              const isRejecting = rejectingId === concert.id;

              return (
                <motion.div
                  key={concert.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-ink-800/30 lg:bg-ink-800/20 border border-ink-700/60 lg:border-t-0 hover:bg-ink-800/60 transition-colors ${
                    index === pending.length - 1 ? 'lg:rounded-b-xl' : ''
                  } ${isRejecting ? 'ring-1 ring-red-500/40' : ''}`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:px-5 lg:py-4 items-center">

                    {/* Checkbox (desktop) */}
                    <div className="hidden lg:flex lg:col-span-1 items-center">
                      <div className="w-4 h-4 rounded border border-ink-600" />
                    </div>

                    {/* Poster + Nama */}
                    <div className="lg:col-span-3 flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-ink-700 overflow-hidden shrink-0 relative">
                        {concert.poster ? (
                          <img src={concert.poster} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="mic" className="w-5 h-5 text-ink-500" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-white text-sm truncate">
                          {concert.name}
                        </h3>
                        <p className="text-xs text-ink-400 truncate mt-0.5">
                          {concert.artist || 'Artis belum diisi'}
                        </p>
                      </div>
                    </div>

                    {/* Organizer */}
                    <div className="lg:col-span-2 min-w-0">
                      <div className="lg:hidden text-[10px] uppercase tracking-wider text-ink-500 mb-1">
                        Penyelenggara
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-300 truncate">
                        <div className="w-6 h-6 rounded-full bg-ink-700 flex items-center justify-center text-[10px] text-ink-300 font-semibold shrink-0">
                          {concert.organizer_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="truncate">{concert.organizer_name || '-'}</span>
                      </div>
                    </div>

                    {/* Info Event (chips) */}
                    <div className="lg:col-span-3 min-w-0">
                      <div className="lg:hidden text-[10px] uppercase tracking-wider text-ink-500 mb-1">
                        Info Event
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {concert.category_name && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${chipColor}`}>
                            {concert.category_name}
                          </span>
                        )}
                        {concert.concert_date && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-ink-700/60 text-ink-300 border border-ink-700 flex items-center gap-1">
                            <Icon name="calendar" className="w-3 h-3" />
                            {concert.concert_date}
                          </span>
                        )}
                        {concert.min_price && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-flame-500/15 text-flame-300 border border-flame-500/30 font-mono">
                            {concert.min_price}
                          </span>
                        )}
                        {concert.description && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-ink-700/60 text-ink-400 border border-ink-700 truncate max-w-[150px]">
                            {concert.description.slice(0, 30)}...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="lg:col-span-2 min-w-0">
                      <div className="lg:hidden text-[10px] uppercase tracking-wider text-ink-500 mb-1">
                        Venue
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-ink-300 truncate">
                        <Icon name="pin" className="w-3.5 h-3.5 text-ink-500 flex-shrink-0" />
                        <span className="truncate">{concert.venue_name || '-'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1 flex items-center justify-end gap-1">
                      <button
                        disabled={processing || isRejecting}
                        onClick={() => setApproveTarget(concert)}
                        className="w-8 h-8 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors disabled:opacity-40"
                        title="Setujui"
                      >
                        <Icon name="check" className="w-4 h-4" />
                      </button>
                      <button
                        disabled={processing || isRejecting}
                        onClick={() => {
                          setRejectingId(concert.id);
                          setReason('');
                        }}
                        className="w-8 h-8 rounded-lg bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-400 flex items-center justify-center transition-colors disabled:opacity-40"
                        title="Tolak"
                      >
                        <Icon name="close" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ===== INLINE REJECT PANEL ===== */}
                  <AnimatePresence>
                    {isRejecting && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-red-500/20"
                      >
                        <div className="p-4 lg:px-5 bg-red-500/5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                              <Icon name="alert" className="w-3.5 h-3.5 text-red-400" />
                            </div>
                            <span className="text-sm font-medium text-red-300">
                              Alasan Penolakan
                            </span>
                          </div>

                          {/* Quick reasons chips */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {QUICK_REASONS.map((qr) => (
                              <button
                                key={qr}
                                type="button"
                                onClick={() => setReason(qr)}
                                className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${
                                  reason === qr
                                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                    : 'bg-ink-700/60 text-ink-300 hover:bg-ink-600 border-ink-700'
                                }`}
                              >
                                {qr}
                              </button>
                            ))}
                          </div>

                          <textarea
                            className="w-full px-3 py-2.5 bg-ink-900/50 border border-ink-700 rounded-lg text-sm text-white placeholder-ink-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all mb-3 resize-none"
                            rows={2}
                            placeholder="Detail tambahan (opsional)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />

                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setReason('');
                              }}
                              className="px-4 py-2 rounded-lg bg-ink-700 hover:bg-ink-600 text-white text-sm font-medium transition-colors"
                            >
                              Batal
                            </button>
                            <button
                              disabled={processing}
                              onClick={() => handleReject(concert.id, concert.name)}
                              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
                            >
                              {processing ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Mengirim...
                                </>
                              ) : (
                                <>
                                  <Icon name="close" className="w-4 h-4" />
                                  Kirim Penolakan
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* ===== TABLE FOOTER ===== */}
          <div className="hidden lg:flex items-center justify-between px-5 py-3 bg-ink-800/60 border border-t-0 border-ink-700/60 rounded-b-xl text-xs text-ink-400">
            <span>
              <span className="text-white font-medium">{pending.length}</span> konser menunggu approval
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="clock" className="w-3.5 h-3.5 text-yellow-500" />
              Perlu review segera
            </span>
          </div>
        </>
      )}

      {/* ===== APPROVE CONFIRMATION MODAL ===== */}
      <AnimatePresence>
        {approveTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setApproveTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ink-800 border border-ink-700 rounded-2xl max-w-sm w-full p-6 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Icon name="check" className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white text-lg">Setujui Konser</h3>
              </div>

              <p className="text-ink-300 text-sm mb-2">
                Konser ini akan dipublikasikan:
              </p>
              <p className="text-white font-medium mb-4">
                {approveTarget.name}
              </p>

              <div className="space-y-2 mb-6 text-xs text-ink-400">
                {approveTarget.artist && (
                  <p className="flex items-center gap-2">
                    <Icon name="mic" className="w-3.5 h-3.5 text-ink-500" />
                    {approveTarget.artist}
                  </p>
                )}
                {approveTarget.venue_name && (
                  <p className="flex items-center gap-2">
                    <Icon name="pin" className="w-3.5 h-3.5 text-ink-500" />
                    {approveTarget.venue_name}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    'Ya, Setujui'
                  )}
                </button>
                <button
                  onClick={() => setApproveTarget(null)}
                  disabled={processing}
                  className="flex-1 py-2.5 bg-ink-700 hover:bg-ink-600 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}