import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface EnhancedEmptyStateProps {
  icon?: LucideIcon;
  iconSize?: number;
  iconColor?: string;
  title: string;
  message?: string;
}

export const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  icon: Icon,
  iconSize = 56,
  iconColor = '#ffb800',
  title,
  message,
}) => {
  return (
    <View className="bg-bg-default justify-center items-center px-6 py-12">
      <View
        className="rounded-3xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="bg-surface-default px-8 py-10 rounded-3xl items-center max-w-sm">
          {Icon && (
            <View className="mb-6 bg-primary-default rounded-full p-4">
              <Icon size={iconSize} color={'#f5f5f5'} />
            </View>
          )}
          <Text className="text-text-dark text-center text-xl font-semibold mb-2">
            {title}
          </Text>
          {message && (
            <Text className="text-muted-default text-center text-sm leading-6 mt-1">
              {message}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};