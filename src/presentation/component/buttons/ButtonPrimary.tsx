import { Text, TouchableOpacity, ActivityIndicator, View } from "react-native";
import React, { ReactElement } from "react";
import { useThemeColors } from "../../context/ThemeContext";

type ButtonPrimaryProps = {
  title: string;
  onPress: () => void;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactElement<{ color?: string; size?: number; className?: string }>;
  iconPosition?: "left" | "right";
};

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  title,
  onPress,
  className = "",
  textClassName = "",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
}) => {
  const colors = useThemeColors();

  const styledIcon =
    icon &&
    React.cloneElement(icon, {
      color: '#000000',
      size: icon.props.size ?? 20,
    });

  return (
    <TouchableOpacity
      onPress={!disabled && !loading ? onPress : undefined}
      activeOpacity={0.7}
      disabled={disabled || loading}
      className={`rounded-2xl px-4 py-4 flex-row items-center justify-center w-full
        ${disabled ? "opacity-30" : ""}
        ${className}`}
      style={{
        backgroundColor: colors.accent.default,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: colors.accent.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: disabled ? 0 : 0.2,
        shadowRadius: 10,
        elevation: disabled ? 0 : 5,
      }}
    >
      {loading ? (
        <ActivityIndicator color="black" />
      ) : (
        <View className="flex-row items-center justify-center">
          {styledIcon && iconPosition === "left" && (
            <View className="mr-2">{styledIcon}</View>
          )}
          <Text
            className={`text-black text-base font-black uppercase tracking-widest text-center ${textClassName}`}
          >
            {title}
          </Text>
          {styledIcon && iconPosition === "right" && (
            <View className="ml-2">{styledIcon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ButtonPrimary;