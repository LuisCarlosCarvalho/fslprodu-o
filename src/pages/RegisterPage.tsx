
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../components/Link';
import { UserPlus, Loader2 } from 'lucide-react';
import { getErrorMessage } from '../lib/errors';
import { fetchAddressBR, fetchAddressPT, formatPhone, formatZipCode, AddressData } from '../lib/address';
import { supabase } from '../lib/supabase';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  

  const [nationality, setNationality] = useState<'BR' | 'PT' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [addressLoading, setAddressLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: '',
  });

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleZipBlur = async () => {
    if (!nationality) return;
    const zip = formData.zipCode.replace(/\D/g, '');
    
    // Check length before firing request
    if ((nationality === 'BR' && zip.length !== 8) || (nationality === 'PT' && zip.length !== 7)) {
      return;
    }

    setAddressLoading(true);
    let address: AddressData | null = null;

    if (nationality === 'BR') {
      address = await fetchAddressBR(zip);
    } else {
      address = await fetchAddressPT(zip);
    }

    if (address) {
      if (address.error) {
        // Keep manual entry enabled but maybe show a toast/warning?
        // keeping it silent/manual fallthrough for simplicity unless critical error
      } else {
        setFormData(prev => ({
          ...prev,
          street: address?.street || prev.street,
          neighborhood: address?.neighborhood || prev.neighborhood,
          city: address?.city || prev.city,
          state: address?.state || prev.state,
          country: address?.country || prev.country
        }));
      }
    }
    setAddressLoading(false);
  };

  const handleFormatZip = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!nationality) return;
    const formatted = formatZipCode(e.target.value, nationality);
    setFormData({ ...formData, zipCode: formatted });
  };

  const handleFormatPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!nationality) return;
    const formatted = formatPhone(e.target.value, nationality);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading || cooldown > 0) return;

    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // 1. SignUp
      const fullName = `${formData.firstName} ${formData.surname}`.trim();
      const { user, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        fullName,
        formData.phone
      );

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Erro ao criar usuário');

      // 2. Update Profile with extra fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          surname: formData.surname,
          nickname: formData.nickname,
          nationality,
          zip_code: formData.zipCode,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          country: formData.country || (nationality === 'BR' ? 'Brasil' : 'Portugal')
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Continue anyway as auth succeeded
      }

      navigate('/dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration full error:', err);
      const message = getErrorMessage(err);
      
      // Handle Rate Limit specifically
      if (
        (typeof message === 'string' && message.toLowerCase().includes('rate limit')) || 
        err?.status === 429
      ) {
        setError('Limite de envio de e-mails excedido. Aguarde alguns minutos e tente novamente.');
        setCooldown(60);
      } else {
        setError(message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!nationality) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo</h1>
          <p className="text-gray-600 mb-8">Selecione sua nacionalidade para começar</p>
          
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => {
                setNationality('BR');
                setFormData(prev => ({ ...prev, country: 'Brasil' }));
              }}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <span className="text-4xl mb-3 grayscale group-hover:grayscale-0 transition-all">🇧🇷</span>
              <span className="font-bold text-gray-900 group-hover:text-blue-700">Brasil</span>
            </button>
            <button
              onClick={() => {
                setNationality('PT');
                setFormData(prev => ({ ...prev, country: 'Portugal' }));
              }}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <span className="text-4xl mb-3 grayscale group-hover:grayscale-0 transition-all">🇵🇹</span>
              <span className="font-bold text-gray-900 group-hover:text-blue-700">Portugal</span>
            </button>
          </div>

          <div className="mt-8">
             <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-2xl w-full">
        <button 
          onClick={() => setNationality(null)}
          className="mb-8 text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-2"
        >
          ← Voltar e trocar nacionalidade
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Cadastro {nationality === 'BR' ? '🇧🇷' : '🇵🇹'}
            </h1>
            <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {nationality === 'BR' ? 'Brasil' : 'Portugal'}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Primeiro nome"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sobrenome</label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Sobrenome"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apelido (Como quer ser chamado)</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Apelido"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {nationality === 'BR' ? 'Telefone / WhatsApp' : 'Telemóvel'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={handleFormatPhone}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={nationality === 'BR' ? '(99) 99999-9999' : '999 999 999'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            {/* Address Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Endereço</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {nationality === 'BR' ? 'CEP' : 'Código Postal'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={handleFormatZip}
                      onBlur={handleZipBlur}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={nationality === 'BR' ? '00000-000' : '0000-000'}
                    />
                    {addressLoading && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="animate-spin text-blue-600" size={20} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rua / Logradouro</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
                   <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label>
                   <input
                    type="text"
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro</label>
                  <input
                    type="text"
                    required={nationality === 'BR'}
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estado/Distrito</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Min. 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Senha</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Criando conta...
                </>
              ) : cooldown > 0 ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Aguarde {cooldown}s...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Finalizar Cadastro
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
