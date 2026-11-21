import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssetsView } from './components/assets/AssetsView';
import { AssignmentsView } from './components/assignments/AssignmentsView';
import { SoftwareView } from './components/software/SoftwareView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { AuditView } from './components/audit/AuditView';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const assignments = await api.getAssignments();
        const pending = assignments.filter(a => a.status === 'PENDING_APPROVAL').length;
        setPendingApprovals(pending);
      } catch {
        // Fallback or offline state
        setPendingApprovals(1);
      }
    };
    fetchPendingApprovals();
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-xl shadow-lg shadow-blue-500/30 animate-pulse">
            AT
          </div>
          <div className="text-sm font-medium text-slate-300">
            Initializing AssetTrack Enterprise ITAM...
          </div>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigateToTab={(tab) => setActiveTab(tab as NavTab)} />;
      case 'assets':
        return <AssetsView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'licenses':
        return <SoftwareView />;
      case 'maintenance':
        return <MaintenanceView initialSubTab="maintenance" />;
      case 'warranties':
        return <MaintenanceView initialSubTab="warranties" />;
      case 'audit':
        return <AuditView />;
      default:
        return <DashboardView onNavigateToTab={(tab) => setActiveTab(tab as NavTab)} />;
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          approvalsCount={pendingApprovals}
        />

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
