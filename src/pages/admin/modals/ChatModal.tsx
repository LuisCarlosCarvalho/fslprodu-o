import { Send, Paperclip, Plus, MessageCircle } from 'lucide-react';
import { Project } from '../../../types';

import { User } from '@supabase/supabase-js';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: Project | null;
  projectMessages: any[];
  newProjectMessage: string;
  setNewProjectMessage: (msg: string) => void;
  sendingProjectMessage: boolean;
  handleSendProjectMessage: () => Promise<void>;
  user: User | null;
}

export function ChatModal({
  isOpen,
  onClose,
  selectedProject,
  projectMessages,
  newProjectMessage,
  setNewProjectMessage,
  sendingProjectMessage,
  handleSendProjectMessage,
  user,
}: ChatModalProps) {
  if (!isOpen || !selectedProject) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <MessageCircle size={24} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-gray-900 leading-tight">Canal de Comunicação</h2>
               <p className="text-gray-500 text-xs">Projeto: {selectedProject.project_name}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          {projectMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <MessageCircle size={40} className="opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            projectMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender_id === selectedProject.client_id ? 'items-start' : 'items-end'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  msg.sender_id === selectedProject.client_id ? 'bg-white text-gray-800' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                }`}>
                  <p className="font-medium">{msg.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-2 uppercase font-black tracking-tighter">
                   {msg.sender?.full_name || 'Admin'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="relative">
          <textarea
            value={newProjectMessage}
            onChange={(e) => setNewProjectMessage(e.target.value)}
            className="w-full px-5 py-4 pr-16 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px] resize-none shadow-sm"
            placeholder="Digite sua mensagem para o cliente..."
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
               <Paperclip size={20} />
            </button>
            <button
              onClick={handleSendProjectMessage}
              disabled={sendingProjectMessage || !newProjectMessage.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
