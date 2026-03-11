import React from 'react';
import { View, Text } from 'react-native';

interface ErrorBannerProps {
  error: string | null;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error }) => {
  if (!error) return null;

  return (
    <View className="bg-red-900/50 mx-4 mt-4 p-3 rounded-lg">
      <Text className="text-red-200 text-sm">{error}</Text>
    </View>
  );
};