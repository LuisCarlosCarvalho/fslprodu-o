import { Zap, Plus } from 'lucide-react';
import { Project, Profile, Service, PaymentMethodsState, GlobalPaymentSettings } from '../../../types';
import { calculateFinalValue, getAvailablePaymentMethods } from '../../../lib/payment-engine';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: Project | null;
  isClientLocked?: boolean;
  projectForm: any;
  setProjectForm: (form: any) => void;
  handleSaveProject: () => Promise<void>;
  clients: Profile[];
  services: Service[];
  paymentConfigs: PaymentMethodsState | null;
  paymentGlobalSettings: GlobalPaymentSettings | null;
}

export function ProjectModal({
  isOpen,
  onClose,
  editingProject,
  isClientLocked = false,
  projectForm,
  setProjectForm,
  handleSaveProject,
  clients,
  services,
  paymentConfigs,
  paymentGlobalSettings,
}: ProjectModalProps) {
  if (!isOpen) return null;

  const selectedClient = clients.find(c => c.id === projectForm.client_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Cliente</label>
            <select
              value={projectForm.client_id}
              onChange={(e) => setProjectForm({ ...projectForm, client_id: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${
                isClientLocked ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
              }`}
              disabled={isClientLocked}
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name} ({client.email || 'S/E-mail'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Serviço</label>
            <select
              value={projectForm.service_id}
              onChange={(e) => setProjectForm({ ...projectForm, service_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Selecione um serviço</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Nome do Projeto</label>
            <input
              type="text"
              value={projectForm.project_name}
              onChange={(e) => setProjectForm({ ...projectForm, project_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              value={projectForm.status}
              onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Progresso: {projectForm.progress_percentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={projectForm.progress_percentage}
              onChange={(e) => setProjectForm({ ...projectForm, progress_percentage: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Valor Base do Projeto</label>
                <input
                  type="number"
                  value={projectForm.total_value}
                  onChange={(e) => setProjectForm({ ...projectForm, total_value: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Ajuste de Taxas/Descontos</label>
                <div 
                  className="flex items-center gap-3 p-2 border-2 border-blue-100 bg-blue-50/50 rounded-xl transition-all"
                >
                  <Zap size={18} className="text-blue-600" />
                  <span className="text-[10px] font-black uppercase text-blue-700">
                    Regras de Checkout Ativas
                  </span>
                </div>
              </div>
            </div>

          {projectForm.card_fee_included && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-600 font-medium">Valor com Acréscimo:</span>
                <span className="text-blue-700 font-black text-lg">
                  {(() => {
                    const currency = selectedClient?.payment_settings?.default_currency || (selectedClient?.country === 'Portugal' ? 'EUR' : 'BRL');
                    const locale = selectedClient?.country === 'Portugal' ? 'pt-PT' : 'pt-BR';
                    
                    const finalValue = paymentConfigs 
                      ? calculateFinalValue(projectForm.payment_method || 'credit_card', projectForm.total_value || 0, paymentConfigs)
                      : (projectForm.total_value || 0) * 1.035;

                    return new Intl.NumberFormat(locale, { 
                      style: 'currency', 
                      currency 
                    }).format(finalValue);
                  })()}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Método de Pagamento</label>
            <select
              value={projectForm.payment_method || ''}
              onChange={(e) => setProjectForm({ ...projectForm, payment_method: e.target.value as any })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Selecione o método</option>
              {paymentConfigs && paymentGlobalSettings ? (
                (() => {
                  if (!selectedClient) return null;

                  const availableMethods = getAvailablePaymentMethods({
                    orderValue: projectForm.total_value || 0,
                    client: selectedClient,
                    config: paymentConfigs,
                    global: paymentGlobalSettings
                  });

                  return availableMethods.map(m => (
                    <option key={m.id} value={m.id} disabled={!m.enabled}>
                      {m.name} {!m.enabled && `🔒 (${m.reason})`} {m.discount_percentage ? `(-${m.discount_percentage}%)` : ''}
                    </option>
                  ));
                })()
              ) : (
                <>
                  <option value="pix">PIX (Carregando Regras...)</option>
                  <option value="credit_card">Cartão de Crédito</option>
                </>
              )}
              <option value="cash">Dinheiro / À Vista</option>
              <option value="transfer">Transferência Bancária</option>
            </select>
            {selectedClient?.payment_score !== undefined && (
              <p className="text-[10px] text-gray-400 mt-1 italic">
                * Opções baseadas no score do cliente ({selectedClient.payment_score}/100)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Status do Pagamento</label>
            <select
              value={projectForm.payment_status}
              onChange={(e) => setProjectForm({ ...projectForm, payment_status: e.target.value as any })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="pending">Pendente</option>
              <option value="partially_paid">Parcialmente Pago</option>
              <option value="paid">Pago / Quitado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Observações</label>
            <textarea
              value={projectForm.notes}
              onChange={(e) => setProjectForm({ ...projectForm, notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={4}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSaveProject}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Salvar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
