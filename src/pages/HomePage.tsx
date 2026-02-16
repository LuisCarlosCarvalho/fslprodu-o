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

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    // Reduced particle count for better performance
    const particleCount = window.innerWidth < 768 ? 30 : 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    let animationFrameId: number;

    function animate() {
      if (!ctx || !canvas) return;

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

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Transforme sua Presença Digital
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            FSL Solution, uma empresa de marketing digital focada em fornecer soluções de marketing inteligentes e eficazes para empresas de todos os tamanhos e setores. Nós nos dedicamos a ajudar nossos clientes a alcançar seus objetivos de negócios, oferecendo uma ampla gama de serviços de marketing digital, incluindo estratégia de mídia social, publicidade online, criação de website, otimização de mecanismos de busca, SEO, produção de conteúdo e muito mais.
          </p>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            O que nos diferencia é a nossa abordagem personalizada para cada cliente. Nosso objetivo é entender as necessidades de cada cliente criar soluções de marketing exclusivas para atender às suas necessidades específicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Solicitar Orçamento
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Por que Escolher a FSL Solution Digital?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">
                Projetos entregues no prazo, com qualidade e profissionalismo
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Focados em Resultados</h3>
              <p className="text-gray-600">
                Estratégias personalizadas para alcançar seus objetivos
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Crescimento Garantido</h3>
              <p className="text-gray-600">
                Soluções que escalam junto com seu negócio
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suporte Dedicado</h3>
              <p className="text-gray-600">
                Acompanhamento personalizado em todas as etapas
              </p>
            </div>
          </div>
        </div>
      </section>

      <BlogSection />
      <LogoCarousel />

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Começar seu Projeto?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Entre em contato e receba um orçamento personalizado para suas necessidades
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Solicitar Orçamento
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
