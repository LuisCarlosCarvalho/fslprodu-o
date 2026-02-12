import { useState, useCallback, useEffect } from 'react';
import { supabase, Project, Service, Profile, QuoteRequest, MarketingProduct, Portfolio, BlogPost, ClientLogo } from '../lib/supabase';
import { getErrorMessage } from '../lib/errors';

export type AdminData = {
  projects: (Project & { client: Profile; service: Service })[];
  clients: Profile[];
  quotes: QuoteRequest[];
  marketingProducts: MarketingProduct[];
  portfolioItems: Portfolio[];
  services: Service[];
  blogPosts: BlogPost[];
  clientLogos: ClientLogo[];
  loading: boolean;
  loadData: () => Promise<void>;
};

export function useAdminData(activeTab: string) {
  const [projects, setProjects] = useState<(Project & { client: Profile; service: Service })[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [marketingProducts, setMarketingProducts] = useState<MarketingProduct[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<Portfolio[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    clients: 0,
    quotes: 0,
    blogPosts: 0
  });

  const loadData = useCallback(async () => {
    // Environment and Session Guard
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      if (activeTab === 'projects') {
        const { data: projectsData } = await supabase
          .from('projects')
          .select(`
            *,
            client:profiles!client_id(*),
            service:services(*)
          `)
          .order('created_at', { ascending: false });
        setProjects(projectsData || []);

        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .order('name');
        setServices(servicesData || []);

        const { data: clientsData } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client')
          .order('full_name');
        setClients(clientsData || []);
      } else if (activeTab === 'clients') {
        const { data: clientsData } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client')
          .order('created_at', { ascending: false });
        setClients(clientsData || []);
      } else if (activeTab === 'quotes' || activeTab === 'messages') {
        const { data: quotesData } = await supabase
          .from('quote_requests')
          .select('*')
          .order('created_at', { ascending: false });
        setQuotes(quotesData || []);
      } else if (activeTab === 'infoproducts') {
        const { data: productsData } = await supabase
          .from('marketing_products')
          .select('*')
          .order('created_at', { ascending: false });
        setMarketingProducts(productsData || []);
      } else if (activeTab === 'portfolio') {
        const { data: portfolioData } = await supabase
          .from('portfolio')
          .select('*')
          .order('created_at', { ascending: false });
        setPortfolioItems(portfolioData || []);
      } else if (activeTab === 'services') {
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .order('name');
        setServices(servicesData || []);
      } else if (activeTab === 'blog') {
        const { data: blogData } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        setBlogPosts(blogData || []);
      } else if (activeTab === 'logos') {
        const { data: logosData } = await supabase
          .from('client_logos')
          .select('*')
          .order('order_index', { ascending: true });
        setClientLogos(logosData || []);
      } else if (activeTab === 'overview') {
        const [
          { count: projectsCount },
          { count: clientsCount },
          { count: quotesCount },
          { count: blogCount }
        ] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
          supabase.from('quote_requests').select('*', { count: 'exact', head: true }),
          supabase.from('blog_posts').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          projects: projectsCount || 0,
          clients: clientsCount || 0,
          quotes: quotesCount || 0,
          blogPosts: blogCount || 0
        });
      }
    } catch (error) {
      const errMessage = getErrorMessage(error);
      if (errMessage.includes('Invalid data') || errMessage.includes('PIN Company')) {
        // Silently ignore extension pollution
        return;
      }
      console.error('[Admin Data] Load error:', errMessage);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Safety timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => {
        if (loading) {
          console.warn('[Admin Data] Loading timed out');
          setLoading(false);
        }
      }, 10000); // 10s timeout
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
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
  };
}
