import { Plus } from 'lucide-react';
import { BlogPost } from '../../../types';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBlogPost: BlogPost | null;
  blogForm: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image_url: string;
    status: 'draft' | 'published';
  };
  setBlogForm: (form: any) => void;
  handleSaveBlogPost: () => Promise<void>;
}

export function BlogModal({
  isOpen,
  onClose,
  editingBlogPost,
  blogForm,
  setBlogForm,
  handleSaveBlogPost,
}: BlogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingBlogPost ? 'Editar Artigo' : 'Novo Artigo'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Título do Artigo</label>
              <input
                type="text"
                value={blogForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  const slug = title
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^\w\s-]/g, "")
                    .trim()
                    .replace(/\s+/g, "-");
                  setBlogForm({ ...blogForm, title, slug });
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex EnTítulo do Artigo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Slug (URL)</label>
              <input
                type="text"
                value={blogForm.slug}
                onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                placeholder="ex-titulo-do-artigo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select
                value={blogForm.status}
                onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">URL da Imagem de Capa</label>
              <input
                type="text"
                value={blogForm.featured_image_url}
                onChange={(e) => setBlogForm({ ...blogForm, featured_image_url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Resumo (Excerpt)</label>
              <textarea
                value={blogForm.excerpt}
                onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                placeholder="Breve descrição do artigo..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Conteúdo (HTML/Markdown)</label>
              <textarea
                value={blogForm.content}
                onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                className="w-full px-4 py-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-64 font-mono text-sm"
                placeholder="Escreva o conteúdo aqui..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSaveBlogPost}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            {editingBlogPost ? 'Atualizar Artigo' : 'Salvar Artigo'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg font-bold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
