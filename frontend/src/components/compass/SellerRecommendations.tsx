import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Sparkles } from 'lucide-react';

export interface SellerRecommendation {
  seller_id: number;
  sellerName: string;
  confidence: number;
  confidence_percentage: string;
  ranking: 1 | 2 | 3;
}

interface SellerRecommendationsProps {
  recommendations: SellerRecommendation[];
  onSelectSeller?: (sellerId: number) => void;
}

export const SellerRecommendations: React.FC<SellerRecommendationsProps> = ({
  recommendations,
  onSelectSeller
}) => {
  const topRecommendations = recommendations.slice(0, 3);

  const getRankingBadge = (ranking: 1 | 2 | 3) => {
    const badges = {
      1: { icon: '🥇', color: 'green' as const },
      2: { icon: '🥈', color: 'blue' as const },
      3: { icon: '🥉', color: 'amber' as const }
    };
    return badges[ranking];
  };

  return (
    <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      {/* Compact Header */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-200">
        <Sparkles className="text-purple-600" size={14} />
        <h3 className="text-sm font-bold text-slate-900">Seller Recommendations</h3>
      </div>

      {/* Ultra Compact List */}
      <div className="space-y-1.5">
        {topRecommendations.map((rec) => {
          const badge = getRankingBadge(rec.ranking);

          return (
            <div
              key={rec.seller_id}
              className="flex items-center gap-2 p-1.5 rounded-md bg-white border border-slate-200 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => onSelectSeller?.(rec.seller_id)}
            >
              {/* Ranking */}
              <Badge color={badge.color} size="sm">
                {badge.icon}
              </Badge>

              {/* Seller Name */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {rec.sellerName}
                </p>
              </div>

              {/* Confidence */}
              <div className="text-right">
                <p className="text-xs font-bold text-purple-600">
                  {rec.confidence_percentage}
                </p>
                <p className="text-[9px] text-slate-500 uppercase">Confidence</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
