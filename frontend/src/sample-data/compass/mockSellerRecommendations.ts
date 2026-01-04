import { SellerRecommendation } from '@/components/compass/SellerRecommendations';

// Mock AI-powered seller recommendations matching the actual model output
// Model returns: seller_id, confidence (0-1), confidence_percentage
// We need to map seller_id to seller names from our existing seller list
export const mockSellerRecommendations: SellerRecommendation[] = [
  {
    seller_id: 1,
    sellerName: 'Lanka Salt Limited',
    confidence: 0.278,
    confidence_percentage: '27.80%',
    ranking: 1
  },
  {
    seller_id: 2,
    sellerName: 'Puttalam Salt Ltd (Palavi Saltern)',
    confidence: 0.223,
    confidence_percentage: '22.30%',
    ranking: 2
  },
  {
    seller_id: 6,
    sellerName: 'Keells Super (John Keells)',
    confidence: 0.167,
    confidence_percentage: '16.70%',
    ranking: 3
  }
];
