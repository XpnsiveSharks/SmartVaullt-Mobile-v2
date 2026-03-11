import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Search, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

import { ActivityLog } from '../../types/ActivityTypes';
import { VaultService, transformActivity, ActivityLogEntry } from '../../service/VaultService';

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'success' | 'warning' | 'failed' | 'system';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'failed', label: 'Error' },
  { key: 'system', label: 'System' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBorderColor(status: string, c: ThemeColors): string {
  switch (status) {
    case 'success': return c.status.success;
    case 'failed':  return c.status.danger;
    case 'warning': return c.status.warning;
    default:        return c.muted.default;
  }
}

// ─── Log Row ─────────────────────────────────────────────────────────────────

const LogRow = ({ log, index, isAlt }: { log: ActivityLog; index: number; isAlt: boolean }) => {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const borderColor = getBorderColor(log.status, colors);
  return (
    <Animated.View
      entering={FadeInRight.delay(Math.min(index * 40, 300)).springify()}
      style={[
        styles.logRow,
        { borderLeftColor: borderColor },
        isAlt && styles.logRowAlt,
      ]}
    >
      <View style={styles.logContent}>
        <Text style={styles.logTitle} numberOfLines={1}>{log.title}</Text>
        <Text style={styles.logDesc} numberOfLines={1}>{log.description}</Text>
      </View>
      <Text style={styles.logTime}>{log.timestamp}</Text>
    </Animated.View>
  );
};

// ─── ActivityScreen ──────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const loadLogs = useCallback(async () => {
    setError(null);
    try {
      const vaults = await VaultService.getUserVaults();
      const allEntries: ActivityLogEntry[] = [];
      for (const v of vaults) {
        try {
          const entries = await VaultService.getVaultActivity(String(v.vault_id), 50);
          allEntries.push(...entries);
        } catch {
          // skip failed vaults
        }
      }
      allEntries.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setLogs(allEntries.map(transformActivity));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load activity.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  useFocusEffect(
    useCallback(() => { loadLogs(); }, [loadLogs])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLogs();
    setIsRefreshing(false);
  };

  const filtered = useMemo(() => {
    let result = logs;

    if (activeFilter !== 'all') {
      result = result.filter((l) => l.status === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          (l.user?.name ?? '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, search, activeFilter]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.heading}>Activity</Text>
      <Text style={styles.subheading}>Historical event stream</Text>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={14} color={colors.muted.default} strokeWidth={2.5} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search events..."
          placeholderTextColor={colors.muted.default}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        {renderHeader()}
        {[0, 1, 2, 3, 4].map((i) => (
          <Animated.View
            key={i}
            entering={FadeInRight.delay(i * 50).springify()}
            style={styles.skeleton}
          />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        {renderHeader()}
        <View style={styles.errorRow}>
          <AlertTriangle size={16} color={colors.status.danger} strokeWidth={2.5} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); loadLogs(); }}>
            <RefreshCw size={16} color={colors.muted.default} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        renderItem={({ item, index }) => (
          <LogRow log={item} index={index} isAlt={index % 2 !== 0} />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {search || activeFilter !== 'all' ? 'No matching events.' : 'No activity yet.'}
          </Text>
        }
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
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.bg.default,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
    backgroundColor: c.bg.default,
  },
  heading: {
    color: c.text.default,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  subheading: {
    color: c.muted.default,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.cards.default,
    borderWidth: 1,
    borderColor: c.border.default,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: c.text.default,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterContent: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: c.cards.default,
    borderWidth: 1,
    borderColor: c.border.default,
  },
  filterChipActive: {
    borderBottomColor: c.accent.default,
    borderBottomWidth: 2,
  },
  filterChipText: {
    color: c.muted.default,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: c.accent.default,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 20,
    paddingLeft: 16,
    borderLeftWidth: 3,
    marginLeft: 24,
    marginRight: 0,
  },
  logRowAlt: {
    backgroundColor: c.cards.default,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    color: c.text.default,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  logDesc: {
    color: c.muted.default,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  logTime: {
    color: c.muted.default,
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 12,
  },
  skeleton: {
    marginHorizontal: 24,
    height: 56,
    backgroundColor: c.cards.default,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.cards.default,
    borderWidth: 1,
    borderColor: c.border.default,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
  },
  errorText: {
    color: c.muted.default,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
  emptyText: {
    color: c.muted.default,
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
