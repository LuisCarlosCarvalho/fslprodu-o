import { useState, useEffect, useCallback } from 'react';
import { showToast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Project, Service, Message, ProjectStep } from '../lib/supabase';
import { getErrorMessage } from '../lib/errors';
import { 
  FolderOpen, MessageSquare, Send, Clock, 
  Calendar, Paperclip, File, Download, Plus, 
  LayoutDashboard, CheckSquare, FileText, DollarSign, 
  ArrowLeft, CheckCircle2, Circle, History as HistoryIcon
} from 'lucide-react';

type ProjectWithService = Project & {
  service: Service;
  messages: (Message & { sender_name: string })[];
  steps: ProjectStep[];
};

export function ClientDashboard() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<ProjectWithService[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithService | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'messages' | 'files' | 'finance'>('overview');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!user?.id) return;
    
    // Auth Guard
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          service:services(*)
        `)
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false })
        .abortSignal(signal);

      if (projectsError) throw projectsError;

      const projectsFull = await Promise.all(
        (projectsData || []).map(async (project) => {
          // Fetch messages
          const { data: messagesData } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id(full_name)
            `)
            .eq('project_id', project.id)
            .order('created_at', { ascending: true });

          // Fetch steps
          const { data: stepsData } = await supabase
            .from('project_steps')
            .select('*')
            .eq('project_id', project.id)
            .order('order_index', { ascending: true });

          return {
            ...project,
            messages: (messagesData || []).map((msg) => ({
              ...msg,
              sender_name: msg.sender?.full_name || 'Usuário',
            })),
            steps: stepsData || [],
          };
        })
      );

      setProjects(projectsFull);
      
      // Auto-select if only one project exists and none is selected
      if (projectsFull.length === 1 && !selectedProject) {
        setSelectedProject(projectsFull[0]);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Error loading projects:', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user, selectedProject]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, loadProjects]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProject) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from('messages').insert({
        project_id: selectedProject.id,
        sender_id: user?.id,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
      await loadProjects();
    } catch (error) {
      console.error('Error sending message:', getErrorMessage(error));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProject) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Arquivo muito grande! O limite é 5MB.', 'error');
      return;
    }

    setUploadingFile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Sessão inválida');

      const fileName = `${selectedProject.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('project-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Add a message with the attachment info
      const { error: msgError } = await supabase.from('messages').insert({
        project_id: selectedProject.id,
        sender_id: user?.id,
        message: `[Anexo: ${file.name}]`,
        payload: { file_url: fileName, type: 'attachment' }
      });

      if (msgError) throw msgError;
      
      await loadProjects();
      showToast('Arquivo enviado com sucesso!', 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Erro ao enviar arquivo.', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Imagem muito grande! O limite é 2MB.', 'error');
      return;
    }

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      showToast('Foto de perfil atualizada!', 'success');
      window.location.reload(); // Refresh to update all instances of the profile
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast('Erro ao atualizar foto de perfil.', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-xl"></div>
          <p className="mt-4 text-gray-500 font-medium">Carregando painel de controle...</p>
        </div>
      </div>
    );
  }

  // MULTI-PROJECT LIST VIEW
  if (!selectedProject && projects.length > 0) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Meus Projetos</h1>
              <p className="text-gray-500 mt-2 text-lg">Olá {profile?.full_name}, você possui {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'} em andamento.</p>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
               <label className="relative cursor-pointer group">
                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden border-2 border-transparent group-hover:border-blue-400 transition-all">
                   {profile?.avatar_url ? (
                     <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                   ) : (
                     profile?.full_name?.charAt(0)
                   )}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Plus size={16} className="text-white" />
                   </div>
                 </div>
                 <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingFile} />
               </label>
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acesso Master</p>
                 <p className="text-sm font-bold text-gray-700">ID: {profile?.os_number || 'S/ID'}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(project.status)}`}>
                     {getStatusLabel(project.status)}
                   </div>
                   <span className="text-gray-300 font-mono text-xs uppercase tracking-tighter">
                     Início: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'A decidir'}
                   </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{project.project_name}</h3>
                <p className="text-gray-500 text-sm mb-8 font-medium">{project.service.name}</p>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase">Progresso Geral</span>
                    <span className="text-lg font-black text-gray-900">{project.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${project.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedProject(project);
                    setActiveTab('overview');
                  }}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 shadow-lg shadow-gray-200 hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Abrir Projeto
                  <ArrowLeft className="rotate-180" size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // NO PROJECTS VIEW
  if (projects.length === 0) {
    return (
      <div className="min-h-screen py-20 px-4 bg-gray-50 flex items-center justify-center text-center">
        <div className="max-w-xl w-full">
           <label className="relative cursor-pointer group inline-block mb-8">
             <div className="w-32 h-32 bg-white rounded-full shadow-xl border-4 border-white overflow-hidden flex items-center justify-center text-gray-300 transition-all group-hover:scale-105 group-hover:shadow-2xl">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                    <LayoutDashboard size={48} className="text-blue-200" />
                 </div>
               )}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <p className="text-white text-xs font-bold uppercase tracking-widest">Alterar Foto</p>
               </div>
             </div>
             <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingFile} />
             {uploadingFile && (
               <div className="absolute -bottom-2 right-0 bg-blue-600 text-white p-1.5 rounded-full animate-spin">
                 <Clock size={14} />
               </div>
             )}
           </label>

           <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Bem-vindo à FSL Solution</h2>
           
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-10">
             <p className="text-gray-600 leading-relaxed text-lg">
               Você está em sua área administrativa.<br />
               <span className="text-gray-400 font-medium">Assim que seu projeto for iniciado, ele aparecerá aqui para acompanhamento em tempo real.</span>
             </p>
           </div>

           <a 
            href="/contact" 
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-3xl font-bold hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 hover:-translate-y-1 active:scale-95"
           >
             Acompanhe seu Projeto
             <ArrowLeft className="rotate-180" size={20} />
           </a>
        </div>
      </div>
    );
  }

  // DETAILED PROJECT VIEW
  return (
    <div className="min-h-screen py-24 px-4 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSelectedProject(null)}
              className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
              style={{ display: projects.length > 1 ? 'flex' : 'none' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded tracking-tighter uppercase">
                  ID: {profile?.os_number || 'S/ID'}
                </span>
                <span className={`text-[10px] font-black px-2 py-1 rounded tracking-tighter uppercase ${getStatusColor(selectedProject!.status)}`}>
                  {getStatusLabel(selectedProject!.status)}
                </span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 leading-tight">{selectedProject!.project_name}</h1>
              <p className="text-gray-500 font-medium">{selectedProject!.service.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-2.5 rounded-[30px] border border-gray-100 shadow-sm pr-6">
             <label className="relative cursor-pointer group ml-1">
               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden border-2 border-transparent group-hover:border-blue-400 transition-all">
                 {profile?.avatar_url ? (
                   <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                 ) : (
                   profile?.full_name?.charAt(0)
                 )}
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Plus size={12} className="text-white" />
                 </div>
               </div>
               <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingFile} />
             </label>
             <div className="flex items-center gap-2">
             <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
             >
               <LayoutDashboard size={18} />
               <span className="hidden md:inline">Visão Geral</span>
             </button>
             <button 
              onClick={() => setActiveTab('progress')}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'progress' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
             >
               <CheckSquare size={18} />
               <span className="hidden md:inline">Andamento</span>
             </button>
             <button 
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'messages' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
             >
               <MessageSquare size={18} />
               <span className="hidden md:inline">Mensagens</span>
             </button>
             <button 
              onClick={() => setActiveTab('files')}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'files' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
             >
               <FileText size={18} />
               <span className="hidden md:inline">Arquivos</span>
             </button>
             <button 
              onClick={() => setActiveTab('finance')}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'finance' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
             >
               <DollarSign size={18} />
               <span className="hidden md:inline">Financeiro</span>
             </button>
           </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
             {activeTab === 'overview' && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 bg-gradient-to-br from-white to-blue-50/30">
                    <div className="max-w-3xl">
                      <h2 className="text-3xl font-black text-gray-900 mb-4">Bem-vindo à FSL Solution</h2>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        Você está em sua área administrativa. <br />
                        Aqui você pode acompanhar o andamento do seu projeto <span className="text-blue-600 font-bold">{selectedProject?.project_name}</span>, visualizar atualizações e manter contato com nossa equipe sempre que necessário.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-6 uppercase tracking-widest text-[10px] text-gray-400">Resumo Operacional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Responsável FSL</p>
                          <p className="text-lg font-bold text-gray-900">Equipe de Desenvolvimento</p>
                          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full w-fit">
                             <CheckCircle2 size={14} /> Ativo no Projeto
                          </div>
                       </div>
                       <div className="space-y-2 border-l border-gray-50 pl-12">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Última Atividade</p>
                          <p className="text-lg font-bold text-gray-900">
                            {selectedProject!.updated_at ? new Date(selectedProject!.updated_at).toLocaleDateString() : 'Não registrado'}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">Sincronizado com servidor central</p>
                       </div>
                       <div className="space-y-4 border-l border-gray-50 pl-12">
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Conclusão Total</span>
                            <span className="text-2xl font-black text-gray-900">{selectedProject!.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000"
                              style={{ width: `${selectedProject!.progress_percentage}%` }}
                            />
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                              <Calendar size={24} />
                           </div>
                           <h4 className="text-lg font-black text-gray-900">Prazos e Datas</h4>
                        </div>
                        <div className="space-y-6">
                           <div className="flex justify-between items-center py-4 border-b border-gray-50">
                              <span className="text-sm font-bold text-gray-400">Contratação</span>
                              <span className="text-sm font-black text-gray-700">{new Date(selectedProject!.created_at).toLocaleDateString()}</span>
                           </div>
                           <div className="flex justify-between items-center py-4 border-b border-gray-50">
                              <span className="text-sm font-bold text-gray-400">Início de Produção</span>
                              <span className="text-sm font-black text-gray-700">{selectedProject!.start_date ? new Date(selectedProject!.start_date).toLocaleDateString() : 'Pendente'}</span>
                           </div>
                           <div className="flex justify-between items-center py-4">
                              <span className="text-sm font-bold text-gray-400">Entrega Estimada</span>
                              <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                {selectedProject!.end_date ? new Date(selectedProject!.end_date).toLocaleDateString() : 'A definir'}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-8">
                           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                              <HistoryIcon size={24} />
                           </div>
                           <h4 className="text-lg font-black text-gray-900">Histórico Recente</h4>
                        </div>
                        <div className="space-y-4">
                           <p className="text-gray-400 text-sm italic py-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 font-medium">
                              Sua linha do tempo aparecerá aqui conforme o projeto evolui.
                           </p>
                        </div>
                        <div className="absolute top-0 right-0 p-8 text-[60px] font-black text-gray-50 select-none -z-10 opacity-40 group-hover:scale-110 transition-transform">PROJECT</div>
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'progress' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900">Lifecycle do Projeto</h3>
                        <p className="text-gray-400 font-medium mt-1">Acompanhe cada etapa da entrega em tempo real.</p>
                      </div>
                      <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-10 h-10 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black">{i}</div>
                        ))}
                      </div>
                    </div>

                    <div className="relative space-y-4">
                      {selectedProject!.steps.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-100">
                           <Clock className="mx-auto text-gray-300 mb-4" size={40} />
                           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Aguardando definição das etapas pela equipe</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                           {selectedProject!.steps.map((step, index) => (
                             <div 
                              key={step.id} 
                              className={`flex gap-6 p-8 rounded-3xl border transition-all ${step.is_completed ? 'bg-blue-50/30 border-blue-100 opacity-80' : 'bg-white border-gray-100 shadow-sm'}`}
                             >
                                <div className="flex flex-col items-center gap-2">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${step.is_completed ? 'bg-green-500 text-white' : 'bg-white text-gray-200 border border-gray-100'}`}>
                                      {step.is_completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                   </div>
                                   {index < selectedProject!.steps.length - 1 && (
                                     <div className={`w-0.5 h-full ${step.is_completed ? 'bg-green-200' : 'bg-gray-100'}`} />
                                   )}
                                </div>
                                <div className="flex-1 pt-1">
                                   <div className="flex justify-between items-start mb-2">
                                      <h4 className={`text-xl font-bold ${step.is_completed ? 'text-gray-500' : 'text-gray-900'}`}>{step.title}</h4>
                                      {step.completed_at && (
                                        <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded italic">Finalizado: {new Date(step.completed_at).toLocaleDateString()}</span>
                                      )}
                                   </div>
                                   <p className="text-gray-400 text-sm leading-relaxed mb-4">{step.description || 'Nenhuma descrição detalhada para esta etapa.'}</p>
                                   
                                   {step.file_url && (
                                     <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 w-fit group cursor-pointer hover:border-blue-200 transition-all">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                          <Download size={18} />
                                        </div>
                                        <div>
                                          <p className="text-xs font-black text-gray-700 uppercase tracking-tighter">Entregável da Etapa</p>
                                          <a 
                                            href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-attachments/${step.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-blue-500 font-bold hover:underline"
                                          >
                                            Ver Documentação Completa
                                          </a>
                                        </div>
                                     </div>
                                   )}
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                 </div>
               </div>
             )}

             {activeTab === 'messages' && (
               <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col h-[70vh] animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                           <MessageSquare size={24} />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-gray-900">Timeline de Comunicação</h3>
                           <p className="text-xs text-gray-400 font-medium">As mensagens são monitoradas pela equipe FSL</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Servidor Online</span>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                    {selectedProject!.messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                         <div className="w-20 h-20 bg-gray-100 rounded-[30px] border-2 border-dashed border-gray-200 mb-6" />
                         <p className="text-xs font-black uppercase tracking-widest">Nenhuma conversa iniciada</p>
                      </div>
                    ) : (
                      selectedProject!.messages.map((message) => {
                        const isMe = message.sender_id === user?.id;
                        return (
                          <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                                <div className={`p-6 rounded-[30px] shadow-sm ${isMe ? 'bg-gray-900 text-white rounded-tr-none' : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                   <p className="text-sm leading-relaxed font-medium">{message.message}</p>
                                   {(message as any).payload?.type === 'attachment' && (
                                     <div className="mt-4 p-4 bg-black/10 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                                        <File size={16} className="text-white/50" />
                                        <a 
                                          href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-attachments/${(message as any).payload.file_url}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs font-black text-white hover:underline truncate"
                                        >
                                          Abrir Anexo
                                        </a>
                                     </div>
                                   )}
                                </div>
                                <div className="flex items-center gap-2 px-2">
                                  {!isMe && <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{message.sender_name}</span>}
                                  <span className="text-[9px] text-gray-300 font-bold">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                             </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-8 border-t border-gray-50 bg-white">
                     <div className="flex gap-4 items-center bg-gray-50 p-2 rounded-[30px] border border-gray-100 focus-within:border-blue-200 transition-all focus-within:shadow-xl focus-within:shadow-blue-50/50">
                        <label className="p-4 text-gray-400 hover:text-blue-600 cursor-pointer transition-all active:scale-90">
                           <Paperclip size={20} />
                           <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                        </label>
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Digite aqui..."
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 placeholder-gray-300"
                        />
                        <button 
                          onClick={sendMessage}
                          disabled={sendingMessage || !newMessage.trim()}
                          className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 shadow-lg shadow-gray-200 hover:shadow-blue-200 transition-all active:scale-90 disabled:opacity-20"
                        >
                          <Send size={18} />
                        </button>
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'files' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                     <div className="flex justify-between items-center mb-10">
                        <div>
                          <h3 className="text-2xl font-black text-gray-900">Central de Documentos</h3>
                          <p className="text-gray-400 font-medium mt-1">Todos os arquivos compartilhados no projeto.</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 flex items-center gap-2">
                           <FolderOpen size={16} /> FOLDER: cloud_storage/{selectedProject!.id.slice(0, 8)}/
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Merge files from messages and steps */}
                        {[
                          ...selectedProject!.messages.filter(m => (m as any).payload?.type === 'attachment').map(m => ({ 
                            name: m.message.replace('[Anexo: ', '').replace(']', ''), 
                            url: (m as any).payload.file_url,
                            date: m.created_at,
                            source: 'Mensagem'
                          })),
                          ...selectedProject!.steps.filter(s => s.file_url).map(s => ({
                            name: `Entrega: ${s.title}`,
                            url: s.file_url!,
                            date: s.completed_at || s.created_at,
                            source: 'Andamento'
                          }))
                        ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((file, idx) => (
                           <div key={idx} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[30px] group hover:border-blue-200 hover:bg-blue-50/10 transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all shadow-inner">
                                    <FileText size={28} />
                                 </div>
                                 <div className="max-w-[150px] md:max-w-xs">
                                    <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tighter">{file.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[10px] font-bold text-gray-400 italic">{new Date(file.date).toLocaleDateString()}</span>
                                       <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                       <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">{file.source}</span>
                                    </div>
                                 </div>
                              </div>
                              <a 
                                href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-attachments/${file.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-90"
                              >
                                <Download size={20} />
                              </a>
                           </div>
                        ))}
                        {/* If no files */}
                        {selectedProject!.messages.filter(m => (m as any).payload?.type === 'attachment').length === 0 && 
                         selectedProject!.steps.filter(s => s.file_url).length === 0 && (
                          <div className="col-span-full py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100 text-center">
                             <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                             <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Nenhum documento arquivado ainda</p>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'finance' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 overflow-hidden relative">
                     <div className="flex justify-between items-start mb-12">
                        <div>
                          <h3 className="text-2xl font-black text-gray-900">Demonstrativo Financeiro</h3>
                          <p className="text-gray-400 font-medium mt-1">Informações sobre investimentos e pagamentos do projeto.</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-50 ${
                          selectedProject!.payment_status === 'paid' ? 'bg-green-600 text-white' : 
                          selectedProject!.payment_status === 'pending' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                        }`}>
                           {selectedProject!.payment_status === 'paid' ? 'QUITADO' : 
                            selectedProject!.payment_status === 'pending' ? 'AGUARDANDO' : 'EM DIA'}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-gray-900 rounded-[35px] p-8 text-white shadow-2xl shadow-gray-200 relative overflow-hidden">
                           <DollarSign className="absolute -bottom-4 -right-4 text-white/5 opacity-40" size={160} />
                           <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-2 font-mono italic">Valor Total Contratado</p>
                           <h4 className="text-5xl font-black tracking-tighter">
                             {selectedProject!.total_value ? `R$ ${selectedProject!.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ---'}
                           </h4>
                           <p className="mt-6 text-xs text-white/60 font-medium leading-relaxed">Este valor engloba todos os serviços descritos no escopo inicial do projeto.</p>
                        </div>
                        <div className="bg-blue-50 rounded-[35px] p-8 border border-blue-100 flex flex-col justify-between">
                            <div>
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status Base</p>
                               <h4 className="text-2xl font-black text-blue-900">Operação Financeira Ativa</h4>
                            </div>
                            <div className="mt-8">
                               <div className="flex justify-between text-xs font-bold text-blue-600 mb-2">
                                  <span>Comprometimento do Plano</span>
                                  <span>100%</span>
                               </div>
                               <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                                  <div className="w-full h-full bg-blue-600 rounded-full" />
                               </div>
                            </div>
                        </div>
                     </div>

                     <div className="bg-gray-50/50 p-8 rounded-[35px] border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                           <HistoryIcon size={18} className="text-gray-400" />
                           <h5 className="text-sm font-black text-gray-900 tracking-widest uppercase">Notas do Consultor</h5>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed italic pr-8">
                          "Os dados financeiros são informativos e refletem o status atual do seu contrato em nosso backoffice. Para emissão de notas fiscais ou boletos, favor solicitar através da aba Mensagens."
                        </p>
                     </div>
                  </div>
               </div>
             )}
          </div>

          {/* Sidebar / Quick Tips */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Informações Rápidas</h4>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                      <div>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">Segurança</p>
                        <p className="text-xs text-gray-400 font-medium">Todos os anexos são protegidos por criptografia ponta-a-ponta.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                      <div>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">Suporte VIP</p>
                        <p className="text-xs text-gray-400 font-medium">Respostas em até 4h durante horário comercial (Brasil).</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl shadow-blue-100">
                <Plus size={32} className="mb-6 opacity-40" />
                <h4 className="text-xl font-bold mb-2">Novo Serviço?</h4>
                <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">Precisa de algo extra para seu projeto? Solicite um novo orçamento agora mesmo.</p>
                <a 
                  href="/contact"
                  className="block w-full py-4 bg-white text-blue-600 text-center rounded-2xl font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
                >
                  Contratar Agora
                </a>
             </div>

             <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center opacity-60">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Acesso Cliente</p>
                <p className="text-base font-black text-gray-900 mt-1">FSL SOLUTION v2.0</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
