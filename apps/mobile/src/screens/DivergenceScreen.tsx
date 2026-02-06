import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { InventarioContext } from '@/contexts/InventarioContext';
import { produtoService } from '@/services/produto.service';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';
import type { DivergenceScreenProps } from '@/types/navigation';
import type { Produto } from '@/types/api';

export function DivergenceScreen({ navigation }: DivergenceScreenProps) {
  const { inventario } = useContext(InventarioContext);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDivergentes = useCallback(async () => {
    if (!inventario) return;
    setLoading(true);
    try {
      const data = await produtoService.buscarDivergentes(inventario.id);
      setProdutos(data);
    } catch {
      Alert.alert('Erro', 'Falha ao carregar divergencias.');
    } finally {
      setLoading(false);
    }
  }, [inventario]);

  useEffect(() => {
    loadDivergentes();
  }, [loadDivergentes]);

  const handleRecontar = () => {
    navigation.navigate('Counting', { mode: 'divergence' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={loading} message="Carregando divergencias..." />

      <View style={styles.header}>
        <Text style={styles.title}>Produtos Divergentes</Text>
        <Text style={styles.subtitle}>
          {produtos.length} produto(s) com divergencia
        </Text>
      </View>

      {produtos.length === 0 && !loading && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>Nenhuma divergencia encontrada</Text>
        </View>
      )}

      <FlatList
        data={produtos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemDesc} numberOfLines={1}>
                {item.descricao}
              </Text>
              <Text style={styles.itemCode}>
                {item.codigoBarras || item.codigoInterno || `ID: ${item.id}`}
              </Text>
            </View>
            <View style={styles.itemSaldo}>
              <Text style={styles.saldoValue}>{item.saldo}</Text>
              <Text style={styles.saldoLabel}>saldo</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />

      {produtos.length > 0 && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleRecontar}
          >
            <Text style={styles.buttonText}>Iniciar Recontagem</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  itemInfo: {
    flex: 1,
  },
  itemDesc: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  itemCode: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemSaldo: {
    alignItems: 'center',
    minWidth: 48,
  },
  saldoValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.warning,
  },
  saldoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.warning,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
});
