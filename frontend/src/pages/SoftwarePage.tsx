import { useEffect, useState } from 'react';
import { api } from '../api';
import { EmptyNote, ErrorNote, LoadingNote, PageHeader, Panel, StatusBadge } from '../components/ui';
import { formatDate, money } from '../format';
import type { LicenseUtilization, SoftwareLicense } from '../types';

export function SoftwarePage() {
  const [summary, setSummary] = useState<LicenseUtilization[]>([]);
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api<LicenseUtilization[]>('/api/v1/software/utilization-report'),
      api<SoftwareLicense[]>('/api/v1/software/licenses'),
    ])
      .then(([report, rows]) => {
        if (cancelled) return;
        setSummary(report);
        setLicenses(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load licenses.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div>
      <PageHeader title="Software licenses" description="Seat utilization comes from the license report and each license record." />
      {loading ? <LoadingNote label="Loading licenses…" /> : null}
      {error ? <ErrorNote message={error} onRetry={() => setReloadKey((value) => value + 1)} /> : null}
      {!loading && !error ? (
        <>
          {summary.length === 0 ? <EmptyNote>No software products yet.</EmptyNote> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {summary.map((item) => (
              <Panel key={item.software_id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{item.software_name}</h2>
                    <p className="text-sm text-stone-500">{item.publisher}</p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
                <p className="mt-3 text-sm">
                  {item.assigned_seats} of {item.total_seats} seats · {item.unassigned_seats} open · {money(item.total_spend)}
                </p>
                <div className="mt-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800" aria-hidden="true">
                  <div
                    className="h-2 rounded-full bg-teal-700 dark:bg-teal-400"
                    style={{ width: `${Math.min(100, Math.max(item.utilization_percentage > 0 ? 4 : 0, item.utilization_percentage))}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-stone-500">{item.utilization_percentage}% utilized</p>
              </Panel>
            ))}
          </div>
          <Panel className="mt-4">
            <h2 className="border-b border-stone-200 px-4 py-3 font-semibold dark:border-stone-800">License records</h2>
            {licenses.length === 0 ? <EmptyNote>No license records.</EmptyNote> : null}
            <ul className="divide-y divide-stone-200 dark:divide-stone-800">
              {licenses.map((license) => (
                <li key={license.id} className="grid gap-2 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold">{license.software_name || 'License'}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                      {license.license_type.replaceAll('_', ' ')} · {license.assigned_seats}/{license.total_seats} seats · {license.utilization_rate}% · {money(license.cost)}
                    </p>
                    <p className="text-xs text-stone-500">
                      Purchased {formatDate(license.purchase_date)}
                      {license.expiration_date ? ` · Expires ${formatDate(license.expiration_date)}` : ''}
                      {license.is_expired ? ' · Expired' : license.is_expiring_soon ? ' · Expiring soon' : ''}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-stone-500">{license.license_key}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      ) : null}
    </div>
  );
}
