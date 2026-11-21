import React, { useEffect, useState } from 'react';
import { AssetDetail } from '../../types';
import { api } from '../../services/api';
import {
  X,
  FileDown,
  QrCode,
  Calendar,
  DollarSign,
  Cpu,
  History,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface AssetDetailModalProps {
  assetId: string;
  onClose: () => void;
  onOpenQr: (assetId: string) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ assetId, onClose, onOpenQr }) => {
  const [detail, setDetail] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'maintenance' | 'warranties'>('overview');

  useEffect(() => {
    loadDetail();
  }, [assetId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await api.getAssetDetail(assetId);
      setDetail(data);
    } catch (err) {
      console.error('Failed to load asset detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {detail?.asset_tag || 'Loading...'}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {detail?.name || 'Asset Details'}
              </h2>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Serial Number: <span className="font-mono text-slate-700 dark:text-slate-300">{detail?.serial_number}</span> · {detail?.manufacturer} {detail?.model}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQr(assetId)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
              title="Show QR Code Tag"
            >
              <QrCode className="h-3.5 w-3.5 text-indigo-500" />
              <span>QR Tag</span>
            </button>

            <a
              href={api.getAssetSpecSheetPdfUrl(assetId)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 shadow-sm"
              title="Download formal spec sheet PDF"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </a>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading || !detail ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div>
            {/* Modal Subtabs */}
            <div className="flex border-b border-slate-200 px-6 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Overview & Financials
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === 'assignments'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Assignment History ({detail.assignments_history?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === 'maintenance'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Maintenance & Repairs ({detail.maintenance_history?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('warranties')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === 'warranties'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Warranties ({detail.warranties?.length || 0})
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {activeTab === 'overview' && (
                <>
                  {/* Depreciation & Valuation Highlights */}
                  {detail.depreciation && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Depreciation & Lifecycle Valuation ({detail.depreciation_method.replace('_', ' ')})
                        </span>
                        {detail.depreciation.is_past_eol ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">
                            <AlertTriangle className="h-3 w-3" /> Past End-of-Life
                          </span>
                        ) : detail.depreciation.is_approaching_eol ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                            <Clock className="h-3 w-3" /> Approaching EOL ({detail.depreciation.remaining_months} mos)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Lifecycle Active
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-800">
                          <div className="text-[10px] text-slate-400 uppercase">Purchase Cost</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {formatCurrency(detail.purchase_cost)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-800">
                          <div className="text-[10px] text-slate-400 uppercase">Current Book Value</div>
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {formatCurrency(detail.depreciation.current_book_value)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-800">
                          <div className="text-[10px] text-slate-400 uppercase">Accumulated Deprec.</div>
                          <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {formatCurrency(detail.depreciation.accumulated_depreciation)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-800">
                          <div className="text-[10px] text-slate-400 uppercase">Age / Lifespan</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {detail.depreciation.age_months} / {detail.expected_lifespan_months} mos
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                          <span>Depreciation Progress</span>
                          <span>{detail.depreciation.percent_depreciated}% Depreciated</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(100, detail.depreciation.percent_depreciated)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General Specifications Table */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      Equipment Specifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{detail.category_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{detail.department_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                        <span className="text-slate-500">Vendor:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{detail.vendor_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                        <span className="text-slate-500">Physical Location:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{detail.location}</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{detail.status}</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                        <span className="text-slate-500">Condition:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{detail.condition}</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                        <span className="text-slate-500">Purchase Date:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{detail.purchase_date}</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                        <span className="text-slate-500">Salvage Value:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(detail.salvage_value)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hardware Specs JSON Attributes */}
                  {detail.specifications && Object.keys(detail.specifications).length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                        Hardware Profile
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(detail.specifications).map(([key, val]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 font-mono"
                          >
                            <span className="text-slate-500 capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-slate-900 dark:text-white font-semibold">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail.notes && (
                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Notes: </span>
                      {detail.notes}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-3">
                  {detail.assignments_history.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">No assignment records on file.</div>
                  ) : (
                    detail.assignments_history.map(a => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white">{a.employee_name}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              a.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <div className="mt-2 text-slate-500 flex items-center gap-4 text-[11px]">
                          <span>Assigned: {a.assigned_date}</span>
                          {a.returned_date && <span>Returned: {a.returned_date}</span>}
                          <span>Condition: {a.condition_on_assignment} {a.condition_on_return ? `➔ ${a.condition_on_return}` : ''}</span>
                        </div>
                        {a.notes && <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300">{a.notes}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="space-y-3">
                  {detail.maintenance_history.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">No maintenance records on file.</div>
                  ) : (
                    detail.maintenance_history.map(m => (
                      <div
                        key={m.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white">{m.title}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {formatCurrency(m.cost)}
                          </span>
                        </div>
                        <div className="mt-1 text-slate-500 text-[11px] flex items-center gap-3">
                          <span>Type: {m.maintenance_type}</span>
                          <span>Scheduled: {m.scheduled_date}</span>
                          <span>Status: {m.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'warranties' && (
                <div className="space-y-3">
                  {detail.warranties.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">No active warranties registered.</div>
                  ) : (
                    detail.warranties.map(w => (
                      <div
                        key={w.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white">{w.provider_name}</span>
                          <span className="font-mono text-xs text-slate-500">Policy: {w.policy_number}</span>
                        </div>
                        <div className="mt-1 text-slate-500 text-[11px]">
                          Coverage: {w.start_date} to {w.end_date} · {w.warranty_type}
                        </div>
                        {w.coverage_details && (
                          <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300">{w.coverage_details}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
