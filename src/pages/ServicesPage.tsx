import { 
  Globe, 
  Palette, 
  TrendingUp, 
  Package, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ServicesPage() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Nossos Serviços</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Oferecemos soluções digitais completas para transformar sua ideia em realidade
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white relative overflow-hidden">
              <Globe size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <Globe size={48} className="mb-4" />
              <h2 className="text-3xl font-black mb-2 tracking-tight">Criação de Sites</h2>
              <p className="text-blue-100 font-medium">Desenvolvimento Web de Alta Conversão</p>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Sites profissionais, responsivos e otimizados para conversão. Desenvolvemos sua
                presença digital do zero, com design moderno e tecnologia de ponta.
              </p>
              <ul className="space-y-3 mb-8">
                {['Design responsivo e moderno', 'Otimizado para SEO e performance', 'Integração com sistemas de pagamento', 'Painel administrativo completo'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-1 text-blue-600">
                      <ArrowRight size={14} />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact?service=Criação de Sites"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200 active:scale-95 transition-all duration-300"
              >
                Solicitar Orçamento
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 text-white relative overflow-hidden">
               <Palette size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <Palette size={48} className="mb-4" />
              <h2 className="text-3xl font-black mb-2 tracking-tight">Criação de Logos</h2>
              <p className="text-pink-100 font-medium">Marcas Visuais Inesquecíveis</p>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Identidade visual profissional que representa a essência da sua marca.
                Criamos logos únicos, memoráveis e aplicáveis em diversos formatos.
              </p>
              <ul className="space-y-3 mb-8">
                {['Design exclusivo e original', 'Múltiplas versões e formatos', 'Manual de identidade visual', 'Revisões focadas em conversão'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="bg-pink-100 rounded-full p-1 mt-1 text-pink-600">
                      <ArrowRight size={14} />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact?service=Criação de Logos"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-pink-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-200 active:scale-95 transition-all duration-300"
              >
                Solicitar Orçamento
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white relative overflow-hidden">
               <TrendingUp size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <TrendingUp size={48} className="mb-4" />
              <h2 className="text-3xl font-black mb-2 tracking-tight">Gestão de Tráfego</h2>
              <p className="text-green-100 font-medium">Mais Leads, Mais Clientes e Mais Vendas</p>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Campanhas de tráfego pago gerenciadas por especialistas. Maximizamos seu ROI
                com estratégias testadas e otimização constante.
              </p>
              <ul className="space-y-3 mb-8">
                {['Google Ads e Facebook Ads', 'Análise e otimização diária', 'Relatórios detalhados', 'Estratégias de remarketing'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-1 text-green-600">
                      <ArrowRight size={14} />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact?service=Gerenciamento de Tráfego"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-200 active:scale-95 transition-all duration-300"
              >
                Solicitar Orçamento
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white relative overflow-hidden">
               <Package size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <Package size={48} className="mb-4" />
              <h2 className="text-3xl font-black mb-2 tracking-tight">SEO de Gestão</h2>
              <p className="text-amber-100 font-medium">Busca Orgânica e Domínio do Google</p>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Otimização completa de SEO e gestão de presença digital. Melhoramos seu posicionamento
                nos mecanismos de busca e gerenciamos sua estratégia online.
              </p>
              <ul className="space-y-3 mb-8">
                {['Análise técnica de SEO', 'Otimização de conteúdo', 'Link building profissional', 'Relatórios mensais de performance'].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="bg-amber-100 rounded-full p-1 mt-1 text-amber-600">
                      <ArrowRight size={14} />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact?service=SEO de Gestão"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-amber-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-200 active:scale-95 transition-all duration-300"
              >
                Solicitar Orçamento
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-12 text-center text-white shadow-xl shadow-blue-100 border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <h2 className="text-4xl font-black mb-4 relative z-10 tracking-tight">Precisa de um Projeto Personalizado?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Desenvolvemos sistemas, softwares e consultorias estratégicas sob medida para seu negócio crescer sem limites.
          </p>
          <Link
            to="/contact?service=Projeto Personalizado"
            className="w-full md:w-auto relative z-10 inline-flex items-center justify-center gap-3 bg-white text-blue-700 px-10 py-5 rounded-2xl text-lg font-black hover:bg-blue-50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/30 active:scale-95 transition-all shadow-xl group/btn"
          >
            Falar com Especialista
            <ArrowRight size={22} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
