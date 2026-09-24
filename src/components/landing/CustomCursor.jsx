import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Ring: lebih lambat → efek "lag" yang elegan
  const ringX = useSpring(x, { stiffness: 150, damping: 22, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 150, damping: 22, mass: 0.6 });

  // Dot: cepat
  const dotX = useSpring(x, { stiffness: 900, damping: 50 });
  const dotY = useSpring(y, { stiffness: 900, damping: 50 });

  useEffect(() => {
    const checkEnv = () => {
      setIsDesktop(window.matchMedia('(pointer: fine)').matches);
      setReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };
    checkEnv();

    const mq = window.matchMedia('(pointer: fine)');
    mq.addEventListener?.('change', checkEnv);
    return () => mq.removeEventListener?.('change', checkEnv);
  }, []);

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;

    const handleMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);

      const el = e.target;
      const isBtn = el.closest('a, button, [role="button"]');
      const isCard = el.closest('[data-cursor="card"]');

      setIsPointer(!!isBtn);
      setIsHoveringCard(!!isCard && !isBtn);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [isDesktop, reducedMotion, x, y]);

  if (!isDesktop || reducedMotion) return null;

  return (
    <>
      {/* Outer ring — lag smooth */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{ x: ringX, y: ringY }}
      >
        <motion.div
          animate={{
            width: isPointer ? 56 : isHoveringCard ? 48 : 32,
            height: isPointer ? 56 : isHoveringCard ? 48 : 32,
            opacity: isPointer ? 0.9 : isHoveringCard ? 0.8 : 0.5,
            borderColor: isPointer
              ? 'rgba(251, 191, 36, 0.9)'
              : isHoveringCard
              ? 'rgba(251, 191, 36, 0.7)'
              : 'rgba(251, 191, 36, 0.4)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{ x: dotX, y: dotY }}
      >
        <motion.div
          animate={{
            width: isPointer ? 10 : isHoveringCard ? 8 : 6,
            height: isPointer ? 10 : isHoveringCard ? 8 : 6,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400"
          style={{
            boxShadow: '0 0 12px rgba(251, 191, 36, 0.8)',
          }}
        />
      </motion.div>
    </>
  );
}