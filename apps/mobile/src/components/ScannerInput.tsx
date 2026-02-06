import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';

interface Props {
  inputRef: React.RefObject<TextInput | null>;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  showSoftInputOnFocus: boolean;
  isProcessing?: boolean;
  label?: string;
  autoFocus?: boolean;
}

export function ScannerInput({
  inputRef,
  value,
  placeholder,
  onChangeText,
  onSubmitEditing,
  showSoftInputOnFocus,
  isProcessing,
  label,
  autoFocus = true,
}: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          showSoftInputOnFocus={showSoftInputOnFocus}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          blurOnSubmit={false}
          selectTextOnFocus
        />
        {isProcessing && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.spinner}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.primary,
    fontWeight: 'bold',
  },
  spinner: {
    position: 'absolute',
    right: spacing.lg,
  },
});
