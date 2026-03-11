import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import CustomModal from '../modals/CustomModal';
import { VaultMembership, VaultService } from '../../../service/VaultService';

interface SetPinModalProps {
  visible: boolean;
  vault: VaultMembership | null;
  onClose: () => void;
  onSuccess: (pin: string) => void;
}

const SetPinModal: React.FC<SetPinModalProps> = ({ visible, vault, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPin('');
      setConfirmPin('');
      setIsSaving(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!vault) return;

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PIN mismatch', 'PINs do not match. Please try again.');
      return;
    }

    setIsSaving(true);
    try {
      await VaultService.setPinForVault(String(vault.vault_id), pin);
      onSuccess(pin);
      onClose();
    } catch (error) {
      Alert.alert('Failed to set PIN', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!vault) return null;

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={`SET PIN — ${vault.vault_name ?? `UNIT-${vault.vault_id}`}`}
      primaryAction={{
        label: isSaving ? 'Saving...' : 'Set PIN',
        onPress: handleSubmit,
        disabled: isSaving || pin.length !== 6 || confirmPin.length !== 6,
        loading: isSaving,
      }}
      secondaryAction={{
        label: 'Cancel',
        onPress: onClose,
      }}
    >
      <View className="mb-6">
        <Text className="text-white font-black uppercase tracking-[2px] text-[10px] mb-2">
          New PIN
        </Text>
        <TextInput
          value={pin}
          onChangeText={text => setPin(text.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-digit PIN"
          placeholderTextColor="#52525B"
          secureTextEntry={true}
          keyboardType="number-pad"
          maxLength={6}
          className="bg-zinc-900 text-white px-4 py-4 rounded-2xl border border-zinc-800"
        />
      </View>

      <View className="mb-6">
        <Text className="text-white font-black uppercase tracking-[2px] text-[10px] mb-2">
          Confirm PIN
        </Text>
        <TextInput
          value={confirmPin}
          onChangeText={text => setConfirmPin(text.replace(/\D/g, '').slice(0, 6))}
          placeholder="Repeat PIN"
          placeholderTextColor="#52525B"
          secureTextEntry={true}
          keyboardType="number-pad"
          maxLength={6}
          className="bg-zinc-900 text-white px-4 py-4 rounded-2xl border border-zinc-800"
        />
      </View>
    </CustomModal>
  );
};

export default SetPinModal;
