import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import api from '../../api/axios';
import { formatDate } from '../../components/Ui';

const EASE = [0.22, 1, 0.36, 1];

/* ============================================================
   ICONS
   ============================================================ */
function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
    stop: 'M6 18L18 6M6 6l12 12',
    ticket: 'M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
    check: 'M5 13l4 4L19 7',
    alert: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    volume: 'M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l4 4V6l-4 4z',
    volumeOff: 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',
    voiceOn: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
    voiceOff: 'M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 010-4h.09A1.65 1.65 0 003.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H8a1.65 1.65 0 001-1.51V2a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H22a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
    flashOn: 'M13 2L3 14h7v8l10-12h-7V2z',
    flashOff: 'M13 2L3 14h7v8l10-12h-7V2zM1 1l22 22',
    zoomIn: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zM11 8v6M8 11h6',
    switchCamera: 'M20 5h-3.17L15 3H9L7.17 5H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm-8 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

/* ============================================================
   VIP / SPECIAL CATEGORY THEMES
   ============================================================ */
const CATEGORY_THEMES = {
  vvip: {
    border: 'border-amber-500',
    bg: 'bg-gradient-to-br from-amber-100 to-amber-200/60',
    badge: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
    label: 'VVIP',
    chime: 'vip',
  },
  vip: {
    border: 'border-amber-400',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/60',
    badge: 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950',
    label: 'VIP',
    chime: 'vip',
  },
  press: {
    border: 'border-slate-400',
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100/60',
    badge: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
    label: 'Press',
    chime: 'press',
  },
  media: {
    border: 'border-slate-400',
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100/60',
    badge: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
    label: 'Media',
    chime: 'press',
  },
  backstage: {
    border: 'border-purple-400',
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100/60',
    badge: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
    label: 'Backstage',
    chime: 'vip',
  },
  staff: {
    border: 'border-teal-400',
    bg: 'bg-gradient-to-br from-teal-50 to-teal-100/60',
    badge: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
    label: 'Staff',
    chime: 'default',
  },
};

function getCategoryTheme(categoryName) {
  if (!categoryName) return null;
  const lower = categoryName.toLowerCase();
  if (lower.includes('vvip')) return CATEGORY_THEMES.vvip;
  if (lower.includes('vip')) return CATEGORY_THEMES.vip;
  if (lower.includes('backstage')) return CATEGORY_THEMES.backstage;
  if (lower.includes('press')) return CATEGORY_THEMES.press;
  if (lower.includes('media')) return CATEGORY_THEMES.media;
  if (lower.includes('staff') || lower.includes('crew')) return CATEGORY_THEMES.staff;
  return null;
}

/* ============================================================
   SOUND ENGINE (Web Audio API)
   ============================================================ */
let audioCtx = null;
function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone({ freq, duration, type = 'sine', delay = 0, volume = 0.12, sweepTo = null }) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + duration);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function playSound(kind) {
  switch (kind) {
    case 'scan':
      tone({ freq: 1400, duration: 0.08, type: 'square', volume: 0.08 });
      break;
    case 'success':
      tone({ freq: 880, duration: 0.12, type: 'sine', volume: 0.12 });
      tone({ freq: 1175, duration: 0.18, type: 'sine', volume: 0.12, delay: 0.1 });
      break;
    case 'confirmed':
      tone({ freq: 784, duration: 0.1, type: 'triangle', volume: 0.14 });
      tone({ freq: 988, duration: 0.1, type: 'triangle', volume: 0.14, delay: 0.09 });
      tone({ freq: 1319, duration: 0.22, type: 'triangle', volume: 0.14, delay: 0.18 });
      break;
    case 'vip':
      tone({ freq: 523, duration: 0.15, type: 'triangle', volume: 0.12 });
      tone({ freq: 659, duration: 0.15, type: 'triangle', volume: 0.13, delay: 0.1 });
      tone({ freq: 784, duration: 0.15, type: 'triangle', volume: 0.14, delay: 0.2 });
      tone({ freq: 1046, duration: 0.35, type: 'triangle', volume: 0.15, delay: 0.3 });
      tone({ freq: 130, duration: 0.6, type: 'sine', volume: 0.06, delay: 0.3 });
      break;
    case 'press':
      tone({ freq: 988, duration: 0.12, type: 'sine', volume: 0.12 });
      tone({ freq: 1319, duration: 0.2, type: 'sine', volume: 0.12, delay: 0.12 });
      break;
    case 'warning':
      tone({ freq: 660, duration: 0.12, type: 'square', volume: 0.1 });
      tone({ freq: 660, duration: 0.12, type: 'square', volume: 0.1, delay: 0.16 });
      break;
    case 'error':
      tone({ freq: 320, duration: 0.28, type: 'sawtooth', volume: 0.1, sweepTo: 140 });
      break;
    default: break;
  }
}

function vibrate(kind) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  switch (kind) {
    case 'scan': navigator.vibrate(30); break;
    case 'success': navigator.vibrate([40, 40, 60]); break;
    case 'confirmed': navigator.vibrate([50, 40, 50, 40, 100]); break;
    case 'vip': navigator.vibrate([20, 40, 20, 40, 20, 40, 80]); break;
    case 'press': navigator.vibrate([30, 30, 60]); break;
    case 'warning': navigator.vibrate([80, 60, 80]); break;
    case 'error': navigator.vibrate([120, 60, 120, 60, 120]); break;
    default: break;
  }
}

/* ============================================================
   VOICE
   ============================================================ */
const VOICE_PRESETS = {
  normal: { rate: 1.15, pitch: 1.08, volume: 1.0, sayName: true, sayTime: true },
  fast:   { rate: 1.4,  pitch: 1.10, volume: 1.0, sayName: false, sayTime: false },
  quiet:  { rate: 1.0,  pitch: 1.00, volume: 0.6, sayName: true, sayTime: true },
};

function firstName(fullName) {
  if (!fullName) return 'Guest';
  return String(fullName).trim().split(/\s+/)[0];
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */
function Badge({ status, checkedInAt }) {
  if (status === 'checked_in') {
    return (
      <motion.span
        initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: -3, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-serif tracking-[0.15em] uppercase text-emerald-700 bg-emerald-50/90 border border-dashed border-emerald-400 rounded-full"
        title={checkedInAt ? `Checked in at ${formatDate(checkedInAt)}` : undefined}
      >
        <Icon name="check" className="w-3 h-3" />
        Checked In
      </motion.span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-serif tracking-[0.15em] uppercase text-amber-700 bg-amber-50/80 border border-amber-200/50 rounded-full">
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-1.5 h-1.5 rounded-full bg-amber-500"
      />
      Not Checked In
    </span>
  );
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 border-t border-dashed border-amber-200" />
      <span className="text-xs font-serif italic text-amber-400">{label}</span>
      <div className="flex-1 border-t border-dashed border-amber-200" />
    </div>
  );
}

function TearLine() {
  return (
    <div className="relative border-t border-dashed border-amber-200/70">
      <span className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f5ede4] border border-amber-200/60" />
      <span className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f5ede4] border border-amber-200/60" />
    </div>
  );
}

function SessionPanel({ stats, recentScans }) {
  const total = stats.valid + stats.warning + stats.error;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
      className="bg-white border border-amber-200/60 rounded-md mt-4 overflow-hidden"
    >
      <div className="px-5 pt-4 pb-3 border-b border-dashed border-amber-200/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-serif tracking-[0.25em] uppercase text-amber-700/60">
            Session · Today
          </span>
          <span className="text-[10px] font-serif text-amber-700/50 tabular-nums">
            {total} scans
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-serif tabular-nums">
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {stats.valid} valid
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {stats.warning} dup
          </span>
          <span className="inline-flex items-center gap-1.5 text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {stats.error} err
          </span>
        </div>
      </div>

      {recentScans.length > 0 ? (
        <ul className="divide-y divide-dashed divide-amber-100">
          {recentScans.map((scan, i) => (
            <motion.li
              key={`${scan.code}-${scan.time}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="px-5 py-2.5 flex items-center gap-3 text-xs font-serif"
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  scan.vip
                    ? 'bg-amber-200 text-amber-800'
                    : scan.status === 'valid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : scan.status === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                <Icon name={scan.vip ? 'star' : scan.status === 'valid' ? 'check' : 'alert'} className="w-3 h-3" />
              </span>
              <span className="flex-1 min-w-0 truncate text-amber-900">{scan.name}</span>
              <span className="text-amber-600/60 tabular-nums flex-shrink-0">
                {scan.ago}
              </span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-3 text-xs font-serif text-amber-600/50 italic">
          No scans yet in this session.
        </p>
      )}
    </motion.div>
  );
}

function SuccessBurst({ onDone, variant = 'default' }) {
  const reduce = useReducedMotion();
  const particles = Array.from({ length: variant === 'vip' ? 20 : 14 });
  const isVip = variant === 'vip';
  const bgMain = isVip ? 'bg-amber-500 shadow-amber-500/40' : 'bg-emerald-500 shadow-emerald-500/40';
  const bgFlash = isVip ? 'bg-amber-300' : 'bg-emerald-300';
  const particleColor = isVip ? 'bg-amber-400' : 'bg-emerald-400';

  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 400 : isVip ? 1600 : 1200);
    return () => clearTimeout(t);
  }, [onDone, reduce, isVip]);

  if (reduce) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-24 h-24 rounded-full ${bgMain} flex items-center justify-center shadow-2xl`}
        >
          <Icon name={isVip ? 'star' : 'check'} className="w-12 h-12 text-white" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, isVip ? 0.4 : 0.3, 0] }}
        transition={{ duration: isVip ? 1.2 : 0.9, times: [0, 0.3, 1] }}
        className={`absolute inset-0 ${bgFlash}`}
        aria-hidden="true"
      />
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className={`relative w-28 h-28 rounded-full ${bgMain} flex items-center justify-center shadow-2xl`}
      >
        <svg viewBox="0 0 24 24" className="w-16 h-16 text-white" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          {isVip ? (
            <motion.path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
            />
          ) : (
            <motion.path
              d="M20 6L9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
            />
          )}
        </svg>
      </motion.div>
      {particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 90 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x, y, scale: [0, 1, 0.6], opacity: [1, 1, 0] }}
            transition={{ duration: 0.85, delay: 0.2 + Math.random() * 0.1, ease: 'easeOut' }}
            className={`absolute w-2 h-2 rounded-full ${particleColor}`}
            aria-hidden="true"
          />
        );
      })}
    </motion.div>
  );
}

function ScreenFlash({ color }) {
  const bg =
    color === 'vip' ? 'bg-amber-300'
    : color === 'press' ? 'bg-slate-200'
    : color === 'success' ? 'bg-emerald-400'
    : color === 'warning' ? 'bg-amber-400'
    : 'bg-red-400';
  const isVip = color === 'vip';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, isVip ? 0.28 : 0.18, 0] }}
      transition={{ duration: isVip ? 0.6 : 0.4, times: [0, 0.3, 1] }}
      className={`fixed inset-0 z-[70] pointer-events-none ${bg}`}
      aria-hidden="true"
    />
  );
}

function DuplicateToast({ show, name, minutes }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[75] bg-amber-950 text-amber-50 px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-amber-500/30"
        >
          <Icon name="alert" className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-serif">
            <span className="font-semibold">{name}</span> scanned {minutes}m ago
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   RESULT CARD
   ============================================================ */
function ResultCard({ result, onConfirm, confirming, error, onReset }) {
  const isChecked = !!result.is_checked_in;
  const hasError = !!error;
  const theme = getCategoryTheme(result.ticket_category_name);

  const borderClass = hasError
    ? 'border-red-300/70'
    : isChecked
    ? 'border-emerald-300/70'
    : theme
    ? theme.border
    : 'border-amber-200/60';

  const bgClass = theme && !isChecked && !hasError ? theme.bg : 'bg-white';

  return (
    <motion.div
      key={result.ticket_code + String(result.is_checked_in)}
      initial={{ opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)' }}
      animate={
        hasError
          ? { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', x: [0, -8, 8, -6, 6, -3, 0] }
          : { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }
      }
      exit={{ opacity: 0, y: -12 }}
      transition={
        hasError
          ? { duration: 0.55, ease: EASE, x: { duration: 0.45, ease: 'easeOut', delay: 0.35 } }
          : { duration: 0.6, ease: EASE }
      }
      className={`relative border rounded-md transition-colors ${borderClass} ${bgClass}`}
    >
      {/* VIP Banner */}
      <AnimatePresence>
        {theme && !isChecked && !hasError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${theme.badge} px-4 py-2 flex items-center gap-2 text-xs font-serif tracking-[0.15em] uppercase font-semibold`}
          >
            <Icon name="star" className="w-3.5 h-3.5" />
            {theme.label} Ticket
            <Icon name="star" className="w-3.5 h-3.5 ml-auto" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already checked-in banner */}
      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-50 border-b border-emerald-200/60 px-4 py-2.5 flex items-center gap-2 text-emerald-700 text-xs font-serif"
          >
            <Icon name="check" className="w-3.5 h-3.5" />
            <span>Ticket already checked in</span>
            {result.checked_in_at && (
              <span className="text-emerald-600/70 ml-auto text-[10px]">
                {formatDate(result.checked_in_at)}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 pb-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="font-serif font-bold text-lg text-amber-950 leading-tight">
            {result.concert_name}
          </h2>
          <Badge status={isChecked ? 'checked_in' : 'pending'} checkedInAt={result.checked_in_at} />
        </div>
        <p className="text-[11px] font-mono text-amber-700/60 tracking-wider mb-4">
          {result.ticket_code}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-serif text-amber-800/80 pb-4 mb-4 border-b border-amber-200/60">
          <div className="flex items-center gap-1.5">
            <Icon name="calendar" className="w-3.5 h-3.5 text-amber-500" />
            <span>{result.event_date ? formatDate(result.event_date) : '-'}</span>
            {result.start_time && <span>· {result.start_time.slice(0, 5)}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="location" className="w-3.5 h-3.5 text-amber-500" />
            <span>{result.venue_name || '-'}</span>
          </div>
        </div>

        <dl className="space-y-2.5 text-sm font-serif">
          <div className="flex items-start gap-2.5">
            <Icon name="user" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <dt className="text-xs text-amber-700/60">Customer</dt>
              <dd className="text-amber-950">{result.customer_name}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Icon name="mail" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <dt className="text-xs text-amber-700/60">Email</dt>
              <dd className="text-amber-950 break-all">{result.customer_email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Icon name="phone" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <dt className="text-xs text-amber-700/60">Phone</dt>
              <dd className="text-amber-950">{result.customer_phone || '-'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Icon name="ticket" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <dt className="text-xs text-amber-700/60">Category</dt>
              <dd className="text-amber-950">{result.ticket_category_name}</dd>
            </div>
          </div>
        </dl>
      </div>

      <TearLine />

      <div className="p-6 pt-5">
        <p className="text-xs font-mono text-amber-700/50 text-center tracking-[0.2em] mb-5">
          {result.order_code}
        </p>

        <div className="space-y-2">
          {!isChecked && !hasError && (
            <motion.button
              type="button"
              onClick={onConfirm}
              disabled={confirming}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 rounded-md transition-colors"
            >
              {confirming ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-amber-200/40 border-t-amber-200 rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4" />
                  Confirm Check-in
                </>
              )}
            </motion.button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-serif text-amber-800 hover:bg-amber-50 border border-amber-200/60 rounded-md transition-colors"
          >
            <Icon name="refresh" className="w-4 h-4" />
            Scan Another Ticket
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   MAIN
   ============================================================ */
export default function Scan() {
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  // Camera controls
  const [capabilities, setCapabilities] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [voicePreset, setVoicePreset] = useState('normal');
  const [autoScan, setAutoScan] = useState(false);

  // Effects
  const [showBurst, setShowBurst] = useState(false);
  const [burstVariant, setBurstVariant] = useState('default');
  const [flash, setFlash] = useState(null);

  // Session
  const [stats, setStats] = useState({ valid: 0, warning: 0, error: 0 });
  const [recentScans, setRecentScans] = useState([]);
  const [dupToast, setDupToast] = useState(null);
  const [autoResetIn, setAutoResetIn] = useState(null);

  const html5QrRef = useRef(null);
  const voiceRef = useRef({ supported: false, voice: null });
  const recentCodesRef = useRef(new Map());

  /* ============ INIT VOICE ============ */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(v => /en-US/i.test(v.lang) && /female|samantha|zira|google us/i.test(v.name)) ||
        voices.find(v => /en-US/i.test(v.lang)) ||
        voices[0];
      voiceRef.current = { supported: true, voice: preferred || null };
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* ============ PERSIST SESSION ============ */
  const todayKey = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem(`scan-stats-${todayKey}`);
      if (savedStats) setStats(JSON.parse(savedStats));
      const savedRecent = localStorage.getItem(`scan-recent-${todayKey}`);
      if (savedRecent) {
        const parsed = JSON.parse(savedRecent);
        setRecentScans(parsed);
        parsed.forEach(r => recentCodesRef.current.set(r.code, r.time));
      }
    } catch { /* ignore */ }
  }, [todayKey]);

  useEffect(() => {
    try { localStorage.setItem(`scan-stats-${todayKey}`, JSON.stringify(stats)); } catch {}
  }, [stats, todayKey]);

  useEffect(() => {
    try { localStorage.setItem(`scan-recent-${todayKey}`, JSON.stringify(recentScans)); } catch {}
  }, [recentScans, todayKey]);

  /* ============ CLEANUP ============ */
  useEffect(() => {
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============ AUTO-SCAN RESET ============ */
  useEffect(() => {
    if (!autoScan || !result || error) return undefined;
    setAutoResetIn(3);
    const interval = setInterval(() => {
      setAutoResetIn(prev => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(interval);
          reset();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { clearInterval(interval); setAutoResetIn(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScan, result, error]);

  /* ============ DUP TOAST AUTO-DISMISS ============ */
  useEffect(() => {
    if (!dupToast) return undefined;
    const t = setTimeout(() => setDupToast(null), 3000);
    return () => clearTimeout(t);
  }, [dupToast]);

  /* ============ FLASH AUTO-CLEAR ============ */
  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [flash]);

  /* ============ UPDATE "AGO" ============ */
  useEffect(() => {
    const i = setInterval(() => {
      setRecentScans(prev =>
        prev.map(r => {
          const diff = Math.floor((Date.now() - r.time) / 1000);
          const ago = diff < 60 ? `${diff}s ago` : `${Math.floor(diff / 60)}m ago`;
          return { ...r, ago };
        })
      );
    }, 30000);
    return () => clearInterval(i);
  }, []);

  /* ============ FEEDBACK ============ */
  function feedback(kind, payload = {}) {
    if (soundOn) playSound(kind);
    vibrate(kind);

    if (kind === 'vip') setFlash('vip');
    else if (kind === 'press') setFlash('press');
    else if (kind === 'success' || kind === 'confirmed') setFlash('success');
    else if (kind === 'warning') setFlash('warning');
    else if (kind === 'error') setFlash('error');

    setStats(prev => {
      if (['success', 'confirmed', 'vip', 'press'].includes(kind))
        return { ...prev, valid: prev.valid + 1 };
      if (kind === 'warning') return { ...prev, warning: prev.warning + 1 };
      if (kind === 'error') return { ...prev, error: prev.error + 1 };
      return prev;
    });

    if (voiceOn && payload.voice) speak(payload.voice, { priority: !!payload.priority });

    if (payload.recent) {
      setRecentScans(prev => {
        const entry = { ...payload.recent, time: Date.now(), ago: 'just now' };
        return [entry, ...prev].slice(0, 5);
      });
    }
  }

  function speak(text, { priority = false } = {}) {
    if (!voiceOn || !voiceRef.current.supported) return;
    if (priority) window.speechSynthesis.cancel();
    const preset = VOICE_PRESETS[voicePreset] || VOICE_PRESETS.normal;
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voiceRef.current.voice;
    u.lang = 'en-US';
    u.rate = preset.rate;
    u.pitch = preset.pitch;
    u.volume = preset.volume;
    window.speechSynthesis.speak(u);
  }

  /* ============ SCANNER ============ */
  async function startScanner(cameraId = null) {
    setError('');
    setScannerActive(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = qr;

      let chosenId = cameraId;
      if (cameras.length === 0) {
        try {
          const cams = await Html5Qrcode.getCameras();
          setCameras(cams);
          if (cams.length > 0 && !chosenId) {
            const back = cams.find(c => /back|rear|environment/i.test(c.label));
            chosenId = (back || cams[cams.length - 1]).id;
          }
          setActiveCameraId(chosenId);
        } catch { /* ignore */ }
      } else if (!chosenId) {
        chosenId = activeCameraId;
      }

      const cameraConfig = chosenId
        ? { deviceId: { exact: chosenId } }
        : { facingMode: 'environment' };

      await qr.start(
        cameraConfig,
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (soundOn) playSound('scan');
          vibrate('scan');
          validateCode(decodedText);
          stopScanner();
        },
        () => {}
      );

      setTimeout(() => {
        try {
          const caps = qr.getRunningTrackCapabilities();
          setCapabilities(caps || {});
        } catch {
          setCapabilities({});
        }
      }, 500);
    } catch (err) {
      setError('Could not access the camera. Use the manual code input below.');
      setScannerActive(false);
    }
  }

  function stopScanner() {
    if (html5QrRef.current) {
      html5QrRef.current.stop().then(() => html5QrRef.current.clear()).catch(() => {});
      html5QrRef.current = null;
    }
    setScannerActive(false);
    setCapabilities(null);
    setTorchOn(false);
    setZoom(1);
  }

  async function toggleTorch() {
    if (!html5QrRef.current) return;
    try {
      const next = !torchOn;
      await html5QrRef.current.applyVideoConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch {
      setError('Torch not supported on this device.');
      setTimeout(() => setError(''), 2000);
    }
  }

  async function applyZoom(value) {
    if (!html5QrRef.current) return;
    try {
      await html5QrRef.current.applyVideoConstraints({ advanced: [{ zoom: value }] });
      setZoom(value);
    } catch {
      setError('Zoom not supported on this device.');
      setTimeout(() => setError(''), 2000);
    }
  }

  function switchCamera(camId) {
    stopScanner();
    setTimeout(() => startScanner(camId), 250);
  }

  /* ============ VALIDATE ============ */
  async function validateCode(code) {
    const trimmed = (code || '').trim();
    if (!trimmed) return;

    // Duplicate check
    const lastSeen = recentCodesRef.current.get(trimmed);
    if (lastSeen && Date.now() - lastSeen < 5 * 60 * 1000) {
      const minutes = Math.max(1, Math.floor((Date.now() - lastSeen) / 60000));
      setDupToast({ name: trimmed, minutes });
    }
    recentCodesRef.current.set(trimmed, Date.now());

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/checkin/validate/${encodeURIComponent(trimmed)}`);
      const ticket = res.data.ticket;
      setResult(ticket);

      const theme = getCategoryTheme(ticket.ticket_category_name);
      const preset = VOICE_PRESETS[voicePreset] || VOICE_PRESETS.normal;
      const namePart = preset.sayName ? `${firstName(ticket.customer_name)}. ` : '';

      if (!ticket.is_checked_in) {
        const soundKind = theme?.chime === 'vip' ? 'vip' : theme?.chime === 'press' ? 'press' : 'success';
        feedback(soundKind, {
          voice: theme ? `${namePart}${theme.label}. Welcome.` : `${namePart}Check in.`,
          recent: { code: trimmed, name: ticket.customer_name, status: 'valid', vip: !!theme },
        });
      } else {
        const time = ticket.checked_in_at
          ? new Date(ticket.checked_in_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : 'earlier';
        const timePart = preset.sayTime ? `, ${time}` : '';
        feedback('warning', {
          voice: `${namePart}Already checked in${timePart}.`,
          recent: { code: trimmed, name: ticket.customer_name, status: 'warning', vip: !!theme },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid ticket.');
      feedback('error', {
        voice: 'Invalid ticket.',
        priority: true,
        recent: { code: trimmed, name: 'Invalid', status: 'error' },
      });
      if (err.response?.data?.ticket) setResult(err.response.data.ticket);
    } finally {
      setLoading(false);
    }
  }

  /* ============ CONFIRM ============ */
  async function confirmCheckin() {
    if (!result) return;
    setConfirming(true);
    try {
      await api.post(`/checkin/confirm/${encodeURIComponent(result.ticket_code)}`);
      const updated = { ...result, is_checked_in: true, checked_in_at: new Date().toISOString() };
      setResult(updated);
      setError('');

      const theme = getCategoryTheme(result.ticket_category_name);
      setBurstVariant(theme ? 'vip' : 'default');
      setShowBurst(true);

      const preset = VOICE_PRESETS[voicePreset] || VOICE_PRESETS.normal;
      const namePart = preset.sayName ? `${firstName(result.customer_name)}. ` : '';
      if (soundOn) playSound('confirmed');
      vibrate('confirmed');
      if (voiceOn) speak(`${namePart}Welcome.`, { priority: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in.');
      if (soundOn) playSound('error');
      vibrate('error');
    } finally {
      setConfirming(false);
    }
  }

  function reset() {
    setResult(null);
    setError('');
    setManualCode('');
    setAutoResetIn(null);
  }

  /* ============ RENDER ============ */
  return (
    <div className="min-h-screen bg-[#f5ede4] py-10 px-4">
      <style>{`
        @keyframes scanBeam {
          0%   { transform: translateY(0);    opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .scan-beam { animation: scanBeam 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
        @media (prefers-reduced-motion: reduce) { .scan-beam { animation: none; } }
      `}</style>

      <AnimatePresence>
        {showBurst && (
          <SuccessBurst variant={burstVariant} onDone={() => setShowBurst(false)} />
        )}
      </AnimatePresence>

      {flash && <ScreenFlash color={flash} />}

      <DuplicateToast show={!!dupToast} name={dupToast?.name} minutes={dupToast?.minutes} />

      <div className="max-w-md mx-auto">

        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-6 flex items-center gap-3 relative"
        >
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }}
            className="w-11 h-11 flex-shrink-0 rounded-full bg-amber-800 flex items-center justify-center text-amber-50"
          >
            <Icon name="ticket" className="w-5 h-5" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl font-bold text-amber-950 leading-tight">
              Scan Ticket
            </h1>
            <p className="text-sm font-serif text-amber-700/60">
              Validate a QR code or enter the ticket code
            </p>
          </div>

          {/* Settings button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(o => !o)}
            aria-expanded={settingsOpen}
            aria-haspopup="true"
            aria-label="Scanner settings"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 border ${
              settingsOpen
                ? 'bg-amber-800 text-amber-50 border-amber-800'
                : 'bg-white border-amber-200/60 text-amber-800 hover:border-amber-400'
            }`}
          >
            <Icon name="settings" className="w-4 h-4" />
          </button>

          {/* Settings popover */}
          <AnimatePresence>
            {settingsOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setSettingsOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute right-0 top-full mt-2 w-64 z-40 bg-white border border-amber-200/60 rounded-xl shadow-xl shadow-amber-950/10 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-dashed border-amber-200/60">
                    <span className="text-[10px] font-serif tracking-[0.25em] uppercase text-amber-700/60">
                      Scanner Settings
                    </span>
                  </div>

                  <div className="p-2">
                    {/* Sound */}
                    <button
                      type="button"
                      onClick={() => setSoundOn(s => !s)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <span className="flex items-center gap-2.5 text-sm font-serif text-amber-900">
                        <Icon name={soundOn ? 'volume' : 'volumeOff'} className="w-4 h-4 text-amber-600" />
                        Sound
                      </span>
                      <span
                        className={`text-[10px] font-serif tracking-wider px-2 py-0.5 rounded-full ${
                          soundOn ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {soundOn ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    {/* Voice */}
                    <button
                      type="button"
                      onClick={() => setVoiceOn(v => !v)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <span className="flex items-center gap-2.5 text-sm font-serif text-amber-900">
                        <Icon name={voiceOn ? 'voiceOn' : 'voiceOff'} className="w-4 h-4 text-amber-600" />
                        Voice
                      </span>
                      <span
                        className={`text-[10px] font-serif tracking-wider px-2 py-0.5 rounded-full ${
                          voiceOn ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {voiceOn ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    {/* Voice preset */}
                    {voiceOn && (
                      <div className="px-3 pt-1 pb-2">
                        <span className="block text-[10px] font-serif tracking-[0.2em] uppercase text-amber-700/50 mb-1.5 ml-1">
                          Voice speed
                        </span>
                        <div className="inline-flex w-full rounded-lg bg-amber-50 border border-amber-200/60 overflow-hidden">
                          {['normal', 'fast', 'quiet'].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setVoicePreset(p)}
                              className={`flex-1 px-2 py-1.5 text-[10px] font-serif uppercase tracking-wider transition-colors ${
                                voicePreset === p
                                  ? 'bg-amber-800 text-amber-50'
                                  : 'text-amber-700/70 hover:text-amber-900'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auto-scan */}
                    <button
                      type="button"
                      onClick={() => setAutoScan(a => !a)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <span className="flex items-center gap-2.5 text-sm font-serif text-amber-900">
                        <Icon name="refresh" className="w-4 h-4 text-amber-600" />
                        Auto-scan
                      </span>
                      <span
                        className={`text-[10px] font-serif tracking-wider px-2 py-0.5 rounded-full ${
                          autoScan ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {autoScan ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== SCANNER CARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
          className="bg-white border border-amber-200/60 rounded-md mb-4"
        >
          <div className="p-6">
            {!scannerActive ? (
              <button
                type="button"
                onClick={() => startScanner()}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 rounded-md transition-colors"
              >
                <Icon name="camera" className="w-5 h-5" />
                Open Camera &amp; Scan QR
              </button>
            ) : (
              <div>
                <div className="relative rounded-md overflow-hidden border border-amber-200/60 bg-amber-50/50">
                  <div id="qr-reader" />
                  <div className="pointer-events-none absolute inset-5">
                    <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
                    <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
                    <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
                    <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400" />
                  </div>
                  <div className="pointer-events-none absolute inset-x-5 top-5 bottom-5 overflow-hidden">
                    <div className="scan-beam h-0.5 w-full bg-amber-400/80" />
                  </div>
                </div>

                {/* Camera controls */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {capabilities?.torch && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-serif border transition-colors ${
                        torchOn
                          ? 'bg-amber-700 text-amber-50 border-amber-700'
                          : 'bg-white text-amber-800 border-amber-200/60 hover:border-amber-400'
                      }`}
                    >
                      <Icon name={torchOn ? 'flashOn' : 'flashOff'} className="w-4 h-4" />
                      {torchOn ? 'Torch On' : 'Torch'}
                    </button>
                  )}

                  {capabilities?.zoom && (
                    <div className="flex items-center gap-2 bg-white border border-amber-200/60 rounded-md px-3 py-2 flex-1 min-w-[160px]">
                      <Icon name="zoomIn" className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <input
                        type="range"
                        min={capabilities.zoom.min || 1}
                        max={capabilities.zoom.max || 4}
                        step={capabilities.zoom.step || 0.1}
                        value={zoom}
                        onChange={(e) => applyZoom(parseFloat(e.target.value))}
                        className="flex-1 accent-amber-700"
                        aria-label="Zoom"
                      />
                      <span className="text-xs font-mono text-amber-700 tabular-nums w-10 text-right">
                        {Number(zoom).toFixed(1)}×
                      </span>
                    </div>
                  )}

                  {cameras.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = cameras.findIndex(c => c.id === activeCameraId);
                        const next = cameras[(idx + 1) % cameras.length];
                        switchCamera(next.id);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-serif bg-white text-amber-800 border border-amber-200/60 hover:border-amber-400 transition-colors"
                      aria-label="Switch camera"
                    >
                      <Icon name="switchCamera" className="w-4 h-4" />
                      Switch
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={stopScanner}
                  className="w-full flex items-center justify-center gap-2 mt-3 px-4 py-2.5 text-sm font-serif text-amber-800 hover:bg-amber-50 border border-amber-200/60 rounded-md transition-colors"
                >
                  <Icon name="stop" className="w-4 h-4" />
                  Stop Camera
                </button>
              </div>
            )}

            <Divider label="or" />

            <label htmlFor="ticket-code" className="block text-xs font-serif text-amber-800 mb-2">
              Ticket Code
            </label>
            <div className="flex gap-2">
              <input
                id="ticket-code"
                className="flex-1 px-3.5 py-2.5 text-sm font-mono text-amber-950 bg-white border border-amber-200/60 rounded-md placeholder:text-amber-400/60 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="TKT-XXXXXXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && validateCode(manualCode)}
              />
              <button
                type="button"
                onClick={() => validateCode(manualCode)}
                disabled={loading || !manualCode.trim()}
                className="px-5 py-2.5 text-sm font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap"
              >
                {loading ? 'Checking...' : 'Check Ticket'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ===== AUTO-RESET COUNTDOWN ===== */}
        <AnimatePresence>
          {autoResetIn !== null && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-amber-50 border border-amber-200/60 rounded-md px-4 py-2.5 mb-4 flex items-center justify-between text-xs font-serif text-amber-800"
            >
              <span className="flex items-center gap-2">
                <Icon name="clock" className="w-3.5 h-3.5 text-amber-500" />
                Auto-reset in {autoResetIn}s…
              </span>
              <button
                type="button"
                onClick={() => setAutoResetIn(null)}
                className="text-amber-600 hover:text-amber-900 underline"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== ERROR BANNER ===== */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto', x: [0, -8, 8, -6, 6, -3, 0] }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ x: { duration: 0.45, ease: 'easeOut' } }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-serif rounded-md px-4 py-3 mb-4 overflow-hidden"
            >
              <Icon name="alert" className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== LOADING ===== */}
        <AnimatePresence>
          {loading && !result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white border border-amber-200/60 rounded-md p-5 flex items-center justify-center gap-3 text-amber-800 font-serif text-sm"
            >
              <span className="inline-block w-4 h-4 border-2 border-amber-200/40 border-t-amber-600 rounded-full animate-spin" />
              Checking ticket…
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== RESULT ===== */}
        <AnimatePresence mode="wait">
          {result && (
            <ResultCard
              key={result.ticket_code + String(result.is_checked_in)}
              result={result}
              onConfirm={confirmCheckin}
              confirming={confirming}
              error={error}
              onReset={reset}
            />
          )}
        </AnimatePresence>

        {/* ===== SESSION PANEL ===== */}
        <SessionPanel stats={stats} recentScans={recentScans} />
      </div>
    </div>
  );
}