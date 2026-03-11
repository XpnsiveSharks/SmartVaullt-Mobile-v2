import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

interface SuccessMessageProps {
  /**
   * The success message to display (required)
   */
  message: string;

  /**
   * Whether to show the success icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom container className for styling
   * @default "bg-success-default/10 border border-success-dark rounded-lg p-3 mb-4"
   */
  containerClassName?: string;

  /**
   * Custom text className for styling
   * @default "text-success-dark text-sm"
   */
  textClassName?: string;

  /**
   * Custom icon size
   * @default 16
   */
  iconSize?: number;

  /**
   * Custom icon color
   * @default "#22c55e"
   */
  iconColor?: string;
}

/**
 * Reusable component for displaying success messages
 * Can be used for any type of success message throughout the application
 */
export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  showIcon = true,
  containerClassName = "bg-success-default/10 border border-success-dark rounded-lg p-3 mb-4",
  textClassName = "text-success-dark text-sm",
  iconSize = 24,
  iconColor = "#22c55e",
}) => {
  return (
    <View className={containerClassName}>
      <View className="flex-row items-center">
        {showIcon && (
          <View className="mr-3 flex-shrink-0">
            <CheckCircle size={iconSize} color={iconColor} />
          </View>
        )}
        <Text className={`${textClassName} flex-1`}>
          {message}
        </Text>
      </View>
    </View>
  );
};
