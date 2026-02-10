import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageCircle, ArrowRight, User, Globe, ShieldCheck } from 'lucide-react';
import { supabase, Service } from '../lib/supabase';
import VisitCounter from '../components/VisitCounter';
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
  { code: '+1', country: 'EUA/Canadá', flag: '🇺🇸' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+34', country: 'Espanha', flag: '🇪🇸' },
  { code: '+33', country: 'França', flag: '🇫🇷' },
  { code: '+49', country: 'Alemanha', flag: '🇩🇪' },
  { code: '+39', country: 'Itália', flag: '🇮🇹' },
];

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+351',
    phone: '',
    region: 'Portugal',
    service_type: '',
    message: '',
    service_details: {} as any,
    attachments: [] as string[],
  });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitType, setSubmitType] = useState<'whatsapp' | 'email'>('whatsapp');
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Service Details

  useEffect(() => {
    loadServices();
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    if (serviceParam) {
      setFormData(prev => ({ ...prev, service_type: serviceParam }));
    }
  }, []);

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('name');
    if (data) {
      setServices(data);
      const params = new URLSearchParams(window.location.search);
      if (!params.get('service') && data.length > 0) {
        setFormData(prev => ({ ...prev, service_type: data[0].name }));
      }
    }
  };

  const handleNextStep = () => {
    if (!formData.name || !formData.email || !formData.service_type) {
      showToast('Por favor, preencha os campos obrigatórios.', 'error');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitSuccess(false);

    try {
      const fullPhone = `${formData.countryCode}${formData.phone}`;

      const { error } = await supabase.from('quote_requests').insert([{
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        service_type: formData.service_type,
        message: formData.message,
        service_details: formData.service_details,
        attachments: formData.attachments,
        contact_method: submitType,
      }]);

      if (error) throw error;

      const selectedService = services.find(s => s.name === formData.service_type || s.id === formData.service_type);
      const serviceName = selectedService ? selectedService.name : formData.service_type || 'Outro';

      if (submitType === 'whatsapp') {
        const whatsappMessage = `*Nova Solicitação de Orçamento*%0A%0A` +
          `*Nome:* ${formData.name}%0A` +
          `*Email:* ${formData.email}%0A` +
          `*Telefone:* ${fullPhone}%0A` +
          `*Serviço:* ${serviceName}%0A%0A` +
          `*Mensagem:*%0A${formData.message}%0A%0A` +
          `_Detalhes técnicos enviados para o sistema._`;

        const whatsappNumber = '351928485483';
        window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
      } else {
        setSubmitSuccess(true);
        showToast('Solicitação enviada com sucesso!', 'success');
      }

      setFormData({
        name: '',
        email: '',
        countryCode: '+351',
        phone: '',
        region: 'Portugal',
        service_type: services.length > 0 ? services[0].name : '',
        message: '',
        service_details: {} as any,
        attachments: [],
      });
      setStep(1);
    } catch (err: unknown) {
      console.error('Erro ao processar solicitação:', getErrorMessage(err));
      showToast('Erro ao enviar solicitação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceForm = () => {
    const sName = formData.service_type.toLowerCase();
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
          <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Solicitar Orçamento</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Personalizado, profissional e direto. Transformamos sua visão em realidade digital com as melhores tecnologias.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-8">Informações de Contato</h2>
              <div className="space-y-8">
                <div className="flex items-center gap-4 group">
                  <div className="bg-blue-50 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 text-blue-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email</h3>
                    <p className="text-gray-900 font-semibold">contato@fslsolution.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="bg-green-50 p-4 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-all duration-300 text-green-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Telefone</h3>
                    <p className="text-gray-900 font-semibold">+351 928 485 483</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 text-orange-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Localização</h3>
                    <p className="text-gray-900 font-semibold">Brasil / Portugal</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                 <div className="flex items-center gap-2 text-blue-600 mb-2">
                   <ShieldCheck size={18} />
                   <span className="font-bold text-sm">Privacidade Garantida</span>
                 </div>
                 <p className="text-xs text-gray-500 leading-relaxed">
                   Seus dados estão seguros e serão usados exclusivamente para a elaboração do orçamento solicitado.
                 </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-lg shadow-blue-200">
              <h3 className="text-2xl font-bold mb-6">Suporte Estratégico</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-blue-100">
                  <ArrowRight size={18} className="mt-1 flex-shrink-0" />
                  <span>Análise técnica detalhada do projeto</span>
                </li>
                <li className="flex items-start gap-3 text-blue-100">
                  <ArrowRight size={18} className="mt-1 flex-shrink-0" />
                  <span>Consultoria gratuita no primeiro contato</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-white/10">
                <VisitCounter />
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              {/* Progress Bar */}
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className={`flex items-center gap-2 ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</span>
                    <span className="font-bold text-sm hidden sm:inline">Info Básica</span>
                  </div>
                  <div className="w-8 h-px bg-gray-200 self-center" />
                  <div className={`flex items-center gap-2 ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</span>
                    <span className="font-bold text-sm hidden sm:inline">Detalhes do Projeto</span>
                  </div>
                </div>
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                    Voltar
                  </button>
                )}
              </div>

              <div className="p-8 lg:p-12">
                {submitSuccess ? (
                  <div className="text-center py-12 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4">Solicitação Confirmada!</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Obrigado por escolher a FSL Solution. Analisaremos seus detalhes e entraremos em contato em breve.
                    </p>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                      Nova Solicitação
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {step === 1 ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                               <User size={16} className="text-blue-500" />
                               Nome Completo *
                             </label>
                             <input
                               type="text"
                               required
                               className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                               placeholder="Ex: João Silva"
                               value={formData.name}
                               onChange={(e) => setFormData({...formData, name: e.target.value})}
                             />
                          </div>

                          <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                               <Mail size={16} className="text-blue-500" />
                               E-mail *
                             </label>
                             <input
                               type="email"
                               required
                               className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                               placeholder="seu@contato.com"
                               value={formData.email}
                               onChange={(e) => setFormData({...formData, email: e.target.value})}
                             />
                          </div>

                          <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                               <MessageCircle size={16} className="text-blue-500" />
                               WhatsApp / Telemóvel
                             </label>
                             <div className="flex gap-2">
                               <select 
                                 className="px-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                 value={formData.countryCode}
                                 onChange={(e) => {
                                   const selected = countryCodes.find(c => c.code === e.target.value);
                                   setFormData(prev => ({ 
                                     ...prev, 
                                     countryCode: e.target.value,
                                     region: selected ? selected.country : prev.region,
                                     service_details: { ...prev.service_details, budget_range: '' }
                                   }));
                                 }}
                               >
                                 {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                               </select>
                               <input
                                 type="tel"
                                 className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                 placeholder="99999-9999"
                                 value={formData.phone}
                                 onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                               />
                             </div>
                           </div>

                           <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Globe size={16} className="text-blue-500" />
                                Região de Faturamento *
                              </label>
                              <select
                                required
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 appearance-none"
                                value={formData.region}
                                onChange={(e) => {
                                  const selected = countryCodes.find(c => c.country === e.target.value);
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    region: e.target.value,
                                    countryCode: selected ? selected.code : prev.countryCode,
                                    service_details: { ...prev.service_details, budget_range: '' }
                                  }));
                                }}
                              >
                                <option value="Brasil">Brasil</option>
                                <option value="Portugal">Portugal</option>
                                <option value="Internacional">Outros (Internacional)</option>
                              </select>
                           </div>

                          <div className="md:col-span-2">
                             <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                               <Globe size={16} className="text-blue-500" />
                               Serviço de Interesse *
                             </label>
                             <select
                               required
                               className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 appearance-none"
                               value={formData.service_type}
                               onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                             >
                               {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                               <option value="other">Projeto Especial / Outro</option>
                             </select>
                          </div>
                        </div>

                        <div className="pt-6">
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="w-full bg-blue-600 text-white px-8 py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
                          >
                            Configurar Detalhes do Projeto
                            <ArrowRight size={24} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Passo 2 de 2</p>
                            <h4 className="text-lg font-black text-gray-900">{formData.service_type}</h4>
                          </div>
                          <Globe className="text-blue-500" size={32} />
                        </div>

                        {renderServiceForm()}

                        <div className="space-y-2">
                           <label className="block text-sm font-bold text-gray-700">Informações Adicionais / Mensagem</label>
                           <textarea
                             rows={4}
                             className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium"
                             placeholder="Diga algo mais sobre suas necessidades..."
                             value={formData.message}
                             onChange={(e) => setFormData({...formData, message: e.target.value})}
                           />
                        </div>

                        <FileUpload 
                          files={formData.attachments} 
                          onFilesChange={(urls) => setFormData({...formData, attachments: urls})} 
                        />

                        <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            onClick={() => setSubmitType('whatsapp')}
                            className="bg-green-600 text-white px-8 py-5 rounded-2xl font-black hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-100 disabled:opacity-50"
                          >
                            {loading && submitType === 'whatsapp' ? 'Processando...' : (
                              <>
                                <MessageCircle size={24} />
                                Pedir via WhatsApp
                              </>
                            )}
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            onClick={() => setSubmitType('email')}
                            className="bg-black text-white px-8 py-5 rounded-2xl font-black hover:bg-gray-900 transition-all flex items-center justify-center gap-3 shadow-lg shadow-gray-200 disabled:opacity-50"
                          >
                            {loading && submitType === 'email' ? 'Processando...' : (
                              <>
                                <Mail size={24} />
                                Enviar por E-mail
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                          Analistas técnicos revisam cada orçamento individualmente. Resposta em até 24h.
                        </p>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
