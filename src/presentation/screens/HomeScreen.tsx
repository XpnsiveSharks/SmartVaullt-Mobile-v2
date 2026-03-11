import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ChevronRight, AlertTriangle, RefreshCw } from 'lucide-react-native';

import VaultUnlockModal from '../component/vault_access/VaultUnlockModal';
import { VaultMembership, VaultService, ActivityLogEntry, transformActivity } from '../../service/VaultService';
import { ActivityLog } from '../../types/ActivityTypes';
import { useVaultManagement } from '../hooks/VaultContext';
import { useAuthContext } from '../context/AuthContext';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusBorderColor(vault: VaultMembership, c: ThemeColors): string {
  return vault.is_online ? c.accent2.default : c.border.dark;
}

function deriveVaultStats(vaults: VaultMembership[]) {
  let online = 0;
  let offline = 0;
  for (const v of vaults) {
    if (v.is_online) online++;
    else offline++;
  }
  return { online, locked: 0, offline };
}

function getActivityBorderColor(status: string, c: ThemeColors): string {
  switch (status) {
    case 'success': return c.status.success;
    case 'failed':
    case 'danger': return c.status.danger;
    case 'warning': return c.status.warning;
    default: return c.muted.default;
  }
}

function formatRelative(isoOrNull: string | null | undefined): string {
  if (!isoOrNull) return '—';
  const diffMs = Date.now() - new Date(isoOrNull).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return `${Math.floor(diffMin / 1440)}d ago`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonCard = ({ delay }: { delay: number }) => {
  const colors = useThemeColors();
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={{ width: 170, backgroundColor: colors.cards.dark, borderRadius: 24, height: 112, borderWidth: 1, borderColor: colors.border.default, marginRight: 12 }}
    />
  );
};

// ─── Vault Card ──────────────────────────────────────────────────────────────

const VaultCard = ({
  vault,
  onPress,
  delay,
}: {
  vault: VaultMembership;
  onPress: () => void;
  delay: number;
}) => {
  const colors = useThemeColors();
  const name = vault.vault_name ?? `UNIT-${vault.vault_id}`;
  const lastSeen = formatRelative(vault.last_accessed_at);
  const isActive = vault.is_online;
  const borderColor = isActive ? colors.accent2.default : colors.border.dark;

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (isActive) {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.6, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1
      );
      pulseOpacity.value = withRepeat(
        withSequence(withTiming(0.3, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1
      );
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 1;
    }
  }, [isActive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Pressable
        onPress={onPress}
        style={[
          { width: 170, position: 'relative' },
          { backgroundColor: colors.cards.default, borderColor: colors.border.default, borderLeftColor: borderColor, borderLeftWidth: 3, borderWidth: 1, borderRadius: 20, padding: 16, marginRight: 12 },
        ]}
        android_ripple={{ color: `${colors.accent.default}1A` }}
      >
        <Image
          source={require('../../assets/images/VaultLogo.png')}
          style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, opacity: 0.18 }}
          resizeMode="contain"
        />
        <Text
          style={{ color: colors.text.default, fontSize: 14, fontWeight: '900', letterSpacing: -0.3 }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
          <Animated.View
            style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: isActive ? colors.accent2.default : colors.muted.default }, pulseStyle]}
          />
          <Text
            style={{ fontSize: 10, fontWeight: '700', letterSpacing: 2, marginLeft: 6, color: isActive ? colors.accent2.default : colors.muted.default }}
          >
            {isActive ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
        <Text style={{ color: colors.muted.default, fontSize: 10, fontWeight: '500', marginTop: 12 }}>{lastSeen}</Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── Activity Row ────────────────────────────────────────────────────────────

const ActivityRow = ({ log, index }: { log: ActivityLog; index: number }) => {
  const colors = useThemeColors();
  const borderColor = getActivityBorderColor(log.status, colors);
  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify()}
      style={{ flexDirection: 'row', alignItems: 'stretch', paddingVertical: 12, borderLeftWidth: 3, borderLeftColor: borderColor, paddingLeft: 12, marginBottom: 2 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text.default, fontSize: 14, fontWeight: '700', letterSpacing: -0.3 }}>
          {log.title}
        </Text>
        <Text style={{ color: colors.muted.default, fontSize: 10, fontWeight: '500', marginTop: 2 }} numberOfLines={1}>
          {log.description}
        </Text>
      </View>
      <Text style={{ color: colors.muted.default, fontSize: 10, fontWeight: '500', marginLeft: 12, marginTop: 2 }}>{log.timestamp}</Text>
    </Animated.View>
  );
};

// ─── HomeScreen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const { availableVaults, loading: vaultLoading, error: vaultError, retryLoadVaults } = useVaultManagement();

  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedVault, setSelectedVault] = useState<VaultMembership | null>(null);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);

  const firstName: string =
    user?.first_name ?? user?.name?.split(' ')[0] ?? user?.username ?? '';
  const greeting = getGreeting();
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const stats = deriveVaultStats(availableVaults);

  const loadActivity = useCallback(async (vaults: VaultMembership[]) => {
    if (vaults.length === 0) { setActivity([]); return; }
    setActivityLoading(true);
    setActivityError(null);
    try {
      const entries: ActivityLogEntry[] = await VaultService.getVaultActivity(
        String(vaults[0].vault_id),
        5
      );
      setActivity(entries.map(transformActivity).slice(0, 5));
    } catch {
      setActivityError('Could not load activity.');
    } finally {
      setActivityLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!vaultLoading && availableVaults.length > 0) {
      loadActivity(availableVaults);
    }
  }, [vaultLoading, availableVaults, loadActivity]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await retryLoadVaults();
    if (availableVaults.length > 0) await loadActivity(availableVaults);
    setIsRefreshing(false);
  };

  const handleVaultPress = (vault: VaultMembership) => {
    setSelectedVault(vault);
    setUnlockModalVisible(true);
  };

  const handleUnlockVault = async (vault: VaultMembership, pin: string) => {
    try {
      await VaultService.unlockWithPin(String(vault.vault_id), pin);
      Alert.alert('Access Granted', `${vault.vault_name ?? `UNIT-${vault.vault_id}`} unlocked.`);
      await loadActivity(availableVaults);
    } catch (e) {
      Alert.alert('Unlock Failed', e instanceof Error ? e.message : 'Could not unlock vault.');
    }
  };

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 24, paddingTop: 56, backgroundColor: colors.bg.default }}>
      {/* ── Greeting Header ── */}
      <Animated.View entering={FadeInDown.delay(0).springify()} style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.muted.default, fontSize: 12, fontWeight: '500' }}>{greeting}</Text>
            <Text style={{ color: colors.text.default, fontSize: 30, fontWeight: '900', letterSpacing: -0.5, lineHeight: 36 }}>
              {firstName || 'Welcome back'}
            </Text>
            {availableVaults.length > 0 && (
              <Text style={{ color: colors.muted.default, fontSize: 11, fontWeight: '500', marginTop: 2 }}>
                {availableVaults.length} vault{availableVaults.length !== 1 ? 's' : ''} secured
              </Text>
            )}
          </View>
          <Text style={{ color: colors.muted.default, fontSize: 12, fontWeight: '500', marginTop: 4 }}>{dateStr}</Text>
        </View>
      </Animated.View>

      {/* ── Stat Chips ── */}
      {!vaultLoading && availableVaults.length > 0 && (
        <Animated.View entering={FadeInDown.delay(30).springify()} style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          <View style={styles.statChip}>
            <View style={[styles.statDot, { backgroundColor: colors.status.success }]} />
            <Text style={styles.statText}>{stats.online} Online</Text>
          </View>
          <View style={styles.statChip}>
            <View style={[styles.statDot, { backgroundColor: colors.accent.default }]} />
            <Text style={styles.statText}>{stats.locked} Locked</Text>
          </View>
          <View style={styles.statChip}>
            <View style={[styles.statDot, { backgroundColor: colors.muted.default }]} />
            <Text style={styles.statText}>{stats.offline} Offline</Text>
          </View>
        </Animated.View>
      )}

      {/* ── Your Vaults ── */}
      <Animated.View entering={FadeInDown.delay(60).springify()} style={{ marginBottom: 24 }}>
        <Text style={{ color: colors.muted.default, fontSize: 10, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
          Your Vaults
        </Text>

        {vaultError ? (
          <View style={{ backgroundColor: colors.cards.default, borderWidth: 1, borderColor: colors.border.default, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <AlertTriangle size={16} color={colors.status.danger} strokeWidth={2.5} />
            <Text style={{ color: colors.muted.default, fontSize: 14, fontWeight: '500', marginLeft: 12, flex: 1 }}>{vaultError}</Text>
            <TouchableOpacity onPress={retryLoadVaults}>
              <RefreshCw size={16} color={colors.muted.default} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        ) : vaultLoading ? (
          <View style={{ flexDirection: 'row' }}>
            <SkeletonCard delay={0} />
            <SkeletonCard delay={80} />
          </View>
        ) : availableVaults.length === 0 ? (
          <View style={{ backgroundColor: colors.cards.default, borderWidth: 1, borderColor: colors.border.default, borderRadius: 20, padding: 16 }}>
            <Text style={{ color: colors.muted.default, fontSize: 14, fontWeight: '500' }}>No vaults found.</Text>
          </View>
        ) : (
          <FlatList
            data={availableVaults}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(v) => String(v.vault_id)}
            renderItem={({ item, index }) => (
              <VaultCard
                vault={item}
                onPress={() => handleVaultPress(item)}
                delay={index * 50}

              />
            )}
          />
        )}
      </Animated.View>

      {/* ── Quick Actions ── */}
      {!vaultLoading && availableVaults.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(90).springify()}
          style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}
        >
          <TouchableOpacity
            onPress={() => handleVaultPress(availableVaults[0])}
            style={styles.actionPrimary}
            activeOpacity={0.8}
          >
            <Text style={styles.actionPrimaryText}>Unlock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Activity' as never)}
            style={styles.actionSecondary}
            activeOpacity={0.8}
          >
            <Text style={styles.actionSecondaryText}>Activity</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Recent Activity ── */}
      <Animated.View entering={FadeInDown.delay(120).springify()} style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: colors.muted.default, fontSize: 10, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' }}>
            Recent Activity
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Activity' as never)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.accent.default, fontSize: 10, fontWeight: '700', marginRight: 4 }}>See all</Text>
            <ChevronRight size={12} color={colors.accent.default} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {activityError ? (
          <Text style={{ color: colors.muted.default, fontSize: 14, fontWeight: '500' }}>{activityError}</Text>
        ) : activityLoading ? (
          <>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 40).springify()}
                style={{ height: 48, backgroundColor: colors.cards.default, borderRadius: 16, marginBottom: 8 }}
              />
            ))}
          </>
        ) : activity.length === 0 ? (
          <Text style={{ color: colors.muted.default, fontSize: 14, fontWeight: '500' }}>No recent activity.</Text>
        ) : (
          activity.map((log, i) => (
            <ActivityRow key={log.id} log={log} index={i} />
          ))
        )}
      </Animated.View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.default }}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 120 }}
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
      />

      <VaultUnlockModal
        visible={unlockModalVisible}
        vault={selectedVault}
        onClose={() => setUnlockModalVisible(false)}
        onUnlock={handleUnlockVault}
      />
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  vaultCard: {
    width: 170,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.cards.default,
    borderWidth: 1,
    borderColor: c.border.default,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statText: {
    color: c.text.default,
    fontSize: 11,
    fontWeight: '600',
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: c.status.success,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: c.status.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionPrimaryText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: c.cards.default,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.border.default,
  },
  actionSecondaryText: {
    color: c.text.default,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
