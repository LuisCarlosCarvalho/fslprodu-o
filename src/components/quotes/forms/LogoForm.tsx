import React from 'react';

type LogoFormProps = {
  data: any;
  onChange: (details: any) => void;
  region?: string;
  pricingConfig?: any;
};

export function LogoForm({ data, onChange, region, pricingConfig }: LogoFormProps) {
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
        <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Empresa / Marca *</label>
        <input
          type="text"
          name="brand_name"
          required
          value={data.brand_name || ''}
          onChange={handleChange}
          placeholder="Como aparecerá no logo"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Slogan (opcional)</label>
        <input
          type="text"
          name="slogan"
          value={data.slogan || ''}
          onChange={handleChange}
          placeholder="Frase de efeito"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Segmento de Negócio *</label>
        <input
          type="text"
          name="business_segment"
          required
          value={data.business_segment || ''}
          onChange={handleChange}
          placeholder="Ex: Tecnologia, Moda..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Público-alvo *</label>
        <input
          type="text"
          name="public_target"
          required
          value={data.public_target || ''}
          onChange={handleChange}
          placeholder="Ex: Jovens de 18-24 anos"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Personalidade da Marca</label>
        <select
          name="brand_personality"
          value={data.brand_personality || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione</option>
          <option value="modern">Moderno / Inovador</option>
          <option value="classic">Clássico / Elegante</option>
          <option value="minimalist">Minimalista</option>
          <option value="bold">Ousado / Impactante</option>
          <option value="friendly">Amigável / Acessível</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Cores Preferidas</label>
        <input
          type="text"
          name="preferred_colors"
          value={data.preferred_colors || ''}
          onChange={handleChange}
          placeholder="Ex: Azul e Branco, tons pastéis..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Faixa de Investimento Desejada *</label>
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
              <option value="standard">Identidade Padrão</option>
              <option value="premium">Identidade Premium + Manual</option>
            </>
          )}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Onde o logo será usado?</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {['Website', 'Redes Sociais', 'Impressos', 'Embalagens'].map(item => (
             <label key={item} className="flex items-center gap-2 cursor-pointer">
               <input
                 type="checkbox"
                 name={`usage_${item.toLowerCase().replace(' ', '_')}`}
                 checked={data[`usage_${item.toLowerCase().replace(' ', '_')}`] || false}
                 onChange={(e) => onChange({ ...data, [e.target.name]: e.target.checked })}
                 className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
               />
               <span className="text-sm font-medium text-gray-600">{item}</span>
             </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="needs_manual"
            checked={data.needs_manual || false}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-bold text-gray-700">Manual da Marca</span>
        </label>
      </div>
    </div>
  );
}
