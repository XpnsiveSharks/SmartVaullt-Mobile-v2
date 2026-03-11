import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  size?: number;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  size = 56,
  className = '',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`absolute bottom-32 right-6 bg-white rounded-full items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
      }}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Open actions menu"
      accessibilityHint="Opens a menu with join and invite options"
    >
      <View className="items-center justify-center">
        <Plus size={28} color="#000000" strokeWidth={3} />
      </View>
    </TouchableOpacity>
  );
};