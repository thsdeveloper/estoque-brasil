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
  showLote: boolean;
  showValidade: boolean;
  onConfirm: (data: { lote?: string; validade?: string; quantidade: number }) => void;
  onCancel: () => void;
}

export function LotValidityDialog({
  visible,
  produto,
  showLote,
  showValidade,
  onConfirm,
  onCancel,
}: Props) {
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [quantidade, setQuantidade] = useState('1');

  const handleConfirm = () => {
    const qty = parseInt(quantidade, 10);
    if (isNaN(qty) || qty < 1) return;
    onConfirm({
      lote: showLote && lote.trim() ? lote.trim() : undefined,
      validade: showValidade && validade.trim() ? validade.trim() : undefined,
      quantidade: qty,
    });
    setLote('');
    setValidade('');
    setQuantidade('1');
  };

  const handleCancel = () => {
    setLote('');
    setValidade('');
    setQuantidade('1');
    onCancel();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Dados Adicionais</Text>
          {produto && (
            <Text style={styles.productName} numberOfLines={2}>
              {produto.descricao}
            </Text>
          )}

          {showLote && (
            <>
              <Text style={styles.label}>Lote</Text>
              <TextInput
                style={styles.input}
                value={lote}
                onChangeText={setLote}
                placeholder="Numero do lote"
                placeholderTextColor={colors.textDisabled}
                autoFocus
              />
            </>
          )}

          {showValidade && (
            <>
              <Text style={styles.label}>Validade</Text>
              <TextInput
                style={styles.input}
                value={validade}
                onChangeText={setValidade}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.textDisabled}
                keyboardType="numeric"
              />
            </>
          )}

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.inputQty}
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
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
    marginBottom: spacing.xs,
  },
  productName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputQty: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.xl,
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
