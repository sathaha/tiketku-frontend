import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* ---------- Status ---------- */

const tones = {
  ember: 'bg-ember-500/15 text-ember-400 border border-ember-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  sky: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
  flame: 'bg-flame-500/15 text-flame-400 border border-flame-500/30',
  muted: 'bg-ink-600 text-ink-200 border border-ink-500',
};

// [label, tone, berdenyut?]  — berdenyut untuk status yang masih menunggu aksi
const statusMap = {
  menunggu_pembayaran: ['Menunggu Pembayaran', 'ember', true],
  lunas: ['Lunas', 'emerald'],
  kadaluarsa: ['Kadaluarsa', 'muted'],
  dibatalkan: ['Dibatalkan', 'muted'],
  published: ['Published', 'emerald'],
  draft: ['Draft', 'muted'],
  cancelled: ['Dibatalkan', 'flame'],
  selesai: ['Selesai', 'sky'],
  disetujui: ['Disetujui', 'emerald'],
  menunggu_persetujuan: ['Menunggu Persetujuan', 'sky', true],
  ditolak: ['Ditolak', 'flame'],
  belum_cair: ['Belum Dicairkan', 'ember', true],
  sudah_cair: ['Sudah Dicairkan', 'emerald'],
};

function humanize(status) {
  if (!status) return '-';
  const text = String(status).replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function StatusBadge({ status }) {
  const [label, tone, pending] = statusMap[status] || [humanize(status), 'muted'];
  return (
    <span className={`pill inline-flex items-center gap-1.5 whitespace-nowrap ${tones[tone]}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${pending ? 'animate-pulse' : ''}`} aria-hidden="true" />
      {label}
    </span>
  );
}

/* ---------- Rating ---------- */

function Star({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-[1em] h-[1em]"
      fill="currentColor"
      aria-hidden="true"
      style={{ opacity: filled ? 1 : 0.9 }}
    >
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5z" />
    </svg>
  );
}

export function StarRating({ value = 0, onChange, size = 'text-lg' }) {
  const [hover, setHover] = useState(0);
  const interactive = Boolean(onChange);
  const shown = interactive && hover ? hover : value;
  const stars = [1, 2, 3, 4, 5];

  if (!interactive) {
    return (
      <div className={`flex gap-1 ${size}`} role="img" aria-label={`Rating ${value} dari 5`}>
        {stars.map((s) => (
          <span key={s} className={s <= value ? 'text-ember-400' : 'text-ink-500'}>
            <Star filled={s <= value} />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex gap-1 ${size}`}
      role="radiogroup"
      aria-label="Beri rating"
      onMouseLeave={() => setHover(0)}
    >
      {stars.map((s) => (
        <button
          type="button"
          key={s}
          role="radio"
          aria-checked={s === value}
          aria-label={`${s} bintang`}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onFocus={() => setHover(s)}
          onBlur={() => setHover(0)}
          className={`rounded-sm transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400 ${
            s <= shown ? 'text-ember-400' : 'text-ink-500'
          }`}
        >
          <Star filled={s <= shown} />
        </button>
      ))}
    </div>
  );
}

/* ---------- Loading & Empty ---------- */

const bars = [0.45, 1, 0.65, 0.9, 0.5];

export function Loading({ text = 'Memuat data...' }) {
  const reduce = useReducedMotion();
  return (
    <div role="status" aria-live="polite" className="text-center text-ink-300 py-16 flex flex-col items-center gap-4">
      {/* equalizer: bar naik-turun seperti level suara di konser */}
      <div className="flex items-end gap-1 h-8" aria-hidden="true">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 h-full rounded-full bg-ember-500 origin-bottom"
            initial={{ scaleY: h }}
            animate={reduce ? { scaleY: h } : { scaleY: [0.25, 1, 0.4, 0.85, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
          />
        ))}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

export function EmptyState({ text = 'Belum ada data.' }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center text-ink-300 py-14 px-6 border border-dashed border-ink-500 rounded-2xl">
      <svg className="w-10 h-10 text-ink-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16a1 1 0 011 1v2.5a2.5 2.5 0 000 5V17a1 1 0 01-1 1H4a1 1 0 01-1-1v-2.5a2.5 2.5 0 000-5V7a1 1 0 011-1zM14.5 7v1.5M14.5 11.25v1.5M14.5 15.5V17"
        />
      </svg>
      <p className="max-w-xs leading-relaxed">{text}</p>
    </div>
  );
}

/* ---------- Format ---------- */

export function formatRupiah(value) {
  const n = Number(value);
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}