import { useCallback } from 'react';
import { Alert } from 'react-native';

interface ErrorContext {
  action: string;
  context?: string;
}

interface ErrorHandlerOptions {
  showAlert?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  /**
   * Centralized error handling with consistent user feedback
   */
  const handleError = useCallback((
    error: unknown,
    context: ErrorContext,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred',
    } = options;

    // Log error for debugging
    if (logError) {
      console.error(`❌ ${context.action} failed:`, error);
      if (context.context) {
        console.error(`📍 Context: ${context.context}`);
      }
    }

    // Determine error message
    let errorMessage = fallbackMessage;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as any).message || fallbackMessage;
    }

    // Show user-friendly alert
    if (showAlert) {
      Alert.alert(
        'Error',
        `${context.action} failed: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    }

    return errorMessage;
  }, []);

  /**
   * Handles API-specific errors with enhanced logging
   */
  const handleAPIError = useCallback((
    error: any,
    context: ErrorContext,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showAlert = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred',
    } = options;

    if (logError) {
      console.error('❌ === API ERROR DEBUG ===');
      console.error('❌ Action:', context.action);
      console.error('❌ Status:', error?.status);
      console.error('❌ Message:', error?.message);
      console.error('❌ Body:', error?.body);
      console.error('❌ === API ERROR DEBUG END ===');
    }

    let userMessage = fallbackMessage;

    if (error?.status === 401) {
      userMessage = 'Your session has expired. Please log in again.';
    } else if (error?.status === 403) {
      // Enhanced 403 error messages for role-based limits
      if (error?.message?.includes('NFC card')) {
        userMessage = 'Members are limited to 1 NFC card per vault';
      } else if (error?.message?.includes('keypad pin')) {
        userMessage = 'Members are limited to 1 keypad pin per vault';
      } else if (error?.message?.includes('Guest')) {
        userMessage = 'Guest users cannot create resources';
      } else {
        userMessage = 'You do not have permission to perform this action.';
      }
    } else if (error?.status >= 500) {
      userMessage = 'Server error. Please try again later.';
    } else {
      userMessage = error?.message || fallbackMessage;
    }

    if (showAlert) {
      Alert.alert('Error', userMessage, [{ text: 'OK' }]);
    }

    return userMessage;
  }, []);

  return {
    handleError,
    handleAPIError,
  };
};