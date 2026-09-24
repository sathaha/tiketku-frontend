import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const BARS = Array.from({ length: 44 }, (_, i) => ({
  w: ((i * 7 + 3) % 4) + 1,
  h: i % 5 === 0 ? 100 : 78,
}));

function Field({ label, value, bold, z = 20 }) {
  return (
    <div style={{ transform: `translateZ(${z}px)` }}>
      <p className="font-serif text-[9px] tracking-[0.25em] text-amber-500/70 uppercase mb-1">
        {label}
      </p>
      <p
        className={`font-serif text-sm text-amber-900 ${
          bold ? 'font-bold' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function HeroTicket3D({ reducedMotion = false }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
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
    <motion.div
      className="w-full max-w-sm mx-auto"
      style={{ perspective: 1400 }}
      animate={reducedMotion ? {} : { y: [0, -12, 0] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className="-rotate-3">
        <motion.div
          ref={ref}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="relative"
        >
          {/* Glow belakang — depth layer negatif */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              transform: 'translateZ(-40px)',
              background:
                'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.45), transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Base ticket */}
          <motion.div
            style={{ transform: 'translateZ(0px)' }}
            whileHover={reducedMotion ? {} : { scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative bg-[#faf6ef] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header + Title + Fields */}
            <div className="px-7 pt-6 pb-7">
              <div className="flex items-center justify-between pb-4 border-b border-amber-300/60">
                <span className="font-serif text-[10px] tracking-[0.35em] text-amber-600/80 uppercase">
                  Admission
                </span>
                <span className="font-serif text-[10px] tracking-[0.35em] text-amber-600/80 uppercase">
                  No. 0042
                </span>
              </div>

              <p
                className="font-serif text-[10px] tracking-[0.3em] text-amber-500/70 uppercase mt-6 mb-2"
                style={{ transform: 'translateZ(15px)' }}
              >
                Live Concert
              </p>
              <h3
                className="font-serif text-4xl text-amber-900 leading-[1.02]"
                style={{ transform: 'translateZ(30px)' }}
              >
                Midnight
                <br />
                <span className="italic text-amber-600">Sessions.</span>
              </h3>

              <div className="grid grid-cols-2 gap-x-4 gap-y-5 mt-8">
                <Field label="Date" value="14 Mar 2026" z={25} />
                <Field label="Gate" value="A-12" z={25} />
                <Field label="Seat" value="VIP 03" z={25} />
                <Field label="Price" value="Rp 850K" bold z={35} />
              </div>
            </div>

            {/* Tear line */}
            <div className="relative border-t-2 border-dashed border-amber-300/70">
              <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-ink-950" />
              <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-ink-950" />
            </div>

            {/* Barcode stub */}
            <div className="px-7 py-5 bg-amber-100/40">
              <div className="flex items-end gap-[2px] h-11">
                {BARS.map((b, i) => (
                  <div
                    key={i}
                    className="bg-amber-900/85"
                    style={{ width: `${b.w}px`, height: `${b.h}%` }}
                  />
                ))}
              </div>
              <p className="font-serif text-[9px] tracking-[0.35em] text-amber-600/70 uppercase mt-3">
                Scan di pintu masuk
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}