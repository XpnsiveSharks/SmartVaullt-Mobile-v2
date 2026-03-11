import { LoginFormSetters, LoginFormData } from '../types/LoginTypes';

export interface LoginValidationResult {
  isValid: boolean;
  error?: string;
}

export interface LoginFormResetters extends Record<string, (value: any) => void> {
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  setShowPassword: (value: boolean) => void;
  setShowError: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
}

export const validateLoginForm = (username: string, password: string): LoginValidationResult => {
  if (!username.trim()) {
    return { isValid: false, error: 'Username is required' };
  }
  if (!password.trim()) {
    return { isValid: false, error: 'Password is required' };
  }
  return { isValid: true };
};

export const resetLoginForm = (setters: LoginFormResetters): void => {
  setters.setUsername('');
  setters.setPassword('');
  setters.setShowPassword(false);
  setters.setShowError(false);
  setters.setErrorMessage('');
};

export const createLoginFormData = (username: string, password: string): LoginFormData => {
  return {
    username: username.trim(),
    password: password
  };
};