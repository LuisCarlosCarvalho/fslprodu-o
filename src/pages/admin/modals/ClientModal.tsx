import { Plus, ShoppingCart, Shield } from 'lucide-react';
import { Profile, PaymentMethodsState, GlobalPaymentSettings } from '../../../types';
import { maskCPF, maskCNPJ, maskCEP, maskPostalCodePT, maskPhone } from '../../../lib/masks';
import { PaymentScoreBar } from '../../../components/admin/PaymentScoreBar';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingClient: Profile | null;
  clientForm: any;
  setClientForm: (form: any) => void;
  handleSaveClient: (isVerified?: boolean) => Promise<void>;
}

export function ClientModal({
  isOpen,
  onClose,
  editingClient,
  clientForm,
  setClientForm,
  handleSaveClient
}: ClientModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">
            {editingClient ? 'Editar Perfil do Cliente' : 'Novo Cadastro de Cliente'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        {editingClient && (
          <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <PaymentScoreBar score={editingClient.payment_score} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {editingClient ? 'País de Origem' : 'Selecione o País de Origem'}
            </label>
            <div className={`grid ${editingClient ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              {(!editingClient || clientForm.country === 'Brasil') && (
                <button
                  type="button"
                  onClick={() => !editingClient && setClientForm({ 
                    ...clientForm, 
                    country: 'Brasil',
                    payment_settings: { 
                      ...clientForm.payment_settings, 
                      default_currency: 'BRL',
                      unlocked_methods: clientForm.payment_settings.unlocked_methods
                        .map((m: string) => m === 'mbway' ? 'pix' : m)
                        .filter((m: string, i: number, self: string[]) => self.indexOf(m) === i)
                    }
                  })}
                  className={`flex items-center justify-center gap-3 py-4 border-2 rounded-xl transition-all ${
                    clientForm.country === 'Brasil' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  } ${editingClient ? 'cursor-default' : ''}`}
                >
                  <span className="text-2xl">🇧🇷</span>
                  <span className="font-bold">Brasil</span>
                </button>
              )}
              {(!editingClient || clientForm.country === 'Portugal') && (
                <button
                  type="button"
                  onClick={() => !editingClient && setClientForm({ 
                    ...clientForm, 
                    country: 'Portugal',
                    payment_settings: { 
                      ...clientForm.payment_settings, 
                      default_currency: 'EUR',
                      unlocked_methods: clientForm.payment_settings.unlocked_methods
                        .map((m: string) => m === 'pix' ? 'mbway' : m)
                        .filter((m: string, i: number, self: string[]) => self.indexOf(m) === i)
                    }
                  })}
                  className={`flex items-center justify-center gap-3 py-4 border-2 rounded-xl transition-all ${
                    clientForm.country === 'Portugal' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  } ${editingClient ? 'cursor-default' : ''}`}
                >
                  <span className="text-2xl">🇵🇹</span>
                  <span className="font-bold">Portugal</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Nome Completo / Empresa</label>
            <input
              type="text"
              value={clientForm.full_name}
              onChange={(e) => setClientForm({ ...clientForm, full_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nome do Cliente"
            />
          </div>

           <div>
             <label className="block text-sm font-semibold mb-2">
               {clientForm.country === 'Brasil' ? 'CPF ou CNPJ' : 'NIF'}
             </label>
             <input
               type="text"
               value={clientForm.country === 'Brasil' ? clientForm.cpf_cnpj : clientForm.nif}
               onChange={(e) => {
                 let val = e.target.value;
                 if (clientForm.country === 'Brasil') {
                   val = val.length <= 14 ? maskCPF(val) : maskCNPJ(val);
                   setClientForm({ ...clientForm, cpf_cnpj: val });
                 } else {
                   setClientForm({ ...clientForm, nif: val.replace(/\D/g, '').slice(0, 9) });
                 }
               }}
               className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               placeholder={clientForm.country === 'Brasil' ? '000.000.000-00' : '123456789'}
             />
           </div>

           <div>
             <label className="block text-sm font-semibold mb-2">E-mail (Login)</label>
             <input
               type="email"
               value={clientForm.email}
               onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
               className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               placeholder="email@exemplo.com"
             />
           </div>

           <div>
             <label className="block text-sm font-semibold mb-2">Telefone</label>
             <input
               type="text"
               value={clientForm.phone}
               onChange={(e) => {
                 const val = clientForm.country === 'Brasil' ? maskPhone(e.target.value) : e.target.value;
                 setClientForm({ ...clientForm, phone: val });
               }}
               className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               placeholder={clientForm.country === 'Brasil' ? '(00) 00000-0000' : '+351 000 000 000'}
             />
           </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Endereço Completo</label>
            <input
              type="text"
              value={clientForm.address}
              onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Rua, Número, Bairro..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Cidade</label>
            <input
              type="text"
              value={clientForm.city}
              onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                {clientForm.country === 'Brasil' ? 'Estado' : 'Distrito'}
              </label>
              <input
                type="text"
                value={clientForm.state_distrito}
                onChange={(e) => setClientForm({ ...clientForm, state_distrito: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                {clientForm.country === 'Brasil' ? 'CEP' : 'Cód. Postal'}
              </label>
              <input
                type="text"
                value={clientForm.zip_code}
                onChange={(e) => {
                  const val = clientForm.country === 'Brasil' ? maskCEP(e.target.value) : maskPostalCodePT(e.target.value);
                  setClientForm({ ...clientForm, zip_code: val });
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={clientForm.country === 'Brasil' ? '00000-000' : '0000-000'}
              />
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6 pt-6 border-t border-gray-100">
            <div className="bg-gray-50/50 p-6 rounded-[24px] border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Configuração de Pagamento</h4>
                  <p className="text-xs text-gray-500">
                    Moeda Atual: <span className="font-bold text-blue-600">
                      {clientForm.payment_settings.default_currency === 'BRL' ? 'Real (R$)' : 'Euro (€)'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['pix', 'mbway', 'credit_card', 'transfer', 'cash', 'boleto', 'installments'].filter(m => {
                  if (clientForm.country === 'Brasil' && m === 'mbway') return false;
                  if (clientForm.country === 'Portugal' && m === 'pix') return false;
                  return true;
                }).map((method) => {
                  const isSelected = clientForm.payment_settings.unlocked_methods.includes(method);
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        const currentMethods = clientForm.payment_settings.unlocked_methods;
                        const newMethods = isSelected
                          ? currentMethods.filter((m: string) => m !== method)
                          : [...currentMethods, method];
                        setClientForm({
                          ...clientForm,
                          payment_settings: { ...clientForm.payment_settings, unlocked_methods: newMethods }
                        });
                      }}
                      className={`px-3 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {method === 'mbway' ? 'MB WAY' : method.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setClientForm({ 
                      ...clientForm, 
                      payment_settings: { ...clientForm.payment_settings, card_fee_enabled: !clientForm.payment_settings.card_fee_enabled } 
                    })}
                    className={`w-12 h-6 rounded-full relative transition-all ${clientForm.payment_settings.card_fee_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${clientForm.payment_settings.card_fee_enabled ? 'left-7' : 'left-1'}`} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors uppercase tracking-widest">Repassar Taxa de Cartão</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between bg-blue-50/50 p-6 rounded-[24px] border border-blue-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Gestão de Crédito</h4>
                  <p className="text-xs text-gray-500">Configure o score e concessões especiais</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score Atual: {clientForm.payment_score}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={clientForm.payment_score}
                      onChange={(e) => setClientForm({ ...clientForm, payment_score: parseInt(e.target.value) })}
                      className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
                <div className="h-10 w-px bg-gray-200 mx-2" />
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setClientForm({ ...clientForm, manual_payment_override: !clientForm.manual_payment_override })}
                    className={`w-12 h-6 rounded-full relative transition-all ${clientForm.manual_payment_override ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${clientForm.manual_payment_override ? 'left-7' : 'left-1'}`} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Autorização Manual</span>
                </label>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-red-50 rounded-2xl transition-colors border border-transparent hover:border-red-100 group">
              <div 
                onClick={() => setClientForm({ ...clientForm, force_password_reset: !clientForm.force_password_reset })}
                className={`w-10 h-5 rounded-full relative transition-all ${clientForm.force_password_reset ? 'bg-red-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all ${clientForm.force_password_reset ? 'left-5.5' : 'left-0.5'}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors">Forçar Troca de Senha</span>
                <span className="text-[10px] text-gray-400">Obrigará o cliente a trocar a senha no próximo login</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button
            onClick={() => handleSaveClient()}
            className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {editingClient ? 'Atualizar Cliente' : 'Finalizar Cadastro'}
          </button>
          <button
            onClick={onClose}
            className="px-8 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
        </div>
        
        {!editingClient && (
          <p className="text-center text-xs text-gray-400 mt-4 italic">
            * Ao finalizar, o número de O.S. será gerado e o acesso do cliente será criado automaticamente.
          </p>
        )}
      </div>
    </div>
  );
}
