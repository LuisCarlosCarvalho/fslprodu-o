import { MessageCircle, Mail, Plus } from 'lucide-react';
import { QuoteRequest } from '../../../types';
import { showToast } from '../../../components/ui/Toast';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMessage: QuoteRequest | null;
  replyForm: {
    message: string;
    value: string;
    observations: string;
  };
  setReplyForm: (form: any) => void;
  setIsMessageEdited: (edited: boolean) => void;
  handleReplyWhatsApp: () => Promise<void>;
  handleReplyEmail: () => Promise<void>;
}

export function ReplyModal({
  isOpen,
  onClose,
  selectedMessage,
  replyForm,
  setReplyForm,
  setIsMessageEdited,
  handleReplyWhatsApp,
  handleReplyEmail,
}: ReplyModalProps) {
  if (!isOpen || !selectedMessage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Responder Orçamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Valor Sugerido (R$)</label>
              <input
                type="text"
                value={replyForm.value}
                onChange={(e) => setReplyForm({ ...replyForm, value: e.target.value })}
                className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Observações Adicionais</label>
              <input
                type="text"
                value={replyForm.observations}
                onChange={(e) => setReplyForm({ ...replyForm, observations: e.target.value })}
                className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Prazo de 10 dias"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Mensagem Personalizada</label>
            <textarea
              value={replyForm.message}
              onChange={(e) => {
                setReplyForm({ ...replyForm, message: e.target.value });
                setIsMessageEdited(true);
              }}
              className="w-full px-4 py-4 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[150px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="relative group">
              {(selectedMessage as any).contact_method !== 'email' && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold animate-bounce whitespace-nowrap">
                  Canal Sugerido
                </span>
              )}
              <button
                onClick={handleReplyWhatsApp}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                  (selectedMessage as any).contact_method !== 'email'
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageCircle size={20} />
                Responder por WhatsApp
              </button>
            </div>

            <div className="relative group">
              {(selectedMessage as any).contact_method === 'email' && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold animate-bounce whitespace-nowrap">
                  Canal Sugerido
                </span>
              )}
              <button
                onClick={handleReplyEmail}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                  (selectedMessage as any).contact_method === 'email'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Mail size={20} />
                Responder por E-mail
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-100">
            <span className="text-xs text-gray-400">Clique para apenas copiar o texto:</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(replyForm.message);
                showToast('Mensagem copiada!', 'success');
              }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Copiar Mensagem
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
          >
            Fechar sem responder
          </button>
        </div>
      </div>
    </div>
  );
}
