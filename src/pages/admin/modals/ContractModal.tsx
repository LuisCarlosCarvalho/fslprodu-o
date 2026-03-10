import { FileText, Shield, TrendingUp, Zap, Plus } from 'lucide-react';
import { Project, Profile, Service } from '../../../types';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: (Project & { client: Profile; service: Service }) | null;
  handleGenerateContract: (type: 'service' | 'maintenance') => Promise<void>;
}

export function ContractModal({
  isOpen,
  onClose,
  selectedProject,
  handleGenerateContract,
}: ContractModalProps) {
  if (!isOpen || !selectedProject) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-[32px] p-10 max-w-2xl w-full mx-4 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="flex justify-between items-start mb-10 relative">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <FileText className="text-blue-600" size={20} />
               <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Gerador de Contratos</h2>
            </div>
            <p className="text-gray-500 text-sm font-medium">Selecione o modelo para: <span className="text-blue-600 font-bold">{selectedProject.project_name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <Plus size={28} className="rotate-45" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <button
            onClick={() => handleGenerateContract('service')}
            className="group flex flex-col p-8 bg-white border-2 border-gray-100 rounded-[24px] hover:border-blue-600 transition-all text-left shadow-sm hover:shadow-xl hover:shadow-blue-50 active:scale-95"
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Shield size={28} />
            </div>
            <h3 className="font-extrabold text-gray-900 mb-2 uppercase tracking-tight">Prestação de Serviço</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">Contrato padrão para desenvolvimento inicial, contendo cláusulas de entrega e prazos.</p>
          </button>

          <button
            onClick={() => handleGenerateContract('maintenance')}
            className="group flex flex-col p-8 bg-white border-2 border-gray-100 rounded-[24px] hover:border-blue-600 transition-all text-left shadow-sm hover:shadow-xl hover:shadow-blue-50 active:scale-95"
          >
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <TrendingUp size={28} />
            </div>
            <h3 className="font-extrabold text-gray-900 mb-2 uppercase tracking-tight">Manutenção Mensal</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">Focado em suporte contínuo, atualizações e horas de desenvolvimento mensais.</p>
          </button>
        </div>

        <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
           <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                 <Zap size={20} />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-gray-900 mb-1">Processamento Automatizado</h4>
                 <p className="text-xs text-gray-500 leading-relaxed font-medium">O PDF será gerado, anexado ao projeto e uma cópia será enviada automaticamente para o canal do cliente.</p>
              </div>
           </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-8 font-black uppercase tracking-widest opacity-50">FSL SOLUTION • LEGAL ENGINE v2.0</p>
      </div>
    </div>
  );
}
