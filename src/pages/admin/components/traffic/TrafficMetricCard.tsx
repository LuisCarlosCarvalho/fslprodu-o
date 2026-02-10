import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrafficMetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  icon?: React.ReactNode;
  suffix?: string;
}

export function TrafficMetricCard({ label, value, subValue, trend, icon, suffix }: TrafficMetricCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-bold ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {isPositive ? <TrendingUp size={16} /> : isNegative ? <TrendingDown size={16} /> : <Minus size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-gray-900">{value}{suffix}</h3>
        </div>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );
}
