import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthContext } from '@/contexts/AuthContext';
import { InventarioContext } from '@/contexts/InventarioContext';
import { MenuCard } from '@/components/MenuCard';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useSound } from '@/hooks/useSound';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';
import type { HomeScreenProps } from '@/types/navigation';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, profile, logout, loadProfile } = useContext(AuthContext);
  const { inventario, isLoading, loadInventario } = useContext(InventarioContext);
  const { playClick } = useSound();
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    if (!initialLoaded) {
      loadProfile();
      loadInventario();
      setInitialLoaded(true);
    }
  }, [initialLoaded, loadProfile, loadInventario]);

  useFocusEffect(
    useCallback(() => {
      if (initialLoaded) {
        loadInventario();
      }
    }, [initialLoaded, loadInventario]),
  );

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const handleCounting = () => {
    if (!inventario) {
      Alert.alert('Aviso', 'Nenhum inventario ativo encontrado.');
      return;
    }
    playClick();
    navigation.navigate('Counting');
  };

  const handleDivergence = () => {
    if (!inventario) {
      Alert.alert('Aviso', 'Nenhum inventario ativo encontrado.');
      return;
    }
    playClick();
    navigation.navigate('Divergence');
  };

  const handleAtualizar = async () => {
    playClick();
    await loadInventario();
  };

  const operadorNome = profile?.fullName || user?.email || 'Operador';

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={isLoading} message="Carregando inventario..." />

      <View style={styles.header}>
        <Text style={styles.title}>Estoque Brasil</Text>
        {inventario && (
          <View style={styles.inventarioInfo}>
            <Text style={styles.inventarioLabel}>INVENTARIO ATIVO</Text>
            <Text style={styles.inventarioId}>#{inventario.id}</Text>
            <Text style={styles.inventarioDetail}>
              Min. Contagem: {inventario.minimoContagem}
              {inventario.lote ? ' | Lote' : ''}
              {inventario.validade ? ' | Validade' : ''}
            </Text>
          </View>
        )}
        {!inventario && !isLoading && (
          <Text style={styles.noInventario}>Nenhum inventario ativo</Text>
        )}
      </View>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <MenuCard
            title="Contagem"
            description="Escanear produtos"
            icon={<MaterialCommunityIcons name="barcode-scan" size={28} color="#fff" />}
            color={colors.primary}
            onPress={handleCounting}
          />
          <MenuCard
            title="Divergencias"
            description="Recontar itens"
            icon={<MaterialCommunityIcons name="alert-circle-outline" size={28} color="#fff" />}
            color={colors.warning}
            onPress={handleDivergence}
          />
        </View>
        <View style={styles.gridRow}>
          <MenuCard
            title="Calculadora"
            description="Calculadora rapida"
            icon={<MaterialCommunityIcons name="calculator-variant" size={28} color="#fff" />}
            color={colors.info}
            onPress={() => {
              playClick();
              navigation.navigate('Calculator');
            }}
          />
          <MenuCard
            title="Atualizar"
            description="Buscar inventarios"
            icon={<MaterialCommunityIcons name="refresh" size={28} color="#fff" />}
            color={colors.success}
            onPress={handleAtualizar}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <MaterialCommunityIcons name="account" size={16} color={colors.textSecondary} />
          <Text style={styles.footerText}>{operadorNome}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={16} color="#fff" />
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  inventarioInfo: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  inventarioLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  inventarioId: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  inventarioDetail: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noInventario: {
    fontSize: fontSize.sm,
    color: colors.warning,
  },
  grid: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  gridRow: {
    height: 120,
    flexDirection: 'row',
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  logoutButtonPressed: {
    opacity: 0.7,
  },
  logoutText: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: '#fff',
  },
});
