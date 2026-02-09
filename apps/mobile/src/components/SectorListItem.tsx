import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';
import type { Setor } from '@/types/api';

interface Props {
  setor: Setor;
  onPress: (setor: Setor) => void;
  isActive?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pendente: '#6B7280',
  em_contagem: '#F59E0B',
  finalizado: '#10B981',
};

function getStatusLabel(status?: string): string {
  switch (status) {
    case 'em_contagem':
      return 'Em Contagem';
    case 'finalizado':
      return 'Finalizado';
    default:
      return 'Pendente';
  }
}

export function SectorListItem({ setor, onPress, isActive }: Props) {
  const rangeLabel = setor.prefixo
    ? `${setor.prefixo}${setor.inicio} - ${setor.prefixo}${setor.termino}`
    : `${setor.inicio} - ${setor.termino}`;

  const statusColor = STATUS_COLORS[setor.status] || STATUS_COLORS.pendente;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isActive && styles.active,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(setor)}
    >
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <View style={styles.info}>
        <Text style={styles.range}>{rangeLabel}</Text>
        {setor.descricao && (
          <Text style={styles.description} numberOfLines={1}>
            {setor.descricao}
          </Text>
        )}
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {getStatusLabel(setor.status)}
        </Text>
      </View>
      <View style={[styles.badge, isActive && styles.badgeActive]}>
        <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
          {isActive ? 'Ativo' : setor.abertoEm ? 'Reabrir' : 'Abrir'}
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
    gap: spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    marginTop: 2,
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
