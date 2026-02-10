import { Plus, Edit, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import { BlogPost } from '../../../types';

type BlogTabProps = {
  posts: BlogPost[];
  onNewPost: () => void;
  onEditPost: (post: BlogPost) => void;
  onDeletePost: (id: string) => void;
  onToggleStatus: (post: BlogPost) => void;
};

export function BlogTab({ posts, onNewPost, onEditPost, onDeletePost, onToggleStatus }: BlogTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Blog & Artigos</h2>
        <button
          onClick={onNewPost}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Artigo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
            <div className="aspect-video w-full relative overflow-hidden bg-gray-100">
              {post.featured_image_url ? (
                <img 
                  src={post.featured_image_url} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FileText size={40} />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  post.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{post.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                {post.excerpt}
              </p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditPost(post)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar Artigo"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onToggleStatus(post)}
                    className={`p-2 rounded-lg transition-colors ${
                      post.status === 'published' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={post.status === 'published' ? 'Mudar para Rascunho' : 'Publicar'}
                  >
                    {post.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button
                  onClick={() => onDeletePost(post.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir Artigo"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Plus className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-medium">Nenhum artigo publicado ainda.</p>
            <button 
              onClick={onNewPost}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Começar a escrever agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
