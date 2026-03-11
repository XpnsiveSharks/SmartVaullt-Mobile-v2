import React, { ReactElement } from 'react';
import { FlatList, View, Text, Pressable, ScrollView } from 'react-native';
import { useThemeColors } from '../../context/ThemeContext';

type BorderedListProps<T> = {
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  renderItem?: (item: T, index: number, isSelected: boolean) => React.ReactNode;
  onItemPress?: (item: T, index: number) => void;
  iconExtractor?: (item: T, index: number) => React.ReactElement | null; // left icon
  rightContentExtractor?: (item: T, index: number) => React.ReactElement | null; // right content
  className?: string;
  maxVisibleItems?: number; // max items before scroll
  itemHeight?: number; // estimated row height
  selectedId?: string;
  getId?: (item: T) => string;
  itemGap?: number; // gap between items in pixels
  scrollEnabled?: boolean; // If false, renders as a simple View mapping to avoid VirtualizedList nesting errors
};

function BorderedList<T>({
  data,
  keyExtractor = (_, index) => index.toString(),
  renderItem,
  onItemPress,
  iconExtractor,
  rightContentExtractor,
  className = '',
  maxVisibleItems = 5,
  itemHeight = 56,
  selectedId,
  getId,
  itemGap = 8,
  scrollEnabled = true,
}: BorderedListProps<T>) {
  const colors = useThemeColors();
  const maxHeight = maxVisibleItems * itemHeight;

  const renderItemContent = (item: T, index: number) => {
    const leftIcon = iconExtractor?.(item, index);
    const rightContent = rightContentExtractor?.(item, index);
    const isSelected =
      selectedId && getId ? selectedId === getId(item) : false;

    return (
      <Pressable
        key={keyExtractor(item, index)}
        disabled={!onItemPress}
        onPress={() => onItemPress?.(item, index)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          gap: 12,
          borderRadius: 16,
          minHeight: itemHeight,
          marginBottom: itemGap,
          backgroundColor: isSelected ? colors.surface.active : colors.surface.default,
          borderWidth: isSelected ? 1 : 0,
          borderColor: isSelected ? colors.accent.default : 'transparent',
        }}
      >
        <View className="flex-row items-center flex-1">
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          {renderItem ? (
            renderItem(item, index, isSelected)
          ) : (
            <Text
              style={{ flex: 1, flexWrap: 'wrap', color: colors.text.default, fontWeight: isSelected ? '600' : '400' }}
            >
              {String(item)}
            </Text>
          )}
        </View>

        {rightContent && <View className="ml-3">{rightContent}</View>}
      </Pressable>
    );
  };

  if (!scrollEnabled) {
    return (
      <View className={`bg-transparent ${className}`}>
        {data.map((item, index) => renderItemContent(item, index))}
      </View>
    );
  }

  return (
    <View
      className={`bg-transparent overflow-hidden ${className}`}
      style={{ maxHeight }}
    >
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        renderItem={({ item, index }) => renderItemContent(item, index)}
        // Remove ItemSeparator and contentContainer padding to match map logic
      />
    </View>
  );
}

export default BorderedList;