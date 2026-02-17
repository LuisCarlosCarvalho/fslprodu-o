import { supabase } from '../lib/supabase';
import { TrafficAnalysisReport } from '../types';

/**
 * GSCService - Interface com Google Search Console API
 * Gerencia tokens OAuth e busca dados reais de performance.
 */
export const GSCService = {
  /**
   * Inicia o fluxo de autenticação via Google
   */
  async connectGoogle() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Passamos o userId para que a Edge Function saiba quem está vinculando a conta
    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-google-callback?trigger=login&userId=${user.id}`;
    window.location.href = edgeFunctionUrl;
  },

  /**
   * Verifica se o usuário atual tem uma integração ativa
   */
  async checkIntegration(): Promise<{ connected: boolean; email?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { connected: false };

    const { data, error } = await supabase
      .from('google_integrations')
      .select('email')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return { connected: false };
    return { connected: true, email: data.email };
  },

  /**
   * Remove a integração atual
   */
  async disconnectGoogle() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { error } = await supabase
      .from('google_integrations')
      .delete()
      .eq('user_id', user.id);
      
    return !error;
  },

  /**
   * Busca dados de performance reais do GSC
   */
  async getPerformanceData(domain: string): Promise<Partial<TrafficAnalysisReport> | null> {
    try {
      // Usamos datas reais em formato YYYY-MM-DD
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('[GSC Service] Initing request for domain:', domain);
      console.log('[GSC Service] Session found:', !!session);
      
      if (!session?.access_token) {
        console.error('[GSC Service] No access token found in session! Session:', session);
        return null;
      }

      console.log('[GSC Service] Sending token in body (first 10 chars):', session.access_token.substring(0, 10) + '...');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gsc-metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ 
          domain, 
          token: session.access_token, 
          startDate: thirtyDaysAgo.toISOString().split('T')[0], 
          endDate: now.toISOString().split('T')[0] 
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('[GSC Service] Edge Function Error Status:', response.status);
        console.error('[GSC Service] Error Data:', data);
        
        if (response.status === 403) {
          console.error('[GSC Service] Detalhes do Erro 403:', data.message || data.error || 'Sem mensagem detalhada');
          if (data.details) console.error('[GSC Service] Google Technical Details:', data.details);
        }
        return null;
      }

      return {
        data_trust_level: 'High',
        report_data: {
          main: {
            visits: data.clicks || 0,
            growth: data.growth || 0,
            bounce_rate: 0,
            avg_duration: 0,
            channels: {
              organic: data.clicks || 0,
              paid: 0,
              social: 0,
              direct: 0,
              referral: 0
            },
            top_countries: [],
            history: [] // Pode ser implementado no futuro se necessário
          },
          competitors: {}
        }
      };
    } catch (e) {
      console.error('[GSC Service] Global Failure:', e);
      return null;
    }
  }
};
