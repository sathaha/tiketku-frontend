import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { formatDate } from '../../components/Ui';

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
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

function Badge({ status }) {
  if (status === 'checked_in') {
    return (
      <span className="inline-flex items-center gap-1.5 -rotate-3 px-3 py-1 text-[10px] font-serif tracking-[0.15em] uppercase text-emerald-700 bg-emerald-50/90 border border-dashed border-emerald-400 rounded-full">
        <Icon name="check" className="w-3 h-3" />
        Sudah Check-in
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-serif tracking-[0.15em] uppercase text-amber-700 bg-amber-50/80 border border-amber-200/50 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Belum Check-in
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

/** A full-bleed tear line with punched notches, so the card reads as a real ticket stub. */
function TearLine() {
  return (
    <div className="relative border-t border-dashed border-amber-200/70">
      <span className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f5ede4] border border-amber-200/60" />
      <span className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f5ede4] border border-amber-200/60" />
    </div>
  );
}

export default function Scan() {
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const html5QrRef = useRef(null);

  useEffect(() => {
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startScanner() {
    setError('');
    setScannerActive(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          validateCode(decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (err) {
      setError('Tidak bisa mengakses kamera. Gunakan input kode manual di bawah.');
      setScannerActive(false);
    }
  }

  function stopScanner() {
    if (html5QrRef.current) {
      html5QrRef.current.stop().then(() => html5QrRef.current.clear()).catch(() => {});
      html5QrRef.current = null;
    }
    setScannerActive(false);
  }

  async function validateCode(code) {
    const trimmed = (code || '').trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/checkin/validate/${encodeURIComponent(trimmed)}`);
      setResult(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.message || 'Tiket tidak valid.');
      if (err.response?.data?.ticket) setResult(err.response.data.ticket);
    } finally {
      setLoading(false);
    }
  }

  async function confirmCheckin() {
    if (!result) return;
    setConfirming(true);
    try {
      await api.post(`/checkin/confirm/${encodeURIComponent(result.ticket_code)}`);
      setResult({ ...result, is_checked_in: true });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal melakukan check-in.');
    } finally {
      setConfirming(false);
    }
  }

  function reset() {
    setResult(null);
    setError('');
    setManualCode('');
  }

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
      `}</style>

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-11 h-11 flex-shrink-0 rounded-full bg-amber-800 flex items-center justify-center text-amber-50">
            <Icon name="ticket" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-amber-950 leading-tight">
              Scan Tiket
            </h1>
            <p className="text-sm font-serif text-amber-700/60">
              Validasi QR code atau masukkan kode tiket
            </p>
          </div>
        </div>

        {/* Scanner Card */}
        <div className="bg-white border border-amber-200/60 rounded-md mb-4">
          <div className="p-6">
            {!scannerActive ? (
              <button
                onClick={startScanner}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 rounded-md transition-colors"
              >
                <Icon name="camera" className="w-5 h-5" />
                Buka Kamera &amp; Scan QR
              </button>
            ) : (
              <div>
                <div className="relative rounded-md overflow-hidden border border-amber-200/60 bg-amber-50/50">
                  <div id="qr-reader" />

                  {/* viewfinder corners */}
                  <div className="pointer-events-none absolute inset-5">
                    <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
                    <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
                    <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
                    <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400" />
                  </div>

                  {/* sweeping scan line */}
                  <div className="pointer-events-none absolute inset-x-5 top-5 bottom-5 overflow-hidden">
                    <div className="scan-beam h-0.5 w-full bg-amber-400/80" />
                  </div>
                </div>
                <button
                  onClick={stopScanner}
                  className="w-full flex items-center justify-center gap-2 mt-3 px-4 py-2.5 text-sm font-serif text-amber-800 hover:bg-amber-50 border border-amber-200/60 rounded-md transition-colors"
                >
                  <Icon name="stop" className="w-4 h-4" />
                  Hentikan Kamera
                </button>
              </div>
            )}

            <Divider label="atau" />

            <label className="block text-xs font-serif text-amber-800 mb-2">
              Kode Tiket
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3.5 py-2.5 text-sm font-mono text-amber-950 bg-white border border-amber-200/60 rounded-md placeholder:text-amber-400/60 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="TKT-XXXXXXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && validateCode(manualCode)}
              />
              <button
                onClick={() => validateCode(manualCode)}
                disabled={loading || !manualCode.trim()}
                className="px-5 py-2.5 text-sm font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap"
              >
                {loading ? 'Memeriksa...' : 'Cek Tiket'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm font-serif rounded-md px-4 py-3 mb-4">
            <Icon name="alert" className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Result — styled as an actual ticket stub */}
        {result && (
          <div className="relative bg-white border border-amber-200/60 rounded-md">

            {/* Main stub */}
            <div className="p-6 pb-5">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="font-serif font-bold text-lg text-amber-950 leading-tight">
                  {result.concert_name}
                </h2>
                <Badge status={result.is_checked_in ? 'checked_in' : 'pending'} />
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
                    <dt className="text-xs text-amber-700/60">Pemesan</dt>
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
                    <dt className="text-xs text-amber-700/60">No. HP</dt>
                    <dd className="text-amber-950">{result.customer_phone || '-'}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon name="ticket" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs text-amber-700/60">Kategori</dt>
                    <dd className="text-amber-950">{result.ticket_category_name}</dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Tear line with punched notches */}
            <TearLine />

            {/* Tear-off stub: order code + actions */}
            <div className="p-6 pt-5">
              <p className="text-xs font-mono text-amber-700/50 text-center tracking-[0.2em] mb-5">
                {result.order_code}
              </p>

              <div className="space-y-2">
                {result.is_checked_in ? (
                  <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-serif rounded-md px-4 py-3">
                    <Icon name="check" className="w-4 h-4" />
                    <span>Tiket sudah check-in</span>
                    {result.checked_in_at && (
                      <span className="text-emerald-600/70 text-xs">
                        · {formatDate(result.checked_in_at)}
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={confirmCheckin}
                    disabled={confirming}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-serif font-medium text-amber-50 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 rounded-md transition-colors"
                  >
                    {confirming ? (
                      'Memproses...'
                    ) : (
                      <>
                        <Icon name="check" className="w-4 h-4" />
                        Konfirmasi Check-in
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={reset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-serif text-amber-800 hover:bg-amber-50 border border-amber-200/60 rounded-md transition-colors"
                >
                  <Icon name="refresh" className="w-4 h-4" />
                  Scan Tiket Lain
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}