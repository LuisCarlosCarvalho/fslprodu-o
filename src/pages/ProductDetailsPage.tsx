
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, MarketingProduct } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ExternalLink, ArrowLeft, ShoppingCart } from 'lucide-react';
import { ProductGallery } from '../components/ProductGallery';

export function ProductDetailsPage() {
  const { public_code } = useParams();
  const [product, setProduct] = useState<MarketingProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!public_code) return;

      try {
        const { data, error } = await supabase
          .from('marketing_products')
          .select('*')
          .eq('public_code', public_code)
          .eq('status', 'active')
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          setError(true);
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [public_code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
            <p className="text-gray-600 mb-8">
              O produto que você está procurando não está disponível ou o link está incorreto.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <ArrowLeft size={20} />
              Voltar ao Início
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/infoproducts"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para SEO de Gestão
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image Section */}
            <div className="w-full">
              <ProductGallery 
                images={product.image_urls && product.image_urls.length > 0 
                  ? product.image_urls 
                  : product.image_url 
                    ? [product.image_url] 
                    : []
                } 
                title={product.title} 
              />
            </div>

            {/* Content Section */}
            <div className="space-y-8">
              <div>
                <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 font-semibold rounded-full text-sm mb-4">
                  {product.subtitle || 'Oferta Especial'}
                </span>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  {product.title}
                </h1>
                <div className="prose prose-lg text-gray-600 max-w-none">
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                {product.cta_url && (
                  <a
                    href={product.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white text-center px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    {product.cta_label || 'Comprar Agora'}
                    <ExternalLink size={20} />
                  </a>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 text-center">
                  Pagamento seguro • Acesso imediato • Suporte dedicado
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
