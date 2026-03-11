import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePasswordReset } from '../hooks/usePasswordReset';

const PasswordResetScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { requestPasswordReset, confirmPasswordReset, isRequesting, isConfirming, requestError, confirmError, clearRequestError, clearConfirmError } = usePasswordReset();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const { height } = Dimensions.get('window');

  const handleRequestReset = async () => {
    try {
      await requestPasswordReset(email);
      setRequestSuccess(true);
      setStep(2);
    } catch {
      // Errors handled in hook state
    }
  };

  const handleConfirmReset = async () => {
    try {
      await confirmPasswordReset(token, newPassword);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Login',
            params: {
              resetMessage: 'Your password has been reset successfully. You can now log in with your new password.',
            },
          },
        ],
      });
    } catch {
      // Errors handled in hook state
    }
  };

  const handleBackToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const canSubmitRequest = !!email.trim() && !isRequesting;
  const canSubmitConfirm = !!token.trim() && !!newPassword && !isConfirming;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.background, { minHeight: height, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>RESET ACCESS</Text>
            <Text style={styles.subtitle}>SECURE RECOVERY PROTOCOL</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.stepContainer}>
              <Text style={styles.stepLabel}>STEP {step} OF 2</Text>
              <Text style={styles.stepTitle}>
                {step === 1 ? 'REQUEST RESET' : 'CONFIRM RESET'}
              </Text>
            </View>

            {step === 1 ? (
              <>
                <Text style={styles.description}>
                  Enter your email and we will send a secure reset token if an account exists.
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>EMAIL</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="EMAIL ADDRESS"
                      placeholderTextColor="#52525B"
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        if (requestError) clearRequestError();
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                  </View>
                </View>

                {requestError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{requestError}</Text>
                  </View>
                )}

                {requestSuccess && (
                  <View style={styles.successContainer}>
                    <Text style={styles.successText}>
                      If an account exists with that email, a reset link has been sent.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleRequestReset}
                  disabled={!canSubmitRequest}
                  style={[styles.button, !canSubmitRequest && styles.buttonDisabled]}
                >
                  {isRequesting ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Text style={styles.buttonText}>SEND RESET TOKEN</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.description}>
                  Enter the reset token from your email and choose a new password.
                </Text>

                {requestSuccess && (
                  <View style={styles.successContainer}>
                    <Text style={styles.successText}>
                      If an account exists with that email, a reset link has been sent.
                    </Text>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>RESET TOKEN</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="TOKEN FROM EMAIL"
                      placeholderTextColor="#52525B"
                      value={token}
                      onChangeText={(value) => {
                        setToken(value);
                        if (confirmError) clearConfirmError();
                      }}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="MIN 12 CHARACTERS"
                      placeholderTextColor="#52525B"
                      value={newPassword}
                      onChangeText={(value) => {
                        setNewPassword(value);
                        if (confirmError) clearConfirmError();
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {confirmError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{confirmError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleConfirmReset}
                  disabled={!canSubmitConfirm}
                  style={[styles.button, !canSubmitConfirm && styles.buttonDisabled]}
                >
                  {isConfirming ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Text style={styles.buttonText}>RESET PASSWORD</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.backLink} onPress={handleBackToLogin}>
              <Text style={styles.linkText}>BACK TO LOGIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 4,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#000000',
  },
  stepContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#71717A',
    letterSpacing: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: 1,
  },
  description: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eyeIcon: {
    marginLeft: 12,
  },
  eyeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#27272A',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  backLink: {
    alignSelf: 'center',
  },
  linkText: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorContainer: {
    backgroundColor: '#2D1215',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#5C2328',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#0F2A1F',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F4D35',
  },
  successText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PasswordResetScreen;
