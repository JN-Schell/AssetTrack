import React, { useState, useEffect } from 'react';
import { Asset, Category, Department } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AssetDetailModal } from './AssetDetailModal';
import { AssetQrModal } from './AssetQrModal';
import { AssetCreateModal } from './AssetCreateModal';
import { CsvImportModal } from './CsvImportModal';
import {
  Search,
  Plus,
  Upload,
  FileDown,
  QrCode,
  Eye,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const AssetsView: React.FC = () => {
  const { role } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [approachingEol, setApproachingEol] = useState(false);

  // Modals state
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [qrAssetId, setQrAssetId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const canManage = role === 'ADMIN' || role === 'ASSET_MANAGER';

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadAssets();
  }, [search, selectedCategory, selectedDepartment, selectedStatus, approachingEol]);

  const loadLookups = async () => {
    try {
      const [cats, depts] = await Promise.all([api.getCategories(), api.getDepartments()]);
      setCategories(cats);
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load lookups:', err);
    }
  };

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await api.getAssets({
        search: search || undefined,
        category_id: selectedCategory || undefined,
        department_id: selectedDepartment || undefined,
        status: selectedStatus || undefined,
        approaching_eol: approachingEol ? true : undefined,
      });
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, tag: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete asset ${tag}?`)) {
      return;
    }
    try {
      await api.deleteAsset(id);
      loadAssets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'UNDER_MAINTENANCE':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'PENDING_DISPOSAL':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'DECOMMISSIONED':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800';
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Hardware Asset Inventory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cataloged equipment, live depreciation metrics, and QR asset tracking tags
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
              >
                <Upload className="h-3.5 w-3.5 text-emerald-500" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Register Asset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tag, serial #, name, model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="IN_STOCK">In Stock (Available)</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="PENDING_DISPOSAL">Pending Disposal</option>
              <option value="DECOMMISSIONED">Decommissioned</option>
            </select>
          </div>
        </div>

        {/* Second Row: EOL Toggle & Results summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={approachingEol}
              onChange={e => setApproachingEol(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <span className="font-medium">Filter: Approaching End of Life (≤ 6 months remaining)</span>
          </label>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span>Showing <strong>{assets.length}</strong> matching assets</span>
            {(search || selectedCategory || selectedDepartment || selectedStatus || approachingEol) && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedDepartment('');
                  setSelectedStatus('');
                  setApproachingEol(false);
                }}
                className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400 font-medium"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Assets Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px] dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Asset Identification</th>
                <th className="px-5 py-3.5">Equipment / Model</th>
                <th className="px-5 py-3.5">Category & Dept</th>
                <th className="px-5 py-3.5">Valuation / Deprec.</th>
                <th className="px-5 py-3.5">Status & Assignee</th>
                <th className="px-5 py-3.5">Condition</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      <span>Loading fleet inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No hardware assets found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                assets.map(asset => {
                  const deprec = asset.depreciation;
                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Asset Tag & Serial */}
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {asset.asset_tag}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          SN: {asset.serial_number}
                        </div>
                      </td>

                      {/* Equipment & Model */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {asset.manufacturer} · {asset.model}
                        </div>
                      </td>

                      {/* Category & Department */}
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {asset.category_name || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {asset.department_name || 'Central Storage'}
                        </div>
                      </td>

                      {/* Valuation & Depreciation */}
                      <td className="px-5 py-3.5">
                        {deprec ? (
                          <div>
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(deprec.current_book_value)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Cost: {formatCurrency(asset.purchase_cost)} ({deprec.percent_depreciated}%)
                            </div>
                          </div>
                        ) : (
                          <span className="font-semibold">{formatCurrency(asset.purchase_cost)}</span>
                        )}
                      </td>

                      {/* Status & Assignee */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${getStatusBadge(
                            asset.status
                          )}`}
                        >
                          {asset.status.replace('_', ' ')}
                        </span>
                        {asset.current_assignee && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                            {asset.current_assignee}
                          </div>
                        )}
                      </td>

                      {/* Condition */}
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                          {asset.condition}
                        </span>
                        <div className="text-[10px] text-slate-400">{asset.location}</div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAssetId(asset.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="View Full Specifications & Life Cycle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setQrAssetId(asset.id)}
                            className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                            title="Generate Physical QR Tag"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>

                          <a
                            href={api.getAssetSpecSheetPdfUrl(asset.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            title="Export PDF Spec Sheet"
                          >
                            <FileDown className="h-4 w-4" />
                          </a>

                          {canManage && (
                            <button
                              onClick={() => handleDelete(asset.id, asset.asset_tag)}
                              className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                              title="Delete Asset"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedAssetId && (
        <AssetDetailModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onOpenQr={id => {
            setSelectedAssetId(null);
            setQrAssetId(id);
          }}
        />
      )}

      {qrAssetId && (
        <AssetQrModal
          assetId={qrAssetId}
          onClose={() => setQrAssetId(null)}
        />
      )}

      {showCreateModal && (
        <AssetCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadAssets();
          }}
        />
      )}

      {showImportModal && (
        <CsvImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            loadAssets();
          }}
        />
      )}
    </div>
  );
};
