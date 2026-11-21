import React, { useState, useEffect } from 'react';
import { MaintenanceRecord, Warranty, Asset, MaintenanceType, MaintenanceStatus } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Calendar,
  X,
} from 'lucide-react';

interface MaintenanceViewProps {
  initialSubTab?: 'maintenance' | 'warranties';
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ initialSubTab = 'maintenance' }) => {
  const { role } = useAuth();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'maintenance' | 'warranties'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // New Ticket Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    maintenance_type: 'PREVENTATIVE' as MaintenanceType,
    title: '',
    description: '',
    cost: 150,
    scheduled_date: new Date().toISOString().split('T')[0],
    status: 'SCHEDULED' as MaintenanceStatus,
    notes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const canEdit = role === 'ADMIN' || role === 'ASSET_MANAGER' || role === 'TECHNICIAN';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mList, wList, aList] = await Promise.all([
        api.getMaintenanceRecords(),
        api.getWarranties(),
        api.getAssets(),
      ]);
      setRecords(mList);
      setWarranties(wList);
      setAssets(aList);
      if (aList.length > 0) {
        setFormData(prev => ({ ...prev, asset_id: aList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.asset_id) {
      setFormError('Please enter a ticket title and select an asset');
      return;
    }
    setFormError(null);
    try {
      await api.createMaintenanceRecord({
        ...formData,
        cost: Number(formData.cost),
      });
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create work order');
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      await api.updateMaintenanceRecord(id, {
        status: 'COMPLETED',
        completed_date: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete ticket');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Maintenance, Repairs & Warranties
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log technician repair costs, schedule preventative service windows, and track enterprise warranty policies
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setFormError(null);
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Work Order</span>
          </button>
        )}
      </div>

      {/* Subtabs Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium gap-4">
        <button
          onClick={() => setSubTab('maintenance')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            subTab === 'maintenance'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>Maintenance Work Orders ({records.length})</span>
        </button>

        <button
          onClick={() => setSubTab('warranties')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            subTab === 'warranties'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Active Warranties & Coverage ({warranties.length})</span>
        </button>
      </div>

      {/* Tab: Maintenance Work Orders */}
      {subTab === 'maintenance' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px] dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Work Order Title</th>
                  <th className="px-5 py-3">Hardware Asset</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Scheduled Date</th>
                  <th className="px-5 py-3">Cost</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No maintenance work orders recorded.
                    </td>
                  </tr>
                ) : (
                  records.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{rec.title}</div>
                        {rec.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{rec.description}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{rec.asset_tag}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{rec.asset_name}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {rec.maintenance_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {rec.scheduled_date}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(rec.cost)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            rec.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : rec.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {rec.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {canEdit && rec.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleMarkCompleted(rec.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>Complete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Warranties */}
      {subTab === 'warranties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warranties.map(w => (
            <div
              key={w.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {w.warranty_type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{w.provider_name}</h3>
                </div>
                {w.is_active ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">
                    Expired
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Policy Number:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{w.policy_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Covered Equipment:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{w.asset_tag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expiration Date:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{w.end_date}</span>
                </div>
              </div>

              {w.coverage_details && (
                <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  {w.coverage_details}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Work Order */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Create Maintenance Work Order
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Schedule diagnostics, routine servicing, or repairs for an asset
            </p>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Asset *
                </label>
                <select
                  required
                  value={formData.asset_id}
                  onChange={e => setFormData({ ...formData, asset_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.asset_tag} — {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ticket Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Fan Dusting & Thermal Paste Replacement"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Maintenance Type
                  </label>
                  <select
                    value={formData.maintenance_type}
                    onChange={e => setFormData({ ...formData, maintenance_type: e.target.value as MaintenanceType })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="PREVENTATIVE">Preventative</option>
                    <option value="REPAIR">Repair / Break-Fix</option>
                    <option value="UPGRADE">Hardware Upgrade</option>
                    <option value="INSPECTION">Routine Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduled_date}
                    onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as MaintenanceStatus })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress (Active Repair)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Technician Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Diagnostic details, vendor RMA case #, parts ordered..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
