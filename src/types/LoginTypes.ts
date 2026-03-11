export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginState {
  isLoading: boolean;
  error: string | null;
}

export interface LoginActions {
  login: (email: string, password: string) => Promise<boolean>;
  clearError: () => void;
}

export interface UseLoginReturn extends LoginState, LoginActions {}

export interface LoginFormSetters {
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  setShowPassword: (value: boolean) => void;
  setShowError: (value: boolean) => void;
  setErrorMessage: (value: string) => void;
}

export interface LoginProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
  defaultUsername?: string;
  redirectTo?: string;
}