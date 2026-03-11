/**
 * Application Constants
 * 
 * Centralized constants for the application.
 * Separated from API configuration for better organization.
 */

export const APP_CONSTANTS = {
  // API Configuration
  API_TIMEOUT: 10000, // 10 seconds
  
  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
  },
  
  // Default Values
  DEFAULTS: {
    VAULT_ID: 2,
    PREFIXES: ['Locked', 'Tamper', 'DUAL', 'Failure', 'NFC'],
    LOG_LIMIT: 50,
    LOG_OFFSET: 0,
  },
  
  // UI Constants
  UI: {
    ICON_SIZES: {
      SMALL: 16,
      MEDIUM: 20,
      LARGE: 24,
    },
    BORDER_RADIUS: {
      SMALL: 8,
      MEDIUM: 12,
      LARGE: 16,
    },
  },
  
  // Error Messages
  ERRORS: {
    NETWORK_ERROR: 'Network error occurred',
    AUTH_REQUIRED: 'Authentication required',
    INVALID_DATA: 'Invalid data provided',
    UNKNOWN_ERROR: 'An unknown error occurred',
  },
} as const;

// Export individual constants for convenience
export const API_TIMEOUT = APP_CONSTANTS.API_TIMEOUT;
export const STORAGE_KEYS = APP_CONSTANTS.STORAGE_KEYS;
export const DEFAULT_VAULT_ID = APP_CONSTANTS.DEFAULTS.VAULT_ID;
export const DEFAULT_PREFIXES = APP_CONSTANTS.DEFAULTS.PREFIXES;
export const LOG_LIMIT = APP_CONSTANTS.DEFAULTS.LOG_LIMIT;
export const LOG_OFFSET = APP_CONSTANTS.DEFAULTS.LOG_OFFSET;
