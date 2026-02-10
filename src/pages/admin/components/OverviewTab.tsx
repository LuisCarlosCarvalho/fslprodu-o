import { FolderOpen, Users, MessageSquare, FileText, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

type OverviewTabProps = {
  stats: {
    projects: number;
    clients: number;
    quotes: number;
    blogPosts: number;
  };
  loading: boolean;
};

export function OverviewTab({ stats, loading }: OverviewTabProps) {
  const cards = [
    {
      title: 'Projetos Ativos',
      value: stats.projects,
      icon: FolderOpen,
      color: 'bg-blue-500',
      description: 'Projetos em andamento'
    },
    {
      title: 'Clientes',
      value: stats.clients,
      icon: Users,
      color: 'bg-green-500',
      description: 'Clientes cadastrados'
    },
    {
      title: 'Orçamentos',
      value: stats.quotes,
      icon: MessageSquare,
      color: 'bg-purple-500',
      description: 'Solicitações recebidas'
    },
    {
      title: 'Artigos Blog',
      value: stats.blogPosts,
      icon: FileText,
      color: 'bg-orange-500',
      description: 'Publicações no blog'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 h-32 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4 mb-6">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-xl text-white`}>
                  <card.icon size={24} />
                </div>
                <TrendingUp size={20} className="text-green-500" />
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                <h3 className="text-sm font-medium text-gray-500 mt-1">{card.title}</h3>
                <p className="text-xs text-gray-400 mt-2">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors group">
              <FolderOpen size={24} className="mb-2 text-gray-400 group-hover:text-blue-600" />
              <span className="text-sm font-medium">Novo Projeto</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-green-600 transition-colors group">
              <Users size={24} className="mb-2 text-gray-400 group-hover:text-green-600" />
              <span className="text-sm font-medium">Novo Cliente</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors group">
              <FileText size={24} className="mb-2 text-gray-400 group-hover:text-purple-600" />
              <span className="text-sm font-medium">Postar Blog</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors group">
              <MessageSquare size={24} className="mb-2 text-gray-400 group-hover:text-orange-600" />
              <span className="text-sm font-medium">Ver Mensagens</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Status do Sistema
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Banco de Dados Online</span>
              </div>
              <span className="font-bold">100%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Autenticação Ativa</span>
              </div>
              <span className="font-bold">OK</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>Armazenamento (S3/Supabase)</span>
              </div>
              <span className="font-bold">85% em uso</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
