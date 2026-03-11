import React from 'react';
import { View, Text } from 'react-native';
import { SignalUtils } from '../../../utils/signalUtils';

interface SignalBarsProps {
  rssi: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const SignalBars: React.FC<SignalBarsProps> = ({ 
  rssi, 
  size = 'medium',
  showLabel = false 
}) => {
  const signal = SignalUtils.getSignalStrength(rssi);
  const barCount = 4;
  
  const dimensions = {
    small: { width: 2, maxHeight: 12, gap: 1 },
    medium: { width: 3, maxHeight: 16, gap: 1 },
    large: { width: 4, maxHeight: 20, gap: 2 }
  };

  const { width, maxHeight, gap } = dimensions[size];

  return (
    <View className="flex-row items-end">
      {Array.from({ length: barCount }, (_, index) => {
        const barHeight = ((index + 1) / barCount) * maxHeight;
        const isActive = index < signal.bars;
        
        return (
          <View
            key={index}
            style={{
              width,
              height: barHeight,
              backgroundColor: isActive ? signal.color : '#e5e7eb',
              marginRight: index < barCount - 1 ? gap : 0,
              borderRadius: 1
            }}
          />
        );
      })}
      {showLabel && (
        <Text className="text-xs ml-2" style={{ color: signal.color }}>
          {signal.description}
        </Text>
      )}
    </View>
  );
};
