import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';
import type { ScannedProduct } from '@/hooks/useContagem';

interface Props {
  item: ScannedProduct;
  index: number;
}

export function ProductListItem({ item, index }: Props) {
  const { produto, contagem } = item;

  return (
    <View style={[styles.container, index === 0 && styles.latest]}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.description} numberOfLines={1}>
            {produto.descricao}
          </Text>
          <Text style={styles.code}>
            {produto.codigoBarras || produto.codigoInterno || `ID: ${produto.id}`}
          </Text>
        </View>
        <View style={styles.qtyContainer}>
          <Text style={styles.qty}>{contagem.quantidade}</Text>
          <Text style={styles.qtyLabel}>un</Text>
        </View>
      </View>
      {(contagem.lote || contagem.validade) && (
        <View style={styles.extraRow}>
          {contagem.lote && (
            <Text style={styles.extra}>Lote: {contagem.lote}</Text>
          )}
          {contagem.validade && (
            <Text style={styles.extra}>Val: {contagem.validade}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  latest: {
    borderColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  code: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  qtyContainer: {
    alignItems: 'center',
    minWidth: 48,
  },
  qty: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  qtyLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  extraRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  extra: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
