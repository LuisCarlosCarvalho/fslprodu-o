import React from 'react';
import { 
  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Bar, Line, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Activity,
  Target, Zap, AlertCircle 
} from 'lucide-react';

const cashFlowData = [
  { month: 'Jan', revenue: 45000, expenses: 32000, projection: 48000 },
  { month: 'Fev', revenue: 52000, expenses: 37000, projection: 50000 },
  { month: 'Mar', revenue: 48000, expenses: 31000, projection: 55000 },
  { month: 'Abr', revenue: 61000, expenses: 39000, projection: 60000 },
  { month: 'Mai', revenue: 59000, expenses: 42000, projection: 65000 },
  { month: 'Jun', revenue: 68000, expenses: 45000, projection: 70000 },
];

const customerGrowthData = [
  { month: 'Jan', cac: 1200, ltv: 8500 },
  { month: 'Fev', cac: 1150, ltv: 9200 },
  { month: 'Mar', cac: 1080, ltv: 9500 },
  { month: 'Abr', cac: 1050, ltv: 10200 },
  { month: 'Mai', cac: 980,  ltv: 11000 },
  { month: 'Jun', cac: 950,  ltv: 11500 },
];

export const FinancialIntelligence = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <header className="mb-8 flex justify-between items-end border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Controladoria Analítica
          </h1>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-wider font-semibold">
            Visão Executiva C-Level • FSL Solution
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-300">ERP Sync Ativo</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-300">CRM Sync Ativo</span>
          </div>
        </div>
      </header>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="MRR (Monthly Recurring)"
          value="R$ 68.450"
          change="+15.2%"
          isPositive={true}
          icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
        />
        <MetricCard 
          title="LTV Estimado Médio"
          value="R$ 11.500"
          change="+4.5%"
          isPositive={true}
          icon={<Target className="w-6 h-6 text-blue-400" />}
        />
        <MetricCard 
          title="CAC Atual"
          value="R$ 950"
          change="-3.1%"
          isPositive={true} // CAC falling is positive
          icon={<Users className="w-6 h-6 text-indigo-400" />}
        />
        <MetricCard 
          title="Burn Rate Projetado"
          value="R$ 14.200"
          change="+1.2%"
          isPositive={false}
          icon={<Activity className="w-6 h-6 text-red-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart: Cash Predictability */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Previsibilidade de Caixa (Cash Flow)
            </h2>
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-md px-3 py-1 outline-none">
              <option>Últimos 6 Meses</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-[400px] w-full pt-4">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 13}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 13}} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" name="Receita Realizada" dataKey="revenue" fill="url(#colorRevenue)" stroke="#10b981" strokeWidth={3} />
                <Bar name="Despesas" dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line type="monotone" name="Projeção (Forecast)" dataKey="projection" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Metric: LTV to CAC Ratio */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm flex flex-col">
          <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-400" />
            Eficiência de Aquisição (LTV:CAC)
          </h2>
          
          <div className="h-[400px] w-full pt-4">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 13}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(value: any) => [`R$ ${value}`, '']}
                />
                <Legend />
                <Line type="monotone" name="LTV" dataKey="ltv" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />
                <Line type="monotone" name="CAC" dataKey="cac" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Ratio Atual:</span>
              <span className="text-2xl font-bold text-emerald-400">12.1x</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Regra de ouro SaaS: {'>'} 3:1 é saudável. O negócio está escalando com alta rentabilidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, change, isPositive, icon }: { title: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode }) => (
  <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-24 h-24' })}
    </div>
    <div className="flex justify-between items-start relative z-10">
      <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
      <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700">
        {icon}
      </div>
    </div>
    <div className="mt-6 relative z-10">
      <div className="text-3xl font-bold tracking-tight text-white mb-2">{value}</div>
      <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {change} <span className="text-slate-500 ml-2 font-normal">vs último mês</span>
      </div>
    </div>
  </div>
);

export default FinancialIntelligence;
