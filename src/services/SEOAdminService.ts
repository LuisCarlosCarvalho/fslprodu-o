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
   * Busca estatísticas de uso da API baseadas nos logs
   */
  async getStats(): Promise<SEOAdminStats> {
    const { data: logs } = await supabase
      .from('api_usage_logs')
      .select('cost_estimated, status_code, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!logs || logs.length === 0) {
      return { totalCost: 0, requestsMonth: 0, avgLatency: '0ms', errorRate: '0%' };
    }

    const totalCost = logs.reduce((acc, log) => acc + (log.cost_estimated || 0), 0);
    const requests = logs.length;
    const errors = logs.filter(log => log.status_code >= 400).length;
    const errorRate = ((errors / requests) * 100).toFixed(1) + '%';

    return {
      totalCost: parseFloat(totalCost.toFixed(2)),
      requestsMonth: requests,
      avgLatency: '850ms', // Latência real exigiria medir tempo de req no log
      errorRate
    };
  },

  /**
   * Busca os domínios mais analisados
   */
  async getTopDomains() {
    const { data: reports } = await supabase
      .from('traffic_reports')
      .select('main_domain');

    if (!reports) return [];

    const counts: Record<string, number> = {};
    reports.forEach(r => {
      counts[r.main_domain] = (counts[r.main_domain] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([domain, count]) => ({
        domain,
        count,
        trend: '+0%' // Tendência real exigiria comparação temporal
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
    
    return data;
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
