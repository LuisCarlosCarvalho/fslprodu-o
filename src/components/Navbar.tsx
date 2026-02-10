import { Link } from './Link';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="FSL Solution" className="h-8 w-8 sm:h-10 sm:w-10" />
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
                  onClick={() => signOut()}
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
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link href="/" className="block py-2 text-gray-700">Inicio</Link>
            <Link href="/services" className="block py-2 text-gray-700">Serviços</Link>
            <Link href="/portfolio" className="block py-2 text-gray-700">Portfolio</Link>
            <Link href="/blog" className="block py-2 text-gray-700">Blog</Link>
            <Link href="/infoproducts" className="block py-2 text-gray-700">SEO de Gestão</Link>
            <Link href="/contact" className="block py-2 text-gray-700">Contato</Link>

            {user ? (
              <>
                <Link
                  href={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="block py-2 text-gray-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block py-2 text-gray-700 w-full text-left"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-gray-700">Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
