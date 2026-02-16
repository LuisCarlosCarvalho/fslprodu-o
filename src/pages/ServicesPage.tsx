import { 
  Globe, 
  Palette, 
  TrendingUp, 
  Package, 
  ArrowRight, 
  X, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Service } from '../types';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/errors';
import { showToast } from '../components/ui/Toast';

// Sub-forms
import { WebsiteForm } from '../components/quotes/forms/WebsiteForm';
import { LogoForm } from '../components/quotes/forms/LogoForm';
import { TrafficForm } from '../components/quotes/forms/TrafficForm';
import { SEOForm } from '../components/quotes/forms/SEOForm';
import { CustomProjectForm } from '../components/quotes/forms/CustomProjectForm';
import { FileUpload } from '../components/quotes/FileUpload';

const countryCodes = [
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
];

export function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [osNumber, setOsNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    requester_name: '',
    email: '',
    countryCode: '+55',
    phone: '',
    region: 'Brasil',
    observation: '',
    service_details: {},
    attachments: [] as string[]
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from('services').select('*');
      if (data) setServices(data);
    };
    fetchServices();
  }, []);

  const generateOS = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = Math.floor(now.getTime() / 1000).toString().slice(-6);
    return `OS${dateStr}-${timeStr}`;
  };

  const handleOpenModal = (serviceName: string) => {
    setSelectedService(serviceName);
    setOsNumber(generateOS());
    setSubmitSuccess(false);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleCountryChange = (code: string) => {
    const selected = countryCodes.find(c => c.code === code);
    if (!selected) return;

    setFormData(prev => ({ 
      ...prev, 
      countryCode: code, 
      region: selected.country,
      service_details: {
        ...prev.service_details,
        budget_range: ''
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullPhone = `${formData.countryCode}${formData.phone}`;
      const { error } = await supabase.from('quote_requests').insert([{
        name: formData.requester_name,
        email: formData.email,
        phone: fullPhone,
        service_type: selectedService,
        message: formData.observation,
        os_number: osNumber,
        company_name: formData.company_name,
        region: formData.region,
        service_details: formData.service_details,
        attachments: formData.attachments,
        contact_method: 'email',
        status: 'new'
      }]);

      if (error) throw error;
      setSubmitSuccess(true);
      showToast('Orçamento solicitado via O.S. com sucesso!', 'success');
      
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({
          company_name: '',
          requester_name: '',
          email: '',
          countryCode: '+55',
          phone: '',
          region: 'Brasil',
          observation: '',
          service_details: {},
          attachments: []
        });
      }, 3000);
    } catch (err) {
      console.error('Erro ao enviar solicitação:', getErrorMessage(err));
      showToast('Erro ao enviar solicitação. Por favor, tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceFields = () => {
    const sName = selectedService.toLowerCase();
    const currentService = services.find(s => s.name.toLowerCase() === sName || s.category.toLowerCase() === sName);
    
    const props = {
      data: formData.service_details,
      onChange: (details: any) => setFormData({ ...formData, service_details: details }),
      region: formData.region,
      pricingConfig: currentService?.pricing_config
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {(sName.includes('site') || sName.includes('web')) && <WebsiteForm {...props} />}
        {sName.includes('logo') && <LogoForm {...props} />}
        {(sName.includes('tráfego') || sName.includes('trafego')) && <TrafficForm {...props} />}
        {sName.includes('seo') && <SEOForm {...props} />}
        {!sName.includes('site') && !sName.includes('web') && !sName.includes('logo') && !sName.includes('tráfego') && !sName.includes('trafego') && !sName.includes('seo') && (
          <CustomProjectForm {...props} />
        )}
      </div>
    );
  };

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
              <p className="text-blue-100 font-medium">Solicitação de Orçamento | O.S. Digital</p>
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
              <button
                onClick={() => handleOpenModal('Criação de Sites')}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Solicitar Orçamento
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 text-white relative overflow-hidden">
               <Palette size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <Palette size={48} className="mb-4" />
              <h2 className="text-3xl font-black mb-2 tracking-tight">Criação de Logos</h2>
              <p className="text-pink-100 font-medium">Solicitação de Orçamento | O.S. Digital</p>
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
              <button
                onClick={() => handleOpenModal('Criação de Logos')}
                className="w-full inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-pink-700 transition-all shadow-lg shadow-pink-100"
              >
                Solicitar Orçamento
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white relative overflow-hidden">
               <TrendingUp size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <TrendingUp size={48} className="mb-4" />
              <h2 className="text-3xl font-black mb-2 tracking-tight">Gestão de Tráfego</h2>
              <p className="text-green-100 font-medium">Solicitação de Orçamento | O.S. Digital</p>
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
              <button
                onClick={() => handleOpenModal('Gerenciamento de Tráfego')}
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              >
                Solicitar Orçamento
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white relative overflow-hidden">
               <Package size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <Package size={48} className="mb-4" />
              <h2 className="text-3xl font-black mb-2 tracking-tight">SEO de Gestão</h2>
              <p className="text-amber-100 font-medium">Solicitação de Orçamento | O.S. Digital</p>
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
              <button
                onClick={() => handleOpenModal('SEO de Gestão')}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-100"
              >
                Solicitar Orçamento
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-12 text-center text-white shadow-xl shadow-blue-100 border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <h2 className="text-4xl font-black mb-4 relative z-10 tracking-tight">Precisa de um Projeto Personalizado?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Desenvolvemos sistemas, softwares e consultorias estratégicas sob medida para seu negócio crescer sem limites.
          </p>
          <button
            onClick={() => handleOpenModal('Projeto Personalizado')}
            className="relative z-10 inline-flex items-center gap-3 bg-white text-blue-700 px-10 py-5 rounded-2xl text-lg font-black hover:bg-blue-50 transition-all shadow-xl group"
          >
            Falar com Especialista
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-8 flex justify-between items-center z-20">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">SOLICITAÇÃO DE ORÇAMENTO DIGITAL</h2>
                <div className="flex items-center gap-3 text-sm font-bold text-blue-600 mt-1 uppercase tracking-widest">
                  <span>FSL Solution</span>
                  <span className="text-gray-300 text-lg">|</span>
                  <span className="italic font-serif">Official Service Order</span>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 lg:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-6 border-b border-gray-50 gap-6">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Protocolo de Registro</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-gray-900">O.S.</span>
                    <div className="bg-blue-600 text-white px-6 py-2 rounded-xl font-mono text-xl font-black shadow-lg shadow-blue-100">
                      {osNumber}
                    </div>
                  </div>
                </div>
                <div className="flex gap-8">
                   <div className="text-right">
                      <p className="text-xs font-black text-gray-400 uppercase mb-1">Data de Emissão</p>
                      <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString('pt-BR')}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-black text-gray-400 uppercase mb-1">Status Base</p>
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider italic">Pendente</span>
                   </div>
                </div>
              </div>

              <div className="mb-12">
                <div className="flex items-center justify-between mb-8 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10" />
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 -z-10`} style={{ width: `${((currentStep - 1) / 2) * 100}%` }} />
                  
                  {[
                    { step: 1, label: 'Identificação' },
                    { step: 2, label: 'Configuração' },
                    { step: 3, label: 'Protocolização' }
                  ].map((s) => (
                    <div key={s.step} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 border-4 ${
                        currentStep >= s.step 
                          ? 'bg-blue-600 border-blue-100 text-white' 
                          : 'bg-white border-gray-100 text-gray-400'
                      }`}>
                        {s.step}
                      </div>
                      <span className={`text-[10px] font-black uppercase mt-2 tracking-widest ${
                        currentStep >= s.step ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {submitSuccess ? (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <ShieldCheck size={48} />
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 mb-4">Solicitação Registrada!</h3>
                  <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
                    Sua Ordem de Serviço <span className="text-blue-600 font-black">#{osNumber}</span> foi protocolada com sucesso.
                  </p>
                  <p className="text-sm text-gray-400 italic">Redirecionando...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="lg:col-span-3 pb-4 border-b border-gray-50 mb-4">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                          <Building2 size={18} className="text-blue-600" />
                          Dados da Empresa e Solicitante
                        </h4>
                      </div>

                      <div className="lg:col-span-2 space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Empresa / Marca</label>
                        <input
                          type="text"
                          required
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 placeholder:text-gray-300 transition-all"
                          placeholder="Nome da sua empresa ou marca"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Solicitante Resp.</label>
                        <input
                          type="text"
                          required
                          value={formData.requester_name}
                          onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900"
                          placeholder="Nome completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">E-mail de Contato</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900"
                          placeholder="exemplo@empresa.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">WhatsApp / Telemóvel</label>
                        <div className="flex gap-2">
                          <select
                            value={formData.countryCode}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="px-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-sm"
                          >
                            {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                          </select>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                            className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900"
                            placeholder="Número celular"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Região de Faturamento</label>
                        <select
                          value={formData.region}
                          onChange={(e) => {
                            const country = countryCodes.find(c => c.country === e.target.value);
                            if (country) handleCountryChange(country.code);
                          }}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-900 appearance-none bg-no-repeat transition-all focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Brasil">Brasil</option>
                          <option value="Portugal">Portugal</option>
                          <option value="Internacional">Internacional</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="pb-4 border-b border-gray-50 mb-6">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                          <Package size={18} className="text-blue-600" />
                          Configurações Técnicas da O.S.
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 italic italic font-medium">Campos específicos para {selectedService}</p>
                      </div>
                      <div className="bg-white p-8 rounded-3xl border border-blue-50 shadow-sm">
                        {renderServiceFields()}
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="pb-4 border-b border-gray-50 mb-6">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck size={18} className="text-blue-600" />
                          Finalização e Protocolização
                        </h4>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Descrição Complementar / Observações</label>
                        <textarea
                          rows={4}
                          value={formData.observation}
                          onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-gray-900"
                          placeholder="Descreva detalhes específicos, restrições ou observações extraordinárias..."
                        />
                      </div>

                      <FileUpload 
                        files={formData.attachments} 
                        onFilesChange={(urls) => setFormData({...formData, attachments: urls})} 
                        onUploadStatusChange={setIsUploading}
                      />

                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <p className="text-xs text-gray-400 leading-relaxed italic">
                          <span className="font-bold block mb-1 uppercase text-gray-500">Termo de Protocolo Digital</span>
                          Ao protocolar esta O.S., você confirma o interesse na análise técnica e orçamentária para o projeto descrito. Os dados serão tratados conforme nossa política de privacidade.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <button
                      type="button"
                      onClick={() => currentStep === 1 ? setIsModalOpen(false) : setCurrentStep(prev => prev - 1)}
                      className="w-full md:w-auto px-10 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      {currentStep === 1 ? 'CANCELAR' : 'VOLTAR'}
                    </button>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(prev => prev + 1)}
                          className="w-full md:w-auto bg-blue-600 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all uppercase tracking-widest text-sm shadow-xl shadow-blue-100"
                        >
                          PRÓXIMO PASSO
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading || isUploading}
                          className="w-full md:w-auto bg-blue-700 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-800 transition-all uppercase tracking-widest text-sm shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'PROCESSANDO...' : isUploading ? 'ENVIANDO ARQUIVOS...' : 'PROTOCOLAR O.S.'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
