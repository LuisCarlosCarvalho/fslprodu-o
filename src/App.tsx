import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { InstallPWA } from './components/InstallPWA';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Loader2 } from 'lucide-react';

// Lazy loading pages
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const InfoproductsPage = lazy(() => import('./pages/InfoproductsPage').then(m => ({ default: m.InfoproductsPage })));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminSetupPage = lazy(() => import('./pages/AdminSetupPage'));
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage').then(m => ({ default: m.ProductDetailsPage })));
const TemplateDemoPage = lazy(() => import('./pages/TemplateDemoPage').then(m => ({ default: m.TemplateDemoPage })));
const VisualDemoPage = lazy(() => import('./pages/VisualDemoPage').then(m => ({ default: m.VisualDemoPage })));
const CulturaDataDriven = lazy(() => import('./pages/hub/analytics/CulturaDataDriven'));
const PasswordChangeModal = lazy(() => import('./components/auth/PasswordChangeModal').then(m => ({ default: m.PasswordChangeModal })));
import { MaintenancePage } from './pages/MaintenancePage';
// Loading Fallback
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Carregando conteúdo...</p>
    </div>
  );
}

// Protected Route for any authenticated user
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Protected Route for Admin users only
function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, profile, loading } = useAuth();

  // Fast-path for master admin avoids awaiting initial profile download
  const isMasterAdmin = user?.email?.includes('admin@');
  
  if (loading && !isMasterAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se já temos a identidade, mas sem o profile oficial, e for o master, bypass!
  if ((!user || profile?.role !== 'admin') && !isMasterAdmin) {
    // Only kick out once loading is totally done
    if (!loading) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}


function Layout() {
  const { profile, user, reloadProfile } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={null}>
        {user && profile?.force_password_reset && (
          <PasswordChangeModal 
            userId={user.id} 
            onSuccess={() => reloadProfile()} 
          />
        )}
      </Suspense>
      <Navbar />
      <FloatingWhatsApp />
      <InstallPWA />
      <main className="flex-grow pt-16">
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public Routes */}
          {/* UNDER MAINTENANCE */}
          <Route path="/" element={<MaintenancePage />} />
          <Route path="/services" element={<MaintenancePage />} />
          <Route path="/services/*" element={<MaintenancePage />} />
          <Route path="/portfolio" element={<MaintenancePage />} />
          <Route path="/contact" element={<MaintenancePage />} />
          <Route path="/infoproducts" element={<MaintenancePage />} />
          <Route path="/blog" element={<MaintenancePage />} />
          <Route path="/blog/:slug" element={<MaintenancePage />} />
          <Route path="/hub/analytics/cultura-data-driven-guia-definitivo" element={<MaintenancePage />} />
          <Route path="/admin-setup" element={<AdminSetupPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <StartDashboard />
              </RequireAuth>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/approvals"
            element={
              <RequireAdmin>
                <ApprovalsPage />
              </RequireAdmin>
            }
          />

          {/* Public Template Demo Route */}
          <Route path="/demo/:filename" element={<MaintenancePage />} />
          <Route path="/portfolio/demo/:id" element={<MaintenancePage />} />

          {/* Public Product Route (Must be last to avoid conflicts) */}
          <Route path="/:public_code" element={<MaintenancePage />} />

          {/* Fallback */}
          <Route path="*" element={<MaintenancePage />} />
        </Routes>
      </Suspense>
    </main>
    <Footer />
  </div>
);
}

// Component to decide which dashboard to show based on role
// If accessed directly via /dashboard, admins get redirected to /admin, clients stay
// But to keep it simple and consistent with previous logic:
function StartDashboard() {
  const { profile } = useAuth();
  
  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <ClientDashboard />;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Algo deu errado</h1>
            <p className="text-gray-600 mb-4">Ocorreu um erro inesperado na aplicação.</p>
             {this.state.error && (
              <pre className="mt-4 p-4 bg-red-50 text-red-800 rounded text-left overflow-auto max-w-lg mx-auto text-sm">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { ToastContainer } from './components/ui/Toast';

export default function App() {
  // Removed strict EnvCheck block to allow safe fallbacks in supabase.ts to operate
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <Layout />
          <ToastContainer />
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
