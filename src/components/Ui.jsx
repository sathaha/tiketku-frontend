export function StatusBadge({ status }) {
  const map = {
    menunggu_pembayaran: { label: 'Menunggu Pembayaran', cls: 'bg-ember-500/15 text-ember-400 border border-ember-500/30' },
    lunas: { label: 'Lunas', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
    kadaluarsa: { label: 'Kadaluarsa', cls: 'bg-ink-600 text-ink-200 border border-ink-500' },
    dibatalkan: { label: 'Dibatalkan', cls: 'bg-ink-600 text-ink-200 border border-ink-500' },
    published: { label: 'Published', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
    draft: { label: 'Draft', cls: 'bg-ink-600 text-ink-200 border border-ink-500' },
    cancelled: { label: 'Dibatalkan', cls: 'bg-flame-500/15 text-flame-400 border border-flame-500/30' },
    selesai: { label: 'Selesai', cls: 'bg-sky-500/15 text-sky-400 border border-sky-500/30' },
    disetujui: { label: 'Disetujui', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
    menunggu_persetujuan: { label: 'Menunggu Persetujuan', cls: 'bg-sky-500/15 text-sky-400 border border-sky-500/30' },
    ditolak: { label: 'Ditolak', cls: 'bg-flame-500/15 text-flame-400 border border-flame-500/30' },
    belum_cair: { label: 'Belum Dicairkan', cls: 'bg-ember-500/15 text-ember-400 border border-ember-500/30' },
    sudah_cair: { label: 'Sudah Dicairkan', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  };
  const item = map[status] || { label: status, cls: 'bg-ink-600 text-ink-200 border border-ink-500' };
  return <span className={`pill ${item.cls}`}>{item.label}</span>;
}

export function StarRating({ value = 0, onChange, size = 'text-lg' }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`flex gap-1 ${size}`}>
      {stars.map((s) => (
        <button
          type="button"
          key={s}
          disabled={!onChange}
          onClick={() => onChange && onChange(s)}
          className={s <= value ? 'text-ember-400' : 'text-ink-500'}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function Loading({ text = 'Memuat data...' }) {
  return (
    <div className="text-center text-ink-300 py-16 flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-ink-500 border-t-flame-500 animate-spin" />
      {text}
    </div>
  );
}

export function EmptyState({ text = 'Belum ada data.' }) {
  return <div className="text-center text-ink-300 py-14 border border-dashed border-ink-500 rounded-2xl">{text}</div>;
}

export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
