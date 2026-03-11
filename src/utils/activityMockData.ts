import type { ActivityStatus, ActivityEventType } from '../types/ActivityTypes';

export const ACTIVITY_MOCK_DATA = [
  {
    id: '1',
    status: 'success' as ActivityStatus,
    eventType: 'vault_unlock' as ActivityEventType,
    title: 'Vault Unlocked',
    timestamp: 'Jan 15, 02:30 PM',
    user: { initials: 'JD', name: 'John Doe' },
    description: 'Face recognition + NFC card'
  },
  {
    id: '2',
    status: 'failed' as ActivityStatus,
    eventType: 'failed_unlock' as ActivityEventType,
    title: 'Failed Unlock Attempt',
    timestamp: 'Jan 15, 02:15 PM',
    user: { initials: 'JS', name: 'Jane Smith' },
    description: 'Face not recognized after 3 attempts'
  },
  {
    id: '3',
    status: 'success' as ActivityStatus,
    eventType: 'user_added' as ActivityEventType,
    title: 'User Added',
    timestamp: 'Jan 15, 01:45 PM',
    user: { initials: 'A', name: 'Admin' },
    description: 'New user "Mike Johnson" added to system'
  },
  {
    id: '4',
    status: 'warning' as ActivityStatus,
    eventType: 'tamper_alert' as ActivityEventType,
    title: 'Tamper Alert',
    timestamp: 'Jan 15, 12:20 PM',
    user: { initials: 'U', name: 'Unknown' },
    description: 'Ultrasonic sensor detected movement'
  },
  {
    id: '5',
    status: 'success' as ActivityStatus,
    eventType: 'vault_unlock' as ActivityEventType,
    title: 'Vault Unlocked',
    timestamp: 'Jan 15, 11:30 AM',
    user: { initials: 'JS', name: 'Jane Smith' },
    description: 'PIN code verification successful'
  },
  {
    id: '6',
    status: 'success' as ActivityStatus,
    eventType: 'remote_unlock' as ActivityEventType,
    title: 'Remote Unlock',
    timestamp: 'Jan 15, 10:15 AM',
    user: { initials: 'JD', name: 'John Doe' },
    description: 'Unlocked via mobile app with OTP'
  },
  {
    id: '7',
    status: 'failed' as ActivityStatus,
    eventType: 'failed_pin' as ActivityEventType,
    title: 'Failed PIN Attempt',
    timestamp: 'Jan 15, 09:45 AM',
    user: { initials: 'MJ', name: 'Mike Johnson' },
    description: 'Incorrect PIN entered 3 times'
  },
  {
    id: '8',
    status: 'success' as ActivityStatus,
    eventType: 'settings_updated' as ActivityEventType,
    title: 'Settings Updated',
    timestamp: 'Jan 14, 04:30 PM',
    user: { initials: 'A', name: 'Admin' },
    description: 'Auto-lock timer changed to 45 seconds'
  }
];