import { useState, useMemo, useCallback, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { ActivityLog, FilterState } from '../../types/ActivityTypes';
import { LogService, LogEntry } from '../../service/LogService';
import { VaultService, VaultMembership } from '../../service/VaultService';
import { StorageService } from '../../service/StorageService';
import { DEFAULT_FILTERS } from '../../utils/activityConstants';

/**
 * Generates user information for activity logs with proper fallback logic.
 * 
 * @param logEntry - Log entry from backend
 * @returns User information object with initials and name
 */
const generateUserInfo = (logEntry: LogEntry): { initials: string; name: string } => {
  console.log('🔍 generateUserInfo - Processing log entry:', {
    id: logEntry.id,
    user_id: logEntry.user_id,
    username: logEntry.username,
    hasUsername: !!logEntry.username
  });

  // Use username from backend if available
  if (logEntry.username) {
    const initials = logEntry.username.length >= 2 
      ? logEntry.username.substring(0, 2).toUpperCase()
      : logEntry.username.toUpperCase();
    console.log('✅ Using username from backend:', logEntry.username, 'initials:', initials);
    return { initials, name: logEntry.username };
  }
  
  // Fallback for system events (no user_id)
  if (!logEntry.user_id) {
    console.log('🔧 System event - no user_id');
    return { initials: 'S', name: 'System' };
  }
  
  // Fallback for missing username but existing user_id
  console.log('⚠️ No username from backend, using user_id fallback:', logEntry.user_id);
  return { 
    initials: `U${logEntry.user_id}`, 
    name: `User ${logEntry.user_id}` 
  };
};

// Helper function to transform backend LogEntry to frontend ActivityLog
const transformLogEntryToActivityLog = (logEntry: LogEntry): ActivityLog => {
  // Determine status based on event_type
  let status: 'success' | 'failed' | 'warning' = 'success';
  if (logEntry.event_type === 'failed_attempt' || logEntry.event_type === 'tamper' || logEntry.event_type === 'alarm') {
    status = 'failed';
  } else if (logEntry.event_type === 'disconnected' || logEntry.event_type === 'need_other_factor') {
    status = 'warning';
  }

  // Map event_type to ActivityEventType
  const eventTypeMap: { [key: string]: ActivityLog['eventType'] } = {
    'unlock': 'vault_unlock',
    'lock': 'vault_unlock',
    'failed_attempt': 'failed_unlock',
    'tamper': 'tamper_alert',
    'alarm': 'tamper_alert',
    'disconnected': 'failed_unlock',
    'need_other_factor': 'failed_unlock',
    'access_granted': 'vault_unlock',
    'connected': 'vault_unlock'
  };

  // Generate user info with proper username handling
  const userInfo = generateUserInfo(logEntry);

  // Format timestamp - handle ISO format properly
  let date: Date;

  try {
    // Use timestamp field from backend (which we updated to include)
    const timestampField = logEntry.timestamp || logEntry.created_at;
    
    // Handle different ISO format variations
    const dateString = timestampField.includes('T')
      ? timestampField
      : timestampField.replace(' ', 'T');

    date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
  } catch (error) {
    console.warn('Failed to parse date:', logEntry.timestamp || logEntry.created_at, 'using current time');
    date = new Date(); // Fallback to current time
  }

  const timestamp = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return {
    id: logEntry.id.toString(),
    status,
    eventType: eventTypeMap[logEntry.event_type] || 'vault_unlock',
    title: getTitleFromEventType(logEntry.event_type),
    timestamp,
    user: userInfo,
    description: logEntry.details || 'No details available'
  };
};

// Helper function to generate title from event type
const getTitleFromEventType = (eventType: string): string => {
  const titleMap: { [key: string]: string } = {
    'unlock': 'Vault Unlocked',
    'lock': 'Vault Locked',
    'failed_attempt': 'Failed Unlock Attempt',
    'tamper': 'Tamper Alert',
    'alarm': 'Security Alarm',
    'disconnected': 'Device Disconnected',
    'need_other_factor': 'Authentication Required',
    'access_granted': 'Access Granted',
    'connected': 'Device Connected'
  };
  return titleMap[eventType] || 'Activity Log';
};


export const useActivityLogs = (vaultId?: number) => {
  const isFocused = useIsFocused();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Vault-related state
  const [currentVaultId, setCurrentVaultId] = useState<number | null>(vaultId || null);
  const [availableVaults, setAvailableVaults] = useState<VaultMembership[]>([]);
  const [vaultsLoading, setVaultsLoading] = useState<boolean>(false);
  const [hasNoVaults, setHasNoVaults] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>(DEFAULT_FILTERS.user);
  const [selectedUser, setSelectedUser] = useState<string>(DEFAULT_FILTERS.user);
  const [selectedStatus, setSelectedStatus] = useState<string>(DEFAULT_FILTERS.status);
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_FILTERS.date);

  // Fetch user's available vaults
  const fetchUserVaults = useCallback(async () => {
    try {
      setVaultsLoading(true);
      const token = await StorageService.getAccessToken();

      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const vaults = await VaultService.getUserVaults(token);
      setAvailableVaults(vaults);
      
      // Check if user has no vault memberships
      const noVaults = vaults.length === 0;
      setHasNoVaults(noVaults);

      // Set current vault ID if not already set
      setCurrentVaultId(prevVaultId => {
        if (!prevVaultId && vaults.length > 0) {
          return vaults[0].vault_id;
        }
        return prevVaultId;
      });
    } catch (err) {
      console.error('Error fetching user vaults:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user vaults');
    } finally {
      setVaultsLoading(false);
    }
  }, []); // Remove currentVaultId from dependencies

  // Fetch logs from backend API
  const fetchLogs = useCallback(async () => {
    if (!currentVaultId) return; // Don't fetch if no vault ID is set

    try {
      setLoading(true);
      setError(null);

      const token = await StorageService.getAccessToken();

      const logEntries: LogEntry[] = await LogService.getFilteredLogs({
        vaultId: currentVaultId,
        token: token || undefined,
      });

      // Debug: Log the raw data from backend
      console.log('🔍 useActivityLogs - Raw log entries from backend:', logEntries.length, 'entries');
      if (logEntries.length > 0) {
        console.log('📋 First log entry details:', {
          id: logEntries[0].id,
          user_id: logEntries[0].user_id,
          username: logEntries[0].username,
          event_type: logEntries[0].event_type,
          details: logEntries[0].details
        });
      }

      // Transform backend data to frontend format
      const transformedLogs = logEntries.map(transformLogEntryToActivityLog);
      setLogs(transformedLogs);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      setLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [currentVaultId]);

  // Initialize vaults on mount and when screen becomes focused
  useEffect(() => {
    if (isFocused) {
      fetchUserVaults();
    }
  }, [fetchUserVaults, isFocused]);

  // Fetch logs when vault ID changes and screen is focused
  useEffect(() => {
    if (currentVaultId && isFocused) {
      fetchLogs();
    } else if (!vaultsLoading) {
      // If no vault ID and vault loading is complete, set loading to false
      setLoading(false);
    }
  }, [currentVaultId, fetchLogs, vaultsLoading, isFocused]);

  const filterState: FilterState = {
    searchQuery,
    selectedUser,
    selectedStatus,
    selectedDate
  };

  // Memoized filtered logs based on current filter state
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Filter by search query
    if (searchQuery && searchQuery !== DEFAULT_FILTERS.user) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.title.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.user.name.toLowerCase().includes(query)
      );
    }

    // Filter by user
    if (selectedUser && selectedUser !== DEFAULT_FILTERS.user) {
      filtered = filtered.filter(log => log.user.name === selectedUser);
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== DEFAULT_FILTERS.status) {
      filtered = filtered.filter(log => log.status === selectedStatus.toLowerCase());
    }

    // Filter by date (simplified - in real app would parse dates)
    if (selectedDate && selectedDate !== DEFAULT_FILTERS.date) {
      // This would be more complex in a real implementation
      // For now, we'll just return all logs if date filter is applied
    }

    return filtered;
  }, [logs, searchQuery, selectedUser, selectedStatus, selectedDate]);

  // Memoized filter handlers
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const updateUserFilter = useCallback((user: string) => {
    setSelectedUser(user);
  }, []);

  const updateStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const updateDateFilter = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery(DEFAULT_FILTERS.user);
    setSelectedUser(DEFAULT_FILTERS.user);
    setSelectedStatus(DEFAULT_FILTERS.status);
    setSelectedDate(DEFAULT_FILTERS.date);
  }, []);

  const refreshLogs = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  const selectVault = useCallback((vaultId: number) => {
    setCurrentVaultId(vaultId);
  }, []);

  const refreshVaults = useCallback(() => {
    fetchUserVaults();
  }, [fetchUserVaults]);

  // Get current vault info
  const currentVault = availableVaults.find(v => v.vault_id === currentVaultId) || null;

  return {
    // Logs data
    logs: filteredLogs,
    filterState,
    loading,
    error,

    // Vault management
    currentVaultId,
    availableVaults,
    currentVault,
    vaultsLoading,
    hasNoVaults,

    // Actions
    updateSearchQuery,
    updateUserFilter,
    updateStatusFilter,
    updateDateFilter,
    resetFilters,
    refreshLogs,
    selectVault,
    refreshVaults
  };
};