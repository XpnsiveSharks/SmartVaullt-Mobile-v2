import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import CustomModal from './CustomModal';
import { API_CONFIG } from '../../../config/api';


interface PasswordResetFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token?: string; // Optional token prop for direct use
}

const PasswordResetFormModal: React.FC<PasswordResetFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  token: propToken,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [token, setToken] = useState(propToken || '');
  const [error, setError] = useState('');

  // Get token from URL params when modal becomes visible (for web/navigation)
  useEffect(() => {
    if (visible && !propToken) {
      // In a real implementation, you'd get this from navigation params or URL
      // For now, we'll assume it's passed as prop
    }
  }, [visible, propToken]);

  // Validate token when modal becomes visible
  useEffect(() => {
    if (visible && token) {
      validateToken();
    }
  }, [visible, token]);

  const validateToken = async () => {
    if (!token) {
      setIsValidToken(false);
      return;
    }

    setIsValidating(true);
    setError('');

    setIsValidToken(true);
    setIsValidating(false);
  };

  const handleResetPassword = async () => {
    // Validate inputs
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.CONFIRM_PASSWORD_RESET}`;
      
      if (__DEV__) {
        console.log('PasswordResetFormModal - Making reset request...');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: password,
          confirm_password: confirmPassword,
        }),
      });

      if (__DEV__) {
        console.log('PasswordResetFormModal - Response status:', response.status);
      }

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success!',
          'Your password has been reset successfully. You can now log in with your new password.',
          [{ text: 'OK', onPress: onSuccess }]
        );
        handleClose();
      } else {
        setError(data.detail || 'Failed to reset password');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      setError(errorMessage);
      console.error('Password reset error:', error);
      
      if (__DEV__) {
        console.error('PasswordResetFormModal - Reset error:', {
          message: errorMessage,
          token,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsValidToken(null);
    onClose();
  };

  // Show loading while validating token
  if (isValidating) {
    return (
      <CustomModal
        visible={visible}
        onClose={handleClose}
        title="Validating Reset Link"
        icon={<Lock size={32} color="#9CA3AF" />}
        iconPosition="top"
        secondaryAction={{
          label: "Cancel",
          onPress: handleClose,
        }}
      >
        <View className="w-full items-center py-4">
          <Text className="text-gray-600 text-center">
            Please wait while we validate your reset link...
          </Text>
        </View>
      </CustomModal>
    );
  }

  // Show error if token is invalid
  if (isValidToken === false) {
    return (
      <CustomModal
        visible={visible}
        onClose={handleClose}
        title="Invalid Reset Link"
        icon={<Lock size={32} color="#ef4444" />}
        iconPosition="top"
        secondaryAction={{
          label: "Close",
          onPress: handleClose,
        }}
      >
        <View className="w-full">
          <View className="mb-4">
            <Text className="text-center text-gray-600 mb-4">
              {error || 'This password reset link is invalid or has expired.'}
            </Text>
            <View className="bg-red-50 border border-red-200 rounded-lg p-3">
              <Text className="text-sm text-red-800">
                💡 Please request a new password reset link from the login screen.
              </Text>
            </View>
          </View>
        </View>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title="Reset Password"
      icon={<CheckCircle size={32} color="#10b981" />}
      iconPosition="top"
      primaryAction={{
        label: isLoading ? "Resetting..." : "Reset Password",
        onPress: handleResetPassword,
        disabled: isLoading || !password.trim() || !confirmPassword.trim() || password !== confirmPassword,
        loading: isLoading,
      }}
      secondaryAction={{
        label: "Cancel",
        onPress: handleClose,
      }}
    >
      <View className="w-full">
        <View className="mb-6">
          <Text className="text-sm text-gray-600 text-center">
            Create a new password for your SmartVault account.
          </Text>
        </View>

        {/* New Password Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            New Password *
          </Text>
          <View className="flex-row items-center border border-border-dark rounded-2xl px-3 py-3">
            <Lock size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base"
              placeholder="Enter new password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (error) setError('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="ml-2"
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </Text>
          <View className="flex-row items-center border border-border-dark rounded-2xl px-3 py-3">
            <Lock size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (error) setError('');
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="ml-2"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <Text className="text-sm text-red-500 mb-4">{error}</Text>
        )}

        {/* Password Requirements */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Text className="text-sm text-blue-800 font-medium mb-1">Password Requirements:</Text>
          <Text className="text-sm text-blue-700">• At least 8 characters long</Text>
          <Text className="text-sm text-blue-700">• Passwords must match</Text>
        </View>
      </View>
    </CustomModal>
  );
};

export default PasswordResetFormModal;
