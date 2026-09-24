import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loading } from '../../components/Ui';

const BANKS = [
  'BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB Niaga', 'Permata',
  'Danamon', 'Maybank', 'OCBC', 'BTN', 'Panin', 'Other',
];

function Icon({ name, className = 'w-4 h-4' }) {
  const paths = {
    bank: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3',
    check: 'M5 13l4 4L19 7',
    alert: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    close: 'M6 18L18 6M6 6l12 12',
    shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  };
  const path = paths[name];
  if (!path) return null;
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

// Mask nomor rekening: 1234••••••7890
function maskAccountNumber(num) {
  if (!num) return '-';
  const s = String(num);
  if (s.length <= 6) return s;
  const first = s.slice(0, 4);
  const last = s.slice(-4);
  return `${first}${'•'.repeat(Math.max(s.length - 8, 4))}${last}`;
}

export default function BankAccount() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    bank_name: 'BCA',
    account_number: '',
    account_holder: '',
  });

  useEffect(() => {
    api.get('/bank-accounts/me')
      .then((res) => {
        if (res.data) {
          setExisting(res.data);
          setForm({
            bank_name: res.data.bank_name || 'BCA',
            account_number: res.data.account_number || '',
            account_holder: res.data.account_holder || '',
          });
          setIsEditing(false);
        } else {
          setIsEditing(true); // belum ada, langsung tampil form
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!/^\d{6,30}$/.test(form.account_number)) {
      setError('Nomor rekening hanya boleh angka (6-30 digit).');
      return;
    }

    if (form.account_holder.trim().length < 3) {
      setError('Nama pemilik rekening minimal 3 karakter.');
      return;
    }

    // Kalau sudah ada rekening dan ini update, minta konfirmasi
    if (existing && !confirm('Ubah data rekening? Pastikan data baru sudah benar.')) {
      return;
    }

    setSaving(true);
    try {
      await api.put('/bank-accounts/me', {
        bank_name: form.bank_name,
        account_number: form.account_number,
        account_holder: form.account_holder.trim(),
      });

      const res = await api.get('/bank-accounts/me');
      setExisting(res.data);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan rekening.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    if (existing) {
      setForm({
        bank_name: existing.bank_name,
        account_number: existing.account_number,
        account_holder: existing.account_holder,
      });
      setIsEditing(false);
      setError('');
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-flame-500/10 border border-flame-500/20 flex items-center justify-center text-flame-400">
              <Icon name="bank" className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Rekening Pencairan
              </h1>
              <p className="text-sm text-ink-400 mt-0.5">
                Admin akan mentransfer dana ke rekening ini
              </p>
            </div>
          </div>

          {/* Status badge */}
          {existing ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icon name="check" className="w-3 h-3" />
              Aktif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Icon name="alert" className="w-3 h-3" />
              Belum diisi
            </span>
          )}
        </div>
        <div className="h-px bg-ink-700/60 mt-5" />
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 mb-6 rounded-lg border border-dashed border-ink-600/60 bg-ink-800/40">
        <Icon name="info" className="w-4 h-4 text-flame-400 shrink-0 mt-0.5" />
        <p className="text-sm text-ink-300">
          Pastikan data rekening benar dan atas nama kamu sendiri. Kesalahan data bisa menyebabkan
          dana tidak masuk atau dikembalikan oleh bank.
        </p>
      </div>

      {/* ===== REKENING TERSIMPAN ===== */}
      <AnimatePresence>
        {existing && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5"
          >
            {/* Kartu rekening gaya bank */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-ink-800 to-ink-900 border border-ink-700 p-6">
              {/* Dekorasi sudut */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-flame-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-flame-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-flame-400/80">
                    <Icon name="shield" className="w-3.5 h-3.5" />
                    Rekening Tersimpan
                  </div>
                  <div className="text-flame-400">
                    <Icon name="bank" className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-ink-500 mb-1">Bank</p>
                <p className="text-lg font-bold text-white mb-4">{existing.bank_name}</p>

                <p className="text-xs text-ink-500 mb-1">Nomor Rekening</p>
                <p className="text-xl font-mono font-bold text-white tracking-widest mb-4">
                  {maskAccountNumber(existing.account_number)}
                </p>

                <p className="text-xs text-ink-500 mb-1">Atas Nama</p>
                <p className="text-sm text-white">{existing.account_holder}</p>

                {existing.updated_at && (
                  <p className="text-[10px] text-ink-500 mt-4">
                    Terakhir diperbarui: {new Date(existing.updated_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-3">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-300 bg-ink-800 hover:bg-ink-700 rounded-lg transition-colors"
              >
                <Icon name="edit" className="w-4 h-4" />
                Ubah Rekening
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== FORM EDIT / CREATE ===== */}
      <AnimatePresence>
        {isEditing && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="card p-6 space-y-5"
          >
            {existing && (
              <div className="flex items-center justify-between pb-4 border-b border-ink-700/60">
                <h3 className="text-sm font-semibold text-white">Ubah Data Rekening</h3>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1.5 text-ink-400 hover:text-white hover:bg-ink-800 rounded-lg transition-colors"
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm text-ink-200 mb-1.5">Bank</label>
              <select
                className="w-full input-field"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-ink-200 mb-1.5">Nomor Rekening</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full input-field font-mono tracking-wider"
                placeholder="1234567890"
                value={form.account_number}
                onChange={(e) => setForm({
                  ...form,
                  account_number: e.target.value.replace(/\D/g, ''),
                })}
              />
              <p className="text-xs text-ink-500 mt-1">
                Hanya angka, tanpa spasi atau tanda hubung.
              </p>
            </div>

            <div>
              <label className="block text-sm text-ink-200 mb-1.5">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                className="w-full input-field"
                placeholder="Sesuai buku tabungan"
                value={form.account_holder}
                onChange={(e) => setForm({ ...form, account_holder: e.target.value })}
              />
              <p className="text-xs text-ink-500 mt-1">
                Sesuai nama di buku tabungan / rekening bank.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}

            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
              >
                <Icon name="check" className="w-4 h-4" />
                Rekening berhasil disimpan.
              </motion.div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              {existing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 text-sm font-medium text-ink-300 bg-ink-800 hover:bg-ink-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : existing ? (
                  'Simpan Perubahan'
                ) : (
                  'Simpan Rekening'
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}