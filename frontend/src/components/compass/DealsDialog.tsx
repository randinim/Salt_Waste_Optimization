import React, { useState } from 'react';
import { X, Package, CheckCircle2, Clock } from 'lucide-react';
import { Deal, DealStatus } from '@/dtos/compass/types';
import { DealsSection } from './DealsSection';

interface DealsDialogProps {
  deals: Deal[];
  userRole: 'landowner' | 'seller';
  onClose: () => void;
  onGenerateInvoice: (deal: Deal) => void;
}

export const DealsDialog: React.FC<DealsDialogProps> = ({
  deals,
  userRole,
  onClose,
  onGenerateInvoice
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const activeDeals = deals.filter(d => 
    d.status === DealStatus.ACCEPTED || d.status === DealStatus.NEGOTIATING
  );
  const completedDeals = deals.filter(d => 
    d.status === DealStatus.COMPLETED
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">My Deals</h2>
              <p className="text-sm text-emerald-100">
                {activeDeals.length} active • {completedDeals.length} completed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-3 font-semibold text-sm relative transition-colors ${
                activeTab === 'active'
                  ? 'text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} />
                Active Deals
                {activeDeals.length > 0 && (
                  <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeDeals.length}
                  </span>
                )}
              </div>
              {activeTab === 'active' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-3 font-semibold text-sm relative transition-colors ${
                activeTab === 'completed'
                  ? 'text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Completed
                {completedDeals.length > 0 && (
                  <span className="bg-slate-400 text-white text-xs px-2 py-0.5 rounded-full">
                    {completedDeals.length}
                  </span>
                )}
              </div>
              {activeTab === 'completed' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {activeTab === 'active' ? (
            activeDeals.length > 0 ? (
              <DealsSection
                deals={activeDeals}
                userRole={userRole}
                onGenerateInvoice={onGenerateInvoice}
              />
            ) : (
              <div className="text-center py-12">
                <Clock size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">No Active Deals</p>
                <p className="text-sm text-slate-500 mt-1">
                  Start negotiating with sellers to create deals
                </p>
              </div>
            )
          ) : (
            completedDeals.length > 0 ? (
              <DealsSection
                deals={completedDeals}
                userRole={userRole}
                onGenerateInvoice={onGenerateInvoice}
              />
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">No Completed Deals</p>
                <p className="text-sm text-slate-500 mt-1">
                  Completed deals will appear here
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
