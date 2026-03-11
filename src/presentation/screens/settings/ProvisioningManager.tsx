import React from 'react';
import { View, Text } from 'react-native';
import { Wifi } from 'lucide-react-native';
import Provisioning from '../../component/provisioning/Provisioning';

interface ProvisioningManagerProps {
  // Add any props that might be needed in the future
  // For now, keeping it simple like NFCManager
}

export const ProvisioningManager: React.FC<ProvisioningManagerProps> = () => {
  return (
    <View 
      className="bg-surface-default rounded-3xl p-4 mb-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center mb-3">
        <Wifi size={26} color="#5e5e5e" />
        <Text className="text-text-dark text-lg font-semibold ml-2">Provisioning Management</Text>
      </View>
      <Provisioning />
    </View>
  );
};

