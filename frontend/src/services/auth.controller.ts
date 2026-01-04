/**
 * Authentication Controller
 * Handles all authentication-related API calls
 */

import { BaseController } from './base-controller';
import { API_CONFIG } from '@/lib/api.config';
import { tokenStorage } from '@/lib/storage.utils';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  ValidateTokenResponse,
  User,
} from '@/dtos/auth.dto';

/**
 * Authentication controller class
 */
class AuthController extends BaseController {
  constructor() {
    super(''); // Empty base URL since we use full endpoint paths
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse, LoginRequest>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    console.log('🔑 Auth Controller - Login response:', response);
    console.log('🔑 Access Token in response:', response.accessToken);
    console.log('🔑 Refresh token in response:', response.refreshToken);

    // Store tokens
    if (response.accessToken) {
      console.log('💾 Saving access token to localStorage...');
      tokenStorage.setToken(response.accessToken);
      console.log('✅ Token saved!');
    } else {
      console.warn('⚠️ No accessToken in response!');
    }
    
    if (response.refreshToken) {
      console.log('💾 Saving refresh token to localStorage...');
      tokenStorage.setRefreshToken(response.refreshToken);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(request?: LogoutRequest): Promise<void> {
    try {
      await this.post<void, LogoutRequest>(
        API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
        request || { refreshToken: tokenStorage.getRefreshToken() || undefined }
      );
    } finally {
      // Always clear tokens, even if API call fails
      tokenStorage.clearTokens();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
    const token = refreshToken || tokenStorage.getRefreshToken();
    
    if (!token) {
      throw new Error('No refresh token available');
    }

    const response = await this.post<RefreshTokenResponse, RefreshTokenRequest>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refreshToken: token }
    );

    // Update stored tokens
    if (response.token) {
      tokenStorage.setToken(response.token);
    }
    if (response.refreshToken) {
      tokenStorage.setRefreshToken(response.refreshToken);
    }

    return response;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return this.get<User>(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  /**
   * Validate token
   */
  async validateToken(token?: string): Promise<ValidateTokenResponse> {
    const authToken = token || tokenStorage.getToken();
    
    if (!authToken) {
      return { valid: false };
    }

    try {
      const response = await this.post<ValidateTokenResponse>(
        API_CONFIG.ENDPOINTS.AUTH.VALIDATE,
        { token: authToken }
      );
      return response;
    } catch {
      return { valid: false };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenStorage.hasToken();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return tokenStorage.getToken();
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    tokenStorage.clearTokens();
  }
}

/**
 * Singleton instance
 */
export const authController = new AuthController();
