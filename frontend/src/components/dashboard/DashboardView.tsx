import React, { useEffect, useState } from 'react';
import { DashboardOverview } from '../../types';
import { api } from '../../services/api';
import {
  DollarSign,
  TrendingDown,
  Laptop,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTab }) => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardOverview();
      setData(res);
    } catch (err) {
      console.error('Error fetching dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <span className="text-xs text-slate-500">Calculating fleet metrics & depreciation...</span>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Highlights */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white shadow-xl shadow-blue-950/20">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Enterprise Asset Intelligence</h1>
          <p className="mt-1 text-xs text-blue-200">
            Real-time telemetry across {data.total_assets} hardware assets, active software licenses, and lifecycle milestones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('assets')}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur hover:bg-white/20 transition-colors"
          >
            <span>View All Inventory</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fleet Acquisition Value */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Acquisition Value</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(data.total_asset_valuation)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Original total procurement spend
          </div>
        </div>

        {/* Current Book Value (After Depreciation) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Current Book Value</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(data.total_current_book_value)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Depreciated: {formatCurrency(data.total_accumulated_depreciation)}
          </div>
        </div>

        {/* Operational Deployment Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Deployment Ratio</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
              <Laptop className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {data.total_assets > 0
              ? `${Math.round((data.assigned_assets / data.total_assets) * 100)}%`
              : '0%'}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {data.assigned_assets} assigned · {data.in_stock_assets} in stock
          </div>
        </div>

        {/* Action Items / Attention Required */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Attention Required</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {data.approaching_eol_count + data.active_maintenance_count + data.pending_approval_count}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {data.approaching_eol_count} near EOL · {data.active_maintenance_count} repairs · {data.pending_approval_count} approvals
          </div>
        </div>
      </div>

      {/* Middle Section: Spend Trends & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Trends Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span>Monthly Technology Expenditure Trends</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Hardware acquisition, maintenance repairs, and software licensing spend
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-500"></span> Hardware
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500"></span> Licenses
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500"></span> Repairs
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {data.spend_trends.map(t => {
              const maxVal = 25000;
              const hwPct = Math.min(100, (t.hardware_spend / maxVal) * 100);
              const licPct = Math.min(100, (t.license_spend / maxVal) * 100);
              const repPct = Math.min(100, (t.maintenance_spend / maxVal) * 100);
              const totalMonth = t.hardware_spend + t.license_spend + t.maintenance_spend;

              return (
                <div key={t.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">{t.month}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalMonth)}</span>
                  </div>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      style={{ width: `${hwPct}%` }}
                      className="bg-blue-500 transition-all"
                      title={`Hardware: ${formatCurrency(t.hardware_spend)}`}
                    ></div>
                    <div
                      style={{ width: `${licPct}%` }}
                      className="bg-indigo-500 transition-all"
                      title={`Licenses: ${formatCurrency(t.license_spend)}`}
                    ></div>
                    <div
                      style={{ width: `${repPct}%` }}
                      className="bg-amber-500 transition-all"
                      title={`Repairs: ${formatCurrency(t.maintenance_spend)}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Status Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <PieChart className="h-4 w-4 text-indigo-500" />
              <span>Fleet Operational Status</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Distribution across asset state lifecycle
            </span>

            <div className="mt-5 space-y-3">
              {data.status_breakdown.map(s => {
                const count = s.count;
                const pct = data.total_assets > 0 ? Math.round((count / data.total_assets) * 100) : 0;
                let color = 'bg-blue-500';
                if (s.status === 'ASSIGNED') color = 'bg-indigo-600';
                if (s.status === 'IN_STOCK') color = 'bg-emerald-500';
                if (s.status === 'UNDER_MAINTENANCE') color = 'bg-amber-500';
                if (s.status === 'DECOMMISSIONED') color = 'bg-slate-500';

                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {s.status.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span>Lifecycle Policies Active</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Straight-Line & Double-Declining depreciation schedules running daily.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Valuation Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Equipment Category Distribution</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hardware asset volume and total initial capital expenditure by category
            </span>
          </div>
          <button
            onClick={() => onNavigateToTab('assets')}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400 font-medium"
          >
            Explore Catalog →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.categories_breakdown.map(cat => (
            <div
              key={cat.category_id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">{cat.category_name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {cat.count} units in service
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {formatCurrency(cat.total_value)}
                </div>
                <div className="text-[10px] text-slate-400">Procured Total</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
