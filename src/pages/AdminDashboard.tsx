import { useState, useEffect } from 'react';
import { showToast } from '../components/ui/Toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Project, Service, Profile, QuoteRequest, MarketingProduct, Portfolio, ProjectStep, BlogPost, ClientLogo } from '../types';
import { getErrorMessage } from '../lib/errors';
import { GlobalPaymentSettings, PaymentMethodsState } from '../types';
import { Users, FolderOpen, MessageSquare, CheckSquare, Settings, Briefcase, TrendingUp, Lock, BarChart3, MessageCircle, FileText, ShoppingCart, Activity } from 'lucide-react';
import { generateContractPDF } from '../lib/contracts';
import { useAdminData } from '../hooks/useAdminData';
import { ProjectsTab } from './admin/components/ProjectsTab';
import { ClientsTab } from './admin/components/ClientsTab';
import { QuotesTab } from './admin/components/QuotesTab';
import { MarketingTab } from './admin/components/MarketingTab';
import { PortfolioTab } from './admin/components/PortfolioTab';
import { ServicesTab } from './admin/components/ServicesTab';
import { MessagesTab } from './admin/components/MessagesTab';
import { BlogTab } from './admin/components/BlogTab';
import { LogosTab } from './admin/components/LogosTab';
import { OverviewTab } from './admin/components/OverviewTab';
import { PaymentConfigTab } from './admin/components/PaymentConfigTab';
import { ProductRegistrationStepper } from './admin/components/ProductRegistrationStepper';
import { AdminAuthModal } from '../components/admin/AdminAuthModal';
import { TrafficAnalysisTab } from './admin/components/TrafficAnalysisTab';
import { SEOAdminTab } from './admin/components/SEOAdminTab';
import Dashboard from './admin/Dashboard';
import FinancialIntelligence from './admin/FinancialIntelligence';

import { ProjectModal } from './admin/modals/ProjectModal';
import { ClientModal } from './admin/modals/ClientModal';
import { StepModal } from './admin/modals/StepModal';
import { ChatModal } from './admin/modals/ChatModal';
import { ContractModal } from './admin/modals/ContractModal';
import { BlogModal } from './admin/modals/BlogModal';
import { LogoModal } from './admin/modals/LogoModal';
import { ReplyModal } from './admin/modals/ReplyModal';
import { PortfolioModal } from './admin/modals/PortfolioModal';
import { ServiceModal } from './admin/modals/ServiceModal';

type Tab = 'overview' | 'engine_control' | 'financial_intelligence' | 'projects' | 'clients' | 'messages' | 'quotes' | 'infoproducts' | 'portfolio' | 'blog' | 'logos' | 'services' | 'checkout_config' | 'traffic' | 'seo_admin';

export function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Handle URL params for tab switching (e.g. returning from GSC Auth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const connected = params.get('connected');
    
    if (tab && [
      'overview', 'engine_control', 'financial_intelligence', 'projects', 'clients', 'messages', 'quotes', 
      'infoproducts', 'portfolio', 'blog', 'logos', 'services', 
      'checkout_config', 'traffic', 'seo_admin'
    ].includes(tab)) {
      setActiveTab(tab as Tab);
    }

    if (connected === 'true') {
      showToast('GSC Conectado com sucesso!', 'success');
      // Clean URL
      window.history.replaceState({}, '', `/admin?tab=${tab || 'traffic'}`);
    }
  }, []);
  
  const {
    projects,
    clients,
    quotes,
    marketingProducts,
    portfolioItems,
    services,
    blogPosts,
    clientLogos,
    stats,
    loading,
    loadData
  } = useAdminData(activeTab);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInfoproductModal, setShowInfoproductModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [clientForm, setClientForm] = useState<{
    full_name: string;
    email: string;
    phone: string;
    country: 'Brasil' | 'Portugal';
    cpf_cnpj: string;
    nif: string;
    address: string;
    city: string;
    state: string;
    state_distrito: string;
    zip_code: string;
    payment_score: number;
    manual_payment_override: boolean;
    force_password_reset: boolean;
    payment_settings: {
      unlocked_methods: string[];
      card_fee_enabled: boolean;
      custom_card_fee: number | null;
      default_currency: 'BRL' | 'EUR';
    };
  }>({
    full_name: '',
    email: '',
    phone: '',
    country: 'Brasil',
    cpf_cnpj: '',
    nif: '',
    address: '',
    city: '',
    state: '',
    state_distrito: '',
    zip_code: '',
    payment_score: 100,
    manual_payment_override: false,
    force_password_reset: false,
    payment_settings: {
      unlocked_methods: ['pix', 'transfer', 'cash', 'credit_card'],
      card_fee_enabled: true,
      custom_card_fee: null,
      default_currency: 'BRL'
    }
  });
  const [editingClient, setEditingClient] = useState<Profile | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<QuoteRequest | null>(null);
  const [replyForm, setReplyForm] = useState({
    message: '',
    value: '',
    observations: '',
  });

  // Payment Settings Global State (for rules engine)
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentMethodsState | null>(null);
  const [paymentGlobalSettings, setPaymentGlobalSettings] = useState<GlobalPaymentSettings | null>(null);

  useEffect(() => {
    const loadPaymentSettings = async () => {
      const { data } = await supabase
        .from('configuracoes')
        .select('*')
        .in('chave', ['payment_methods', 'payment_global_settings']);
      
      if (data) {
        const methods = data.find(c => c.chave === 'payment_methods')?.valor;
        const global = data.find(c => c.chave === 'payment_global_settings')?.valor;
        if (methods) setPaymentConfigs(methods);
        if (global) setPaymentGlobalSettings(global);
      }
    };
    loadPaymentSettings();
  }, [activeTab]); // Recarrega se mudar de aba (ex: voltou da aba de config)
  const [isMessageEdited, setIsMessageEdited] = useState(false);
  const [isClientLocked, setIsClientLocked] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingMarketingProduct, setEditingMarketingProduct] = useState<MarketingProduct | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    status: 'draft' as 'draft' | 'published'
  });

  const [showLogoModal, setShowLogoModal] = useState(false);
  const [editingLogo, setEditingLogo] = useState<ClientLogo | null>(null);
  const [logoForm, setLogoForm] = useState({
    name: '',
    image_url: '',
    website_url: '',
    is_active: true,
    order_index: 0
  });

  const [projectForm, setProjectForm] = useState<{
    client_id: string;
    service_id: string;
    project_name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    progress_percentage: number;
    notes: string;
    total_value: number;
    payment_status: 'pending' | 'partially_paid' | 'paid' | 'cancelled';
    payment_method: Project['payment_method'];
    card_fee_included: boolean;
  }>({
    client_id: '',
    service_id: '',
    project_name: '',
    status: 'pending',
    progress_percentage: 0,
    notes: '',
    total_value: 0,
    payment_status: 'pending',
    payment_method: null,
    card_fee_included: false,
  });

  const [showStepModal, setShowStepModal] = useState(false);
  const [selectedProjectForSteps, setSelectedProjectForSteps] = useState<Project | null>(null);
  const [projectSteps, setProjectSteps] = useState<ProjectStep[]>([]);
  const [stepForm, setStepForm] = useState({
    title: '',
    description: '',
    is_completed: false,
    file_url: '',
    order_index: 0,
  });
  const [editingStep, setEditingStep] = useState<ProjectStep | null>(null);

  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedProjectForChat, setSelectedProjectForChat] = useState<Project | null>(null);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [projectMessages, setProjectMessages] = useState<any[]>([]);
  const [newProjectMessage, setNewProjectMessage] = useState('');
  const [sendingProjectMessage, setSendingProjectMessage] = useState(false);

  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedProjectForContract, setSelectedProjectForContract] = useState<(Project & { client: Profile; service: Service }) | null>(null);


  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    category: 'Design Gráfico',
    image_url: '',
    project_url: '',
    description: '',
    is_active: true,
  });

  const [serviceForm, setServiceForm] = useState<{
    name: string;
    description: string;
    base_price: number;
    category: string;
    pricing_config: any;
  }>({
    name: '',
    description: '',
    base_price: 0,
    category: 'Web Sites',
    pricing_config: {
      BR: { currency: 'BRL', symbol: 'R$', ranges: [] },
      PT: { currency: 'EUR', symbol: '€', ranges: [] },
    }
  });


  const handleSaveProject = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      if (editingProject) {
        await supabase
          .from('projects')
          .update({
            ...projectForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProject.id);
      } else {
        await supabase.from('projects').insert([{
          ...projectForm,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
      }
      setShowProjectModal(false);
      setEditingProject(null);
      loadData();
    } catch (error) {
      console.error('Error saving project:', getErrorMessage(error));
    }
  };

  const loadProjectSteps = async (projectId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const { data, error } = await supabase
        .from('project_steps')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      setProjectSteps(data || []);
    } catch (err) {
      console.error('[Admin] Error loading project steps:', err);
    }
  };

  const handleSaveStep = async () => {
    if (!selectedProjectForSteps) return;
    try {
      if (editingStep) {
        await supabase
          .from('project_steps')
          .update({
            ...stepForm,
            completed_at: stepForm.is_completed ? (editingStep.completed_at || new Date().toISOString()) : null,
          })
          .eq('id', editingStep.id);
      } else {
        await supabase.from('project_steps').insert([{
          ...stepForm,
          project_id: selectedProjectForSteps.id,
          completed_at: stepForm.is_completed ? new Date().toISOString() : null,
        }]);
      }
      setStepForm({ title: '', description: '', is_completed: false, file_url: '', order_index: projectSteps.length + 1 });
      setEditingStep(null);
      loadProjectSteps(selectedProjectForSteps.id);
    } catch (error) {
      console.error('Error saving step:', getErrorMessage(error));
    }
  };

  const handleDeleteStep = async (id: string) => {
    if (!confirm('Excluir esta etapa?')) return;
    await supabase.from('project_steps').delete().eq('id', id);
    if (selectedProjectForSteps) loadProjectSteps(selectedProjectForSteps.id);
  };

  const loadProjectMessages = async (projectId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(full_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setProjectMessages(data || []);
    } catch (err) {
      console.error('[Admin] Error loading messages:', err);
    }
  };

  const handleSendProjectMessage = async () => {
    if (!newProjectMessage.trim() || !selectedProjectForChat) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    setSendingProjectMessage(true);
    try {
      const { error } = await supabase.from('messages').insert({
        project_id: selectedProjectForChat.id,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        message: newProjectMessage.trim(),
      });
      if (error) throw error;
      setNewProjectMessage('');
      loadProjectMessages(selectedProjectForChat.id);
    } catch (error) {
      console.error('Error sending project message:', error);
    } finally {
      setSendingProjectMessage(false);
    }
  };

  const handleGenerateContract = async (type: 'service' | 'maintenance') => {
    if (!selectedProjectForContract) return;
    
    try {
      const { blob, fileName } = await generateContractPDF({
        project: selectedProjectForContract,
        client: selectedProjectForContract.client,
        type: type
      });

      // Upload to storage
      const storagePath = `${selectedProjectForContract.id}/contract_${Date.now()}_${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('project-attachments')
        .upload(storagePath, blob);

      if (uploadError) throw uploadError;

      // Add to messages so client sees it
      const { error: msgError } = await supabase.from('messages').insert({
        project_id: selectedProjectForContract.id,
        sender_id: user?.id,
        message: `[Contrato: ${type === 'service' ? 'Prestação de Serviço' : 'Manutenção'}]`,
        payload: { file_url: storagePath, type: 'attachment' }
      });

      if (msgError) throw msgError;

      showToast('Contrato processado e enviado com sucesso!', 'success');
      setShowContractModal(false);
    } catch (error) {
      console.error('Error generating/uploading contract:', error);
      showToast('Erro ao processar contrato.', 'error');
    }
  };


  const handleDeleteProject = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      await supabase.from('projects').delete().eq('id', id);
      loadData();
    }
  };

  const handleDeleteMarketingProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('marketing_products').delete().eq('id', id);
      if (error) throw error;
      loadData();
      showToast('Produto excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Error deleting product:', getErrorMessage(error));
      showToast('Erro ao excluir produto.', 'error');
    }
  };

  const copyProductLink = (code: string) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    showToast('Link do produto copiado!', 'success');
  };

  const handleSavePortfolio = async () => {
    if (!portfolioForm.title || !portfolioForm.image_url) {
      showToast('Título e URL da imagem são obrigatórios!', 'error');
      return;
    }

    try {
      if (editingPortfolio) {
        const { error } = await supabase
          .from('portfolio')
          .update(portfolioForm)
          .eq('id', editingPortfolio.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('portfolio').insert([portfolioForm]);
        if (error) throw error;
      }
      setShowPortfolioModal(false);
      setEditingPortfolio(null);
      loadData();
      showToast('Projeto salvo com sucesso!', 'success');
    } catch (error) {
      console.error('Error saving portfolio:', getErrorMessage(error));
      showToast('Erro ao salvar projeto do portfólio.', 'error');
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto do portfolio?')) {
      try {
        const { error } = await supabase.from('portfolio').delete().eq('id', id);
        if (error) throw error;
        loadData();
        showToast('Projeto excluído do portfólio!', 'success');
      } catch (error) {
        console.error('Error deleting portfolio:', getErrorMessage(error));
        showToast('Erro ao excluir projeto do portfólio.', 'error');
      }
    }
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    try {
      // Simple status update
      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;
      showToast('Status atualizado com sucesso!', 'success');
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status: ' + (error.message || 'Erro inesperado'), 'error');
    }
  };

  const updateQuoteNotes = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ internal_notes: notes })
        .eq('id', id);

      if (error) throw error;
      showToast('Anotações salvas com sucesso!', 'success');
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar notas:', error);
      showToast('Erro ao salvar anotações.', 'error');
    }
  };

  const validateClientForm = () => {
    const { full_name, email, country, cpf_cnpj, nif } = clientForm;
    if (!full_name || !email) {
      showToast('Nome e E-mail são obrigatórios!', 'error');
      return false;
    }
    if (country === 'Brasil' && !cpf_cnpj) {
      showToast('CPF/CNPJ é obrigatório para clientes do Brasil!', 'error');
      return false;
    }
    if (country === 'Portugal' && !nif) {
      showToast('NIF é obrigatório para clientes de Portugal!', 'error');
      return false;
    }
    return true;
  };

  const handleSaveClient = async (isVerified = false) => {
    if (!validateClientForm()) return;

    // Detectar alterações sensíveis se estiver editando
    if (editingClient && !isVerified) {
      const hasSensitiveChanges = 
        editingClient.email !== clientForm.email ||
        editingClient.phone !== clientForm.phone ||
        editingClient.cpf_cnpj !== clientForm.cpf_cnpj ||
        editingClient.nif !== clientForm.nif;

      if (hasSensitiveChanges) {
        setShowAdminAuthModal(true);
        return;
      }
    }

    try {
      if (editingClient) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...clientForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingClient.id);
        
        if (updateError) throw updateError;
      } else {
        await supabase.auth.getSession();
        
        const { data, error: functionError } = await supabase.functions.invoke('admin-create-client', {
          body: clientForm
        });
        
        if (functionError) {
          throw functionError;
        }
        if (data?.error) {
          throw new Error(data.error);
        }
        
        showToast('Cliente e conta de acesso criados com sucesso!', 'success');
      }
      
      setShowClientModal(false);
      setShowAdminAuthModal(false);
      setEditingClient(null);
      loadData();
      showToast('Cliente salvo com sucesso!', 'success');
      
      // Log de Auditoria se houver mudanças sensíveis e for edição
      if (editingClient && isVerified) {
        await supabase.from('audit_logs').insert([{
          admin_id: user?.id,
          client_id: editingClient.id,
          action_type: 'profile_update_sensitive',
          created_at: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error saving client:', getErrorMessage(error));
      showToast('Erro ao salvar cliente.', 'error');
    }
  };

  const handleReplyWhatsApp = async () => {
    if (!selectedMessage) return;
    
    const phone = selectedMessage.phone?.replace(/\D/g, '') || '';
    if (!phone) {
      showToast('WhatsApp não cadastrado para este cliente.', 'error');
      return;
    }

    try {
      const encodedMsg = encodeURIComponent(replyForm.message);
      const url = `https://wa.me/${phone}?text=${encodedMsg}`;
      
      window.open(url, '_blank');
      
      // Auto-log message in quote_messages
      await supabase.from('quote_messages').insert({
        quote_id: selectedMessage.id,
        sender_id: user?.id,
        sender_name: profile?.full_name || 'Admin',
        message: replyForm.message,
        channel: 'whatsapp'
      });
      
      // Update status to 'contacted'
      await updateQuoteStatus(selectedMessage.id, 'contacted');
      
      setShowReplyModal(false);
      setSelectedMessage(null);
      setIsMessageEdited(false);
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      showToast('Erro ao abrir WhatsApp. Mensagem copiada para área de transferência.', 'error');
      navigator.clipboard.writeText(replyForm.message);
    }
  };

  const handleReplyEmail = async () => {
    if (!selectedMessage) return;
    
    if (!selectedMessage.email) {
      showToast('E-mail não cadastrado para este cliente.', 'error');
      return;
    }

    try {
      const subject = encodeURIComponent('Resposta ao seu contato');
      const body = encodeURIComponent(replyForm.message);
      const url = `mailto:${selectedMessage.email}?subject=${subject}&body=${body}`;
      
      window.location.href = url;
      
      // Auto-log message in quote_messages
      await supabase.from('quote_messages').insert({
        quote_id: selectedMessage.id,
        sender_id: user?.id,
        sender_name: profile?.full_name || 'Admin',
        message: replyForm.message,
        channel: 'email'
      });
      
      // Update status to 'contacted'
      await updateQuoteStatus(selectedMessage.id, 'contacted');
      
      setShowReplyModal(false);
      setSelectedMessage(null);
      setIsMessageEdited(false);
    } catch (error) {
      console.error('Erro ao abrir E-mail:', error);
      showToast('Erro ao abrir E-mail. Mensagem copiada para área de transferência.', 'error');
      navigator.clipboard.writeText(replyForm.message);
    }
  };

  useEffect(() => {
    if (selectedMessage && !isMessageEdited) {
      const contactMethod = (selectedMessage as any).contact_method || 'whatsapp';
      const name = selectedMessage.name;
      const service = selectedMessage.service_type;
      const val = replyForm.value || '---';
      
      let msg = '';
      if (contactMethod === 'whatsapp') {
        msg = `Olá, ${name}! Obrigado pelo contato. Sobre o serviço de ${service}, o valor inicial é R$ ${val}. Fico à disposição para qualquer dúvida.`;
      } else {
        msg = `Olá, ${name},\n\nAgradecemos o seu contato. Referente ao serviço de ${service}, o valor inicial é R$ ${val}, podendo variar conforme a necessidade do projeto.\n\nFicamos à disposição para esclarecimentos.\n\nAtenciosamente,\nFSL Solution`;
      }
      
      if (replyForm.observations) {
        msg += `\n\nObs: ${replyForm.observations}`;
      }

      setReplyForm(prev => ({ ...prev, message: msg }));
    }
  }, [selectedMessage, replyForm.value, replyForm.observations, isMessageEdited]);

  const handleSaveService = async () => {
    if (!serviceForm.name || !serviceForm.description) {
      showToast('Nome e descrição são obrigatórios!', 'error');
      return;
    }

    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceForm)
          .eq('id', editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert([serviceForm]);
        if (error) throw error;
      }
      setShowServiceModal(false);
      setEditingService(null);
      loadData();
      showToast('Serviço salvo com sucesso!', 'success');
    } catch (error) {
      console.error('Error saving service:', getErrorMessage(error));
      showToast('Erro ao salvar serviço.', 'error');
    }
  };

  const handleSaveBlogPost = async () => {
    try {
      if (editingBlogPost) {
        await supabase
          .from('blog_posts')
          .update({
            ...blogForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingBlogPost.id);
      } else {
        await supabase.from('blog_posts').insert([{
          ...blogForm,
          published_at: blogForm.status === 'published' ? new Date().toISOString() : null
        }]);
      }
      setShowBlogModal(false);
      setEditingBlogPost(null);
      loadData();
      showToast('Artigo salvo com sucesso!', 'success');
    } catch (error) {
      console.error('Error saving blog post:', getErrorMessage(error));
      showToast('Erro ao salvar artigo.', 'error');
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este artigo?')) {
      try {
        await supabase.from('blog_posts').delete().eq('id', id);
        loadData();
        showToast('Artigo excluído!', 'success');
      } catch (error) {
        showToast('Erro ao excluir artigo.', 'error');
      }
    }
  };

  const handleToggleBlogStatus = async (post: BlogPost) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await supabase
        .from('blog_posts')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : post.published_at 
        })
        .eq('id', post.id);
      loadData();
      showToast(newStatus === 'published' ? 'Artigo publicado!' : 'Artigo movido para rascunhos.', 'success');
    } catch (error) {
      showToast('Erro ao atualizar status do artigo.', 'error');
    }
  };

  const handleSaveLogo = async () => {
    try {
      if (editingLogo) {
        await supabase
          .from('client_logos')
          .update(logoForm)
          .eq('id', editingLogo.id);
      } else {
        await supabase.from('client_logos').insert([logoForm]);
      }
      setShowLogoModal(false);
      setEditingLogo(null);
      loadData();
      showToast('Logo salva com sucesso!', 'success');
    } catch (error) {
      console.error('Error saving logo:', getErrorMessage(error));
      showToast('Erro ao salvar logo.', 'error');
    }
  };

  const handleDeleteLogo = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este logo?')) {
      try {
        await supabase.from('client_logos').delete().eq('id', id);
        loadData();
        showToast('Logo excluída!', 'success');
      } catch (error) {
        showToast('Erro ao excluir logo.', 'error');
      }
    }
  };

  const handleToggleLogoStatus = async (logo: ClientLogo) => {
    try {
      await supabase
        .from('client_logos')
        .update({ is_active: !logo.is_active })
        .eq('id', logo.id);
      loadData();
      showToast(logo.is_active ? 'Logo desativada.' : 'Logo ativada!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar status da logo.', 'error');
    }
  };

  const handleReorderLogo = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = clientLogos.findIndex(l => l.id === id);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= clientLogos.length) return;
    
    const currentLogo = clientLogos[currentIndex];
    const targetLogo = clientLogos[targetIndex];
    
    try {
      await supabase.from('client_logos').update({ order_index: targetLogo.order_index }).eq('id', currentLogo.id);
      await supabase.from('client_logos').update({ order_index: currentLogo.order_index }).eq('id', targetLogo.id);
      loadData();
    } catch (error) {
      showToast('Erro ao reordenar.', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
        loadData();
        showToast('Serviço excluído com sucesso!', 'success');
      } catch (error) {
        console.error('Error deleting service:', getErrorMessage(error));
        showToast('Erro ao excluir serviço.', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="bg-white border-b md:border-b-0 md:border-r border-gray-200 w-full md:w-64 flex-shrink-0 z-30">
        <div className="md:sticky md:top-16 md:h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900 flex flex-col gap-1">
              Painel Administrativo
              <span className="w-fit px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-100">
                Admin
              </span>
            </h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={20} />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('engine_control')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'engine_control'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={20} />
              Engine Control
            </button>
            <button
              onClick={() => setActiveTab('financial_intelligence')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'financial_intelligence'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Activity size={20} />
              Controladoria Analítica
            </button>

            <div className="pt-4 pb-2 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">
              Gestão
            </div>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'projects'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <FolderOpen size={20} />
              Projetos
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'clients'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Users size={20} />
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'quotes'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MessageSquare size={20} />
              Orçamentos
            </button>
             <button
              onClick={() => setActiveTab('messages')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'messages'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MessageCircle size={20} />
              Mensagens (Chat)
            </button>

            <div className="pt-4 pb-2 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">
              Conteúdo
            </div>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Briefcase size={20} />
              Portfólio
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'blog'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <FileText size={20} />
              Blog
            </button>
            <button
              onClick={() => setActiveTab('logos')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'logos'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Users size={20} />
              Logos
            </button>
            <button
              onClick={() => setActiveTab('infoproducts')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'infoproducts'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ShoppingCart size={20} />
              SEO de Gestão
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'services'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Settings size={20} />
              Serviços
            </button>

            <div className="pt-4 pb-2 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">
              Configurações
            </div>

            <button
              onClick={() => setActiveTab('checkout_config')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'checkout_config'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Lock size={20} />
              Pagamentos
            </button>
            <button
              onClick={() => setActiveTab('traffic')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'traffic'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={20} />
              Tráfego
            </button>
            <button
              onClick={() => setActiveTab('seo_admin')}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                activeTab === 'seo_admin'
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={20} />
              SEO Admin
            </button>
          </nav>

          <div className="p-4 border-t border-gray-100">
             <Link
              to="/approvals"
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl hover:bg-blue-600 transition-all text-sm font-bold shadow-lg shadow-gray-200 hover:shadow-blue-200 active:scale-95"
            >
              <CheckSquare size={18} />
              Aprovações
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[600px] p-6 lg:p-8">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab 
                    stats={stats} 
                    loading={loading}
                    onNewProject={() => {
                        setEditingProject(null);
                        setProjectForm({
                          client_id: '',
                          service_id: '',
                          project_name: '',
                          status: 'pending',
                          progress_percentage: 0,
                          notes: '',
                          total_value: 0,
                          payment_status: 'pending',
                          payment_method: null,
                          card_fee_included: false,
                        });
                        setIsClientLocked(false);
                        setShowProjectModal(true);
                    }}
                    onNewClient={() => {
                        setEditingClient(null);
                        setClientForm({
                          full_name: '',
                          email: '',
                          phone: '',
                          country: 'Brasil',
                          cpf_cnpj: '',
                          nif: '',
                          address: '',
                          city: '',
                          state: '',
                          state_distrito: '',
                          zip_code: '',
                          payment_score: 100,
                          manual_payment_override: false,
                          force_password_reset: false,
                          payment_settings: {
                            unlocked_methods: ['pix', 'transfer', 'cash', 'credit_card'],
                            card_fee_enabled: true,
                            custom_card_fee: null,
                            default_currency: 'BRL'
                          }
                        });
                        setShowClientModal(true);
                    }}
                    onNewPost={() => {
                      setEditingBlogPost(null);
                      setBlogForm({
                        title: '',
                        slug: '',
                        excerpt: '',
                        content: '',
                        featured_image_url: '',
                        status: 'draft'
                      });
                      setShowBlogModal(true);
                    }}
                    onViewMessages={() => setActiveTab('messages')}
                  />
                )}
                {activeTab === 'engine_control' && (
                  <Dashboard />
                )}
                {activeTab === 'financial_intelligence' && (
                  <FinancialIntelligence />
                )}
                {activeTab === 'projects' && (
                  <ProjectsTab
                    projects={projects.filter(p => !projectSearch || p.client?.email?.toLowerCase().includes(projectSearch.toLowerCase()) || p.client?.full_name?.toLowerCase().includes(projectSearch.toLowerCase()) || p.project_name?.toLowerCase().includes(projectSearch.toLowerCase()))}
                    onNewProject={() => {
                        setEditingProject(null);
                        setProjectForm({
                          client_id: '',
                          service_id: '',
                          project_name: '',
                          status: 'pending',
                          progress_percentage: 0,
                          notes: '',
                          total_value: 0,
                          payment_status: 'pending',
                          payment_method: null,
                          card_fee_included: false,
                        });
                        setIsClientLocked(false);
                        setShowProjectModal(true);
                    }}
                    onEditProject={(project) => {
                        setEditingProject(project);
                        setProjectForm({
                          client_id: project.client_id,
                          service_id: project.service_id,
                          project_name: project.project_name,
                          status: project.status,
                          progress_percentage: project.progress_percentage,
                          notes: project.notes,
                          total_value: project.total_value || 0,
                          payment_status: project.payment_status as any,
                          payment_method: project.payment_method,
                          card_fee_included: project.card_fee_included || false,
                        });
                        setIsClientLocked(false);
                        setShowProjectModal(true);
                    }}
                    onManageSteps={(project) => {
                        setSelectedProjectForSteps(project);
                        loadProjectSteps(project.id);
                        setStepForm({
                          title: '',
                          description: '',
                          is_completed: false,
                          file_url: '',
                          order_index: 0,
                        });
                        setShowStepModal(true);
                    }}
                    onOpenChat={(project) => {
                        setSelectedProjectForChat(project);
                        loadProjectMessages(project.id);
                        setShowChatModal(true);
                    }}
                    onGenerateContract={(project) => {
                        setSelectedProjectForContract(project);
                        setShowContractModal(true);
                    }}
                    onDeleteProject={handleDeleteProject}
                    searchQuery={projectSearch}
                    onSearchChange={setProjectSearch}
                  />
                )}

                {activeTab === 'clients' && (
                  <ClientsTab
                    clients={clients}
                    onNewClient={() => {
                        setEditingClient(null);
                        setClientForm({
                          full_name: '',
                          email: '',
                          phone: '',
                          country: 'Brasil',
                          cpf_cnpj: '',
                          nif: '',
                          address: '',
                          city: '',
                          state: '',
                          state_distrito: '',
                          zip_code: '',
                          payment_score: 100,
                          manual_payment_override: false,
                          force_password_reset: false,
                          payment_settings: {
                            unlocked_methods: ['pix', 'transfer', 'cash', 'credit_card'],
                            card_fee_enabled: true,
                            custom_card_fee: null,
                            default_currency: 'BRL'
                          }
                        });
                        setShowClientModal(true);
                    }}
                    onEditClient={(client) => {
                        setEditingClient(client);
                        setClientForm({
                          full_name: client.full_name,
                          email: client.email || '',
                          phone: client.phone || '',
                          country: (client.country as any) || 'Brasil',
                          cpf_cnpj: client.cpf_cnpj || '',
                          nif: client.nif || '',
                          address: client.address || '',
                          city: client.city || '',
                          state: client.state || '',
                          state_distrito: client.state_distrito || '',
                          zip_code: client.zip_code || '',
                          payment_score: client.payment_score || 0,
                          manual_payment_override: client.manual_payment_override || false,
                          force_password_reset: client.force_password_reset || false,
                          payment_settings: {
                            unlocked_methods: client.payment_settings?.unlocked_methods || ['pix', 'transfer', 'cash', 'credit_card'],
                            card_fee_enabled: client.payment_settings?.card_fee_enabled ?? true,
                            custom_card_fee: client.payment_settings?.custom_card_fee ?? null,
                            default_currency: client.payment_settings?.default_currency || (client.country === 'Portugal' ? 'EUR' : 'BRL')
                          }
                        });
                        setShowClientModal(true);
                    }}
                    onViewProjects={(clientId) => {
                      const client = clients.find(c => c.id === clientId);
                      if (client) {
                        const clientProjects = projects.filter(p => p.client_id === clientId);
                        if (clientProjects.length > 0) {
                          setProjectSearch(client.email || client.full_name);
                          setActiveTab('projects');
                        } else {
                          // No projects: open modal to add one
                          setEditingProject(null);
                          setProjectForm({
                            client_id: clientId,
                            service_id: '',
                            project_name: '',
                            status: 'pending',
                            progress_percentage: 0,
                            notes: '',
                            total_value: 0,
                            payment_status: 'pending',
                            payment_method: null,
                            card_fee_included: false,
                          });
                          setIsClientLocked(true);
                          setShowProjectModal(true);
                          showToast(`O cliente ${client.full_name} ainda não possui projetos. Adicione o primeiro!`, 'info');
                        }
                      }
                    }}
                  />
                )}

                {activeTab === 'quotes' && (
                  <QuotesTab 
                    quotes={quotes}
                    onUpdateStatus={updateQuoteStatus}
                    onUpdateNotes={updateQuoteNotes}
                  />
                )}

                {activeTab === 'portfolio' && (
                  <PortfolioTab
                    items={portfolioItems}
                    onNewItem={() => {
                        setEditingPortfolio(null);
                        setPortfolioForm({
                          title: '',
                          category: 'Design Gráfico',
                          image_url: '',
                          project_url: '',
                          description: '',
                          is_active: true,
                        });
                        setShowPortfolioModal(true);
                    }}
                    onEditItem={(item) => {
                        setEditingPortfolio(item);
                        setPortfolioForm({
                          title: item.title,
                          category: item.category,
                          image_url: item.image_url,
                          project_url: item.project_url || '',
                          description: item.description,
                          is_active: item.is_active,
                        });
                        setShowPortfolioModal(true);
                    }}
                    onDeleteItem={handleDeletePortfolio}
                  />
                )}

                {activeTab === 'blog' && (
                  <BlogTab
                    posts={blogPosts}
                    onNewPost={() => {
                      setEditingBlogPost(null);
                      setBlogForm({
                        title: '',
                        slug: '',
                        excerpt: '',
                        content: '',
                        featured_image_url: '',
                        status: 'draft'
                      });
                      setShowBlogModal(true);
                    }}
                    onEditPost={(post) => {
                      setEditingBlogPost(post);
                      setBlogForm({
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt,
                        content: post.content,
                        featured_image_url: post.featured_image_url,
                        status: post.status
                      });
                      setShowBlogModal(true);
                    }}
                    onDeletePost={handleDeleteBlogPost}
                    onToggleStatus={handleToggleBlogStatus}
                  />
                )}

                {activeTab === 'logos' && (
                  <LogosTab
                    logos={clientLogos}
                    onNewLogo={() => {
                      setEditingLogo(null);
                      setLogoForm({
                        name: '',
                        image_url: '',
                        website_url: '',
                        is_active: true,
                        order_index: clientLogos.length
                      });
                      setShowLogoModal(true);
                    }}
                    onEditLogo={(logo) => {
                      setEditingLogo(logo);
                      setLogoForm({
                        name: logo.name,
                        image_url: logo.image_url,
                        website_url: logo.website_url || '',
                        is_active: logo.is_active,
                        order_index: logo.order_index
                      });
                      setShowLogoModal(true);
                    }}
                    onDeleteLogo={handleDeleteLogo}
                    onToggleStatus={handleToggleLogoStatus}
                    onReorder={handleReorderLogo}
                  />
                )}

                {activeTab === 'infoproducts' && (
                  <MarketingTab
                    products={marketingProducts}
                    onNewProduct={() => {
                        setEditingMarketingProduct(null);
                        setShowInfoproductModal(true);
                    }}
                    onEditProduct={(product) => {
                        setEditingMarketingProduct(product);
                        setShowInfoproductModal(true);
                    }}
                    onDeleteProduct={handleDeleteMarketingProduct}
                    onCopyLink={copyProductLink}
                  />
                )}

                {activeTab === 'services' && (
                  <ServicesTab
                    services={services}
                    onNewService={() => {
                        setEditingService(null);
                        setServiceForm({
                          name: '',
                          description: '',
                          base_price: 0,
                          category: 'Web Sites',
                          pricing_config: {
                            BR: { currency: 'BRL', symbol: 'R$', ranges: [] },
                            PT: { currency: 'EUR', symbol: '€', ranges: [] },
                          }
                        });
                        setShowServiceModal(true);
                    }}
                    onEditService={(service) => {
                        setEditingService(service);
                        setServiceForm({
                          name: service.name,
                          description: service.description,
                          base_price: service.base_price,
                          category: service.category,
                          pricing_config: service.pricing_config || {
                            BR: { currency: 'BRL', symbol: 'R$', ranges: [] },
                            PT: { currency: 'EUR', symbol: '€', ranges: [] },
                          }
                        });
                        setShowServiceModal(true);
                    }}
                    onDeleteService={handleDeleteService}
                  />
                )}

                {activeTab === 'messages' && (
                  <MessagesTab
                    messages={quotes}
                    onReply={(msg) => {
                        setSelectedMessage(msg);
                        setReplyForm({
                          message: '',
                          value: '',
                          observations: '',
                          });
                        setShowReplyModal(true);
                    }}
                  />
                )}
                {activeTab === 'checkout_config' && (
                  <PaymentConfigTab />
                )}
                {activeTab === 'traffic' && (
                  <TrafficAnalysisTab />
                )}
                {activeTab === 'seo_admin' && (
                  <SEOAdminTab />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        editingProject={editingProject}
        isClientLocked={isClientLocked}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        handleSaveProject={handleSaveProject}
        clients={clients}
        services={services}
        paymentConfigs={paymentConfigs}
        paymentGlobalSettings={paymentGlobalSettings}
      />

      {showInfoproductModal && (
        <ProductRegistrationStepper 
          product={editingMarketingProduct}
          onSave={async (data) => {
            try {
              if (editingMarketingProduct) {
                await supabase
                  .from('marketing_products')
                  .update({
                    ...data,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', editingMarketingProduct.id);
              } else {
                await supabase
                  .from('marketing_products')
                  .insert([data]);
              }
              setShowInfoproductModal(false);
              setEditingMarketingProduct(null);
              loadData();
              showToast('Produto salvo com sucesso!', 'success');
            } catch (error) {
              console.error('Error saving marketing product:', getErrorMessage(error));
              showToast('Erro ao salvar produto.', 'error');
            }
          }}
          onClose={() => {
            setShowInfoproductModal(false);
            setEditingMarketingProduct(null);
          }}
        />
      )}

      <PortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => {
          setShowPortfolioModal(false);
          setEditingPortfolio(null);
        }}
        editingPortfolio={editingPortfolio}
        portfolioForm={portfolioForm}
        setPortfolioForm={setPortfolioForm}
        handleSavePortfolio={handleSavePortfolio}
      />

      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(null);
        }}
        editingService={editingService}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
        handleSaveService={handleSaveService}
      />
      <ReplyModal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setSelectedMessage(null);
          setIsMessageEdited(false);
        }}
        selectedMessage={selectedMessage}
        replyForm={replyForm}
        setReplyForm={setReplyForm}
        setIsMessageEdited={setIsMessageEdited}
        handleReplyWhatsApp={handleReplyWhatsApp}
        handleReplyEmail={handleReplyEmail}
      />
      <ClientModal
        isOpen={showClientModal}
        onClose={() => {
          setShowClientModal(false);
          setEditingClient(null);
        }}
        editingClient={editingClient}
        clientForm={clientForm}
        setClientForm={setClientForm}
        handleSaveClient={handleSaveClient}
      />
      <StepModal
        isOpen={showStepModal}
        onClose={() => setShowStepModal(false)}
        selectedProject={selectedProjectForSteps}
        projectSteps={projectSteps}
        stepForm={stepForm}
        setStepForm={setStepForm}
        editingStep={editingStep}
        setEditingStep={setEditingStep}
        handleSaveStep={handleSaveStep}
        handleDeleteStep={handleDeleteStep}
      />
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        selectedProject={selectedProjectForChat}
        projectMessages={projectMessages}
        newProjectMessage={newProjectMessage}
        setNewProjectMessage={setNewProjectMessage}
        handleSendProjectMessage={handleSendProjectMessage}
        sendingProjectMessage={sendingProjectMessage}
        user={user}
      />
      <ContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        selectedProject={selectedProjectForContract}
        handleGenerateContract={handleGenerateContract}
      />
      {showAdminAuthModal && (
        <AdminAuthModal 
          onConfirm={() => handleSaveClient(true)}
          onCancel={() => setShowAdminAuthModal(false)}
          actionLabel="salvar alterações em dados sensíveis"
        />
      )}
      
      <BlogModal
        isOpen={showBlogModal}
        onClose={() => setShowBlogModal(false)}
        editingBlogPost={editingBlogPost}
        blogForm={blogForm}
        setBlogForm={setBlogForm}
        handleSaveBlogPost={handleSaveBlogPost}
      />

      <LogoModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        editingLogo={editingLogo}
        logoForm={logoForm}
        setLogoForm={setLogoForm}
        handleSaveLogo={handleSaveLogo}
      />
    </div>
  );
}
