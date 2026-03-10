import { useState } from 'react';
import { Mail, MessageCircle, Reply, Search } from 'lucide-react';
import { QuoteRequest } from '../../../types';

type MessagesTabProps = {
  messages: QuoteRequest[];
  onReply: (message: QuoteRequest) => void;
};

export function MessagesTab({ messages, onReply }: MessagesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Mensagens Recebidas</h2>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar mensagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                  {msg.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{msg.name}</h3>
                  <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase ${
                msg.status === 'new' ? 'bg-blue-100 text-blue-700' :
                msg.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {msg.status === 'new' ? 'Nova' : 
                 msg.status === 'contacted' ? 'Contatado' : 'Finalizada'}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400" />
                {msg.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MessageCircle size={14} className="text-gray-400" />
                {msg.phone || 'N/A'}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-48 overflow-y-auto space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-blue-600 uppercase">Solicitação Inicial:</span>
                <p className="text-sm text-gray-700 italic">"{msg.message}"</p>
              </div>

              {msg.messages && msg.messages.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-[10px] font-black text-green-600 uppercase mb-2 block">Histórico de Respostas:</span>
                  <div className="space-y-3">
                    {msg.messages.map((reply) => (
                      <div key={reply.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-gray-900">{reply.sender_name}</span>
                          <span className="text-[9px] text-gray-400">{new Date(reply.created_at).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-gray-700">{reply.message}</p>
                        <div className="mt-1 flex justify-end">
                           <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                             reply.channel === 'whatsapp' ? 'bg-green-100 text-green-600' : 
                             reply.channel === 'email' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                           }`}>
                             Via {reply.channel}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => onReply(msg)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm"
              >
                <Reply size={16} />
                Nova Resposta
              </button>
            </div>
          </div>
        ))}
        {filteredMessages.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            {searchTerm ? 'Nenhuma mensagem encontrada para esta busca.' : 'Nenhuma mensagem recebida.'}
          </div>
        )}
      </div>
    </div>
  );
}
