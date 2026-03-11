# Redis Logging Integration Guide

This guide explains how to use Redis for logging in the Smart Vault mobile app, following clean architecture principles and best practices.

## Overview

The Redis logging integration provides:
- **Real-time log streaming** from mobile to backend
- **Offline log caching** with automatic synchronization
- **Performance monitoring** and statistics
- **Error handling** and recovery mechanisms
- **Clean architecture** with separation of concerns

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Redis Cache   │    │   Backend API   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Logger    │ │◄──►│ │   Streams   │ │◄──►│ │  LogService │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Cache     │ │◄──►│ │   Pub/Sub   │ │◄──►│ │ EventManager│ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  Streaming  │ │◄──►│ │   Storage   │ │◄──►│ │ WebSockets  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm install ioredis
```

### 2. Basic Setup

```typescript
import { logger } from '../utils/logger';

// Enable Redis logging
logger.enableRedisLogging(
  123, // vaultId
  'mobile-app-001', // deviceId
  456 // userId
);

// Enable offline caching
logger.enableLogCaching(123, 'mobile-app-001');

// Enable real-time streaming
logger.enableLogStreaming(123);
```

### 3. Start Logging

```typescript
import { log } from '../utils/logger';

// All logs will now be sent to Redis
await log.info('APP', 'Application started');
await log.debug('VAULT', 'Vault access attempt', { method: 'NFC' });
await log.error('SECURITY', 'Authentication failed', { user: 'unknown' });
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
ENABLE_REDIS=true
REDIS_STREAMING=true
REDIS_CACHING=true
```

### Programmatic Configuration

```typescript
import { redisConfig } from '../config/redis';

// Update Redis configuration
redisConfig.updateConfig({
  enableRedis: true,
  config: {
    host: 'your-redis-host',
    port: 6379,
    password: 'your-password',
    db: 0,
  },
  logStreaming: {
    enabled: true,
    channels: ['new_log:vault_*', 'security_events:*'],
  },
  caching: {
    enabled: true,
    ttl: 3600, // 1 hour
  },
});
```

## Features

### 1. Real-time Log Streaming

```typescript
// Subscribe to real-time log updates
await logger.subscribeToLogs(123, (logEvent) => {
  console.log('New log received:', logEvent);
  
  switch (logEvent.type) {
    case 'new_log':
      // Handle new log entry
      break;
    case 'error':
      // Handle streaming error
      break;
  }
});

// Unsubscribe when done
await logger.unsubscribeFromLogs(123);
```

### 2. Offline Log Caching

```typescript
// Enable caching for offline support
logger.enableLogCaching(123, 'mobile-app-001');

// Logs are automatically cached when offline
await log.info('OFFLINE', 'User action while offline');

// Sync cached logs when back online
const syncResult = await logger.syncCachedLogs();
console.log('Synced logs:', syncResult.syncedCount);
```

### 3. Performance Monitoring

```typescript
// Get Redis statistics
const redisStats = await logger.getRedisStats();
console.log('Redis Stats:', redisStats);
// Output: { totalLogs: 150, successfulLogs: 148, failedLogs: 2 }

// Get cache statistics
const cacheStats = await logger.getCacheStats();
console.log('Cache Stats:', cacheStats);
// Output: { totalCached: 45, pendingSync: 3, synced: 42 }
```

### 4. Error Handling

```typescript
try {
  await log.error('TEST', 'Testing error handling');
} catch (error) {
  // Automatic fallback to console logging
  console.error('Logging failed, using fallback');
}
```

## Service Architecture

### RedisLoggerService

Handles Redis connection and log transmission:

```typescript
import { redisLogger } from '../service/RedisLoggerService';

// Initialize
await redisLogger.initialize();

// Send log
await redisLogger.sendLog({
  level: 'info',
  context: 'APP',
  message: 'Test message',
  vault_id: 123,
  device_id: 'mobile-app-001',
});

// Get statistics
const stats = redisLogger.getStats();
```

### LogStreamingService

Manages real-time log streaming:

```typescript
import { logStreamingService } from '../service/LogStreamingService';

// Initialize
await logStreamingService.initialize();

// Subscribe to vault logs
await logStreamingService.subscribeToVault(123);

// Add callback for log events
logStreamingService.addCallback((event) => {
  console.log('Stream event:', event);
});
```

### LogCacheService

Handles offline log caching:

```typescript
import { logCacheService } from '../service/LogCacheService';

// Initialize
await logCacheService.initialize();

// Cache log
await logCacheService.cacheLog(logEntry, 123, 'mobile-app-001');

// Get cached logs
const cachedLogs = await logCacheService.getCachedLogs(123);

// Sync with Redis
const syncResult = await logCacheService.syncWithRedis(redisLogger);
```

## Best Practices

### 1. Error Handling

Always wrap logging calls in try-catch blocks:

```typescript
try {
  await log.info('CONTEXT', 'Message', data);
} catch (error) {
  console.error('Logging failed:', error);
}
```

### 2. Resource Management

Clean up resources when done:

```typescript
// Disconnect all Redis services
await logger.disconnectRedisServices();
```

### 3. Performance Optimization

Use batching for high-volume logging:

```typescript
// The logger automatically batches logs for better performance
for (let i = 0; i < 1000; i++) {
  await log.debug('BATCH', `Log entry ${i}`);
}
```

### 4. Monitoring

Regularly check service health:

```typescript
// Check Redis connection
const isConnected = redisLogger.isRedisConnected();

// Check cache health
const cacheStats = await logger.getCacheStats();
if (cacheStats.pendingSync > 100) {
  console.warn('High number of pending sync logs');
}
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```typescript
   // Check Redis configuration
   const config = redisConfig.getConfig();
   console.log('Redis config:', config);
   ```

2. **Logs Not Syncing**
   ```typescript
   // Force sync cached logs
   const result = await logger.syncCachedLogs();
   console.log('Sync result:', result);
   ```

3. **High Memory Usage**
   ```typescript
   // Clear cache if needed
   await logCacheService.clearCache();
   ```

### Debug Mode

Enable debug logging:

```typescript
logger.configure({
  enableConsole: true,
  minLevel: 'debug',
});
```

## Integration Examples

### With React Native App

```typescript
// App.tsx
import { logger } from './src/utils/logger';

export default function App() {
  useEffect(() => {
    // Initialize Redis logging
    logger.enableRedisLogging(123, 'mobile-app-001', 456);
    logger.enableLogCaching(123, 'mobile-app-001');
    logger.enableLogStreaming(123);
  }, []);

  return (
    // Your app components
  );
}
```

### With Navigation

```typescript
// navigation.ts
import { log } from '../utils/logger';

export function logNavigation(from: string, to: string) {
  log.navigation(from, to);
}
```

### With API Calls

```typescript
// ApiService.ts
import { log } from '../utils/logger';

export class ApiService {
  async makeRequest(url: string, data: any) {
    log.api.request('POST', url, data);
    
    try {
      const response = await fetch(url, { method: 'POST', body: JSON.stringify(data) });
      log.api.response('POST', url, response.status, response);
      return response;
    } catch (error) {
      log.error('API', 'Request failed', error);
      throw error;
    }
  }
}
```

## Security Considerations

1. **Sensitive Data**: Never log passwords or sensitive information
2. **Data Retention**: Configure appropriate TTL for cached logs
3. **Access Control**: Ensure Redis is properly secured
4. **Encryption**: Use TLS for Redis connections in production

## Performance Tips

1. **Batch Processing**: The logger automatically batches logs for better performance
2. **Connection Pooling**: Redis connections are reused efficiently
3. **Memory Management**: Regular cleanup prevents memory leaks
4. **Monitoring**: Track statistics to identify performance issues

## Conclusion

The Redis logging integration provides a robust, scalable solution for mobile app logging with real-time capabilities and offline support. Follow the examples and best practices outlined in this guide for optimal implementation.
