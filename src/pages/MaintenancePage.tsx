import { useEffect } from 'react';

export function MaintenancePage() {
  useEffect(() => {
    // Inject noindex meta tag
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    
    // Prevent scrolling behind
    document.body.style.overflow = 'hidden';

    return () => {
      // Cleanup
      meta?.setAttribute('content', 'index, follow');
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden">
      {/* Pulse Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-blue-600/20 rounded-full blur-[120px] md:blur-[150px] animate-pulse pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
        <div className="mb-12">
          <img 
            src="/logo.png" 
            alt="FSL Solution" 
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain filter drop-shadow-[0_0_20px_rgba(59,130,246,0.4)] mx-auto animate-[pulse_3s_ease-in-out_infinite]" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.15]">
          Estamos reformulando nossa brand<br className="hidden md:block"/> para melhor atendê-lo.
        </h1>
        
        <p className="text-lg sm:text-xl text-blue-200/70 font-medium max-w-xl mx-auto leading-relaxed">
          Novidades incríveis estão a caminho. Aguarde, voltaremos em breve com uma plataforma mais rápida e potente.
        </p>

        <div className="mt-16 w-12 h-1.5 bg-blue-500 rounded-full mx-auto opacity-50"></div>
      </div>
    </div>
  );
}
