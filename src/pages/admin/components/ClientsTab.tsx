import { Plus, Mail, MessageCircle } from 'lucide-react';
import { Profile } from '../../../types';

type ClientsTabProps = {
  clients: Profile[];
  onNewClient: () => void;
  onEditClient: (client: Profile) => void;
};

export function ClientsTab({ clients, onNewClient, onEditClient }: ClientsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <button
          onClick={onNewClient}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} />
          Cadastrar Cliente
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div key={client.id} className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all group relative">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-mono text-gray-400 font-bold">
                O.S: {client.os_number || '---'}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                {client.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">{client.full_name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 italic">{client.country || 'Nacionalidade não inf.'}</p>
                  {client.payment_settings?.default_currency && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-black border border-blue-100 uppercase tracking-tighter">
                      {client.payment_settings.default_currency === 'BRL' ? 'R$' : '€'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <p className="text-xs text-gray-600 flex items-center gap-2 break-all">
                <Mail size={14} className="text-gray-400 shrink-0" /> {client.email || 'Sem e-mail'}
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <MessageCircle size={14} className="text-gray-400 shrink-0" /> {client.phone || 'Sem telefone'}
              </p>
              <p className="text-xs font-medium text-gray-700">
                {client.country === 'Brasil' ? `CPF/CNPJ: ${client.cpf_cnpj || '---'}` : `NIF: ${client.nif || '---'}`}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEditClient(client)}
                className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors text-xs font-bold"
              >
                Editar Perfil
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold shadow-sm"
              >
                Ver Projetos
              </button>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            Nenhum cliente cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
