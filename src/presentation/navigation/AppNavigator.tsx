import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import PasswordResetScreen from '../screens/PasswordResetScreen';
import { useAuthContext } from '../context/AuthContext';
import { useVaultManagement } from '../hooks/VaultContext';
import Provisioning from '../component/provisioning/Provisioning';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { availableVaults, loading: vaultsLoading } = useVaultManagement();
  const [showProvisioningPrompt, setShowProvisioningPrompt] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasPrompted(false);
      return;
    }
    if (!isLoading && !vaultsLoading && availableVaults.length === 0 && !hasPrompted) {
      setShowProvisioningPrompt(true);
      setHasPrompted(true);
    }
  }, [isAuthenticated, isLoading, vaultsLoading, availableVaults.length, hasPrompted]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
          </>
        )}
      </Stack.Navigator>

      <Provisioning
        visible={showProvisioningPrompt}
        onClose={() => setShowProvisioningPrompt(false)}
      />
    </>
  );
};

export default AppNavigator;
