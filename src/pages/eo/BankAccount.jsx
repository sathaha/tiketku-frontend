import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

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
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60';

/* Notches are cut out of the ticket with a mask, so they work on any background. */
const notch = `radial-gradient(circle 9px at calc(100% - var(--stub)) 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 9px at calc(100% - var(--stub)) 100%, #0000 97%, #000) bottom / 100% 51% no-repeat`;
const ticketCss = `
  .ticket-notch { -webkit-mask: ${notch}; mask: ${notch}; }
  @media (min-width: 640px) {
    .ticket-notch-sm { -webkit-mask: ${notch}; mask: ${notch}; }
  }
`;

// Mask account number: 1234••••••7890
function maskAccountNumber(num) {
  if (!num) return '-';
  const s = String(num);
  if (s.length <= 6) return s;
  const first = s.slice(0, 4);
  const last = s.slice(-4);
  return `${first}${'•'.repeat(Math.max(s.length - 8, 4))}${last}`;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden="true">
      <div className="bg-white border border-amber-200/60 rounded-2xl p-6 space-y-4">
        <div className="h-3 w-32 bg-amber-100 rounded" />
        <div className="h-6 w-24 bg-amber-100 rounded" />
        <div className="h-7 w-48 bg-amber-100 rounded" />
        <div className="h-4 w-40 bg-amber-100 rounded" />
      </div>
    </div>
  );
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
          setIsEditing(true);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3200);
    return () => clearTimeout(t);
  }, [saved]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!/^\d{6,30}$/.test(form.account_number)) {
      setError('Account number must contain only digits (6-30 digits).');
      return;
    }

    if (form.account_holder.trim().length < 3) {
      setError('Account holder name must be at least 3 characters.');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bank account.');
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

  return (
    <div className="min-h-screen bg-[#f5ede4]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <style>{ticketCss}</style>

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-amber-950">Payout account</h1>
            <p className="font-serif text-sm text-amber-700/70 mt-1">
              Admin will transfer funds to this account
            </p>
          </div>

          {/* Status badge */}
          {existing ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 font-serif text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200/60 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 font-serif text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200/60 self-start sm:self-auto">
              <Icon name="alert" className="w-3 h-3" />
              Not set
            </span>
          )}
        </header>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 mb-6 rounded-2xl border border-dashed border-amber-300/60 bg-amber-50/50">
          <Icon name="info" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="font-serif text-sm text-amber-800">
            Make sure the account details are correct and registered under your own name.
            Incorrect details may cause funds to fail or be returned by the bank.
          </p>
        </div>

        {loading ? (
          <SkeletonCard />
        ) : (
          <>
            {/* ===== SAVED ACCOUNT ===== */}
            <AnimatePresence>
              {existing && !isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-5"
                >
                  {/* Bank-style account card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-800 to-amber-900 border border-amber-700/60 p-6 shadow-xl shadow-amber-900/10">
                    {/* Corner decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 font-serif text-[10px] uppercase tracking-[0.25em] text-amber-200/80">
                          <Icon name="shield" className="w-3.5 h-3.5" />
                          Saved account
                        </div>
                        <div className="text-amber-200/80">
                          <Icon name="bank" className="w-5 h-5" />
                        </div>
                      </div>

                      <p className="font-serif text-xs text-amber-100/60 mb-1">Bank</p>
                      <p className="font-serif text-lg font-bold text-amber-50 mb-4">
                        {existing.bank_name}
                      </p>

                      <p className="font-serif text-xs text-amber-100/60 mb-1">Account number</p>
                      <p className="font-mono font-bold text-xl text-amber-50 tracking-widest mb-4">
                        {maskAccountNumber(existing.account_number)}
                      </p>

                      <p className="font-serif text-xs text-amber-100/60 mb-1">Account holder</p>
                      <p className="font-serif text-sm text-amber-50">{existing.account_holder}</p>

                      {existing.updated_at && (
                        <p className="font-serif text-[10px] text-amber-100/50 mt-4">
                          Last updated: {new Date(existing.updated_at).toLocaleDateString('en-US', {
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
                      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                    >
                      <Icon name="edit" className="w-4 h-4" />
                      Edit account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===== EDIT / CREATE FORM ===== */}
            <AnimatePresence>
              {isEditing && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="bg-white border border-amber-200/60 rounded-2xl p-6 space-y-5"
                >
                  {existing && (
                    <div className="flex items-center justify-between pb-4 border-b border-amber-200/60">
                      <h3 className="font-serif font-semibold text-amber-950 text-sm">
                        Edit account details
                      </h3>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        aria-label="Close form"
                        className={`p-1.5 text-amber-500 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors ${focusRing}`}
                      >
                        <Icon name="close" className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div>
                    <label htmlFor="bank-name" className="block font-serif text-sm text-amber-900 mb-1.5">
                      Bank
                    </label>
                    <select
                      id="bank-name"
                      className={`w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all ${focusRing}`}
                      value={form.bank_name}
                      onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                    >
                      {BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="account-number" className="block font-serif text-sm text-amber-900 mb-1.5">
                      Account number
                    </label>
                    <input
                      id="account-number"
                      type="text"
                      inputMode="numeric"
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-mono text-sm text-amber-950 tracking-wider placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                      placeholder="1234567890"
                      value={form.account_number}
                      onChange={(e) => setForm({
                        ...form,
                        account_number: e.target.value.replace(/\D/g, ''),
                      })}
                    />
                    <p className="font-serif text-xs text-amber-700/70 mt-1.5">
                      Digits only, without spaces or dashes.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="account-holder" className="block font-serif text-sm text-amber-900 mb-1.5">
                      Account holder name
                    </label>
                    <input
                      id="account-holder"
                      type="text"
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-200/60 rounded-xl font-serif text-sm text-amber-950 placeholder-amber-400/60 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 transition-all"
                      placeholder="As shown on your passbook"
                      value={form.account_holder}
                      onChange={(e) => setForm({ ...form, account_holder: e.target.value })}
                    />
                    <p className="font-serif text-xs text-amber-700/70 mt-1.5">
                      Must match the name on your passbook / bank account.
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200/60 text-red-700 font-serif text-sm"
                    >
                      <Icon name="alert" className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </motion.div>
                  )}

                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="status"
                      className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-serif text-sm"
                    >
                      <Icon name="check" className="w-4 h-4" />
                      Bank account saved successfully.
                    </motion.div>
                  )}

                  <div className="pt-2 flex justify-end gap-3">
                    {existing && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className={`px-4 py-2.5 bg-white border border-amber-200/60 hover:bg-amber-50 text-amber-900 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-700 disabled:opacity-50 text-amber-50 font-serif text-sm rounded-xl transition-colors ${focusRing}`}
                    >
                      {saving ? (
                        <>
                          <Spinner />
                          Saving...
                        </>
                      ) : existing ? (
                        'Save changes'
                      ) : (
                        'Save account'
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}