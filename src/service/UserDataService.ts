import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/UserTypes';
import { API_CONFIG } from '../config/api';
import { ApiService } from './ApiService';
import { MOCK_MODE } from '../config/env';
import { MockDataService } from './MockDataService';

/**
 * User Data Service
 *
 * Handles user data fetching, current user information, and user discovery.
 * Follows Single Responsibility Principle - only handles user data concerns.
 */
export class UserDataService {

  /**
   * Get current user information from token
   * @returns Promise<User | null>
   */
  static async getCurrentUser(): Promise<User | null> {
    if (MOCK_MODE) {
      const user = await MockDataService.getUser();
      if (__DEV__) console.log('UserDataService - [MOCK] Returning mock user:', user?.username);
      return user;
    }

    try {
      const token = await this.getStoredToken();
      if (!token) {
        if (__DEV__) {
          console.log('UserDataService - No stored token found for getCurrentUser');
        }
        return null;
      }

      const userData = await ApiService.get<User>(API_CONFIG.ENDPOINTS.USERS.ME, token);

      if (__DEV__) {
        console.log('UserDataService - Successfully fetched current user:', userData);
      }

      return userData;
    } catch (error) {
      this.logError('getCurrentUser', error);

      // If network error or server unreachable, don't clear token
      if (this.isNetworkError(error)) {
        return null;
      }

      // For other errors, clear token as it might be invalid
      await this.clearToken();
      return null;
    }
  }

  /**
   * Check if error is a network error
   * @private
   */
  private static isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message.includes('fetch');
  }

  /**
   * Get stored authentication token
   * @private
   */
  private static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      if (__DEV__) {
        console.error('UserDataService - Error getting stored token:', error);
      }
      return null;
    }
  }

  /**
   * Clear stored authentication token
   * @private
   */
  private static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (__DEV__) {
        console.log('UserDataService - Token cleared successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('UserDataService - Error clearing token:', error);
      }
    }
  }

  /**
   * Centralized error logging
   * @private
   */
  private static logError(operation: string, error: any, context?: any): void {
    if (!__DEV__) return;

    console.error(`UserDataService - ${operation} error:`, error);

    if (error instanceof Error) {
      console.error(`UserDataService - Error message:`, error.message);
    }

    if (context) {
      console.error('UserDataService - Context:', context);
    }

    if (this.isNetworkError(error)) {
      console.error('UserDataService - Network connectivity issue detected');
    }
  }
}
