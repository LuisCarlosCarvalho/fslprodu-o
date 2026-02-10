import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, Share2, Clock } from 'lucide-react';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';

export function BlogPostPage() {
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        // Get slug from URL
        const slug = window.location.pathname.split('/').pop();
        if (!slug) return;

        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();
        
        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error loading blog post:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Artigo não encontrado</h1>
        <p className="text-gray-500 mb-8 max-w-md">O artigo que você está procurando pode ter sido removido ou o link está incorreto.</p>
        <button 
          onClick={() => navigate('/blog')}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Ver todos os artigos
        </button>
      </div>
    );
  }

  // Calculate reading time (rough estimate)
  const wordsPerMinute = 200;
  const noOfWords = post.content.split(/\s/g).length;
  const minutes = Math.ceil(noOfWords / wordsPerMinute);

  return (
    <article className="pt-32 pb-24 bg-white min-h-screen">
      <SEO title={post.title} description={post.excerpt} />
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <button 
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 font-medium group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para o Blog
        </button>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-6 mb-8 text-sm font-bold text-blue-600 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              {minutes} min de leitura
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between pb-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl uppercase shadow-lg shadow-blue-100">
                F
              </div>
              <div>
                <p className="font-bold text-gray-900">Equipe FSL Solution</p>
                <p className="text-xs text-gray-400">Especialistas em Estratégia Digital</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                navigator.share({
                  title: post.title,
                  url: window.location.href
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link do artigo copiado!');
                });
              }}
              className="p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-500 transition-all shadow-sm"
              title="Compartilhar"
            >
              <Share2 size={20} />
            </button>
          </div>
        </header>

        {/* Featured Image */}
        <div className="aspect-video w-full rounded-[40px] overflow-hidden mb-16 shadow-2xl shadow-blue-100/50 border border-gray-50">
          <img 
            src={post.featured_image_url} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-medium">
          <div 
             className="blog-content"
             dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} 
          />
        </div>

        {/* Footer info */}
        <footer className="mt-24 pt-12 border-t border-gray-100 text-center">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Gostou deste artigo?</h4>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto italic">Compartilhe conhecimento! A FSL Solution está sempre em busca de inovação e resultados para nossos parceiros.</p>
            <button 
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-200"
            >
              Explorar mais artigos
            </button>
        </footer>
      </div>

      <style>{`
        .blog-content h2 { font-size: 2rem; font-weight: 800; color: #111827; margin-top: 3rem; margin-bottom: 1.5rem; letter-spacing: -0.025em; }
        .blog-content h3 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 2.5rem; margin-bottom: 1rem; }
        .blog-content p { margin-bottom: 1.5rem; color: #374151; }
        .blog-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content strong { color: #111827; font-weight: 700; }
        .blog-content blockquote { border-left: 4px solid #2563eb; padding-left: 1.5rem; font-style: italic; font-size: 1.25rem; color: #1d4ed8; margin: 3rem 0; background: #eff6ff; padding: 2rem; border-radius: 0 24px 24px 0; }
      `}</style>
    </article>
  );
}
