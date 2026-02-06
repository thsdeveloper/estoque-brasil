import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { InventarioContext } from '@/contexts/InventarioContext';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useContagem } from '@/hooks/useContagem';
import { useSound } from '@/hooks/useSound';
import { ScannerInput } from '@/components/ScannerInput';
import { SectorListItem } from '@/components/SectorListItem';
import { ProductList } from '@/components/ProductList';
import { QuantityDialog } from '@/components/QuantityDialog';
import { LotValidityDialog } from '@/components/LotValidityDialog';
import { KeyboardToggleButton } from '@/components/KeyboardToggleButton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';
import type { CountingScreenProps } from '@/types/navigation';
import type { Produto, Setor } from '@/types/api';

export function CountingScreen({ navigation, route }: CountingScreenProps) {
  const isDivergenceMode = route.params?.mode === 'divergence';
  const { inventario, setores, loadSetores } = useContext(InventarioContext);
  const {
    activeSetor,
    scannedProducts,
    totalContagens,
    searchMode,
    isMultipleMode,
    setActiveSetor,
    setSearchMode,
    setIsMultipleMode,
    submitBarcode,
    clearScanned,
    loadExistingContagens,
  } = useContagem();
  const { playClick, playAttention } = useSound();
  const [loading, setLoading] = useState(false);
  const [showQtyDialog, setShowQtyDialog] = useState(false);
  const [showLotDialog, setShowLotDialog] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [pendingProduto, setPendingProduto] = useState<Produto | null>(null);
  const [pendingBarcode, setPendingBarcode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sector scanner
  const sectorScanner = useBarcodeScanner({
    onScan: handleSectorScan,
    debounceMs: 350,
  });

  // Product scanner
  const productScanner = useBarcodeScanner({
    onScan: handleProductScan,
    debounceMs: 100,
  });

  useEffect(() => {
    if (inventario) {
      loadSetores();
    }
  }, [inventario, loadSetores]);

  useEffect(() => {
    if (activeSetor) {
      loadExistingContagens();
    }
  }, [activeSetor, loadExistingContagens]);

  useFocusEffect(
    useCallback(() => {
      if (activeSetor) {
        productScanner.focusInput();
      } else {
        sectorScanner.focusInput();
      }
    }, [activeSetor]),
  );

  // Clear error after 3s
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  async function handleSectorScan(code: string) {
    const sectorNum = parseInt(code, 10);
    if (isNaN(sectorNum)) {
      setErrorMessage('Codigo de setor invalido');
      return;
    }

    const found = setores.find(
      (s) => sectorNum >= s.inicio && sectorNum <= s.termino,
    );

    if (!found) {
      setErrorMessage(`Setor ${code} nao encontrado`);
      return;
    }

    Alert.alert(
      'Abrir Setor',
      `Deseja abrir o setor ${found.prefixo || ''}${found.inicio}-${found.termino}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir',
          onPress: () => {
            setActiveSetor(found);
            clearScanned();
            playClick();
          },
        },
      ],
    );
  }

  async function handleProductScan(code: string) {
    setPendingBarcode(code);
    setErrorMessage(null);

    const result = await submitBarcode(code);

    if (result.success) {
      return;
    }

    if (result.needsExtra === 'lot' && result.produto) {
      setPendingProduto(result.produto);
      setShowLotDialog(true);
      return;
    }

    if (result.needsExtra === 'quantity' && result.produto) {
      setPendingProduto(result.produto);
      setShowQtyDialog(true);
      return;
    }

    if (result.error) {
      setErrorMessage(result.error);
    }
  }

  const handleQtyConfirm = async (quantidade: number) => {
    setShowQtyDialog(false);
    if (pendingProduto) {
      await submitBarcode(pendingBarcode, { quantidade });
      setPendingProduto(null);
    }
    productScanner.focusInput();
  };

  const handleLotConfirm = async (data: {
    lote?: string;
    validade?: string;
    quantidade: number;
  }) => {
    setShowLotDialog(false);
    if (pendingProduto) {
      await submitBarcode(pendingBarcode, data);
      setPendingProduto(null);
    }
    productScanner.focusInput();
  };

  const handleDialogCancel = () => {
    setShowQtyDialog(false);
    setShowLotDialog(false);
    setPendingProduto(null);
    productScanner.focusInput();
  };

  const handleCloseSetor = () => {
    if (totalContagens < (inventario?.minimoContagem ?? 0)) {
      playAttention();
      Alert.alert(
        'Atencao',
        `Minimo de ${inventario?.minimoContagem} contagens necessarias. Atual: ${totalContagens}.`,
      );
      return;
    }
    setShowCloseConfirm(true);
  };

  const confirmCloseSetor = () => {
    setShowCloseConfirm(false);
    setActiveSetor(null);
    clearScanned();
    playClick();
    sectorScanner.focusInput();
  };

  const handleSelectSetor = (setor: Setor) => {
    Alert.alert(
      'Abrir Setor',
      `Deseja abrir o setor ${setor.prefixo || ''}${setor.inicio}-${setor.termino}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir',
          onPress: () => {
            setActiveSetor(setor);
            clearScanned();
            playClick();
          },
        },
      ],
    );
  };

  // PHASE 1: Sector Selection
  if (!activeSetor) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingOverlay visible={loading} />

        <View style={styles.section}>
          <ScannerInput
            inputRef={sectorScanner.inputRef}
            value={sectorScanner.value}
            placeholder="Escanear codigo do setor"
            onChangeText={sectorScanner.onChangeText}
            onSubmitEditing={sectorScanner.onSubmitEditing}
            showSoftInputOnFocus={sectorScanner.showSoftInputOnFocus}
            isProcessing={sectorScanner.isProcessing}
            label={isDivergenceMode ? 'Setor (Recontagem)' : 'Setor'}
          />
        </View>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Setores ({setores.length})
        </Text>

        <FlatList
          data={setores}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <SectorListItem setor={item} onPress={handleSelectSetor} />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />

        <KeyboardToggleButton
          isManualMode={sectorScanner.isManualMode}
          onPress={sectorScanner.toggleManualMode}
        />
      </SafeAreaView>
    );
  }

  // PHASE 2: Product Counting
  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={loading} />

      <QuantityDialog
        visible={showQtyDialog}
        produto={pendingProduto}
        onConfirm={handleQtyConfirm}
        onCancel={handleDialogCancel}
      />

      <LotValidityDialog
        visible={showLotDialog}
        produto={pendingProduto}
        showLote={inventario?.lote ?? false}
        showValidade={inventario?.validade ?? false}
        onConfirm={handleLotConfirm}
        onCancel={handleDialogCancel}
      />

      <ConfirmDialog
        visible={showCloseConfirm}
        title="Fechar Setor"
        message={`Deseja fechar o setor? Total de contagens: ${totalContagens}`}
        confirmText="Fechar"
        onConfirm={confirmCloseSetor}
        onCancel={() => setShowCloseConfirm(false)}
      />

      <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Sector Header */}
        <View style={styles.sectorHeader}>
          <View style={styles.sectorInfo}>
            <Text style={styles.sectorLabel}>Setor Ativo</Text>
            <Text style={styles.sectorName}>
              {activeSetor.prefixo || ''}
              {activeSetor.inicio} - {activeSetor.termino}
            </Text>
          </View>
          <View style={styles.counterBadge}>
            <Text style={styles.counterNumber}>{totalContagens}</Text>
            <Text style={styles.counterLabel}>itens</Text>
          </View>
        </View>

        {/* Search Mode Toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleBtn,
              searchMode === 'ean' && styles.toggleBtnActive,
            ]}
            onPress={() => setSearchMode('ean')}
          >
            <Text
              style={[
                styles.toggleText,
                searchMode === 'ean' && styles.toggleTextActive,
              ]}
            >
              EAN
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              searchMode === 'interno' && styles.toggleBtnActive,
            ]}
            onPress={() => setSearchMode('interno')}
          >
            <Text
              style={[
                styles.toggleText,
                searchMode === 'interno' && styles.toggleTextActive,
              ]}
            >
              Cod. Interno
            </Text>
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Multi</Text>
            <Switch
              value={isMultipleMode}
              onValueChange={setIsMultipleMode}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
              thumbColor={isMultipleMode ? colors.primary : colors.textDisabled}
            />
          </View>
        </View>

        {/* Scanner Input */}
        <View style={styles.section}>
          <ScannerInput
            inputRef={productScanner.inputRef}
            value={productScanner.value}
            placeholder={
              searchMode === 'ean'
                ? 'Escanear codigo de barras'
                : 'Escanear codigo interno'
            }
            onChangeText={productScanner.onChangeText}
            onSubmitEditing={productScanner.onSubmitEditing}
            showSoftInputOnFocus={productScanner.showSoftInputOnFocus}
            isProcessing={productScanner.isProcessing}
          />
        </View>

        {/* Error Banner */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Recent Products */}
        <Text style={styles.sectionTitle}>Ultimos Escaneados</Text>
        <View style={styles.section}>
          <ProductList products={scannedProducts} maxVisible={5} />
        </View>

        {/* Close Sector Button */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            onPress={handleCloseSetor}
          >
            <Text style={styles.closeButtonText}>Fechar Setor</Text>
          </Pressable>
        </View>
      </ScrollView>

      <KeyboardToggleButton
        isManualMode={productScanner.isManualMode}
        onPress={productScanner.toggleManualMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  list: {
    padding: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.error,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  sectorInfo: {
    flex: 1,
  },
  sectorLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectorName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  counterBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  counterLabel: {
    fontSize: fontSize.xs,
    color: colors.text,
    opacity: 0.8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  toggleBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.text,
  },
  switchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  switchLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  closeButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  closeButtonPressed: {
    opacity: 0.8,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
});
