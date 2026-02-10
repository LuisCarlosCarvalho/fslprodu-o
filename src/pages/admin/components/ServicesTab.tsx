import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Service } from '../../../types';

type ServicesTabProps = {
  services: Service[];
  onNewService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (id: string) => void;
};

export function ServicesTab({ services, onNewService, onEditService, onDeleteService }: ServicesTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Serviços</h2>
        <button
          onClick={onNewService}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} />
          Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Tag size={20} />
              </div>
              <div className="flex gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditService(service)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDeleteService(service.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-2">{service.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {service.description}
            </p>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                  {service.category}
                </span>
                <div className="flex gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                  {service.pricing_config?.BR?.ranges?.length > 0 && (
                    <span className="text-sm" title="Preços p/ Brasil configurados">🇧🇷</span>
                  )}
                  {service.pricing_config?.PT?.ranges?.length > 0 && (
                    <span className="text-sm" title="Preços p/ Portugal configurados">🇵🇹</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Preço Base</span>
                <span className="font-black text-gray-900 text-lg">
                  € {service.base_price.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            Nenhum serviço cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}
