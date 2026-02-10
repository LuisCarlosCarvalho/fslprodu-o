import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Portfolio } from '../../../types';

type PortfolioTabProps = {
  items: Portfolio[];
  onNewItem: () => void;
  onEditItem: (item: Portfolio) => void;
  onDeleteItem: (id: string) => void;
};

export function PortfolioTab({ items, onNewItem, onEditItem, onDeleteItem }: PortfolioTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Portfólio</h2>
        <button
          onClick={onNewItem}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} />
          Novo Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="border rounded-xl overflow-hidden bg-white shadow-sm group">
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sem Imagem
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => onEditItem(item)}
                  className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                  <span className="text-xs text-blue-600 font-medium">{item.category}</span>
                </div>
                {item.project_url && (
                  <a 
                    href={item.project_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mt-2">{item.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {item.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            Nenhum item no portfólio.
          </div>
        )}
      </div>
    </div>
  );
}
