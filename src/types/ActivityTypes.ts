export interface WSQueryRequest {
  vault_id: number;
  prefixes: string[];
}

export interface LogEntry {
  id: number;
  vault_id: number;
  user_id?: number;
  event_type: string;
  details: string;
  timestamp: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  device_id?: string;
}

// UI-specific types for ActivityScreen
export type ActivityStatus = 'success' | 'failed' | 'warning';

export type ActivityEventType =
  | 'vault_unlock'
  | 'failed_unlock'
  | 'user_added'
  | 'tamper_alert'
  | 'remote_unlock'
  | 'failed_pin'
  | 'settings_updated';

export interface ActivityUser {
  initials: string;
  name: string;
}

export interface ActivityLog {
  id: string;
  status: ActivityStatus;
  eventType: ActivityEventType;
  title: string;
  timestamp: string;
  user: ActivityUser;
  description: string;
}

export interface ActivityScreenProps {
  navigation?: any; // Can be improved with proper navigation types
}

export interface FilterState {
  searchQuery: string;
  selectedUser: string;
  selectedStatus: string;
  selectedDate: string;
}

export type FilterValue = string;

// NFC Card data types
export interface NFCCardData {
  uid: string;
  isRegistered: boolean;
}

export interface NFCLogInfo {
  hasNFCData: boolean;
  cardUID: string;
  isFailedAttempt: boolean;
}