import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, borderRadius } from '@/config/theme';

interface Props {
  isManualMode: boolean;
  onPress: () => void;
}

export function KeyboardToggleButton({ isManualMode, onPress }: Props) {
  return (
    <Pressable
      style={[styles.fab, isManualMode && styles.fabActive]}
      onPress={onPress}
    >
      <Text style={styles.icon}>{isManualMode ? '⌨️' : '📷'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  icon: {
    fontSize: 24,
  },
});
