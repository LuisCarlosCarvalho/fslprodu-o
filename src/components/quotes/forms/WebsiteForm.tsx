import React from 'react';

type WebsiteFormProps = {
  data: any;
  onChange: (details: any) => void;
  region?: string;
  pricingConfig?: any;
};

export function WebsiteForm({ data, onChange, region, pricingConfig }: WebsiteFormProps) {
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
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Site *</label>
        <select
          name="site_type"
          required
          value={data.site_type || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione o tipo</option>
          <option value="institutional">Site Institucional</option>
          <option value="ecommerce">E-commerce / Loja Virtual</option>
          <option value="landing_page">Landing Page</option>
          <option value="blog">Blog / Portal de Notícias</option>
          <option value="custom_system">Sistema Personalizado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Investimento Estimado *</label>
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
              <option value="initial">Sob Consulta (Básico)</option>
              <option value="medium">Projetos Médios</option>
              <option value="high">Sistemas Complexos</option>
            </>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Número de Páginas (estimado)</label>
        <input
          type="number"
          name="pages_count"
          value={data.pages_count || ''}
          onChange={handleChange}
          placeholder="Ex: 5"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Já possui domínio?</label>
        <select
          name="has_domain"
          value={data.has_domain || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione</option>
          <option value="yes">Sim</option>
          <option value="no">Não</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Precisa de Hospedagem?</label>
        <select
          name="needs_hosting"
          value={data.needs_hosting || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione</option>
          <option value="yes">Sim</option>
          <option value="no">Não</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Expectativa de Prazo</label>
        <input
          type="text"
          name="deadline"
          value={data.deadline || ''}
          onChange={handleChange}
          placeholder="Ex: 30 dias"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Idiomas do Site</label>
        <input
          type="text"
          name="languages"
          value={data.languages || ''}
          onChange={handleChange}
          placeholder="Ex: Português, Inglês"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Você fornecerá o conteúdo? (Texto/Fotos)</label>
        <select
          name="content_provided"
          value={data.content_provided || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione</option>
          <option value="yes">Sim, eu forneço tudo</option>
          <option value="no">Não, preciso que criem</option>
          <option value="partial">Parcialmente</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Sites de Referência (URLs)</label>
        <textarea
          name="references"
          value={data.references || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Liste sites que você gosta..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>

      <div className="flex items-center gap-4 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="needs_seo"
            checked={data.needs_seo || false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-700">Otimização SEO</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="needs_maintenance"
            checked={data.needs_maintenance || false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-700">Plano de Manutenção</span>
        </label>
      </div>
    </div>
  );
}
