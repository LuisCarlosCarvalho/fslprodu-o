import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "../components/Link";
import { Eye, AlertTriangle } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  project_url?: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

const categories = [
  "Todos",
  "Criação de Sites",
  "Design de Logo",
  "Design Gráfico",
  "Sistemas Web",
  "Marketing Digital",
  "Branding",
  "Modelos de Página",
];

export function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    const controller = new AbortController();
    loadPortfolio(controller.signal);

    const timeout = setTimeout(() => {
      // Check if it's still loading before firing the fatal error
      setLoading((currentLoading) => {
        if (currentLoading) {
          console.warn('[Portfolio] Aviso: Timeout de 30s da UI atingido (banco muito lento).');
          setErrorStatus(true);
          return false;
        }
        return currentLoading;
      });
    }, 30000);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  const loadPortfolio = async (signal?: AbortSignal) => {
    try {
      console.log(`[Portfolio] DEBUG: Iniciando fetch de portfolio... VITE_SUPABASE_URL ativo:`, !!import.meta.env.VITE_SUPABASE_URL);
      setLoading(true);
      
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .abortSignal(signal || new AbortController().signal)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Portfolio] DEBUG ERROR fetching items:", error);
        throw error;
      }
      console.log(`[Portfolio] DEBUG: Fetch concluído com sucesso. Itens recebidos:`, data?.length);
      setPortfolioItems(data || []);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error("[Portfolio] Error loading portfolio items:", error);
      setErrorStatus(true);
      await supabase.auth.signOut();
    } finally {
      // The timeout is cleared by the useEffect cleanup, 
      // but we ensure loading is false so the timeout callback (if it fires) does nothing.
      setLoading(false);
    }
  };

  const filteredItems =
    selectedCategory === "Todos"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Portfolio</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Conheça alguns dos projetos que desenvolvemos com excelência e
            dedicação
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-gray-900 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {errorStatus ? (
          <div className="text-center py-20 bg-red-50/50 rounded-3xl border border-red-100 shadow-sm mt-12 mx-auto max-w-2xl">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erro de Conexão</h3>
            <p className="text-gray-600 font-medium">Os dados demoraram muito para responder. Isso indica uma falha de rede ou no banco. Limpamos seu cache de sessão local.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-10 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {selectedCategory === "Todos"
                ? "Nenhum projeto disponível no momento."
                : `Nenhum projeto encontrado na categoria "${selectedCategory}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <Link 
                  href={`/portfolio/demo/${item.id}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-gray-100"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('placehold.co')) {
                        target.src = 'https://placehold.co/800x600/e2e8f0/1e293b?text=Imagem+Indisponivel';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white text-sm px-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 font-medium">
                      {item.description}
                    </p>
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    href={`/portfolio/demo/${item.id}`}
                    className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-all shadow-md active:transform active:scale-95"
                    onClick={(e: React.MouseEvent) => {
                      if (e) e.stopPropagation();
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Eye size={18} />
                      Ver Demonstração
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Iniciar Seu Projeto?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e transforme suas ideias em realidade
            digital
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Solicitar Orçamento
          </a>
        </div>
      </div>
    </div>
  );
}
