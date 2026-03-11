import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { VaultService, VaultMembership } from '../../service/VaultService';
import { StorageService } from '../../service/StorageService';
import { useAuthContext } from '../context/AuthContext';

interface VaultContextType {
   availableVaults: VaultMembership[];
   adminVaults: VaultMembership[];
   memberVaults: VaultMembership[];
   guestVaults: VaultMembership[];
   currentVaultId: number | null;
   currentVault: VaultMembership | null;
   loading: boolean;
   error: string | null;
   loadVaults: () => Promise<void>;
   retryLoadVaults: () => Promise<void>;
   forceRefreshVaults: () => Promise<void>;
   selectVault: (vaultId: number) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [availableVaults, setAvailableVaults] = useState<VaultMembership[]>([]);
  const [currentVaultId, setCurrentVaultId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadVaults = async () => {
    // Prevent multiple simultaneous loads
    if (loading && hasLoadedOnce) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Debug: Vault loading with token validation
      const token = await StorageService.getAccessToken();

      if (!token) {
        setError('Please log in to access vault data');
        return;
      }

      // Use token immediately - delay was causing token invalidation
      const freshToken = await StorageService.getAccessToken();

      const allVaults = await VaultService.getUserVaults(freshToken || token);
      
      console.log('🔍 VaultContext - API returned vaults:', allVaults.length, 'vaults');

      // Set all available vaults (admin, member, guest)
      setAvailableVaults(allVaults);

      // Set the first available vault as current if not already set
      if (allVaults.length > 0 && !currentVaultId) {
        setCurrentVaultId(allVaults[0].vault_id);
      } else if (allVaults.length === 0) {
        setCurrentVaultId(null);
      }

      setHasLoadedOnce(true);
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Failed to load vaults';
       setError(`Vault loading failed: ${errorMessage}`);
     } finally {
       setLoading(false);
     }
  };

  const selectVault = (vaultId: number) => {
    console.log('🔄 VaultContext - Selecting vault:', vaultId);
    setCurrentVaultId(vaultId);
  };

  // Computed vault types for easy access
  const adminVaults = useMemo(() => VaultService.getAdminVaults(availableVaults), [availableVaults]);
  const memberVaults = useMemo(() => VaultService.getMemberVaults(availableVaults), [availableVaults]);
  const guestVaults = useMemo(() => availableVaults.filter(v => v.role === 'guest'), [availableVaults]);
  
  // Current vault object
  const currentVault = useMemo(() => {
    const vault = availableVaults.find(vault => vault.vault_id === currentVaultId) || null;
    if (__DEV__) {
      console.log('🔄 VaultContext - currentVault updated:', vault ? { id: vault.vault_id, role: vault.role } : null);
    }
    return vault;
  }, [availableVaults, currentVaultId]);

  const retryLoadVaults = async () => {
    setHasLoadedOnce(false);
    await loadVaults();
  };

  const forceRefreshVaults = async () => {
    console.log('🔄 VaultContext: Force refreshing vault list...');
    setHasLoadedOnce(false);
    setAvailableVaults([]);
    setCurrentVaultId(null);
    await loadVaults();
    console.log('✅ VaultContext: Vault list refresh completed');
  };

  useEffect(() => {
    // Wait for authentication to complete before loading vaults
    if (authLoading) {
      // Still loading authentication, wait
      setLoading(true);
      setError(null);
      return;
    }

    if (!isAuthenticated) {
      // Not authenticated, clear vaults and reset flags
      console.log('🔍 VaultContext - User logged out, clearing vaults');
      setAvailableVaults([]);
      setCurrentVaultId(null);
      setLoading(false);
      setHasLoadedOnce(false); // Reset flag so vaults reload on next login
      setError('Please log in to access vault data');
      return;
    }

    // Authenticated, load vaults
    if (isAuthenticated && !hasLoadedOnce) {
      console.log('🔍 VaultContext - Authentication complete, loading vaults...');
      loadVaults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, hasLoadedOnce]); // Depend on auth state

  // Combine auth loading and vault loading states
  const combinedLoading = authLoading || loading;

  return (
    <VaultContext.Provider
      value={{
        availableVaults,
        adminVaults,
        memberVaults,
        guestVaults,
        currentVaultId,
        currentVault,
        loading: combinedLoading,
        error,
        loadVaults,
        retryLoadVaults,
        forceRefreshVaults,
        selectVault,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVaultManagement = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVaultManagement must be used within a VaultProvider');
  }
  return context;
};