import { useCallback, useEffect, useMemo, useState } from 'react';
import { BiometricService } from '../../service/BiometricService';

export const useBiometric = () => {
  const [isSecureStoreAvailable, setIsSecureStoreAvailable] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<number[]>([]);
  const [enrolledLevel, setEnrolledLevel] = useState(0);
  const [isLoginEnabled, setIsLoginEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const capabilities = await BiometricService.getCapabilities();
      setIsSecureStoreAvailable(capabilities.isSecureStoreAvailable);
      setHasHardware(capabilities.hasHardware);
      setIsEnrolled(capabilities.isEnrolled);
      setSupportedTypes(capabilities.supportedTypes);
      setEnrolledLevel(capabilities.enrolledLevel);

      const enabled = await BiometricService.isBiometricLoginEnabled();
      setIsLoginEnabled(enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load biometric status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const enableBiometricLogin = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await BiometricService.enableBiometricLogin();
      // Also enroll for /biometrics/verify flow (best-effort — non-fatal)
      try {
        await BiometricService.enrollBiometric();
      } catch {
        // enrollment failure is non-fatal
      }
      setIsLoginEnabled(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable biometric login';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disableBiometricLogin = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await BiometricService.disableBiometricLogin();
      setIsLoginEnabled(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable biometric login';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isVaultBiometricEnabled = useCallback(async (vaultId: number) => {
    return await BiometricService.isVaultBiometricEnabled(vaultId);
  }, []);

  const enableVaultBiometric = useCallback(async (vaultId: number, pin: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await BiometricService.enableVaultBiometric(vaultId, pin);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable biometric vault unlock';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disableVaultBiometric = useCallback(async (vaultId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await BiometricService.disableVaultBiometric(vaultId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable biometric vault unlock';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVaultPinWithBiometrics = useCallback(async (vaultId: number) => {
    return await BiometricService.getVaultPinWithBiometrics(vaultId);
  }, []);

  const biometricLabel = useMemo(
    () => BiometricService.getBiometricLabel(supportedTypes as any, enrolledLevel),
    [supportedTypes, enrolledLevel]
  );
  const isAvailable = isSecureStoreAvailable && hasHardware;
  const canPromptBiometrics = isAvailable && isEnrolled;

  return {
    isSecureStoreAvailable,
    hasHardware,
    isEnrolled,
    supportedTypes,
    isAvailable,
    canPromptBiometrics,
    biometricLabel,
    isLoginEnabled,
    isLoading,
    error,
    refreshStatus,
    enableBiometricLogin,
    disableBiometricLogin,
    isVaultBiometricEnabled,
    enableVaultBiometric,
    disableVaultBiometric,
    getVaultPinWithBiometrics,
  };
};
