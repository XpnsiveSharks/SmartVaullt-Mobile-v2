import React from 'react';
import { View, Text } from 'react-native';
import { SignalBars } from './SignalBars';
import { SignalUtils } from '../../../utils/signalUtils';

interface SignalIndicatorProps {
  rssi: number;
  showPercentage?: boolean;
  showDescription?: boolean;
  showDistance?: boolean;
  compact?: boolean;
}

export const SignalIndicator: React.FC<SignalIndicatorProps> = ({
  rssi,
  showPercentage = false,
  showDescription = true,
  showDistance = false,
  compact = false
}) => {
  const signal = SignalUtils.getSignalStrength(rssi);
  const percentage = SignalUtils.rssiToPercentage(rssi);
  const distance = SignalUtils.getDistanceEstimate(rssi);

  if (compact) {
    return (
      <View className="flex-row items-center">
        <SignalBars rssi={rssi} size="small" />
        <Text className="text-xs text-gray-600 ml-2">
          {showPercentage ? `${percentage}%` : signal.description}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center">
      <View className="mr-2">
        <SignalBars rssi={rssi} size="medium" />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center">
          {showDescription && (
            <Text className="text-sm font-medium" style={{ color: signal.color }}>
              {signal.description}
            </Text>
          )}
          {showPercentage && (
            <Text className="text-xs text-gray-500 ml-2">
              ({percentage}%)
            </Text>
          )}
        </View>
        {showDistance && (
          <Text className="text-xs text-gray-500">
            {distance}
          </Text>
        )}
      </View>
    </View>
  );
};
