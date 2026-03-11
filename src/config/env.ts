/**
 * Environment Configuration
 *
 * Type-safe environment variable handling with fallbacks.
 * Centralizes all environment-related configuration.
 */

/**
 * MOCK_MODE — when true, all API calls are bypassed and data is served from AsyncStorage.
 * Set to false when the backend is available.
 */
export const MOCK_MODE = false;

import { log } from '../utils/logger';

export interface EnvConfig {
  BASE_URL: string;
  DEFAULT_VAULT_ID: number;
  DEFAULT_PREFIXES: string[];
  EVENT_WS_URL?: string;
  NODE_ENV: 'development' | 'production' | 'test';
  // Redis Configuration
  REDIS_URL?: string;
  ENABLE_REDIS?: string;
  REDIS_STREAMING?: string;
  REDIS_CACHING?: string;
}

/**
 * Get environment variable with type safety
 */
function getEnvVar(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

/**
 * Get number environment variable with fallback
 */
function getEnvNumber(key: string, fallback: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : fallback;
}

/**
 * Get array environment variable with fallback
 */
function getEnvArray(key: string, fallback: string[]): string[] {
  const value = process.env[key];
  return value ? value.split(',') : fallback;
}

/**
 * Environment configuration object
 */
export const ENV_CONFIG: EnvConfig = {
  BASE_URL: getEnvVar('EXPO_PUBLIC_BASE_URL', 'https://inscriptional-myrtie-oversecurely.ngrok-free.dev'),
  DEFAULT_VAULT_ID: getEnvNumber('EXPO_PUBLIC_DEFAULT_VAULT_ID', 2),
  DEFAULT_PREFIXES: getEnvArray('EXPO_PUBLIC_DEFAULT_PREFIXES', ['Locked', 'Tamper', 'DUAL', 'Failure', 'NFC']),
  EVENT_WS_URL: process.env.EXPO_PUBLIC_EVENT_WS_URL,
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  // Redis Configuration
  REDIS_URL: process.env.REDIS_URL,
  ENABLE_REDIS: process.env.ENABLE_REDIS,
  REDIS_STREAMING: process.env.REDIS_STREAMING,
  REDIS_CACHING: process.env.REDIS_CACHING,
} as const;

/**
 * Development logging for environment variables
 */
if (__DEV__) {
  log.debug('Env', 'Environment configuration loaded', {
    BASE_URL: ENV_CONFIG.BASE_URL,
    DEFAULT_VAULT_ID: ENV_CONFIG.DEFAULT_VAULT_ID,
    DEFAULT_PREFIXES: ENV_CONFIG.DEFAULT_PREFIXES,
    NODE_ENV: ENV_CONFIG.NODE_ENV,
  });
}
