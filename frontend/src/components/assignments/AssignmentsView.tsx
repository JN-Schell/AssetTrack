import React, { useState, useEffect } from 'react';
import { Assignment, Asset, Employee } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRightLeft,
  Plus,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';

export const AssignmentsView: React.FC = () => {
  const { role } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [returnAssignmentItem, setReturnAssignmentItem] = useState<Assignment | null>(null);

  // Form states
  const [checkoutData, setCheckoutData] = useState({
    asset_id: '',
    employee_id: '',
    assigned_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    condition_on_assignment: 'EXCELLENT',
    assignment_notes: '',
  });

  const [returnData, setReturnData] = useState({
    returned_date: new Date().toISOString().split('T')[0],
    condition_on_return: 'GOOD',
    return_notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const canApprove = role === 'ADMIN' || role === 'ASSET_MANAGER';
  const canManage = role === 'ADMIN' || role === 'ASSET_MANAGER' || role === 'TECHNICIAN';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asgList, assetList, empList] = await Promise.all([
        api.getAssignments(),
        api.getAssets({ status: 'IN_STOCK' }),
        api.getEmployees(),
      ]);
      setAssignments(asgList);
      setAvailableAssets(assetList);
      setEmployees(empList);
      if (assetList.length > 0) {
        setCheckoutData(prev => ({ ...prev, asset_id: assetList[0].id }));
      }
      if (empList.length > 0) {
        setCheckoutData(prev => ({ ...prev, employee_id: empList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load assignments data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData.asset_id || !checkoutData.employee_id) {
      setFormError('Please select both an equipment asset and an employee');
      return;
    }
    setFormError(null);
    try {
      await api.createAssignment({
        ...checkoutData,
        expected_return_date: checkoutData.expected_return_date || undefined,
      });
      setShowCheckoutModal(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to allocate assignment');
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnAssignmentItem) return;
    try {
      await api.returnAssignment(returnAssignmentItem.id, returnData);
      setReturnAssignmentItem(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to process return');
    }
  };

  const handleApprovalAction = async (assignmentId: string, status: 'ACTIVE' | 'REJECTED') => {
    try {
      await api.approveOrRejectAssignment(assignmentId, {
        status,
        notes: status === 'ACTIVE' ? 'Approved by IT Asset Management' : 'Denied per equipment policy',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Approval action failed');
    }
  };

  const pendingApprovals = assignments.filter(a => a.status === 'PENDING_APPROVAL');
  const activeAssignments = assignments.filter(a => a.status === 'ACTIVE');
  const pastAssignments = assignments.filter(a => a.status === 'RETURNED' || a.status === 'REJECTED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Personnel & Equipment Assignments</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage device checkout, conflict-free assignments, condition verification, and approval queues
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setFormError(null);
              setShowCheckoutModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Check Out Equipment</span>
          </button>
        )}
      </div>

      {/* Pending Approval Callout (if any) */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Pending Equipment Approval Queue ({pendingApprovals.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {pendingApprovals.map(p => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white p-3.5 shadow-sm border border-amber-100 dark:bg-slate-900 dark:border-amber-950 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {p.employee_name} requested <span className="text-blue-600 dark:text-blue-400">{p.asset_name} ({p.asset_tag})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Requested Date: {p.assigned_date} {p.assignment_notes && `· Notes: ${p.assignment_notes}`}
                  </div>
                </div>

                {canApprove ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprovalAction(p.id, 'ACTIVE')}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleApprovalAction(p.id, 'REJECTED')}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-600 font-medium">Awaiting Manager Approval</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Assignments Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Active Deployments ({activeAssignments.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Currently checked out to personnel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px] dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Equipment Tag & Name</th>
                <th className="px-5 py-3">Assigned Employee</th>
                <th className="px-5 py-3">Checkout Date</th>
                <th className="px-5 py-3">Expected Return</th>
                <th className="px-5 py-3">Condition Checked Out</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active assignments currently in the field.
                  </td>
                </tr>
              ) : (
                activeAssignments.map(asg => (
                  <tr key={asg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{asg.asset_tag}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{asg.asset_name}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{asg.employee_name}</div>
                      <div className="text-[11px] text-slate-400">{asg.employee_email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {asg.assigned_date}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">
                      {asg.expected_return_date || 'Indefinite'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {asg.condition_on_assignment}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {canManage && (
                        <button
                          onClick={() => {
                            setReturnAssignmentItem(asg);
                            setReturnData({
                              returned_date: new Date().toISOString().split('T')[0],
                              condition_on_return: asg.condition_on_assignment || 'GOOD',
                              return_notes: '',
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <ArrowRightLeft className="h-3 w-3 text-blue-500" />
                          <span>Check In (Return)</span>
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

      {/* Historical Assignment Archive */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Historical Completed Returns & Archive ({pastAssignments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px] dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-2.5">Asset</th>
                <th className="px-5 py-2.5">Employee</th>
                <th className="px-5 py-2.5">Duration</th>
                <th className="px-5 py-2.5">Return Condition</th>
                <th className="px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pastAssignments.map(asg => (
                <tr key={asg.id} className="text-slate-600 dark:text-slate-400">
                  <td className="px-5 py-2.5 font-mono">{asg.asset_tag} - {asg.asset_name}</td>
                  <td className="px-5 py-2.5">{asg.employee_name}</td>
                  <td className="px-5 py-2.5 text-[11px] font-mono">
                    {asg.assigned_date} ➔ {asg.returned_date || 'N/A'}
                  </td>
                  <td className="px-5 py-2.5">{asg.condition_on_return || 'N/A'}</td>
                  <td className="px-5 py-2.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium dark:bg-slate-800">
                      {asg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Check Out Equipment */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Check Out Equipment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Allocate available in-stock hardware to an employee record
            </p>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Available Hardware Asset (In Stock) *
                </label>
                {availableAssets.length === 0 ? (
                  <div className="p-3 text-xs text-amber-600 bg-amber-50 rounded-xl dark:bg-amber-950/50">
                    No equipment currently in stock. Return checked out assets or register new hardware first.
                  </div>
                ) : (
                  <select
                    required
                    value={checkoutData.asset_id}
                    onChange={e => setCheckoutData({ ...checkoutData, asset_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {availableAssets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.asset_tag} — {a.name} ({a.category_name})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee Assignee *
                </label>
                <select
                  required
                  value={checkoutData.employee_id}
                  onChange={e => setCheckoutData({ ...checkoutData, employee_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.job_title} · {emp.department_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Checkout Date
                  </label>
                  <input
                    type="date"
                    required
                    value={checkoutData.assigned_date}
                    onChange={e => setCheckoutData({ ...checkoutData, assigned_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Return
                  </label>
                  <input
                    type="date"
                    value={checkoutData.expected_return_date}
                    onChange={e => setCheckoutData({ ...checkoutData, expected_return_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Checkout Condition
                </label>
                <select
                  value={checkoutData.condition_on_assignment}
                  onChange={e => setCheckoutData({ ...checkoutData, condition_on_assignment: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="NEW">New</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Deployment instructions, accessories provided..."
                  value={checkoutData.assignment_notes}
                  onChange={e => setCheckoutData({ ...checkoutData, assignment_notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableAssets.length === 0}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Assign Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Check In / Return Equipment */}
      {returnAssignmentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setReturnAssignmentItem(null)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Check In Equipment Return
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Returning <strong>{returnAssignmentItem.asset_tag}</strong> from <strong>{returnAssignmentItem.employee_name}</strong>
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  required
                  value={returnData.returned_date}
                  onChange={e => setReturnData({ ...returnData, returned_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Returned Operational Condition
                </label>
                <select
                  value={returnData.condition_on_return}
                  onChange={e => setReturnData({ ...returnData, condition_on_return: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="EXCELLENT">Excellent (Ready for Re-issue)</option>
                  <option value="GOOD">Good (Normal cosmetic wear)</option>
                  <option value="FAIR">Fair (Noticeable scratches)</option>
                  <option value="POOR">Poor (Requires inspection)</option>
                  <option value="DAMAGED">Damaged (Routes to Maintenance!)</option>
                </select>
                {returnData.condition_on_return === 'DAMAGED' && (
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                    Note: Damaged returns will automatically set asset status to <strong>UNDER_MAINTENANCE</strong>.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inspection / Return Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Hardware inspection results, battery health, reported issues..."
                  value={returnData.return_notes}
                  onChange={e => setReturnData({ ...returnData, return_notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReturnAssignmentItem(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
