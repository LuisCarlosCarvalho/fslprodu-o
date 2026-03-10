import { Trash2, Plus, Zap } from 'lucide-react';
import { Service } from '../../../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingService: Service | null;
  serviceForm: {
    name: string;
    description: string;
    base_price: number;
    category: string;
    pricing_config: any;
  };
  setServiceForm: (form: any) => void;
  handleSaveService: () => Promise<void>;
}

export function ServiceModal({
  isOpen,
  onClose,
  editingService,
  serviceForm,
  setServiceForm,
  handleSaveService,
}: ServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {editingService ? 'Editar Serviço' : 'Novo Serviço'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome do Serviço</label>
            <input
              type="text"
              value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Categoria</label>
            <select
              value={serviceForm.category}
              onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="Web Sites">Web Sites</option>
              <option value="Criação de Logos">Criação de Logos</option>
              <option value="Gerenciamento de Trafego">Gerenciamento de Tráfego</option>
              <option value="SEO">SEO</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Preço Base (€)</label>
            <input
              type="number"
              value={serviceForm.base_price}
              onChange={(e) => setServiceForm({ ...serviceForm, base_price: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Descrição</label>
            <textarea
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              required
            />
          </div>

          <div className="pt-6 border-t space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Preços por Região</h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">JSON Config</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brasil */}
              <div className="space-y-4 p-5 bg-green-50/50 rounded-2xl border border-green-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇧🇷</span>
                    <h4 className="font-bold text-green-800">Brasil (BRL)</h4>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {serviceForm.pricing_config.BR.ranges.map((range: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-end animate-in fade-in slide-in-from-left-2 transition-all">
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase font-black text-green-600 mb-1">Rótulo</label>
                        <input
                          type="text"
                          value={range.label}
                          placeholder="ex: Até 5 pág."
                          onChange={(e) => {
                            const newRanges = [...serviceForm.pricing_config.BR.ranges];
                            newRanges[idx].label = e.target.value;
                            setServiceForm({
                              ...serviceForm,
                              pricing_config: {
                                ...serviceForm.pricing_config,
                                BR: { ...serviceForm.pricing_config.BR, ranges: newRanges }
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-green-200 rounded-xl text-xs focus:ring-2 focus:ring-green-500 outline-none"
                        />
                      </div>
                      <div className="w-28">
                        <label className="block text-[9px] uppercase font-black text-green-600 mb-1">Valor (R$)</label>
                        <input
                          type="text"
                          value={range.value}
                          placeholder="1.500,00"
                          onChange={(e) => {
                            const newRanges = [...serviceForm.pricing_config.BR.ranges];
                            newRanges[idx].value = e.target.value;
                            setServiceForm({
                              ...serviceForm,
                              pricing_config: {
                                ...serviceForm.pricing_config,
                                BR: { ...serviceForm.pricing_config.BR, ranges: newRanges }
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-green-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-green-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newRanges = serviceForm.pricing_config.BR.ranges.filter((_: any, i: number) => i !== idx);
                          setServiceForm({
                            ...serviceForm,
                            pricing_config: {
                              ...serviceForm.pricing_config,
                              BR: { ...serviceForm.pricing_config.BR, ranges: newRanges }
                            }
                          });
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    const newRanges = [...serviceForm.pricing_config.BR.ranges, { label: '', value: '' }];
                    setServiceForm({
                      ...serviceForm,
                      pricing_config: {
                        ...serviceForm.pricing_config,
                        BR: { ...serviceForm.pricing_config.BR, ranges: newRanges }
                      }
                    });
                  }}
                  className="w-full py-3 border-2 border-dashed border-green-200 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-green-400 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Adicionar Faixa BR
                </button>
              </div>

              {/* Portugal */}
              <div className="space-y-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇵🇹</span>
                    <h4 className="font-bold text-blue-800">Portugal (EUR)</h4>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {serviceForm.pricing_config.PT.ranges.map((range: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-end animate-in fade-in slide-in-from-right-2 transition-all">
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase font-black text-blue-600 mb-1">Rótulo</label>
                        <input
                          type="text"
                          value={range.label}
                          placeholder="ex: Até 5 pág."
                          onChange={(e) => {
                            const newRanges = [...serviceForm.pricing_config.PT.ranges];
                            newRanges[idx].label = e.target.value;
                            setServiceForm({
                              ...serviceForm,
                              pricing_config: {
                                ...serviceForm.pricing_config,
                                PT: { ...serviceForm.pricing_config.PT, ranges: newRanges }
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-blue-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="w-28">
                        <label className="block text-[9px] uppercase font-black text-blue-600 mb-1">Valor (€)</label>
                        <input
                          type="text"
                          value={range.value}
                          placeholder="500.00"
                          onChange={(e) => {
                            const newRanges = [...serviceForm.pricing_config.PT.ranges];
                            newRanges[idx].value = e.target.value;
                            setServiceForm({
                              ...serviceForm,
                              pricing_config: {
                                ...serviceForm.pricing_config,
                                PT: { ...serviceForm.pricing_config.PT, ranges: newRanges }
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-blue-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newRanges = serviceForm.pricing_config.PT.ranges.filter((_: any, i: number) => i !== idx);
                          setServiceForm({
                            ...serviceForm,
                            pricing_config: {
                              ...serviceForm.pricing_config,
                              PT: { ...serviceForm.pricing_config.PT, ranges: newRanges }
                            }
                          });
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    const newRanges = [...serviceForm.pricing_config.PT.ranges, { label: '', value: '' }];
                    setServiceForm({
                      ...serviceForm,
                      pricing_config: {
                        ...serviceForm.pricing_config,
                        PT: { ...serviceForm.pricing_config.PT, ranges: newRanges }
                      }
                    });
                  }}
                  className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  Adicionar Faixa PT
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSaveService}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
          >
            Salvar Serviço
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
