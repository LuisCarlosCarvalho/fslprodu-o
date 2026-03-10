import { Plus } from 'lucide-react';
import { ClientLogo } from '../../../types';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLogo: ClientLogo | null;
  logoForm: {
    name: string;
    image_url: string;
    website_url: string;
    is_active: boolean;
    order_index: number;
  };
  setLogoForm: (form: any) => void;
  handleSaveLogo: () => Promise<void>;
}

export function LogoModal({
  isOpen,
  onClose,
  editingLogo,
  logoForm,
  setLogoForm,
  handleSaveLogo,
}: LogoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">
            {editingLogo ? 'Editar Logo' : 'Nova Logo de Parceiro'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome do Parceiro/Cliente</label>
            <input
              type="text"
              value={logoForm.name}
              onChange={(e) => setLogoForm({ ...logoForm, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Empresa X"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">URL da Logo (PNG Transparente)</label>
            <input
              type="text"
              value={logoForm.image_url}
              onChange={(e) => setLogoForm({ ...logoForm, image_url: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Website (Opcional)</label>
            <input
              type="text"
              value={logoForm.website_url}
              onChange={(e) => setLogoForm({ ...logoForm, website_url: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Ordem de Exibição</label>
              <input
                type="number"
                value={logoForm.order_index}
                onChange={(e) => setLogoForm({ ...logoForm, order_index: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={logoForm.is_active}
                  onChange={(e) => setLogoForm({ ...logoForm, is_active: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Ativo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSaveLogo}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95"
          >
            {editingLogo ? 'Atualizar Logo' : 'Salvar Logo'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
