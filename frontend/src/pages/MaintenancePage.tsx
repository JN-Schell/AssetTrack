import { useEffect, useState } from 'react';
import { api, withQuery } from '../api';
import { EmptyNote, ErrorNote, LoadingNote, PageHeader, Panel, StatusBadge } from '../components/ui';
import { formatDate, money, todayISO } from '../format';
import type { MaintenanceRecord } from '../types';

const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api<MaintenanceRecord[]>(withQuery('/api/v1/maintenance', { status: filter, limit: 100 }))
      .then((rows) => {
        if (!cancelled) setRecords(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load maintenance.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, reloadKey]);

  async function updateStatus(record: MaintenanceRecord, status: string) {
    if (status === record.status) return;
    setSavingId(record.id);
    setError(null);
    const body: { status: string; completed_date?: string } = { status };
    if (status === 'COMPLETED') body.completed_date = todayISO();
    try {
      const updated = await api<MaintenanceRecord>(`/api/v1/maintenance/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      setRecords((current) => current.map((item) => (item.id === updated.id ? updated : item)).filter((item) => !filter || item.status === filter));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the maintenance status.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Maintenance" description="Scheduled work and status updates saved through the maintenance API." />
      <div className="mb-4">
        <label className="text-sm font-semibold">
          Status
          <select className="field field-auto ml-2" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="">All</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? <div className="mb-4"><ErrorNote message={error} onRetry={() => setReloadKey((value) => value + 1)} /></div> : null}
      <Panel>
        {loading ? <LoadingNote label="Loading maintenance…" /> : null}
        {!loading && records.length === 0 ? <EmptyNote>No maintenance records for this filter.</EmptyNote> : null}
        <ul className="divide-y divide-stone-200 dark:divide-stone-800">
          {records.map((record) => (
            <li key={record.id} className="grid gap-3 px-4 py-3 lg:grid-cols-[1fr_12rem] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{record.title}</p>
                  <StatusBadge value={record.status} />
                </div>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                  {record.asset_tag || '—'} · {record.asset_name || 'Asset'} · {record.maintenance_type.replaceAll('_', ' ')}
                </p>
                <p className="text-sm text-stone-500">
                  Scheduled {formatDate(record.scheduled_date)}
                  {record.completed_date ? ` · Completed ${formatDate(record.completed_date)}` : ''}
                  {' · '}
                  {money(record.cost)}
                  {record.technician_name ? ` · ${record.technician_name}` : ''}
                </p>
                {record.description ? <p className="mt-1 text-sm">{record.description}</p> : null}
              </div>
              <label className="text-sm font-semibold">
                Update status
                <select
                  className="field mt-1"
                  value={record.status}
                  disabled={savingId === record.id}
                  onChange={(event) => updateStatus(record, event.target.value)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
