import { AlertCircle } from 'lucide-react';

export function EnvCheck() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('EnvCheck - VITE_SUPABASE_URL:', supabaseUrl);
  console.log('EnvCheck - VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Presente' : 'Ausente');

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-900">Configuração Necessária</h1>
          </div>
          <p className="text-gray-600 mb-4">
            As variáveis de ambiente do Supabase não estão configuradas. Por favor, configure as seguintes variáveis:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 font-mono text-sm">
            <div className="mb-2">VITE_SUPABASE_URL</div>
            <div>VITE_SUPABASE_ANON_KEY</div>
          </div>
          <p className="text-sm text-gray-500">
            Se você está executando localmente, copie o arquivo .env.example para .env e preencha as variáveis.
            Se está em produção, configure as variáveis de ambiente na sua plataforma de hospedagem.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
