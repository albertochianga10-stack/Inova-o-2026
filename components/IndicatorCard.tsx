
import React from 'react';
import { INDICATOR_INFO } from '../constants';
import { formatPercent } from '../utils/finance';

interface IndicatorCardProps {
  id: keyof typeof INDICATOR_INFO;
  value: number;
  isPercent?: boolean;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ id, value, isPercent = false }) => {
  const info = INDICATOR_INFO[id];
  const displayValue = isPercent ? formatPercent(value) : value.toFixed(2);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{info.label}</h3>
        <span className={`px-2 py-1 rounded text-xs font-bold ${value > 1 || (isPercent && value > 0.1) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {value > 1 || (isPercent && value > 0.1) ? 'Saudável' : 'Atenção'}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-800 mb-2">
        {displayValue}
      </div>
      <p className="text-slate-500 text-xs leading-relaxed">
        {info.description}
      </p>
      <div className="mt-4 pt-3 border-t border-slate-50 flex gap-4 text-[10px] text-slate-400">
        <div><span className="font-semibold text-emerald-500">Ideal:</span> {info.good}</div>
        <div><span className="font-semibold text-rose-400">Risco:</span> {info.bad}</div>
      </div>
    </div>
  );
};

export default IndicatorCard;
