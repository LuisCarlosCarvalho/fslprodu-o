import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Settings2, 
  ShieldCheck, 
  ChevronDown, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Globe,
  Lock,
  History
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { showToast } from '../../../components/ui/Toast';
import { GlobalPaymentSettings, PaymentMethodsState } from '../../../types';

export function PaymentConfigTab() {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('global');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [globalSettings, setGlobalSettings] = useState<GlobalPaymentSettings>({
    default_currency_br: 'BRL',
    default_currency_pt: 'EUR',
    payment_timeout_minutes: 30,
    manual_approval_enabled: false,
    mode: 'test',
    webhook_status: 'online'
  });

  const [methods, setMethods] = useState<PaymentMethodsState>({
    pix: {
      enabled: true,
      key_type: 'random',
      key_value: '',
      auto_qr_code: true,
      expiration_minutes: 30,
      discount_percentage: 0,
      instructions: 'Realize o pagamento escaneando o QR Code abaixo.'
    },
    mbway: {
      enabled: false,
      merchant_id: '',
      api_key: '',
      api_secret: '',
      timeout_minutes: 5,
      discount_percentage: 0,
      webhook_url: ''
    },
    credit_card: {
      enabled: true,
      regions: ['BR', 'PT'],
      gateway: 'pagseguro',
      brands: ['visa', 'mastercard'],
      max_installments: 12,
      min_installment_value: 5,
      fee_mode: 'with_fee',
      interest_mode: 'passed_to_client',
      three_d_secure: true,
      anti_fraud: true
    },
    pagseguro: {
      enabled: false,
      environment: 'sandbox',
      email: '',
      public_key: '',
      token: '',
      allowed_types: ['credit_card', 'pix']
    },
    picpay: {
      enabled: false,
      merchant_id: '',
      api_token: '',
      qr_code_support: true,
      timeout_minutes: 15,
      webhook_url: ''
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .in('chave', ['payment_methods', 'payment_global_settings']);

      if (error) throw error;

      if (data) {
        const methodsData = data.find(c => c.chave === 'payment_methods')?.valor;
        const globalData = data.find(c => c.chave === 'payment_global_settings')?.valor;

        if (methodsData) setMethods(methodsData);
        if (globalData) setGlobalSettings(globalData);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
      showToast('Erro ao carregar configurações.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      const { error: errorMethods } = await supabase
        .from('configuracoes')
        .upsert({ 
          chave: 'payment_methods', 
          valor: methods,
          descricao: 'Configurações dos métodos de pagamento'
        });

      const { error: errorGlobal } = await supabase
        .from('configuracoes')
        .upsert({ 
          chave: 'payment_global_settings', 
          valor: globalSettings,
          descricao: 'Configurações globais de pagamento'
        });

      if (errorMethods || errorGlobal) throw (errorMethods || errorGlobal);

      showToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Erro ao salvar configurações.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const AccordionItem = ({ id, title, icon: Icon, children, isActive: isMethodActive }: { id: string, title: string, icon: any, children: React.ReactNode, isActive?: boolean }) => {
    const isOpen = activeAccordion === id;
    
    return (
      <div className={`mb-4 overflow-hidden rounded-[24px] border transition-all ${
        isOpen ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
      }`}>
        <button 
          onClick={() => toggleAccordion(id)}
          className="flex w-full items-center justify-between p-6 text-left"
        >
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all shadow-md ${
              isOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <Icon size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">{title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2 w-2 rounded-full ${isMethodActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`} />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                  {isMethodActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}>
            <ChevronDown size={24} />
          </div>
        </button>
        
        {isOpen && (
          <div className="border-t border-gray-100 bg-white p-8 animate-in slide-in-from-top-2 duration-300">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Carregando Configurações Fintech...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Checkout Flow</h2>
          <p className="text-gray-500 font-medium">Gerencie credenciais, regras de cobrança e gateways de pagamento internacional.</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3 ${
            isSaving ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
          }`}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <CheckCircle2 size={20} />
          )}
          {isSaving ? 'Salvando...' : 'Aplicar Mudanças'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {/* Global Master Config */}
          <AccordionItem id="global" title="Global Payment Settings" icon={Settings2} isActive={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe size={16} className="text-blue-600" />
                    <label className="text-xs font-black uppercase tracking-widest text-gray-700">Ambiente de Operação</label>
                  </div>
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button 
                      onClick={() => setGlobalSettings({...globalSettings, mode: 'test'})}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${globalSettings.mode === 'test' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                    >
                      Test Mode (Sandbox)
                    </button>
                    <button 
                      onClick={() => setGlobalSettings({...globalSettings, mode: 'production'})}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${globalSettings.mode === 'production' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
                    >
                      Production (Live)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History size={16} className="text-blue-600" />
                    <label className="text-xs font-black uppercase tracking-widest text-gray-700">Timeout de Pagamento (minutos)</label>
                  </div>
                  <input 
                    type="number"
                    value={globalSettings.payment_timeout_minutes}
                    onChange={(e) => setGlobalSettings({...globalSettings, payment_timeout_minutes: parseInt(e.target.value)})}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                    <Zap size={14} /> Moedas Padrão
                  </h5>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-bold">Brasil:</span>
                      <span className="bg-white px-3 py-1 rounded-lg border border-blue-200 text-blue-900 font-black">BRL-R$</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-bold">Portugal:</span>
                      <span className="bg-white px-3 py-1 rounded-lg border border-blue-200 text-blue-900 font-black">EUR-€</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-4 cursor-pointer group p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                  <div 
                    onClick={() => setGlobalSettings({...globalSettings, manual_approval_enabled: !globalSettings.manual_approval_enabled})}
                    className={`w-14 h-7 rounded-full relative transition-all ${globalSettings.manual_approval_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 h-5 w-5 bg-white rounded-full transition-all shadow-md ${globalSettings.manual_approval_enabled ? 'left-8' : 'left-1'}`} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-700 uppercase tracking-widest block">Aprovação Manual</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Requer admin OK para liberar</span>
                  </div>
                </label>
              </div>
            </div>
          </AccordionItem>

          {/* PIX (Brazil) */}
          <AccordionItem id="pix" title="PIX (Brazil Instant)" icon={Zap} isActive={methods.pix.enabled}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Tipo de Chave</label>
                  <select 
                    value={methods.pix.key_type}
                    onChange={(e) => setMethods({
                      ...methods, 
                      pix: { ...methods.pix, key_type: e.target.value as any }
                    })}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                  >
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="random">Chave Aleatória</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Chave PIX</label>
                  <input 
                    type="text"
                    value={methods.pix.key_value}
                    onChange={(e) => setMethods({
                      ...methods, 
                      pix: { ...methods.pix, key_value: e.target.value }
                    })}
                    placeholder="Cole sua chave aqui..."
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Instruções ao Cliente</label>
                  <textarea 
                    value={methods.pix.instructions}
                    onChange={(e) => setMethods({
                      ...methods, 
                      pix: { ...methods.pix, instructions: e.target.value }
                    })}
                    rows={4}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                  <span className="text-xs font-black text-green-700 uppercase tracking-widest underline">Desconto p/ PIX (%)</span>
                  <input 
                    type="number"
                    value={methods.pix.discount_percentage}
                    onChange={(e) => setMethods({
                      ...methods, 
                      pix: { ...methods.pix, discount_percentage: parseFloat(e.target.value) }
                    })}
                    className="w-20 px-2 py-2 bg-white border border-green-200 rounded-lg text-center font-black text-green-700"
                  />
                </div>
              </div>
            </div>
          </AccordionItem>

          {/* MB WAY (Portugal) */}
          <AccordionItem id="mbway" title="MB WAY (Portugal Instant)" icon={Smartphone} isActive={methods.mbway.enabled}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Merchant ID</label>
                  <input 
                    type="text"
                    value={methods.mbway.merchant_id}
                    onChange={(e) => setMethods({
                      ...methods, 
                      mbway: { ...methods.mbway, merchant_id: e.target.value }
                    })}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">API Key (Sensitive)</label>
                  <input 
                    type="password"
                    value={methods.mbway.api_key}
                    onChange={(e) => setMethods({
                      ...methods, 
                      mbway: { ...methods.mbway, api_key: e.target.value }
                    })}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-blue-50/30 rounded-2xl border border-dashed border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Requisito PT</span>
                  </div>
                  <p className="text-[10px] text-blue-800 font-bold leading-relaxed">O número de telefone deve ser validado no padrão internacional (+351) para processamento MB WAY.</p>
                </div>
                <label className="flex items-center gap-4 cursor-pointer group p-4 bg-gray-100 rounded-2xl border border-transparent">
                  <div 
                    onClick={() => setMethods({...methods, mbway: {...methods.mbway, enabled: !methods.mbway.enabled}})}
                    className={`w-14 h-7 rounded-full relative transition-all ${methods.mbway.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 h-5 w-5 bg-white rounded-full transition-all ${methods.mbway.enabled ? 'left-8' : 'left-1'}`} />
                  </div>
                  <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Habilitar Gateway PT</span>
                </label>
              </div>
            </div>
          </AccordionItem>

          {/* Credit Card */}
          <AccordionItem id="credit_card" title="Credit Card (Global)" icon={CreditCard} isActive={methods.credit_card.enabled}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Principal Gateway</label>
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button 
                      onClick={() => setMethods({...methods, credit_card: {...methods.credit_card, gateway: 'pagseguro'}})}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${methods.credit_card.gateway === 'pagseguro' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                    >
                      PagSeguro (BR)
                    </button>
                    <button 
                      onClick={() => setMethods({...methods, credit_card: {...methods.credit_card, gateway: 'stripe'}})}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${methods.credit_card.gateway === 'stripe' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                    >
                      Stripe (EU)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Max Parcelas</label>
                    <input 
                      type="number"
                      value={methods.credit_card.max_installments}
                      onChange={(e) => setMethods({
                        ...methods, 
                        credit_card: { ...methods.credit_card, max_installments: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Min Parcela ($)</label>
                    <input 
                      type="number"
                      value={methods.credit_card.min_installment_value}
                      onChange={(e) => setMethods({
                        ...methods, 
                        credit_card: { ...methods.credit_card, min_installment_value: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {['visa', 'mastercard', 'amex', 'elo'].map(brand => (
                    <span key={brand} className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-200">
                      {brand}
                    </span>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={methods.credit_card.three_d_secure}
                      onChange={() => setMethods({...methods, credit_card: {...methods.credit_card, three_d_secure: !methods.credit_card.three_d_secure}})}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                    />
                    <span className="text-[11px] font-black uppercase text-gray-600">Ativar 3D Secure 2.0</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={methods.credit_card.anti_fraud}
                      onChange={() => setMethods({...methods, credit_card: {...methods.credit_card, anti_fraud: !methods.credit_card.anti_fraud}})}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                    />
                    <span className="text-[11px] font-black uppercase text-gray-600">Análise de Anti-Fraude (Machine Learning)</span>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-gray-500">Juros de Parcelamento</span>
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${methods.credit_card.interest_mode === 'passed_to_client' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {methods.credit_card.interest_mode === 'passed_to_client' ? 'pelo cliente' : 'absorvido'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>

          {/* PagSeguro */}
          <AccordionItem id="pagseguro" title="PagSeguro (Integration)" icon={ShieldCheck} isActive={methods.pagseguro.enabled}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">PagSeguro Email</label>
                  <input 
                    type="email"
                    value={methods.pagseguro.email}
                    onChange={(e) => setMethods({
                      ...methods, 
                      pagseguro: { ...methods.pagseguro, email: e.target.value }
                    })}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Public Key (Client Side)</label>
                  <input 
                    type="text"
                    value={methods.pagseguro.public_key}
                    onChange={(e) => setMethods({
                      ...methods, 
                      pagseguro: { ...methods.pagseguro, public_key: e.target.value }
                    })}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Access Token / Secret</label>
                <input 
                  type="password"
                  value={methods.pagseguro.token}
                  onChange={(e) => setMethods({
                    ...methods, 
                    pagseguro: { ...methods.pagseguro, token: e.target.value }
                  })}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"
                />
              </div>
            </div>
          </AccordionItem>

          {/* PicPay */}
          <AccordionItem id="picpay" title="PicPay (Mobile Wallet)" icon={Smartphone} isActive={methods.picpay.enabled}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">PicPay Merchant ID</label>
                  <input 
                    type="text"
                    value={methods.picpay.merchant_id}
                    onChange={(e) => setMethods({
                      ...methods, 
                      picpay: { ...methods.picpay, merchant_id: e.target.value }
                    })}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-700 mb-2 block">Integration Token</label>
                  <input 
                    type="password"
                    value={methods.picpay.api_token}
                    onChange={(e) => setMethods({
                      ...methods, 
                      picpay: { ...methods.picpay, api_token: e.target.value }
                    })}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-pink-50/30 rounded-2xl border border-pink-100">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle size={16} className="text-pink-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">Revisão de Cashback</span>
                  </div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Mensagem de Promoção (Opcional)</label>
                  <input 
                    type="text"
                    value={methods.picpay.cashback_info}
                    onChange={(e) => setMethods({
                      ...methods, 
                      picpay: { ...methods.picpay, cashback_info: e.target.value }
                    })}
                    placeholder="Ex: Ganhe 5% de volta via PicPay"
                    className="w-full px-3 py-3 bg-white border border-pink-100 rounded-xl font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          </AccordionItem>
        </div>

        {/* Sidebar Status & Monitoring */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={120} />
            </div>
            
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Lock size={16} className="text-blue-400" /> System Security
            </h4>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <span>Encryption Level</span>
                  <span>AES-256</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <span>LGPD Compliance</span>
                  <span>Verified</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed italic">
                  "Todas as credenciais de gateways são mascaradas no frontend. Mudanças de configuração são registradas no log de auditoria global."
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-500" /> Status do Webhook
            </h4>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-ping" />
                <span className="text-xs font-black uppercase text-gray-700">Webhook Live</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">99.9% Uptime</span>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Últimos Logs de Erro</p>
              <div className="space-y-2">
                <div className="p-3 bg-red-50 text-[10px] font-bold text-red-600 rounded-xl flex items-center gap-2">
                  <AlertCircle size={12} /> MB WAY: API Key Incorreta (2h atrás)
                </div>
                <div className="p-3 bg-blue-50 text-[10px] font-bold text-blue-600 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={12} /> PIX: QR Code Gerado com Sucesso
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
