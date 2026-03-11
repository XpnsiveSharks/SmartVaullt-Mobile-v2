import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/presentation/context/AuthContext';
import { VaultProvider } from './src/presentation/hooks/VaultContext';
import { ThemeProvider } from './src/presentation/context/ThemeContext';
import { AuthService } from './src/service/AuthService';
import AppNavigator from './src/presentation/navigation/AppNavigator';

// Register token refresh handler before any API calls
AuthService.initialize();

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <VaultProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </VaultProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;