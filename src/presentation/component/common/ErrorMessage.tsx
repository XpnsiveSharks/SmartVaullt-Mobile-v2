import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface ErrorMessageProps {
  /**
   * The error message to display (required)
   */
  message: string;

  /**
   * Whether to show the error icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom container className for styling
   * @default "bg-error-default/10 border border-error-dark rounded-lg p-3 mb-4"
   */
  containerClassName?: string;

  /**
   * Custom text className for styling
   * @default "text-error-dark text-sm"
   */
  textClassName?: string;

  /**
   * Custom icon size
   * @default 16
   */
  iconSize?: number;

  /**
   * Custom icon color
   * @default "#ef4444"
   */
  iconColor?: string;
}

/**
 * Reusable component for displaying error messages
 * Can be used for any type of error message throughout the application
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  showIcon = true,
  containerClassName = "bg-error-default/10 border border-error-dark rounded-lg p-3 mb-4",
  textClassName = "text-error-dark text-sm",
  iconSize = 24,
  iconColor = "#ef4444",
}) => {
  return (
    <View className={containerClassName}>
      <View className="flex-row items-center">
        {showIcon && (
          <View className="mr-3 flex-shrink-0">
            <AlertCircle size={iconSize} color={iconColor} />
          </View>
        )}
        <Text className={`${textClassName} flex-1`}>
          {message}
        </Text>
      </View>
    </View>
  );
};
