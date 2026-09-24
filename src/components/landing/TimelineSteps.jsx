import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// ===== SINGLE STEP =====
function StepItem({ step, idx }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <li ref={ref} className="relative pt-6">
      {/* Garis horizontal kecil di atas tiap step */}
      <motion.span
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{
          duration: 0.8,
          delay: idx * 0.15,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute top-0 left-0 right-0 h-px bg-amber-800 origin-left"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.7,
          delay: idx * 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span className="font-serif text-6xl text-amber-800/25 leading-none tabular-nums">
          {step.number}
        </span>
        <h3 className="font-serif text-xl text-amber-950 mt-4 mb-2">
          {step.title}
        </h3>
        <p className="font-serif text-sm text-amber-800/70 leading-relaxed">
          {step.desc}
        </p>
      </motion.div>
    </li>
  );
}

// ===== MAIN =====
export default function TimelineSteps({ steps = [] }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 40%'],
  });
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={ref} className="relative">
      {/* Progress line — hanya desktop */}
      <div className="hidden md:block absolute top-[3.25rem] left-0 right-0 h-px bg-amber-900/20 z-10">
        <motion.div
          style={{ width: progress }}
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
        />
      </div>

      <ol className="grid md:grid-cols-4 gap-x-8 gap-y-10">
        {steps.map((step, idx) => (
          <StepItem key={idx} step={step} idx={idx} />
        ))}
      </ol>
    </div>
  );
}