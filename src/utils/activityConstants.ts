import type { ActivityStatus, ActivityEventType } from '../types/ActivityTypes';

export const ACTIVITY_COLORS = {
  success: '#22c55e',
  failed: '#ef4444',
  warning: '#f59e0b',
  neutral: '#9ca3af',
  white: '#ffffff',
  blue: '#3b82f6'
} as const;

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  success: 'Success',
  failed: 'Failed',
  warning: 'Warning'
} as const;

export const EVENT_TYPE_ICONS: Record<ActivityEventType, string> = {
  vault_unlock: 'Shield',
  failed_unlock: 'Shield',
  failed_pin: 'Shield',
  user_added: 'Settings',
  settings_updated: 'Settings',
  tamper_alert: 'Settings',
  remote_unlock: 'Smartphone'
} as const;

export const DEFAULT_FILTERS = {
  user: 'All Users',
  status: 'All Status',
  date: 'Date'
} as const;

export const ICON_SIZES = {
  small: 16,
  medium: 20,
  large: 24
} as const;