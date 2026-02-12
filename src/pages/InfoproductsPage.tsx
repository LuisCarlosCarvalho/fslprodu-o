import { useState, useEffect } from 'react';
import { ShoppingCart, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { supabase, MarketingProduct } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { showToast } from '../components/ui/Toast';

export function InfoproductsPage() {
  const [products, setProducts] = useState<MarketingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    showToast('Link copiado com sucesso!', 'success');
  };

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">SEO de Gestão</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Soluções completas de SEO e gestão digital para impulsionar sua presença online e resultados
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm p-12">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Nenhum produto disponível no momento
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Estamos preparando novas soluções de SEO e gestão para você. Fique atento às novidades!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Image Area */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                   {product.image_urls && product.image_urls.length > 0 ? (
                    <img
                      src={product.image_urls[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800&fallback=marketing';
                      }}
                    />
                   ) : product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800&fallback=marketing_alt';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
                      <ShoppingCart size={48} className="text-blue-200" />
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(product.public_code);
                      }}
                      className="bg-white/90 backdrop-blur text-gray-700 p-2 rounded-full hover:bg-white hover:text-blue-600 shadow-sm transition-colors"
                      title="Copiar Link"
                    >
                      <LinkIcon size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <div className="mb-4">
                    <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      #{product.public_code}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  {product.subtitle && (
                    <p className="text-sm text-blue-600 font-medium mb-3">
                      {product.subtitle}
                    </p>
                  )}

                  <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-grow">
                    {product.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <Link
                      to={`/${product.public_code}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Ver Detalhes
                      <ExternalLink size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 bg-blue-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              Precisa de uma solução personalizada?
            </h2>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Nossa equipe de especialistas em SEO e gestão digital está pronta para criar uma estratégia exclusiva para o seu negócio.
            </p>
            <Link
              to="/contact?service=infoproducts"
              className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Falar com Consultor
              <ExternalLink size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
