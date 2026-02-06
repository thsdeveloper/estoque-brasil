import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';
import type { Produto } from '@/types/api';

interface Props {
  visible: boolean;
  produto: Produto | null;
  onConfirm: (quantidade: number) => void;
  onCancel: () => void;
}

export function QuantityDialog({ visible, produto, onConfirm, onCancel }: Props) {
  const [value, setValue] = useState('1');

  const handleConfirm = () => {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) return;
    onConfirm(qty);
    setValue('1');
  };

  const handleCancel = () => {
    setValue('1');
    onCancel();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Quantidade</Text>
          {produto && (
            <Text style={styles.productName} numberOfLines={2}>
              {produto.descricao}
            </Text>
          )}

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
            onSubmitEditing={handleConfirm}
          />

          <View style={styles.buttons}>
            <Pressable style={[styles.button, styles.cancelBtn]} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmBtn]} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  productName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
    fontWeight: 'bold',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.surfaceLight,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  confirmText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
