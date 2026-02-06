import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ProductListItem } from './ProductListItem';
import { colors, fontSize, spacing } from '@/config/theme';
import type { ScannedProduct } from '@/hooks/useContagem';

interface Props {
  products: ScannedProduct[];
  maxVisible?: number;
}

export function ProductList({ products, maxVisible = 5 }: Props) {
  const visibleProducts = products.slice(0, maxVisible);

  if (visibleProducts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nenhum produto escaneado</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={visibleProducts}
      keyExtractor={(item) => `${item.contagem.id}-${item.timestamp}`}
      renderItem={({ item, index }) => (
        <ProductListItem item={item} index={index} />
      )}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  separator: {
    height: 0,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textDisabled,
  },
});
