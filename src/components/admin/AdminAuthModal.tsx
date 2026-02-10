import React, { useState } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showToast } from '../ui/Toast';
import { useAuth } from '../../contexts/AuthContext';

interface AdminAuthModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  actionLabel?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ 
  onConfirm, 
  onCancel, 
  actionLabel = "confirmar alterações sensíveis" 
}) => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !user?.email) return;

    setLoading(true);
    setError('');

    try {
      // Validar senha tentando re-autenticar o admin atual
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (authError) {
        throw new Error('Senha incorreta. Acesso negado.');
      }

      onConfirm();
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-inner ring-4 ring-blue-50/50">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Confirmação de Segurança</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Você está tentando {actionLabel}. <br />
            Para sua segurança, confirme sua senha de administrador.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sua Senha Atual</label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 outline-none transition-all font-bold ${
                  error ? 'border-red-100 focus:ring-red-100/50 text-red-600' : 'border-gray-50 focus:border-blue-500/30 focus:ring-blue-500/10'
                }`}
                placeholder="••••••••"
                required
              />
              {error && <AlertCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />}
            </div>
            {error && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              Validar e Salvar
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors text-sm"
            >
              Cancelar Operação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
