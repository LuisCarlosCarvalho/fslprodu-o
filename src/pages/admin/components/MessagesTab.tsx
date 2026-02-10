import { Mail, MessageCircle, Reply } from 'lucide-react';
import { QuoteRequest } from '../../../types';

type MessagesTabProps = {
  messages: QuoteRequest[];
  onReply: (message: QuoteRequest) => void;
};

export function MessagesTab({ messages, onReply }: MessagesTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Mensagens Recebidas</h2>
      <div className="grid grid-cols-1 gap-4">
        {messages.map((msg) => (
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

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700 italic">"{msg.message}"</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => onReply(msg)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm"
              >
                <Reply size={16} />
                Responder
              </button>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
            Nenhuma mensagem recebida.
          </div>
        )}
      </div>
    </div>
  );
}
