import { useEffect, useState } from 'react';
import { api, withQuery } from '../api';
import { EmptyNote, ErrorNote, LoadingNote, PageHeader, Panel, StatusBadge } from '../components/ui';
import { formatDate, money } from '../format';
import type { Asset, Category, Department } from '../types';
import { AssetDetailDialog } from './AssetDetailDialog';

const STATUSES = ['', 'IN_STOCK', 'ASSIGNED', 'UNDER_MAINTENANCE', 'PENDING_DISPOSAL', 'DECOMMISSIONED'];

export function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    api<Category[]>('/api/v1/categories')
      .then((rows) => {
        if (!cancelled) setCategories(rows);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    api<Department[]>('/api/v1/departments')
      .then((rows) => {
        if (!cancelled) setDepartments(rows);
      })
      .catch(() => {
        if (!cancelled) setDepartments([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const path = withQuery('/api/v1/assets', {
      search: query,
      category_id: categoryId,
      department_id: departmentId,
      status,
      limit: 100,
    });
    api<Asset[]>(path)
      .then((rows) => {
        if (!cancelled) setAssets(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load assets.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, categoryId, departmentId, status]);

  return (
    <div>
      <PageHeader title="Asset inventory" description="Search the registry and filter by category, department, or status." />
      <Panel className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm font-semibold md:col-span-1">
            Search
            <input className="field mt-1" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tag, name, serial, model" />
          </label>
          <label className="text-sm font-semibold">
            Category
            <select className="field mt-1" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Department
            <select className="field mt-1" value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Status
            <select className="field mt-1" value={status} onChange={(event) => setStatus(event.target.value)}>
              {STATUSES.map((value) => (
                <option key={value || 'all'} value={value}>
                  {value ? value.replaceAll('_', ' ') : 'All statuses'}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>
      <Panel>
        {loading ? <LoadingNote label="Loading assets…" /> : null}
        {error ? <div className="p-4"><ErrorNote message={error} /></div> : null}
        {!loading && !error && assets.length === 0 ? <EmptyNote>No assets match these filters.</EmptyNote> : null}
        {!loading && !error && assets.length > 0 ? (
          <>
            <ul className="divide-y divide-stone-200 dark:divide-stone-800 md:hidden">
              {assets.map((asset) => (
                <li key={asset.id}>
                  <button type="button" className="block w-full px-4 py-3 text-left" onClick={() => setSelectedId(asset.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{asset.name}</p>
                        <p className="text-xs text-stone-500">{asset.asset_tag}</p>
                      </div>
                      <StatusBadge value={asset.status} />
                    </div>
                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                      {asset.category_name || 'Uncategorized'} · {asset.department_name || 'No department'}
                    </p>
                    <p className="text-sm">{money(asset.purchase_cost)}</p>
                  </button>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[48rem] text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500 dark:border-stone-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Asset</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Assignee</th>
                    <th className="px-4 py-3 font-semibold">Cost</th>
                    <th className="px-4 py-3 font-semibold">Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                      <td className="px-4 py-3">
                        <button type="button" className="text-left font-semibold text-teal-800 underline-offset-2 hover:underline dark:text-teal-300" onClick={() => setSelectedId(asset.id)}>
                          {asset.name}
                        </button>
                        <p className="text-xs text-stone-500">{asset.asset_tag}</p>
                      </td>
                      <td className="px-4 py-3">{asset.category_name || '—'}</td>
                      <td className="px-4 py-3">{asset.department_name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge value={asset.status} /></td>
                      <td className="px-4 py-3">{asset.current_assignee || '—'}</td>
                      <td className="px-4 py-3">{money(asset.purchase_cost)}</td>
                      <td className="px-4 py-3">{formatDate(asset.purchase_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </Panel>
      {selectedId ? <AssetDetailDialog assetId={selectedId} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}
