import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import ButtonPrimary from '../buttons/ButtonPrimary';
import ButtonSecondary from '../buttons/ButtonSecondary';
import { useThemeColors } from '../../context/ThemeContext';

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  primaryAction?: {  
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean; 
  };
  icon?: React.ReactNode; 
  iconPosition?: 'left' | 'right' | 'top'; 
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
};

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  children,
  title,
  primaryAction,
  secondaryAction,
  icon,
  iconPosition = 'left',
}) => {
  const colors = useThemeColors();
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/90 justify-center px-4">
        <SafeAreaView
          style={{ backgroundColor: colors.cards.default, borderColor: colors.border.default, borderWidth: 1, borderRadius: 32, overflow: 'hidden', maxHeight: '85%' }}
        >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.border.default }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
                {icon && iconPosition === 'left' && <View style={{ marginRight: 12 }}>{icon}</View>}
                <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text.default, textTransform: 'uppercase', letterSpacing: -0.5, flex: 1 }} numberOfLines={2}>{title}</Text>
                </View>
                <TouchableOpacity
                    onPress={onClose}
                    style={{ backgroundColor: colors.surface.default, padding: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border.default }}
                >
                <X size={20} color={colors.text.default} strokeWidth={3} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>

            {/* Footer */}
            {(primaryAction || secondaryAction) && (
                <View style={{ padding: 32, borderTopWidth: 1, borderTopColor: colors.border.default, backgroundColor: colors.bg.default }}>
                <View style={{ gap: 16 }}>
                    {primaryAction && (
                    <ButtonPrimary
                        title={primaryAction.label}
                        onPress={primaryAction.onPress}
                        disabled={primaryAction.disabled}
                        loading={primaryAction.loading}
                    />
                    )}
                    <ButtonSecondary
                    title={secondaryAction?.label ?? 'DISMISS'}
                    onPress={secondaryAction?.onPress ?? onClose}
                    />
                </View>
                </View>
            )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default CustomModal;