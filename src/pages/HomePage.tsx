import { ArrowRight, Zap, Target, TrendingUp, Users } from 'lucide-react';
import { Link } from '../components/Link';
import { useEffect, useRef } from 'react';
import { BlogSection } from '../components/BlogSection';
import { LogoCarousel } from '../components/LogoCarousel';

export function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size safely
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    // Safe particle count
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative min-h-[90vh] flex items-center bg-slate-900 py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Advanced Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.15),_transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-40"
        />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-sm font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            DESENVOLVIMENTO WEB QUE GERA RESULTADOS
          </div>
          <h1 className="text-white mb-6 drop-shadow-2xl">
            Transforme sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Presença Digital</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl md:max-w-5xl mx-auto leading-relaxed md:whitespace-nowrap">
            FSL Solution: Inteligência analítica e design de alta performance para empresas que buscam resultados reais.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/services"
              className="premium-button bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1"
            >
              Iniciar Projeto
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/portfolio"
              className="px-8 py-4 rounded-2xl font-black text-white border border-white/10 hover:bg-white/5 transition-all"
            >
              Ver Portfolio
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-slate-900 mb-4">
              Por que Escolher a FSL Solution?
            </h2>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card p-10 hover:border-blue-500/30">
              <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
                <Zap className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl mb-4 text-slate-900 leading-tight">Entrega Rápida</h3>
              <p className="text-slate-500 font-medium">
                Sprints focados e metodologia ágil para resultados em tempo recorde.
              </p>
            </div>

            <div className="glass-card p-10 hover:border-emerald-500/30">
              <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20">
                <Target className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl mb-4 text-slate-900 leading-tight">Focados em ROI</h3>
              <p className="text-slate-500 font-medium">
                Estratégias baseadas em dados para garantir o retorno do seu investimento.
              </p>
            </div>

            <div className="glass-card p-10 hover:border-orange-500/30">
              <div className="bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-orange-500/20">
                <TrendingUp className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl mb-4 text-slate-900 leading-tight">Crescimento Escalonável</h3>
              <p className="text-slate-500 font-medium">
                Soluções que acompanham a evolução e o volume do seu negócio.
              </p>
            </div>

            <div className="glass-card p-10 hover:border-indigo-500/30">
              <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/20">
                <Users className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-xl mb-4 text-slate-900 leading-tight">Suporte 360º</h3>
              <p className="text-slate-500 font-medium">
                Monitoramento contínuo e acompanhamento estratégico dedicado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BlogSection />
      <LogoCarousel />

      <section className="section-padding px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-white mb-6">
            Pronto para Escalar seu Faturamento?
          </h2>
          <p className="text-xl mb-12 text-slate-400">
            Entre em contato e descubra como nossas soluções de marketing inteligente podem transformar seu negócio hoje.
          </p>
          <Link
            href="/services"
            className="premium-button bg-white text-slate-900 hover:bg-slate-100"
          >
            Solicitar Orçamento Estratégico
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
