import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { VaultService, VaultMembership } from '../../../../service/VaultService';

interface UseVaultAccessReturn {
  vaults: VaultMembership[];
  isLoading: boolean;
  error: string | null;
  loadVaults: () => Promise<void>;
  checkAdminAccess: (vaultId: number) => Promise<boolean>;
}

export function useVaultAccess(userId: string | null): UseVaultAccessReturn {
  const [vaults, setVaults] = useState<VaultMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVaults = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const userVaults = await VaultService.getUserVaults();
      setVaults(userVaults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vaults';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const checkAdminAccess = useCallback(async (vaultId: number): Promise<boolean> => {
    try {
      return await VaultService.checkAdminAccess(vaultId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check permissions';
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  useEffect(() => {
    loadVaults();
  }, [loadVaults]);

  return {
    vaults,
    isLoading,
    error,
    loadVaults,
    checkAdminAccess,
  };
}
