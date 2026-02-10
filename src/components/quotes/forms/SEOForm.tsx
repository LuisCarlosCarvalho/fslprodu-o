import React from 'react';

type SEOFormProps = {
  data: any;
  onChange: (details: any) => void;
  region?: string;
  pricingConfig?: any;
};

export function SEOForm({ data, onChange, region, pricingConfig }: SEOFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    onChange({ ...data, [name]: val });
  };

  const regionKey = region === 'Portugal' ? 'PT' : 'BR';
  const customRanges = pricingConfig?.[regionKey]?.ranges || [];
  const symbol = pricingConfig?.[regionKey]?.symbol || (region === 'Portugal' ? '€' : 'R$');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">URL do Website *</label>
        <input
          type="url"
          name="website_url"
          required
          value={data.website_url || ''}
          onChange={handleChange}
          placeholder="https://seu-site.com"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Principais Palavras-Chave (desejadas)</label>
        <textarea
          name="keywords"
          value={data.keywords || ''}
          onChange={handleChange}
          rows={2}
          placeholder="Ex: agência de marketing, criação de sites..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Abrangência do SEO *</label>
        <select
          name="seo_scope"
          required
          value={data.seo_scope || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione</option>
          <option value="local">SEO Local (Cidade/Região)</option>
          <option value="national">SEO Nacional (País)</option>
          <option value="international">SEO Internacional</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Orçamento Mensal para SEO *</label>
        <select
          name="budget_range"
          required={customRanges.length > 0}
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
              <option value="basico">SEO Básico</option>
              <option value="profissional">SEO Profissional</option>
              <option value="enterprise">Enterprise / Custom</option>
            </>
          )}
        </select>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="needs_content"
            checked={data.needs_content || false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-700">Precisa de Produção de Conteúdo (Blog)?</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="needs_backlinks"
            checked={data.needs_backlinks || false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-700">Precisa de Link Building / Backlinks?</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="has_tech_access"
            checked={data.has_tech_access || false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-700">Possui acesso técnico/painel do site?</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Frequência de Conteúdo Desejada</label>
        <select
          name="content_frequency"
          value={data.content_frequency || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione</option>
          <option value="weekly">1 Post Semanal</option>
          <option value="biweekly">2 Posts Semanais</option>
          <option value="daily">Posts Diários</option>
          <option value="custom">Sob Demanda</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Quem são seus principais concorrentes?</label>
        <textarea
          name="competitors"
          value={data.competitors || ''}
          onChange={handleChange}
          rows={2}
          placeholder="URLs ou nomes dos concorrentes"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>
    </div>
  );
}
