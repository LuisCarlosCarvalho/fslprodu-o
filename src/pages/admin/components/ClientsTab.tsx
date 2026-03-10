import { useState } from 'react';
import { Plus, Mail, MessageCircle, Search } from 'lucide-react';
import { Profile } from '../../../types';

type ClientsTabProps = {
  clients: Profile[];
  onNewClient: () => void;
  onEditClient: (client: Profile) => void;
  onViewProjects: (clientId: string) => void;
};

export function ClientsTab({ clients, onNewClient, onEditClient, onViewProjects }: ClientsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Clientes</h2>
        
        <div className="flex flex-1 w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          <button
            onClick={onNewClient}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shrink-0"
          >
            <Plus size={18} />
            Cadastrar Cliente
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
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
                onClick={() => onViewProjects(client.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold shadow-sm"
              >
                Ver Projetos
              </button>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            {searchTerm ? 'Nenhum cliente encontrado para esta busca.' : 'Nenhum cliente cadastrado ainda.'}
          </div>
        )}
      </div>
    </div>
  );
}
