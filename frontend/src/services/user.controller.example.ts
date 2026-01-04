/**
 * Example: Creating a User Controller
 * This file demonstrates how to create a new API controller
 */

import { BaseController } from './base-controller';
import { API_CONFIG } from '@/lib/api.config';

/**
 * User DTOs (normally in src/dtos/user.dto.ts)
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Controller
 * Example controller for user-related API calls
 */
class UserController extends BaseController {
  constructor() {
    super(''); // Empty base URL since we use full endpoint paths
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return this.post<UserResponse, CreateUserRequest>(
      API_CONFIG.ENDPOINTS.USER.CREATE,
      data
    );
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    return this.put<UserResponse, UpdateUserRequest>(
      `${API_CONFIG.ENDPOINTS.USER.UPDATE}/${id}`,
      data
    );
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<UserResponse> {
    return this.get<UserResponse>(`${API_CONFIG.ENDPOINTS.USER.GET}/${id}`);
  }

  /**
   * Get all users with pagination
   */
  async getUsers(page = 1, limit = 10): Promise<UserResponse[]> {
    return this.get<UserResponse[]>(API_CONFIG.ENDPOINTS.USER.GET, {
      params: { page, limit },
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    return this.delete<void>(`${API_CONFIG.ENDPOINTS.USER.DELETE}/${id}`);
  }
}

/**
 * Export singleton instance
 */
export const userController = new UserController();

/**
 * Usage Example in a Component:
 * 
 * import { useApi } from '@/hooks/useApi';
 * import { userController } from '@/services/user.controller.example';
 * 
 * function UserList() {
 *   const { data: users, error, isLoading, execute } = useApi(
 *     userController.getUsers.bind(userController)
 *   );
 * 
 *   useEffect(() => {
 *     execute(1, 20); // page 1, 20 items
 *   }, []);
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 * 
 *   return (
 *     <ul>
 *       {users?.map(user => (
 *         <li key={user.id}>{user.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */
