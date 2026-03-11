import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { VaultMembership } from '../../../service/VaultService';

interface VaultSelectorProps {
  vaults: VaultMembership[];
  selectedVaultId: number | null;
  onVaultSelect: (vaultId: number) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const VaultSelector: React.FC<VaultSelectorProps> = ({
  vaults,
  selectedVaultId,
  onVaultSelect,
  loading = false,
  error = null,
  onRetry
}) => {
  if (loading) {
    return (
      <Text className="text-muted-default mb-4">Loading vaults...</Text>
    );
  }

  if (error) {
    return (
      <View className="mb-4">
        <Text className="text-red-400 mb-2">{error}</Text>
        {onRetry && (
          <TouchableOpacity
            className="bg-primary px-3 py-2 rounded-lg"
            onPress={onRetry}
          >
            <Text className="text-white text-center">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (vaults.length === 0) {
    return (
      <Text className="text-muted-default mb-4">No vaults available</Text>
    );
  }

  if (vaults.length === 1) {
    const vault = vaults[0];
    return (
      <Text className="text-muted-default mb-4">
        Using {vault.vault_name || `Vault ${vault.vault_id}`} ({vault.role})
      </Text>
    );
  }

  return (
    <View className="mb-4">
      <Text className="text-white mb-2">Select Vault:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {vaults.map((vault) => (
          <TouchableOpacity
            key={vault.vault_id}
            className={`px-3 py-2 rounded-md mr-2 ${
              selectedVaultId === vault.vault_id ? 'bg-primary' : 'bg-neutral-600'
            }`}
            onPress={() => onVaultSelect(vault.vault_id)}
          >
            <Text
              className={`text-sm ${
                selectedVaultId === vault.vault_id ? 'text-white' : 'text-neutral-300'
              }`}
            >
              {vault.vault_name || `Vault ${vault.vault_id}`} ({vault.role})
              {vault.vault_location ? ` • ${vault.vault_location}` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};