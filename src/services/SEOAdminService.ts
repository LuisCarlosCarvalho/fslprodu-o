import { supabase } from '../lib/supabase';

export interface SEOAdminStats {
  totalCost: number;
  requestsMonth: number;
  avgLatency: string;
  errorRate: string;
}

export interface SEOGlobalSettings {
  feature_pdf_export_enabled: boolean;
  feature_gsc_integration_enabled: boolean;
  feature_competitor_comparison_enabled: boolean;
  global_override_disabled: boolean;
}

export const SEOAdminService = {
  /**
   * Busca estatísticas de uso da API via RPC
   */
  async getStats(): Promise<SEOAdminStats> {
    const { data, error } = await supabase.rpc('get_seo_admin_stats', { days: 30 });

    if (error) {
      console.error('Failed to fetch SEO stats via RPC:', error);
      return { totalCost: 0, requestsMonth: 0, avgLatency: '-', errorRate: '-' };
    }

    return data as SEOAdminStats;
  },

  /**
   * Busca os domínios mais analisados via RPC
   */
  async getTopDomains() {
    const { data, error } = await supabase.rpc('get_top_domains', { limit_count: 4 });

    if (error) {
       console.error('Failed to fetch top domains via RPC:', error);
       return [];
    }

    return (data || []).map((d: any) => ({
      domain: d.domain,
      count: d.count,
      trend: '+0%' // Placeholder
    }));
  },

  /**
   * Gerenciamento de Configurações Globais
   */
  async getSettings(): Promise<SEOGlobalSettings | null> {
    const { data, error } = await supabase
      .from('seo_global_settings')
      .select('*')
      .single();
    
    if (error) return null;
    return data as unknown as SEOGlobalSettings;
  },

  async updateSettings(settings: Partial<SEOGlobalSettings>) {
    const { data: current } = await supabase.from('seo_global_settings').select('id').single();
    if (!current) return;

    await supabase
      .from('seo_global_settings')
      .update(settings)
      .eq('id', current.id);
  }
};
