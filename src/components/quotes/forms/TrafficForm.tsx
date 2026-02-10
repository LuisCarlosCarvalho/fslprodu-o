import React from 'react';

type TrafficFormProps = {
  data: any;
  onChange: (details: any) => void;
  region?: string;
  pricingConfig?: any;
};

export function TrafficForm({ data, onChange, region, pricingConfig }: TrafficFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    onChange({ ...data, [name]: val });
  };

  // Get ranges based on region
  const regionKey = region === 'Portugal' ? 'PT' : 'BR';
  const customRanges = pricingConfig?.[regionKey]?.ranges || [];
  const symbol = pricingConfig?.[regionKey]?.symbol || (region === 'Portugal' ? '€' : 'R$');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Plataformas de Interesse</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {['Google Ads', 'Meta Ads', 'TikTok Ads', 'LinkedIn Ads'].map(platform => (
             <label key={platform} className="flex items-center gap-2 cursor-pointer">
               <input
                 type="checkbox"
                 name={`platform_${platform.toLowerCase().split(' ')[0]}`}
                 checked={data[`platform_${platform.toLowerCase().split(' ')[0]}`] || false}
                 onChange={(e) => onChange({ ...data, [e.target.name]: e.target.checked })}
                 className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
               />
               <span className="text-sm font-medium text-gray-600">{platform}</span>
             </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Investimento Mensal em Anúncios *</label>
        <select
          name="budget_range"
          required
          value={data.budget_range || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione a faixa</option>
          {customRanges.length > 0 ? (
            customRanges.map((range: any, idx: number) => (
              <option key={idx} value={range.value}>
                {range.label} ({symbol} {range.value})
              </option>
            ))
          ) : (
            <>
              <option value="up_to_1k">Até R$ 1.000 / € 200</option>
              <option value="1k_to_5k">R$ 1.000 - R$ 5.000 / € 200 - € 1.000</option>
              <option value="5k_to_10k">R$ 5.000 - R$ 10.000 / € 1.000 - € 2.000</option>
              <option value="above_10k">Acima de R$ 10.000 / € 2.000</option>
            </>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Principal Objetivo *</label>
        <select
          name="objective"
          required
          value={data.objective || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione o objetivo</option>
          <option value="leads">Geração de Leads / Contatos</option>
          <option value="sales">Vendas Online (E-commerce)</option>
          <option value="traffic">Aumento de Tráfego</option>
          <option value="awareness">Reconhecimento de Marca</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Localização Alvo (Cidades, Estados ou Países)</label>
        <input
          type="text"
          name="target_location"
          value={data.target_location || ''}
          onChange={handleChange}
          placeholder="Onde seu público está?"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="has_previous_campaigns"
            checked={data.has_previous_campaigns || false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-700">Já rodou campanhas antes?</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="has_landing_page"
            checked={data.has_landing_page || false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-700">Já possui Landing Page pronta?</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="pixel_installed"
            checked={data.pixel_installed || false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-700">Pixel / Tag Manager já instalado?</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Expectativa de ROI / KPIs</label>
        <textarea
          name="kpi_expectations"
          value={data.kpi_expectations || ''}
          onChange={handleChange}
          rows={2}
          placeholder="Ex: Custo por lead abaixo de R$ 5,00"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>
    </div>
  );
}
