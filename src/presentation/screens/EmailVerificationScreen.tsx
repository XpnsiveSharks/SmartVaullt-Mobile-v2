import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react-native';
import { useAuthContext } from '../context/AuthContext';
import ButtonPrimary from '../component/buttons/ButtonPrimary';
import { API_CONFIG } from '../../config/api';

interface EmailVerificationScreenProps {
  username: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  username,
  onVerificationSuccess,
  onBack,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuthContext();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Initialize countdown
  useEffect(() => {
    setCountdown(60); // 60 seconds initial cooldown
  }, []);

  const handleCodeChange = (text: string) => {
    // Only allow numbers and limit to 6 digits
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setVerificationCode(numericText);
      setError(''); // Clear error when user types
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (__DEV__) {
        console.log('EmailVerificationScreen - Verifying code for user:', username);
        console.log('EmailVerificationScreen - Base URL:', API_CONFIG.BASE_URL);
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP}?username=${username}&verification_code=${verificationCode}`;
      
      if (__DEV__) {
        console.log('EmailVerificationScreen - Making verification request to:', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('EmailVerificationScreen - Response status:', response.status);
        console.log('EmailVerificationScreen - Response ok:', response.ok);
      }

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setError('');

        // Show success message
        setTimeout(() => {
          Alert.alert(
            'Success!',
            'Your email has been verified successfully!',
            [{ text: 'Continue', onPress: onVerificationSuccess }]
          );
        }, 1500);
      } else {
        setAttempts(attempts + 1);
        setError(data.detail || 'Verification failed. Please try again.');
        
        if (attempts + 1 >= maxAttempts) {
          Alert.alert(
            'Maximum Attempts Reached',
            'You have exceeded the maximum number of verification attempts. Please request a new verification code.',
            [{ text: 'Request New Code', onPress: resendCode }]
          );
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Verification error:', error);
      
      if (__DEV__) {
        console.error('EmailVerificationScreen - Error details:', {
          message: errorMessage,
          username,
          baseUrl: API_CONFIG.BASE_URL,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setError('');

    try {
      if (__DEV__) {
        console.log('EmailVerificationScreen - Resending code for user:', username);
        console.log('EmailVerificationScreen - Base URL:', API_CONFIG.BASE_URL);
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REQUEST_OTP}?username=${username}`;
      
      if (__DEV__) {
        console.log('EmailVerificationScreen - Making resend request to:', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (__DEV__) {
        console.log('EmailVerificationScreen - Resend response status:', response.status);
        console.log('EmailVerificationScreen - Resend response ok:', response.ok);
      }

      const data = await response.json();

      if (response.ok) {
        setVerificationCode('');
        setAttempts(0);
        setCountdown(60); // Reset countdown
        Alert.alert(
          'Email Sent',
          'A new verification code has been sent to your email address.'
        );
      } else {
        setError(data.detail || 'Failed to resend verification code');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Resend error:', error);
      
      if (__DEV__) {
        console.error('EmailVerificationScreen - Resend error details:', {
          message: errorMessage,
          username,
          baseUrl: API_CONFIG.BASE_URL,
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color="#10b981" />
          <Text style={styles.successTitle}>Email Verified!</Text>
          <Text style={styles.successMessage}>
            Your email has been successfully verified. You can now access all SmartVault features.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1a365d" />
        </TouchableOpacity>
        <Text style={styles.title}>Email Verification</Text>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.iconContainer}>
          <Mail size={32} color="#ffb800" />
        </View>
        <Text style={styles.subtitle}>Check Your Email</Text>
        <Text style={styles.description}>
          We've sent a 6-digit verification code to your email address. Please check your inbox and enter the code below.
        </Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      {/* Verification Input */}
      <View style={styles.verificationContainer}>
        <Text style={styles.inputLabel}>Verification Code</Text>
        <TextInput
          style={[styles.codeInput, error && styles.inputError]}
          value={verificationCode}
          onChangeText={handleCodeChange}
          keyboardType="numeric"
          maxLength={6}
          placeholder="Enter 6-digit code"
          placeholderTextColor="#6B7280"
          autoFocus
        />
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {attempts > 0 && (
          <Text style={styles.attemptsText}>
            Attempts remaining: {maxAttempts - attempts}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <ButtonPrimary
          title={isLoading ? "Verifying..." : "Verify Code"}
          onPress={verifyCode}
          disabled={verificationCode.length !== 6 || isLoading}
          loading={isLoading}
          className="mb-4"
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?
          </Text>
          <TouchableOpacity
            onPress={resendCode}
            disabled={countdown > 0 || isResending}
            style={styles.resendButton}
          >
            <RefreshCw
              size={16}
              color={countdown > 0 ? "#9CA3AF" : "#ffb800"}
            />
            <Text style={[
              styles.resendButtonText,
              countdown > 0 && styles.resendDisabledText
            ]}>
              {isResending 
                ? "Sending..." 
                : countdown > 0 
                ? `Resend in ${countdown}s` 
                : "Resend Code"
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Help Text */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          • Code expires in 15 minutes{'\n'}
          • Check your spam/junk folder{'\n'}
          • Contact support if issues persist
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verificationContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  codeInput: {
    height: 60,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a365d',
    backgroundColor: '#ffffff',
    letterSpacing: 8,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  attemptsText: {
    color: '#f59e0b',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#ffb800',
    fontWeight: '600',
    marginLeft: 6,
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
  resendDisabledText: {
    color: '#9CA3AF',
  },
  helpContainer: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 20,
    marginBottom: 15,
  },
  successMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default EmailVerificationScreen;
