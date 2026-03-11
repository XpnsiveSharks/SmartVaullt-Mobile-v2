import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface WarningMessageProps {
  /**
   * The warning message to display (required)
   */
  message: string;

  /**
   * Whether to show the warning icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom container className for styling
   * @default "bg-warning-light/10 border border-warning-dark rounded-lg p-3 mb-4"
   */
  containerClassName?: string;

  /**
   * Custom text className for styling
   * @default "text-warning-dark text-sm"
   */
  textClassName?: string;

  /**
   * Custom icon size
   * @default 16
   */
  iconSize?: number;

  /**
   * Custom icon color
   * @default "#f59e0b"
   */
  iconColor?: string;
}

/**
 * Reusable component for displaying warning messages
 * Can be used for any type of warning throughout the application
 */
export const WarningMessage: React.FC<WarningMessageProps> = ({
  message,
  showIcon = true,
  containerClassName = "bg-warning-light/10 border border-warning-dark rounded-lg p-3 mb-4",
  textClassName = "text-warning-dark text-sm",
  iconSize = 16,
  iconColor = "#f59e0b",
}) => {
  return (
    <View className={containerClassName}>
      <View className="flex-row items-center">
        {showIcon && (
          <AlertTriangle size={iconSize} color={iconColor} className="mr-2 flex-shrink-0 self-start mt-1" />
        )}
        <Text className={`${textClassName} ${showIcon ? 'ml-2' : ''} flex-1`} style={{ flexWrap: 'wrap' }}>
          {message}
        </Text>
      </View>
    </View>
  );
};