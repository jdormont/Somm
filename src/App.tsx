import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PendingApproval = lazy(() => import('./pages/PendingApproval'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Scanner = lazy(() => import('./pages/Scanner'));
const Preferences = lazy(() => import('./pages/Preferences'));
const Settings = lazy(() => import('./pages/Settings'));
const Cellar = lazy(() => import('./pages/Cellar'));
const Admin = lazy(() => import('./pages/Admin'));
const ScanDetail = lazy(() => import('./pages/ScanDetail'));
const Knowledge = lazy(() => import('./pages/Knowledge'));
const Legal = lazy(() => import('./pages/Legal'));

const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-somm-red-500 animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pending" element={<PendingApproval />} />
            <Route path="/legal" element={<Legal />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history/:id" element={<ScanDetail />} />
              <Route path="/scan" element={<Scanner />} />
              <Route path="/cellar" element={<Cellar />} />
              <Route path="/preferences" element={<Preferences />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
