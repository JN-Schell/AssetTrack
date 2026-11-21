import React, { useState, useEffect } from 'react';
import { SoftwareProduct, SoftwareLicense, Employee, Asset } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  KeyRound,
  Layers,
  Users,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  X,
} from 'lucide-react';

export const SoftwareView: React.FC = () => {
  const { role } = useAuth();
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [products, setProducts] = useState<SoftwareProduct[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Seat Allocation Modal
  const [assigningLicense, setAssigningLicense] = useState<SoftwareLicense | null>(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignAssetId, setAssignAssetId] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);

  const canManage = role === 'ADMIN' || role === 'ASSET_MANAGER';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [licList, prodList, empList, assetList] = await Promise.all([
        api.getSoftwareLicenses(),
        api.getSoftwareProducts(),
        api.getEmployees(),
        api.getAssets(),
      ]);
      setLicenses(licList);
      setProducts(prodList);
      setEmployees(empList);
      setAssets(assetList);
      if (empList.length > 0) setAssignEmployeeId(empList[0].id);
    } catch (err) {
      console.error('Failed to load software data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSeatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningLicense) return;
    setAssignError(null);
    try {
      await api.assignSoftwareSeat(assigningLicense.id, {
        employee_id: assignEmployeeId || undefined,
        asset_id: assignAssetId || undefined,
        assigned_date: new Date().toISOString().split('T')[0],
      });
      setAssigningLicense(null);
      loadData();
    } catch (err: any) {
      setAssignError(err.message || 'Seat assignment failed');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Software License Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track enterprise software products, seat pool allocations, expiration countdowns, and subscription spend
          </p>
        </div>
      </div>

      {/* Software Products & Licenses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {licenses.map(lic => {
          const utilPct = lic.utilization_rate;
          let utilColor = 'bg-blue-600';
          if (utilPct >= 90) utilColor = 'bg-amber-500';
          if (utilPct === 100) utilColor = 'bg-rose-500';

          return (
            <div
              key={lic.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {lic.license_type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {lic.software_name || 'Software Subscription'}
                    </h3>
                  </div>

                  {lic.is_expired ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                      Expired
                    </span>
                  ) : lic.is_expiring_soon ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Expiring Soon
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg truncate">
                  Key: {lic.license_key}
                </div>

                {/* Seat Utilization Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Seat Utilization</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {lic.assigned_seats} / {lic.total_seats} Seats ({utilPct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${utilColor} rounded-full transition-all`}
                      style={{ width: `${Math.min(100, utilPct)}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {lic.available_seats} seats currently unassigned and ready for allocation
                  </div>
                </div>

                {/* Cost and Dates */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Annual Spend</span>
                    <div className="font-bold text-slate-900 dark:text-white">{formatCurrency(lic.cost)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Expiration</span>
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      {lic.expiration_date || 'Perpetual'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Vendor: {lic.vendor_name || 'Direct'}</span>
                {canManage && (
                  <button
                    disabled={lic.available_seats <= 0}
                    onClick={() => {
                      setAssignError(null);
                      setAssigningLicense(lic);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Assign Seat</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Assign Seat */}
      {assigningLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setAssigningLicense(null)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Allocate Software Seat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Assign seat from <strong>{assigningLicense.software_name}</strong> pool ({assigningLicense.available_seats} remaining)
            </p>

            {assignError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignSeatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign To Employee
                </label>
                <select
                  value={assignEmployeeId}
                  onChange={e => setAssignEmployeeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">None / Hardware Bound</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} ({e.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bind To Hardware Device (Optional)
                </label>
                <select
                  value={assignAssetId}
                  onChange={e => setAssignAssetId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">None / User Subscription</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.asset_tag} — {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningLicense(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Allocate Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
