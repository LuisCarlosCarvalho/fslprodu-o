import { useState, useEffect } from 'react';
import { showToast } from '../components/ui/Toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Project, Service, Profile, QuoteRequest, MarketingProduct, Portfolio, ProjectStep, BlogPost, ClientLogo } from '../types';
import { getErrorMessage } from '../lib/errors';
import { getAvailablePaymentMethods, calculateFinalValue } from '../lib/payment-engine';
import { GlobalPaymentSettings, PaymentMethodsState } from '../types';
import { Users, FolderOpen, MessageSquare, ShoppingCart, Plus, Edit, Trash2, CheckSquare, Settings, Briefcase, Mail, MessageCircle, Paperclip, Send, FileText, Shield, TrendingUp, Lock, Zap, BarChart3 } from 'lucide-react';
import { maskCPF, maskCNPJ, maskCEP, maskPostalCodePT, maskPhone } from '../lib/masks';
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
import { PaymentScoreBar } from '../components/admin/PaymentScoreBar';
import { AdminAuthModal } from '../components/admin/AdminAuthModal';
import { TrafficAnalysisTab } from './admin/components/TrafficAnalysisTab';
import { SEOAdminTab } from './admin/components/SEOAdminTab';

type Tab = 'overview' | 'projects' | 'clients' | 'messages' | 'quotes' | 'infoproducts' | 'portfolio' | 'blog' | 'logos' | 'services' | 'checkout_config' | 'traffic' | 'seo_admin';

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Handle URL params for tab switching (e.g. returning from GSC Auth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const connected = params.get('connected');
    
    if (tab && [
      'overview', 'projects', 'clients', 'messages', 'quotes', 
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
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await supabase.from('marketing_products').delete().eq('id', id);
      loadData();
    }
  };

  const copyProductLink = (code: string) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    showToast('Link do produto copiado!', 'success');
  };

  const handleSavePortfolio = async () => {
    try {
      if (editingPortfolio) {
        await supabase
          .from('portfolio')
          .update(portfolioForm)
          .eq('id', editingPortfolio.id);
      } else {
        await supabase.from('portfolio').insert([portfolioForm]);
      }
      setShowPortfolioModal(false);
      setEditingPortfolio(null);
      loadData();
    } catch (error) {
      console.error('Error saving portfolio:', getErrorMessage(error));
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto do portfolio?')) {
      await supabase.from('portfolio').delete().eq('id', id);
      loadData();
    }
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    try {
      if (status === 'converted') {
        // 1. Buscar detalhes do orçamento
        const { data: quote, error: quoteError } = await supabase
          .from('quote_requests')
          .select('*')
          .eq('id', id)
          .single();

        if (quoteError || !quote) throw new Error('Orçamento não encontrado');

        // 2. Verificar se o cliente já existe
        let { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', quote.email)
          .single();

        let clientId = profile?.id;

        // 3. Se não existe, criar perfil básico
        if (!clientId) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              full_name: quote.name,
              email: quote.email,
              phone: quote.phone,
              country: quote.region === 'Portugal' ? 'Portugal' : 'Brasil',
              nationality: quote.region === 'Portugal' ? 'PT' : 'BR',
              address: 'Criado via orçamento'
            }])
            .select()
            .single();

          if (createError) throw createError;
          clientId = newProfile.id;
        }

        // 4. Mapear serviço (Map string to ID)
        const serviceMapping: Record<string, string> = {
          'Criação de Sites': 'f58e6bc9-9a32-4a3c-bae2-54420df16f9f',
          'Desenvolvimento Web': 'f58e6bc9-9a32-4a3c-bae2-54420df16f9f',
          'Criação de Logos': '97ad841f-a951-46d9-8c99-de7f596ec720',
          'Design Gráfico': '97ad841f-a951-46d9-8c99-de7f596ec720',
          'Gerenciamento de Tráfego': 'cab63349-5d99-402e-94a0-c0f63dca0843',
          'Tráfego Pago': 'cab63349-5d99-402e-94a0-c0f63dca0843',
          'SEO de Gestão': '1600dd80-b4c0-484a-9659-3edf62d75235',
          'Projeto Personalizado': '8fd5a4c2-4a08-4fc4-88b5-c31906e0456e'
        };

        const serviceId = serviceMapping[quote.service_type || ''] || '8fd5a4c2-4a08-4fc4-88b5-c31906e0456e';

        // 5. Criar Projeto
        const { error: projectError } = await supabase
          .from('projects')
          .insert([{
            client_id: clientId,
            service_id: serviceId,
            project_name: `${quote.company_name || quote.name} - ${quote.os_number || 'Projeto'}`,
            status: 'pending',
            progress_percentage: 0,
            start_date: new Date().toISOString().split('T')[0],
            notes: `Convertido de orçamento: ${quote.service_type}. Mensagem original: ${quote.message || ''}`
          }]);

        if (projectError) throw projectError;
        showToast('Orçamento convertido em Projeto com sucesso!', 'success');
      }

      const { error: updateError } = await supabase
        .from('quote_requests')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;
      loadData();
    } catch (error: any) {
      console.error('Erro na conversão:', error);
      showToast('Erro ao atualizar status: ' + (error.message || 'Erro inesperado'), 'error');
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
        await supabase
          .from('profiles')
          .update({
            ...clientForm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingClient.id);
      } else {
        const tempId = crypto.randomUUID();
        
        const { error } = await supabase.from('profiles').insert([{
          id: tempId,
          ...clientForm,
          role: 'client',
        }]);
        
        if (error) throw error;
        
        showToast('Cliente cadastrado com sucesso!', 'success');
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
    try {
      if (editingService) {
        await supabase
          .from('services')
          .update(serviceForm)
          .eq('id', editingService.id);
      } else {
        await supabase.from('services').insert([serviceForm]);
      }
      setShowServiceModal(false);
      setEditingService(null);
      loadData();
    } catch (error) {
      console.error('Error saving service:', getErrorMessage(error));
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
      await supabase.from('services').delete().eq('id', id);
      loadData();
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
                  <OverviewTab stats={stats} loading={loading} />
                )}
                {activeTab === 'projects' && (
                  <ProjectsTab
                    projects={projects}
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
                  />
                )}

                {activeTab === 'quotes' && (
                  <QuotesTab 
                    quotes={quotes}
                    onUpdateStatus={updateQuoteStatus}
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

      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Cliente</label>
                <select
                  value={projectForm.client_id}
                  onChange={(e) => setProjectForm({ ...projectForm, client_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name} ({client.email || 'S/E-mail'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Serviço</label>
                <select
                  value={projectForm.service_id}
                  onChange={(e) => setProjectForm({ ...projectForm, service_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Nome do Projeto</label>
                <input
                  type="text"
                  value={projectForm.project_name}
                  onChange={(e) => setProjectForm({ ...projectForm, project_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Status</label>
                <select
                  value={projectForm.status}
                  onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Progresso: {projectForm.progress_percentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={projectForm.progress_percentage}
                  onChange={(e) => setProjectForm({ ...projectForm, progress_percentage: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Valor Base do Projeto</label>
                    <input
                      type="number"
                      value={projectForm.total_value}
                      onChange={(e) => setProjectForm({ ...projectForm, total_value: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Ajuste de Taxas/Descontos</label>
                    <div 
                      className="flex items-center gap-3 p-2 border-2 border-blue-100 bg-blue-50/50 rounded-xl transition-all"
                    >
                      <Zap size={18} className="text-blue-600" />
                      <span className="text-[10px] font-black uppercase text-blue-700">
                        Regras de Checkout Ativas
                      </span>
                    </div>
                  </div>
                </div>

              {projectForm.card_fee_included && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600 font-medium">Valor com Acréscimo:</span>
                    <span className="text-blue-700 font-black text-lg">
                      {(() => {
                        const client = clients.find(c => c.id === projectForm.client_id);
                        const currency = client?.payment_settings?.default_currency || (client?.country === 'Portugal' ? 'EUR' : 'BRL');
                        const locale = client?.country === 'Portugal' ? 'pt-PT' : 'pt-BR';
                        
                        const finalValue = paymentConfigs 
                          ? calculateFinalValue(projectForm.payment_method || 'credit_card', projectForm.total_value || 0, paymentConfigs)
                          : (projectForm.total_value || 0) * 1.035;

                        return new Intl.NumberFormat(locale, { 
                          style: 'currency', 
                          currency 
                        }).format(finalValue);
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">Método de Pagamento</label>
                <select
                  value={projectForm.payment_method || ''}
                  onChange={(e) => setProjectForm({ ...projectForm, payment_method: e.target.value as any })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Selecione o método</option>
                  {paymentConfigs && paymentGlobalSettings ? (
                    (() => {
                      const client = clients.find(c => c.id === projectForm.client_id);
                      if (!client) return null;

                      const availableMethods = getAvailablePaymentMethods({
                        orderValue: projectForm.total_value || 0,
                        client,
                        config: paymentConfigs,
                        global: paymentGlobalSettings
                      });

                      return availableMethods.map(m => (
                        <option key={m.id} value={m.id} disabled={!m.enabled}>
                          {m.name} {!m.enabled && `🔒 (${m.reason})`} {m.discount_percentage ? `(-${m.discount_percentage}%)` : ''}
                        </option>
                      ));
                    })()
                  ) : (
                    <>
                      <option value="pix">PIX (Carregando Regras...)</option>
                      <option value="credit_card">Cartão de Crédito</option>
                    </>
                  )}
                  <option value="cash">Dinheiro / À Vista</option>
                  <option value="transfer">Transferência Bancária</option>
                </select>
                {clients.find(c => c.id === projectForm.client_id)?.payment_score !== undefined && (
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    * Opções baseadas no score do cliente ({clients.find(c => c.id === projectForm.client_id)?.payment_score}/100)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Status do Pagamento</label>
                <select
                  value={projectForm.payment_status}
                  onChange={(e) => setProjectForm({ ...projectForm, payment_status: e.target.value as any })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="pending">Pendente</option>
                  <option value="partially_paid">Parcialmente Pago</option>
                  <option value="paid">Pago / Quitado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Observações</label>
                <textarea
                  value={projectForm.notes}
                  onChange={(e) => setProjectForm({ ...projectForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveProject}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setShowProjectModal(false);
                  setEditingProject(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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

      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingPortfolio ? 'Editar Projeto' : 'Novo Projeto'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Título do Projeto</label>
                <input
                  type="text"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Nome do projeto"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Categoria</label>
                <select
                  value={portfolioForm.category}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="Design Gráfico">Design Gráfico</option>
                  <option value="Easy Colour">Easy Colour</option>
                  <option value="Loja Online">Loja Online</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Marketing Digital">Marketing Digital</option>
                  <option value="Modelos de Página">Modelos de Página</option>
                  <option value="Site à Medida">Site à Medida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">URL da Imagem</label>
                <input
                  type="text"
                  value={portfolioForm.image_url}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, image_url: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">URL do Projeto (opcional)</label>
                <input
                  type="text"
                  value={portfolioForm.project_url}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, project_url: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://projeto.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Descrição</label>
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                  placeholder="Breve descrição do projeto"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={portfolioForm.is_active}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Ativo (visível no site)</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSavePortfolio}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setShowPortfolioModal(false);
                  setEditingPortfolio(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome do Serviço</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Categoria</label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="Web Sites">Web Sites</option>
                  <option value="Criação de Logos">Criação de Logos</option>
                  <option value="Gerenciamento de Trafego">Gerenciamento de Tráfego</option>
                  <option value="SEO">SEO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Preço Base (€)</label>
                <input
                  type="number"
                  value={serviceForm.base_price}
                  onChange={(e) => setServiceForm({ ...serviceForm, base_price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Descrição</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>

              <div className="pt-6 border-t space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Preços por Região</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">JSON Config</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brasil */}
                  <div className="space-y-4 p-5 bg-green-50/50 rounded-2xl border border-green-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🇧🇷</span>
                        <h4 className="font-bold text-green-800">Brasil (BRL)</h4>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {serviceForm.pricing_config.BR.ranges.map((range: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-end animate-in fade-in slide-in-from-left-2 transition-all">
                          <div className="flex-1">
                            <label className="block text-[9px] uppercase font-black text-green-600 mb-1">Rótulo</label>
                            <input
                              type="text"
                              value={range.label}
                              placeholder="ex: Até 5 pág."
                              onChange={(e) => {
                                const newRanges = [...serviceForm.pricing_config.BR.ranges];
                                newRanges[idx].label = e.target.value;
                                setServiceForm({
                                  ...serviceForm,
                                  pricing_config: {
                                    ...serviceForm.pricing_config,
                                    BR: { ...serviceForm.pricing_config.BR, ranges: newRanges }
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 border border-green-200 rounded-xl text-xs focus:ring-2 focus:ring-green-500 outline-none"
                            />
                          </div>
                          <div className="w-28">
                            <label className="block text-[9px] uppercase font-black text-green-600 mb-1">Valor (R$)</label>
                            <input
                              type="text"
                              value={range.value}
                              placeholder="1.500,00"
                              onChange={(e) => {
                                const newRanges = [...serviceForm.pricing_config.BR.ranges];
                                newRanges[idx].value = e.target.value;
                                setServiceForm({
                                  ...serviceForm,
                                  pricing_config: {
                                    ...serviceForm.pricing_config,
                                    BR: { ...serviceForm.pricing_config.BR, ranges: newRanges }
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 border border-green-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-green-500 outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newRanges = serviceForm.pricing_config.BR.ranges.filter((_: any, i: number) => i !== idx);
                              setServiceForm({
                                ...serviceForm,
                                pricing_config: {
                                  ...serviceForm.pricing_config,
                                  BR: { ...serviceForm.pricing_config.BR, ranges: newRanges }
                                }
                              });
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newRanges = [...serviceForm.pricing_config.BR.ranges, { label: '', value: '' }];
                        setServiceForm({
                          ...serviceForm,
                          pricing_config: {
                            ...serviceForm.pricing_config,
                            BR: { ...serviceForm.pricing_config.BR, ranges: newRanges }
                          }
                        });
                      }}
                      className="w-full py-3 border-2 border-dashed border-green-200 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-green-400 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Adicionar Faixa BR
                    </button>
                  </div>

                  {/* Portugal */}
                  <div className="space-y-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🇵🇹</span>
                        <h4 className="font-bold text-blue-800">Portugal (EUR)</h4>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {serviceForm.pricing_config.PT.ranges.map((range: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-end animate-in fade-in slide-in-from-right-2 transition-all">
                          <div className="flex-1">
                            <label className="block text-[9px] uppercase font-black text-blue-600 mb-1">Rótulo</label>
                            <input
                              type="text"
                              value={range.label}
                              placeholder="ex: Até 5 pág."
                              onChange={(e) => {
                                const newRanges = [...serviceForm.pricing_config.PT.ranges];
                                newRanges[idx].label = e.target.value;
                                setServiceForm({
                                  ...serviceForm,
                                  pricing_config: {
                                    ...serviceForm.pricing_config,
                                    PT: { ...serviceForm.pricing_config.PT, ranges: newRanges }
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 border border-blue-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div className="w-28">
                            <label className="block text-[9px] uppercase font-black text-blue-600 mb-1">Valor (€)</label>
                            <input
                              type="text"
                              value={range.value}
                              placeholder="500.00"
                              onChange={(e) => {
                                const newRanges = [...serviceForm.pricing_config.PT.ranges];
                                newRanges[idx].value = e.target.value;
                                setServiceForm({
                                  ...serviceForm,
                                  pricing_config: {
                                    ...serviceForm.pricing_config,
                                    PT: { ...serviceForm.pricing_config.PT, ranges: newRanges }
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 border border-blue-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newRanges = serviceForm.pricing_config.PT.ranges.filter((_: any, i: number) => i !== idx);
                              setServiceForm({
                                ...serviceForm,
                                pricing_config: {
                                  ...serviceForm.pricing_config,
                                  PT: { ...serviceForm.pricing_config.PT, ranges: newRanges }
                                }
                              });
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newRanges = [...serviceForm.pricing_config.PT.ranges, { label: '', value: '' }];
                        setServiceForm({
                          ...serviceForm,
                          pricing_config: {
                            ...serviceForm.pricing_config,
                            PT: { ...serviceForm.pricing_config.PT, ranges: newRanges }
                          }
                        });
                      }}
                      className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Adicionar Faixa PT
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveService}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setShowServiceModal(false);
                  setEditingService(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Responder Mensagem</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                (selectedMessage as any).contact_method === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                Origem: {(selectedMessage as any).contact_method || 'WhatsApp'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Valor do Serviço / Orçamento (Opcional)</label>
                  <input
                    type="text"
                    value={replyForm.value}
                    onChange={(e) => setReplyForm({ ...replyForm, value: e.target.value })}
                    placeholder="Ex: 1.500,00"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Observações ou Dúvidas (Opcional)</label>
                  <input
                    type="text"
                    value={replyForm.observations}
                    onChange={(e) => setReplyForm({ ...replyForm, observations: e.target.value })}
                    placeholder="Ex: Prazo de 15 dias"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Texto da Resposta (Editável)</label>
                <textarea
                  value={replyForm.message}
                  onChange={(e) => {
                    setReplyForm({ ...replyForm, message: e.target.value });
                    setIsMessageEdited(true);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={8}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="relative group">
                {(selectedMessage as any).contact_method !== 'email' && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold animate-bounce whitespace-nowrap">
                    Canal Sugerido
                  </span>
                )}
                <button
                  onClick={handleReplyWhatsApp}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                    (selectedMessage as any).contact_method !== 'email'
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 scale-105'
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
              onClick={() => {
                setShowReplyModal(false);
                setSelectedMessage(null);
                setIsMessageEdited(false);
              }}
              className="w-full mt-4 py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
            >
              Fechar sem responder
            </button>
          </div>
        </div>
      )}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">
                {editingClient ? 'Editar Perfil do Cliente' : 'Novo Cadastro de Cliente'}
              </h2>
              <button onClick={() => setShowClientModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            {editingClient && (
              <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <PaymentScoreBar score={editingClient.payment_score} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country Selection First */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {editingClient ? 'País de Origem' : 'Selecione o País de Origem'}
                </label>
                <div className={`grid ${editingClient ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  {(!editingClient || clientForm.country === 'Brasil') && (
                    <button
                      type="button"
                      onClick={() => !editingClient && setClientForm({ 
                        ...clientForm, 
                        country: 'Brasil',
                        payment_settings: { 
                          ...clientForm.payment_settings, 
                          default_currency: 'BRL',
                          unlocked_methods: clientForm.payment_settings.unlocked_methods
                            .map(m => m === 'mbway' ? 'pix' : m)
                            .filter((m, i, self) => self.indexOf(m) === i)
                        }
                      })}
                      className={`flex items-center justify-center gap-3 py-4 border-2 rounded-xl transition-all ${
                        clientForm.country === 'Brasil' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      } ${editingClient ? 'cursor-default' : ''}`}
                    >
                      <span className="text-2xl">🇧🇷</span>
                      <span className="font-bold">Brasil</span>
                    </button>
                  )}
                  {(!editingClient || clientForm.country === 'Portugal') && (
                    <button
                      type="button"
                      onClick={() => !editingClient && setClientForm({ 
                        ...clientForm, 
                        country: 'Portugal',
                        payment_settings: { 
                          ...clientForm.payment_settings, 
                          default_currency: 'EUR',
                          unlocked_methods: clientForm.payment_settings.unlocked_methods
                            .map(m => m === 'pix' ? 'mbway' : m)
                            .filter((m, i, self) => self.indexOf(m) === i)
                        }
                      })}
                      className={`flex items-center justify-center gap-3 py-4 border-2 rounded-xl transition-all ${
                        clientForm.country === 'Portugal' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      } ${editingClient ? 'cursor-default' : ''}`}
                    >
                      <span className="text-2xl">🇵🇹</span>
                      <span className="font-bold">Portugal</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Nome Completo / Empresa</label>
                <input
                  type="text"
                  value={clientForm.full_name}
                  onChange={(e) => setClientForm({ ...clientForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nome do Cliente"
                />
              </div>

               <div>
                 <label className="block text-sm font-semibold mb-2">
                   {clientForm.country === 'Brasil' ? 'CPF ou CNPJ' : 'NIF'}
                 </label>
                 <input
                   type="text"
                   value={clientForm.country === 'Brasil' ? clientForm.cpf_cnpj : clientForm.nif}
                   onChange={(e) => {
                     let val = e.target.value;
                     if (clientForm.country === 'Brasil') {
                       val = val.length <= 14 ? maskCPF(val) : maskCNPJ(val);
                       setClientForm({ ...clientForm, cpf_cnpj: val });
                     } else {
                       setClientForm({ ...clientForm, nif: val.replace(/\D/g, '').slice(0, 9) });
                     }
                   }}
                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder={clientForm.country === 'Brasil' ? '000.000.000-00' : '123456789'}
                 />
               </div>

               <div>
                 <label className="block text-sm font-semibold mb-2">E-mail (Login)</label>
                 <input
                   type="email"
                   value={clientForm.email}
                   onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="email@exemplo.com"
                 />
               </div>

               <div>
                 <label className="block text-sm font-semibold mb-2">Telefone</label>
                 <input
                   type="text"
                   value={clientForm.phone}
                   onChange={(e) => {
                     const val = clientForm.country === 'Brasil' ? maskPhone(e.target.value) : e.target.value;
                     setClientForm({ ...clientForm, phone: val });
                   }}
                   className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder={clientForm.country === 'Brasil' ? '(00) 00000-0000' : '+351 000 000 000'}
                 />
               </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Endereço Completo</label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Rua, Número, Bairro..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Cidade</label>
                <input
                  type="text"
                  value={clientForm.city}
                  onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {clientForm.country === 'Brasil' ? 'Estado' : 'Distrito'}
                  </label>
                  <input
                    type="text"
                    value={clientForm.state_distrito}
                    onChange={(e) => setClientForm({ ...clientForm, state_distrito: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {clientForm.country === 'Brasil' ? 'CEP' : 'Cód. Postal'}
                  </label>
                  <input
                    type="text"
                    value={clientForm.zip_code}
                    onChange={(e) => {
                      const val = clientForm.country === 'Brasil' ? maskCEP(e.target.value) : maskPostalCodePT(e.target.value);
                      setClientForm({ ...clientForm, zip_code: val });
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={clientForm.country === 'Brasil' ? '00000-000' : '0000-000'}
                  />
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-6 pt-6 border-t border-gray-100">
                <div className="bg-gray-50/50 p-6 rounded-[24px] border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200">
                      <ShoppingCart size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Configuração de Pagamento</h4>
                      <p className="text-xs text-gray-500">
                        Moeda Atual: <span className="font-bold text-blue-600">
                          {clientForm.payment_settings.default_currency === 'BRL' ? 'Real (R$)' : 'Euro (€)'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['pix', 'mbway', 'credit_card', 'transfer', 'cash', 'boleto', 'installments'].filter(m => {
                      if (clientForm.country === 'Brasil' && m === 'mbway') return false;
                      if (clientForm.country === 'Portugal' && m === 'pix') return false;
                      return true;
                    }).map((method) => {
                      const isSelected = clientForm.payment_settings.unlocked_methods.includes(method);
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            const currentMethods = clientForm.payment_settings.unlocked_methods;
                            const newMethods = isSelected
                              ? currentMethods.filter(m => m !== method)
                              : [...currentMethods, method];
                            setClientForm({
                              ...clientForm,
                              payment_settings: { ...clientForm.payment_settings, unlocked_methods: newMethods }
                            });
                          }}
                          className={`px-3 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-600 text-white' 
                              : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          {method === 'mbway' ? 'MB WAY' : method.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => setClientForm({ 
                          ...clientForm, 
                          payment_settings: { ...clientForm.payment_settings, card_fee_enabled: !clientForm.payment_settings.card_fee_enabled } 
                        })}
                        className={`w-12 h-6 rounded-full relative transition-all ${clientForm.payment_settings.card_fee_enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${clientForm.payment_settings.card_fee_enabled ? 'left-7' : 'left-1'}`} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors uppercase tracking-widest">Repassar Taxa de Cartão</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-blue-50/50 p-6 rounded-[24px] border border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Gestão de Crédito</h4>
                      <p className="text-xs text-gray-500">Configure o score e concessões especiais</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score Atual: {clientForm.payment_score}</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={clientForm.payment_score}
                          onChange={(e) => setClientForm({ ...clientForm, payment_score: parseInt(e.target.value) })}
                          className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div className="h-10 w-px bg-gray-200 mx-2" />
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => setClientForm({ ...clientForm, manual_payment_override: !clientForm.manual_payment_override })}
                        className={`w-12 h-6 rounded-full relative transition-all ${clientForm.manual_payment_override ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${clientForm.manual_payment_override ? 'left-7' : 'left-1'}`} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Autorização Manual</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-red-50 rounded-2xl transition-colors border border-transparent hover:border-red-100 group">
                  <div 
                    onClick={() => setClientForm({ ...clientForm, force_password_reset: !clientForm.force_password_reset })}
                    className={`w-10 h-5 rounded-full relative transition-all ${clientForm.force_password_reset ? 'bg-red-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all ${clientForm.force_password_reset ? 'left-5.5' : 'left-0.5'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors">Forçar Troca de Senha</span>
                    <span className="text-[10px] text-gray-400">Obrigará o cliente a trocar a senha no próximo login</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => handleSaveClient()}
                className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                {editingClient ? 'Atualizar Cliente' : 'Finalizar Cadastro'}
              </button>
              <button
                onClick={() => setShowClientModal(false)}
                className="px-8 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
            </div>
            
            {!editingClient && (
              <p className="text-center text-xs text-gray-400 mt-4 italic">
                * Ao finalizar, o número de O.S. será gerado e o acesso do cliente será criado automaticamente.
              </p>
            )}
          </div>
        </div>
      )}
      {showStepModal && selectedProjectForSteps && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">Gestor de Etapas</h2>
                <p className="text-gray-500 text-sm">Projeto: {selectedProjectForSteps.project_name}</p>
              </div>
              <button 
                onClick={() => setShowStepModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Step Editor Form */}
              <div className="lg:col-span-1 border-r pr-8 border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Plus size={18} className="text-blue-600" />
                  {editingStep ? 'Editar Etapa' : 'Nova Etapa'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Título da Etapa</label>
                    <input
                      type="text"
                      value={stepForm.title}
                      onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                      placeholder="Ex: Briefing Inicial"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Descrição</label>
                    <textarea
                      value={stepForm.description}
                      onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                      placeholder="Detalhes sobre o que será feito..."
                    />
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <input 
                      type="checkbox" 
                      id="step_completed"
                      checked={stepForm.is_completed}
                      onChange={(e) => setStepForm({ ...stepForm, is_completed: e.target.checked })}
                      className="w-5 h-5 rounded-lg text-blue-600 border-gray-300"
                    />
                    <label htmlFor="step_completed" className="text-sm font-bold text-gray-700 cursor-pointer">Marcar como Concluída</label>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">URL do Anexo / Entregável</label>
                    <input
                      type="text"
                      value={stepForm.file_url}
                      onChange={(e) => setStepForm({ ...stepForm, file_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                      placeholder="Caminho do arquivo no storage..."
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSaveStep}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      {editingStep ? 'Atualizar' : 'Adicionar'}
                    </button>
                    {editingStep && (
                      <button
                        onClick={() => {
                          setEditingStep(null);
                          setStepForm({ title: '', description: '', is_completed: false, file_url: '', order_index: projectSteps.length + 1 });
                        }}
                        className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
                      >
                         <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Steps List */}
              <div className="lg:col-span-2 space-y-4">
                 <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs text-gray-400">Linha do Tempo</h3>
                 {projectSteps.length === 0 ? (
                   <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 font-bold text-gray-300 text-sm">
                      Nenhuma etapa cadastrada ainda.
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {projectSteps.map((step, idx) => (
                       <div key={step.id} className="group flex items-center justify-between p-5 border border-gray-100 rounded-2xl bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${step.is_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                               {idx + 1}
                             </div>
                             <div>
                               <p className={`font-bold text-sm ${step.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{step.title}</p>
                               {step.is_completed && <span className="text-[10px] text-green-600 font-black uppercase tracking-tighter">Tarefa Finalizada</span>}
                             </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button
                               onClick={() => {
                                 setEditingStep(step);
                                 setStepForm({
                                   title: step.title,
                                   description: step.description || '',
                                   is_completed: step.is_completed,
                                   file_url: step.file_url || '',
                                   order_index: step.order_index,
                                 });
                               }}
                               className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                             >
                                <Edit size={16} />
                             </button>
                             <button
                               onClick={() => handleDeleteStep(step.id)}
                               className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
               <button 
                onClick={() => setShowStepModal(false)}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all"
               >
                 Concluir Edição
               </button>
            </div>
          </div>
        </div>
      )}
      {showChatModal && selectedProjectForChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-0 max-w-2xl w-full mx-4 h-[80vh] flex flex-col shadow-2xl overflow-hidden">
             <div className="p-6 border-b flex justify-between items-center bg-gray-50">
               <div>
                  <h2 className="text-xl font-bold text-gray-900">Chat do Projeto</h2>
                  <p className="text-xs text-gray-500">Acompanhamento: {selectedProjectForChat.project_name}</p>
               </div>
               <button onClick={() => setShowChatModal(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus size={24} className="rotate-45" />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                {projectMessages.length === 0 ? (
                  <div className="text-center py-20 text-gray-300 italic">Nenhuma mensagem trocada ainda.</div>
                ) : (
                  projectMessages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                         <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">
                           {msg.sender?.full_name || 'Usuário'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                           isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                         }`}>
                           {msg.message}
                           {msg.payload?.type === 'attachment' && (
                             <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2">
                               <Paperclip size={14} />
                               <span className="text-xs italic truncate">Anexo enviado</span>
                             </div>
                           )}
                         </div>
                      </div>
                    );
                  })
                )}
             </div>
             
             <div className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                   <input
                     type="text"
                     value={newProjectMessage}
                     onChange={(e) => setNewProjectMessage(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && handleSendProjectMessage()}
                     placeholder="Escreva sua mensagem aqui..."
                     className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                   />
                   <button
                     onClick={handleSendProjectMessage}
                     disabled={sendingProjectMessage || !newProjectMessage.trim()}
                     className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                   >
                      <Send size={20} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
      {showContractModal && selectedProjectForContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-900">Gerador de Contratos</h2>
               <button onClick={() => setShowContractModal(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus size={24} className="rotate-45" />
               </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-8 italic">
               O contrato será preenchido automaticamente com os dados do cliente e do projeto. Escolha o modelo desejado:
            </p>
            
            <div className="space-y-4">
               <button
                 onClick={() => handleGenerateContract('service')}
                 className="w-full flex items-center gap-4 p-5 border-2 border-gray-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
               >
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                     <FileText size={24} />
                  </div>
                  <div>
                     <p className="font-bold text-gray-900">Contrato de Serviço</p>
                     <p className="text-xs text-gray-500">Desenvolvimento, design e prazos.</p>
                  </div>
               </button>

               <button
                 onClick={() => handleGenerateContract('maintenance')}
                 className="w-full flex items-center gap-4 p-5 border-2 border-gray-100 rounded-2xl hover:border-green-600 hover:bg-green-50 transition-all text-left group"
               >
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                     <Shield size={24} />
                  </div>
                  <div>
                     <p className="font-bold text-gray-900">Contrato de Manutenção</p>
                     <p className="text-xs text-gray-500">Suporte, tráfego e atualizações.</p>
                  </div>
               </button>
            </div>
            
            <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl">
               <p className="text-[10px] text-orange-700 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Shield size={12} /> Assinatura Digital Ativada
               </p>
               <p className="text-[10px] text-orange-600 mt-1">
                  Este contrato inclui cláusulas de validade jurídica para assinaturas via código SMS/WhatsApp.
               </p>
            </div>
          </div>
        </div>
      )}
      {showAdminAuthModal && (
        <AdminAuthModal 
          onConfirm={() => handleSaveClient(true)}
          onCancel={() => setShowAdminAuthModal(false)}
          actionLabel="salvar alterações em dados sensíveis"
        />
      )}
      
      {showBlogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest border-l-4 border-blue-600 pl-4">
                {editingBlogPost ? 'Editar Artigo' : 'Novo Artigo'}
              </h2>
              <button onClick={() => setShowBlogModal(false)} className="text-gray-400 hover:text-gray-600 transition-all">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Título do Artigo</label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^\w\s-]/g, "")
                      .trim()
                      .replace(/\s+/g, "-");
                    setBlogForm({ ...blogForm, title, slug });
                  }}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                  placeholder="Título cativante..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Slug (URL Amigável)</label>
                <input
                  type="text"
                  value={blogForm.slug}
                  onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                <select
                  value={blogForm.status}
                  onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">URL da Imagem de Capa</label>
                <input
                  type="text"
                  value={blogForm.featured_image_url}
                  onChange={(e) => setBlogForm({ ...blogForm, featured_image_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Resumo (Excerpt)</label>
                <textarea
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
                  placeholder="Um pequeno resumo para o card..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Conteúdo (HTML/Texto)</label>
                <textarea
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[300px] font-mono"
                  placeholder="Escreva o conteúdo aqui... (Aceita HTML básico)"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveBlogPost}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Salvar Artigo
              </button>
              <button onClick={() => setShowBlogModal(false)} className="px-8 py-4 bg-gray-100 text-gray-400 font-bold rounded-xl hover:bg-gray-200 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest border-l-4 border-blue-600 pl-4">
                {editingLogo ? 'Editar Logo' : 'Novo Logo'}
              </h2>
              <button onClick={() => setShowLogoModal(false)} className="text-gray-400 hover:text-gray-600 transition-all">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nome do Cliente</label>
                <input
                  type="text"
                  value={logoForm.name}
                  onChange={(e) => setLogoForm({ ...logoForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  placeholder="Ex: Coca-Cola"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">URL da Logo (Fundo Transparente)</label>
                <input
                  type="text"
                  value={logoForm.image_url}
                  onChange={(e) => setLogoForm({ ...logoForm, image_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="https://link-da-imagem.png"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Website do Cliente (Opcional)</label>
                <input
                  type="text"
                  value={logoForm.website_url}
                  onChange={(e) => setLogoForm({ ...logoForm, website_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="https://exemplo.com"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={logoForm.is_active}
                  onChange={(e) => setLogoForm({ ...logoForm, is_active: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-600 border-gray-300"
                />
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Ativo no Carrossel</span>
              </label>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveLogo}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Salvar Logo
              </button>
              <button onClick={() => setShowLogoModal(false)} className="px-8 py-4 bg-gray-100 text-gray-400 font-bold rounded-xl hover:bg-gray-200 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
