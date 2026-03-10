import { Plus } from 'lucide-react';
import { Portfolio } from '../../../types';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPortfolio: Portfolio | null;
  portfolioForm: {
    title: string;
    category: string;
    image_url: string;
    project_url: string;
    description: string;
    is_active: boolean;
  };
  setPortfolioForm: (form: any) => void;
  handleSavePortfolio: () => Promise<void>;
}

export function PortfolioModal({
  isOpen,
  onClose,
  editingPortfolio,
  portfolioForm,
  setPortfolioForm,
  handleSavePortfolio,
}: PortfolioModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {editingPortfolio ? 'Editar Projeto' : 'Novo Projeto'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Título do Projeto</label>
            <input
              type="text"
              value={portfolioForm.title}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nome do projeto"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Categoria</label>
            <select
              value={portfolioForm.category}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Design Gráfico">Design Gráfico</option>
              <option value="Easy Colour">Easy Colour</option>
              <option value="Loja Online">Loja Online</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Marketing Digital">Marketing Digital</option>
              <option value="Modelos de Página">Modelos de Página</option>
              <option value="Site à Medida">Site à Medida</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">URL da Imagem</label>
            <input
              type="text"
              value={portfolioForm.image_url}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, image_url: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">URL do Projeto (opcional)</label>
            <input
              type="text"
              value={portfolioForm.project_url}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, project_url: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://projeto.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Descrição</label>
            <textarea
              value={portfolioForm.description}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="Breve descrição do projeto"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={portfolioForm.is_active}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, is_active: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Ativo (visível no site)</span>
            </label>
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSavePortfolio}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
          >
            Salvar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
