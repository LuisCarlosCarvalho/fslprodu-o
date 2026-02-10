import { useEffect, useState } from 'react';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    info: 'bg-blue-50 border-blue-100',
    error: 'bg-red-50 border-red-100',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right fade-in duration-300 ${bgColors[type]}`}>
      <div className="shrink-0">{icons[type]}</div>
      <p className="flex-grow text-sm font-medium text-gray-800">{message}</p>
      <button onClick={() => onClose(id)} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

  // Expõe o evento globalmente para ser usado por outros componentes
  useEffect(() => {
    const handleAddToast = (e: any) => {
      const { message, type } = e.detail;
      setToasts(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), message, type }]);
    };

    window.addEventListener('add-toast', handleAddToast);
    return () => window.removeEventListener('add-toast', handleAddToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}

export const showToast = (message: string, type: ToastType = 'info') => {
  window.dispatchEvent(new CustomEvent('add-toast', { detail: { message, type } }));
};
