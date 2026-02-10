import { Plus, Edit, CheckSquare, MessageSquare, FileText, Trash2 } from 'lucide-react';
import { Project, Profile, Service } from '../../../types';

type ProjectsTabProps = {
  projects: (Project & { client: Profile; service: Service })[];
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onManageSteps: (project: Project) => void;
  onOpenChat: (project: Project) => void;
  onGenerateContract: (project: Project & { client: Profile; service: Service }) => void;
  onDeleteProject: (id: string) => void;
};

export function ProjectsTab({
  projects,
  onNewProject,
  onEditProject,
  onManageSteps,
  onOpenChat,
  onGenerateContract,
  onDeleteProject,
}: ProjectsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projetos</h2>
        <button
          onClick={onNewProject}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} />
          Novo Projeto
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{project.project_name}</h3>
                <p className="text-sm text-gray-600">
                  Cliente: {project.client?.full_name || 'Desconhecido'} | Serviço: {project.service?.name || 'Desconhecido'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditProject(project)}
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title="Editar Projeto"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onManageSteps(project)}
                  className="text-green-600 hover:text-green-700 p-1"
                  title="Gerenciar Etapas"
                >
                  <CheckSquare size={18} />
                </button>
                <button
                  onClick={() => onOpenChat(project)}
                  className="text-purple-600 hover:text-purple-700 p-1"
                  title="Chat de Acompanhamento"
                >
                  <MessageSquare size={18} />
                </button>
                <button
                  onClick={() => onGenerateContract(project)}
                  className="text-orange-600 hover:text-orange-700 p-1"
                  title="Gerar Contrato"
                >
                  <FileText size={18} />
                </button>
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Excluir Projeto"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className={`text-sm px-2 py-1 rounded ${
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status === 'pending' ? 'Pendente' :
                 project.status === 'in_progress' ? 'Em Andamento' :
                 project.status === 'completed' ? 'Concluído' : 'Cancelado'}
              </span>
              <div className="flex-grow bg-gray-200 rounded-full h-2.5 max-w-[200px]">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${project.progress_percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                {project.progress_percentage}%
              </span>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            Nenhum projeto encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
