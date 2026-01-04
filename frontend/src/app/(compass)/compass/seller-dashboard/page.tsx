
"use client"
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Share,
  ArrowRight,
  Info,
  Check,
  Target,
  CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Card } from '@/components/compass/Card';
import { Button } from '@/components/compass/Button';
import { Badge } from '@/components/compass/Badge';
import { Slider } from '@/components/compass/Slider';
import { MarketTrendData, LandownerSummary, NotificationType, DealStatus, Deal } from '@/dtos/compass/types';
import { useApp } from '@/context/compass/AppContext';
import { NotificationPanel } from '@/components/compass/NotificationPanel';
import { DealsSection } from '@/components/compass/DealsSection';
import { InvoiceModal } from '@/components/compass/InvoiceModal';
import { NotificationBell } from '@/components/compass/NotificationBell';
import { OfferPreviewModal } from '@/components/compass/OfferPreviewModal';

// Monthly demand trend (past 12 months)
const demandTrend: MarketTrendData[] = [
  { month: 'Jan', demand: 42 },
  { month: 'Feb', demand: 38 },
  { month: 'Mar', demand: 45 },
  { month: 'Apr', demand: 52 },
  { month: 'May', demand: 65 },
  { month: 'Jun', demand: 78 },
  { month: 'Jul', demand: 85 },
  { month: 'Aug', demand: 92 },
  { month: 'Sep', demand: 88 },
  { month: 'Oct', demand: 75 },
  { month: 'Nov', demand: 68 },
  { month: 'Dec', demand: 95 }, // Current month - highest
];

const MARKET_AVG_PRICE = 1700; // LKR per ton
const SELLER_ID = 'seller_001';
const SELLER_NAME = 'Lanka Salt Limited';

export const SellerDashboard: React.FC = () => {
  const {
    sellerOffers,
    publishOffer,
    addNotification,
    landowners,
    getUserDeals,
    getUserNotifications,
    getUnreadCount,
  } = useApp();

  // UI State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAllLandowners, setShowAllLandowners] = useState(false);
  const [offerPublished, setOfferPublished] = useState(false);
  const [showOfferPreview, setShowOfferPreview] = useState(false);
  const [isEditingOffer, setIsEditingOffer] = useState(false);

  // Offer State
  const [offerPrice, setOfferPrice] = useState(1850);
  const [targetQuantity, setTargetQuantity] = useState(40); // tons

  // Get user-specific data
  const myDeals = getUserDeals(SELLER_ID, 'seller');
  const myNotifications = getUserNotifications(SELLER_ID);
  const unreadCount = getUnreadCount();

  // Find seller's current published offer
  const myCurrentOffer = sellerOffers.find(offer => offer.sellerId === SELLER_ID);

  // Initialize offer form with current offer data if it exists
  useEffect(() => {
    if (myCurrentOffer && !isEditingOffer) {
      setOfferPrice(myCurrentOffer.pricePerTon);
      setTargetQuantity(myCurrentOffer.demandTons);
    }
  }, [myCurrentOffer, isEditingOffer]);

  // Calculate deal statistics
  const securedTons = myDeals
    .filter(d => d.status === DealStatus.ACCEPTED || d.status === DealStatus.COMPLETED)
    .reduce((sum, d) => sum + d.quantity, 0);
  const remainingTons = Math.max(0, targetQuantity - securedTons);
  const progressPercentage = targetQuantity > 0 ? (securedTons / targetQuantity) * 100 : 0;

  // Mock landowners if none exist
  const displayLandowners: LandownerSummary[] = landowners.length > 0 ? landowners : [
    { id: 'landowner_001', name: 'Ravi Kumara', productionTons: 12.5, availableTons: 12.5, harvestDate: 'Today', priority: true },
    { id: 'landowner_002', name: 'Saman Perera', productionTons: 8.2, availableTons: 8.2, harvestDate: 'Tomorrow', priority: true },
    { id: 'landowner_003', name: 'Nimal Silva', productionTons: 15.0, availableTons: 15.0, harvestDate: 'Dec 20', priority: false },
    { id: 'landowner_004', name: 'K. Gunaratne', productionTons: 5.5, availableTons: 5.5, harvestDate: 'Dec 21', priority: false },
    { id: 'landowner_005', name: 'Prasad Fernando', productionTons: 18.0, availableTons: 18.0, harvestDate: 'Dec 22', priority: false },
  ];

  const visibleLandowners = showAllLandowners ? displayLandowners : displayLandowners.slice(0, 3);

  // Calculations
  const totalInvestment = offerPrice * targetQuantity;
  const estimatedProfit = (250 * targetQuantity); // Estimated profit margin per ton
  const margin = (estimatedProfit / totalInvestment) * 100;

  const marketPosition = offerPrice > MARKET_AVG_PRICE
    ? { label: 'Above Market', color: 'green' as const }
    : offerPrice === MARKET_AVG_PRICE
      ? { label: 'At Market', color: 'amber' as const }
      : { label: 'Below Market', color: 'red' as const };

  const handleShowOfferPreview = () => {
    if (offerPrice < 1500 || offerPrice > 2000) {
      alert('Price must be between LKR 1500-2000 per ton');
      return;
    }
    setShowOfferPreview(true);
  };

  const handleConfirmPublishOffer = () => {
    publishOffer({
      sellerId: SELLER_ID,
      name: SELLER_NAME,
      pricePerTon: offerPrice,
      demandTons: targetQuantity,
      reliability: 'High',
      isRecommended: offerPrice >= MARKET_AVG_PRICE,
    });

    // Notify all landowners
    displayLandowners.forEach(landowner => {
      addNotification({
        type: NotificationType.NEW_OFFER,
        title: 'New Offer Available',
        message: `${SELLER_NAME} is offering LKR ${offerPrice}/ton for ${targetQuantity} tons`,
        recipientId: landowner.id,
        read: false,
      });
    });

    setShowOfferPreview(false);
    setOfferPublished(true);
    setTimeout(() => setOfferPublished(false), 3000);
  };

  const handleGenerateInvoice = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowInvoice(true);
  };

  return (
    <div className="pb-28 lg:pb-6 bg-slate-50 min-h-screen">

      {/* Zone 1: Summary Strip */}
      <div className="bg-white p-5 pb-8 rounded-b-3xl lg:rounded-none shadow-sm border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          {/* Company Name */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Package className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-900">{SELLER_NAME}</h2>
          </div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-slate-500 text-sm font-medium">Market Demand</p>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-bold text-slate-900">95 <span className="text-lg text-slate-400 font-normal">tons</span></h1>
                <Badge color="green" size="sm">
                  <TrendingUp size={14} className="mr-1" /> Up
                </Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <NotificationBell count={unreadCount} onClick={() => setShowNotifications(true)} />
              <div className="text-right">
                <p className="text-slate-500 text-sm font-medium">Your Target</p>
                <p className="text-2xl font-bold text-slate-700">{targetQuantity} <span className="text-sm font-normal text-slate-400">tons</span></p>
              </div>
            </div>
          </div>

          {/* Deal Progress Stats & Chart - Flex on Desktop */}
          <div className="space-y-4 lg:flex lg:gap-6 lg:space-y-0">

            {/* Deal Progress Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-4 lg:flex-1">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Deal Progress</span>
                </div>
                <span className="text-xs font-bold text-blue-600">{progressPercentage.toFixed(0)}% Complete</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-emerald-200">
                  <div className="flex items-center gap-1 mb-0.5">
                    <CheckCircle size={14} className="text-emerald-600" />
                    <p className="text-xs text-emerald-700 font-medium">Secured</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-700">{securedTons} <span className="text-xs font-normal">tons</span></p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-blue-200">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Target size={14} className="text-blue-600" />
                    <p className="text-xs text-blue-700 font-medium">Remaining</p>
                  </div>
                  <p className="text-xl font-bold text-blue-700">{remainingTons} <span className="text-xs font-normal">tons</span></p>
                </div>
              </div>
            </div>

            {/* Monthly Demand Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 lg:flex-1">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Monthly Demand Trend (Tons)</p>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demandTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      label={{ value: 'Tons', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value} tons`, 'Demand']}
                    />
                    <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                      {demandTrend.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 11 ? '#2563eb' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="px-4 mt-6 lg:px-6 lg:max-w-[1600px] lg:mx-auto">

        {/* Main Grid - 2 columns on desktop */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">

          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* Zone 2: Current Offer or Create Offer */}
            <section>
              {myCurrentOffer && !isEditingOffer ? (
                // Show Current Published Offer
                <>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-slate-800">Current Offer</h2>
                    <button
                      onClick={() => setIsEditingOffer(true)}
                      className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                      Edit Offer
                    </button>
                  </div>

                  <Card className="border-l-4 border-l-emerald-600 shadow-md bg-gradient-to-r from-emerald-50 to-white">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle size={20} className="text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Published & Active</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Price per Ton</p>
                        <p className="text-3xl font-bold text-slate-900">
                          {myCurrentOffer.pricePerTon}
                          <span className="text-sm font-normal text-slate-500"> LKR/ton</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Target Quantity</p>
                        <p className="text-3xl font-bold text-slate-900">
                          {myCurrentOffer.demandTons}
                          <span className="text-sm font-normal text-slate-500"> tons</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Total Investment</p>
                      <p className="text-xl font-bold text-blue-600">
                        LKR {(myCurrentOffer.pricePerTon * myCurrentOffer.demandTons).toLocaleString()}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 text-center">
                      ✓ Visible to all landowners
                    </p>
                  </Card>
                </>
              ) : (
                // Show Create/Edit Offer Form
                <>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-slate-800">
                      {isEditingOffer ? 'Edit Offer' : 'Create Offer'}
                    </h2>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Info size={12} /> Market Avg: LKR {MARKET_AVG_PRICE}/ton
                    </span>
                  </div>

                  {isEditingOffer && (
                    <button
                      onClick={() => setIsEditingOffer(false)}
                      className="text-sm text-slate-600 mb-3 hover:text-slate-900"
                    >
                      ← Cancel Edit
                    </button>
                  )}

                  <Card className="border-l-4 border-l-blue-600 shadow-md">
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-slate-500 font-medium">Buying Price (per ton)</label>
                        <Badge color={marketPosition.color} size="sm">{marketPosition.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setOfferPrice(p => Math.max(1500, p - 50))}
                          className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-bold text-2xl flex items-center justify-center active:bg-slate-200"
                        >-</button>
                        <div className="flex-1 text-center">
                          <span className="text-4xl font-bold text-slate-900">{offerPrice}</span>
                          <span className="block text-xs text-slate-400 font-medium uppercase tracking-wide">LKR / TON</span>
                        </div>
                        <button
                          onClick={() => setOfferPrice(p => Math.min(2000, p + 50))}
                          className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center active:bg-blue-200"
                        >+</button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <Slider
                        label="Target Quantity"
                        value={targetQuantity}
                        min={5}
                        max={100}
                        step={5}
                        unit="tons"
                        onChange={setTargetQuantity}
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4 border border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500">Total Investment</p>
                        <p className="font-semibold text-slate-700">LKR {(totalInvestment / 1000).toFixed(0)}k</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Est. Profit</p>
                        <p className="font-bold text-emerald-600 text-lg">LKR {(estimatedProfit / 1000).toFixed(0)}k</p>
                      </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-2">
                      Higher prices increase landowner acceptance rate.
                    </p>
                  </Card>
                </>
              )}
            </section>

            {/* Zone 3: Landowner List */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-slate-800">Available Harvests</h2>
                <button
                  onClick={() => setShowAllLandowners(!showAllLandowners)}
                  className="text-blue-600 text-sm font-semibold flex items-center"
                >
                  {showAllLandowners ? 'Show Less' : 'View All'} <ArrowRight size={14} className="ml-1" />
                </button>
              </div>

              <div className="space-y-3">
                {visibleLandowners.map(lo => (
                  <Card key={lo.id} className="py-3 px-4 flex items-center justify-between active:scale-[0.99] transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Users size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{lo.name}</h4>
                        <p className="text-xs text-slate-500">Harvest: {lo.harvestDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-slate-900 text-lg">{lo.availableTons} <span className="text-xs font-normal text-slate-400">t</span></span>
                      {lo.priority && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">High Priority</span>}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* My Deals Section */}
            <DealsSection
              deals={myDeals}
              userRole="seller"
              onGenerateInvoice={handleGenerateInvoice}
            />
          </div>

        </div>
      </div>

      {/* Sticky Bottom Actions - Mobile Only */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 lg:hidden">
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex justify-between items-center text-xs text-blue-800 font-medium">
          <span>Offer: {offerPrice} LKR/ton</span>
          <span>Buying: {targetQuantity} tons</span>
        </div>
        <div className="p-4 flex gap-3 max-w-md mx-auto">
          <Button
            variant="primary"
            fullWidth
            className="text-lg shadow-blue-300"
            onClick={handleShowOfferPreview}
          >
            {offerPublished ? (
              <><Check size={20} /> Offer Published!</>
            ) : (
              <><Share size={20} /> Publish Offer</>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Action Button */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          className="text-lg px-8 h-14 shadow-2xl"
          onClick={handleShowOfferPreview}
        >
          {offerPublished ? (
            <><Check size={20} /> Offer Published!</>
          ) : (
            <><Share size={20} /> Publish Offer</>
          )}
        </Button>
      </div>

      {/* Modals */}
      {showOfferPreview && (
        <OfferPreviewModal
          pricePerTon={offerPrice}
          quantity={targetQuantity}
          totalInvestment={totalInvestment}
          estimatedProfit={estimatedProfit}
          marketAvgPrice={MARKET_AVG_PRICE}
          onConfirm={handleConfirmPublishOffer}
          onCancel={() => setShowOfferPreview(false)}
        />
      )}

      {showNotifications && (
        <NotificationPanel
          notifications={myNotifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={(id) => {
            // Handled by context
          }}
          onMarkAllAsRead={() => {
            // Handled by context
          }}
        />
      )}

      {showInvoice && selectedDeal && (
        <InvoiceModal
          deal={selectedDeal}
          userRole="seller"
          onClose={() => setShowInvoice(false)}
        />
      )}

    </div>
  );
};

export default SellerDashboard;

