import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShieldAlert, Zap } from 'lucide-react';
import { SEOAdminService, SEOAdminStats, SEOGlobalSettings } from '../../../services/SEOAdminService';

export function SEOAdminTab() {
  const [stats, setStats] = useState<SEOAdminStats | null>(null);
  const [settings, setSettings] = useState<SEOGlobalSettings | null>(null);
  const [topDomains, setTopDomains] = useState<{ domain: string; count: number; trend: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, set, top] = await Promise.all([
          SEOAdminService.getStats(),
          SEOAdminService.getSettings(),
          SEOAdminService.getTopDomains()
        ]);
        setStats(s);
        setSettings(set);
        setTopDomains(top);
      } catch (e) {
        console.error('Failed to load SEO admin data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleFeature = async (key: keyof SEOGlobalSettings) => {
    if (!settings) return;
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });
    await SEOAdminService.updateSettings({ [key]: newValue });
  };

  if (loading || !stats) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Intelligence: Admin Panel</h2>
          <p className="text-sm text-gray-500">Monitoramento de custos, uso de APIs e performance do módulo.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
            <Zap size={12} fill="currentColor" />
            API SEMrush/GSC: Monitorada
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminKpiCard 
          label="Custo Estimado (Mês)" 
          value={`$${stats.totalCost}`} 
          icon={<DollarSign size={20} className="text-emerald-500" />}
          subtext="Baseado em credit usage"
        />
        <AdminKpiCard 
          label="Total de Requisições" 
          value={stats.requestsMonth.toLocaleString()} 
          icon={<BarChart3 size={20} className="text-blue-500" />}
          subtext="Últimos 30 dias"
        />
        <AdminKpiCard 
          label="Latência Média" 
          value={stats.avgLatency} 
          icon={<TrendingUp size={20} className="text-amber-500" />}
          subtext="Performance das APIs"
        />
        <AdminKpiCard 
          label="Taxa de Erro" 
          value={stats.errorRate} 
          icon={<ShieldAlert size={20} className="text-rose-500" />}
          subtext="API Failures/Timeouts"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Domains */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Domínios Mais Analisados</h3>
          <div className="space-y-4">
            {topDomains.length > 0 ? topDomains.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                  <span className="font-medium text-gray-900">{item.domain}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-600">{item.count} anal.</span>
                  <span className={`text-[10px] font-black ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-400 text-center py-8">Nenhuma análise registrada.</div>
            )}
          </div>
        </div>

        {/* Feature Gating Controls */}
        <div className="bg-gray-900 p-6 rounded-2xl text-white shadow-lg">
          <h3 className="font-bold mb-6 uppercase tracking-widest text-xs text-blue-400">Feature Gating & Limits</h3>
          <div className="space-y-6">
            <AdminToggle 
              label="Exportação PDF (Pro/Business)" 
              active={settings?.feature_pdf_export_enabled || false} 
              onToggle={() => handleToggleFeature('feature_pdf_export_enabled')}
            />
            <AdminToggle 
              label="Integração GSC/Analytics" 
              active={settings?.feature_gsc_integration_enabled || false} 
              onToggle={() => handleToggleFeature('feature_gsc_integration_enabled')}
            />
            <AdminToggle 
              label="Comparativo de Concorrentes (Free)" 
              active={settings?.feature_competitor_comparison_enabled || false} 
              onToggle={() => handleToggleFeature('feature_competitor_comparison_enabled')}
            />
            
            <div className="pt-6 border-t border-white/10">
              <p className="text-[10px] text-gray-400 uppercase font-black mb-2">Global Override</p>
              <button 
                onClick={() => handleToggleFeature('global_override_disabled')}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-all border ${
                  settings?.global_override_disabled 
                    ? 'bg-rose-500 text-white border-rose-600' 
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white'
                }`}
              >
                {settings?.global_override_disabled ? 'Módulo Desativado (Emergência)' : 'Desativar Módulo em Caso de Emergência'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminKpiCard({ label, value, icon, subtext }: { label: string, value: string, icon: React.ReactNode, subtext: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <p className="text-[10px] text-gray-500 mt-1">{subtext}</p>
    </div>
  );
}

function AdminToggle({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{label}</span>
      <button 
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-blue-600' : 'bg-gray-700'}`}
      >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}
