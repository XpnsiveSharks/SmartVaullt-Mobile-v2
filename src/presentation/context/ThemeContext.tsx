import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ThemeColors } from '../../theme/colors';

const STORAGE_KEY = '@theme_mode';

type ThemeContextType = {
  isDark: boolean;
  toggle: () => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggle: () => {},
  colors: darkColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  const value = useMemo(
    () => ({ isDark, toggle, colors: isDark ? darkColors : lightColors }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeColors = () => useContext(ThemeContext).colors;
export const useTheme = () => useContext(ThemeContext);
