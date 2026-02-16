import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { InstallPWA } from './components/InstallPWA';
import { EnvCheck } from './components/EnvCheck';
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
const PasswordChangeModal = lazy(() => import('./components/auth/PasswordChangeModal').then(m => ({ default: m.PasswordChangeModal })));

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
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
      <InstallPWA />
      <main className="flex-grow pt-16">
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/*" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/infoproducts" element={<InfoproductsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
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
          <Route path="/demo/:filename" element={<TemplateDemoPage />} />
          <Route path="/portfolio/demo/:id" element={<VisualDemoPage />} />

          {/* Public Product Route (Must be last to avoid conflicts) */}
          <Route path="/:public_code" element={<ProductDetailsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
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

import { SpeedInsights } from "@vercel/speed-insights/react"

export default function App() {
  const envError = <EnvCheck />;

  if (envError && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
    return envError;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Layout />
        <SpeedInsights />
        <ToastContainer />
      </AuthProvider>
    </ErrorBoundary>
  );
}
