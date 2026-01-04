"use client"
import { DealsDialog } from "@/components/compass/DealsDialog";
import { InvoiceModal } from "@/components/compass/InvoiceModal";
import { NegotiationModal } from "@/components/compass/NegotiationModal";
import { NotificationBell } from "@/components/compass/NotificationBell";
import { NotificationPanel } from "@/components/compass/NotificationPanel";
import { PredictionCharts } from "@/components/compass/PredictionCharts";
import { SellerRecommendations } from "@/components/compass/SellerRecommendations";
import { Button } from "@/components/compass/Button";
import { Badge } from "@/components/compass/Badge";
import { Slider } from "@/components/compass/Slider";
import { Card } from "@/components/compass/Card";
import { useApp } from "@/context/compass/AppContext";
import { Deal, DealStatus, NotificationType, SeasonData, SellerOffer } from "@/dtos/compass/types";
import { mockDemandPredictions, mockHarvestPredictions, mockPricePredictions } from "@/sample-data/compass/mockPredictionData";
import { mockSellerRecommendations } from "@/sample-data/compass/mockSellerRecommendations";
import { ArrowRight, Leaf, Menu, Package, Phone, TrendingUp, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

// Mock Data
const seasonData: SeasonData[] = [
  { day: 'Mon', production: 8, rainfall: false },
  { day: 'Tue', production: 10, rainfall: false },
  { day: 'Wed', production: 12, rainfall: false },
  { day: 'Thu', production: 11, rainfall: true },
  { day: 'Fri', production: 9, rainfall: true },
  { day: 'Sat', production: 7, rainfall: false },
  { day: 'Sun', production: 6, rainfall: false },
];

const PREDICTED_TONS = 70; // Increased to allow more deals
const LANDOWNER_ID = 'landowner_001';
const LANDOWNER_NAME = 'Ravi Kumara';

export const LandownerDashboard: React.FC = () => {
  const {
    sellerOffers,
    createDeal,
    addNotification,
    getUserDeals,
    getUserNotifications,
    getUnreadCount
  } = useApp();

  // UI State
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<SellerOffer | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Simulator State
  const [fertCost, setFertCost] = useState(8000);
  const [laborCost, setLaborCost] = useState(15000);
  const [transportCost, setTransportCost] = useState(5000);

  // Quantity allocation for each seller (offer.id -> tons)
  const [quantityAllocations, setQuantityAllocations] = useState<Record<string, number>>({});

  // Get user-specific data
  const myDeals = getUserDeals(LANDOWNER_ID, 'landowner');
  const myNotifications = getUserNotifications(LANDOWNER_ID);
  const unreadCount = getUnreadCount();

  // Calculate available tons (total - sold in deals)
  const soldTons = myDeals
    .filter(d => d.status === DealStatus.ACCEPTED || d.status === DealStatus.COMPLETED)
    .reduce((sum, d) => sum + d.quantity, 0);
  const totalAvailableTons = PREDICTED_TONS - soldTons;

  // Calculate allocated tons from current UI selections
  const allocatedTons = Object.values(quantityAllocations).reduce((sum, qty) => sum + qty, 0);
  const remainingTons = totalAvailableTons - allocatedTons;

  // Initialize mock offers on first load
  useEffect(() => {
    if (sellerOffers.length === 0) {
      const mockOffers: Omit<SellerOffer, 'id' | 'timestamp'>[] = [
        { sellerId: 'seller_001', name: 'Lanka Salt Limited', pricePerTon: 1900, demandTons: 25, reliability: 'High', isRecommended: true },
        { sellerId: 'seller_002', name: 'Puttalam Salt Ltd (Palavi Saltern)', pricePerTon: 1850, demandTons: 30, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_003', name: 'National Salt Limited', pricePerTon: 1800, demandTons: 20, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_004', name: 'Raigam / Raigam (brand)', pricePerTon: 1750, demandTons: 15, reliability: 'Medium', isRecommended: false },
        { sellerId: 'seller_005', name: 'Ceylon Salt (Cargills Lanka)', pricePerTon: 1700, demandTons: 40, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_006', name: 'Keells Super (John Keells)', pricePerTon: 1820, demandTons: 18, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_007', name: 'Cargills (Food City Lanka)', pricePerTon: 1780, demandTons: 22, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_008', name: 'Glomark', pricePerTon: 1650, demandTons: 35, reliability: 'Medium', isRecommended: false },
      ];
      // mockOffers.forEach(offer => publishOffer(offer));
    }
  }, []);

  // Always use all 8 sellers for landowner dashboard (not filtered by published offers)
  const displayOffers: SellerOffer[] = [
    { id: '1', sellerId: 'seller_001', name: 'Lanka Salt Limited', pricePerTon: 1900, demandTons: 25, reliability: 'High', isRecommended: true, timestamp: Date.now() },
    { id: '2', sellerId: 'seller_002', name: 'Puttalam Salt Ltd (Palavi Saltern)', pricePerTon: 1850, demandTons: 30, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '3', sellerId: 'seller_003', name: 'National Salt Limited', pricePerTon: 1800, demandTons: 20, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '4', sellerId: 'seller_004', name: 'Raigam / Raigam (brand)', pricePerTon: 1750, demandTons: 15, reliability: 'Medium', isRecommended: false, timestamp: Date.now() },
    { id: '5', sellerId: 'seller_005', name: 'Ceylon Salt (Cargills Lanka)', pricePerTon: 1700, demandTons: 40, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '6', sellerId: 'seller_006', name: 'Keells Super (John Keells)', pricePerTon: 1820, demandTons: 18, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '7', sellerId: 'seller_007', name: 'Cargills (Food City Lanka)', pricePerTon: 1780, demandTons: 22, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '8', sellerId: 'seller_008', name: 'Glomark', pricePerTon: 1650, demandTons: 35, reliability: 'Medium', isRecommended: false, timestamp: Date.now() },
  ];

  // Calculate profit for each offer
  const totalCost = fertCost + laborCost + transportCost;

  const offersWithProfit = displayOffers.map(offer => {
    const sellingTons = Math.min(totalAvailableTons, offer.demandTons);
    const revenue = sellingTons * offer.pricePerTon;
    const profit = revenue - totalCost;
    const profitPerTon = sellingTons > 0 ? profit / sellingTons : 0;

    return {
      ...offer,
      sellingTons,
      revenue,
      profit,
      profitPerTon,
    };
  }).sort((a, b) => b.pricePerTon - a.pricePerTon); // Sort by highest price first

  // Threshold for "high demand" - sellers wanting more than this won't be highlighted
  const HIGH_DEMAND_THRESHOLD = 30;

  // Find best profit offer (excluding sellers who need high amounts of tons)
  const eligibleOffers = offersWithProfit.filter(offer => offer.demandTons <= HIGH_DEMAND_THRESHOLD);
  const bestProfitOffer = eligibleOffers.length > 0 
    ? eligibleOffers.reduce((best, current) =>
        current.profit > best.profit ? current : best
      , eligibleOffers[0])
    : offersWithProfit[0]; // Fallback to any offer if all are high-demand

  // Selection state
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const selectedOfferData = selectedOfferId
    ? offersWithProfit.find(o => o.id === selectedOfferId)
    : bestProfitOffer;

  const handleSellNow = () => {
    // Collect all allocations where quantity > 0
    const allocatedOffers = displayOffers
      .filter(offer => (quantityAllocations[offer.id] || 0) > 0)
      .map(offer => ({
        ...offer,
        allocatedQty: quantityAllocations[offer.id] || 0,
        revenue: (quantityAllocations[offer.id] || 0) * offer.pricePerTon
      }));

    if (allocatedOffers.length === 0) {
      alert('Please allocate quantities to at least one seller');
      return;
    }

    // Calculate totals
    const totalRevenue = allocatedOffers.reduce((sum, offer) => sum + offer.revenue, 0);
    const totalProfit = totalRevenue - totalCost; // Costs deducted only once from total

    // Create a combined offer object for the modal
    const combinedOffer = {
      ...allocatedOffers[0],
      allocations: allocatedOffers,
      totalRevenue,
      totalProfit
    };
    
    setSelectedOffer(combinedOffer);
    setShowNegotiationModal(true);
  };

  const handleAcceptDeal = (dealData: {
    sellerId: string;
    sellerName: string;
    landownerId: string;
    landownerName: string;
    quantity: number;
    pricePerTon: number;
    totalPrice: number;
    productionCosts?: number;
    netProfit?: number;
  }) => {
    createDeal({
      ...dealData,
      status: DealStatus.ACCEPTED,
      negotiations: [{
        from: 'landowner',
        message: 'Deal accepted',
        timestamp: Date.now()
      }],
    });

    // Notify seller
    addNotification({
      type: NotificationType.DEAL_ACCEPTED,
      title: 'Deal Accepted!',
      message: `${dealData.landownerName} accepted your offer for ${dealData.quantity} tons at LKR ${dealData.pricePerTon}/ton`,
      dealId: '', // Will be set by context
      recipientId: dealData.sellerId,
      read: false,
    });

    // Reset allocations to refresh the page
    setQuantityAllocations({});
    
    setShowNegotiationModal(false);
    setSelectedOffer(null);
  };

  const handleGenerateInvoice = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowInvoice(true);
  };

  return (
    <div className="pb-24 lg:pb-6 bg-slate-50 min-h-screen">

      {/* Zone 1: Decision Strip */}
      <div className="sticky top-0 z-20 bg-emerald-600 text-white shadow-lg rounded-b-3xl lg:rounded-none px-6 py-5">
        {/* Landowner Name */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/30">
          <Users size={18} />
          <h2 className="text-base font-bold">{LANDOWNER_NAME}</h2>
        </div>

        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <span className="text-xl font-semibold uppercase tracking-wider">Landowner Dashboard</span>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Deals Button */}
            <button
              onClick={() => setShowDeals(true)}
              className="relative bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-colors group"
              aria-label="My Deals"
            >
              <Package className="w-8 h-8 text-white" />
              {myDeals.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {myDeals.length}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <NotificationBell count={unreadCount} onClick={() => setShowNotifications(true)} />

          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 flex-1">
            <p className="text-xs text-emerald-100">Total Available</p>
            <p className="font-bold text-lg">{totalAvailableTons.toFixed(1)} tons</p>
          </div>
          {allocatedTons > 0 && (
            <div className="bg-purple-500/20 backdrop-blur-md rounded-lg px-3 py-2 flex-1 border border-purple-300">
              <p className="text-xs text-purple-100">Allocated</p>
              <p className="font-bold text-lg text-white">{allocatedTons.toFixed(1)} tons</p>
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 flex-1">
            <p className="text-xs text-emerald-100">Remaining</p>
            <p className="font-bold text-lg">{remainingTons.toFixed(1)} tons</p>
          </div>
          <div   onClick={() => setShowDeals(true)} className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 flex-1">
            <p className="text-xs text-emerald-100">My Deals</p>
            <p className="font-bold text-lg">{myDeals.length} active</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 flex-1">
            <p className="text-xs text-emerald-100">Best Profit</p>
            <p className="font-bold text-lg">LKR {(bestProfitOffer.profit ).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="px-4 mt-6 lg:px-6 lg:max-w-[1600px] lg:mx-auto">

        {/* Main Grid - 2 columns on desktop */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">

          {/* LEFT COLUMN - Analytics */}
          <div className="space-y-6" id="analytics-section">

            {/* Prediction Analytics Section */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">AI-Powered Analytics</h2>

              {/* AI Seller Recommendations */}
              <div className="mb-4">
                <SellerRecommendations 
                  recommendations={mockSellerRecommendations} 
                  onSelectSeller={(sellerId) => {
                    // Map numeric seller_id back to our seller offer IDs
                    const sellerIdMap: Record<number, string> = {
                      1: 'seller_001',
                      2: 'seller_002',
                      6: 'seller_006'
                    };
                    const sellerStringId = sellerIdMap[sellerId];
                    const offer = displayOffers.find(o => o.sellerId === sellerStringId);
                    if (offer) {
                      setSelectedOfferId(offer.id);
                      // Scroll to offers section
                      document.getElementById('offers-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
              </div>

              {/* Prediction Charts */}
              <PredictionCharts
                harvestData={mockHarvestPredictions}
                priceData={mockPricePredictions}
                demandData={mockDemandPredictions}
              />
            </section>

            {/* My Deals Section - Now removed, accessible via dialog */}
            {/* DealsSection removed */}
          </div>

          {/* RIGHT COLUMN - Offers */}
          <div className="space-y-6" id="offers-section">

            {/* Unified Offer Comparison */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Compare Offers & Calculate Profit</h2>

              {/* Cost Inputs - Compact Grid Layout */}
              <Card className="mb-4 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-600" />
                  Your Production Costs & Net Profit
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Fertilizer</label>
                    <input
                      type="number"
                      value={fertCost}
                      onChange={(e) => setFertCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={0}
                      max={20000}
                      step={500}
                    />
                    <p className="text-xs text-slate-500">LKR {fertCost.toLocaleString()}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Labor</label>
                    <input
                      type="number"
                      value={laborCost}
                      onChange={(e) => setLaborCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={0}
                      max={30000}
                      step={1000}
                    />
                    <p className="text-xs text-slate-500">LKR {laborCost.toLocaleString()}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Transport</label>
                    <input
                      type="number"
                      value={transportCost}
                      onChange={(e) => setTransportCost(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={0}
                      max={10000}
                      step={500}
                    />
                    <p className="text-xs text-slate-500">LKR {transportCost.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-600">Total Costs:</span>
                  <span className="text-lg font-bold text-slate-900">LKR {totalCost.toLocaleString()}</span>
                </div>

                {/* Show Revenue and Profit when allocations exist */}
                {allocatedTons > 0 && (() => {
                  const totalRevenue = Object.entries(quantityAllocations)
                    .reduce((sum, [offerId, qty]) => {
                      const offer = offersWithProfit.find(o => o.id === offerId);
                      return sum + (offer ? qty * offer.pricePerTon : 0);
                    }, 0);
                  const netProfit = totalRevenue - totalCost;
                  const profitColor = netProfit > 0 ? 'text-emerald-700' : 'text-red-600';

                  return (
                    <>
                      <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between items-center bg-blue-50 -mx-4 px-4 py-2">
                        <span className="text-sm font-semibold text-blue-700">Total Revenue:</span>
                        <span className="text-lg font-bold text-blue-700">₨{totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t-2 border-purple-300 flex justify-between items-center bg-gradient-to-r from-purple-50 to-blue-50 -mx-4 px-4 py-2.5">
                        <span className="text-base font-bold text-slate-800">Net Profit:</span>
                        <span className={`text-xl font-bold ${profitColor}`}>
                          ₨{netProfit.toLocaleString()}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </Card>

              {/* Offer Cards Grid */}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600 pt-3">
                    Showing {showAllOffers ? offersWithProfit.length : Math.min(3, offersWithProfit.length)} of {offersWithProfit.length} offers • Available: {remainingTons.toFixed(1)} tons
                  </p>
                  {offersWithProfit.length > 3 && (
                    <button
                      onClick={() => setShowAllOffers(!showAllOffers)}
                      className="text-blue-600 text-sm font-semibold flex items-center hover:underline"
                    >
                      {showAllOffers ? 'Show Less' : `View All (${offersWithProfit.length})`}
                      <ArrowRight size={14} className="ml-1" />
                    </button>
                  )}
                </div>

                {(showAllOffers ? offersWithProfit : offersWithProfit.slice(0, 3)).map((offer) => {
                  const isBest = offer.id === bestProfitOffer.id;
                  const isSelected = offer.id === selectedOfferId || (!selectedOfferId && isBest);
                  
                  // Get allocated quantity for this offer
                  const allocatedQty = quantityAllocations[offer.id] || 0;
                  const maxAllowable = Math.min(offer.demandTons, remainingTons + allocatedQty);
                  
                  // Calculate profit based on allocated quantity
                  const actualRevenue = allocatedQty * offer.pricePerTon;
                  const actualProfit = actualRevenue - totalCost;
                  const profitColor = actualProfit > 0 ? 'text-emerald-700' : 'text-red-600';

                  const handleQuantityChange = (newQty: number) => {
                    const validQty = Math.max(0, Math.min(newQty, maxAllowable));
                    setQuantityAllocations(prev => ({
                      ...prev,
                      [offer.id]: validQty
                    }));
                  };

                  return (
                    <Card
                      key={offer.id}
                      className={`transition-all py-2 px-3 ${isSelected
                          ? 'ring-2 ring-blue-500 bg-blue-50/30'
                          : isBest
                            ? 'ring-2 ring-emerald-500 bg-emerald-50/20'
                            : 'hover:bg-slate-50'
                        } ${allocatedQty > 0 ? 'ring-2 ring-purple-400' : ''}`}
                    >
                      {/* Compact Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm text-slate-900">{offer.name}</h3>
                            {isBest && (
                              <Badge color="green" size="sm">
                                ⭐
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Wants {offer.demandTons}t • {offer.reliability}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-900">
                            {offer.pricePerTon}
                            <span className="text-xs font-normal text-slate-500"> /ton</span>
                          </p>
                        </div>
                      </div>

                      {/* Quantity Allocation Controls */}
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-2">
                        <label className="text-[10px] font-semibold text-blue-700 uppercase mb-1 block">
                          I want to sell
                        </label>
                        <div className="flex items-center gap-2">
                          
                          <input
                            type="number"
                            value={allocatedQty}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(parseFloat(e.target.value) || 0);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-center px-2 py-1 border border-slate-300 rounded text-sm font-bold bg-white"
                            min={0}
                            max={maxAllowable}
                            step={0.5}
                          />
                          <span className="text-xs font-semibold text-slate-600">tons</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(allocatedQty - 1);
                            }}
                            className="w-7 h-7 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center"
                            disabled={allocatedQty <= 0}
                          >
                            -
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(allocatedQty + 1);
                            }}
                            className="w-7 h-7 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold flex items-center justify-center"
                            disabled={allocatedQty >= maxAllowable}
                          >
                            +
                          </button>
                        </div>
                        {allocatedQty > 0 && (
                          <p className="text-[10px] text-blue-600 mt-1">
                            ✓ {allocatedQty}t allocated
                          </p>
                        )}
                      </div>

                      {/* Revenue Summary - Only show if allocated */}
                      {allocatedQty > 0 && (
                        <div className="bg-emerald-50 rounded-md p-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-700">Revenue:</span>
                            <span className="text-lg font-bold text-emerald-700">
                              ₨{actualRevenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

            </section>
          </div>

        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(true)}
        className="fixed bottom-20 right-4 lg:hidden bg-emerald-600 text-white p-4 rounded-full shadow-2xl z-40 hover:bg-emerald-700 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Slide-out Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Quick Navigation</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => {
                  document.getElementById('offers-section')?.scrollIntoView({ behavior: 'smooth' });
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="font-semibold text-slate-900">Compare Offers</div>
                <div className="text-xs text-slate-500">{offersWithProfit.length} available</div>
              </button>

              <button
                onClick={() => {
                  document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="font-semibold text-slate-900">My Deals</div>
                <div className="text-xs text-slate-500">{myDeals.length} deals</div>
              </button>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    handleSellNow();
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  disabled={remainingTons <= 0}
                >
                  <Phone size={18} /> Sell Now
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-xl z-50 safe-area-pb lg:hidden">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="success"
            fullWidth
            className="text-lg"
            onClick={handleSellNow}
            disabled={remainingTons <= 0}
          >
            <Phone size={20} /> Sell Now
          </Button>
        </div>
      </div>

      {/* Desktop Action Button */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        <Button
          variant="success"
          className="text-lg px-8 h-14 shadow-2xl"
          onClick={handleSellNow}
          disabled={remainingTons <= 0}
        >
          <Phone size={20} /> Sell Now
        </Button>
      </div>

      {/* Modals */}
      {showNegotiationModal && selectedOffer && (
        <NegotiationModal
          offer={selectedOffer}
          landownerName={LANDOWNER_NAME}
          landownerId={LANDOWNER_ID}
          availableTons={totalAvailableTons}
          productionCosts={totalCost}
          onAccept={handleAcceptDeal}
          onReject={() => setShowNegotiationModal(false)}
          onClose={() => setShowNegotiationModal(false)}
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

      {showDeals && (
        <DealsDialog
          deals={myDeals}
          userRole="landowner"
          onClose={() => setShowDeals(false)}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}


      {showInvoice && selectedDeal && (
        <InvoiceModal
          deal={selectedDeal}
          userRole="landowner"
          onClose={() => setShowInvoice(false)}
        />
      )}

    </div>
  );
};

export default LandownerDashboard;

