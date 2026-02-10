import { useState, useEffect } from 'react';
import { Search, Globe, Calendar, Zap, AlertTriangle, FileDown, Plus, X, TrendingUp } from 'lucide-react';
import { TrafficAnalysisReport } from '../../../types';
import { SEOApiService } from '../../../services/SEOApiService';
import { SEOReportService } from '../../../lib/seo-reports';
import { TrafficMetricCard } from './traffic/TrafficMetricCard';
import { TrafficChart } from './traffic/TrafficChart';
import { GSCService } from '../../../services/GSCService';

export function TrafficAnalysisTab() {
  const [mainDomain, setMainDomain] = useState('');
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [timeRange, setTimeRange] = useState('30d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [report, setReport] = useState<TrafficAnalysisReport | null>(null);
  const [isConnectedGSC, setIsConnectedGSC] = useState(false);

  useEffect(() => {
    const checkGSC = async () => {
      const connected = await GSCService.checkIntegration();
      setIsConnectedGSC(connected);
    };
    checkGSC();
  }, []);

  const addCompetitor = () => {
    if (newCompetitor && competitors.length < 5 && !competitors.includes(newCompetitor)) {
      setCompetitors([...competitors, newCompetitor]);
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (domain: string) => {
    setCompetitors(competitors.filter(c => c !== domain));
  };

  const handleAnalyze = async () => {
    if (!mainDomain) return;
    
    setIsAnalyzing(true);
    // Simula delay de análise profunda
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newReport = await SEOApiService.getTrafficAnalysis(mainDomain, country, competitors);

    setReport(newReport);
    setIsAnalyzing(false);
  };

  const handleExportPDF = async () => {
    if (!report) return;
    setIsExporting(true);
    try {
      await SEOReportService.generatePremiumPDF(report);
    } catch (error) {
      console.error('Falha ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const channelData = report ? [
    { name: 'Orgânico', value: report.report_data.main.channels.organic, color: '#10b981' },
    { name: 'Pago', value: report.report_data.main.channels.paid, color: '#3b82f6' },
    { name: 'Direto', value: report.report_data.main.channels.direct, color: '#6366f1' },
    { name: 'Social', value: report.report_data.main.channels.social, color: '#f59e0b' },
    { name: 'Referência', value: report.report_data.main.channels.referral, color: '#8b5cf6' },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Input Module */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-lg text-white flex-shrink-0">
              <Zap size={20} fill="currentColor" />
            </div>
            Análise de Tráfego Profissional
          </h2>
          
          {isConnectedGSC ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-emerald-100 w-full sm:w-auto justify-center">
              <Zap size={14} fill="currentColor" />
              GSC: Conectado
            </div>
          ) : (
            <button 
              onClick={() => GSCService.connectGoogle()}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all w-full sm:w-auto justify-center"
            >
              <Globe size={14} />
              Conectar dados reais (GSC)
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Domínio Principal</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="ex: seudominio.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
                value={mainDomain}
                onChange={(e) => setMainDomain(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">País / Região</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none font-medium"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option>Brasil</option>
                <option>Portugal</option>
                <option>Global</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Período</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none font-medium"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !mainDomain}
              className="w-full h-[50px] bg-blue-600 text-white font-black py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Analisar Tráfego Premium
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
              Uso do Plano: <span className="text-blue-600 font-bold">1/10 créditos</span> disponíveis
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Competidores (Opcional - Máx 5)</label>
          <div className="flex flex-wrap gap-2">
            {competitors.map((comp: string) => (
              <span key={comp} className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-100">
                {comp}
                <button onClick={() => removeCompetitor(comp)} className="hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </span>
            ))}
            <div className="flex gap-2 max-w-sm">
              <input 
                type="text" 
                placeholder="Adicionar rival.com"
                className="px-4 py-1.5 border border-gray-100 bg-gray-50/50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
              />
              <button 
                onClick={addCompetitor}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {report && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrafficMetricCard 
              label="Visitas Totais" 
              value={report.report_data.main.visits.toLocaleString()} 
              trend={report.report_data.main.growth}
              icon={<Globe size={20} />}
            />
            <TrafficMetricCard 
              label="Bounce Rate" 
              value={report.report_data.main.bounce_rate} 
              suffix="%"
              icon={<Zap size={20} />}
            />
            <TrafficMetricCard 
              label="Duração Média" 
              value={Math.floor(report.report_data.main.avg_duration / 60)} 
              suffix=" min"
              icon={<Calendar size={20} />}
            />
            <TrafficMetricCard 
              label="Crescimento SEO" 
              value={report.report_data.main.growth} 
              suffix="%"
              trend={report.report_data.main.growth}
              icon={<TrendingUp size={20} />}
            />
          </div>

          {/* Opportunity Score & Data Trust */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Traffic Opportunity Score
                  <div className="group relative">
                    <AlertTriangle size={14} className="text-gray-300 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-medium normal-case tracking-normal">
                      Cálculo proprietário baseado em gap de mercado, facilidade de ranqueamento e autoridade de marca.
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Oportunidade para <span className="font-bold text-gray-900 truncate inline-block max-w-[150px] align-bottom">{mainDomain}</span></p>
              </div>
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className={`text-4xl sm:text-5xl font-black ${
                  report.opportunity_score >= 70 ? 'text-emerald-500' :
                  report.opportunity_score >= 40 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {report.opportunity_score}
                </div>
                <div className="h-16 w-3 sm:w-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`w-full transition-all duration-1000 ${
                      report.opportunity_score >= 70 ? 'bg-emerald-500' :
                      report.opportunity_score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ height: `${report.opportunity_score}%`, marginTop: `${100 - (report.opportunity_score || 0)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-2xl border flex items-center gap-5 transition-all ${
              report.data_trust_level === 'High' 
                ? 'bg-emerald-50 border-emerald-100' 
                : 'bg-blue-50 border-blue-100'
            }`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                report.data_trust_level === 'High' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {report.data_trust_level === 'High' ? <Zap size={28} fill="currentColor" /> : <Globe size={28} />}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                  report.data_trust_level === 'High' ? 'text-emerald-400' : 'text-blue-400'
                }`}>Data Trust Level</p>
                <div className="flex items-center gap-2">
                  <p className={`text-lg font-black ${
                    report.data_trust_level === 'High' ? 'text-emerald-900' : 'text-blue-900'
                  }`}>{report.data_trust_level}</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    report.data_trust_level === 'High' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {report.data_trust_level === 'High' ? 'Verificado' : 'Estimado'}
                  </span>
                </div>
                {!isConnectedGSC && (
                  <button 
                    onClick={() => GSCService.connectGoogle()}
                    className="text-[10px] font-bold text-blue-600 mt-1 hover:underline underline-offset-2"
                  >
                    Verificar com dados reais →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TrafficChart 
              title="Tendência de Tráfego (Últimos 30 dias)" 
              type="line" 
              data={report.report_data.main.history}
            />
            <TrafficChart 
              title="Canais de Aquisição" 
              type="bar" 
              data={channelData}
            />
          </div>

          {/* Intelligence Layer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 -z-0" />
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-8 flex items-center gap-2 relative z-10">
                <Zap className="text-blue-500" size={24} fill="currentColor" />
                Inteligência Competitiva
              </h3>
              <div className="space-y-6 relative z-10">
                {report.insights.intelligence.map((insight: any, idx: number) => (
                  <div key={idx} className="p-4 sm:p-5 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <span className="font-black text-gray-900 text-lg">{insight.domain}</span>
                      {insight.alert && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase border border-rose-100">
                          <AlertTriangle size={12} />
                          Alerta: Crescimento Rápido
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vantagem</p>
                        <p className="font-bold text-emerald-600 leading-tight">{insight.advantage}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gap Técnico</p>
                        <p className="font-bold text-amber-600 leading-tight">{insight.gap}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Oportunidade</p>
                        <p className="font-bold text-blue-600 leading-tight">{insight.opportunity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-blue-400 uppercase tracking-widest text-[13px]">
                🎯 Recomendações
              </h3>
              <ul className="space-y-6 flex-1">
                {report.insights.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex gap-4 text-sm leading-relaxed">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 bg-blue-600/30 text-blue-300 rounded-lg flex items-center justify-center font-black text-xs border border-blue-500/20">
                      {idx + 1}
                    </div>
                    <span className="opacity-90">{rec}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full mt-10 bg-white text-blue-900 font-black py-4 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl uppercase text-xs tracking-widest"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <FileDown size={18} />
                    Exportar Relatório Premium
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
