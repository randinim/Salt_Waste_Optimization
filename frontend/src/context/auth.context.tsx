/**
 * Authentication Context
 * Global authentication state management using React Context
 */

'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authController } from '@/services/auth.controller';
import { User, AuthState, LoginRequest } from '@/dtos/auth.dto';
import { ApiError } from '@/lib/api-error';
import { tokenStorage, storage } from '@/lib/storage.utils';

/**
 * Auth context type
 */
interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    error: string | null;
}

/**
 * Create context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });
    const [error, setError] = useState<string | null>(null);

    /**
     * Initialize auth state on mount
     */
    useEffect(() => {
        initializeAuth();
    }, []);

    /**
     * Initialize authentication state from localStorage
     */
    const initializeAuth = () => {
        try {
            console.log('🔄 Initializing auth from localStorage...');
            const token = tokenStorage.getToken();
            const storedUser = storage.get<User>('auth_user');

            console.log('Token exists:', !!token);
            console.log('Stored user exists:', !!storedUser);

            if (!token) {
                console.log('❌ No token found');
                setState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
                return;
            }

            if (storedUser) {
                // Restore user from storage immediately
                console.log('✅ Restoring session from localStorage:', storedUser.email);
                setState({
                    user: storedUser,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                // Token exists but no user data - clear everything
                console.warn('⚠️ Token exists but no user data found, clearing session');
                tokenStorage.clearTokens();
                setState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } catch (err) {
            console.error('❌ Error initializing auth:', err);
            // Unexpected error
            tokenStorage.clearTokens();
            storage.remove('auth_user');
            setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    };

    /**
     * Login function
     */
    const login = useCallback(async (credentials: LoginRequest) => {
        try {
            setError(null);
            setState((prev) => ({ ...prev, isLoading: true }));

            console.log('🔐 Attempting login...', credentials.email);
            const response = await authController.login(credentials);
            console.log('✅ Login response:', response);

            setState({
                user: response.user,
                token: response.accessToken,  // Use accessToken from backend
                isAuthenticated: true,
                isLoading: false,
            });

            // Store user in localStorage for persistence
            storage.set('auth_user', response.user);

            // Redirect based on user role
            console.log('🚀 Redirecting user with role:', response.user.role);
            redirectAfterLogin(response.user);
        } catch (err) {
            console.error('❌ Login error:', err);
            const errorMessage = err instanceof ApiError
                ? err.message
                : 'Login failed. Please try again.';

            setError(errorMessage);
            setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
            throw err;
        }
    }, []);

    /**
     * Logout function
     */
    const logout = useCallback(async () => {
        try {
            await authController.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
            setError(null);
            storage.remove('auth_user');
            router.push('/');
        }
    }, [router]);

    /**
     * Refresh user data
     */
    const refreshUser = useCallback(async () => {
        try {
            const user = await authController.getCurrentUser();
            setState((prev) => ({ ...prev, user }));
        } catch (err) {
            console.error('Failed to refresh user:', err);
            // If refresh fails, logout
            await logout();
        }
    }, [logout]);

    /**
     * Redirect after login based on user role
     */
    const redirectAfterLogin = (user: User) => {
        switch (user.role) {
            case 'SUPERADMIN':
            case 'ADMIN':
                router.push('/vision/dashboard/camera');
                break;
            case 'SALTSOCIETY':
                router.push('/crystal/dashboard/production');
                break;
            case 'SELLER':
                router.push('/compass/seller-dashboard');
                break;
            case 'LANDOWNER':
                router.push('/compass/landowner-dashboard');
                break;
            default:
                router.push('/');
        }
    };

    const value: AuthContextType = {
        ...state,
        login,
        logout,
        refreshUser,
        error,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
