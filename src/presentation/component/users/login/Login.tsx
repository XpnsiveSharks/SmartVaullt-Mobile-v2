import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fingerprint } from 'lucide-react-native';
import { useLogin } from '../../../hooks/useLogin';
import { useNavigation } from '@react-navigation/native';
import { useBiometric } from '../../../hooks/useBiometric';
import { AuthService } from '../../../../service/AuthService';
import { BiometricService } from '../../../../service/BiometricService';
import RegisterModal from '../register/RegisterModal';
import { useThemeColors } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../../theme/colors';

const Login = ({
  onLoginSuccess,
  onLoginError,
  successMessage,
  onClearSuccessMessage,
}: {
  onLoginSuccess?: () => void;
  onLoginError?: (err: string) => void;
  successMessage?: string | null;
  onClearSuccessMessage?: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login, isLoading: loading, error } = useLogin();
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const {
    canPromptBiometrics,
    biometricLabel,
    isLoginEnabled,
    enableBiometricLogin,
    refreshStatus,
  } = useBiometric();

  const handleLogin = async () => {
    try {
      const success = await login(email, password);
      if (success) {
        if (canPromptBiometrics && !isLoginEnabled) {
          Alert.alert(
            'Enable biometric login?',
            `Use ${biometricLabel} to sign in faster next time.`,
            [
              { text: 'Not now', style: 'cancel' },
              {
                text: 'Enable',
                onPress: async () => {
                  try {
                    await enableBiometricLogin();
                    await refreshStatus();
                  } catch (biometricError) {
                    Alert.alert(
                      'Biometric setup failed',
                      biometricError instanceof Error
                        ? biometricError.message
                        : 'Unable to enable biometric login.'
                    );
                  }
                },
              },
            ]
          );
        }
        onLoginSuccess?.();
      }
    } catch (err: any) {
      onLoginError?.(err.message || 'Login failed');
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      await BiometricService.verifyBiometricSession();
      onLoginSuccess?.();
    } catch (err: any) {
      const code: string = err?.message ?? '';
      if (code === 're_enroll' || code === 'jwt_expired') {
        try {
          await AuthService.biometricLogin();
          onLoginSuccess?.();
        } catch (fallbackErr: any) {
          Alert.alert(
            'Biometric login failed',
            fallbackErr instanceof Error
              ? fallbackErr.message
              : 'Please sign in with email and password.'
          );
        }
      } else if (code === 'lockout') {
        Alert.alert('Too many attempts', 'Please sign in with email and password.');
      } else if (code === 'not_enrolled') {
        Alert.alert('Biometrics not set up', 'Enable Face ID or Fingerprint in device Settings.');
      } else if (code !== 'user_cancel') {
        Alert.alert(
          'Biometric login failed',
          err instanceof Error ? err.message : 'Please sign in with email and password.'
        );
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { height } = Dimensions.get('window');
  const isDisabled = loading || biometricLoading || !email || !password;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.container,
          { minHeight: height, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* ── Logo Area ── */}
        <View style={styles.logoArea}>
          <Text style={styles.brand}>SmartVault</Text>
          <View style={styles.brandRule} />
          <Text style={styles.brandSub}>Secure Access Terminal</Text>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Identifier</Text>
            <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={colors.muted.default}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Access Key</Text>
            <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor={colors.muted.default}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showHide}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Success message */}
          {!!successMessage && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMessage}</Text>
              <TouchableOpacity onPress={onClearSuccessMessage}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => navigation.navigate('PasswordReset' as never)}
          >
            <Text style={styles.forgotText}>Recover access</Text>
          </TouchableOpacity>

          {/* Authenticate button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isDisabled}
            style={[styles.authButton, isDisabled && styles.authButtonDisabled]}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.authButtonText}>Authenticate</Text>
            )}
          </TouchableOpacity>

          {/* Biometric button */}
          {canPromptBiometrics && isLoginEnabled && (
            <View style={styles.biometricWrap}>
              <TouchableOpacity
                onPress={handleBiometricLogin}
                disabled={biometricLoading || loading}
                style={[
                  styles.biometricButton,
                  (biometricLoading || loading) && styles.biometricButtonDisabled,
                ]}
                activeOpacity={0.8}
              >
                {biometricLoading ? (
                  <ActivityIndicator color={colors.accent.default} size="small" />
                ) : (
                  <Fingerprint size={24} color={colors.accent.default} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
              <Text style={styles.biometricLabel}>{biometricLabel}</Text>
            </View>
          )}

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.mutedText}>No account? </Text>
            <TouchableOpacity onPress={() => setShowRegister(true)}>
              <Text style={styles.signupLink}>Enroll now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <RegisterModal visible={showRegister} onClose={() => setShowRegister(false)} />
    </ScrollView>
  );
};

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brand: {
    fontSize: 32,
    fontWeight: '900',
    color: c.text.default,
    letterSpacing: -1,
  },
  brandRule: {
    width: 48,
    height: 2,
    backgroundColor: c.accent.default,
    borderRadius: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '700',
    color: c.muted.default,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  form: {},
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    color: c.text.default,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.cards.default,
    borderWidth: 1.5,
    borderColor: c.border.default,
    borderRadius: 14,
    paddingHorizontal: 18,
    height: 56,
  },
  inputWrapFocused: {
    borderColor: c.accent.default,
  },
  input: {
    flex: 1,
    color: c.text.default,
    fontSize: 14,
    fontWeight: '500',
  },
  showHide: {
    color: c.muted.default,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 10,
  },
  forgotWrap: {
    alignSelf: 'center',
    marginBottom: 28,
  },
  forgotText: {
    color: c.muted.default,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  authButton: {
    backgroundColor: c.accent.default,
    borderRadius: 16,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: c.accent.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  authButtonDisabled: {
    backgroundColor: c.surface.default,
    shadowOpacity: 0,
    elevation: 0,
  },
  authButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  biometricWrap: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  biometricButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: c.cards.default,
    borderWidth: 1.5,
    borderColor: c.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButtonDisabled: {
    borderColor: c.border.dark,
    opacity: 0.5,
  },
  biometricLabel: {
    color: c.muted.default,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedText: {
    color: c.muted.default,
    fontSize: 12,
    fontWeight: '500',
  },
  signupLink: {
    color: c.accent.default,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  successBox: {
    backgroundColor: `${c.status.success}1A`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${c.status.success}40`,
    alignItems: 'center',
  },
  successText: {
    color: c.status.success,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  dismissText: {
    color: c.text.default,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorBox: {
    backgroundColor: `${c.status.danger}1A`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${c.status.danger}40`,
  },
  errorText: {
    color: c.status.danger,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Login;
