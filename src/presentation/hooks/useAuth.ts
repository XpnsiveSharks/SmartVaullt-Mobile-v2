import { useState, useEffect } from 'react';
import { AuthService } from '../../service/AuthService';
import { UserDataService } from '../../service/UserDataService';
import { StorageService } from '../../service/StorageService';
import { BiometricService } from '../../service/BiometricService';
import { MockDataService } from '../../service/MockDataService';
import { NotificationService } from '../../service/NotificationService';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Check if token exists
      const token = await StorageService.getAccessToken();

      if (token) {
        // Validate token with backend and get user info
        try {
          const user = await UserDataService.getCurrentUser();
          if (user) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: user,
            });
            NotificationService.initialize().catch(() => {});
          } else {
            // Token exists but user fetch failed, clear token
            await AuthService.clearToken();
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
            });
          }
        } catch (userError) {
          console.error('Failed to fetch user info:', userError);
          // Token exists but user fetch failed, clear token
          await AuthService.clearToken();
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } else {
        // Attempt biometric login if enabled
        let biometricSuccess = false;
        try {
          const isEnabled = await BiometricService.isBiometricLoginEnabled();
          const canUse = await BiometricService.canUseBiometrics();
          if (isEnabled && canUse) {
            await AuthService.biometricLogin();
            biometricSuccess = true;
          }
        } catch (biometricError) {
          console.warn('Biometric login unavailable:', biometricError);
        }

        if (biometricSuccess) {
          try {
            const user = await UserDataService.getCurrentUser();
            if (user) {
              const ts = new Date().toISOString();
              console.log(`\n[SmartVault] ${ts} | INFO  | AUTH  | POST /api/v1/auth/biometric-login | method=BIOMETRIC | user=${user.username ?? 'unknown'} | status=200 OK`);
              console.log(`[SmartVault] ${ts} | INFO  | SESSION | Session started | user=${user.username ?? 'unknown'} | role=${user.role} | result=LOGIN_SUCCESS\n`);
              await MockDataService.addActivityLog({
                id: Date.now().toString(),
                status: 'success',
                eventType: 'vault_unlock',
                title: 'BIOMETRIC LOGIN',
                description: `Biometric authentication successful. Session started for ${user.firstName ?? user.username ?? 'user'}.`,
                timestamp: 'Just now',
                user: {
                  initials: `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U',
                  name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'User',
                },
              });
              setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user: user,
              });
              NotificationService.initialize().catch(() => {});
              return;
            }
          } catch (userError) {
            console.error('Failed to fetch user info after biometric login:', userError);
            await AuthService.clearToken();
          }
        }

        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await AuthService.login({ email, password });
      // Don't call checkAuthStatus here - let useLogin handle the complete flow
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateAuthState = async () => {
    await checkAuthStatus();
  };

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
    updateAuthState,
  };
};
