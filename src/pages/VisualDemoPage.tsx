import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react';
import { supabase, Portfolio } from '../lib/supabase';

export function VisualDemoPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setItem(data);
      } catch (err) {
        console.error('Erro ao carregar item:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Demonstração não encontrada</h1>
        <button
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar ao Portfólio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Simulation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/portfolio')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            title="Sair da demonstração"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black text-blue-600 tracking-tighter uppercase leading-none">
              PRÉVIA
            </h1>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Desktop View"
          >
            <Monitor size={20} />
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`p-2 rounded-md transition-all ${viewMode === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Tablet View"
          >
            <Tablet size={20} />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Mobile View"
          >
            <Smartphone size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contact')}
            className="hidden sm:block bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            Solicitar Projeto Similar
          </button>
          {item.project_url && item.project_url.startsWith('http') && (
            <a 
              href={item.project_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Ver site real"
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-grow overflow-auto p-4 md:p-8 flex justify-center bg-[#f8f9fa] pattern-grid">
        <div 
          className={`bg-white shadow-2xl transition-all duration-500 ease-in-out border border-gray-200 rounded-t-xl overflow-hidden ${
            viewMode === 'desktop' ? 'w-full' : 
            viewMode === 'tablet' ? 'w-[768px]' : 
            'w-[375px]'
          }`}
          style={{ height: 'fit-content', minHeight: 'calc(100vh - 150px)' }}
        >

          {/* Visual Content (The Image) */}
          <div className="w-full h-full relative">
            <img 
              src={item.image_url} 
              alt={item.title}
              className="w-full h-auto block"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200';
              }}
            />
          </div>

          {/* Bottom Banner */}
          <div className="p-12 text-center bg-gray-50 border-t border-gray-100">
             <h2 className="text-2xl font-bold text-gray-900 mb-2">Gostou deste Design?</h2>
             <p className="text-gray-600 mb-6">Podemos criar algo ainda melhor para sua empresa.</p>
             <button 
               onClick={() => navigate('/contact')}
               className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
             >
               Solicitar Orçamento
             </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .pattern-grid {
          background-image: radial-gradient(#ced4da 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}
