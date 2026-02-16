import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Globe, Search, ArrowUpRight, ArrowDownRight, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { SEOIntegrationService } from '../../../../services/SEOIntegrationService';
import { SEODomain, SEOMetrics } from '../../../../types/seo-intelligence';
import { showToast } from '../../../../components/ui/Toast';

export function SEOIntelligence() {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [domains, setDomains] = useState<SEODomain[]>([]);
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [history, setHistory] = useState<SEOMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDomains();
  }, []);

  useEffect(() => {
    if (selectedDomain) {
      loadMetrics(selectedDomain);
    }
  }, [selectedDomain]);

  const loadDomains = async () => {
    const data = await SEOIntegrationService.getDomains();
    setDomains(data);
    if (data.length > 0 && !selectedDomain) {
      setSelectedDomain(data[0].id);
    }
  };

  const loadMetrics = async (domainId: string) => {
    setLoading(true);
    try {
      const latest = await SEOIntegrationService.getLatestMetrics(domainId);
      const hist = await SEOIntegrationService.getMetricsHistory(domainId);
      setMetrics(latest);
      setHistory(hist.map(h => ({
        ...h,
        date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const domain = domains.find(d => d.id === selectedDomain);
      if (domain) {
        await SEOIntegrationService.refreshDomainData(domain);
        await loadMetrics(selectedDomain);
        showToast('Dados atualizados com sucesso!', 'success');
      }
    } catch (error) {
      showToast('Erro ao atualizar dados. Verifique a API Key.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  if (!selectedDomain && domains.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
        <Search className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum domínio configurado</h3>
        <p className="mt-1 text-sm text-gray-500">Vá para a aba Configurações para adicionar domínios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Inteligência</h2>
          <p className="text-sm text-gray-500">Acompanhe métricas competitivas em tempo real das principais APIs de SEO.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium"
          >
            {domains.map(d => (
              <option key={d.id} value={d.id}>
                {d.domain} {d.is_competitor ? '(Concorrente)' : '(Principal)'}
              </option>
            ))}
          </select>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !metrics ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <p className="text-gray-500">Nenhum dado encontrado para este domínio. Clique em "Atualizar Dados".</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard 
              label="Tráfego Estimado" 
              value={metrics.estimated_monthly_traffic.toLocaleString()} 
              trend={metrics.traffic_growth_percentage}
              icon={<Users size={20} className="text-blue-500" />}
            />
            <KpiCard 
              label="Ranking Global" 
              value={`#${metrics.global_rank.toLocaleString()}`} 
              inverseTrend
              trend={0} // TODO: Calculate rank change
              icon={<Globe size={20} className="text-purple-500" />}
            />
            <KpiCard 
              label="Autoridade de Domínio" 
              value={metrics.domain_authority.toString()} 
              trend={0} 
              icon={<ShieldBadge size={20} className="text-orange-500" />}
            />
            <KpiCard 
              label="Backlinks" 
              value={metrics.backlinks_count.toLocaleString()} 
              trend={0}
              icon={<TrendingUp size={20} className="text-emerald-500" />}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Traffic History */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Evolução de Tráfego</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="estimated_monthly_traffic" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTraffic)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Engajamento</h3>
              <div className="space-y-6">
                <EngagementItem label="Duração Média" value={`${Math.floor(metrics.avg_visit_duration / 60)}m ${metrics.avg_visit_duration % 60}s`} />
                <EngagementItem label="Taxa de Rejeição" value={`${metrics.bounce_rate}%`} />
                <EngagementItem label="Páginas / Visita" value={metrics.pages_per_visit.toString()} />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                 <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs">Fonte de Dados</h3>
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <Database size={14} />
                    {metrics.source_provider.toUpperCase()} API (Real Time)
                 </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, trend, icon, inverseTrend }: any) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  // If inverseTrend is true (like ranking), lower is better. 
  // But usually for display, green is "good". Assuming standard logic for now.
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      {!isNeutral && (
        <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(trend)}%</span>
          <span className="text-gray-400 font-medium ml-1">vs mês anterior</span>
        </div>
      )}
    </div>
  );
}

function EngagementItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

// Icons
import { Shield as ShieldBadge, Database } from 'lucide-react';
