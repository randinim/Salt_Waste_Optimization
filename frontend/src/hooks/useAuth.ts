/**
 * useAuth Hook
 * Custom hook for accessing authentication context
 */

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/auth.context';

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
