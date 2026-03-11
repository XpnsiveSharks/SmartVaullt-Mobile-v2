import React from 'react';
import { View, Text } from 'react-native';
import ButtonSecondary from '../buttons/ButtonSecondary';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-1 justify-center items-center px-4">
      <Text className="text-neutral-400 text-center mb-4">
        {title}
      </Text>
      {message && (
        <Text className="text-neutral-500 text-center text-sm mb-4">
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <ButtonSecondary
          title={actionLabel}
          onPress={onAction}
          className="bg-blue-600 border-blue-600"
          textClassName="text-white"
        />
      )}
    </View>
  );
};