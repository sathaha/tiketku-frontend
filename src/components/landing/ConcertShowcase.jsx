import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import ConcertCard3D from './ConcertCard3D';

// ===== MINI ICON =====
function Icon({ name, className = 'w-5 h-5' }) {
  const paths = { arrow: 'M13 7l5 5-5 5M6 12h12' };
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={paths[name]}
      />
    </svg>
  );
}

// ===== MAIN =====
export default function ConcertShowcase({ items = [], reducedMotion = false }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Ukur lebar track untuk hitung jarak geser
  useLayoutEffect(() => {
    if (!trackRef.current || !items.length) return;

    const measure = () => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      setDistance(Math.max(0, trackWidth - viewportWidth));
    };

    measure();
    const t1 = setTimeout(measure, 200);
    const t2 = setTimeout(measure, 800);

    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', measure);
    };
  }, [items]);

  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (!items.length) return null;

  // Tinggi section = viewport + distance + buffer
  const LOCK_BUFFER = 400;
  const sectionHeightPx =
    typeof window !== 'undefined'
      ? window.innerHeight + distance + LOCK_BUFFER
      : 0;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#f5ede4]"
      style={{ height: sectionHeightPx ? `${sectionHeightPx}px` : '200vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 mb-8 w-full flex items-end justify-between gap-6">
          <div>
            <span className="font-serif text-[10px] tracking-[0.4em] text-amber-600/80 uppercase">
              Featured Events
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-amber-950 mt-2 leading-tight">
              Pilihan{' '}
              <span className="italic text-amber-600">Minggu Ini</span>
            </h2>
          </div>
          <Link
            to="/concerts"
            className="hidden sm:inline-flex items-center gap-2 font-serif text-xs tracking-[0.2em] uppercase text-amber-800 hover:text-amber-600 transition-colors"
          >
            Semua konser <Icon name="arrow" className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal track */}
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-5 px-4 md:px-[max(1rem,calc((100vw-1280px)/2+1rem))] will-change-transform w-max"
        >
          {items.map((item, idx) => (
            <ConcertCard3D
              key={item.id || idx}
              item={item}
              idx={idx}
              reducedMotion={reducedMotion}
            />
          ))}
          <div className="flex-shrink-0 w-4" />
        </motion.div>

        {/* Progress bar */}
        <div className="max-w-7xl mx-auto px-4 mt-8 w-full">
          <div className="h-px bg-amber-900/20 relative">
            <motion.div
              style={{ width: progress }}
              className="absolute top-0 left-0 h-full bg-amber-700"
            />
          </div>
          <div className="flex justify-between mt-3">
            <span className="font-serif text-[10px] tracking-[0.3em] text-amber-600/70 uppercase">
              Scroll untuk menjelajah
            </span>
            <span className="font-serif text-[10px] tracking-[0.3em] text-amber-600/70 uppercase">
              {items.length} events
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}