import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColors } from '../../context/ThemeContext';

interface ProvisioningHeaderProps {
  message: string;
}

const ProvisioningHeader: React.FC<ProvisioningHeaderProps> = ({ message }) => {
  const colors = useThemeColors();
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ borderWidth: 1, borderColor: colors.border.default, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.muted.default, fontSize: 12, flex: 1, textAlign: 'center' }}>{message}</Text>
      </View>
    </View>
  );
};

export default ProvisioningHeader;


