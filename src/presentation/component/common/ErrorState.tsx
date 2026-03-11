import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  className = "mb-4"
}) => {
  return (
    <View className={className}>
      <Text className="text-red-400 mb-2">{error}</Text>
      <TouchableOpacity
        className="bg-primary px-3 py-2 rounded-lg"
        onPress={onRetry}
      >
        <Text className="text-white text-center">Retry</Text>
      </TouchableOpacity>
    </View>
  );
};