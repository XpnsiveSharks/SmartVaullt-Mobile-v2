import { ENV_CONFIG } from './env';
import { APP_CONSTANTS } from './constants';
import { log } from '../utils/logger';

// --- API Configuration ---
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.BASE_URL,

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/v1/auth/login',
      SIGNUP: '/api/v1/auth/signup',
      REFRESH: '/api/v1/auth/refresh',
      LOGOUT: '/api/v1/auth/logout',
      REQUEST_OTP: '/api/v1/auth/request-otp',
      VERIFY_OTP: '/api/v1/auth/verify-otp',
      REQUEST_PASSWORD_RESET: '/api/v1/auth/request-password-reset',
      CONFIRM_PASSWORD_RESET: '/api/v1/auth/confirm-password-reset',
    },
    USERS: {
      ME: '/api/v1/users/me',
      SEARCH: (email: string) => `/api/v1/users/search?email=${encodeURIComponent(email)}`,
      DEVICE_TOKEN: '/api/v1/users/me/device-token',
    },
    LOGS: {
      WS: '/api/v1/ws/user',
    },
    VAULT_INVITATIONS: {
      CREATE: '/api/v1/vault-invitations/',
      VALIDATE: (code: string) => `/api/v1/vault-invitations/${code}`,
      ACCEPT: (code: string) => `/api/v1/vault-invitations/${code}/accept`,
      BY_VAULT: (vaultId: number) => `/api/v1/vault-invitations/vault/${vaultId}`,
    },
    BIOMETRICS: {
      ENROLL: '/api/v1/biometrics/enroll',
      VERIFY: '/api/v1/biometrics/verify',
      FACE_ENROLL: '/api/v1/biometrics/enroll-face',
      FACE_VERIFY: '/api/v1/biometrics/verify-face',
      FACE_DELETE: '/api/v1/biometrics/face',
    },
    DEVICES: {
      REGISTER: '/api/v1/devices/register',
    },
    VAULTS: {
      PROVISIONING_TOKEN: '/api/v1/vaults/provisioning-token',
      LIST: '/api/v1/vaults',
      STATUS: (vaultId: string | number) => `/api/v1/vaults/${vaultId}/status`,
      UNLOCK: (vaultId: string | number) => `/api/v1/vaults/${vaultId}/unlock`,
      PIN_SET: (vaultId: string | number) => `/api/v1/vaults/${vaultId}/pin`,
      PIN_DELETE: (vaultId: string | number) => `/api/v1/vaults/${vaultId}/pin`,
      PIN_STATUS: (vaultId: string | number) => `/api/v1/vaults/${vaultId}/pin/status`,
      PIN_UNLOCK: (vaultId: string | number) => `/api/v1/vaults/${vaultId}/unlock/pin`,
      MEMBERS: (vaultId: string | number) => `/api/v1/vaults/${vaultId}/members`,
      ADD_MEMBER: (vaultId: string | number) => `/api/v1/vaults/${vaultId}/members`,
      REMOVE_MEMBER: (vaultId: string | number, userId: string | number) => `/api/v1/vaults/${vaultId}/members/${userId}`,
      ACTIVITY: (vaultId: string | number) => `/api/v1/vaults/${vaultId}/activity`,
      TRANSFER_INITIATE: (vaultId: number) => `/api/v1/vaults/${vaultId}/transfer/initiate`,
      TRANSFER_ACCEPT: (vaultId: number) => `/api/v1/vaults/${vaultId}/transfer/accept`,
      TRANSFER_VALIDATE: (inviteCode: string) => `/api/v1/vaults/transfer/validate/${inviteCode}`,
      DELETE: (vaultId: string | number) => `/api/v1/vaults/${vaultId}`,
    },
  },

  DEFAULTS: {
    VAULT_ID: ENV_CONFIG.DEFAULT_VAULT_ID,
    PREFIXES: ENV_CONFIG.DEFAULT_PREFIXES,
    LOG_LIMIT: APP_CONSTANTS.DEFAULTS.LOG_LIMIT,
    LOG_OFFSET: APP_CONSTANTS.DEFAULTS.LOG_OFFSET,
  },

  STORAGE_KEYS: APP_CONSTANTS.STORAGE_KEYS,
} as const;

// WebSocket URL construction
const wsProtocol = API_CONFIG.BASE_URL.startsWith('https') ? 'wss://' : 'ws://';
const wsHost = API_CONFIG.BASE_URL.replace(/^https?:\/\//, '');
export const EVENT_WS_URL = ENV_CONFIG.EVENT_WS_URL || `${wsProtocol}${wsHost}${API_CONFIG.ENDPOINTS.LOGS.WS}`;

// Development logging
if (__DEV__) {
  log.debug('Config', 'API Configuration loaded', {
    BASE_URL: API_CONFIG.BASE_URL,
    DEFAULT_VAULT_ID: API_CONFIG.DEFAULTS.VAULT_ID,
    DEFAULT_PREFIXES: API_CONFIG.DEFAULTS.PREFIXES,
    WS_URL: EVENT_WS_URL,
  });
}
