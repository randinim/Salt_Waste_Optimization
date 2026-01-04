import React, { useState } from 'react';
import { Deal, DealStatus } from '@/dtos/compass/types';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Package, Clock, CheckCircle, XCircle, FileText, Printer } from 'lucide-react';

interface DealsSectionProps {
  deals: Deal[];
  userRole: 'seller' | 'landowner';
  onGenerateInvoice: (deal: Deal) => void;
}

export const DealsSection: React.FC<DealsSectionProps> = ({ deals, userRole, onGenerateInvoice }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const activeDeals = deals.filter(d => 
    d.status === DealStatus.NEGOTIATING || d.status === DealStatus.ACCEPTED
  );
  const completedDeals = deals.filter(d => 
    d.status === DealStatus.COMPLETED || d.status === DealStatus.REJECTED
  );

  const displayDeals = activeTab === 'active' ? activeDeals : completedDeals;

  const getStatusBadge = (status: DealStatus) => {
    switch (status) {
      case DealStatus.NEGOTIATING:
        return <Badge color="amber" size="sm"><Clock size={12} className="mr-1" />Negotiating</Badge>;
      case DealStatus.ACCEPTED:
        return <Badge color="green" size="sm"><CheckCircle size={12} className="mr-1" />Accepted</Badge>;
      case DealStatus.COMPLETED:
        return <Badge color="blue" size="sm"><CheckCircle size={12} className="mr-1" />Completed</Badge>;
      case DealStatus.REJECTED:
        return <Badge color="red" size="sm"><XCircle size={12} className="mr-1" />Rejected</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-slate-800">My Deals</h2>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition ${
              activeTab === 'active'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Active ({activeDeals.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition ${
              activeTab === 'completed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Completed ({completedDeals.length})
          </button>
        </div>
      </div>

      {displayDeals.length === 0 ? (
        <Card className="py-8 text-center">
          <Package size={40} className="mx-auto text-slate-300 mb-2" />
          <p className="text-slate-500">No {activeTab} deals yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">
                      {userRole === 'seller' ? deal.landownerName : deal.sellerName}
                    </h3>
                    {getStatusBadge(deal.status)}
                  </div>
                  <p className="text-xs text-slate-500">
                    Deal #{deal.id.slice(0, 8)} • {formatDate(deal.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-500 mb-0.5">Quantity</p>
                  <p className="font-semibold text-slate-900">{deal.quantity} tons</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-500 mb-0.5">Price/Ton</p>
                  <p className="font-semibold text-slate-900">LKR {deal.pricePerTon.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500">Total Revenue</p>
                  <p className="text-base font-bold text-blue-700">
                    ₨{deal.totalPrice.toLocaleString()}
                  </p>
                </div>

                {/* Show Net Profit if available (landowner deals) */}
                {deal.netProfit !== undefined && (
                  <>
                    {deal.productionCosts !== undefined && (
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">Production Costs</p>
                        <p className="text-sm font-semibold text-red-600">
                          -₨{deal.productionCosts.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <p className="text-sm font-bold text-slate-700">Net Profit</p>
                      <p className={`text-xl font-bold ${deal.netProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ₨{deal.netProfit.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}

                {deal.status === DealStatus.COMPLETED && (
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => onGenerateInvoice(deal)}
                      className="h-9 px-3 text-sm w-full"
                    >
                      <FileText size={16} />
                      Generate Invoice
                    </Button>
                  </div>
                )}
              </div>

              {deal.negotiations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Latest Message:</p>
                  <p className="text-sm text-slate-700 italic">
                    "{deal.negotiations[deal.negotiations.length - 1].message}"
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};
