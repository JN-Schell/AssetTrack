import { useEffect, useState, type ReactNode } from 'react';
import { Download, QrCode } from 'lucide-react';
import { api, apiBlob, ApiError, mediaUrl } from '../api';
import { ErrorNote, LoadingNote, StatusBadge } from '../components/ui';
import { formatDate, labelize, money, specText } from '../format';
import type { AssetDetail, QrPayload } from '../types';

export function AssetDetailDialog({ assetId, onClose }: { assetId: string; onClose: () => void }) {
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [qrNote, setQrNote] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [pdfNote, setPdfNote] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api<AssetDetail>(`/api/v1/assets/${assetId}`)
      .then((data) => {
        if (!cancelled) setAsset(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this asset.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assetId]);

  async function showQr() {
    if (!asset) return;
    setQrLoading(true);
    setQrNote(null);
    try {
      const payload = await api<QrPayload>(`/api/v1/assets/${asset.id}/qr`);
      if (!payload.qr_data_url) throw new ApiError(502, 'QR response did not include an image.');
      setQrSrc(payload.qr_data_url);
    } catch (err) {
      const stored = mediaUrl(asset.qr_code_path);
      if (stored) {
        setQrSrc(stored);
        setQrNote('The QR endpoint did not return an image. Showing the stored QR file for this asset.');
      } else {
        setQrSrc(null);
        setQrNote(err instanceof Error ? err.message : 'QR image is not available.');
      }
    } finally {
      setQrLoading(false);
    }
  }

  async function downloadPdf() {
    if (!asset) return;
    setPdfLoading(true);
    setPdfNote(null);
    try {
      const blob = await apiBlob(`/api/v1/assets/${asset.id}/spec-sheet.pdf`);
      if (!blob.type.includes('pdf') && blob.size < 80) {
        throw new ApiError(502, 'The spec sheet response was not a PDF.');
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AssetTrack_${asset.asset_tag}_spec_sheet.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfNote(err instanceof Error ? err.message : 'Could not download the spec sheet.');
    } finally {
      setPdfLoading(false);
    }
  }

  const specs = asset ? Object.entries(asset.specifications ?? {}) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-stone-950/50" aria-label="Close asset details" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Asset details" className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-stone-200 bg-white p-5 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:max-w-4xl sm:rounded-2xl">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{asset ? asset.name : 'Asset'}</h2>
            {asset ? <p className="text-sm text-stone-500">{asset.asset_tag}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={showQr} disabled={!asset || qrLoading}>
              <QrCode size={16} />
              {qrLoading ? 'Loading QR…' : 'QR tag'}
            </button>
            <button type="button" className="btn-ghost" onClick={downloadPdf} disabled={!asset || pdfLoading}>
              <Download size={16} />
              {pdfLoading ? 'Preparing PDF…' : 'Spec sheet'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose} autoFocus>
              Close
            </button>
          </div>
        </div>
        {loading ? <LoadingNote /> : null}
        {error ? <ErrorNote message={error} /> : null}
        {pdfNote ? <p className="mb-3 text-sm text-rose-700 dark:text-rose-300">{pdfNote}</p> : null}
        {qrNote ? <p className="mb-3 text-sm text-rose-700 dark:text-rose-300">{qrNote}</p> : null}
        {qrSrc ? (
          <div className="mb-4 flex items-center gap-3">
            <img src={qrSrc} alt={asset ? `QR tag for ${asset.asset_tag}` : 'Asset QR tag'} className="h-28 w-28 rounded-lg border border-stone-200 bg-white p-1" />
            <p className="text-sm text-stone-500">QR tag from the asset API.</p>
          </div>
        ) : null}
        {asset ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={asset.status} />
              <StatusBadge value={asset.condition} />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Field label="Serial" value={asset.serial_number} />
              <Field label="Manufacturer" value={`${asset.manufacturer} ${asset.model}`} />
              <Field label="Category" value={asset.category_name} />
              <Field label="Department" value={asset.department_name} />
              <Field label="Vendor" value={asset.vendor_name} />
              <Field label="Assignee" value={asset.current_assignee} />
              <Field label="Location" value={asset.location} />
              <Field label="Purchased" value={formatDate(asset.purchase_date)} />
              <Field label="Purchase cost" value={money(asset.purchase_cost)} />
              <Field label="Salvage value" value={money(asset.salvage_value)} />
              <Field label="Lifespan" value={`${asset.expected_lifespan_months} months`} />
              <Field label="Depreciation method" value={labelize(asset.depreciation_method)} />
            </dl>
            {asset.notes ? <p className="text-sm text-stone-600 dark:text-stone-300">{asset.notes}</p> : null}
            {specs.length ? (
              <div>
                <h3 className="text-sm font-semibold">Specifications</h3>
                <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  {specs.map(([key, value]) => (
                    <Field key={key} label={labelize(key)} value={specText(value)} />
                  ))}
                </dl>
              </div>
            ) : null}
            <div>
              <h3 className="text-sm font-semibold">Depreciation</h3>
              {asset.depreciation ? (
                <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
                  <Field label="Current book value" value={money(asset.depreciation.current_book_value)} />
                  <Field label="Accumulated depreciation" value={money(asset.depreciation.accumulated_depreciation)} />
                  <Field label="Age" value={`${asset.depreciation.age_months} months`} />
                  <Field label="Remaining life" value={`${asset.depreciation.remaining_months} months`} />
                  <Field label="Percent depreciated" value={`${asset.depreciation.percent_depreciated}%`} />
                  <Field label="End of life" value={asset.depreciation.is_past_eol ? 'Past end of life' : asset.depreciation.is_approaching_eol ? 'Approaching end of life' : 'Within lifespan'} />
                </dl>
              ) : (
                <p className="mt-2 text-sm text-stone-500">No depreciation figures on this asset.</p>
              )}
            </div>
            <History title="Assignment history" empty="No assignment history.">
              {asset.assignments_history.map((item) => (
                <li key={item.id} className="text-sm">
                  <span className="font-semibold">{item.employee_name}</span> · {labelize(item.status)} · {formatDate(item.assigned_date)}
                  {item.returned_date ? ` to ${formatDate(item.returned_date)}` : ''}
                </li>
              ))}
            </History>
            <History title="Maintenance history" empty="No maintenance history.">
              {asset.maintenance_history.map((item) => (
                <li key={item.id} className="text-sm">
                  <span className="font-semibold">{item.title}</span> · {labelize(item.status)} · {formatDate(item.scheduled_date)} · {money(item.cost)}
                </li>
              ))}
            </History>
            <History title="Warranties" empty="No warranties.">
              {asset.warranties.map((item) => (
                <li key={item.id} className="text-sm">
                  <span className="font-semibold">{item.provider_name}</span> · {item.policy_number} · {formatDate(item.start_date)} – {formatDate(item.end_date)}
                </li>
              ))}
            </History>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  );
}

function History({ title, empty, children }: { title: string; empty: string; children: ReactNode }) {
  const items = Array.isArray(children) ? children : children ? [children] : [];
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length === 0 ? <p className="mt-2 text-sm text-stone-500">{empty}</p> : <ul className="mt-2 space-y-1">{items}</ul>}
    </div>
  );
}
