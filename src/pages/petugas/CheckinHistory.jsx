import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState, formatDate } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    check: 'M5 13l4 4L19 7',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    chevronLeft: 'M15 19l-7-7 7-7',
    chevronRight: 'M9 6l6 6-6 6',
    close: 'M6 18L18 6M6 6l12 12',
    search: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
    stamp: 'M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

// A perforated "tear line" — the visual signature borrowed from a real
// ticket stub. `holeBg` should match whatever sits *behind* the card
// (page background for stubs cut into a white card).
function Perforation({ orientation = 'vertical', holeBg = '#f5ede4' }) {
  if (orientation === 'vertical') {
    return (
      <div className="relative w-0 flex-shrink-0">
        <div className="absolute inset-y-3 left-0 border-l-2 border-dashed border-amber-300" />
        <span
          className="absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 border-amber-300"
          style={{ background: holeBg }}
        />
        <span
          className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full border-2 border-amber-300"
          style={{ background: holeBg }}
        />
      </div>
    );
  }
  return (
    <div className="relative h-0 w-full">
      <div className="absolute inset-x-3 top-0 border-t-2 border-dashed border-amber-300" />
      <span
        className="absolute -left-2 -top-2 w-4 h-4 rounded-full border-2 border-amber-300"
        style={{ background: holeBg }}
      />
      <span
        className="absolute -right-2 -top-2 w-4 h-4 rounded-full border-2 border-amber-300"
        style={{ background: holeBg }}
      />
    </div>
  );
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function CheckinHistory() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [detailTicket, setDetailTicket] = useState(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    api.get('/checkin/concerts')
      .then((res) => setConcerts(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function openConcert(concert) {
    setSelectedConcert(concert);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/checkin/history/concert/${concert.id}`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }

  function backToConcerts() {
    setSelectedConcert(null);
    setHistory([]);
    setSearch('');
  }

  const filteredHistory = useMemo(() => {
    const q = search.toLowerCase();
    return history.filter(
      (h) =>
        h.customer_name?.toLowerCase().includes(q) ||
        h.ticket_code?.toLowerCase().includes(q) ||
        h.order_code?.toLowerCase().includes(q)
    );
  }, [history, search]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#f5ede4] py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-amber-800 flex items-center justify-center text-amber-50">
              <Icon name="history" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-xl font-bold text-amber-950 tracking-wide">
                {selectedConcert ? 'Riwayat Check-in' : 'Pilih Konser'}
              </h1>
              <p className="font-serif text-xs text-amber-700/60 mt-0.5 truncate">
                {selectedConcert
                  ? selectedConcert.name
                  : 'Pilih konser untuk melihat riwayat check-in'}
              </p>
            </div>
          </div>
          <div className="h-px bg-amber-200/60 mt-4" />
        </div>

        {/* ===== VIEW 1: DAFTAR KONSER ===== */}
        {!selectedConcert && (
          <>
            {concerts.length === 0 ? (
              <EmptyState text="Belum ada konser yang tersedia." />
            ) : (
              <motion.div
                variants={reduceMotion ? undefined : listVariants}
                initial={reduceMotion ? undefined : 'hidden'}
                animate={reduceMotion ? undefined : 'show'}
                className="space-y-3"
              >
                {concerts.map((c) => {
                  const total = c.total_tickets || 0;
                  const done = c.total_checkin || 0;
                  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
                  return (
                    <motion.button
                      key={c.id}
                      variants={reduceMotion ? undefined : itemVariants}
                      onClick={() => openConcert(c)}
                      className="group w-full text-left flex bg-white border border-amber-200/60 hover:border-amber-400 rounded-md overflow-hidden transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
                    >
                      <div className="w-20 h-20 flex-shrink-0 bg-amber-100 overflow-hidden">
                        {c.poster ? (
                          <img src={c.poster} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-400">
                            <Icon name="ticket" className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 p-3.5">
                        <p className="font-serif font-semibold text-sm text-amber-950 truncate">
                          {c.name}
                        </p>
                        <p className="font-serif text-xs text-amber-800/70 truncate mt-0.5">
                          {c.artist || '-'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] font-serif text-amber-700/70">
                          {c.nearest_date && (
                            <span className="flex items-center gap-1">
                              <Icon name="calendar" className="w-3 h-3 text-amber-500" />
                              {formatDate(c.nearest_date)}
                            </span>
                          )}
                          {c.venue_name && (
                            <span className="flex items-center gap-1 truncate">
                              <Icon name="pin" className="w-3 h-3 text-amber-500" />
                              <span className="truncate">{c.venue_name}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <Perforation orientation="vertical" holeBg="#ffffff" />

                      <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center px-2 py-3 bg-amber-50/60">
                        <p className="font-serif text-xl font-bold text-amber-950 leading-none">
                          {done}
                          <span className="text-xs font-normal text-amber-700/60">/{total}</span>
                        </p>
                        <p className="text-[9px] font-serif uppercase tracking-wider text-amber-700/60 mt-1 mb-1.5">
                          hadir
                        </p>
                        <div className="w-full h-1 rounded-full bg-amber-200/70 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </>
        )}

        {/* ===== VIEW 2: RIWAYAT PER KONSER ===== */}
        {selectedConcert && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={backToConcerts}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-serif text-amber-800 hover:bg-amber-50 border border-amber-200/60 rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                <Icon name="chevronLeft" className="w-3.5 h-3.5" />
                Kembali
              </button>
              <div className="relative flex-1">
                <Icon name="search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  className="w-full pl-9 pr-3 py-2 text-sm font-serif bg-white border border-amber-200/60 rounded-md placeholder:text-amber-400/60 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Cari nama atau kode tiket..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {!historyLoading && history.length > 0 && (
              <p className="font-serif text-[11px] text-amber-700/60 mb-3">
                {filteredHistory.length} dari {history.length} tiket ditemukan
              </p>
            )}

            {historyLoading ? (
              <Loading />
            ) : filteredHistory.length === 0 ? (
              <EmptyState
                text={
                  search
                    ? 'Tidak ada tiket yang cocok.'
                    : 'Belum ada tiket yang di-check-in untuk konser ini.'
                }
              />
            ) : (
              <motion.div
                variants={reduceMotion ? undefined : listVariants}
                initial={reduceMotion ? undefined : 'hidden'}
                animate={reduceMotion ? undefined : 'show'}
                className="space-y-3"
              >
                {filteredHistory.map((h) => (
                  <motion.button
                    key={h.id}
                    variants={reduceMotion ? undefined : itemVariants}
                    onClick={() => setDetailTicket(h)}
                    className="group w-full text-left flex bg-white border border-amber-200/60 hover:border-amber-400 rounded-md overflow-hidden transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
                  >
                    <div className="flex-1 min-w-0 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                          <Icon name="user" className="w-4 h-4 text-amber-800" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif font-semibold text-sm text-amber-950 truncate">
                            {h.customer_name}
                          </p>
                          <p className="font-serif text-xs text-amber-800/70 truncate mt-0.5">
                            {h.ticket_category_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] font-serif text-amber-700/70">
                            <span className="flex items-center gap-1">
                              <Icon name="clock" className="w-3 h-3 text-amber-500" />
                              {formatDate(h.checked_in_at)}
                            </span>
                            {h.ticket_code && (
                              <span className="font-mono text-amber-700/60 truncate">
                                {h.ticket_code}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Perforation orientation="vertical" holeBg="#f5ede4" />

                    <div className="w-24 flex-shrink-0 bg-amber-50/60 flex flex-col items-center justify-center px-2 py-3 border-l border-amber-200/60">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-1">
                        <Icon name="check" className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span className="text-[10px] font-serif font-semibold uppercase tracking-wider text-emerald-700">
                        Checked
                      </span>
                      {h.petugas_name && (
                        <span className="text-[10px] font-serif text-amber-700/70 mt-1 truncate w-full text-center">
                          {h.petugas_name}
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ===== MODAL DETAIL TIKET — dibentuk seperti struk tiket ===== */}
      <AnimatePresence>
        {detailTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setDetailTicket(null)}
          >
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-white rounded-md w-full max-w-sm overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Detail check-in tiket"
            >
              <div className="flex items-start justify-between p-4 flex-shrink-0 bg-amber-800 text-amber-50">
                <div className="min-w-0">
                  <p className="font-serif text-sm font-semibold truncate">
                    {detailTicket.customer_name}
                  </p>
                  <p className="font-mono text-[11px] text-amber-100/70 mt-0.5">
                    {detailTicket.ticket_code}
                  </p>
                </div>
                <button
                  onClick={() => setDetailTicket(null)}
                  aria-label="Tutup detail"
                  className="p-1.5 -mr-1.5 -mt-1.5 text-amber-100 hover:text-white hover:bg-amber-700/60 rounded-md transition-colors"
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 pb-1 pt-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200/60 rounded-md">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                    <Icon name="stamp" className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-[10px] font-serif uppercase tracking-wider text-emerald-700/80">
                      Waktu Check-in
                    </p>
                    <p className="font-serif text-sm font-semibold text-emerald-900">
                      {new Date(detailTicket.checked_in_at).toLocaleString('id-ID', {
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
              </div>

              <div className="relative px-4 pt-4">
                <Perforation orientation="horizontal" holeBg="#ffffff" />
              </div>

              <div className="p-4 pt-5 space-y-3.5 overflow-y-auto flex-1">
                <div className="flex items-start gap-3">
                  <Icon name="mail" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-serif uppercase tracking-wider text-amber-700/60">Email</p>
                    <p className="font-serif text-sm text-amber-950 break-all">{detailTicket.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="phone" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-serif uppercase tracking-wider text-amber-700/60">No. HP</p>
                    <p className="font-serif text-sm text-amber-950">{detailTicket.customer_phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="ticket" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-serif uppercase tracking-wider text-amber-700/60">Kategori</p>
                    <p className="font-serif text-sm text-amber-950">{detailTicket.ticket_category_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="calendar" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-serif uppercase tracking-wider text-amber-700/60">Jadwal Konser</p>
                    <p className="font-serif text-sm text-amber-950">
                      {detailTicket.event_date
                        ? `${formatDate(detailTicket.event_date)}${detailTicket.start_time ? ' · ' + detailTicket.start_time.slice(0, 5) : ''}`
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="pin" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-serif uppercase tracking-wider text-amber-700/60">Venue</p>
                    <p className="font-serif text-sm text-amber-950">
                      {detailTicket.venue_name || '-'}
                      {detailTicket.venue_city ? `, ${detailTicket.venue_city}` : ''}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-dashed border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-serif">
                    <span className="text-amber-700/60">Order ID</span>
                    <span className="font-mono text-amber-950">{detailTicket.order_code}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-serif">
                    <span className="text-amber-700/60">Di-scan oleh</span>
                    <span className="text-amber-950">{detailTicket.petugas_name || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-amber-200/60 flex-shrink-0">
                <button
                  onClick={() => setDetailTicket(null)}
                  className="w-full px-4 py-2.5 text-sm font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}