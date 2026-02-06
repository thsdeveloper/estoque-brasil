import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';
import type { Setor } from '@/types/api';

interface Props {
  setor: Setor;
  onPress: (setor: Setor) => void;
  isActive?: boolean;
}

export function SectorListItem({ setor, onPress, isActive }: Props) {
  const rangeLabel = setor.prefixo
    ? `${setor.prefixo}${setor.inicio} - ${setor.prefixo}${setor.termino}`
    : `${setor.inicio} - ${setor.termino}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isActive && styles.active,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(setor)}
    >
      <View style={styles.info}>
        <Text style={styles.range}>{rangeLabel}</Text>
        {setor.descricao && (
          <Text style={styles.description} numberOfLines={1}>
            {setor.descricao}
          </Text>
        )}
      </View>
      <View style={[styles.badge, isActive && styles.badgeActive]}>
        <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
          {isActive ? 'Ativo' : 'Abrir'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  pressed: {
    opacity: 0.8,
  },
  info: {
    flex: 1,
  },
  range: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeActive: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: colors.text,
  },
});
