import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Login from '../component/users/login/Login';
import { useAuthContext } from '../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

const LoginScreen = () => {
  const { updateAuthState } = useAuthContext();
  const navigation = useNavigation();
  const route = useRoute();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleLoginSuccess = () => {
    updateAuthState();
  };

  useEffect(() => {
    const params = route.params as { resetMessage?: string } | undefined;
    if (params?.resetMessage) {
      setSuccessMessage(params.resetMessage);
      navigation.setParams({ resetMessage: undefined });
    }
  }, [navigation, route.params]);

  return (
    <View style={styles.screen}>
      {/* Atmospheric radial glow */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <Login
        onLoginSuccess={handleLoginSuccess}
        successMessage={successMessage}
        onClearSuccessMessage={() => setSuccessMessage(null)}
      />
    </View>
  );
};

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.bg.default,
  },
  glowTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: c.accent.default,
    opacity: 0.06,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: 40,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: c.accent.default,
    opacity: 0.04,
  },
});

export default LoginScreen;
