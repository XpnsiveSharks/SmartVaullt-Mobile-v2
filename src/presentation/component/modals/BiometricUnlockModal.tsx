import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Fingerprint } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricService } from '../../../service/BiometricService';
import { VaultService } from '../../../service/VaultService';

interface BiometricUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  vaultName?: string;
  vaultId?: string;
}

const BiometricUnlockModal: React.FC<BiometricUnlockModalProps> = ({
  visible,
  onClose,
  vaultName = 'Vault',
  vaultId,
}) => {
  const [isCheckingEnabled, setIsCheckingEnabled] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [mode, setMode] = useState<'unlock' | 'enable'>('enable');
  const [pinInput, setPinInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setIsCheckingEnabled(true);
    setErrorMsg(null);
    setPinInput('');
    (async () => {
      try {
        const enabled = await BiometricService.isVaultBiometricEnabled(Number(vaultId));
        setIsEnabled(enabled);
        setMode(enabled ? 'unlock' : 'enable');
      } catch {
        setMode('enable');
      } finally {
        setIsCheckingEnabled(false);
      }
    })();
  }, [visible, vaultId]);

  const handleEnable = async () => {
    if (pinInput.length !== 6) {
      setErrorMsg('Enter a 6-digit PIN');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      await VaultService.setPinForVault(vaultId ?? '', pinInput);
      await BiometricService.enableVaultBiometric(Number(vaultId), pinInput);
      setIsEnabled(true);
      setMode('unlock');
      setPinInput('');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to enable biometric unlock');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: `Unlock ${vaultName}`,
        disableDeviceFallback: true,
        cancelLabel: 'Cancel',
      });

      if (!authResult.success) {
        if (authResult.error === 'user_cancel') {
          // No alert — just reset silently
          setIsProcessing(false);
          return;
        }
        if (authResult.error === 'lockout' || authResult.error === 'lockout_permanent') {
          setErrorMsg('Too many attempts. Use PIN to unlock.');
        } else if (authResult.error === 'not_enrolled') {
          setErrorMsg('Set up Face ID or Fingerprint in device Settings.');
        } else {
          setErrorMsg('Authentication failed. Try again.');
        }
        setIsProcessing(false);
        return;
      }

      const pin = await BiometricService.getVaultPinWithBiometrics(Number(vaultId));
      if (!pin) {
        setErrorMsg('Biometric unavailable. Enter your PIN manually.');
        setIsProcessing(false);
        return;
      }

      await VaultService.unlockWithPin(vaultId ?? '', pin);
      setIsProcessing(false);
      onClose();
      Alert.alert('Access Granted', `${vaultName} has been unlocked successfully.`);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to unlock vault');
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    await BiometricService.disableVaultBiometric(Number(vaultId));
    setIsEnabled(false);
    setMode('enable');
    setErrorMsg(null);
    setPinInput('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/90 justify-end">
        <SafeAreaView className="bg-zinc-950 border-t border-zinc-800 rounded-t-[40px] overflow-hidden">
          {/* Handle bar */}
          <View className="items-center pt-4 pb-2">
            <View className="w-12 h-1 bg-zinc-700 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-8 pt-4 pb-6">
            <View>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[3px]">
                Remote Unlock
              </Text>
              <Text className="text-white text-3xl font-black uppercase tracking-tighter mt-1">
                {mode === 'enable' ? 'Enable Biometrics' : 'Verify Identity'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-zinc-900 border border-zinc-800 p-2 rounded-full"
              activeOpacity={0.7}
            >
              <X size={20} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Vault target chip */}
          <View className="mx-8 mb-6 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex-row items-center gap-3">
            <View className="w-2 h-2 rounded-full bg-white" />
            <Text className="text-white text-[11px] font-black uppercase tracking-[2px]">
              Target: {vaultName}
            </Text>
          </View>

          {/* Content */}
          <View className="px-8 pb-8 gap-4">
            {isCheckingEnabled ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#FFFFFF" size="large" />
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-4">
                  Checking biometrics...
                </Text>
              </View>
            ) : mode === 'enable' ? (
              <>
                <Text className="text-zinc-400 text-[10px] font-black uppercase tracking-[2px]">
                  Set a 6-digit PIN to enable biometric unlock for this vault.
                </Text>

                {errorMsg && (
                  <View className="bg-red-950 border border-red-800 rounded-2xl p-3">
                    <Text className="text-red-400 text-[11px] font-black uppercase tracking-[2px] text-center">
                      {errorMsg}
                    </Text>
                  </View>
                )}

                <View className="border border-zinc-700 rounded-2xl px-4 py-4 bg-zinc-900">
                  <TextInput
                    className="text-white text-2xl tracking-[8px] font-black text-center"
                    placeholder="——————"
                    placeholderTextColor="#52525B"
                    value={pinInput}
                    onChangeText={setPinInput}
                    keyboardType="number-pad"
                    maxLength={6}
                    secureTextEntry
                    editable={!isProcessing}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleEnable}
                  disabled={pinInput.length !== 6 || isProcessing}
                  activeOpacity={0.75}
                  className="bg-white rounded-[28px] p-6 items-center"
                  style={{ opacity: pinInput.length !== 6 || isProcessing ? 0.4 : 1 }}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#000000" size="small" />
                  ) : (
                    <Text className="text-black text-sm font-black uppercase tracking-[3px]">
                      Enable Biometric Unlock
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {errorMsg && (
                  <View className="bg-red-950 border border-red-800 rounded-2xl p-4 items-center">
                    <Text className="text-red-400 text-[11px] font-black uppercase tracking-[2px] text-center">
                      {errorMsg}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleUnlock}
                  disabled={isProcessing}
                  activeOpacity={0.75}
                  className="bg-white rounded-[28px] p-6 flex-row items-center gap-5"
                  style={{ opacity: isProcessing ? 0.5 : 1 }}
                >
                  <View className="w-16 h-16 bg-black rounded-[20px] items-center justify-center">
                    {isProcessing ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Fingerprint size={32} color="#FFFFFF" strokeWidth={2} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-black text-xl font-black uppercase tracking-tighter">
                      {isProcessing ? 'Verifying...' : 'Biometric Unlock'}
                    </Text>
                    <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mt-1">
                      Face ID / Fingerprint
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleReset}
                  disabled={isProcessing}
                  activeOpacity={0.7}
                  className="items-center py-2"
                >
                  <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px]">
                    Reset Biometric Unlock
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default BiometricUnlockModal;
