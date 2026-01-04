/**
 * Protected Route Component
 * Higher-order component for protecting routes that require authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/dtos/auth.dto';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole[];
    redirectTo?: string;
}

/**
 * Protected Route Component
 */
export function ProtectedRoute({
    children,
    requiredRole,
    redirectTo = '/',
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('🛡️ ProtectedRoute check:', { isLoading, isAuthenticated, user: user?.email, requiredRole });

        if (!isLoading) {
            // Not authenticated - redirect to login
            if (!isAuthenticated) {
                console.log('❌ Not authenticated, redirecting to:', redirectTo);
                router.push(redirectTo);
                return;
            }

            // Check role if required
            if (requiredRole && user && !requiredRole.includes(user.role)) {
                console.log('❌ Role check failed. User role:', user.role, 'Required:', requiredRole);
                router.push('/unauthorized');
            } else if (requiredRole && user) {
                console.log('✅ Role check passed. User role:', user.role);
            }
        }
    }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Role check failed
    if (requiredRole && user && !requiredRole.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
