import { useEffect, useState } from 'react';
import { api } from '../api';
import { ErrorNote, LoadingNote, PageHeader, Panel, StatusBadge } from '../components/ui';
import { formatDateTime, labelize, money, monthLabel } from '../format';
import type { AuditLog, DashboardOverview } from '../types';

function summarize(changes: Record<string, unknown>): string {
  const parts = Object.entries(changes)
    .slice(0, 3)
    .map(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') return `${labelize(key)}: ${value}`;
      return labelize(key);
    });
  return parts.join(' · ');
}

export function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [activityNote, setActivityNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api<DashboardOverview>('/api/v1/dashboard/overview')
      .then(async (data) => {
        if (cancelled) return;
        setOverview(data);
        try {
          const logs = await api<AuditLog[]>('/api/v1/audit?limit=8');
          if (!cancelled) {
            setActivity(logs);
            setActivityNote(null);
          }
        } catch (err) {
          if (cancelled) return;
          setActivity([]);
          const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
          setActivityNote(
            status === 403
              ? 'Recent activity is available to administrators.'
              : err instanceof Error
                ? err.message
                : 'Could not load recent activity.',
          );
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the dashboard.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (loading) return <LoadingNote label="Loading dashboard…" />;
  if (error || !overview) {
    return <ErrorNote message={error ?? 'Dashboard data is unavailable.'} onRetry={() => setReloadKey((value) => value + 1)} />;
  }

  const kpis = [
    { label: 'Total assets', value: overview.total_assets.toLocaleString() },
    { label: 'Assigned', value: overview.assigned_assets.toLocaleString() },
    { label: 'In stock', value: overview.in_stock_assets.toLocaleString() },
    { label: 'In maintenance', value: overview.maintenance_assets.toLocaleString() },
  ];
  const watch = [
    { label: 'Approaching end of life', value: overview.approaching_eol_count },
    { label: 'Past end of life', value: overview.past_eol_count },
    { label: 'Pending approvals', value: overview.pending_approval_count },
    { label: 'Active maintenance jobs', value: overview.active_maintenance_count },
    { label: 'Warranties expiring in 60 days', value: overview.expiring_warranties_count },
    { label: 'Unassigned license seats', value: overview.unassigned_license_seats },
  ];
  const maxCategory = Math.max(...overview.categories_breakdown.map((item) => item.total_value), 1);
  const maxStatus = Math.max(...overview.status_breakdown.map((item) => item.count), 1);
  const maxSpend = Math.max(
    ...overview.spend_trends.flatMap((item) => [item.hardware_spend, item.maintenance_spend, item.license_spend]),
    1,
  );

  return (
    <div>
      <PageHeader title="Executive dashboard" description="Fleet counts, book value, category mix, and the latest audit activity." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <Panel key={card.label} className="p-4">
            <p className="text-sm text-stone-500 dark:text-stone-400">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{card.value}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Panel className="p-4">
          <p className="text-sm text-stone-500 dark:text-stone-400">Purchase valuation</p>
          <p className="mt-1 text-2xl font-semibold">{money(overview.total_asset_valuation)}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-sm text-stone-500 dark:text-stone-400">Current book value</p>
          <p className="mt-1 text-2xl font-semibold">{money(overview.total_current_book_value)}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-sm text-stone-500 dark:text-stone-400">Accumulated depreciation</p>
          <p className="mt-1 text-2xl font-semibold">{money(overview.total_accumulated_depreciation)}</p>
        </Panel>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {watch.map((item) => (
          <Panel key={item.label} className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm">{item.label}</p>
            <p className="text-lg font-semibold">{item.value.toLocaleString()}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel className="p-4">
          <h2 className="text-base font-semibold">Value by category</h2>
          {overview.categories_breakdown.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">No categories yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {overview.categories_breakdown.map((item) => (
                <li key={item.category_id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold">{item.category_name}</span>
                    <span className="text-stone-500 dark:text-stone-400">
                      {item.count} · {money(item.total_value)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-stone-200 dark:bg-stone-800">
                    <div className="h-2 rounded-full bg-teal-700 dark:bg-teal-400" style={{ width: `${Math.max(4, (item.total_value / maxCategory) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel className="p-4">
          <h2 className="text-base font-semibold">Status mix</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{overview.decommissioned_assets.toLocaleString()} decommissioned</p>
          <ul className="mt-4 space-y-3">
            {overview.status_breakdown.map((item) => (
              <li key={item.status}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <StatusBadge value={item.status} />
                  <span className="font-semibold">{item.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-stone-200 dark:bg-stone-800">
                  <div className="h-2 rounded-full bg-stone-700 dark:bg-stone-300" style={{ width: `${Math.max(item.count ? 4 : 0, (item.count / maxStatus) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-4 p-4">
        <h2 className="text-base font-semibold">Monthly spend</h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Hardware, maintenance, and license spend reported by the overview.</p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-600 dark:text-stone-300">
          <span className="inline-flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm bg-teal-700 dark:bg-teal-400" /> Hardware</span>
          <span className="inline-flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm bg-amber-600" /> Maintenance</span>
          <span className="inline-flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm bg-sky-700 dark:bg-sky-400" /> Licenses</span>
        </div>
        {overview.spend_trends.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">No spend trend data.</p>
        ) : (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {overview.spend_trends.map((item) => (
              <div key={item.month} className="flex min-w-[4.5rem] flex-1 flex-col items-center">
                <div className="flex h-36 items-end gap-1">
                  <div className="w-2.5 rounded-t bg-teal-700 dark:bg-teal-400" style={{ height: `${(item.hardware_spend / maxSpend) * 100}%` }} title={money(item.hardware_spend)} />
                  <div className="w-2.5 rounded-t bg-amber-600" style={{ height: `${(item.maintenance_spend / maxSpend) * 100}%` }} title={money(item.maintenance_spend)} />
                  <div className="w-2.5 rounded-t bg-sky-700 dark:bg-sky-400" style={{ height: `${(item.license_spend / maxSpend) * 100}%` }} title={money(item.license_spend)} />
                </div>
                <p className="mt-2 text-center text-xs text-stone-500">{monthLabel(item.month)}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel className="mt-4">
        <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <h2 className="text-base font-semibold">Recent activity</h2>
        </div>
        {activityNote ? <p className="px-4 py-3 text-sm text-stone-500">{activityNote}</p> : null}
        {activity.length === 0 && !activityNote ? <p className="px-4 py-6 text-sm text-stone-500">No audit events yet.</p> : null}
        <ul className="divide-y divide-stone-200 dark:divide-stone-800">
          {activity.map((event) => (
            <li key={event.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <p className="text-xs text-stone-500">{formatDateTime(event.timestamp)}</p>
              <div>
                <p className="text-sm font-semibold">
                  {labelize(event.action)} · {labelize(event.entity_type)}
                </p>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {event.user_name || 'System'}
                  {summarize(event.changes_json) ? ` · ${summarize(event.changes_json)}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
