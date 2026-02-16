import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if app is already installed or in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isStandalone) {
      return;
    }

    const handler = (e: any) => {
      // Prevent browser from showing its own prompt
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasBeenDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!hasBeenDismissed) {
        // Show banner after a slight delay
        const timer = setTimeout(() => setIsVisible(true), 6000); 
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async (evt: React.MouseEvent) => {
    evt.preventDefault();
    if (!deferredPrompt) return;
    
    // Show the native install prompt
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User choice: ${outcome}`);
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
    } catch (err) {
      console.error('[PWA] Error during install:', err);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 max-w-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/app-icon.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">Acesso Rápido</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Instale este site no seu dispositivo para acesso rápido e prático.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Instalar
          </button>
          <button 
            onClick={handleDismiss}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
