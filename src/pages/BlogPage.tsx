import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';

export function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllPosts() {
      try {
        const { data } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        
        setPosts(data || []);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAllPosts();
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-gray-50 min-h-screen">
      <SEO 
        title="Blog" 
        description="Explorações profundas sobre o mundo digital, tecnologia e o futuro da inovação pela FSL Solution." 
      />
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Nosso <span className="text-blue-600">Blog</span>
          </h1>
          <p className="text-xl text-gray-500 mx-auto">
            Explorações profundas sobre o mundo digital, tecnologia e o futuro da inovação.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 font-medium">Nenhum artigo publicado ainda. Volte em breve!</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 flex items-center gap-2 mx-auto text-blue-600 font-bold hover:underline"
            >
              <ChevronLeft size={20} />
              Voltar para Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50/50 transition-all duration-500 cursor-pointer flex flex-col"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={post.featured_image_url} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest mb-4">
                    <Calendar size={14} />
                    {new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 group-hover:gap-2 transition-all flex items-center gap-1">
                      Ler Artigo completo
                      <ArrowRight size={16} className="text-blue-600" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
