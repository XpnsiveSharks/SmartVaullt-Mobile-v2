import React from "react";
import {
  FlatList,
  FlatListProps,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

type BaseFlatListProps<T> = {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  emptyText?: string;
  loading?: boolean;
  refreshing?: boolean; 
  onRefresh?: () => void;
  contentClassName?: string; // Tailwind styles for content
  listHeaderComponent?: React.ReactElement | null;
  listFooterComponent?: React.ReactElement | null;
} & Omit<FlatListProps<T>, "renderItem" | "data">;

function BaseFlatList<T>({
  data,
  renderItem,
  keyExtractor = (_, index) => index.toString(),
  emptyText = "No items found",
  loading = false,
  refreshing = false,
  onRefresh,
  contentClassName = "px-4",
  listHeaderComponent,
  listFooterComponent,
  ...rest
}: BaseFlatListProps<T>) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={
        !loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-neutral-500">{emptyText}</Text>
          </View>
        ) : null
      }
      ListHeaderComponent={listHeaderComponent}
      ListFooterComponent={
        loading ? (
          <View className="py-4">
            <ActivityIndicator size="small" />
          </View>
        ) : (
          listFooterComponent
        )
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      contentContainerStyle={[{ flexGrow: 1 }, data.length === 0 && { flex: 1 }]}
      className={contentClassName}
      {...rest}
    />
  );
}

export default BaseFlatList;
