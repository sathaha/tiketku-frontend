import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// ===== MINI ICON =====
function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    pin: 'M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1118 0z M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    music:
      'M12 2v8M12 10a3 3 0 100 6 3 3 0 000-6z M12 2l4 1v3l-4-1',
    arrow: 'M13 7l5 5-5 5M6 12h12',
  };
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

// ===== MAIN CARD =====
export default function ConcertCard3D({ item, idx, reducedMotion = false }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotasi card
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 250,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 250,
    damping: 20,
  });

  // Parallax internal poster
  const imageX = useTransform(x, [-0.5, 0.5], ['-3%', '3%']);
  const imageY = useTransform(y, [-0.5, 0.5], ['-3%', '3%']);

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
    <div style={{ perspective: 1200 }} className="flex-shrink-0">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={reducedMotion ? {} : { scale: 1.03, y: -8 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        className="relative"
      >
        <Link
          to={`/concerts/${item.id}`}
          data-cursor="card"
          className="group block flex-shrink-0 w-[78vw] sm:w-[320px] md:w-[380px] aspect-[3/4] rounded-2xl overflow-hidden relative bg-ink-900"
        >
          {/* Poster dengan parallax internal */}
          <motion.div
            style={{
              x: reducedMotion ? 0 : imageX,
              y: reducedMotion ? 0 : imageY,
              scale: 1.1,
            }}
            className="absolute inset-0"
          >
            {item.poster ? (
              <img
                src={item.poster}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-600">
                <Icon name="music" className="w-12 h-12" />
              </div>
            )}
          </motion.div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

          {/* Amber glow saat hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-amber-500/25 via-transparent to-transparent" />

          {/* No urut — depth layer belakang */}
          <div
            className="absolute top-5 left-5 font-serif text-[10px] tracking-[0.3em] text-amber-200/80 uppercase tabular-nums"
            style={{ transform: 'translateZ(20px)' }}
          >
            No. {String(idx + 1).padStart(2, '0')}
          </div>

          {/* Content — depth layer depan */}
          <div
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{ transform: 'translateZ(40px)' }}
          >
            <span className="font-serif text-[9px] tracking-[0.3em] text-amber-400 uppercase">
              {item.category_name || 'Event'}
            </span>

            <h3 className="font-serif text-2xl text-white mt-1 leading-tight line-clamp-2 transition-transform duration-300 group-hover:translate-x-1">
              {item.name}
            </h3>

            <p className="font-serif text-xs text-amber-200/70 mt-1.5 truncate">
              {item.artist}
            </p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-amber-200/25">
              <span className="flex items-center gap-1.5 text-[11px] font-serif text-amber-200/70">
                {item.city && (
                  <>
                    <Icon name="pin" className="w-3 h-3" />
                    {item.city}
                  </>
                )}
              </span>
              {item.min_price && (
                <span className="font-serif text-sm text-amber-400 tabular-nums">
                  Rp {Number(item.min_price).toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}