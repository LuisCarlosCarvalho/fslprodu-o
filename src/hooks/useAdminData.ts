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
    // Environment Check
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    try {
      // Golden Rule: Verify Session & Token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      // Check current tab
      if (activeTab === 'projects') {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            client:profiles!client_id(*),
            service:services(*)
          `)
          .order('created_at', { ascending: false })
          .abortSignal(signal);
        
        if (projectsError) throw projectsError;
        setProjects(projectsData || []);

        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .order('name')
          .abortSignal(signal);
        setServices(servicesData || []);

        const { data: clientsData } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client')
          .order('full_name')
          .abortSignal(signal);
        setClients(clientsData || []);
      } else if (activeTab === 'clients') {
        const { data: clientsData, error: clientsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client')
          .order('created_at', { ascending: false })
          .abortSignal(signal);
        
        if (clientsError) throw clientsError;
        setClients(clientsData || []);
      } else if (activeTab === 'quotes' || activeTab === 'messages') {
        const { data: quotesData, error: quotesError } = await supabase
          .from('quote_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .abortSignal(signal);
          
        if (quotesError) throw quotesError;
        setQuotes(quotesData || []);
      } else if (activeTab === 'infoproducts') {
        const { data: productsData } = await supabase
          .from('marketing_products')
          .select('*')
          .order('created_at', { ascending: false })
          .abortSignal(signal);
        setMarketingProducts(productsData || []);
      } else if (activeTab === 'portfolio') {
        const { data: portfolioData } = await supabase
          .from('portfolio')
          .select('*')
          .order('created_at', { ascending: false })
          .abortSignal(signal);
        setPortfolioItems(portfolioData || []);
      } else if (activeTab === 'services') {
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .order('name')
          .abortSignal(signal);
        setServices(servicesData || []);
      } else if (activeTab === 'blog') {
        const { data: blogData } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .abortSignal(signal);
        setBlogPosts(blogData || []);
      } else if (activeTab === 'logos') {
        const { data: logosData } = await supabase
          .from('client_logos')
          .select('*')
          .order('order_index', { ascending: true })
          .abortSignal(signal);
        setClientLogos(logosData || []);
      } else if (activeTab === 'overview') {
        // Fetch each stat independently to prevent one failure from blocking the others
        const fetchCount = async (table: string, filter?: { col: string, val: string }) => {
          try {
            let query = supabase.from(table).select('*', { count: 'exact', head: true });
            if (filter) query = query.eq(filter.col, filter.val);
            const { count, error } = await query.abortSignal(signal);
            if (error) throw error;
            return count || 0;
          } catch (err) {
            console.warn(`[Admin Data] Failed to fetch count for ${table}:`, err);
            return 0;
          }
        };

        const [projectsCount, clientsCount, quotesCount, blogCount] = await Promise.all([
          fetchCount('projects'),
          fetchCount('profiles', { col: 'role', val: 'client' }),
          fetchCount('quote_requests'),
          fetchCount('blog_posts')
        ]);

        setStats({
          projects: projectsCount,
          clients: clientsCount,
          quotes: quotesCount,
          blogPosts: blogCount
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      
      const errMessage = getErrorMessage(error);
      if (errMessage.includes('Invalid data') || errMessage.includes('PIN Company')) {
        return;
      }
      console.warn('[Admin Data] Non-critical load error:', errMessage);
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
