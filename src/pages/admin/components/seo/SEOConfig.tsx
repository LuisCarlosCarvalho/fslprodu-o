import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Globe, Shield } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { SEODomain } from '../../../../types/seo-intelligence';
import { SEOIntegrationService } from '../../../../services/SEOIntegrationService';
import { showToast } from '../../../../components/ui/Toast';

export function SEOConfig() {
  const [domains, setDomains] = useState<SEODomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [isCompetitor, setIsCompetitor] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const data = await SEOIntegrationService.getDomains();
      setDomains(data);
    } catch (error) {
      console.error('Error loading domains:', error);
      showToast('Erro ao carregar domínios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain) return;
    try {
      await SEOIntegrationService.addDomain({
        domain: newDomain,
        is_competitor: isCompetitor,
        target_countries: ['BR'] // Default
      });
      setNewDomain('');
      setIsCompetitor(false);
      loadDomains();
      showToast('Domínio adicionado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao adicionar domínio', 'error');
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    try {
      await SEOIntegrationService.deleteDomain(id);
      loadDomains();
      showToast('Domínio removido', 'success');
    } catch (error) {
      showToast('Erro ao remover domínio', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* API Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Configuração de API</h3>
            <p className="text-sm text-gray-500">Gerencie suas chaves de API (SEMrush, Ahrefs, etc)</p>
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">SEMrush API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••••••••••••••••••"
            />
          </div>
          <button className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2">
            <Save size={18} />
            Salvar
          </button>
        </div>
      </div>

      {/* Domains Management */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Gerenciamento de Domínios</h3>
              <p className="text-sm text-gray-500">Adicione domínios próprios e concorrentes para monitorar</p>
            </div>
          </div>
        </div>

        {/* Add New */}
        <div className="flex gap-4 items-end mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Novo Domínio</label>
            <input 
              type="text" 
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="exemplo.com.br"
            />
          </div>
          <div className="flex items-center h-10 pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isCompetitor} 
                onChange={(e) => setIsCompetitor(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
              />
              <span className="text-sm font-medium text-gray-700">É concorrente?</span>
            </label>
          </div>
          <button 
            onClick={handleAddDomain}
            disabled={!newDomain}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </div>

        {/* List */}
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Domínio</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Países</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center text-gray-400">Carregando...</td></tr>
              ) : domains.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-gray-400">Nenhum domínio cadastrado.</td></tr>
              ) : (
                domains.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{d.domain}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${d.is_competitor ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {d.is_competitor ? 'Concorrente' : 'Principal'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{d.target_countries?.join(', ') || 'Global'}</td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleDeleteDomain(d.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
