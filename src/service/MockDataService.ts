import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/UserTypes';
import { ActivityLog } from '../types/ActivityTypes';
import { VaultMembership } from './VaultService';

export interface MockPin {
  id: number;
  label: string;
  pin: string; // stored as masked display e.g. "••••"
  createdAt: string;
}

export interface MockNFCCard {
  id: number;
  name: string;
  uid: string;
  registeredAt: string;
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  SEEDED:    'mock_seeded',
  USER:      'mock_user',
  VAULTS:    'mock_vaults',
  ACTIVITY:  'mock_activity',
  USERS:     'mock_users',
  PINS:      'mock_pins',
  NFC_CARDS: 'mock_nfc_cards',
};

// ─── Mock Constants ──────────────────────────────────────────────────────────

const now = new Date().toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const MOCK_USER: User = {
  id: 1,
  firstName: 'John',
  lastName: 'Gabrielle',
  username: 'johng',
  email: 'admin@smartvault.io',
  role: 'admin',
  status: 'active',
  lastAccess: now,
  enabled: true,
};

export const MOCK_VAULTS: VaultMembership[] = [
  {
    vault_id: 1,
    vault_name: 'Main Vault',
    vault_device_id: 'SV-UNIT-001',
    vault_location: 'Home Office',
    role: 'admin',
    created_at: hoursAgo(720),
    last_accessed_at: hoursAgo(2),
  },
  {
    vault_id: 2,
    vault_name: 'Lab Unit',
    vault_device_id: 'SV-UNIT-002',
    vault_location: 'Lab',
    role: 'member',
    created_at: hoursAgo(480),
    last_accessed_at: hoursAgo(24),
  },
];

export const MOCK_ACTIVITY: ActivityLog[] = [
  {
    id: '1',
    status: 'success',
    eventType: 'remote_unlock',
    title: 'REMOTE UNLOCK',
    description: 'Protocol execution successful. Access granted via app.',
    timestamp: '2m ago',
    user: { initials: 'JG', name: 'J. GABRIELLE' },
  },
  {
    id: '2',
    status: 'failed',
    eventType: 'failed_pin',
    title: 'AUTH FAILURE',
    description: 'Multiple invalid PIN attempts detected. Unit locked.',
    timestamp: '18m ago',
    user: { initials: 'UN', name: 'UNKNOWN' },
  },
  {
    id: '3',
    status: 'success',
    eventType: 'vault_unlock',
    title: 'UNIT ACCESS',
    description: 'Manual biometric verification successful. Vault opened.',
    timestamp: '1h ago',
    user: { initials: 'MS', name: 'M. SANTOS' },
  },
  {
    id: '4',
    status: 'warning',
    eventType: 'tamper_alert',
    title: 'TAMPER ALERT',
    description: 'Unusual vibration detected on Main Vault chassis.',
    timestamp: '2h ago',
    user: { initials: 'SV', name: 'SMARTVAULT' },
  },
  {
    id: '5',
    status: 'success',
    eventType: 'vault_unlock',
    title: 'NFC ACCESS',
    description: 'NFC card UID:4A2F authorized. Entry logged.',
    timestamp: '3h ago',
    user: { initials: 'CR', name: 'C. REYES' },
  },
  {
    id: '6',
    status: 'failed',
    eventType: 'failed_unlock',
    title: 'BIOMETRIC FAIL',
    description: 'Fingerprint recognition failed after 3 attempts.',
    timestamp: '5h ago',
    user: { initials: 'UN', name: 'UNKNOWN' },
  },
  {
    id: '7',
    status: 'success',
    eventType: 'settings_updated',
    title: 'CONFIG UPDATE',
    description: 'Access limits updated. NFC quota set to 5 cards.',
    timestamp: '8h ago',
    user: { initials: 'JG', name: 'J. GABRIELLE' },
  },
  {
    id: '8',
    status: 'success',
    eventType: 'user_added',
    title: 'MEMBER ADDED',
    description: 'Carlos Reyes granted guest access to Lab Unit.',
    timestamp: '12h ago',
    user: { initials: 'JG', name: 'J. GABRIELLE' },
  },
  {
    id: '9',
    status: 'success',
    eventType: 'remote_unlock',
    title: 'REMOTE UNLOCK',
    description: 'Lab Unit opened remotely. Session duration: 4 min.',
    timestamp: '18h ago',
    user: { initials: 'MS', name: 'M. SANTOS' },
  },
  {
    id: '10',
    status: 'warning',
    eventType: 'tamper_alert',
    title: 'SYSTEM ALERT',
    description: 'Power interruption detected. Unit switched to battery backup.',
    timestamp: '1d ago',
    user: { initials: 'SV', name: 'SMARTVAULT' },
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Gabrielle',
    username: 'johng',
    email: 'admin@smartvault.io',
    role: 'admin',
    status: 'active',
    lastAccess: now,
    enabled: true,
  },
  {
    id: 2,
    firstName: 'Maria',
    lastName: 'Santos',
    username: 'm.santos',
    email: 'm.santos@smartvault.io',
    role: 'user',
    status: 'active',
    lastAccess: hoursAgo(3),
    enabled: true,
  },
  {
    id: 3,
    firstName: 'Carlos',
    lastName: 'Reyes',
    username: 'c.reyes',
    email: 'c.reyes@smartvault.io',
    role: 'user',
    status: 'inactive',
    lastAccess: hoursAgo(48),
    enabled: true,
  },
];

export const MOCK_PINS: MockPin[] = [
  { id: 1, label: 'Master PIN', pin: '••••', createdAt: new Date().toISOString() },
  { id: 2, label: 'Guest PIN',  pin: '••••', createdAt: new Date().toISOString() },
];

export const MOCK_NFC_CARDS: MockNFCCard[] = [
  { id: 1, name: 'Admin Card',  uid: 'A1:B2:C3:D4', registeredAt: new Date().toISOString() },
  { id: 2, name: 'Spare Card',  uid: 'E5:F6:G7:H8', registeredAt: new Date().toISOString() },
];

export const MOCK_METRICS = {
  totalVaults: 2,
  todayAccessCount: 47,
  successRate: 95,
  failedAttempts: 3,
  lastActivity: hoursAgo(0.033), // ~2 min ago
  isLoading: false,
  error: null,
};

// ─── MockDataService ──────────────────────────────────────────────────────────

export class MockDataService {
  /**
   * Seed all mock data into AsyncStorage on first run.
   * Subsequent calls are no-ops (checks mock_seeded flag).
   */
  static async seedIfNeeded(): Promise<void> {
    try {
      const already = await AsyncStorage.getItem(KEYS.SEEDED);
      if (already === 'true') return;

      await AsyncStorage.multiSet([
        [KEYS.USER,      JSON.stringify(MOCK_USER)],
        [KEYS.VAULTS,    JSON.stringify(MOCK_VAULTS)],
        [KEYS.ACTIVITY,  JSON.stringify(MOCK_ACTIVITY)],
        [KEYS.USERS,     JSON.stringify(MOCK_USERS)],
        [KEYS.PINS,      JSON.stringify(MOCK_PINS)],
        [KEYS.NFC_CARDS, JSON.stringify(MOCK_NFC_CARDS)],
        [KEYS.SEEDED,    'true'],
      ]);

      if (__DEV__) console.log('MockDataService - Seeded mock data into AsyncStorage');
    } catch (error) {
      if (__DEV__) console.error('MockDataService - Seed failed:', error);
    }
  }

  /**
   * Store a user object (called on mock login to persist the session user).
   */
  static async storeMockUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  }

  /** Get current user from AsyncStorage (falls back to MOCK_USER constant). */
  static async getUser(): Promise<User | null> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.USER);
      return raw ? JSON.parse(raw) : MOCK_USER;
    } catch {
      return MOCK_USER;
    }
  }

  /** Get vault list from AsyncStorage. */
  static async getVaults(): Promise<VaultMembership[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.VAULTS);
      return raw ? JSON.parse(raw) : MOCK_VAULTS;
    } catch {
      return MOCK_VAULTS;
    }
  }

  static async addVault(vault: VaultMembership): Promise<void> {
    try {
      const current = await this.getVaults();
      await AsyncStorage.setItem(KEYS.VAULTS, JSON.stringify([...current, vault]));
    } catch (error) {
      if (__DEV__) console.error('MockDataService - addVault failed:', error);
    }
  }

  /** Get activity log list from AsyncStorage. */
  static async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.ACTIVITY);
      return raw ? JSON.parse(raw) : MOCK_ACTIVITY;
    } catch {
      return MOCK_ACTIVITY;
    }
  }

  /** Get users list from AsyncStorage. */
  static async getUsers(): Promise<User[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.USERS);
      return raw ? JSON.parse(raw) : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  }

  /** Prepend a new activity log entry (newest first). */
  static async addActivityLog(log: ActivityLog): Promise<void> {
    try {
      const current = await this.getActivityLogs();
      const updated = [log, ...current];
      await AsyncStorage.setItem(KEYS.ACTIVITY, JSON.stringify(updated));
    } catch (error) {
      if (__DEV__) console.error('MockDataService - addActivityLog failed:', error);
    }
  }

  // ── PINS ──────────────────────────────────────────────────────────────────
  static async getPins(): Promise<MockPin[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.PINS);
      return raw ? JSON.parse(raw) : MOCK_PINS;
    } catch { return MOCK_PINS; }
  }

  static async addPin(label: string): Promise<void> {
    try {
      const current = await this.getPins();
      const newPin: MockPin = {
        id: Date.now(),
        label,
        pin: '••••',
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(KEYS.PINS, JSON.stringify([...current, newPin]));
    } catch (error) {
      if (__DEV__) console.error('MockDataService - addPin failed:', error);
    }
  }

  static async deletePin(id: number): Promise<void> {
    try {
      const current = await this.getPins();
      await AsyncStorage.setItem(KEYS.PINS, JSON.stringify(current.filter(p => p.id !== id)));
    } catch (error) {
      if (__DEV__) console.error('MockDataService - deletePin failed:', error);
    }
  }

  // ── NFC CARDS ─────────────────────────────────────────────────────────────
  static async getNFCCards(): Promise<MockNFCCard[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.NFC_CARDS);
      return raw ? JSON.parse(raw) : MOCK_NFC_CARDS;
    } catch { return MOCK_NFC_CARDS; }
  }

  static async addNFCCard(name: string, uid: string): Promise<void> {
    try {
      const current = await this.getNFCCards();
      const newCard: MockNFCCard = {
        id: Date.now(),
        name,
        uid,
        registeredAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(KEYS.NFC_CARDS, JSON.stringify([...current, newCard]));
    } catch (error) {
      if (__DEV__) console.error('MockDataService - addNFCCard failed:', error);
    }
  }

  static async deleteNFCCard(id: number): Promise<void> {
    try {
      const current = await this.getNFCCards();
      await AsyncStorage.setItem(KEYS.NFC_CARDS, JSON.stringify(current.filter(c => c.id !== id)));
    } catch (error) {
      if (__DEV__) console.error('MockDataService - deleteNFCCard failed:', error);
    }
  }

  // ── USER ARCHIVE / DELETE ─────────────────────────────────────────────────
  static async archiveUser(userId: number): Promise<void> {
    try {
      const current = await this.getUsers();
      const updated = current.map(u => u.id === userId ? { ...u, status: 'inactive' as const } : u);
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(updated));
    } catch (error) {
      if (__DEV__) console.error('MockDataService - archiveUser failed:', error);
    }
  }

  static async deleteUser(userId: number): Promise<void> {
    try {
      const current = await this.getUsers();
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(current.filter(u => u.id !== userId)));
    } catch (error) {
      if (__DEV__) console.error('MockDataService - deleteUser failed:', error);
    }
  }

  /** Append a new user to the AsyncStorage users list. */
  static async addUser(user: User): Promise<void> {
    try {
      const current = await this.getUsers();
      const updated = [...current, user];
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(updated));
    } catch (error) {
      if (__DEV__) console.error('MockDataService - addUser failed:', error);
    }
  }

  /** Get dashboard metrics (not stored in AsyncStorage — computed fresh each call). */
  static getMetrics() {
    return {
      ...MOCK_METRICS,
      lastActivity: new Date(Date.now() - 2 * 60_000).toISOString(),
    };
  }

  /**
   * Reset seed flag so data is re-seeded on next app launch.
   * Useful for dev/testing.
   */
  static async resetSeed(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.SEEDED);
  }
}
