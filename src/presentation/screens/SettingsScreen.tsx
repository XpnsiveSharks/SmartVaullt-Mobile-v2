import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronDown, ChevronUp, Vault, LogOut, Fingerprint, Shield, Cpu, Moon, Trash2, User } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import ButtonSecondary from '../component/buttons/ButtonSecondary';
import CustomModal from '../component/modals/CustomModal';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import BorderedList from '../component/lists/BorderedList';
import { useAuthContext } from '../context/AuthContext';
import { useBiometric } from '../hooks/useBiometric';
import { VaultMembership, VaultService } from '../../service/VaultService';
import Provisioning from '../component/provisioning/Provisioning';
import SetPinModal from '../component/vault_access/SetPinModal';


const SettingsScreen = () => {
  const { isDark, toggle, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { logout, user } = useAuthContext();
  const [vaults, setVaults] = useState<VaultMembership[]>([]);
  const [currentVault, setCurrentVault] = useState<VaultMembership | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [vaultBiometricEnabled, setVaultBiometricEnabled] = useState(false);
  const [provisioningModalVisible, setProvisioningModalVisible] = useState(false);
  const [pinStatus, setPinStatus] = useState<{ is_set: boolean; pin_set_at: string | null } | null>(null);
  const [setPinModalVisible, setSetPinModalVisible] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadVaults = useCallback(async () => {
    try {
      const raw = await VaultService.getUserVaults();
      setVaults(raw);
      if (raw.length > 0 && !currentVault) setCurrentVault(raw[0]);
    } catch (e) {
      // silently fail — vaults are non-critical for settings layout
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadVaults();
    setIsRefreshing(false);
  }, [loadVaults]);

  useEffect(() => { loadVaults(); }, [loadVaults]);

  useFocusEffect(
    useCallback(() => { loadVaults(); }, [loadVaults])
  );

  const {
    canPromptBiometrics,
    biometricLabel,
    isLoginEnabled,
    enableBiometricLogin,
    disableBiometricLogin,
    isVaultBiometricEnabled,
    enableVaultBiometric,
    disableVaultBiometric,
  } = useBiometric();

  useEffect(() => {
    let isMounted = true;
    if (currentVault?.vault_id) {
      isVaultBiometricEnabled(currentVault.vault_id).then(enabled => {
        if (isMounted) setVaultBiometricEnabled(enabled);
      });
    }
    return () => { isMounted = false; };
  }, [currentVault, isVaultBiometricEnabled]);

  useEffect(() => {
    if (!currentVault?.vault_id) return;
    VaultService.getPinStatus(String(currentVault.vault_id))
      .then(status => setPinStatus(status))
      .catch(() => {});
  }, [currentVault]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try { await logout(); } catch (e) { /* handled */ } finally { setIsLoggingOut(false); }
        },
      },
    ]);
  };

  const handleToggleBiometricLogin = async () => {
    if (!canPromptBiometrics) {
      Alert.alert('Biometrics unavailable', 'This device does not have biometric authentication configured.');
      return;
    }
    try {
      if (isLoginEnabled) await disableBiometricLogin();
      else await enableBiometricLogin();
    } catch (error) {
      Alert.alert('Biometric update failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleToggleVaultBiometric = () => {
    if (!canPromptBiometrics) {
      Alert.alert('Biometrics unavailable', 'This device does not have biometric authentication configured.');
      return;
    }
    if (vaultBiometricEnabled) {
      disableVaultBiometric(currentVault!.vault_id)
        .then(() => setVaultBiometricEnabled(false))
        .catch(error => Alert.alert('Biometric update failed', error instanceof Error ? error.message : 'Please try again.'));
    } else {
      setSetPinModalVisible(true);
    }
  };

  const handleDeleteVault = () => {
    if (!currentVault) return;
    Alert.alert(
      'Delete Vault',
      `Permanently delete "${currentVault.vault_name ?? `UNIT-${currentVault.vault_id}`}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await VaultService.deleteVault(currentVault.vault_id);
              const updated = await VaultService.getUserVaults();
              setVaults(updated);
              setCurrentVault(updated.length > 0 ? updated[0] : null);
            } catch (e) {
              Alert.alert('Delete failed', e instanceof Error ? e.message : 'Please try again.');
            }
          },
        },
      ]
    );
  };

  const displayName: string = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
    : user?.name ?? user?.username ?? 'User';
  const email: string = user?.email ?? '';

  return (
    <View style={styles.screen}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent.default]}
            tintColor={colors.accent.default}
            progressBackgroundColor={colors.cards.default}
          />
        }
      >
        {/* ── Profile Card ── */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.profileCard}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface?.active ?? colors.cards.dark, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <User size={18} color={colors.muted.default} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName} numberOfLines={1}>{displayName}</Text>
            {!!email && (
              <Text style={styles.profileEmail} numberOfLines={1}>{email}</Text>
            )}
          </View>
        </Animated.View>

        {/* ── Section: Appearance ── */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Moon size={18} color={colors.muted.default} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDesc}>Switch between light and dark theme</Text>
              </View>
              <TouchableOpacity
                onPress={toggle}
                style={[styles.toggle, isDark && styles.toggleActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, isDark && styles.toggleTextActive]}>
                  {isDark ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* ── Section: Security ── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Security</Text>
          <View style={styles.sectionCard}>

            {/* Biometric login row */}
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Fingerprint size={18} color={colors.muted.default} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Biometric Login</Text>
                <Text style={styles.settingDesc}>Use {biometricLabel} to sign in</Text>
              </View>
              <TouchableOpacity
                onPress={handleToggleBiometricLogin}
                style={[styles.toggle, isLoginEnabled && styles.toggleActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, isLoginEnabled && styles.toggleTextActive]}>
                  {isLoginEnabled ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowDivider} />

            {/* Set PIN row */}
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Shield size={18} color={colors.muted.default} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Vault PIN</Text>
                <Text style={styles.settingDesc}>
                  {pinStatus?.is_set ? 'PIN configured' : 'Not set'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSetPinModalVisible(true)}
                disabled={!currentVault}
                style={styles.settingAction}
                activeOpacity={0.7}
              >
                <Text style={styles.settingActionText}>Set PIN</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowDivider} />

            {/* Vault biometric row */}
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Fingerprint size={18} color={colors.muted.default} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Vault Biometric</Text>
                <Text style={styles.settingDesc}>
                  Unlock {currentVault?.vault_name ?? 'vault'} with {biometricLabel}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleToggleVaultBiometric}
                style={[styles.toggle, vaultBiometricEnabled && styles.toggleActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, vaultBiometricEnabled && styles.toggleTextActive]}>
                  {vaultBiometricEnabled ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* ── Section: Vault ── */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Vault</Text>
          <View style={styles.sectionCard}>

            {/* Vault selector */}
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Vault size={18} color={colors.muted.default} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>
                  {currentVault
                    ? (currentVault.vault_name ?? `UNIT-${currentVault.vault_id}`)
                    : 'Select Vault'}
                </Text>
                {currentVault && (
                  <Text style={styles.settingDesc}>
                    {(currentVault.role as string).charAt(0).toUpperCase() +
                     (currentVault.role as string).slice(1)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setIsDropdownOpen(true)}
                style={styles.settingAction}
                activeOpacity={0.7}
              >
                {isDropdownOpen
                  ? <ChevronUp size={16} color={colors.accent.default} strokeWidth={2} />
                  : <ChevronDown size={16} color={colors.accent.default} strokeWidth={2} />}
              </TouchableOpacity>
            </View>

            <View style={styles.rowDivider} />

            {/* Provisioning */}
            <TouchableOpacity
              onPress={() => setProvisioningModalVisible(true)}
              style={styles.settingRow}
              activeOpacity={0.8}
            >
              <View style={styles.settingIcon}>
                <Cpu size={18} color={colors.muted.default} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingTitle}>Provision Device</Text>
                <Text style={styles.settingDesc}>Configure vault hardware</Text>
              </View>
              <Text style={styles.accentLabel}>Start</Text>
            </TouchableOpacity>

            {(currentVault?.role as string) === 'OWNER' && (
              <>
                <View style={styles.rowDivider} />
                <TouchableOpacity
                  onPress={handleDeleteVault}
                  style={styles.settingRow}
                  activeOpacity={0.7}
                >
                  <View style={[styles.settingIcon, { backgroundColor: `${colors.status.danger}1A` }]}>
                    <Trash2 size={18} color={colors.status.danger} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dangerText}>Delete Vault</Text>
                    <Text style={styles.settingDesc}>Permanently remove this unit</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>

        {/* ── Section: Account ── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              onPress={handleLogout}
              disabled={isLoggingOut}
              style={styles.logoutRow}
              activeOpacity={0.7}
            >
              <LogOut size={18} color={colors.status.danger} strokeWidth={2} />
              <Text style={styles.logoutText}>
                {isLoggingOut ? 'Signing out…' : 'Sign out'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Vault selector modal */}
      <CustomModal
        visible={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        title="SELECT UNIT"
      >
        <BorderedList
          data={vaults}
          keyExtractor={(vault: any) => vault.vault_id.toString()}
          selectedId={currentVault?.vault_id?.toString() ?? ''}
          getId={(vault: any) => vault.vault_id.toString()}
          onItemPress={(vault: any) => {
            setCurrentVault(vault);
            setIsDropdownOpen(false);
          }}
          iconExtractor={() => <Vault size={20} color={colors.text.light} strokeWidth={2.5} />}
          renderItem={(vault: any) => (
            <View style={{ flex: 1 }}>
              <Text style={styles.modalItemName} numberOfLines={2}>
                {vault.vault_name ?? `UNIT-${vault.vault_id}`}
              </Text>
              <Text style={styles.modalItemRole}>
                {(vault.role as string).toUpperCase()}
              </Text>
            </View>
          )}
          itemHeight={72}
          scrollEnabled={false}
        />
      </CustomModal>

      <Provisioning
        visible={provisioningModalVisible}
        onClose={() => setProvisioningModalVisible(false)}
      />

      <SetPinModal
        visible={setPinModalVisible}
        vault={currentVault}
        onClose={() => setSetPinModalVisible(false)}
        onSuccess={async (pin) => {
          if (currentVault?.vault_id) {
            VaultService.getPinStatus(String(currentVault.vault_id))
              .then(setPinStatus)
              .catch(() => {});
            if (!vaultBiometricEnabled && canPromptBiometrics) {
              try {
                await enableVaultBiometric(currentVault.vault_id, pin);
                setVaultBiometricEnabled(true);
              } catch {
                // non-fatal
              }
            }
          }
        }}
      />
    </View>
  );
};

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.bg.default,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.cards.default,
    marginHorizontal: 20,
    marginTop: 64,
    marginBottom: 8,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: c.border.default,
  },
  profileName: {
    color: c.text.default,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  profileEmail: {
    color: c.muted.default,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionLabel: {
    color: c.muted.default,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: c.cards.default,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border.default,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: c.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    color: c.text.default,
    fontSize: 14,
    fontWeight: '600',
  },
  settingDesc: {
    color: c.muted.default,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },
  settingAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: c.surface.default,
    borderWidth: 1,
    borderColor: c.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingActionText: {
    color: c.text.default,
    fontSize: 12,
    fontWeight: '600',
  },
  toggle: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: c.surface.default,
    borderWidth: 1,
    borderColor: c.border.default,
  },
  toggleActive: {
    backgroundColor: `${c.status.success}1A`,
    borderColor: c.status.success,
  },
  toggleText: {
    color: c.muted.default,
    fontSize: 12,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: c.status.success,
  },
  rowDivider: {
    height: 1,
    backgroundColor: c.border.default,
    marginLeft: 60,
  },
  accentLabel: {
    color: c.accent.default,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dangerText: {
    color: c.status.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  logoutText: {
    color: c.status.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  modalItemName: {
    color: c.text.default,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  modalItemRole: {
    color: c.muted.default,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
});

export default SettingsScreen;
