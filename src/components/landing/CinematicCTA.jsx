import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

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
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

export default function CinematicCTA({ ctaTo = '/register', isLoggedIn = false, reducedMotion = false }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Parallax ringan untuk konten
  const px = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });
  const py = useSpring(useTransform(y, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMove = (e) => {
    if (reducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="pb-24 px-4 relative z-10">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-5xl mx-auto bg-ink-950 rounded-2xl overflow-hidden"
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fbbf24 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Amber glow bergerak */}
        <motion.div
          style={{ x: px, y: py }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-amber-500/20 blur-3xl pointer-events-none"
        />

        {/* Floating ticket fragments */}
        {!reducedMotion && (
          <>
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 right-12 w-16 h-10 rounded-md bg-amber-500/10 border border-amber-400/20 pointer-events-none"
            />
            <motion.div
              animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute bottom-10 left-10 w-12 h-8 rounded-md bg-amber-500/10 border border-amber-400/20 pointer-events-none"
            />
          </>
        )}

        {/* Tear notches */}
        <span className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f5ede4]" />
        <span className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f5ede4]" />

        <div className="relative grid md:grid-cols-[1fr_auto] items-stretch">
          {/* Left: text */}
          <div className="p-10 md:p-14">
            <span className="font-serif text-[10px] tracking-[0.4em] text-amber-400/80 uppercase">
              Admit one
            </span>
            <h2 className="font-serif text-4xl md:text-6xl text-white mt-4 leading-[1.02]">
              Siap Nonton
              <br />
              <span className="italic text-amber-400">Konser?</span>
            </h2>
            <p className="font-serif text-amber-200/60 mt-5 max-w-sm leading-relaxed">
              Daftar sekarang dan dapatkan akses ke konser-konser terbaik di
              kotamu.
            </p>
          </div>

          {/* Right: button */}
          <div className="md:border-l-2 md:border-dashed md:border-amber-500/25 border-t-2 border-dashed border-amber-500/25 md:border-t-0 p-10 md:p-14 flex items-center justify-center">
            <Link
              to={ctaTo}
              data-cursor="card"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif text-sm tracking-[0.2em] uppercase rounded-full shadow-lg shadow-amber-900/40 transition-colors overflow-hidden"
            >
              {/* Shine sweep */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">
                {isLoggedIn ? 'Jelajahi Sekarang' : 'Daftar Gratis'}
              </span>
              <Icon
                name="arrow"
                className="relative w-4 h-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}