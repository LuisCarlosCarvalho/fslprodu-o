import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const whatsappNumber = '351928485483';
  const defaultMessage = encodeURIComponent('Olá FSL, vim pelo site e gostaria de conversar sobre um projeto!');

  // Mostra o botão após um pequeno delay para não atrapalhar o FCP (First Contentful Paint)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Tooltip Balão */}
      <div 
        className={`mb-4 bg-white px-5 py-3 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 transition-all duration-300 transform origin-bottom-right ${
          isHovered ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900">Precisa de um orçamento?</p>
            <p className="text-xs text-gray-500 mt-0.5">Fale com um especialista online agora.</p>
          </div>
          <button 
            onClick={() => setIsHovered(false)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={14} />
          </button>
        </div>
        {/* Setinha apontando pro botão */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
      </div>

      {/* Botão Principal */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg shadow-[#25D366]/30 hover:shadow-2xl hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300"
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform duration-300" />
        
        {/* Ping Animation de Fundo */}
        <div className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-20"></div>
      </a>
    </div>
  );
}
