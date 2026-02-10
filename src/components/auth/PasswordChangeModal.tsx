import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface PasswordChangeModalProps {
  userId: string;
  onSuccess: () => void;
}

export function PasswordChangeModal({ userId, onSuccess }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword !== '',
  };

  const isFormValid = Object.values(validations).every(Boolean) && currentPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Atualizar senha no Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) throw authError;

      // 2. Remover flag de reset obrigatório no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ force_password_reset: false })
        .eq('id', userId);

      if (profileError) throw profileError;

      onSuccess();
    } catch (err: any) {
      console.error('Erro ao trocar senha:', err);
      setError(err.message || 'Erro ao atualizar a senha. Verifique se a senha atual está correta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold">Troca de Senha Obrigatória</h2>
          <p className="text-blue-100 mt-2">
            Por segurança, você deve definir uma nova senha pessoal antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Senha Temporária / Atual</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Informe a senha que você usou para logar"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Nova Senha</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Confirmar Nova Senha</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Digite novamente a nova senha"
            />
          </div>

          {/* Validações em Tempo Real */}
          <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-xl text-xs">
            <div className={`flex items-center gap-2 ${validations.length ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle2 size={14} className={validations.length ? 'fill-green-50' : ''} />
              Pelo menos 8 caracteres
            </div>
            <div className={`flex items-center gap-2 ${validations.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle2 size={14} className={validations.uppercase ? 'fill-green-50' : ''} />
              Pelo menos 1 letra maiúscula
            </div>
            <div className={`flex items-center gap-2 ${validations.number ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle2 size={14} className={validations.number ? 'fill-green-50' : ''} />
              Pelo menos 1 número
            </div>
            <div className={`flex items-center gap-2 ${validations.match ? 'text-green-600' : 'text-gray-500'}`}>
              <CheckCircle2 size={14} className={validations.match ? 'fill-green-50' : ''} />
              As senhas coincidem
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              isFormValid && !loading ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Atualizando...
              </>
            ) : (
              'Definir Nova Senha'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
