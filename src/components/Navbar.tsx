import { Link } from './Link';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 z-[9999] px-4 pt-4 pointer-events-none">
      <div className="max-w-7xl mx-auto glass-card border-white/20 px-6 py-3 pointer-events-auto">
        <div className="flex justify-between h-12">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="FSL Solution" className="h-8 w-8 sm:h-10 sm:w-10" loading="lazy" onError={(e) => { e.currentTarget.src = '/logo.png'; e.currentTarget.onerror = null; }} />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                <span className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">FSL Solution</span>
                <span className="text-[10px] sm:text-sm font-medium text-blue-600 uppercase tracking-wider -mt-1 sm:mt-0">Digital</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900">Inicio</Link>
            <Link href="/services" className="text-gray-700 hover:text-gray-900">Serviços</Link>
            <Link href="/portfolio" className="text-gray-700 hover:text-gray-900">Portfolio</Link>
            <Link href="/blog" className="text-gray-700 hover:text-gray-900">Blog</Link>
            <Link href="/infoproducts" className="text-gray-700 hover:text-gray-900">SEO de Gestão</Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">Contato</Link>

            {user ? (
              <>
                <Link
                  href={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await signOut();
                      window.location.href = '/login';
                    } catch (error) {
                      console.error('Logout error:', error);
                      window.location.href = '/login';
                    }
                  }}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-gray-900">Login</Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 md:hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-200 z-[9999]">
          <div className="glass-card bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl p-4 space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-bold" onClick={() => setMobileMenuOpen(false)}>
              Inicio
            </Link>
            <Link href="/services" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-bold" onClick={() => setMobileMenuOpen(false)}>
              Serviços
            </Link>
            <Link href="/portfolio" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-bold" onClick={() => setMobileMenuOpen(false)}>
              Portfolio
            </Link>
            <Link href="/blog" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-bold" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>
            <Link href="/infoproducts" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-bold" onClick={() => setMobileMenuOpen(false)}>
              SEO de Gestão
            </Link>
            <Link href="/contact" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-bold" onClick={() => setMobileMenuOpen(false)}>
              Contato
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
              {user ? (
                <>
                  <Link
                    href={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      try {
                        await signOut();
                        window.location.href = '/login';
                      } catch (error) {
                        window.location.href = '/login';
                      }
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold w-full text-left"
                  >
                    <LogOut size={18} />
                    Sair
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl transition-all font-bold justify-center" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
