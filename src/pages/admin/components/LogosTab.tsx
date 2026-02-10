import { Plus, Edit, Trash2, Link as LinkIcon, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { ClientLogo } from '../../../types';

type LogosTabProps = {
  logos: ClientLogo[];
  onNewLogo: () => void;
  onEditLogo: (logo: ClientLogo) => void;
  onDeleteLogo: (id: string) => void;
  onToggleStatus: (logo: ClientLogo) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
};

export function LogosTab({ logos, onNewLogo, onEditLogo, onDeleteLogo, onToggleStatus, onReorder }: LogosTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Carrossel de Clientes</h2>
        <button
          onClick={onNewLogo}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Adicionar Logo
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4">Ordem</th>
              <th className="px-6 py-4">Logo</th>
              <th className="px-6 py-4">Nome do Cliente</th>
              <th className="px-6 py-4">Website</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logos.map((logo, index) => (
              <tr key={logo.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button 
                      disabled={index === 0}
                      onClick={() => onReorder(logo.id, 'up')}
                      className={`p-1 rounded ${index === 0 ? 'text-gray-200' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                      <MoveUp size={14} />
                    </button>
                    <button 
                      disabled={index === logos.length - 1}
                      onClick={() => onReorder(logo.id, 'down')}
                      className={`p-1 rounded ${index === logos.length - 1 ? 'text-gray-200' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                      <MoveDown size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-16 h-10 bg-gray-50 rounded border border-gray-100 flex items-center justify-center overflow-hidden">
                    {logo.image_url ? (
                      <img src={logo.image_url} alt={logo.name} className="max-w-full max-h-full object-contain p-1 grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <ImageIcon size={20} className="text-gray-300" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900">{logo.name}</span>
                </td>
                <td className="px-6 py-4">
                  {logo.website_url ? (
                    <a href={logo.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                      <LinkIcon size={12} />
                      Link
                    </a>
                  ) : (
                    <span className="text-gray-300 text-xs italic">Nenhum</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => onToggleStatus(logo)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                      logo.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {logo.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEditLogo(logo)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteLogo(logo.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logos.length === 0 && (
          <div className="py-20 text-center bg-white">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="text-gray-200" size={32} />
            </div>
            <p className="text-gray-400 font-medium">Nenhum logo de cliente adicionado.</p>
            <button onClick={onNewLogo} className="mt-4 text-blue-600 font-bold hover:underline capitalize">Adicionar primeiro logo</button>
          </div>
        )}
      </div>
    </div>
  );
}
