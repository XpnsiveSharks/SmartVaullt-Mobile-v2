import React from 'react';
import { View, Text } from 'react-native';
import { Info } from 'lucide-react-native';

interface InfoMessageProps {
  /**
   * The info message to display (required)
   */
  message: string;

  /**
   * Whether to show the info icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom container className for styling
   * @default "bg-info-default/10 border border-info-dark rounded-lg p-3 mb-4"
   */
  containerClassName?: string;

  /**
   * Custom text className for styling
   * @default "text-info-dark text-sm"
   */
  textClassName?: string;

  /**
   * Custom icon size
   * @default 16
   */
  iconSize?: number;

  /**
   * Custom icon color
   * @default "#3b82f6"
   */
  iconColor?: string;
}

/**
 * Reusable component for displaying informational messages
 * Can be used for any type of info message throughout the application
 */
export const InfoMessage: React.FC<InfoMessageProps> = ({
  message,
  showIcon = true,
  containerClassName = "bg-info-default/10 border border-info-dark rounded-lg p-3 mb-4",
  textClassName = "text-info-dark text-sm",
  iconSize = 24,
  iconColor = "#3b82f6",
}) => {
  return (
    <View className={containerClassName}>
      <View className="flex-row items-center">
        {showIcon && (
          <View className="mr-3 flex-shrink-0">
            <Info size={iconSize} color={iconColor} />
          </View>
        )}
        <Text className={`${textClassName} flex-1`}>
          {message}
        </Text>
      </View>
    </View>
  );
};
