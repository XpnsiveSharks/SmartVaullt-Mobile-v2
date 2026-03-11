import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useThemeColors } from '../../context/ThemeContext';

interface ProvisioningErrorProps {
  error?: { message: string } | null;
  permissionGranted?: boolean | null;
}

const ProvisioningError: React.FC<ProvisioningErrorProps> = ({
  error,
  permissionGranted,
}) => {
  const colors = useThemeColors();

  if (!error && permissionGranted !== false) return null;

  if (error) {
    return (
      <View style={{ borderWidth: 1, borderColor: colors.status.danger, backgroundColor: `${colors.status.danger}18`, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <AlertCircle size={16} color={colors.status.danger} />
        <Text style={{ color: colors.status.danger, fontSize: 12, flex: 1 }}>{error.message}</Text>
      </View>
    );
  }

  if (permissionGranted === false) {
    return (
      <View style={{ borderWidth: 1, borderColor: colors.status.warning, backgroundColor: `${colors.status.warning}18`, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <AlertCircle size={16} color={colors.status.warning} />
        <Text style={{ color: colors.status.warning, fontSize: 12, flex: 1 }}>
          Bluetooth permissions required to scan for devices
        </Text>
      </View>
    );
  }

  return null;
};

export default ProvisioningError;
