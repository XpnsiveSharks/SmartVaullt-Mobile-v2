import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { Plus, Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import ButtonSecondary from '../buttons/ButtonSecondary';
import CustomModal from '../modals/CustomModal';
import { useWiFiProvisioning } from '../../screens/settings/hooks/provisioning/useWiFiProvisioning';
import { useVaultManagement } from '../../hooks/VaultContext';
import { useThemeColors } from '../../context/ThemeContext';

interface ProvisioningProps {
  visible?: boolean;
  onClose?: () => void;
}

const Provisioning = ({ visible: externalVisible, onClose: externalOnClose }: ProvisioningProps = {}) => {
  const controlled = externalVisible !== undefined;
  const [internalVisible, setInternalVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const provisioning = useWiFiProvisioning();
  const { forceRefreshVaults, selectVault } = useVaultManagement();
  const colors = useThemeColors();

  const modalVisible = controlled ? externalVisible! : internalVisible;

  const closeModal = React.useCallback(() => {
    provisioning.stopPolling();
    provisioning.reset();
    if (controlled) {
      externalOnClose?.();
    } else {
      setInternalVisible(false);
    }
  }, [controlled, externalOnClose]);

  // Controlled mode: react to external visibility changes
  React.useEffect(() => {
    if (!controlled) return;
    if (externalVisible) {
      provisioning.reset();
      provisioning.fetchToken();
    } else {
      provisioning.stopPolling();
      provisioning.reset();
    }
  }, [externalVisible]);

  const handleOpen = () => {
    provisioning.reset();
    setInternalVisible(true);
    provisioning.fetchToken();
  };

  // Auto-refresh and select vault when registration is detected via polling
  React.useEffect(() => {
    if (provisioning.step === 'done' && provisioning.foundVault) {
      forceRefreshVaults().then(() => {
        if (provisioning.foundVault) {
          selectVault(parseInt(String(provisioning.foundVault.vault_id)));
        }
      });
    }
  }, [provisioning.step]);

  const handleCopy = async () => {
    if (!provisioning.token) return;
    await Clipboard.setStringAsync(provisioning.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    switch (provisioning.step) {
      case 'fetching_token':
        return (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <ActivityIndicator size="large" color={colors.text.default} />
            <Text style={{ marginTop: 16, color: colors.muted.default, fontSize: 14 }}>
              Generating provisioning token...
            </Text>
          </View>
        );

      case 'showing_token':
      case 'polling':
        return (
          <View>
            <Text style={{ color: colors.muted.default, fontSize: 14, marginBottom: 20 }}>
              Follow these steps to connect your SmartVault device to WiFi:
            </Text>

            <View style={{ backgroundColor: colors.surface.default, borderColor: colors.border.default, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <Text style={{ color: colors.muted.default, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Step 1</Text>
              <Text style={{ color: colors.text.default, fontSize: 14 }}>
                Connect your phone to the{' '}
                <Text style={{ fontWeight: 'bold', color: colors.text.default }}>SmartVault-XXYYZZ</Text> WiFi network
              </Text>
            </View>

            <View style={{ backgroundColor: colors.surface.default, borderColor: colors.border.default, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 }}>
              <Text style={{ color: colors.muted.default, fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Step 2</Text>
              <Text style={{ color: colors.text.default, fontSize: 14, marginBottom: 16 }}>
                Fill in your WiFi credentials and enter this token:
              </Text>
              <Pressable
                onPress={handleCopy}
                style={{ alignItems: 'center', paddingVertical: 8 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 48, fontWeight: '900', letterSpacing: 8, color: colors.accent.default }}>
                    {provisioning.token}
                  </Text>
                  {copied
                    ? <Check size={20} color={colors.accent2.default} strokeWidth={2.5} />
                    : <Copy size={20} color={colors.muted.default} strokeWidth={2} />
                  }
                </View>
                {copied && (
                  <Text style={{ color: colors.accent2.default, fontSize: 12, marginTop: 4, letterSpacing: 1 }}>
                    Copied!
                  </Text>
                )}
              </Pressable>
            </View>

            {provisioning.step === 'polling' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={colors.muted.default} />
                <Text style={{ color: colors.muted.default, fontSize: 14 }}>Waiting for device registration...</Text>
              </View>
            )}
          </View>
        );

      case 'done':
        return (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface.default, borderWidth: 1, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 28, color: colors.accent2.default }}>✓</Text>
            </View>
            <Text style={{ color: colors.text.default, fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Device registered!</Text>
            <Text style={{ color: colors.muted.default, fontSize: 14, textAlign: 'center' }}>
              {provisioning.foundVault?.vault_name || 'Your new vault'} is ready to use.
            </Text>
          </View>
        );

      case 'error':
        return (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: colors.status.danger, fontSize: 14, textAlign: 'center' }}>{provisioning.error}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  const getPrimaryAction = () => {
    switch (provisioning.step) {
      case 'error':
        return { label: 'Retry', onPress: provisioning.fetchToken };
      case 'showing_token':
        return {
          label: "I've filled the form — check for device",
          onPress: provisioning.startPolling,
        };
      case 'polling':
        return {
          label: 'Done',
          onPress: async () => {
            provisioning.stopPolling();
            await forceRefreshVaults();
            provisioning.reset();
            closeModal();
          },
        };
      case 'done':
        return {
          label: 'Done',
          onPress: () => {
            provisioning.reset();
            closeModal();
          },
        };
      default:
        return undefined;
    }
  };

  return (
    <>
      {!controlled && (
        <ButtonSecondary
          title="Provision New Device"
          onPress={handleOpen}
          icon={<Plus size={16} color={colors.text.default} />}
          className="w-full"
        />
      )}

      <CustomModal
        visible={modalVisible}
        onClose={closeModal}
        title="Add New Vault"
        primaryAction={getPrimaryAction()}
        secondaryAction={{ label: 'Cancel', onPress: closeModal }}
      >
        {renderContent()}
      </CustomModal>
    </>
  );
};

export default Provisioning;
