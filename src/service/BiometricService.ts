import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { StorageService } from './StorageService';
import { ApiService } from './ApiService';
import { API_CONFIG } from '../config/api';
import { log } from '../utils/logger';

const BIOMETRIC_KEYS = {
  LOGIN_ENABLED: 'biometric_login_enabled',
  LOGIN_REFRESH_TOKEN: 'biometric_login_refresh_token',
  VAULT_ENABLED_PREFIX: 'biometric_vault_enabled_',
  VAULT_PIN_PREFIX: 'biometric_vault_pin_',
  VAULT_USER_ID: 'vault_user_id',
  VAULT_JWT: 'vault_jwt',
  VAULT_CREDENTIALS: 'smartvault_biometric_credentials', // combined key, no requireAuthentication
  FACE_ENROLLED: 'face_recognition_enrolled',
};

export interface BiometricCapabilities {
  isSecureStoreAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  enrolledLevel: number;
}

export class BiometricService {
  private static async checkSecureStore(): Promise<boolean> {
    try {
      return await SecureStore.isAvailableAsync();
    } catch (error) {
      await log.warn('Biometric', 'SecureStore availability check failed', error);
      return false;
    }
  }

  static async getCapabilities(): Promise<BiometricCapabilities> {
    const isSecureStoreAvailable = await this.checkSecureStore();

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      const enrolledLevel = hasHardware ? await LocalAuthentication.getEnrolledLevelAsync() : 0;
      const supportedTypes = hasHardware
        ? await LocalAuthentication.supportedAuthenticationTypesAsync()
        : [];

      // Android: face recognition is Class 2 (BIOMETRIC_WEAK) and is NOT returned by
      // supportedAuthenticationTypesAsync() which only reports Class 3 (BIOMETRIC_STRONG).
      // If enrolledLevel is BIOMETRIC_WEAK (2) and no strong biometrics are reported,
      // face recognition is the only enrolled biometric — surface it explicitly.
      const hasFaceOnlyEnrolled =
        enrolledLevel === 2 &&
        !supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) &&
        !supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);

      const effectiveTypes = hasFaceOnlyEnrolled
        ? [...supportedTypes, LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]
        : supportedTypes;

      await log.debug('Biometric', 'Capabilities checked', {
        isSecureStoreAvailable,
        hasHardware,
        isEnrolled,
        enrolledLevel,
        supportedTypes: effectiveTypes,
      });

      return { isSecureStoreAvailable, hasHardware, isEnrolled, supportedTypes: effectiveTypes, enrolledLevel };
    } catch (error) {
      await log.error('Biometric', 'Failed to check capabilities', error);
      return {
        isSecureStoreAvailable,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        enrolledLevel: 0,
      };
    }
  }

  static async canUseBiometrics(): Promise<boolean> {
    const { isSecureStoreAvailable, hasHardware, isEnrolled } = await this.getCapabilities();
    return isSecureStoreAvailable && hasHardware && isEnrolled;
  }

  static async isBiometricLoginEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_KEYS.LOGIN_ENABLED);
      return enabled === 'true';
    } catch (error) {
      await log.error('Biometric', 'Failed to read biometric login flag', error);
      return false;
    }
  }

  static async enableBiometricLogin(): Promise<void> {
    const canUse = await this.canUseBiometrics();
    if (!canUse) {
      throw new Error('Biometric authentication is not available');
    }

    const refreshToken = await StorageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      await SecureStore.setItemAsync(
        BIOMETRIC_KEYS.LOGIN_REFRESH_TOKEN,
        refreshToken,
        { requireAuthentication: true }
      );
      await SecureStore.setItemAsync(BIOMETRIC_KEYS.LOGIN_ENABLED, 'true');
      await log.info('Biometric', 'Biometric login enabled');
    } catch (error) {
      await log.error('Biometric', 'Failed to enable biometric login', error);
      throw new Error('Failed to enable biometric login');
    }
  }

  static async updateBiometricLoginToken(refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        BIOMETRIC_KEYS.LOGIN_REFRESH_TOKEN,
        refreshToken,
        { requireAuthentication: true }
      );
      await SecureStore.setItemAsync(BIOMETRIC_KEYS.LOGIN_ENABLED, 'true');
      await log.debug('Biometric', 'Biometric refresh token updated');
    } catch (error) {
      await log.error('Biometric', 'Failed to update biometric refresh token', error);
      throw new Error('Failed to update biometric refresh token');
    }
  }

  static async disableBiometricLogin(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.LOGIN_REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.LOGIN_ENABLED);
      await log.info('Biometric', 'Biometric login disabled');
    } catch (error) {
      await log.error('Biometric', 'Failed to disable biometric login', error);
    }
  }

  static async getBiometricRefreshToken(): Promise<string | null> {
    const canUse = await this.canUseBiometrics();
    if (!canUse) {
      return null;
    }

    try {
      const token = await SecureStore.getItemAsync(
        BIOMETRIC_KEYS.LOGIN_REFRESH_TOKEN,
        { requireAuthentication: true }
      );
      return token;
    } catch (error) {
      await log.warn('Biometric', 'Failed to retrieve biometric refresh token', error);
      return null;
    }
  }

  private static vaultEnabledKey(vaultId: number): string {
    return `${BIOMETRIC_KEYS.VAULT_ENABLED_PREFIX}${vaultId}`;
  }

  private static vaultPinKey(vaultId: number): string {
    return `${BIOMETRIC_KEYS.VAULT_PIN_PREFIX}${vaultId}`;
  }

  static async isVaultBiometricEnabled(vaultId: number): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(this.vaultEnabledKey(vaultId));
      return enabled === 'true';
    } catch (error) {
      await log.error('Biometric', 'Failed to read vault biometric flag', error);
      return false;
    }
  }

  static async enableVaultBiometric(vaultId: number, pin: string): Promise<void> {
    const canUse = await this.canUseBiometrics();
    if (!canUse) {
      throw new Error('Biometric authentication is not available');
    }

    try {
      await SecureStore.setItemAsync(
        this.vaultPinKey(vaultId),
        pin,
        { requireAuthentication: true }
      );
      await SecureStore.setItemAsync(this.vaultEnabledKey(vaultId), 'true');
      await log.info('Biometric', 'Vault biometric enabled', { vaultId });
    } catch (error) {
      await log.error('Biometric', 'Failed to enable vault biometric', error);
      throw new Error('Failed to enable biometric vault unlock');
    }
  }

  static async disableVaultBiometric(vaultId: number): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.vaultPinKey(vaultId));
      await SecureStore.deleteItemAsync(this.vaultEnabledKey(vaultId));
      await log.info('Biometric', 'Vault biometric disabled', { vaultId });
    } catch (error) {
      await log.error('Biometric', 'Failed to disable vault biometric', error);
    }
  }

  static async getVaultPinWithBiometrics(vaultId: number): Promise<string | null> {
    const canUse = await this.canUseBiometrics();
    if (!canUse) {
      return null;
    }

    try {
      const pin = await SecureStore.getItemAsync(
        this.vaultPinKey(vaultId),
        { requireAuthentication: true }
      );
      return pin;
    } catch (error) {
      await log.warn('Biometric', 'Failed to retrieve vault PIN', error);
      return null;
    }
  }

  /**
   * Enrollment — store userId + accessToken in biometric-gated SecureStore,
   * then record the enrollment on the backend.
   * Call after a successful login when the user opts into biometrics.
   * Reads credentials from StorageService — no parameters required.
   */
  static async enrollBiometric(): Promise<void> {
    const canUse = await this.canUseBiometrics();
    if (!canUse) {
      throw new Error('Biometric authentication is not available on this device');
    }

    const accessToken = await StorageService.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available — login first');
    }

    const userId = await StorageService.getCurrentUserId();
    if (!userId) {
      throw new Error('Could not determine user ID from token');
    }

    try {
      // Store combined credentials without requireAuthentication — authenticateAsync() is the gate.
      // Also write legacy keys so older app versions still work during rollout.
      await SecureStore.setItemAsync(
        BIOMETRIC_KEYS.VAULT_CREDENTIALS,
        JSON.stringify({ userId: String(userId), jwt: accessToken }),
      );
      await SecureStore.setItemAsync(BIOMETRIC_KEYS.VAULT_USER_ID, String(userId), {
        requireAuthentication: true,
      });
      await SecureStore.setItemAsync(BIOMETRIC_KEYS.VAULT_JWT, accessToken, {
        requireAuthentication: true,
      });

      // Record enrollment on backend (best-effort — non-fatal if offline)
      try {
        await ApiService.post(API_CONFIG.ENDPOINTS.BIOMETRICS.ENROLL, {}, accessToken);
      } catch (e) {
        await log.warn('Biometric', 'Failed to record enrollment on backend', e);
      }

      await log.info('Biometric', 'Biometric enrollment complete', { userId });
    } catch (error) {
      await log.error('Biometric', 'Failed to enroll biometric', error);
      throw new Error('Failed to enroll biometric');
    }
  }

  /**
   * Verify biometric session — prompts Face ID / Fingerprint, retrieves stored
   * credentials, and calls POST /biometrics/verify.
   * Returns the user's vault list on success.
   * Throws 're_enroll' if SecureStore credentials are missing.
   * Throws 'jwt_expired' if the backend returns 401.
   * Throws 'user_cancel' | 'lockout' | 'not_enrolled' on prompt failure.
   */
  static async verifyBiometricSession(vaultId?: string): Promise<{
    success: boolean;
    vaults: unknown[];
    unlock_sent?: boolean;
    vault_offline?: boolean;
  }> {
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: vaultId ? 'Unlock Vault' : 'Open SmartVault',
      disableDeviceFallback: true,
      cancelLabel: 'Cancel',
    });

    if (!authResult.success) {
      throw new Error(authResult.error ?? 'auth_failed');
    }

    // Try new combined key first (1 prompt total). Fall back to legacy keys and migrate.
    let userId: string | null = null;
    let jwt: string | null = null;

    const combined = await SecureStore.getItemAsync(BIOMETRIC_KEYS.VAULT_CREDENTIALS);
    if (combined) {
      try {
        const parsed = JSON.parse(combined) as { userId: string; jwt: string };
        userId = parsed.userId;
        jwt = parsed.jwt;
      } catch {
        // corrupt — fall through to legacy
      }
    }

    if (!userId || !jwt) {
      // Legacy path: read old keys (triggers 2 more prompts), then migrate to combined key
      userId = await SecureStore.getItemAsync(BIOMETRIC_KEYS.VAULT_USER_ID, {
        requireAuthentication: true,
      });
      jwt = await SecureStore.getItemAsync(BIOMETRIC_KEYS.VAULT_JWT, {
        requireAuthentication: true,
      });

      if (userId && jwt) {
        // Silently migrate so next verify only needs 1 prompt
        await SecureStore.setItemAsync(
          BIOMETRIC_KEYS.VAULT_CREDENTIALS,
          JSON.stringify({ userId, jwt }),
        ).catch(() => undefined);
      }
    }

    if (!userId || !jwt) {
      await log.warn('Biometric', 'Biometric credentials missing from SecureStore — re-enroll required');
      throw new Error('re_enroll');
    }

    try {
      const body: { user_id: string; vault_id?: string } = { user_id: userId };
      if (vaultId) body.vault_id = vaultId;

      const response = await ApiService.post<{
        success: boolean;
        vaults: unknown[];
        unlock_sent?: boolean;
        vault_offline?: boolean;
      }>(
        API_CONFIG.ENDPOINTS.BIOMETRICS.VERIFY,
        body,
        jwt
      );
      await log.info('Biometric', 'Biometric session verified', { userId });
      return response;
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      if (status === 401) {
        // JWT expired — clear stored credentials and force re-enroll
        await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.VAULT_USER_ID).catch(() => {});
        await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.VAULT_JWT).catch(() => {});
        throw new Error('jwt_expired');
      }
      throw error;
    }
  }

  // ─── Server-side face recognition ────────────────────────────────────────

  /**
   * Returns true if the user has enrolled their face on the backend.
   * Uses a local SecureStore flag set after successful enrollment.
   */
  static async isFaceEnrolled(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(BIOMETRIC_KEYS.FACE_ENROLLED);
      return val === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Send a photo to POST /biometrics/enroll-face.
   * Sets a local flag on success so isFaceEnrolled() returns true.
   */
  static async enrollFace(imageUri: string): Promise<{ enrolled: boolean }> {
    const accessToken = await StorageService.getAccessToken();
    if (!accessToken) throw new Error('No access token available');

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'face.jpg',
      type: 'image/jpeg',
    } as any);

    const result = await ApiService.postFormAuth<{ enrolled: boolean }>(
      API_CONFIG.ENDPOINTS.BIOMETRICS.FACE_ENROLL,
      formData,
      accessToken,
    );

    await SecureStore.setItemAsync(BIOMETRIC_KEYS.FACE_ENROLLED, 'true');
    await log.info('Biometric', 'Face enrollment complete');
    return result;
  }

  /**
   * Send a photo to POST /biometrics/verify-face.
   * If vaultId is provided the backend will send an unlock command on match.
   */
  static async verifyFace(
    imageUri: string,
    vaultId?: string,
  ): Promise<{ success: boolean; unlock_sent?: boolean; vault_offline?: boolean }> {
    const accessToken = await StorageService.getAccessToken();
    if (!accessToken) throw new Error('No access token available');

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'face.jpg',
      type: 'image/jpeg',
    } as any);
    if (vaultId) {
      formData.append('vault_id', vaultId);
    }

    const result = await ApiService.postFormAuth<{
      success: boolean;
      unlock_sent?: boolean;
      vault_offline?: boolean;
    }>(
      API_CONFIG.ENDPOINTS.BIOMETRICS.FACE_VERIFY,
      formData,
      accessToken,
    );

    await log.info('Biometric', 'Face verification complete', { vaultId });
    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Delete the enrolled face from the backend and clear the local flag.
   */
  static async deleteFace(): Promise<void> {
    const accessToken = await StorageService.getAccessToken();
    if (!accessToken) throw new Error('No access token available');
    await ApiService.delete(API_CONFIG.ENDPOINTS.BIOMETRICS.FACE_DELETE, accessToken);
    await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.FACE_ENROLLED).catch(() => undefined);
    await log.info('Biometric', 'Face deleted');
  }

  /**
   * Clear biometric session credentials (vault_user_id + vault_jwt).
   * Called on logout or forced re-enroll.
   */
  static async clearBiometricSession(): Promise<void> {
    await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.VAULT_USER_ID).catch(() => {});
    await SecureStore.deleteItemAsync(BIOMETRIC_KEYS.VAULT_JWT).catch(() => {});
  }

  static getBiometricLabel(
    types: LocalAuthentication.AuthenticationType[],
    enrolledLevel?: number
  ): string {
    const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

    if (hasFace && hasFingerprint) return 'Face / Fingerprint';
    if (hasFace) return 'Face Recognition';
    // enrolledLevel 3 + fingerprint: Android face (Class 2) may also be enrolled
    // but is undetectable via supportedAuthenticationTypesAsync — use combined label.
    if (hasFingerprint && enrolledLevel === 3) return 'Face / Fingerprint';
    if (hasFingerprint) return 'Fingerprint';
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'Iris';
    return 'Biometrics';
  }
}
