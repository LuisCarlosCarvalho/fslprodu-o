import { TrafficMetrics, CompetitiveInsight, TrafficAnalysisReport } from '../types';

/**
 * Simulador de Tráfego Inteligente
 * Este serviço simula dados que seriam obtidos de APIs como SEMrush ou SimilarWeb.
 * Utiliza algoritmos determinísticos baseados no nome do domínio para manter consistência nos testes.
 */

const SEED_CACHE: Record<string, number> = {};

function getSeed(domain: string): number {
  if (SEED_CACHE[domain]) return SEED_CACHE[domain];
  let seed = 0;
  for (let i = 0; i < domain.length; i++) {
    seed += domain.charCodeAt(i);
  }
  SEED_CACHE[domain] = seed;
  return seed;
}

function generateHistory(domain: string, visits: number, points: number = 30) {
  const seed = getSeed(domain);
  const history = [];
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const fluctuation = Math.sin((seed + i) * 0.5) * 0.15 + 1;
    history.push({
      date: date.toISOString().split('T')[0],
      visits: Math.floor(visits * fluctuation / points)
    });
  }
  return history;
}

export const TrafficSimulator = {
  analyzeDomain(domain: string, country: string): TrafficMetrics {
    const seed = getSeed(domain);
    const baseVisits = (seed % 1000) * 1500 + 5000;
    
    return {
      visits: baseVisits,
      growth: (seed % 40) - 15, // -15% a +25%
      bounce_rate: 35 + (seed % 30),
      avg_duration: 120 + (seed % 300),
      channels: {
        organic: 30 + (seed % 40),
        paid: 5 + (seed % 20),
        direct: 15 + (seed % 15),
        social: 10 + (seed % 15),
        referral: 5 + (seed % 10),
      },
      top_countries: [
        { country: country, percentage: 60 + (seed % 20) },
        { country: 'United States', percentage: 10 + (seed % 10) },
        { country: 'Others', percentage: 5 + (seed % 5) },
      ],
      history: generateHistory(domain, baseVisits)
    };
  },

  generateInsights(main: { domain: string, metrics: TrafficMetrics }, competitors: { domain: string, metrics: TrafficMetrics }[]): { intelligence: CompetitiveInsight[], recommendations: string[] } {
    const intelligence: CompetitiveInsight[] = competitors.map(comp => {
      const isOutperforming = comp.metrics.growth > main.metrics.growth;
      
      return {
        competitor_id: comp.domain,
        domain: comp.domain,
        advantage: comp.metrics.channels.organic > main.metrics.channels.organic ? 'SEO Orgânico mais forte' : 'Tráfego Direto consolidado',
        gap: isOutperforming ? 'Crescimento mensal superior ao seu' : 'Menor engajamento de sessão',
        opportunity: comp.metrics.channels.paid > 15 ? 'Explorar Google Ads para este nicho' : 'Focar em parcerias de Referência',
        alert: comp.metrics.growth > 20 ? `O concorrente ${comp.domain} teve um aumento anormal de tráfego.` : undefined
      };
    });

    const recommendations = [
      `Aumentar o investimento em ${main.metrics.channels.organic < 40 ? 'SEO Orgânico' : 'Marketing de Conteúdo'} para superar a média do mercado.`,
      `Otimizar a Bounce Rate (${main.metrics.bounce_rate}%) focando em UX e velocidade de carregamento.`,
      `Expandir presença em canais de ${main.metrics.channels.social < 15 ? 'Social Media' : 'Referral'} para diversificar fontes de tráfego.`
    ];

    return { intelligence, recommendations };
  },

  generateFullReport(domain: string, country: string, competitorsDomains: string[]): TrafficAnalysisReport {
    const mainMetrics = this.analyzeDomain(domain, country);
    const competitorsData = competitorsDomains.map(d => ({
      domain: d,
      metrics: this.analyzeDomain(d, country)
    }));

    const { intelligence, recommendations } = this.generateInsights(
      { domain, metrics: mainMetrics },
      competitorsData
    );

    // Cálculo do Opportunity Score (0-100)
    // Baseado no gap de tráfego orgânico e crescimento dos concorrentes
    const avgCompetitorVisits = competitorsData.reduce((acc, curr) => acc + curr.metrics.visits, 0) / (competitorsData.length || 1);
    const trafficGap = Math.max(0, avgCompetitorVisits - mainMetrics.visits);
    
    let opportunity_score = 50; // Base score
    if (trafficGap > 0) opportunity_score += 20;
    if (mainMetrics.growth < 10) opportunity_score += 15;
    if (mainMetrics.channels.organic < 40) opportunity_score += 15;
    
    opportunity_score = Math.min(opportunity_score, 100);

    return {
      id: Math.random().toString(36).substr(2, 9),
      user_id: '',
      main_domain: domain,
      competitors: competitorsDomains,
      country,
      time_range: '30d',
      report_data: {
        main: mainMetrics,
        competitors: Object.fromEntries(competitorsData.map(c => [c.domain, c.metrics]))
      },
      insights: {
        intelligence,
        recommendations
      },
      opportunity_score,
      data_trust_level: 'Estimated',
      is_public: false,
      created_at: new Date().toISOString()
    };
  }
};
