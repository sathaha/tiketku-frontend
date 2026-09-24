import { useState, useEffect } from 'react';
import CustomCursor from '../components/landing/CustomCursor';
import ParticleBackground from '../components/landing/ParticleBackground';
import HeroTicket3D from '../components/landing/HeroTicket3D';
import StatsSection from '../components/landing/StatsSection';
import ConcertShowcase from '../components/landing/ConcertShowcase';
import TimelineSteps from '../components/landing/TimelineSteps';
import api from '../api/axios';

const DEMO_STATS = [
  { value: '100+', label: 'Konser' },
  { value: '50K+', label: 'Tiket Terjual' },
  { value: '10K+', label: 'Pengguna' },
  { value: '4.9', label: 'Rating' },
];

const DEMO_STEPS = [
  { number: '01', title: 'Pilih Konser', desc: 'Cari dan pilih konser favoritmu' },
  { number: '02', title: 'Beli Tiket', desc: 'Pilih kategori tiket dan bayar' },
  { number: '03', title: 'Dapatkan E-Ticket', desc: 'QR code langsung terbit' },
  { number: '04', title: 'Scan & Masuk', desc: 'Tunjukkan QR di pintu masuk' },
];

export default function Test3D() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [concerts, setConcerts] = useState([]);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    api
      .get('/concerts')
      .then((res) => setConcerts(res.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-ink-950 relative overflow-hidden">
      <CustomCursor />
      <ParticleBackground reducedMotion={reducedMotion} />

      {/* HERO TEST */}
      <section className="relative z-10 min-h-screen flex items-center px-4 py-20">
        <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-6 border border-amber-500/30 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-serif tracking-[0.3em] text-amber-400 uppercase">
                Test 3D Components
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl text-white leading-[0.95] mb-6">
              Test
              <br />
              <span className="text-amber-400 italic">3D Scene.</span>
            </h1>

            <p className="text-amber-200/60 text-base font-serif max-w-md leading-relaxed mb-8">
              Scroll ke bawah untuk test semua section.
            </p>

            <StatsSection stats={DEMO_STATS} />
          </div>

          <HeroTicket3D reducedMotion={reducedMotion} />
        </div>
      </section>

      {/* CONCERT SHOWCASE TEST */}
      {concerts.length > 0 && (
        <ConcertShowcase items={concerts} reducedMotion={reducedMotion} />
      )}

      {/* TIMELINE TEST */}
      <section className="py-24 px-4 relative z-10 bg-[#f5ede4]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <span className="font-serif text-[10px] tracking-[0.4em] text-amber-600/80 uppercase">
              Cara Kerja
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-amber-950 mt-3 leading-tight">
              4 Langkah <span className="italic text-amber-600">Mudah</span>
            </h2>
          </div>
          <TimelineSteps steps={DEMO_STEPS} />
        </div>
      </section>
    </div>
  );
}