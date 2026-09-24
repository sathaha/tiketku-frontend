import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// ===== HOOK: count-up =====
function useCountUp(target, inView, duration = 1800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const numeric = parseFloat(String(target).replace(/[^\d.]/g, '')) || 0;
    const start = performance.now();

    let raf;
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(numeric * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setValue(numeric);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, inView, duration]);

  return value;
}

// ===== SINGLE STAT =====
function StatItem({ stat, idx, inView }) {
  const numeric = useCountUp(stat.value, inView);
  const suffix = String(stat.value).replace(/[\d.]/g, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: idx * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={idx > 0 ? 'sm:pl-6 sm:border-l sm:border-amber-500/15' : ''}
    >
      <dd className="font-serif text-3xl md:text-4xl text-amber-400 tabular-nums">
        {numeric}
        {suffix}
      </dd>
      <dt className="font-serif text-[10px] tracking-[0.2em] text-amber-200/50 uppercase mt-1">
        {stat.label}
      </dt>
    </motion.div>
  );
}

// ===== MAIN =====
export default function StatsSection({ stats = [] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <dl
      ref={ref}
      className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 mt-14 pt-8 border-t border-amber-500/15"
    >
      {stats.map((stat, idx) => (
        <StatItem key={idx} stat={stat} idx={idx} inView={inView} />
      ))}
    </dl>
  );
}