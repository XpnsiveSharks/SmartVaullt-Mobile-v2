// Vault creation is now handled by the ESP32 firmware via POST /devices/register.
// This hook is kept as a no-op to avoid breaking imports until
// VaultConfigurationModal is updated or removed.
export const useVaultCreation = () => {
  return {
    createVault: async (_data: unknown) => null,
    isCreating: false,
    creationError: null,
    resetCreation: () => {},
  };
};
