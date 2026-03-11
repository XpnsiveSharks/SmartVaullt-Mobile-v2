import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import CustomModal from './CustomModal';
import { API_CONFIG } from '../../../config/api';

interface PasswordResetRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordResetRequestModal: React.FC<PasswordResetRequestModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestReset = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET}`;
      
      if (__DEV__) {
        console.log('PasswordResetRequestModal - Making request to:', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (__DEV__) {
        console.log('PasswordResetRequestModal - Response status:', response.status);
        console.log('PasswordResetRequestModal - Response ok:', response.ok);
      }

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Email Sent',
          'If an account with this email exists, you will receive password reset instructions.',
          [{ text: 'OK', onPress: onSuccess }]
        );
        setEmail('');
        onClose();
      } else {
        setError(data.detail || 'Failed to send reset email');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please try again.';
      setError(errorMessage);
      console.error('Password reset request error:', error);
      
      if (__DEV__) {
        console.error('PasswordResetRequestModal - Error details:', {
          message: errorMessage,
          email,
          baseUrl: API_CONFIG.BASE_URL,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title="Forgot Password?"
      icon={<Mail size={32} color="#ffb800" />}
      iconPosition="top"
      primaryAction={{
        label: isLoading ? "Sending..." : "Send Reset Link",
        onPress: handleRequestReset,
        disabled: isLoading || !email.trim(),
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
            Enter your email address and we'll send you a secure link to reset your password.
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Email Address
          </Text>
          <View className="flex-row items-center border border-border-dark rounded-2xl px-3 py-3">
            <Mail size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-base"
              placeholder="Enter your email address"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>
          {error && (
            <Text className="text-sm text-red-500 mt-1">{error}</Text>
          )}
        </View>

        {/* Security Note */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Text className="text-sm text-blue-800">
            🔒 For your security, password reset links expire after 1 hour. 
            If you don't receive an email, check your spam folder.
          </Text>
        </View>
      </View>
    </CustomModal>
  );
};

export default PasswordResetRequestModal;
