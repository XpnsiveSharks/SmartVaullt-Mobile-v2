import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import CustomModal from '../modals/CustomModal';
import FaceCaptureModal from '../biometrics/FaceCaptureModal';
import { VaultMembership } from '../../../service/VaultService';
import { BiometricService } from '../../../service/BiometricService';
import { useBiometric } from '../../hooks/useBiometric';
import { useThemeColors } from '../../context/ThemeContext';

interface VaultUnlockModalProps {
  visible: boolean;
  vault: VaultMembership | null;
  onClose: () => void;
  onUnlock: (vault: VaultMembership, pin: string) => Promise<void> | void;
}

const VaultUnlockModal: React.FC<VaultUnlockModalProps> = ({
  visible,
  vault,
  onClose,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [vaultBiometricEnabled, setVaultBiometricEnabled] = useState(false);
  const [enableBiometricNextTime, setEnableBiometricNextTime] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [faceCaptureVisible, setFaceCaptureVisible] = useState(false);
  const [faceMode, setFaceMode] = useState<'enroll' | 'verify'>('verify');

  const {
    canPromptBiometrics,
    biometricLabel,
    isVaultBiometricEnabled,
    enableVaultBiometric,
    getVaultPinWithBiometrics,
  } = useBiometric();

  useEffect(() => {
    if (!vault) return;
    let isMounted = true;

    Promise.all([
      isVaultBiometricEnabled(vault.vault_id),
      BiometricService.isFaceEnrolled(),
    ]).then(([biometricEnabled, faceIsEnrolled]) => {
      if (isMounted) {
        setVaultBiometricEnabled(biometricEnabled);
        setFaceEnrolled(faceIsEnrolled);
        setEnableBiometricNextTime(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [vault, isVaultBiometricEnabled]);

  useEffect(() => {
    if (!visible) {
      setPin('');
      setIsUnlocking(false);
      setEnableBiometricNextTime(false);
      setFaceCaptureVisible(false);
    }
  }, [visible]);

  const handleUnlock = async () => {
    if (!vault) return;
    if (!pin.trim()) {
      Alert.alert('PIN required', 'Please enter your vault PIN.');
      return;
    }

    setIsUnlocking(true);
    try {
      await onUnlock(vault, pin.trim());

      if (enableBiometricNextTime && canPromptBiometrics) {
        try {
          await enableVaultBiometric(vault.vault_id, pin.trim());
          setVaultBiometricEnabled(true);
        } catch (error) {
          Alert.alert(
            'Biometric setup failed',
            error instanceof Error ? error.message : 'Unable to enable biometric unlock.'
          );
        }
      }

      onClose();
    } catch (error) {
      Alert.alert(
        'Unlock failed',
        error instanceof Error ? error.message : 'Unable to unlock vault.'
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleBiometricUnlock = async () => {
    if (!vault) return;

    setIsUnlocking(true);
    try {
      const storedPin = await getVaultPinWithBiometrics(vault.vault_id);
      if (!storedPin) {
        Alert.alert('Biometric unlock unavailable', 'Please enter your PIN to continue.');
        return;
      }

      await onUnlock(vault, storedPin);
      onClose();
    } catch (error) {
      Alert.alert(
        'Biometric unlock failed',
        error instanceof Error ? error.message : 'Please try your PIN instead.'
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleFaceUnlock = () => {
    setFaceMode('verify');
    setFaceCaptureVisible(true);
  };

  const handleFaceEnroll = () => {
    setFaceMode('enroll');
    setFaceCaptureVisible(true);
  };

  const handleFaceCaptureSuccess = () => {
    setFaceCaptureVisible(false);
    if (faceMode === 'enroll') {
      setFaceEnrolled(true);
    } else {
      onClose();
    }
  };

  const colors = useThemeColors();

  if (!vault) return null;

  return (
    <>
    <FaceCaptureModal
      visible={faceCaptureVisible}
      mode={faceMode}
      vaultId={faceMode === 'verify' ? String(vault.vault_id) : undefined}
      onSuccess={handleFaceCaptureSuccess}
      onClose={() => setFaceCaptureVisible(false)}
    />
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={`UNLOCK ${vault.vault_name || `UNIT-${vault.vault_id}`}`}
      primaryAction={{
        label: isUnlocking ? 'Unlocking...' : 'Unlock',
        onPress: handleUnlock,
        disabled: isUnlocking || !pin.trim(),
        loading: isUnlocking,
      }}
      secondaryAction={{
        label: 'Cancel',
        onPress: onClose,
      }}
    >
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: colors.text.default, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10, marginBottom: 8 }}>
          Vault PIN
        </Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="Enter vault PIN"
          placeholderTextColor={colors.muted.default}
          secureTextEntry={true}
          keyboardType="number-pad"
          style={{ backgroundColor: colors.surface.default, color: colors.text.default, paddingHorizontal: 16, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border.default }}
        />
      </View>

      {canPromptBiometrics && vaultBiometricEnabled && (
        <TouchableOpacity
          onPress={handleBiometricUnlock}
          style={{ backgroundColor: colors.cards.default, borderWidth: 1, borderColor: colors.border.default, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 24 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.text.default, textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }}>
            Unlock with {biometricLabel}
          </Text>
        </TouchableOpacity>
      )}

      {canPromptBiometrics && !vaultBiometricEnabled && (
        <TouchableOpacity
          onPress={() => setEnableBiometricNextTime(prev => !prev)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            borderWidth: 1,
            backgroundColor: enableBiometricNextTime ? colors.accent.default : colors.cards.default,
            borderColor: enableBiometricNextTime ? colors.accent.default : colors.border.default,
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', color: enableBiometricNextTime ? '#000000' : colors.text.default }}>
            {enableBiometricNextTime ? `${biometricLabel} enabled for next time` : `Enable ${biometricLabel} for next time`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Face recognition unlock */}
      {faceEnrolled && (
        <>
          <TouchableOpacity
            onPress={handleFaceUnlock}
            style={{ backgroundColor: colors.cards.default, borderWidth: 1, borderColor: colors.border.default, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, marginTop: 8 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.text.default, textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }}>
              Unlock with Face Recognition
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 16 }}>
            <TouchableOpacity onPress={handleFaceEnroll} activeOpacity={0.7}>
              <Text style={{ color: colors.muted.default, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>
                Re-take photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Delete face',
                  'Remove your enrolled face? You can re-enroll at any time.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await BiometricService.deleteFace();
                          setFaceEnrolled(false);
                        } catch (error) {
                          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete face.');
                        }
                      },
                    },
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.muted.default, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>
                Delete face
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {!faceEnrolled && (
        <TouchableOpacity
          onPress={handleFaceEnroll}
          style={{ paddingHorizontal: 16, paddingVertical: 12, marginTop: 4 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: colors.muted.default, textAlign: 'center', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>
            Set up Face Recognition
          </Text>
        </TouchableOpacity>
      )}
    </CustomModal>
    </>
  );
};

export default VaultUnlockModal;
