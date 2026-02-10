import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';
import { Calendar, ChevronRight, ArrowRight } from 'lucide-react';

export function BlogSection() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLatestPosts() {
      try {
        const { data } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);
        
        setPosts(data || []);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLatestPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="bg-gray-200 aspect-video rounded-2xl mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="flex flex-col items-center text-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Blog & <span className="text-blue-600">Novidades</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Fique por dentro das últimas tendências de tecnologia, design e estratégias digitais.
            </p>
          </div>
          <button 
            onClick={() => navigate('/blog')}
            className="group flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all"
          >
            Ver todos os artigos
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50/50 transition-all duration-500 flex flex-col cursor-pointer"
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={post.featured_image_url} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest mb-4">
                  <Calendar size={14} />
                  {new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ler Artigo
                    <ChevronRight size={16} className="text-blue-600" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
