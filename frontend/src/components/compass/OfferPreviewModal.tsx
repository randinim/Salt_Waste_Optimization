import React from 'react';
import { X, Package, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface OfferPreviewModalProps {
  pricePerTon: number;
  quantity: number;
  totalInvestment: number;
  estimatedProfit: number;
  marketAvgPrice: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OfferPreviewModal: React.FC<OfferPreviewModalProps> = ({
  pricePerTon,
  quantity,
  totalInvestment,
  estimatedProfit,
  marketAvgPrice,
  onConfirm,
  onCancel,
}) => {
  const isAboveMarket = pricePerTon > marketAvgPrice;
  const priceAdvantage = ((pricePerTon - marketAvgPrice) / marketAvgPrice * 100).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Review Your Offer</h2>
              <p className="text-blue-100 text-sm">This will be visible to all landowners</p>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Offer Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-blue-600" size={20} />
              <h3 className="font-bold text-slate-900">Offer Details</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Price per Ton</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    LKR {pricePerTon.toLocaleString()}
                  </span>
                  <div className="text-xs text-slate-500">
                    Market avg: LKR {marketAvgPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Target Quantity</span>
                <span className="text-xl font-bold text-slate-900">{quantity} tons</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                <span className="text-slate-600 font-medium">Total Investment</span>
                <span className="text-xl font-bold text-slate-900">
                  LKR {totalInvestment.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Market Position */}
          <div className={`rounded-lg p-4 border-2 ${
            isAboveMarket 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-2">
              {isAboveMarket ? (
                <TrendingUp size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-bold mb-1 ${
                  isAboveMarket ? 'text-emerald-800' : 'text-amber-800'
                }`}>
                  {isAboveMarket ? 'Competitive Offer' : 'Below Market Price'}
                </h4>
                <p className={`text-sm ${
                  isAboveMarket ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {isAboveMarket 
                    ? `Your offer is ${priceAdvantage}% above market average. This increases your chances of quick acceptance.`
                    : `Your offer is ${Math.abs(Number(priceAdvantage))}% below market average. Landowners may prefer higher offers.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Expected Profit */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 mb-1">Estimated Profit</p>
                <p className="text-sm text-slate-600">Based on resale margins</p>
              </div>
              <span className="text-2xl font-bold text-emerald-600">
                LKR {(estimatedProfit / 1000).toFixed(0)}k
              </span>
            </div>
          </div>

          {/* Visibility Info */}
          <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
            <Users size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <strong>Visibility:</strong> This offer will be shown to all landowners with available harvests. 
              They can accept your offer directly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button variant="primary" fullWidth onClick={onConfirm} className="h-14 text-lg">
              Publish Offer to Landowners
            </Button>
            <Button variant="outline" fullWidth onClick={onCancel}>
              Edit Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
