import React from 'react';

type CustomProjectFormProps = {
  data: any;
  onChange: (details: any) => void;
};

export function CustomProjectForm({ data, onChange }: CustomProjectFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    onChange({ ...data, [name]: val });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-gray-700 mb-2">Descrição Detalhada do Projeto *</label>
        <textarea
          name="project_description"
          required
          value={data.project_description || ''}
          onChange={handleChange}
          rows={5}
          placeholder="Explique sua ideia, necessidades e objetivos principais..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Categoria do Projeto</label>
        <select
          name="category"
          value={data.category || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Selecione</option>
          <option value="software">Desenvolvimento de Software</option>
          <option value="consultoria">Consultoria Estratégica</option>
          <option value="automacao">Automação de Processos</option>
          <option value="marketing_360">Marketing 360º</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Qual o maior desafio atual?</label>
        <input
          type="text"
          name="main_challenge"
          value={data.main_challenge || ''}
          onChange={handleChange}
          placeholder="O que te impede de crescer hoje?"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Tecnologias Envolvidas (se souber)</label>
        <input
          type="text"
          name="tech_stack"
          value={data.tech_stack || ''}
          onChange={handleChange}
          placeholder="Ex: React, Python, Flutter..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Orçamento Estimado</label>
        <input
          type="text"
          name="budget"
          value={data.budget || ''}
          onChange={handleChange}
          placeholder="Ex: R$ 5.000 ou Aberto"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>
  );
}
