import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import api from '../../api/axios';
import { formatDate } from '../../components/Ui';

const EASE = [0.22, 1, 0.36, 1];
const DUP_WINDOW_MS = 5 * 60 * 1000;
const MAX_RECENT = 6;
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';

/* ============================================================
   ICONS
   ============================================================ */
const ICON_PATHS = {
  camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
  stop: 'M6 18L18 6M6 6l12 12',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
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

function Icon({ name, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
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

const VIBRATION = {
  scan: 30,
  success: [40, 40, 60],
  confirmed: [50, 40, 50, 40, 100],
  vip: [20, 40, 20, 40, 20, 40, 80],
  press: [30, 30, 60],
  warning: [80, 60, 80],
  error: [120, 60, 120, 60, 120],
};

function vibrate(kind) {
  if (typeof navigator === 'undefined' || !navigator.vibrate || !VIBRATION[kind]) return;
  navigator.vibrate(VIBRATION[kind]);
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
   HELPERS
   ============================================================ */
function localDateKey() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function agoLabel(time) {
  const diff = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (diff < 10) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */
function Toggle({ checked, onChange, icon, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 transition-colors ${FOCUS}`}
    >
      <span className="flex items-center gap-2.5 text-sm font-serif text-amber-900">
        <Icon name={icon} className="w-4 h-4 text-amber-600" />
        {label}
      </span>
      <span
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-gray-200'}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </span>
    </button>
  );
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-5" role="separator">
      <div className="flex-1 border-t border-dashed border-amber-200" />
      <span className="text-xs font-serif italic text-amber-400">{label}</span>
      <div className="flex-1 border-t border-dashed border-amber-200" />
    </div>
  );
}

function TearLine() {
  return (
    <div className="relative border-t border-dashed border-amber-200/70" aria-hidden="true">
      <span className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f5ede4] border border-amber-200/60" />
      <span className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f5ede4] border border-amber-200/60" />
    </div>
  );
}

function ViewfinderCorners({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-sm" />
      <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-sm" />
      <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-sm" />
      <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-sm" />
    </div>
  );
}

const STATUS_STYLE = {
  valid:   { dot: 'bg-emerald-100 text-emerald-700', icon: 'check', text: 'Valid' },
  warning: { dot: 'bg-amber-100 text-amber-700',     icon: 'alert', text: 'Duplicate' },
  error:   { dot: 'bg-red-100 text-red-600',         icon: 'alert', text: 'Invalid' },
};

function SessionPanel({ stats, recentScans }) {
  const total = stats.valid + stats.warning + stats.error;
  const cells = [
    { label: 'Valid', value: stats.valid, color: 'text-emerald-700' },
    { label: 'Duplicate', value: stats.warning, color: 'text-amber-700' },
    { label: 'Invalid', value: stats.error, color: 'text-red-600' },
  ];

  return (
    <section
      aria-label="Scan session"
      className="bg-white border border-amber-200/60 rounded-md mt-4 overflow-hidden"
    >
      <div className="px-5 pt-4 pb-4 border-b border-dashed border-amber-200/60">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-serif font-semibold text-amber-950">Today&apos;s scans</h3>
          <span className="text-xs font-serif text-amber-700/60 tabular-nums">{total} total</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {cells.map(c => (
            <div key={c.label} className="rounded-md bg-[#f5ede4]/60 px-3 py-2">
              <div className={`text-xl font-serif font-bold tabular-nums leading-none ${c.color}`}>{c.value}</div>
              <div className="text-[11px] font-serif text-amber-700/70 mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {recentScans.length > 0 ? (
        <ul className="divide-y divide-dashed divide-amber-100">
          {recentScans.map((scan) => {
            const s = STATUS_STYLE[scan.status] || STATUS_STYLE.error;
            return (
              <li key={`${scan.code}-${scan.time}`} className="px-5 py-3 flex items-center gap-3 text-sm font-serif">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    scan.vip && scan.status === 'valid' ? 'bg-amber-200 text-amber-800' : s.dot
                  }`}
                >
                  <Icon name={scan.vip && scan.status === 'valid' ? 'star' : s.icon} className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-amber-950">{scan.name}</span>
                  <span className="block text-[11px] text-amber-700/60 font-mono truncate">{scan.code}</span>
                </span>
                <span className="text-xs text-amber-600/70 tabular-nums flex-shrink-0">{scan.ago}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-5 py-4 text-sm font-serif text-amber-600/60">
          Nothing scanned yet. Scanned tickets will show up here.
        </p>
      )}
    </section>
  );
}

function SuccessBurst({ onDone, variant = 'default' }) {
  const reduce = useReducedMotion();
  const isVip = variant === 'vip';
  const bgMain = isVip ? 'bg-amber-500 shadow-amber-500/40' : 'bg-emerald-500 shadow-emerald-500/40';
  const ring = isVip ? 'border-amber-400' : 'border-emerald-400';
  const bgFlash = isVip ? 'bg-amber-300' : 'bg-emerald-300';

  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 500 : isVip ? 1300 : 1000);
    return () => clearTimeout(t);
  }, [onDone, reduce, isVip]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      {!reduce && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.9, times: [0, 0.3, 1] }}
          className={`absolute inset-0 ${bgFlash}`}
        />
      )}
      {!reduce && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
          className={`absolute w-28 h-28 rounded-full border-2 ${ring}`}
        />
      )}
      <motion.div
        initial={{ scale: reduce ? 1 : 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={`relative w-28 h-28 rounded-full ${bgMain} flex items-center justify-center shadow-2xl`}
      >
        <svg viewBox="0 0 24 24" className="w-16 h-16 text-white" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d={isVip ? ICON_PATHS.star : 'M20 6L9 17l-5-5'}
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, color === 'vip' ? 0.28 : 0.18, 0] }}
      transition={{ duration: color === 'vip' ? 0.6 : 0.4, times: [0, 0.3, 1] }}
      className={`fixed inset-0 z-[70] pointer-events-none ${bg}`}
      aria-hidden="true"
    />
  );
}

function DuplicateToast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[75] max-w-[calc(100vw-2rem)] bg-amber-950 text-amber-50 px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-amber-500/30"
        >
          <Icon name="alert" className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-serif truncate">
            <span className="font-mono">{toast.code}</span> was already scanned {toast.minutes} min ago
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <dt className="text-[11px] text-amber-700/60">{label}</dt>
        <dd className="text-sm text-amber-950 break-words">{children}</dd>
      </div>
    </div>
  );
}

/* ============================================================
   RESULT CARD
   ============================================================ */
function ResultCard({ result, onConfirm, confirming, confirmError, error, onReset }) {
  const reduce = useReducedMotion();
  const isChecked = !!result.is_checked_in;
  const hasError = !!error;
  const theme = getCategoryTheme(result.ticket_category_name);
  const showTheme = theme && !isChecked && !hasError;

  const borderClass = hasError
    ? 'border-red-300/70'
    : isChecked
    ? 'border-emerald-300/70'
    : theme
    ? theme.border
    : 'border-amber-200/60';

  const bgClass = showTheme ? theme.bg : 'bg-white';

  return (
    <motion.article
      aria-label={`Ticket ${result.ticket_code}`}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={
        hasError && !reduce
          ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, -3, 0] }
          : { opacity: 1, y: 0 }
      }
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: EASE }}
      className={`relative border rounded-md overflow-hidden transition-colors ${borderClass} ${bgClass}`}
    >
      {/* Status strip */}
      {showTheme && (
        <div className={`${theme.badge} px-5 py-2 flex items-center gap-2 text-sm font-serif font-semibold`}>
          <Icon name="star" className="w-4 h-4" />
          {theme.label} ticket
        </div>
      )}
      {isChecked && (
        <div className="bg-emerald-50 border-b border-emerald-200/60 px-5 py-2.5 flex items-center gap-2 text-emerald-700 text-sm font-serif">
          <Icon name="check" className="w-4 h-4" />
          <span className="font-medium">Already checked in</span>
          {result.checked_in_at && (
            <span className="text-emerald-600/80 ml-auto text-xs">{formatDate(result.checked_in_at)}</span>
          )}
        </div>
      )}

      <div className="p-6 pb-5">
        {/* Who is this */}
        <p className="text-xs font-serif text-amber-700/70 mb-1">{result.ticket_category_name}</p>
        <h2 className="font-serif font-bold text-2xl text-amber-950 leading-tight break-words">
          {result.customer_name}
        </h2>
        <p className="text-xs font-mono text-amber-700/60 tracking-wide mt-1.5">{result.ticket_code}</p>

        {/* Event */}
        <div className="mt-5 pt-4 border-t border-amber-200/60">
          <h3 className="font-serif font-semibold text-base text-amber-950 leading-snug">{result.concert_name}</h3>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-serif text-amber-800/80">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" className="w-3.5 h-3.5 text-amber-500" />
              {result.event_date ? formatDate(result.event_date) : '-'}
              {result.start_time && <span className="text-amber-700/70">at {result.start_time.slice(0, 5)}</span>}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="location" className="w-3.5 h-3.5 text-amber-500" />
              {result.venue_name || '-'}
            </span>
          </div>
        </div>

        {/* Contact */}
        <dl className="mt-5 pt-4 border-t border-amber-200/60 space-y-3 font-serif">
          <DetailRow icon="mail" label="Email">{result.customer_email || '-'}</DetailRow>
          <DetailRow icon="phone" label="Phone">{result.customer_phone || '-'}</DetailRow>
        </dl>
      </div>

      <TearLine />

      <div className="p-6 pt-5">
        <p className="text-xs font-mono text-amber-700/50 text-center tracking-widest mb-4">
          Order {result.order_code}
        </p>

        {confirmError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-serif rounded-md px-3.5 py-2.5 mb-3"
          >
            <Icon name="alert" className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{confirmError}</span>
          </div>
        )}

        <div className="space-y-2">
          {!isChecked && !hasError && (
            <motion.button
              type="button"
              onClick={onConfirm}
              disabled={confirming}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 text-base font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 rounded-md transition-colors ${FOCUS}`}
            >
              {confirming ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-amber-200/40 border-t-amber-200 rounded-full animate-spin" />
                  Checking in...
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4" />
                  {confirmError ? 'Try again' : 'Check in'}
                </>
              )}
            </motion.button>
          )}

          <button
            type="button"
            onClick={onReset}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-serif text-amber-800 hover:bg-amber-50 border border-amber-200/60 rounded-md transition-colors ${FOCUS}`}
          >
            <Icon name="refresh" className="w-4 h-4" />
            Scan next ticket
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* ============================================================
   MAIN
   ============================================================ */
export default function Scan() {
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [cameraNotice, setCameraNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  // Camera controls
  const [capabilities, setCapabilities] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);

  // Settings (remembered between sessions)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => readStored('scan-pref-sound', true));
  const [voiceOn, setVoiceOn] = useState(() => readStored('scan-pref-voice', true));
  const [voicePreset, setVoicePreset] = useState(() => readStored('scan-pref-preset', 'normal'));
  const [autoScan, setAutoScan] = useState(() => readStored('scan-pref-auto', false));

  // Effects
  const [showBurst, setShowBurst] = useState(false);
  const [burstVariant, setBurstVariant] = useState('default');
  const [flash, setFlash] = useState(null);

  // Session
  const todayKey = localDateKey();
  const [stats, setStats] = useState(() => readStored(`scan-stats-${todayKey}`, { valid: 0, warning: 0, error: 0 }));
  const [recentScans, setRecentScans] = useState(() =>
    readStored(`scan-recent-${todayKey}`, []).map(r => ({ ...r, ago: agoLabel(r.time) }))
  );
  const [dupToast, setDupToast] = useState(null);
  const [autoResetIn, setAutoResetIn] = useState(null);

  const html5QrRef = useRef(null);
  const voiceRef = useRef({ supported: false, voice: null });
  const recentCodesRef = useRef(new Map());
  const scanLockRef = useRef(false);
  const lastInputRef = useRef('manual');
  const manualInputRef = useRef(null);

  // Camera callbacks outlive the render they were created in, so they read the latest values from here.
  const latest = useRef({});
  latest.current = { soundOn, validateCode, startScanner };

  /* ============ INIT ============ */
  useEffect(() => {
    recentScans.forEach(r => recentCodesRef.current.set(r.code, r.time));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;
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
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  /* ============ PERSIST ============ */
  useEffect(() => { writeStored(`scan-stats-${todayKey}`, stats); }, [stats, todayKey]);
  useEffect(() => {
    writeStored(`scan-recent-${todayKey}`, recentScans.map(({ ago, ...rest }) => rest));
  }, [recentScans, todayKey]);
  useEffect(() => { writeStored('scan-pref-sound', soundOn); }, [soundOn]);
  useEffect(() => { writeStored('scan-pref-voice', voiceOn); }, [voiceOn]);
  useEffect(() => { writeStored('scan-pref-preset', voicePreset); }, [voicePreset]);
  useEffect(() => { writeStored('scan-pref-auto', autoScan); }, [autoScan]);

  /* ============ CLEANUP ============ */
  useEffect(() => {
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============ AUTO-SCAN RESET ============ */
  useEffect(() => {
    if (!autoScan || !result || error || confirming) return undefined;
    setAutoResetIn(3);
    const interval = setInterval(() => {
      setAutoResetIn(prev => (prev === null ? prev : prev - 1));
    }, 1000);
    return () => { clearInterval(interval); setAutoResetIn(null); };
  }, [autoScan, result, error, confirming]);

  useEffect(() => {
    if (autoResetIn === 0) {
      reset({ restartCamera: lastInputRef.current === 'camera' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResetIn]);

  /* ============ AUTO-DISMISS ============ */
  useEffect(() => {
    if (!dupToast) return undefined;
    const t = setTimeout(() => setDupToast(null), 3000);
    return () => clearTimeout(t);
  }, [dupToast]);

  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    if (!cameraNotice) return undefined;
    const t = setTimeout(() => setCameraNotice(''), 2500);
    return () => clearTimeout(t);
  }, [cameraNotice]);

  /* ============ "AGO" LABELS ============ */
  useEffect(() => {
    const i = setInterval(() => {
      setRecentScans(prev => prev.map(r => ({ ...r, ago: agoLabel(r.time) })));
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
      if (['success', 'confirmed', 'vip', 'press'].includes(kind)) return { ...prev, valid: prev.valid + 1 };
      if (kind === 'warning') return { ...prev, warning: prev.warning + 1 };
      if (kind === 'error') return { ...prev, error: prev.error + 1 };
      return prev;
    });

    if (voiceOn && payload.voice) speak(payload.voice, { priority: !!payload.priority });

    if (payload.recent) {
      const now = Date.now();
      setRecentScans(prev => [{ ...payload.recent, time: now, ago: 'just now' }, ...prev].slice(0, MAX_RECENT));
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
    scanLockRef.current = false;
    lastInputRef.current = 'camera';
    try {
      // Wait for the #qr-reader element to be in the DOM
      await new Promise(r => requestAnimationFrame(() => r()));
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
        } catch { /* fall back to facingMode */ }
      } else if (!chosenId) {
        chosenId = activeCameraId;
      } else {
        setActiveCameraId(chosenId);
      }

      const cameraConfig = chosenId
        ? { deviceId: { exact: chosenId } }
        : { facingMode: 'environment' };

      await qr.start(
        cameraConfig,
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (scanLockRef.current) return;
          scanLockRef.current = true;
          if (latest.current.soundOn) playSound('scan');
          vibrate('scan');
          stopScanner();
          latest.current.validateCode(decodedText);
        },
        () => {}
      );

      setTimeout(() => {
        try {
          setCapabilities(qr.getRunningTrackCapabilities() || {});
        } catch {
          setCapabilities({});
        }
      }, 500);
    } catch {
      setError('Could not open the camera. Check the browser permission, or type the ticket code below.');
      setScannerActive(false);
      html5QrRef.current = null;
    }
  }

  function stopScanner() {
    const qr = html5QrRef.current;
    html5QrRef.current = null;
    if (qr) {
      qr.stop().then(() => qr.clear()).catch(() => {});
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
      setCameraNotice('Torch is not supported on this device.');
    }
  }

  async function applyZoom(value) {
    if (!html5QrRef.current) return;
    try {
      await html5QrRef.current.applyVideoConstraints({ advanced: [{ zoom: value }] });
      setZoom(value);
    } catch {
      setCameraNotice('Zoom is not supported on this device.');
    }
  }

  function switchCamera(camId) {
    stopScanner();
    setTimeout(() => startScanner(camId), 250);
  }

  /* ============ VALIDATE ============ */
  async function validateCode(code, source = null) {
    const trimmed = (code || '').trim();
    if (!trimmed) return;
    if (source) lastInputRef.current = source;

    const lastSeen = recentCodesRef.current.get(trimmed);
    if (lastSeen && Date.now() - lastSeen < DUP_WINDOW_MS) {
      const minutes = Math.max(1, Math.floor((Date.now() - lastSeen) / 60000));
      setDupToast({ code: trimmed, minutes });
    }
    recentCodesRef.current.set(trimmed, Date.now());

    setLoading(true);
    setError('');
    setConfirmError('');
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
      setError(err.response?.data?.message || 'This ticket is not valid.');
      feedback('error', {
        voice: 'Invalid ticket.',
        priority: true,
        recent: { code: trimmed, name: 'Invalid ticket', status: 'error' },
      });
      if (err.response?.data?.ticket) setResult(err.response.data.ticket);
    } finally {
      setLoading(false);
    }
  }

  /* ============ CONFIRM ============ */
  async function confirmCheckin() {
    if (!result || confirming) return;
    setConfirming(true);
    setConfirmError('');
    try {
      await api.post(`/checkin/confirm/${encodeURIComponent(result.ticket_code)}`);
      setResult({ ...result, is_checked_in: true, checked_in_at: new Date().toISOString() });

      const theme = getCategoryTheme(result.ticket_category_name);
      setBurstVariant(theme ? 'vip' : 'default');
      setShowBurst(true);

      const preset = VOICE_PRESETS[voicePreset] || VOICE_PRESETS.normal;
      const namePart = preset.sayName ? `${firstName(result.customer_name)}. ` : '';
      if (soundOn) playSound('confirmed');
      vibrate('confirmed');
      if (voiceOn) speak(`${namePart}Welcome.`, { priority: true });
    } catch (err) {
      setConfirmError(err.response?.data?.message || 'Check-in failed. Check your connection and try again.');
      if (soundOn) playSound('error');
      vibrate('error');
    } finally {
      setConfirming(false);
    }
  }

  const reset = useCallback(({ restartCamera = false } = {}) => {
    setResult(null);
    setError('');
    setConfirmError('');
    setManualCode('');
    setAutoResetIn(null);
    scanLockRef.current = false;
    if (restartCamera) {
      setTimeout(() => latest.current.startScanner(), 150);
    } else {
      manualInputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const dismissBurst = useCallback(() => setShowBurst(false), []);

  /* ============ RENDER ============ */
  const showCardError = !!error && !!result;

  return (
    <div className="min-h-screen bg-[#f5ede4] py-8 px-4">
      <style>{`
        @keyframes scanBeam {
          0%   { transform: translateY(0);    opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .scan-beam { animation: scanBeam 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
        #qr-reader video { width: 100% !important; display: block; }
        @media (prefers-reduced-motion: reduce) { .scan-beam { animation: none; } }
      `}</style>

      <AnimatePresence>
        {showBurst && <SuccessBurst variant={burstVariant} onDone={dismissBurst} />}
      </AnimatePresence>

      {flash && <ScreenFlash color={flash} />}
      <DuplicateToast toast={dupToast} />

      <div className="max-w-md mx-auto">

        {/* ===== HEADER ===== */}
        <header className="mb-6 flex items-center gap-3 relative">
          <div className="w-11 h-11 flex-shrink-0 rounded-full bg-amber-800 flex items-center justify-center text-amber-50">
            <Icon name="ticket" className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl font-bold text-amber-950 leading-tight">Scan ticket</h1>
            <p className="text-sm font-serif text-amber-700/70">Scan the QR code or type the ticket code</p>
          </div>

          <button
            type="button"
            onClick={() => setSettingsOpen(o => !o)}
            aria-expanded={settingsOpen}
            aria-haspopup="true"
            aria-label="Scanner settings"
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors flex-shrink-0 border ${FOCUS} ${
              settingsOpen
                ? 'bg-amber-800 text-amber-50 border-amber-800'
                : 'bg-white border-amber-200/60 text-amber-800 hover:border-amber-400'
            }`}
          >
            <Icon name="settings" className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSettingsOpen(false)} aria-hidden="true" />
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: EASE }}
                  className="absolute right-0 top-full mt-2 w-64 z-40 bg-white border border-amber-200/60 rounded-xl shadow-xl shadow-amber-950/10 overflow-hidden"
                >
                  <div className="px-4 py-2.5 border-b border-dashed border-amber-200/60">
                    <span className="text-xs font-serif font-semibold text-amber-950">Scanner settings</span>
                  </div>

                  <div className="p-2">
                    <Toggle checked={soundOn} onChange={() => setSoundOn(s => !s)} icon={soundOn ? 'volume' : 'volumeOff'} label="Sound" />
                    <Toggle checked={voiceOn} onChange={() => setVoiceOn(v => !v)} icon={voiceOn ? 'voiceOn' : 'voiceOff'} label="Voice" />

                    {voiceOn && (
                      <div className="px-3 pt-1 pb-2">
                        <span className="block text-xs font-serif text-amber-700/70 mb-1.5">Voice style</span>
                        <div role="radiogroup" aria-label="Voice style" className="inline-flex w-full rounded-lg bg-amber-50 border border-amber-200/60 overflow-hidden">
                          {['normal', 'fast', 'quiet'].map(p => (
                            <button
                              key={p}
                              type="button"
                              role="radio"
                              aria-checked={voicePreset === p}
                              onClick={() => setVoicePreset(p)}
                              className={`flex-1 px-2 py-2 text-xs font-serif capitalize transition-colors ${
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

                    <Toggle checked={autoScan} onChange={() => setAutoScan(a => !a)} icon="refresh" label="Auto-scan next" />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </header>

        {/* ===== SCANNER CARD ===== */}
        <section aria-label="Scanner" className="bg-white border border-amber-200/60 rounded-md mb-4">
          <div className="p-6">
            {!scannerActive ? (
              <div>
                <div className="relative h-40 rounded-md bg-amber-50/50 border border-amber-200/60 flex flex-col items-center justify-center gap-2 mb-3">
                  <ViewfinderCorners className="inset-4" />
                  <Icon name="camera" className="w-7 h-7 text-amber-400" />
                  <p className="text-xs font-serif text-amber-700/70">Camera is off</p>
                </div>
                <button
                  type="button"
                  onClick={() => startScanner()}
                  className={`w-full flex items-center justify-center gap-2.5 px-4 py-3.5 text-base font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 rounded-md transition-colors ${FOCUS}`}
                >
                  <Icon name="camera" className="w-5 h-5" />
                  Open camera
                </button>
              </div>
            ) : (
              <div>
                <div className="relative rounded-md overflow-hidden border border-amber-200/60 bg-amber-50/50 min-h-[200px]">
                  <div id="qr-reader" />
                  <ViewfinderCorners className="inset-5" />
                  <div className="pointer-events-none absolute inset-x-5 top-5 bottom-5 overflow-hidden" aria-hidden="true">
                    <div className="scan-beam h-0.5 w-full bg-amber-400/80" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {capabilities?.torch && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      aria-pressed={torchOn}
                      className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md text-xs font-serif border transition-colors ${FOCUS} ${
                        torchOn
                          ? 'bg-amber-700 text-amber-50 border-amber-700'
                          : 'bg-white text-amber-800 border-amber-200/60 hover:border-amber-400'
                      }`}
                    >
                      <Icon name={torchOn ? 'flashOn' : 'flashOff'} className="w-4 h-4" />
                      Torch
                    </button>
                  )}

                  {capabilities?.zoom && (
                    <div className="flex items-center gap-2 bg-white border border-amber-200/60 rounded-md px-3 py-2.5 flex-1 min-w-[160px]">
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
                        switchCamera(cameras[(idx + 1) % cameras.length].id);
                      }}
                      className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md text-xs font-serif bg-white text-amber-800 border border-amber-200/60 hover:border-amber-400 transition-colors ${FOCUS}`}
                    >
                      <Icon name="switchCamera" className="w-4 h-4" />
                      Switch camera
                    </button>
                  )}
                </div>

                {cameraNotice && (
                  <p role="status" className="mt-2 text-xs font-serif text-amber-700/80">{cameraNotice}</p>
                )}

                <button
                  type="button"
                  onClick={stopScanner}
                  className={`w-full flex items-center justify-center gap-2 mt-3 px-4 py-3 text-sm font-serif text-amber-800 hover:bg-amber-50 border border-amber-200/60 rounded-md transition-colors ${FOCUS}`}
                >
                  <Icon name="stop" className="w-4 h-4" />
                  Close camera
                </button>
              </div>
            )}

            <Divider label="or" />

            <label htmlFor="ticket-code" className="block text-sm font-serif text-amber-800 mb-2">
              Ticket code
            </label>
            <div className="flex gap-2">
              <input
                id="ticket-code"
                ref={manualInputRef}
                className="flex-1 min-w-0 px-3.5 py-3 text-sm font-mono text-amber-950 bg-white border border-amber-200/60 rounded-md placeholder:text-amber-400/60 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="TKT-XXXXXXXX"
                value={manualCode}
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && validateCode(manualCode, 'manual')}
              />
              <button
                type="button"
                onClick={() => validateCode(manualCode, 'manual')}
                disabled={loading || !manualCode.trim()}
                className={`px-5 py-3 text-sm font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap ${FOCUS}`}
              >
                {loading ? 'Checking...' : 'Check'}
              </button>
            </div>
          </div>
        </section>

        {/* ===== AUTO-RESET COUNTDOWN ===== */}
        <AnimatePresence>
          {autoResetIn !== null && autoResetIn > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-amber-50 border border-amber-200/60 rounded-md px-4 py-2.5 mb-4 flex items-center justify-between text-sm font-serif text-amber-800"
            >
              <span className="flex items-center gap-2">
                <Icon name="clock" className="w-4 h-4 text-amber-500" />
                Next scan in {autoResetIn}s
              </span>
              <button
                type="button"
                onClick={() => setAutoResetIn(null)}
                className={`text-amber-700 hover:text-amber-900 underline rounded ${FOCUS}`}
              >
                Stay on this ticket
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== ERROR (shown on its own only when there is no ticket to attach it to) ===== */}
        <div aria-live="assertive">
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-serif rounded-md px-4 py-3 mb-4"
              >
                <Icon name="alert" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== LOADING ===== */}
        <AnimatePresence>
          {loading && !result && (
            <motion.div
              role="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-amber-200/60 rounded-md p-5 flex items-center justify-center gap-3 text-amber-800 font-serif text-sm"
            >
              <span className="inline-block w-4 h-4 border-2 border-amber-200/40 border-t-amber-600 rounded-full animate-spin" />
              Checking ticket...
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== RESULT ===== */}
        <AnimatePresence mode="wait">
          {result && (
            <ResultCard
              key={result.ticket_code}
              result={result}
              onConfirm={confirmCheckin}
              confirming={confirming}
              confirmError={confirmError}
              error={showCardError ? error : ''}
              onReset={() => reset()}
            />
          )}
        </AnimatePresence>

        <SessionPanel stats={stats} recentScans={recentScans} />
      </div>
    </div>
  );
}