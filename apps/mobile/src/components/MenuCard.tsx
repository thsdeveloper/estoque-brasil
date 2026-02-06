import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';

interface Props {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  onPress: () => void;
}

export function MenuCard({ title, description, icon, color = colors.primary, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardPressed: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
