import React from 'react';
import { View, Text } from 'react-native';
import { Shield, User, Eye } from 'lucide-react-native';

interface RoleBadgeProps {
  role: 'admin' | 'member' | 'guest';
  size?: 'sm' | 'md' | 'lg';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          icon: Shield,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
        };
      case 'member':
        return {
          label: 'Member',
          icon: User,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
        };
      case 'guest':
        return {
          label: 'Guest',
          icon: Eye,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
        };
      default:
        return {
          label: 'Unknown',
          icon: User,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          text: 'text-xs',
          iconSize: 12,
        };
      case 'md':
        return {
          container: 'px-3 py-1.5',
          text: 'text-sm',
          iconSize: 14,
        };
      case 'lg':
        return {
          container: 'px-4 py-2',
          text: 'text-base',
          iconSize: 16,
        };
      default:
        return {
          container: 'px-3 py-1.5',
          text: 'text-sm',
          iconSize: 14,
        };
    }
  };

  const roleConfig = getRoleConfig();
  const sizeConfig = getSizeConfig();
  const IconComponent = roleConfig.icon;

  return (
    <View
      className={`flex-row items-center rounded-full border ${roleConfig.bgColor} ${roleConfig.textColor} ${roleConfig.borderColor} ${sizeConfig.container}`}
    >
      <IconComponent size={sizeConfig.iconSize} className="mr-1" />
      <Text className={`font-medium ${sizeConfig.text} ${roleConfig.textColor}`}>
        {roleConfig.label}
      </Text>
    </View>
  );
};