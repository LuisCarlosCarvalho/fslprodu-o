import { supabase } from '../lib/supabase';
import { TrafficAnalysisReport, DataTrustLevel } from '../types';
import { TrafficSimulator } from './TrafficSimulator';
import { GSCService } from './GSCService';

/**
 * SEOApiService - Orquestrador de Dados SEO
 */
export const SEOApiService = {
  async getTrafficAnalysis(domain: string, country: string, competitors: string[]): Promise<TrafficAnalysisReport> {
    // 1. Check Cache
    const { data: cachedData } = await supabase
      .from('domain_traffic_cache')
      .select('*')
      .eq('domain', domain)
      .eq('country', country)
      .single();

    const isCacheValid = cachedData && (new Date().getTime() - new Date(cachedData.last_updated).getTime() < 7 * 24 * 60 * 60 * 1000);

    // Se o cache é válido, mas é "Estimated" e agora temos GSC conectado, ignoramos o cache para pegar dados reais
    const hasGSCNow = await GSCService.checkIntegration();
    const isCacheEstimated = cachedData?.data?.data_trust_level === 'Estimated';

    if (isCacheValid && !(hasGSCNow && isCacheEstimated)) {
      return cachedData.data as TrafficAnalysisReport;
    }

    // 2. Check GSC Integration
    const hasGSC = await GSCService.checkIntegration();
    if (hasGSC) {
      try {
        const gscData = await GSCService.getPerformanceData(domain);
        if (gscData) {
          const simulatedBase = TrafficSimulator.generateFullReport(domain, country, competitors);
          const reinforcedReport = {
            ...simulatedBase,
            ...gscData,
            data_trust_level: 'High' as DataTrustLevel
          };
          await this.updateCache(domain, country, reinforcedReport);
          await this.logApiUsage('GSC', 'metrics', 0.01, 200);
          return reinforcedReport;
        } else {
          console.warn('[SEO API] GSC Connected but fetch failed (null). Falling back to Estimated.');
        }
      } catch (e) {
        console.error('[SEO API] GSC Fetch failed:', e);
      }
    }

    // 3. Simulated Fallback
    const report = TrafficSimulator.generateFullReport(domain, country, competitors);
    await this.logApiUsage('Simulator', 'analyzeFull', 0.0, 200);
    await this.updateCache(domain, country, report);

    return report;
  },

  async updateCache(domain: string, country: string, data: any) {
    // 3. Cache results
    const { error: cacheError } = await supabase
      .from('domain_traffic_cache')
      .upsert({
        domain,
        country,
        data: data,
        data_trust_level: data.data_trust_level,
        last_updated: new Date().toISOString()
      }, { onConflict: 'domain, country' });

    if (cacheError) {
      console.warn('[SEO API Service] Erro ao atualizar cache:', cacheError.message);
    }
  },

  async getDataTrustLevel(): Promise<DataTrustLevel> {
    const hasGSC = await GSCService.checkIntegration();
    return hasGSC ? 'High' : 'Estimated';
  },

  async logApiUsage(service: string, endpoint: string, cost: number, status: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('api_usage_logs').insert({
        user_id: user?.id,
        service_name: service,
        endpoint: endpoint,
        cost_estimated: cost,
        status_code: status
      });
    } catch (e) {
      console.error('[SEO API] Log failed:', e);
    }
  }
};
