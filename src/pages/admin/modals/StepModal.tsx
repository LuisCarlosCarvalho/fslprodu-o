import { Plus, Edit, Trash2 } from 'lucide-react';
import { Project, ProjectStep } from '../../../types';

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: Project | null;
  projectSteps: ProjectStep[];
  stepForm: {
    title: string;
    description: string;
    is_completed: boolean;
    file_url: string;
    order_index: number;
  };
  setStepForm: (form: any) => void;
  editingStep: ProjectStep | null;
  setEditingStep: (step: ProjectStep | null) => void;
  handleSaveStep: () => Promise<void>;
  handleDeleteStep: (id: string) => Promise<void>;
}

export function StepModal({
  isOpen,
  onClose,
  selectedProject,
  projectSteps,
  stepForm,
  setStepForm,
  editingStep,
  setEditingStep,
  handleSaveStep,
  handleDeleteStep,
}: StepModalProps) {
  if (!isOpen || !selectedProject) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Gestor de Etapas</h2>
            <p className="text-gray-500 text-sm">Projeto: {selectedProject.project_name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 border-r pr-8 border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              {editingStep ? 'Editar Etapa' : 'Nova Etapa'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Título da Etapa</label>
                <input
                  type="text"
                  value={stepForm.title}
                  onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                  placeholder="Ex: Briefing Inicial"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Descrição</label>
                <textarea
                  value={stepForm.description}
                  onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                  placeholder="Detalhes sobre o que será feito..."
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="step_completed"
                  checked={stepForm.is_completed}
                  onChange={(e) => setStepForm({ ...stepForm, is_completed: e.target.checked })}
                  className="w-5 h-5 rounded-lg text-blue-600 border-gray-300"
                />
                <label htmlFor="step_completed" className="text-sm font-bold text-gray-700 cursor-pointer">Marcar como Concluída</label>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">URL do Anexo / Entregável</label>
                <input
                  type="text"
                  value={stepForm.file_url}
                  onChange={(e) => setStepForm({ ...stepForm, file_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                  placeholder="Caminho do arquivo no storage..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveStep}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  {editingStep ? 'Atualizar' : 'Adicionar'}
                </button>
                {editingStep && (
                  <button
                    onClick={() => {
                      setEditingStep(null);
                      setStepForm({ title: '', description: '', is_completed: false, file_url: '', order_index: projectSteps.length + 1 });
                    }}
                    className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
                  >
                     <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
             <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs text-gray-400">Linha do Tempo</h3>
             {projectSteps.length === 0 ? (
               <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 font-bold text-gray-300 text-sm">
                  Nenhuma etapa cadastrada ainda.
               </div>
             ) : (
               <div className="space-y-3">
                 {projectSteps.map((step, idx) => (
                   <div key={step.id} className="group flex items-center justify-between p-5 border border-gray-100 rounded-2xl bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${step.is_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                           {idx + 1}
                         </div>
                         <div>
                           <p className={`font-bold text-sm ${step.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{step.title}</p>
                           {step.is_completed && <span className="text-[10px] text-green-600 font-black uppercase tracking-tighter">Tarefa Finalizada</span>}
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                           onClick={() => {
                             setEditingStep(step);
                             setStepForm({
                               title: step.title,
                               description: step.description || '',
                               is_completed: step.is_completed,
                               file_url: step.file_url || '',
                               order_index: step.order_index,
                             });
                           }}
                           className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                         >
                            <Edit size={16} />
                         </button>
                         <button
                           onClick={() => handleDeleteStep(step.id)}
                           className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
           <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all"
           >
             Concluir Edição
           </button>
        </div>
      </div>
    </div>
  );
}
