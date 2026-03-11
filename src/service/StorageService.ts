import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
import { log } from '../utils/logger';

/**
 * Storage Service
 * 
 * Handles token and data storage operations using AsyncStorage.
 * Follows Single Responsibility Principle - only handles storage concerns.
 */
export class StorageService {
  /**
   * Get access token from storage
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      log.debug('Storage', 'Token retrieved', { hasToken: !!token });
      return token;
    } catch (error) {
      log.error('Storage', 'Error retrieving token', error);
      return null;
    }
  }

  /**
   * Store access token
   */
  static async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, token);
      log.debug('Storage', 'Token stored successfully');
    } catch (error) {
      log.error('Storage', 'Error storing token', error);
      throw new Error('Failed to store access token');
    }
  }

  /**
   * Get refresh token from storage
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      log.debug('Storage', 'Refresh token retrieved', { hasToken: !!token });
      return token;
    } catch (error) {
      log.error('Storage', 'Error retrieving refresh token', error);
      return null;
    }
  }

  /**
   * Store refresh token
   */
  static async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, token);
      log.debug('Storage', 'Refresh token stored successfully');
    } catch (error) {
      log.error('Storage', 'Error storing refresh token', error);
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Remove access token
   */
  static async removeAccessToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      log.debug('Storage', 'Token removed');
    } catch (error) {
      log.error('Storage', 'Error removing token', error);
    }
  }

  /**
   * Remove all auth tokens
   */
  static async removeAllTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
        API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      log.debug('Storage', 'All tokens removed');
    } catch (error) {
      log.error('Storage', 'Error removing tokens', error);
    }
  }

  /**
   * Clear all storage
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      log.debug('Storage', 'All data cleared');
    } catch (error) {
      log.error('Storage', 'Error clearing storage', error);
    }
  }

  /**
   * Get current user ID from JWT token
   */
  static async getCurrentUserId(): Promise<number | null> {
    try {
      const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) return null;
      
      // Parse JWT token to get user ID
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.user_id || payload.sub || null;
    } catch (error) {
      log.error('Storage', 'Error getting user ID from token', error);
      return null;
    }
  }
}
