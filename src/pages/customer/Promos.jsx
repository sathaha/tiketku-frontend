import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { Loading, EmptyState, formatDate, formatRupiah } from '../../components/Ui';

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    sparkle: 'M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z',
    copy: 'M8 4v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H10a2 2 0 00-2 2zM16 18v2a2 2 0 01-2 2H4a2 2 0 01-2-2V10a2 2 0 012-2h2',
    check: 'M20 6L9 17l-5-5',
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z',
    arrow: 'M13 7l5 5-5 5M6 12h12',
    tag: 'M20.59 13.41L11 3.83A2 2 0 009.59 3.24H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.58 9.59a2 2 0 002.83 0l4.59-4.6a2 2 0 000-2.82zM7 8h.01',
    flame: 'M12 2c1 3-2 4-2 7a2 2 0 004 0c1 1 2 2.5 2 4.5A6 6 0 016 13.5C6 9 9 6 12 2z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

const steps = [
  'Pilih event yang ingin kamu tonton',
  'Di halaman Checkout, klik "Have a promo code?"',
  'Paste kode promo di atas, klik Apply',
  'Diskon otomatis terpotong dari total pembayaran',
];

export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    api.get('/promos/active')
      .then((res) => setPromos(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function copyCode(code) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
      });
    }
  }

  function formatDiscount(p) {
    if (p.discount_type === 'percentage') {
      return `${p.discount_value}%`;
    }
    return formatRupiah(p.discount_value);
  }

  return (
    <div className="min-h-screen bg-[#f5ede4]">

      {/* HERO */}
      <div className="relative bg-ink-950 overflow-hidden">
        {/* dot-grid texture instead of stock photo */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-amber-400/5 blur-3xl" />
        <Icon
          name="tag"
          className="absolute -right-8 -bottom-12 w-72 h-72 text-amber-500/[0.06] hidden md:block rotate-[-8deg]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-3 py-1 mb-4">
              <Icon name="sparkle" className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-serif tracking-[0.3em] text-amber-400 uppercase">
                Promo & Voucher
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
              Hemat lebih banyak
              <br />
              <span className="text-amber-400 italic">untuk setiap tiket.</span>
            </h1>

            <p className="text-amber-200/60 text-sm md:text-base font-serif mt-3 max-w-lg">
              Kumpulan promo aktif dengan diskon spesial. Sobek, salin kodenya, pakai saat checkout.
            </p>

            {!loading && promos.length > 0 && (
              <div className="flex items-center gap-2 mt-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-serif text-amber-300/70">
                  {promos.length} promo sedang aktif
                </span>
              </div>
            )}
          </motion.div>
        </div>

        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-t-2 border-amber-500/10" />
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <Loading />
        ) : promos.length === 0 ? (
          <EmptyState text="Belum ada promo aktif saat ini. Cek lagi nanti ya!" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promos.map((p, i) => {
              const isCopied = copiedCode === p.code;
              const sisa = p.quota - p.used;
              const usagePercentage = Math.min(
                Math.round(((p.used || 0) / p.quota) * 100),
                100
              );
              const almostGone = usagePercentage >= 80;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  whileHover={{ y: -3 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  className="relative"
                >
                  {almostGone && (
                    <div className="absolute -top-2.5 left-6 z-10 flex items-center gap-1 bg-orange-500 text-white text-[9px] font-serif tracking-[0.15em] uppercase px-2.5 py-1 rounded-full shadow-sm">
                      <Icon name="flame" className="w-3 h-3" />
                      Hampir habis
                    </div>
                  )}

                  <div className="bg-white/90 border-2 border-amber-200/50 rounded-sm overflow-hidden shadow-sm hover:shadow-xl hover:shadow-amber-900/10 transition-shadow">
                    <div className="flex flex-col sm:flex-row">

                      {/* MAIN INFO */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="font-serif text-[9px] tracking-[0.3em] text-amber-600/60 uppercase">
                              Diskon spesial
                            </span>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="font-serif text-3xl md:text-4xl text-amber-800 font-bold">
                                {formatDiscount(p)}
                              </span>
                              <span className="text-sm font-serif text-amber-600/70">OFF</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Icon name="tag" className="w-4.5 h-4.5 text-amber-700" />
                          </div>
                        </div>

                        {p.description && (
                          <p className="font-serif text-sm text-amber-800/70 mb-4">
                            {p.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-serif text-amber-700/60 mb-3">
                          <span className="flex items-center gap-1">
                            <Icon name="calendar" className="w-3 h-3" />
                            s/d {formatDate(p.valid_until)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="users" className="w-3 h-3" />
                            Sisa {sisa} kuota
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 bg-amber-200/40 rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                almostGone ? 'bg-orange-500' : 'bg-amber-600'
                              }`}
                              style={{ width: `${usagePercentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-serif text-amber-600/60 tabular-nums">
                            {usagePercentage}%
                          </span>
                        </div>

                        <Link
                          to="/"
                          className="inline-flex items-center gap-2 text-sm font-serif text-amber-700 hover:text-amber-900 transition-colors group/link"
                        >
                          Pakai promo sekarang
                          <Icon name="arrow" className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                      {/* PERFORATED DIVIDER — horizontal (mobile) */}
                      <div className="relative sm:hidden mx-6">
                        <div className="border-t-2 border-dashed border-amber-300/60" />
                        <span className="absolute -left-3 -top-[7px] w-3.5 h-3.5 rounded-full bg-[#f5ede4]" />
                        <span className="absolute -right-3 -top-[7px] w-3.5 h-3.5 rounded-full bg-[#f5ede4]" />
                      </div>

                      {/* PERFORATED DIVIDER — vertical (desktop) */}
                      <div className="relative hidden sm:block">
                        <div className="h-full border-l-2 border-dashed border-amber-300/60" />
                        <span className="absolute -top-3 -left-[7px] w-3.5 h-3.5 rounded-full bg-[#f5ede4]" />
                        <span className="absolute -bottom-3 -left-[7px] w-3.5 h-3.5 rounded-full bg-[#f5ede4]" />
                      </div>

                      {/* STUB — the code */}
                      <div className="sm:w-40 flex flex-row sm:flex-col items-center justify-center gap-3 p-5 bg-amber-50/50">
                        <div className="text-center">
                          <div className="text-[9px] font-serif tracking-[0.2em] text-amber-600/60 uppercase mb-0.5">
                            Kode
                          </div>
                          <span className="font-mono font-bold text-base text-amber-900 tracking-wider">
                            {p.code}
                          </span>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => copyCode(p.code)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-serif transition-colors whitespace-nowrap ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-800 text-amber-50 hover:bg-amber-700'
                          }`}
                        >
                          <Icon name={isCopied ? 'check' : 'copy'} className="w-3.5 h-3.5" />
                          {isCopied ? 'Copied!' : 'Copy'}
                        </motion.button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info box */}
        <div className="mt-10 bg-white/60 border border-amber-200/40 rounded-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Icon name="sparkle" className="w-4 h-4 text-amber-700" />
            </div>
            <h3 className="font-serif text-amber-900 font-semibold">
              Cara pakai kode promo
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-800 text-amber-50 text-[10px] font-serif flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm font-serif text-amber-700/70">{step}</p>
              </div>
            ))}
          </div>

          <p className="text-xs font-serif text-amber-600/60 mt-4 italic">
            * Pembayaran bisa via GoPay, OVO, Dana, ShopeePay, QRIS, Virtual Account, dan kartu kredit.
          </p>
        </div>
      </div>
    </div>
  );
}