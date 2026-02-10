import { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Sparkles, 
  Settings as SettingsIcon, 
  Image as ImageIcon, 
  Eye, 
  Save, 
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Globe,
  Share2
} from 'lucide-react';
import { MarketingProduct } from '../../../types';

interface ProductRegistrationStepperProps {
  product?: MarketingProduct | null;
  onSave: (data: Partial<MarketingProduct>) => Promise<void>;
  onClose: () => void;
}

export function ProductRegistrationStepper({ product, onSave, onClose }: ProductRegistrationStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<MarketingProduct>>({
    title: product?.title || '',
    public_code: product?.public_code || '',
    subtitle: product?.subtitle || '',
    description: product?.description || '',
    image_urls: product?.image_urls || [],
    category: product?.category || 'seo_gestao',
    status: product?.status || 'draft',
    cta_label: product?.cta_label || 'Comprar Agora',
    cta_url: product?.cta_url || '',
    seo_metadata: product?.seo_metadata || {
      primary_keyword: '',
      secondary_keywords: [],
      target_audience: '',
      search_intent: ''
    },
    copy_metadata: product?.copy_metadata || {
      headline: '',
      benefits: [],
      pain_points: [],
      faq: []
    },
    market_intel: product?.market_intel || {
      niche: '',
      competitor_urls: [],
      root_keyword: ''
    },
    technical_attributes: product?.technical_attributes || {},
    quality_score: product?.quality_score || 0
  });

  const [visibilityScore, setVisibilityScore] = useState(0);

  useEffect(() => {
    calculateScore();
  }, [formData]);

  const calculateScore = () => {
    let score = 0;
    
    // Title (max 20)
    if (formData.title && formData.title.length >= 20 && formData.title.length <= 70) score += 20;
    else if (formData.title && formData.title.length > 0) score += 10;

    // Images (max 20)
    if (formData.image_urls && formData.image_urls.length >= 3) score += 20;
    else if (formData.image_urls && formData.image_urls.length > 0) score += 10;

    // SEO Meta (max 20)
    if (formData.seo_metadata?.primary_keyword) score += 10;
    if (formData.seo_metadata?.secondary_keywords && formData.seo_metadata.secondary_keywords.length > 0) score += 10;

    // Copy Meta (max 30)
    if (formData.copy_metadata?.headline) score += 10;
    if (formData.copy_metadata?.benefits && formData.copy_metadata.benefits.length >= 3) score += 10;
    if (formData.copy_metadata?.faq && formData.copy_metadata.faq.length >= 2) score += 10;

    // Technical Attributes (max 10)
    if (Object.keys(formData.technical_attributes || {}).length > 0) score += 10;

    setVisibilityScore(score);
    setFormData(prev => ({ ...prev, quality_score: score }));
  };

  const steps = [
    { id: 1, title: 'Mercado e Keywords', icon: Target },
    { id: 2, title: 'Título Magnético', icon: Sparkles },
    { id: 3, title: 'Copy Persuasiva', icon: MessageSquare },
    { id: 4, title: 'Ficha Técnica', icon: SettingsIcon },
    { id: 5, title: 'Ativos Digitais', icon: ImageIcon },
    { id: 6, title: 'Revisão e Canais', icon: Eye }
  ];

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    return 'text-red-500 bg-red-50 border-red-200';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
              <AlertCircle className="text-blue-600 shrink-0" size={20} />
              <p className="text-sm text-blue-800">
                Comece definindo o terreno. Quais palavras as pessoas usam para achar seu produto? Quem é seu concorrente?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nicho de Mercado</span>
                  <input
                    type="text"
                    value={formData.market_intel?.niche}
                    onChange={(e) => setFormData({
                      ...formData,
                      market_intel: { ...formData.market_intel, niche: e.target.value }
                    })}
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Consultoria de Tráfego Pago"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Palavra-Chave Raiz</span>
                  <input
                    type="text"
                    value={formData.market_intel?.root_keyword}
                    onChange={(e) => setFormData({
                      ...formData,
                      market_intel: { ...formData.market_intel, root_keyword: e.target.value }
                    })}
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Gestor de Anúncios"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Palavra-Chave Principal (SEO)</span>
                  <input
                    type="text"
                    value={formData.seo_metadata?.primary_keyword}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo_metadata: { ...formData.seo_metadata, primary_keyword: e.target.value }
                    })}
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="A palavra que você quer rankear"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Público Alvo</span>
                  <input
                    type="text"
                    value={formData.seo_metadata?.target_audience}
                    onChange={(e) => setFormData({
                      ...formData,
                      seo_metadata: { ...formData.seo_metadata, target_audience: e.target.value }
                    })}
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Pequenos empresários locais"
                  />
                </label>
              </div>
            </div>

            <div>
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Concorrentes Diretos (URLs)</span>
              <div className="mt-2 space-y-2">
                {(formData.market_intel?.competitor_urls || []).map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...(formData.market_intel?.competitor_urls || [])];
                        newUrls[i] = e.target.value;
                        setFormData({ ...formData, market_intel: { ...formData.market_intel, competitor_urls: newUrls } });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-100 rounded-lg text-sm"
                    />
                    <button 
                      onClick={() => {
                        const newUrls = (formData.market_intel?.competitor_urls || []).filter((_, idx) => idx !== i);
                        setFormData({ ...formData, market_intel: { ...formData.market_intel, competitor_urls: newUrls } });
                      }}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFormData({
                    ...formData,
                    market_intel: { 
                      ...formData.market_intel, 
                      competitor_urls: [...(formData.market_intel?.competitor_urls || []), ''] 
                    }
                  })}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  + Adicionar Concorrente
                </button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex gap-3">
              <Sparkles className="text-purple-600 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-purple-900">Gerador de Título Magnético</p>
                <p className="text-xs text-purple-700">Um bom título SEO deve ter entre 50-70 caracteres e conter a palavra-chave.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Título do Produto</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl text-xl font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Ex: Gestão de Tráfego Pago para Negócios Locais"
                />
                <div className="mt-2 flex justify-between items-center px-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    formData.title!.length >= 50 && formData.title!.length <= 70 ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {formData.title!.length} / 70 caracteres
                  </span>
                  {formData.seo_metadata?.primary_keyword && formData.title?.toLowerCase().includes(formData.seo_metadata.primary_keyword.toLowerCase()) ? (
                    <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Keyword Detectada
                    </span>
                  ) : (
                    <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                      <AlertCircle size={12} /> Keyword Principal Ausente
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Subtítulo (Promessa de Valor)</label>
                <textarea
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                  placeholder="Qual o principal benefício imediato?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Código Público (URL)</label>
                  <div className="flex">
                    <span className="bg-gray-100 border border-r-0 px-3 py-3 rounded-l-xl text-gray-400 font-mono text-sm">/</span>
                    <input
                      type="text"
                      value={formData.public_code}
                      onChange={(e) => setFormData({ ...formData, public_code: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl font-mono text-sm"
                      placeholder="ex-produto-vendas"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold"
                  >
                    <option value="seo_gestao">SEO de Gestão</option>
                    <option value="trafego">Tráfego Pago</option>
                    <option value="infoproduto">Infoproduto</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-lg">Copywriting e Conversão</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Framework AIDA</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Headline de Vendas (H1/H2)</label>
                <input
                  type="text"
                  value={formData.copy_metadata?.headline}
                  onChange={(e) => setFormData({
                    ...formData,
                    copy_metadata: { ...formData.copy_metadata, headline: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  placeholder="A frase que prende a atenção"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Descrição Completa</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                  placeholder="Detalhe seu produto ou serviço..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Benefícios (Píluas de Valor)</label>
                  <div className="space-y-2">
                    {(formData.copy_metadata?.benefits || []).map((benefit, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => {
                            const newBenefits = [...(formData.copy_metadata?.benefits || [])];
                            newBenefits[i] = e.target.value;
                            setFormData({ ...formData, copy_metadata: { ...formData.copy_metadata, benefits: newBenefits } });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-100 rounded-lg text-sm"
                        />
                        <button 
                          onClick={() => {
                            const newBenefits = (formData.copy_metadata?.benefits || []).filter((_, idx) => idx !== i);
                            setFormData({ ...formData, copy_metadata: { ...formData.copy_metadata, benefits: newBenefits } });
                          }}
                          className="p-2 text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        copy_metadata: { 
                          ...formData.copy_metadata, 
                          benefits: [...(formData.copy_metadata?.benefits || []), ''] 
                        }
                      })}
                      className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700"
                    >
                      + Adicionar Benefício
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Dores que Soluciona</label>
                  <div className="space-y-2">
                    {(formData.copy_metadata?.pain_points || []).map((pain, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={pain}
                          onChange={(e) => {
                            const newPains = [...(formData.copy_metadata?.pain_points || [])];
                            newPains[i] = e.target.value;
                            setFormData({ ...formData, copy_metadata: { ...formData.copy_metadata, pain_points: newPains } });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-100 rounded-lg text-sm"
                        />
                        <button 
                          onClick={() => {
                            const newPains = (formData.copy_metadata?.pain_points || []).filter((_, idx) => idx !== i);
                            setFormData({ ...formData, copy_metadata: { ...formData.copy_metadata, pain_points: newPains } });
                          }}
                          className="p-2 text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        copy_metadata: { 
                          ...formData.copy_metadata, 
                          pain_points: [...(formData.copy_metadata?.pain_points || []), ''] 
                        }
                      })}
                      className="text-[10px] font-black uppercase text-red-400 hover:text-red-500"
                    >
                      + Adicionar Ponto de Dor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-lg">Atributos Técnicos (Ficha Técnica)</h3>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Modelo/Versão</label>
                  <input
                    type="text"
                    value={formData.technical_attributes?.model || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      technical_attributes: { ...formData.technical_attributes, model: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">EAN / Código Único</label>
                  <input
                    type="text"
                    value={formData.technical_attributes?.ean || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      technical_attributes: { ...formData.technical_attributes, ean: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Especificações customizadas (JSON style)</label>
                <div className="space-y-2">
                  {Object.entries(formData.technical_attributes || {}).filter(([k]) => k !== 'model' && k !== 'ean').map(([key, val], i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className="w-1/3 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold"
                      />
                      <input
                        type="text"
                        value={val as string}
                        onChange={(e) => {
                          const newAttrs = { ...formData.technical_attributes };
                          newAttrs[key] = e.target.value;
                          setFormData({ ...formData, technical_attributes: newAttrs });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => {
                          const newAttrs = { ...formData.technical_attributes };
                          delete newAttrs[key];
                          setFormData({ ...formData, technical_attributes: newAttrs });
                        }}
                        className="p-2 text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 mt-4 bg-white p-3 rounded-xl border border-dashed border-gray-300">
                    <input id="newAttrKey" placeholder="Nome (Ex: Material)" className="w-1/3 px-3 py-1 text-xs border rounded" />
                    <input id="newAttrVal" placeholder="Valor (Ex: Titânio)" className="flex-1 px-3 py-1 text-xs border rounded" />
                    <button
                      onClick={() => {
                        const k = (document.getElementById('newAttrKey') as HTMLInputElement).value;
                        const v = (document.getElementById('newAttrVal') as HTMLInputElement).value;
                        if (k && v) {
                          setFormData({
                            ...formData,
                            technical_attributes: { ...formData.technical_attributes, [k]: v }
                          });
                          (document.getElementById('newAttrKey') as HTMLInputElement).value = '';
                          (document.getElementById('newAttrVal') as HTMLInputElement).value = '';
                        }
                      }}
                      className="px-4 py-1 bg-gray-900 text-white text-[10px] font-bold rounded uppercase"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-lg">Mídia e Ativos Digitais</h3>
            
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                   <ImageIcon size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-blue-900">Galeria de Imagens</h4>
                   <p className="text-xs text-blue-600">Recomendado: 1080x1080, Fundo Branco, WebP</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {(formData.image_urls || []).map((url, i) => (
                   <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm hover:shadow-md transition-all">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => {
                            const newUrls = (formData.image_urls || []).filter((_, idx) => idx !== i);
                            setFormData({ ...formData, image_urls: newUrls });
                          }}
                          className="w-full py-1 text-[10px] font-black text-white uppercase"
                         >
                           Remover
                         </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded">Capa</span>
                      )}
                   </div>
                 ))}
                 
                 {(!formData.image_urls || formData.image_urls.length < 5) && (
                   <div className="aspect-square border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center bg-white/50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer group"
                    onClick={() => {
                      const url = prompt('Cole o link da imagem (ou use upload):');
                      if (url) {
                        setFormData({ ...formData, image_urls: [...(formData.image_urls || []), url] });
                      }
                    }}
                   >
                     <Plus className="text-blue-300 group-hover:text-blue-500" size={24} />
                     <span className="text-[10px] font-black text-blue-300 group-hover:text-blue-500 uppercase mt-2">Add Foto</span>
                   </div>
                 )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Chamada Principal (CTA)</label>
                   <input
                    type="text"
                    value={formData.cta_label || ''}
                    onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    placeholder="Ex: Contratar Consultoria"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Link Destino (URL)</label>
                   <input
                    type="text"
                    value={formData.cta_url || ''}
                    onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    placeholder="https://..."
                   />
                </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-lg flex items-center gap-2">
                    <Eye size={20} className="text-blue-600" />
                    Review Multicanal
                  </h3>
                  
                  <div className="border rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-6 py-3 border-b flex items-center justify-between">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prévia no Google Search</span>
                       <Globe size={14} className="text-gray-400" />
                    </div>
                    <div className="p-6 bg-white space-y-1">
                       <p className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">{formData.title}</p>
                       <p className="text-[#006621] text-sm flex items-center gap-1">https://fslsolution.pt/produtos/{formData.public_code} <ChevronRight size={10} /></p>
                       <p className="text-[#4d5156] text-sm line-clamp-2">{formData.description || formData.subtitle}</p>
                    </div>
                  </div>

                  <div className="border rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-6 py-3 border-b flex items-center justify-between">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview em Posts</span>
                       <Share2 size={14} className="text-gray-400" />
                    </div>
                    <div className="p-6 bg-white flex gap-4">
                       <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border">
                         {formData.image_urls?.[0] ? <img src={formData.image_urls[0]} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="m-auto mt-7 text-gray-300" />}
                       </div>
                       <div className="space-y-2">
                         <h4 className="font-bold text-gray-900">{formData.title}</h4>
                         <p className="text-xs text-gray-500 line-clamp-2">{formData.subtitle}</p>
                         <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg">{formData.cta_label}</span>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className={`p-6 rounded-3xl border-2 transition-all ${getScoreColor(visibilityScore)}`}>
                    <h4 className="font-black uppercase tracking-widest text-xs mb-4">Quality Score</h4>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-5xl font-black">{visibilityScore}</span>
                      <span className="text-xl font-bold opacity-50">/100</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                       <div 
                        className={`h-full transition-all duration-1000 ${
                          visibilityScore >= 80 ? 'bg-green-500' : visibilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${visibilityScore}%` }} 
                       />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-tighter mt-4 leading-tight">
                      {visibilityScore >= 80 ? 'Excelente! Pronto para rankear.' : visibilityScore >= 50 ? 'Bom, mas pode melhorar a copy.' : 'Precisa de ajustes para maior conversão.'}
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-3xl p-6 text-white">
                    <h4 className="font-black uppercase tracking-widest text-[10px] text-gray-400 mb-4">Status de Publicação</h4>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="active">Ativo (Recomendado Mín. 70%)</option>
                      <option value="suspended">Suspenso</option>
                    </select>
                    {visibilityScore < 70 && (
                      <p className="text-[10px] text-orange-400 font-bold italic">
                        * Aumente o score para 70% para liberar a publicação ativa.
                      </p>
                    )}
                  </div>
               </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-10 py-6 border-b flex items-center justify-between bg-white relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">SEO de Gestão - Módulo Inteligente</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FSL Solution • Intelligent Registration</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center group">
                  <div className={`flex flex-col items-center transition-all ${
                    isActive ? 'scale-110' : 'opacity-40 hover:opacity-100'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : isPast ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isPast ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                    </div>
                  </div>
                  {step.id < 6 && <div className={`w-8 h-0.5 mx-1 rounded-full ${isPast ? 'bg-green-200' : 'bg-gray-100'}`} />}
                </div>
              );
            })}
          </div>

          <button onClick={onClose} className="p-3 text-gray-300 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#fafafa]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="text-left">
               <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Passo Atual</span>
               <p className="text-sm font-bold text-gray-900">{currentStep}. {steps[currentStep-1].title}</p>
             </div>
          </div>

          <div className="flex gap-3">
             {currentStep > 1 && (
               <button 
                onClick={handleBack}
                className="px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all flex items-center gap-2"
               >
                 <ChevronLeft size={20} />
                 Voltar
               </button>
             )}
             
             {currentStep < 6 ? (
               <button 
                onClick={handleNext}
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-gray-200 active:scale-95"
               >
                 Próxima Etapa
                 <ChevronRight size={20} />
               </button>
             ) : (
               <button 
                onClick={() => onSave(formData)}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-200 active:scale-95"
               >
                 <Save size={20} />
                 Finalizar Registro
               </button>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
