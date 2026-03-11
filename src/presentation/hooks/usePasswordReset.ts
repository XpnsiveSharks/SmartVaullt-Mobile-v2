import { useState } from 'react';
import { AuthService } from '../../service/AuthService';
import { ApiError } from '../../service/ApiService';
import { ValidationService } from '../../service/ValidationService';

type UsePasswordResetReturn = {
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  isRequesting: boolean;
  isConfirming: boolean;
  requestError: string | null;
  confirmError: string | null;
  clearRequestError: () => void;
  clearConfirmError: () => void;
};

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;
const MIN_TOKEN_LENGTH = 20;

export const usePasswordReset = (): UsePasswordResetReturn => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const requestPasswordReset = async (email: string): Promise<void> => {
    if (!email.trim()) {
      const message = 'Email is required';
      setRequestError(message);
      throw new Error(message);
    }

    if (!ValidationService.isValidEmail(email.trim())) {
      const message = 'Please enter a valid email address';
      setRequestError(message);
      throw new Error(message);
    }

    setIsRequesting(true);
    setRequestError(null);

    try {
      await AuthService.requestPasswordReset(email.trim().toLowerCase());
    } catch (error) {
      const message = mapPasswordResetError(error);
      setRequestError(message);
      throw new Error(message);
    } finally {
      setIsRequesting(false);
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string): Promise<void> => {
    if (!token.trim()) {
      const message = 'Reset token is required';
      setConfirmError(message);
      throw new Error(message);
    }

    if (token.trim().length < MIN_TOKEN_LENGTH) {
      const message = 'Reset token must be at least 20 characters';
      setConfirmError(message);
      throw new Error(message);
    }

    if (!newPassword) {
      const message = 'New password is required';
      setConfirmError(message);
      throw new Error(message);
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      const message = 'Password must be at least 12 characters';
      setConfirmError(message);
      throw new Error(message);
    }

    if (newPassword.length > MAX_PASSWORD_LENGTH) {
      const message = 'Password must be 128 characters or less';
      setConfirmError(message);
      throw new Error(message);
    }

    setIsConfirming(true);
    setConfirmError(null);

    try {
      await AuthService.confirmPasswordReset(token.trim(), newPassword);
    } catch (error) {
      const message = mapPasswordResetError(error);
      setConfirmError(message);
      throw new Error(message);
    } finally {
      setIsConfirming(false);
    }
  };

  const clearRequestError = () => setRequestError(null);
  const clearConfirmError = () => setConfirmError(null);

  return {
    requestPasswordReset,
    confirmPasswordReset,
    isRequesting,
    isConfirming,
    requestError,
    confirmError,
    clearRequestError,
    clearConfirmError,
  };
};

const mapPasswordResetError = (error: unknown): string => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return error.message || 'Invalid reset request. Please check your inputs.';
      case 401:
      case 403:
        return 'This reset token is invalid or has expired.';
      case 404:
        return 'Reset token not found. Please request a new one.';
      case 409:
        return 'This reset request is no longer valid. Please request a new one.';
      case 429:
        return 'Too many requests. Please wait a few minutes and try again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'Password reset failed. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message || 'Password reset failed. Please try again.';
  }

  return 'Password reset failed. Please try again.';
};
