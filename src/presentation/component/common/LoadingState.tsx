import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading..."
}) => {
  return (
    <View className="flex-1 bg-black justify-center items-center">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-text-dark mt-4">{message}</Text>
    </View>
  );
};