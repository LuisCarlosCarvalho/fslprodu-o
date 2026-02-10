import React from 'react';
import { Info, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface PaymentScoreBarProps {
  score: number;
}

export const PaymentScoreBar: React.FC<PaymentScoreBarProps> = ({ score }) => {
  const getStatus = (s: number) => {
    if (s <= 30) return { 
      label: 'Alto Risco', 
      color: 'bg-red-500', 
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: ShieldAlert,
      message: 'Cliente com histórico de atrasos ou restrições. Métodos de pagamento limitados.'
    };
    if (s <= 70) return { 
      label: 'Risco Médio', 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: AlertTriangle,
      message: 'Cliente confiável, mas com algumas observações. Liberação parcial de crédito.'
    };
    return { 
      label: 'Excelente Pagador', 
      color: 'bg-green-500', 
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: ShieldCheck,
      message: 'Cliente com histórico impecável. Todos os métodos de pagamento liberados.'
    };
  };

  const status = getStatus(score);
  const Icon = status.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${status.bgColor} ${status.textColor}`}>
            Score Financeiro: {score}/100
          </span>
          <div className="group relative">
            <Info size={14} className="text-gray-300 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-2xl">
              <p className="font-bold mb-1">Entenda o Score:</p>
              {status.message}
            </div>
          </div>
        </div>
        <span className={`text-xs font-bold ${status.textColor}`}>{status.label}</span>
      </div>

      <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-50">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-1 shadow-lg ${status.color}`}
          style={{ width: `${score}%` }}
        >
          <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 mt-2">
        <Icon size={16} className={status.textColor} />
        <p className="text-[10px] text-gray-500 leading-tight">
          {status.message}
        </p>
      </div>
    </div>
  );
};
