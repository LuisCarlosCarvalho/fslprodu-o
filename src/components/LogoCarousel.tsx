import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClientLogo } from '../types';

export function LogoCarousel() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);

  useEffect(() => {
    async function loadLogos() {
      const { data } = await supabase
        .from('client_logos')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      setLogos(data || []);
    }
    loadLogos();
  }, []);

  if (logos.length === 0) return null;

  // Double the logos to create the infinite effect
  const displayLogos = [...logos, ...logos, ...logos];

  return (
    <div className="py-20 bg-gray-50 border-y border-gray-100 overflow-hidden relative group">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Empresas que confiam na FSL</h3>
      </div>
      
      <div className="flex w-fit animate-scroll hover:[animation-play-state:paused]">
        {displayLogos.map((logo, idx) => (
          <div 
            key={`${logo.id}-${idx}`} 
            className="flex-shrink-0 px-12 transition-all duration-500 hover:scale-110"
          >
            <div className="h-12 flex items-center justify-center grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all duration-500">
              <img 
                src={logo.image_url} 
                alt={logo.name} 
                className="max-h-full max-w-[160px] object-contain"
                title={logo.name}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>

      {/* Fade Overlays */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />
    </div>
  );
}
