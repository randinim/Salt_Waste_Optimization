/**
 * Authentication DTOs
 * Data Transfer Objects for authentication-related requests and responses
 */

/**
 * User role enumeration
 */
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  SALTSOCIETY = 'SALTSOCIETY',
  SELLER = 'SELLER',
  LANDOWNER = 'LANDOWNER',
  VIEWER = 'VIEWER',
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Login request DTO
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response DTO
 */
export interface LoginResponse {
  user: User;
  accessToken: string;  // Backend returns "accessToken" not "token"
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * Token refresh request DTO
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Token refresh response DTO
 */
export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * Logout request DTO
 */
export interface LogoutRequest {
  refreshToken?: string;
}

/**
 * Validate token response DTO
 */
export interface ValidateTokenResponse {
  valid: boolean;
  user?: User;
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
