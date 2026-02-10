import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Loader2, User, Key, MessageCircle, Mail, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';

interface ApprovalRequest {
  id: string;
  full_name: string;
  email: string;
  nationality: string;
  created_at: string;
  status: string;
}

interface PasswordResetRequest {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  token: string;
}

import { showToast } from '../components/ui/Toast';

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'passwords'>('users');
  const [userRequests, setUserRequests] = useState<ApprovalRequest[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAllData();

    // Inscrição Realtime
    const usersChannel = supabase
      .channel('user_approvals_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_approvals' }, () => {
        loadAllData(true);
        showToast('Novo usuário aguardando aprovação!', 'info');
      })
      .subscribe();

    const passwordsChannel = supabase
      .channel('password_reset_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'password_reset_tokens' }, () => {
        loadAllData(true);
        showToast('Nova solicitação de recuperação de senha!', 'info');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(passwordsChannel);
    };
  }, []);

  const loadAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [users, passwords] = await Promise.all([
        supabase.from('user_approvals').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('password_reset_tokens').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      ]);

      setUserRequests(users.data || []);
      setPasswordRequests(passwords.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleUserDecision = async (id: string, decision: 'approve' | 'reject') => {
    if (!confirm(decision === 'approve' ? 'Aprovar este usuário?' : 'Recusar este usuário?')) return;
    setActionLoading(id);
    try {
      const { data: req } = await supabase.from('user_approvals').select('*').eq('id', id).single();
      if (!req) throw new Error('Request not found');

      const status = decision === 'approve' ? 'approved' : 'rejected';
      await supabase.from('user_approvals').update({ status, decided_at: new Date().toISOString() }).eq('id', id);
      
      setUserRequests(prev => prev.filter(r => r.id !== id));
      showToast(decision === 'approve' ? 'Usuário aprovado com sucesso!' : 'Usuário recusado.', decision === 'approve' ? 'success' : 'info');
    } catch (error) {
      console.error('Error:', error);
      showToast('Erro ao processar a decisão.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePasswordAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (!confirm(action === 'approve' ? 'Gerar senha temporária?' : 'Rejeitar solicitação?')) return;
    setActionLoading(requestId);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ requestId, action }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      if (action === 'approve') {
        setTempPasswords(prev => ({ ...prev, [requestId]: result.tempPassword }));
        // Não removemos da lista imediatamente para que o admin possa copiar/enviar a senha
        setPasswordRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
      } else {
        setPasswordRequests(prev => prev.filter(r => r.id !== requestId));
      }

    } catch (error: any) {
      showToast(`Erro: ${error.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const sendWhatsApp = (request: PasswordResetRequest) => {
    const password = tempPasswords[request.id];
    if (!password) return;
    
    const message = encodeURIComponent(`Olá! Sua solicitação de recuperação de senha na FSL Solution foi aprovada.\n\nSua senha temporária é: *${password}*\n\nRecomendamos alterá-la logo após o login.`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Acessos</h1>
          <p className="text-gray-600">Gerencie aprovações de novos usuários e solicitações de senha</p>
        </div>
        <button 
          onClick={() => loadAllData()}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Recarregar dados"
        >
          <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-4 font-semibold transition-colors relative ${
            activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <User size={20} />
            Aprovações de Cadastro
            {userRequests.length > 0 && (
              <span className="bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                {userRequests.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('passwords')}
          className={`pb-4 px-4 font-semibold transition-colors relative ${
            activeTab === 'passwords' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Key size={20} />
            Recuperação de Senha
            {passwordRequests.filter(r => r.status === 'pending').length > 0 && (activeTab !== 'passwords') && (
               <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                {passwordRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
            <p className="text-gray-500 animate-pulse">Carregando solicitações...</p>
          </div>
        ) : activeTab === 'users' ? (
          /* ABA USUÁRIOS */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Origem</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {userRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                       <Check className="h-12 w-12 text-green-200 mx-auto mb-4" />
                       <h3 className="text-lg font-medium text-gray-900">Sem cadastros pendentes</h3>
                       <p className="text-gray-500">Tudo em dia com as aprovações de novos usuários.</p>
                    </td>
                  </tr>
                ) : (
                  userRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {request.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold leading-none ${
                        request.nationality === 'BR' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {request.nationality === 'BR' ? '🇧🇷 Brasil' : '🇵🇹 Portugal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {actionLoading === request.id ? (
                          <Loader2 className="animate-spin h-5 w-5 ml-auto text-blue-600" />
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUserDecision(request.id, 'approve')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100" title="Aprovar">
                              <Check size={20} />
                            </button>
                            <button onClick={() => handleUserDecision(request.id, 'reject')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100" title="Rejeitar">
                              <X size={20} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ABA RECUPERAÇÃO DE SENHA */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Senha Operacional</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {passwordRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                       <Key className="h-12 w-12 text-blue-100 mx-auto mb-4" />
                       <h3 className="text-lg font-medium text-gray-900">Nenhum pedido de senha</h3>
                       <p className="text-gray-500">Não há solicitações de recuperação de senha pendentes.</p>
                    </td>
                  </tr>
                ) : (
                  passwordRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {request.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status === 'pending' ? 'Pendente' : 
                           request.status === 'approved' ? 'Temporária Ativa' : 'Finalizado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tempPasswords[request.id] ? (
                          <div className="flex items-center gap-2">
                             <code className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded select-all">
                                {tempPasswords[request.id]}
                             </code>
                             <button
                               onClick={() => navigator.clipboard.writeText(tempPasswords[request.id])}
                               className="p-1 text-blue-400 hover:text-blue-600"
                               title="Copiar senha"
                             >
                                <ExternalLink size={14} />
                             </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {actionLoading === request.id ? (
                          <Loader2 className="animate-spin h-5 w-5 ml-auto text-blue-600" />
                        ) : (
                          <div className="flex justify-end gap-2">
                            {request.status === 'pending' ? (
                              <>
                                <button 
                                  onClick={() => handlePasswordAction(request.id, 'approve')} 
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100" 
                                  title="Aprovar e Gerar Senha"
                                >
                                  <Key size={18} />
                                </button>
                                <button 
                                  onClick={() => handlePasswordAction(request.id, 'reject')} 
                                  className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100" 
                                  title="Rejeitar"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => sendWhatsApp(request)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100 flex items-center gap-1"
                                  title="Enviar via WhatsApp"
                                >
                                  <MessageCircle size={18} />
                                  <span className="text-xs font-bold">WhatsApp</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    const body = encodeURIComponent(`Sua nova senha é: ${tempPasswords[request.id]}`);
                                    window.location.href = `mailto:${request.email}?subject=Recuperação de Senha - FSL Solution&body=${body}`;
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                                  title="Enviar via E-mail"
                                >
                                  <Mail size={18} />
                                </button>
                                <button 
                                  onClick={() => setPasswordRequests(prev => prev.filter(r => r.id !== request.id))}
                                  className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                                  title="Remover da lista"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
