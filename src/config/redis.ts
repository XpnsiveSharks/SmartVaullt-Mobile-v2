/**
 * Redis Configuration Service
 * 
 * Handles Redis connection configuration and environment-specific settings.
 * Follows SOC: Separates configuration concerns from business logic.
 */

import { ENV_CONFIG } from './env';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  keepAlive?: number;
  connectTimeout?: number;
  commandTimeout?: number;
}

export interface RedisConnectionOptions {
  enableRedis: boolean;
  config: RedisConfig;
  logStreaming: {
    enabled: boolean;
    channels: string[];
  };
  caching: {
    enabled: boolean;
    ttl: number; // Time to live in seconds
  };
}

class RedisConfigService {
  private static instance: RedisConfigService;
  private config: RedisConnectionOptions;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  public static getInstance(): RedisConfigService {
    if (!RedisConfigService.instance) {
      RedisConfigService.instance = new RedisConfigService();
    }
    return RedisConfigService.instance;
  }

  /**
   * Load Redis configuration from environment and defaults
   */
  private loadConfiguration(): RedisConnectionOptions {
    const baseUrl = ENV_CONFIG.BASE_URL;
    const isDevelopment = __DEV__;
    
    // Parse Redis URL if provided, otherwise use defaults
    const redisUrl = ENV_CONFIG.REDIS_URL || 'redis://localhost:6379';
    const url = new URL(redisUrl);
    
    return {
      enableRedis: ENV_CONFIG.ENABLE_REDIS !== 'false',
      config: {
        host: url.hostname || 'localhost',
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
        db: parseInt(url.pathname?.slice(1)) || 0,
        retryDelayOnFailover: isDevelopment ? 100 : 200,
        maxRetriesPerRequest: isDevelopment ? 3 : 5,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: isDevelopment ? 5000 : 10000,
        commandTimeout: isDevelopment ? 3000 : 5000,
      },
      logStreaming: {
        enabled: ENV_CONFIG.REDIS_STREAMING !== 'false',
        channels: [
          'new_log:vault_*',
          'log_events:*',
          'security_events:*'
        ],
      },
      caching: {
        enabled: ENV_CONFIG.REDIS_CACHING !== 'false',
        ttl: isDevelopment ? 300 : 3600, // 5 minutes in dev, 1 hour in prod
      },
    };
  }

  /**
   * Get current Redis configuration
   */
  public getConfig(): RedisConnectionOptions {
    return { ...this.config };
  }

  /**
   * Update Redis configuration (for testing or runtime changes)
   */
  public updateConfig(updates: Partial<RedisConnectionOptions>): void {
    this.config = {
      ...this.config,
      ...updates,
      config: {
        ...this.config.config,
        ...updates.config,
      },
      logStreaming: {
        ...this.config.logStreaming,
        ...updates.logStreaming,
      },
      caching: {
        ...this.config.caching,
        ...updates.caching,
      },
    };
  }

  /**
   * Check if Redis is enabled
   */
  public isRedisEnabled(): boolean {
    return this.config.enableRedis;
  }

  /**
   * Check if log streaming is enabled
   */
  public isLogStreamingEnabled(): boolean {
    return this.config.enableRedis && this.config.logStreaming.enabled;
  }

  /**
   * Check if caching is enabled
   */
  public isCachingEnabled(): boolean {
    return this.config.enableRedis && this.config.caching.enabled;
  }

  /**
   * Get Redis connection string
   */
  public getConnectionString(): string {
    const { host, port, password, db } = this.config.config;
    const auth = password ? `:${password}@` : '';
    const database = db ? `/${db}` : '';
    return `redis://${auth}${host}:${port}${database}`;
  }

  /**
   * Get vault-specific log channel
   */
  public getVaultLogChannel(vaultId: number): string {
    return `new_log:vault_${vaultId}`;
  }

  /**
   * Get security events channel
   */
  public getSecurityEventsChannel(): string {
    return 'security_events:*';
  }

  /**
   * Get log events channel
   */
  public getLogEventsChannel(): string {
    return 'log_events:*';
  }
}

// Export singleton instance
export const redisConfig = RedisConfigService.getInstance();

// Export types for external use
export type { RedisConfig, RedisConnectionOptions };
