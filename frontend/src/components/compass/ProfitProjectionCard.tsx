import React from 'react';
import { TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { ProfitProjection } from '@/dtos/compass/types';

interface ProfitProjectionCardProps {
  projections: ProfitProjection[];
  onViewDetails?: () => void;
}

export const ProfitProjectionCard: React.FC<ProfitProjectionCardProps> = ({ 
  projections,
  onViewDetails 
}) => {
  // Find optimal harvest month
  const optimalProjection = projections.reduce((best, current) => 
    current.projectedProfit > best.projectedProfit ? current : best
  );

  // Calculate profit range
  const profits = projections.map(p => p.projectedProfit);
  const minProfit = Math.min(...profits);
  const maxProfit = Math.max(...profits);

  // Get recommendation color
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'optimal': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'yellow';
      case 'poor': return 'red';
      default: return 'gray';
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    const currentMonth = projections[0];
    const nextMonth = projections[1];
    if (nextMonth && nextMonth.projectedProfit > currentMonth.projectedProfit) {
      return <TrendingUp className="text-emerald-600" size={20} />;
    }
    return <TrendingUp className="text-slate-400 rotate-180" size={20} />;
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="text-emerald-600" size={20} />
            <h3 className="text-lg font-bold text-slate-900">Profit Forecast</h3>
          </div>
          <p className="text-sm text-slate-600">AI-powered harvest optimization</p>
        </div>
        {getTrendIcon()}
      </div>

      {/* Optimal Harvest Month */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">Optimal Harvest</span>
          </div>
          <Badge 
            color={getRecommendationColor(optimalProjection.harvestRecommendation) as any}
            size="sm"
          >
            {optimalProjection.harvestRecommendation.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-emerald-700">{optimalProjection.month}</span>
          <span className="text-sm text-slate-600">2025</span>
        </div>
      </div>

      {/* Profit Projections */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Expected Profit</p>
          <p className="text-xl font-bold text-emerald-700">
            LKR {(optimalProjection.projectedProfit / 1000).toFixed(0)}k
          </p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Revenue Est.</p>
          <p className="text-xl font-bold text-blue-700">
            LKR {(optimalProjection.projectedRevenue / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Profit Range */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 mb-4">
        <p className="text-xs text-slate-600 mb-2">6-Month Profit Range</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Min</p>
            <p className="text-sm font-bold text-slate-700">
              LKR {(minProfit / 1000).toFixed(0)}k
            </p>
          </div>
          <div className="flex-1 mx-3">
            <div className="h-2 bg-gradient-to-r from-yellow-300 via-emerald-400 to-emerald-600 rounded-full" />
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Max</p>
            <p className="text-sm font-bold text-slate-700">
              LKR {(maxProfit / 1000).toFixed(0)}k
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-semibold mb-1">Key Insight</p>
          <p>
            Market prices expected to peak in {optimalProjection.month}. 
            Harvest timing could increase profit by up to LKR {((maxProfit - minProfit) / 1000).toFixed(0)}k 
            compared to off-peak months.
          </p>
        </div>
      </div>

      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          View Detailed Analysis →
        </button>
      )}
    </Card>
  );
};
