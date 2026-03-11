import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Activity, Settings } from 'lucide-react-native';
import { Pressable, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ActivityScreen from '../screens/ActivityScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useThemeColors } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const BRAND = colors.accent.default;
  const MUTED = colors.muted.default;
  const BAR_BG = colors.cards.default;
  const BAR_BORDER = colors.border.default;

  return (
    <View style={[
      styles.bar,
      { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: BAR_BG, borderTopColor: BAR_BORDER },
    ]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let Icon = House;
        if (route.name === 'Activity') Icon = Activity;
        if (route.name === 'Settings') Icon = Settings;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
          >
            {isFocused && <View style={[styles.indicator, { backgroundColor: BRAND }]} />}
            <Icon
              color={isFocused ? BRAND : MUTED}
              size={22}
              strokeWidth={isFocused ? 2.5 : 1.5}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tab: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
