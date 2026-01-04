/**
 * Storage Utilities
 * Secure token storage with fallback mechanisms
 */

/**
 * Storage interface for consistent API
 */
interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * In-memory storage fallback for when localStorage is unavailable
 */
class MemoryStorage implements StorageInterface {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Storage manager with fallback support
 */
class StorageManager {
  private storage: StorageInterface;

  constructor() {
    this.storage = this.getAvailableStorage();
  }

  /**
   * Detect available storage mechanism
   */
  private getAvailableStorage(): StorageInterface {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return localStorage;
    } catch {
      console.warn('localStorage not available, using memory storage');
      return new MemoryStorage();
    }
  }

  /**
   * Get item from storage
   */
  get<T = string>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      if (!item) return null;

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item in storage
   */
  set(key: string, value: unknown): void {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  }

  /**
   * Clear all items from storage
   */
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }

  /**
   * Check if key exists in storage
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

/**
 * Singleton instance
 */
export const storage = new StorageManager();

/**
 * Token-specific utilities
 */
export const tokenStorage = {
  /**
   * Get access token
   */
  getToken(): string | null {
    return storage.get<string>('auth_token');
  },

  /**
   * Set access token
   */
  setToken(token: string): void {
    storage.set('auth_token', token);
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return storage.get<string>('refresh_token');
  },

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    storage.set('refresh_token', token);
  },

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    storage.remove('auth_token');
    storage.remove('refresh_token');
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  hasToken(): boolean {
    return storage.has('auth_token');
  },
};
