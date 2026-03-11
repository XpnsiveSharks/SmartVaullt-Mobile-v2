import { useState, useCallback, useRef } from 'react';
import { VaultService } from '../../../../../service/VaultService';
import type { VaultMembership } from '../../../../../service/VaultService';

export type ProvisioningStep =
  | 'idle'
  | 'fetching_token'
  | 'showing_token'
  | 'polling'
  | 'done'
  | 'error';

export const useWiFiProvisioning = () => {
  const [step, setStep] = useState<ProvisioningStep>('idle');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [foundVault, setFoundVault] = useState<VaultMembership | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownVaultIdsRef = useRef<Set<string | number>>(new Set());

  const fetchToken = useCallback(async () => {
    setStep('fetching_token');
    setError(null);
    setToken(null);
    setFoundVault(null);

    try {
      const t = await VaultService.fetchProvisioningToken();
      setToken(t);

      // Snapshot existing vault IDs so we can detect the newly registered one
      const vaults = await VaultService.getUserVaults();
      knownVaultIdsRef.current = new Set(vaults.map(v => v.vault_id));

      setStep('showing_token');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch provisioning token');
      setStep('error');
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return; // already polling

    setStep('polling');

    pollIntervalRef.current = setInterval(async () => {
      try {
        const vaults = await VaultService.getUserVaults();
        const newVault = vaults.find(v => !knownVaultIdsRef.current.has(v.vault_id));
        if (newVault) {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setFoundVault(newVault);
          setStep('done');
        }
      } catch {
        // Ignore transient polling errors
      }
    }, 3000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setStep('idle');
    setToken(null);
    setError(null);
    setFoundVault(null);
    knownVaultIdsRef.current = new Set();
  }, [stopPolling]);

  return {
    step,
    token,
    error,
    foundVault,
    fetchToken,
    startPolling,
    stopPolling,
    reset,
  };
};
