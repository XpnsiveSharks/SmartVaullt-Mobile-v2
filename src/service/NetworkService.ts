import { API_CONFIG } from '../config/api';
import { ApiService } from './ApiService';

/**
 * Network Service
 *
 * Handles connectivity testing, common API patterns, and network utilities.
 * Follows Single Responsibility Principle - only handles network concerns.
 */
export class NetworkService {
  private static readonly API_TIMEOUT = 10000; // 10 seconds

  /**
   * Test basic connectivity to the server
   * @returns Promise<boolean> - true if server is reachable
   */
  static async testConnectivity(): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log('NetworkService - Testing basic connectivity...');
      }

      // Use ApiService.getPublic for connectivity testing
      await ApiService.getPublic('/');

      if (__DEV__) {
        console.log('NetworkService - Server connectivity test result: success');
      }

      return true;
    } catch (connectivityError) {
      if (__DEV__) {
        console.error('NetworkService - Server connectivity failed:', connectivityError);
        console.error('NetworkService - This suggests the server is not reachable from the React Native app');
      }
      return false;
    }
  }

  /**
   * Test API endpoint availability
   * @param endpoint - API endpoint to test (e.g., '/users/login')
   * @returns Promise<boolean> - true if endpoint is accessible
   */
  static async testEndpoint(endpoint: string): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log('NetworkService - Testing endpoint:', endpoint);
      }

      await ApiService.getPublic('/health', {}); // Use a simple health check endpoint

      if (__DEV__) {
        console.log('NetworkService - Endpoint test result: success');
      }

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('NetworkService - Endpoint test failed:', error);
      }
      return false;
    }
  }

  /**
   * Get network status information
   * @returns Promise<NetworkStatus>
   */
  static async getNetworkStatus(): Promise<NetworkStatus> {
    const baseUrlReachable = await this.testConnectivity();
    const loginEndpointReachable = await this.testEndpoint('/users/login');

    return {
      isOnline: baseUrlReachable,
      apiAvailable: loginEndpointReachable,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create standardized API headers with optional authentication
   * @param includeAuth - Whether to include authentication headers
   * @param customHeaders - Additional custom headers
   * @returns Promise<Record<string, string>>
   */
  static async createApiHeaders(
    includeAuth: boolean = true,
    customHeaders: Record<string, string> = {}
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (includeAuth) {
      try {
        // Try to get token from AuthService (avoiding circular dependency)
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('NetworkService - Could not get auth token for headers:', error);
        }
      }
    }

    return headers;
  }

  /**
   * Handle API errors in a standardized way
   * @param error - The error that occurred
   * @param operation - Description of the operation that failed
   * @returns Error - Processed error with context
   */
  static processApiError(error: any, operation: string): Error {
    if (__DEV__) {
      console.error(`NetworkService - API error during ${operation}:`, error);
    }

    if (error instanceof Error) {
      return error;
    }

    if (this.isNetworkError(error)) {
      return new Error(`Network error occurred during ${operation}`);
    }

    if (this.isTimeoutError(error)) {
      return new Error(`Request timeout during ${operation}`);
    }

    return new Error(`Unknown error occurred during ${operation}`);
  }

  /**
   * Check if error is network-related
   * @private
   */
  private static isNetworkError(error: any): boolean {
    return error instanceof TypeError &&
           'message' in error &&
           error.message.includes('fetch');
  }

  /**
   * Check if error is timeout-related
   * @private
   */
  private static isTimeoutError(error: any): boolean {
    return error instanceof Error &&
           (error.name === 'AbortError' ||
            error.message.includes('timeout') ||
            error.message.includes('network'));
  }
}

/**
 * Network status interface
 */
export interface NetworkStatus {
  isOnline: boolean;
  apiAvailable: boolean;
  timestamp: string;
}