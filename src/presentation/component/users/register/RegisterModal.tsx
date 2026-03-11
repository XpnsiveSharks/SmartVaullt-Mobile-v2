import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import CustomModal from '../../modals/CustomModal';
import { ApiService } from '../../../../service/ApiService';
import { API_CONFIG } from '../../../../config/api';
import { AuthService } from '../../../../service/AuthService';
import { BiometricService } from '../../../../service/BiometricService';

type RegisterModalProps = {
  visible: boolean;
  onClose: () => void;
  onRegisterSuccess?: () => void;
  onShowVerification?: (username: string) => void;
  onVerificationSuccess?: () => void;
};

const RegisterModal: React.FC<RegisterModalProps> = ({
  visible,
  onClose,
  onRegisterSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [signupTicket, setSignupTicket] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setSignupTicket('');
    setFullName('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleStep1 = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await ApiService.postPublic(API_CONFIG.ENDPOINTS.AUTH.REQUEST_OTP, { email });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiService.postPublic<{ signup_ticket: string }>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
        { email, otp }
      );
      setSignupTicket(response.signup_ticket);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await ApiService.postPublic(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {
        email,
        password,
        full_name: fullName,
        signup_ticket: signupTicket,
      });

      // Auto-login after signup
      try {
        await AuthService.login({ email, password });
      } catch {
        // Login failed — registration succeeded, close without biometric prompt
        onRegisterSuccess?.();
        resetForm();
        onClose();
        return;
      }

      const canUseBiometrics = await BiometricService.canUseBiometrics();
      if (canUseBiometrics) {
        Alert.alert(
          'Enable Biometric Login?',
          'Use Face ID or Fingerprint to log in faster next time.',
          [
            {
              text: 'Enable',
              onPress: async () => {
                try {
                  await BiometricService.enableBiometricLogin();
                } catch {
                  // Non-fatal — biometric enrollment failed silently
                }
                onRegisterSuccess?.();
                resetForm();
                onClose();
              },
            },
            {
              text: 'Not now',
              style: 'cancel',
              onPress: () => {
                onRegisterSuccess?.();
                resetForm();
                onClose();
              },
            },
          ]
        );
      } else {
        onRegisterSuccess?.();
        resetForm();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitle = step === 1 ? 'CREATE ACCOUNT' : step === 2 ? 'VERIFY EMAIL' : 'SET CREDENTIALS';

  const stepPrimaryAction =
    step === 1
      ? { label: 'SEND CODE', onPress: handleStep1, disabled: !email.trim() || isLoading, loading: isLoading }
      : step === 2
      ? { label: 'VERIFY CODE', onPress: handleStep2, disabled: otp.length !== 6 || isLoading, loading: isLoading }
      : { label: 'ENROLL', onPress: handleStep3, disabled: !fullName.trim() || password.length < 12 || password !== confirmPassword || isLoading, loading: isLoading };

  const stepSecondaryAction =
    step === 1
      ? undefined
      : step === 2
      ? { label: 'BACK', onPress: () => { setStep(1); setError(null); setOtp(''); } }
      : { label: 'BACK', onPress: () => { setStep(2); setError(null); } };

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title={stepTitle}
      primaryAction={stepPrimaryAction}
      secondaryAction={stepSecondaryAction}
    >
      {step === 1 && (
        <View className="w-full">
          {error && (
            <View className="bg-red-950 border border-red-800 rounded-2xl p-3 mb-4">
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            </View>
          )}
          <View className="mb-4">
            <Text className="text-sm font-medium text-zinc-300 mb-2">Email *</Text>
            <View className="flex-row items-center border border-zinc-700 rounded-2xl px-3 py-2 bg-zinc-900">
              <Mail size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-white"
                placeholder="Enter your email address"
                placeholderTextColor="#52525B"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
          </View>
        </View>
      )}

      {step === 2 && (
        <View className="w-full">
          <Text className="text-zinc-400 text-sm text-center mb-4">
            A 6-digit code was sent to {email}
          </Text>
          {error && (
            <View className="bg-red-950 border border-red-800 rounded-2xl p-3 mb-4">
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            </View>
          )}
          <View className="mb-4">
            <Text className="text-sm font-medium text-zinc-300 mb-2">Verification Code *</Text>
            <View className="flex-row items-center border border-zinc-700 rounded-2xl px-3 py-2 bg-zinc-900">
              <TextInput
                className="flex-1 text-base text-white text-center tracking-widest"
                placeholder="000000"
                placeholderTextColor="#52525B"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
              />
            </View>
          </View>
        </View>
      )}

      {step === 3 && (
        <View className="w-full">
          {error && (
            <View className="bg-red-950 border border-red-800 rounded-2xl p-3 mb-4">
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            </View>
          )}
          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-zinc-300 mb-2">Full Name *</Text>
            <View className="flex-row items-center border border-zinc-700 rounded-2xl px-3 py-2 bg-zinc-900">
              <User size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-white"
                placeholder="Enter your full name"
                placeholderTextColor="#52525B"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>
          {/* Password */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-zinc-300 mb-2">Password * (min. 12 characters)</Text>
            <View className="flex-row items-center border border-zinc-700 rounded-2xl px-3 py-2 bg-zinc-900">
              <Lock size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-white"
                placeholder="Enter your password"
                placeholderTextColor="#52525B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading} className="ml-2">
                {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
              </TouchableOpacity>
            </View>
          </View>
          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-zinc-300 mb-2">Confirm Password *</Text>
            <View className="flex-row items-center border border-zinc-700 rounded-2xl px-3 py-2 bg-zinc-900">
              <Lock size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-white"
                placeholder="Confirm your password"
                placeholderTextColor="#52525B"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading} className="ml-2">
                {showConfirmPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </CustomModal>
  );
};

export default RegisterModal;
