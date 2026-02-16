import { supabase } from '../lib/supabase';
import { SEODomain, SEOMetrics, SEOChannelData, SEOCountryData } from '../types/seo-intelligence';
import { SEODataProvider } from './providers/DataProvider';
import { SEMrushProvider } from './providers/SEMrushProvider';

// Factory to get the active provider
const getProvider = (name: string = 'semrush'): SEODataProvider => {
  switch (name) {
    case 'semrush':
      return new SEMrushProvider();
    default:
      return new SEMrushProvider();
  }
};

export const SEOIntegrationService = {
  
  /**
   * Domains Management
   */
  async getDomains(): Promise<SEODomain[]> {
    const { data, error } = await supabase
      .from('seo_domains')
      .select('*')
      .order('is_competitor', { ascending: true }); // Main domains first (false < true)
    
    if (error) throw error;
    return data || [];
  },

  async addDomain(domain: Partial<SEODomain>): Promise<SEODomain> {
    const { data, error } = await supabase
      .from('seo_domains')
      .insert([domain])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async deleteDomain(id: string): Promise<void> {
    const { error } = await supabase.from('seo_domains').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Metrics Management
   */
  async getLatestMetrics(domainId: string): Promise<SEOMetrics | null> {
    const { data, error } = await supabase
      .from('seo_metrics')
      .select('*')
      .eq('domain_id', domainId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data;
  },

  async getMetricsHistory(domainId: string, days: number = 30): Promise<SEOMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('seo_metrics')
      .select('*')
      .eq('domain_id', domainId)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });
      
    if (error) throw error;
    return data || [];
  },

  async getChannels(metricId: string): Promise<SEOChannelData[]> {
    const { data, error } = await supabase
      .from('seo_channel_data')
      .select('*')
      .eq('metric_id', metricId);
      
    if (error) throw error;
    return data || [];
  },

  async getCountries(metricId: string): Promise<SEOCountryData[]> {
    const { data, error } = await supabase
      .from('seo_country_data')
      .select('*')
      .eq('metric_id', metricId);
      
    if (error) throw error;
    return data || [];
  },

  /**
   * Data Fetching & updates (Core Logic)
   */
  async refreshDomainData(domain: SEODomain): Promise<void> {
    const provider = getProvider('semrush'); // In future, get from settings
    
    try {
      // 1. Log start
      await this.logUpdate(domain.id, provider.name, 'running');

      // 2. Fetch Data (Real API calls would happen here)
      // For now, we simulate strictly if no key is present, but structure is ready for real data
      const metrics = await provider.getDomainMetrics(domain.domain, 'BR');
      const channels = await provider.getChannelDistribution(domain.domain, 'BR');
      const countries = await provider.getTopCountries(domain.domain);

      // 3. Save to DB
      const { data: savedMetric, error: metricError } = await supabase
        .from('seo_metrics')
        .insert([{
          domain_id: domain.id,
          date: new Date().toISOString(),
          ...metrics,
          source_provider: provider.name
        }])
        .select()
        .single();

      if (metricError) throw metricError;

      if (channels.length > 0) {
        await supabase.from('seo_channel_data').insert(
          channels.map(c => ({ ...c, metric_id: savedMetric.id }))
        );
      }

      if (countries.length > 0) {
        await supabase.from('seo_country_data').insert(
          countries.map(c => ({ ...c, metric_id: savedMetric.id }))
        );
      }

      // 4. Log Success
      await this.logUpdate(domain.id, provider.name, 'success');

    } catch (error: any) {
      console.error('Failed to refresh SEO data:', error);
      await this.logUpdate(domain.id, provider.name, 'failed', error.message);
      throw error;
    }
  },

  async logUpdate(domainId: string, provider: string, status: string, error?: string) {
    await supabase.from('seo_update_logs').insert([{
      domain_id: domainId,
      provider,
      status,
      error_message: error,
      completed_at: status !== 'running' ? new Date().toISOString() : null
    }]);
  }
};
