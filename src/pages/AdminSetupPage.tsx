import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/errors';

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('brasilviptv@gmail.com');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('User created with ID:', data.user.id);
        setSuccess(true);

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erro ao criar admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Setup Admin</h1>
        <p className="text-slate-300 mb-6">Criar primeira conta de administrador</p>

        {success ? (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-200 text-center">
              Admin criado com sucesso! Redirecionando...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
              <p className="text-slate-400 text-xs mt-1">Mínimo 6 caracteres</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Criando...' : 'Criar Admin'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            Após criar, você precisará executar o SQL abaixo no Supabase para tornar este usuário admin:
          </p>
          <pre className="mt-2 bg-slate-900 text-slate-300 text-xs p-3 rounded overflow-x-auto">
{`UPDATE auth.users
SET raw_app_meta_data =
  raw_app_meta_data ||
  '{"role":"admin"}'::jsonb
WHERE email = '${email}';

UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = '${email}'
);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
