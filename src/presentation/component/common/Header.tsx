import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HEADER_CONSTANTS } from './HeaderConstants';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  titleClassName?: string;
  containerClassName?: string;
  userName?: string;
  userInitials?: string;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  rightComponent,
  titleClassName = HEADER_CONSTANTS.DEFAULT_TITLE_CLASS,
  containerClassName = HEADER_CONSTANTS.DEFAULT_CONTAINER_CLASS,
  userName,
  userInitials,
  onProfilePress,
  onSettingsPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ paddingTop: Math.max(insets.top, 16) }}
      className={`flex-row items-center justify-between px-6 pb-4 bg-black border-b border-zinc-900 ${containerClassName}`}
    >
      {/* Title on the left */}
      <View>
        <Text className='text-white text-xl font-black tracking-tighter'>
            SMARTVAULT
        </Text>
        <Text className='text-zinc-500 text-[8px] font-bold uppercase tracking-[3px]'>
            Terminal
        </Text>
      </View>
      
      {/* Right side container */}
      <View className="flex-row items-center gap-3">
        {rightComponent && (
          <View>
            {rightComponent}
          </View>
        )}
        
        {/* User Icon Button */}
        <TouchableOpacity
          onPress={() => console.log('User profile pressed')}
          className="w-10 h-10 rounded-xl bg-white items-center justify-center border border-white"
          accessible={true}
          accessibilityRole="button"
        >
          <UserCircle size={22} color="#000000" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};