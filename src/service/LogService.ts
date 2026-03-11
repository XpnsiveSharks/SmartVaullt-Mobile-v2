import { ApiService } from './ApiService';
import { API_CONFIG } from '../config/api';

export interface LogEntry {
  id: number;
  device_id: string;
  user_id?: number;
  username?: string;  // ✅ Added username field from backend
  event_type: string;
  details: string;
  timestamp: string;
  vault_id?: number;
}

export interface GetLogsParams {
  vaultId: number;
  prefixes?: string[];
  offset?: number;
  limit?: number;
  token?: string;
}

export class LogService extends ApiService {
  /**
   * Get filtered logs for a vault
   */
  static async getFilteredLogs({
    vaultId,
    prefixes = API_CONFIG.DEFAULTS.PREFIXES,
    offset = API_CONFIG.DEFAULTS.LOG_OFFSET,
    limit = API_CONFIG.DEFAULTS.LOG_LIMIT,
    token,
  }: GetLogsParams): Promise<LogEntry[]> {
    const endpoint = API_CONFIG.ENDPOINTS.VAULTS.ACTIVITY(vaultId);
    const queryParams = {
      prefixes: prefixes.join(','),
      offset: offset.toString(),
      limit: limit.toString(),
    };

    console.log('📡 Mobile app requesting logs:', {
      endpoint,
      queryParams,
      vaultId,
      prefixes: prefixes.join(','),
      limit  // ✅ Added limit to debug output
    });

    const response = await this.get<LogEntry[]>(endpoint, token, queryParams);

    console.log('📥 Mobile app received logs:', response.length, 'logs');
    console.log('🔍 First log received:', response[0]); // ✅ Log the entire first log object
    
    if (__DEV__ && response.length > 0) {
      response.forEach((log, index) => {
        if (log.details && log.details.includes('NFC:')) {
          console.log(`  ${index + 1}. ${log.event_type}: ${log.details} (user: ${log.username || `User ${log.user_id}`}, timestamp: ${log.timestamp})`);
        }
      });
    }

    return response;
  }


  /**
   * Get logs with default parameters
   */
  static async getDefaultLogs(token?: string): Promise<LogEntry[]> {
    return this.getFilteredLogs({
      vaultId: API_CONFIG.DEFAULTS.VAULT_ID,
      token,
    });
  }

  /**
   * Get most recent NFC failed attempt log for registration
   */
  static async getMostRecentNFCLog(vaultId: number, token?: string): Promise<LogEntry[]> {
    return this.getFilteredLogs({
      vaultId,
      limit: 1, // ✅ Only get the most recent log
      token,
    });
  }
}
