"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Deal, Notification, SellerOffer, LandownerSummary, DealStatus, NotificationType } from '@/dtos/compass/types';

interface AppState {
  deals: Deal[];
  notifications: Notification[];
  sellerOffers: SellerOffer[];
  landowners: LandownerSummary[];
  currentUserId: string;
}

interface AppContextType extends AppState {
  createDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  publishOffer: (offer: Omit<SellerOffer, 'id' | 'timestamp'>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadCount: () => number;
  getUserDeals: (userId: string, role: 'seller' | 'landowner') => Deal[];
  getUserNotifications: (userId: string) => Notification[];
  setCurrentUserId: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DEALS: 'brinex_deals',
  NOTIFICATIONS: 'brinex_notifications',
  OFFERS: 'brinex_offers',
  LANDOWNERS: 'brinex_landowners',
};

// Helper to generate unique IDs
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Load from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Save to localStorage
const saveToStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<Deal[]>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.DEALS, []);
    // Initialize with sample deals if empty
    if (stored.length === 0) {
      return [
        // COMPLETED DEALS (2) - Same seller (Lanka Salt Limited)
        {
          id: 'deal_001',
          sellerId: 'seller_001',
          sellerName: 'Lanka Salt Limited',
          landownerId: 'landowner_001',
          landownerName: 'Ravi Kumara',
          quantity: 15,
          pricePerTon: 1900,
          totalPrice: 28500,
          status: DealStatus.COMPLETED,
          negotiations: [],
          createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
          acceptedAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
          completedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
        },
        {
          id: 'deal_002',
          sellerId: 'seller_001',
          sellerName: 'Lanka Salt Limited',
          landownerId: 'landowner_002',
          landownerName: 'Saman Perera',
          quantity: 12,
          pricePerTon: 1900,
          totalPrice: 22800,
          status: DealStatus.COMPLETED,
          negotiations: [],
          createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
          acceptedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
          completedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },

        // ACTIVE DEALS (5) - All different sellers (including one for seller_001)
        {
          id: 'deal_003',
          sellerId: 'seller_002',
          sellerName: 'Puttalam Salt Ltd (Palavi Saltern)',
          landownerId: 'landowner_001',
          landownerName: 'Ravi Kumara',
          quantity: 8,
          pricePerTon: 1850,
          totalPrice: 14800,
          status: DealStatus.ACCEPTED,
          negotiations: [],
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
          acceptedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        },
        {
          id: 'deal_004',
          sellerId: 'seller_006',
          sellerName: 'Keells Super (John Keells)',
          landownerId: 'landowner_003',
          landownerName: 'Nimal Silva',
          quantity: 10,
          pricePerTon: 1820,
          totalPrice: 18200,
          status: DealStatus.ACCEPTED,
          negotiations: [],
          createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
          acceptedAt: Date.now() - 12 * 60 * 60 * 1000,
        },
        {
          id: 'deal_005',
          sellerId: 'seller_003',
          sellerName: 'National Salt Limited',
          landownerId: 'landowner_001',
          landownerName: 'Ravi Kumara',
          quantity: 6,
          pricePerTon: 1800,
          totalPrice: 10800,
          status: DealStatus.ACCEPTED,
          negotiations: [],
          createdAt: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
          acceptedAt: Date.now() - 2 * 60 * 60 * 1000,
        },
        {
          id: 'deal_006',
          sellerId: 'seller_007',
          sellerName: 'Cargills (Food City Lanka)',
          landownerId: 'landowner_004',
          landownerName: 'K. Gunaratne',
          quantity: 5,
          pricePerTon: 1780,
          totalPrice: 8900,
          status: DealStatus.ACCEPTED,
          negotiations: [],
          createdAt: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
          acceptedAt: Date.now() - 4 * 60 * 60 * 1000,
        },
        {
          id: 'deal_007',
          sellerId: 'seller_001',
          sellerName: 'Lanka Salt Limited',
          landownerId: 'landowner_005',
          landownerName: 'Prasad Fernando',
          quantity: 14,
          pricePerTon: 1900,
          totalPrice: 26600,
          status: DealStatus.ACCEPTED,
          negotiations: [],
          createdAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
          acceptedAt: Date.now() - 3 * 60 * 60 * 1000,
        },
      ];
    }
    return stored;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, [])
  );

  const [sellerOffers, setSellerOffers] = useState<SellerOffer[]>(() => {
    const stored = loadFromStorage(STORAGE_KEYS.OFFERS, []);
    // Initialize with sample offers if empty
    if (stored.length === 0) {
      return [
        { id: '1', sellerId: 'seller_001', name: 'Lanka Salt Limited', pricePerTon: 1900, demandTons: 25, reliability: 'High', isRecommended: true, timestamp: Date.now() },
        { id: '2', sellerId: 'seller_002', name: 'Puttalam Salt Ltd (Palavi Saltern)', pricePerTon: 1850, demandTons: 30, reliability: 'High', isRecommended: false, timestamp: Date.now() },
        { id: '3', sellerId: 'seller_003', name: 'National Salt Limited', pricePerTon: 1800, demandTons: 20, reliability: 'High', isRecommended: false, timestamp: Date.now() },
        { id: '4', sellerId: 'seller_004', name: 'Raigam / Raigam (brand)', pricePerTon: 1750, demandTons: 15, reliability: 'Medium', isRecommended: false, timestamp: Date.now() },
        { id: '5', sellerId: 'seller_005', name: 'Ceylon Salt (Cargills Lanka)', pricePerTon: 1700, demandTons: 40, reliability: 'High', isRecommended: false, timestamp: Date.now() },
        { id: '6', sellerId: 'seller_006', name: 'Keells Super (John Keells)', pricePerTon: 1820, demandTons: 18, reliability: 'High', isRecommended: false, timestamp: Date.now() },
        { id: '7', sellerId: 'seller_007', name: 'Cargills (Food City Lanka)', pricePerTon: 1780, demandTons: 22, reliability: 'High', isRecommended: false, timestamp: Date.now() },
        { id: '8', sellerId: 'seller_008', name: 'Glomark', pricePerTon: 1650, demandTons: 35, reliability: 'Medium', isRecommended: false, timestamp: Date.now() },
      ];
    }
    return stored;
  });

  const [landowners, setLandowners] = useState<LandownerSummary[]>(() =>
    loadFromStorage(STORAGE_KEYS.LANDOWNERS, [])
  );
  const [currentUserId, setCurrentUserId] = useState<string>('user_001');

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DEALS, deals);
  }, [deals]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.OFFERS, sellerOffers);
  }, [sellerOffers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LANDOWNERS, landowners);
  }, [landowners]);

  const createDeal = (dealData: Omit<Deal, 'id' | 'createdAt'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: generateId(),
      createdAt: Date.now(),
    };
    setDeals(prev => [...prev, newDeal]);

    // Update landowner available tons
    setLandowners(prev => prev.map(lo =>
      lo.id === dealData.landownerId
        ? { ...lo, availableTons: lo.availableTons - dealData.quantity }
        : lo
    ));
  };

  const updateDeal = (dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(deal =>
      deal.id === dealId ? { ...deal, ...updates } : deal
    ));
  };

  const publishOffer = (offerData: Omit<SellerOffer, 'id' | 'timestamp'>) => {
    const newOffer: SellerOffer = {
      ...offerData,
      id: generateId(),
      timestamp: Date.now(),
    };
    setSellerOffers(prev => [...prev, newOffer]);
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: generateId(),
      timestamp: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read && n.recipientId === currentUserId).length;
  };

  const getUserDeals = (userId: string, role: 'seller' | 'landowner'): Deal[] => {
    return deals.filter(deal =>
      role === 'seller' ? deal.sellerId === userId : deal.landownerId === userId
    );
  };

  const getUserNotifications = (userId: string): Notification[] => {
    return notifications.filter(n => n.recipientId === userId);
  };

  const value: AppContextType = {
    deals,
    notifications,
    sellerOffers,
    landowners,
    currentUserId,
    createDeal,
    updateDeal,
    publishOffer,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount,
    getUserDeals,
    getUserNotifications,
    setCurrentUserId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
