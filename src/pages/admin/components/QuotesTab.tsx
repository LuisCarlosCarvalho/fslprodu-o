import { useState } from 'react';
import { QuoteRequest } from '../../../types';
import { ExternalLink, FileText, ChevronRight, MessageSquare, Paperclip, Building, Globe, Search } from 'lucide-react';

type QuotesTabProps = {
  quotes: QuoteRequest[];
  onUpdateStatus: (id: string, status: string) => void;
};

export function QuotesTab({ quotes, onUpdateStatus }: QuotesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotes = quotes.filter(quote => 
    quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.os_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const translations: Record<string, string> = {
// ... (rest of translations)
// (keeping the rest of the file logic same)
    // Gerais e Website
    deadline: 'Prazo Estimado:',
    needs_seo: 'Precisa de SEO:',
    site_type: 'Tipo de Site:',
    has_domain: 'Tem Domínio:',
    references: 'Referências:',
    pages_count: 'Qtd. de Páginas:',
    budget_range: 'Faixa de Orçamento:',
    needs_hosting: 'Precisa de Hospedagem:',
    needs_maintenance: 'Plano de Manutenção:',
    
    // Logo e Branding (conforme print)
    slogan: 'Slogan:',
    brand_personality: 'Personalidade da Marca:',
    website: 'Web-Site:',
    print_materials: 'Impressos:',
    social_media: 'Redes Sociais:',
    preferred_colors: 'Cores Preferidas:',
    needs_manual: 'Precisa de Manual?',
    packaging: 'Embalagens:',
    branding_personality: 'Personalidade da Marca:',
    
    // Tráfego e SEO
    current_keywords: 'Palavras-chave Atuais:',
    target_keywords: 'Palavras-chave Desejadas:',
    has_previous_seo: 'Já fez SEO antes:',
    avg_monthly_visits: 'Visitas Mensais:',
    monthly_budget: 'Orçamento Mensal:',
    campaign_goal: 'Objetivo da Campanha:',
    target_audience: 'Público Alvo:',
    
    // Identidade Visual
    logo_style: 'Estilo do Logo:',
    brand_colors: 'Cores da Marca:',
    has_existing_logo: 'Já tem logo antigo:'
  };

  const valueTranslations: Record<string, string> = {
    institutional: 'Institucional',
    ecommerce: 'E-commerce',
    landing_page: 'Landing Page',
    portal: 'Portal / Blog',
    yes: 'Sim',
    no: 'Não',
    initial: 'Inicial / Start',
    growth: 'Crescimento',
    premium: 'Premium / Corp',
    sales: 'Vendas / Conversão',
    awareness: 'Reconhecimento de Marca',
    leads: 'Geração de Leads',
    minimalist: 'Minimalista',
    modern: 'Moderno',
    classic: 'Clássico',
    bold: 'Ousado / Vibrante'
  };

  const formatKey = (key: string) => {
    return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ':';
  };

  const renderValue = (val: any) => {
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
    if (typeof val === 'string' && valueTranslations[val.toLowerCase()]) return valueTranslations[val.toLowerCase()];
    return val;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight text-left">Solicitações de Orçamento</h2>
          <p className="text-gray-500 font-medium text-left">Gerencie leads e ordens de serviço geradas pelo site.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar orçamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
          </div>
          
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm shrink-0">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total: </span>
            <span className="text-lg font-black text-blue-600">{filteredQuotes.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredQuotes.map((quote) => (
          <div key={quote.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            {/* Header / Basic Info */}
            <div className="p-6 lg:p-8 flex flex-col lg:flex-row justify-between gap-6 border-b border-gray-50">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {quote.os_number && (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-mono text-sm font-black shadow-lg shadow-blue-100">
                      #{quote.os_number}
                    </span>
                  )}
                  <div className="flex items-center gap-2 text-gray-900">
                    <h3 className="text-xl font-black tracking-tight">{quote.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic ${
                    quote.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    quote.status === 'contacted' ? 'bg-orange-100 text-orange-700' :
                    quote.status === 'converted' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {quote.status === 'new' ? 'Novo' :
                     quote.status === 'contacted' ? 'Contatado' :
                     quote.status === 'converted' ? 'Convertido' : 'Fechado'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <MessageSquare size={16} className="text-blue-500" />
                    {quote.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <ChevronRight size={16} className="text-blue-500" />
                    {quote.phone || 'Sem telefone'}
                  </div>
                  {quote.company_name && (
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      <Building size={16} className="text-blue-500" />
                      {quote.company_name}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-blue-700 font-black">
                    <Globe size={16} />
                    {quote.service_type}
                  </div>
                  {quote.region && (
                    <div className="flex items-center gap-2 text-gray-500 italic">
                      <FileText size={16} />
                      {quote.region}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alterar Status</label>
                <select
                  value={quote.status}
                  onChange={(e) => onUpdateStatus(quote.id, e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="new">🆕 Novo Leads</option>
                  <option value="contacted">📞 Em Contato</option>
                  <option value="converted">✅ Convertido</option>
                  <option value="closed">✖️ Fechado</option>
                </select>
                <span className="text-[10px] text-gray-400 text-right italic font-medium">
                  Recebido {new Date(quote.created_at).toLocaleDateString()} às {new Date(quote.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Details and Message */}
            <div className="p-6 lg:p-10 bg-gray-50/30 space-y-10">
              {/* Message at the top */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Mensagem do Cliente</h4>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-gray-950 leading-relaxed text-sm min-h-[80px] whitespace-pre-wrap">
                  {quote.message || <span className="text-gray-300 italic text-left block">Nenhuma mensagem adicional compartilhada pelo cliente.</span>}
                </div>
              </div>

              {/* Specific Fields Grid */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Dados Específicos do Serviço</h4>
                {quote.service_details && Object.keys(quote.service_details).length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(quote.service_details).map(([key, val]) => {
                      // Determine width based on key or value length for a dynamic layout
                      const isLong = String(val).length > 30 || key.includes('slogan') || key.includes('personality') || key.includes('colors');
                      return (
                        <div key={key} className={`flex flex-col ${isLong ? 'w-full md:flex-1 min-w-[300px]' : 'w-fit min-w-[150px]'}`}>
                          <span className="text-[11px] font-bold text-gray-900 mb-1.5 ml-1">{formatKey(key)}</span>
                          <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-950 shadow-sm flex items-center min-h-[48px]">
                            {renderValue(val)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center text-gray-400 italic text-sm">
                    Sem detalhes adicionais configurados para este serviço.
                  </div>
                )}
              </div>

              {/* Description Placeholder at bottom like in print */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                  Descrição Complementar &gt;
                </h4>
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-inner min-h-[150px] text-gray-400 italic text-sm">
                  {/* Espaço reservado para notas administrativas ou detalhes extras se houver */}
                  Este campo pode ser usado para anotações internas após o contato.
                </div>
              </div>
            </div>

            {/* Attachments */}
            {quote.attachments && quote.attachments.length > 0 && (
              <div className="px-6 lg:p-8 pt-0 bg-gray-50/50">
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Paperclip size={14} />
                    Arquivos Anexados ({quote.attachments.length})
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {quote.attachments.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all group/link"
                      >
                        <ExternalLink size={14} className="group-hover/link:scale-110 transition-transform" />
                        Ver Anexo {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredQuotes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Caixa de Entrada Vazia'}
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              {searchTerm ? `Não encontramos orçamentos correspondentes a "${searchTerm}"` : 'Nenhuma solicitação de orçamento encontrada no momento.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
