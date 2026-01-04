export enum UserRole {
  LANDOWNER = 'landowner',
  SELLER = 'seller',
  NONE = 'none',
}

export interface SeasonData {
  day: string;
  production: number;
  rainfall: boolean;
}

export interface SellerOffer {
  id: string;
  sellerId: string;
  name: string;
  pricePerTon: number; // Changed from pricePerKg to pricePerTon
  demandTons: number;
  reliability: 'High' | 'Medium' | 'Low';
  isRecommended?: boolean;
  timestamp: number;
}

export interface MarketTrendData {
  month: string;
  demand: number; // in tons
}

export interface LandownerSummary {
  id: string;
  name: string;
  productionTons: number;
  availableTons: number; // Remaining after deals
  harvestDate: string;
  priority: boolean;
}

export interface NegotiationMessage {
  from: 'seller' | 'landowner';
  message: string;
  counterPrice?: number; // in LKR per ton
  timestamp: number;
}

export enum DealStatus {
  NEGOTIATING = 'negotiating',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export interface Deal {
  id: string;
  sellerId: string;
  sellerName: string;
  landownerId: string;
  landownerName: string;
  quantity: number; // in tons
  pricePerTon: number; // in LKR
  totalPrice: number; // in LKR (revenue)
  productionCosts?: number; // in LKR (optional - for landowner deals)
  netProfit?: number; // in LKR (optional - totalPrice - productionCosts)
  status: DealStatus;
  negotiations: NegotiationMessage[];
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
}

export enum NotificationType {
  NEW_OFFER = 'new_offer',
  DEAL_ACCEPTED = 'deal_accepted',
  DEAL_COMPLETED = 'deal_completed',
  COUNTER_OFFER = 'counter_offer',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  dealId?: string;
  timestamp: number;
  read: boolean;
  recipientId: string; // sellerId or landownerId
}

// Prediction Analytics Types
export interface HarvestPrediction {
  month: string;
  tons: number;
  isPrediction: boolean; // true for future, false for historical
  confidence?: number; // 0-100, for future predictions
}

export interface PricePrediction {
  month: string;
  avgPrice: number; // Average price per ton
  minPrice: number;
  maxPrice: number;
  isPrediction: boolean;
}

export interface DemandPrediction {
  month: string;
  demandTons: number;
  isPrediction: boolean;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ProfitProjection {
  month: string;
  projectedRevenue: number;
  projectedProfit: number;
  harvestRecommendation: 'optimal' | 'good' | 'fair' | 'poor';
}
