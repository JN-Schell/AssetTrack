import { FormEvent, useEffect, useState } from 'react';
import { api, withQuery } from '../api';
import { EmptyNote, ErrorNote, LoadingNote, Modal, PageHeader, Panel, StatusBadge } from '../components/ui';
import { formatDate, todayISO } from '../format';
import type { Asset, Assignment, Employee } from '../types';

const CONDITIONS = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];

export function AssignmentsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stock, setStock] = useState<Asset[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [returning, setReturning] = useState<Assignment | null>(null);
  const [returnDate, setReturnDate] = useState(todayISO());
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [assetId, setAssetId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [assignedDate, setAssignedDate] = useState(todayISO());
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api<Employee[]>('/api/v1/employees?limit=100'),
      api<Assignment[]>(withQuery('/api/v1/assignments', { status, limit: 100 })),
      api<Asset[]>(withQuery('/api/v1/assets', { status: 'IN_STOCK', limit: 100 })),
    ])
      .then(([people, rows, available]) => {
        if (cancelled) return;
        setEmployees(people);
        setAssignments(rows);
        setStock(available);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load assignments.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, reloadKey]);

  function openReturn(assignment: Assignment) {
    setReturning(assignment);
    setReturnDate(todayISO());
    setReturnCondition('GOOD');
    setReturnNotes('');
    setFormError(null);
  }

  async function submitReturn(event: FormEvent) {
    event.preventDefault();
    if (!returning) return;
    setSaving(true);
    setFormError(null);
    try {
      await api(`/api/v1/assignments/${returning.id}/return`, {
        method: 'POST',
        body: JSON.stringify({
          returned_date: returnDate,
          condition_on_return: returnCondition,
          return_notes: returnNotes.trim() || null,
        }),
      });
      setReturning(null);
      setReloadKey((value) => value + 1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Return failed.');
    } finally {
      setSaving(false);
    }
  }

  async function submitAssign(event: FormEvent) {
    event.preventDefault();
    setAssignError(null);
    setSaving(true);
    try {
      await api('/api/v1/assignments', {
        method: 'POST',
        body: JSON.stringify({
          asset_id: assetId,
          employee_id: employeeId,
          assigned_date: assignedDate,
          condition_on_assignment: 'EXCELLENT',
        }),
      });
      setAssetId('');
      setEmployeeId('');
      setReloadKey((value) => value + 1);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Could not create the assignment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Personnel and assignments" description="See who holds equipment and return active assignments." />
      {error ? <ErrorNote message={error} onRetry={() => setReloadKey((value) => value + 1)} /> : null}
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-4 py-3 dark:border-stone-800">
              <h2 className="font-semibold">Assignments</h2>
              <label className="text-sm font-semibold">
                Status
                <select className="field field-auto ml-2" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING_APPROVAL">Pending approval</option>
                  <option value="RETURNED">Returned</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </label>
            </div>
            {loading ? <LoadingNote /> : null}
            {!loading && assignments.length === 0 ? <EmptyNote>No assignments for this filter.</EmptyNote> : null}
            <ul className="divide-y divide-stone-200 dark:divide-stone-800">
              {assignments.map((assignment) => (
                <li key={assignment.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{assignment.asset_name || 'Asset'}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                      {assignment.asset_tag || '—'} · {assignment.employee_name || 'Unknown'} · {formatDate(assignment.assigned_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={assignment.status} />
                    {assignment.status === 'ACTIVE' ? (
                      <button type="button" className="btn-primary" onClick={() => openReturn(assignment)}>
                        Return
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <h2 className="border-b border-stone-200 px-4 py-3 font-semibold dark:border-stone-800">People</h2>
            {employees.length === 0 && !loading ? <EmptyNote>No employees yet.</EmptyNote> : null}
            <ul className="divide-y divide-stone-200 dark:divide-stone-800">
              {employees.map((employee) => (
                <li key={employee.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{employee.full_name}</p>
                      <p className="text-sm text-stone-600 dark:text-stone-300">
                        {employee.job_title} · {employee.department_name || 'No department'}
                      </p>
                      <p className="text-xs text-stone-500">{employee.email} · {employee.employee_id_number}</p>
                    </div>
                    <p className="text-sm text-stone-500">{employee.assigned_assets_count ?? 0} active</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel className="h-fit p-4">
          <h2 className="font-semibold">Assign an in-stock asset</h2>
          <form className="mt-3 space-y-3" onSubmit={submitAssign}>
            <label className="block text-sm font-semibold">
              Asset
              <select className="field mt-1" value={assetId} onChange={(event) => setAssetId(event.target.value)} required>
                <option value="">Select an asset</option>
                {stock.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_tag} · {asset.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Employee
              <select className="field mt-1" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} required>
                <option value="">Select a person</option>
                {employees.filter((employee) => employee.is_active).map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Assigned date
              <input className="field mt-1" type="date" value={assignedDate} onChange={(event) => setAssignedDate(event.target.value)} required />
            </label>
            {assignError ? <p className="text-sm text-rose-700 dark:text-rose-300">{assignError}</p> : null}
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving…' : 'Create assignment'}
            </button>
          </form>
        </Panel>
      </div>
      {returning ? (
        <Modal title={`Return ${returning.asset_tag || 'asset'}`} onClose={() => setReturning(null)}>
          <form className="space-y-3" onSubmit={submitReturn}>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              {returning.asset_name} is with {returning.employee_name}. This posts to the assignment return endpoint.
            </p>
            <label className="block text-sm font-semibold">
              Returned date
              <input className="field mt-1" type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} required />
            </label>
            <label className="block text-sm font-semibold">
              Condition on return
              <select className="field mt-1" value={returnCondition} onChange={(event) => setReturnCondition(event.target.value)}>
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Notes
              <textarea className="field mt-1" rows={3} value={returnNotes} onChange={(event) => setReturnNotes(event.target.value)} />
            </label>
            {formError ? <p className="text-sm text-rose-700 dark:text-rose-300">{formError}</p> : null}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Returning…' : 'Confirm return'}
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
