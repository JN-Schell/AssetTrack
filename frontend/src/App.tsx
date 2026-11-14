import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { Shell } from './components/Shell';
import { AssetsPage } from './pages/AssetsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { SoftwarePage } from './pages/SoftwarePage';

function SessionGate({ children }: { children: ReactNode }) {
  const { ready } = useAuth();
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-stone-100 text-sm text-stone-600 dark:bg-stone-950 dark:text-stone-300">
        Loading session…
      </div>
    );
  }
  return children;
}

function Protected() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Shell />;
}

function PublicOnly() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export function App() {
  const { user } = useAuth();
  return (
    <SessionGate>
      <Routes>
        <Route path="/login" element={<PublicOnly />} />
        <Route element={<Protected />}>
          <Route index element={<DashboardPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="software" element={<SoftwarePage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </SessionGate>
  );
}
