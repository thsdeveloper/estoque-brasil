import { useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { AxiosError } from 'axios';
import { InventarioContext } from '@/contexts/InventarioContext';
import { inventarioService } from '@/services/inventario.service';
import { produtoService } from '@/services/produto.service';
import { contagemService } from '@/services/contagem.service';
import { useSound } from './useSound';
import { useProductCache } from './useProductCache';
import { useContagemQueue } from './useContagemQueue';
import type { Contagem, Produto, Setor, SyncStatus } from '@/types/api';

export interface ScannedProduct {
  produto: Produto;
  contagem: Contagem;
  timestamp: number;
}

interface UseContagemReturn {
  activeSetor: Setor | null;
  scannedProducts: ScannedProduct[];
  totalContagens: number;
  isMultipleMode: boolean;
  productCacheReady: boolean;
  productCacheLoading: boolean;
  syncStatus: SyncStatus;
  setActiveSetor: (setor: Setor | null) => void;
  setIsMultipleMode: (v: boolean) => void;
  submitBarcode: (
    code: string,
    extraData?: { quantidade?: number; lote?: string; validade?: string },
  ) => Promise<{
    success: boolean;
    produto?: Produto;
    needsExtra?: 'quantity' | 'lot';
    error?: string;
  }>;
  clearScanned: () => void;
  loadExistingContagens: () => Promise<void>;
  flushNow: () => Promise<void>;
  retryFailed: () => Promise<void>;
}

let localContagemId = -1;

export function useContagem(): UseContagemReturn {
  const { inventario } = useContext(InventarioContext);
  const { playSuccess, playError, playAttention } = useSound();

  const [activeSetor, setActiveSectorState] = useState<Setor | null>(null);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [totalContagens, setTotalContagens] = useState(0);
  const [isMultipleMode, setIsMultipleMode] = useState(false);

  const {
    isLoading: productCacheLoading,
    isReady: productCacheReady,
    lookupByCodigo,
  } = useProductCache(inventario?.id ?? null);

  const { fireAndForget, syncStatus, flushNow, retryFailed } = useContagemQueue();

  const setActiveSetor = useCallback(async (setor: Setor | null) => {
    if (setor) {
      try {
        const updated = await inventarioService.abrirSetor(setor.id);
        setActiveSectorState({ ...setor, abertoEm: updated.abertoEm, status: updated.status, idUsuarioContagem: updated.idUsuarioContagem });

        if (updated.warning?.code === 'FORA_SEQUENCIA') {
          Alert.alert('Fora de Sequencia', updated.warning.message);
        }
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.data) {
          const errorData = err.response.data as { code?: string; message?: string; nomeOperador?: string; nomeSetor?: string; idSetorAberto?: number };

          if (errorData.code === 'SETOR_FINALIZADO') {
            Alert.alert('Setor Finalizado', 'Este setor ja foi finalizado e nao pode ser aberto.');
            return;
          }

          if (errorData.code === 'SETOR_EM_CONTAGEM') {
            Alert.alert('Setor em Uso', `Este setor esta sendo usado por ${errorData.nomeOperador}`);
            return;
          }

          if (errorData.code === 'SETOR_JA_ABERTO') {
            Alert.alert(
              'Setor em Aberto',
              `Nao e possivel abrir um novo setor. Feche o setor "${errorData.nomeSetor}" antes de continuar.`,
            );
            return;
          }
        }
        // Fallback: set sector state anyway for non-handled errors
        setActiveSectorState(setor);
      }
    } else {
      setActiveSectorState(null);
    }
  }, []);

  const loadExistingContagens = useCallback(async () => {
    if (!activeSetor) return;
    try {
      const contagens = await contagemService.listarPorSetor(activeSetor.id);
      setTotalContagens(contagens.length);
    } catch {
      // silently fail
    }
  }, [activeSetor]);

  const submitBarcode = useCallback(
    async (
      code: string,
      extraData?: { quantidade?: number; lote?: string; validade?: string },
    ) => {
      if (!inventario || !activeSetor) {
        playError();
        return { success: false, error: 'Inventario ou setor nao selecionado' };
      }

      try {
        // Try cache first (EAN then codigo interno), fallback to API
        let produto: Produto | null = null;

        if (productCacheReady) {
          produto = lookupByCodigo(code);
        }

        // Fallback to API if not in cache (product added after cache load)
        if (!produto) {
          produto = await produtoService.buscarPorCodigo(inventario.id, code);
        }

        if (!produto) {
          playError();
          return {
            success: false,
            error: 'Produto nao encontrado no inventario',
          };
        }

        // Check if needs lot/validity data
        if (
          (inventario.lote || inventario.validade) &&
          !extraData?.lote &&
          !extraData?.validade
        ) {
          playAttention();
          return { success: false, produto, needsExtra: 'lot' as const };
        }

        // Check if already scanned and in multiple mode (ask quantity)
        if (isMultipleMode) {
          const alreadyScanned = scannedProducts.find(
            (sp) => sp.produto.id === produto!.id,
          );
          if (alreadyScanned) {
            playAttention();
            return { success: false, produto, needsExtra: 'quantity' as const };
          }
        }

        // Build request
        const request = {
          idInventarioSetor: activeSetor.id,
          idProduto: produto.id,
          quantidade: extraData?.quantidade ?? 1,
          lote: extraData?.lote,
          validade: extraData?.validade,
          ...(produto.divergente ? { reconferencia: true } : {}),
        };

        // Fire-and-forget: send to server in background
        fireAndForget(request, produto);

        // Create local contagem for immediate UI feedback
        const localContagem: Contagem = {
          id: localContagemId--,
          idInventarioSetor: activeSetor.id,
          idProduto: produto.id,
          data: new Date().toISOString(),
          quantidade: extraData?.quantidade ?? 1,
          lote: extraData?.lote,
          validade: extraData?.validade,
          divergente: produto.divergente,
          reconferido: false,
        };

        const newItem: ScannedProduct = {
          produto,
          contagem: localContagem,
          timestamp: Date.now(),
        };

        setScannedProducts((prev) => [newItem, ...prev].slice(0, 50));
        setTotalContagens((prev) => prev + 1);
        playSuccess();

        return { success: true, produto };
      } catch (err: unknown) {
        playError();
        const message =
          err instanceof Error ? err.message : 'Erro ao registrar contagem';
        return { success: false, error: message };
      }
    },
    [
      inventario,
      activeSetor,
      isMultipleMode,
      scannedProducts,
      productCacheReady,
      lookupByCodigo,
      fireAndForget,
      playSuccess,
      playError,
      playAttention,
    ],
  );

  const clearScanned = useCallback(() => {
    setScannedProducts([]);
    setTotalContagens(0);
  }, []);

  return {
    activeSetor,
    scannedProducts,
    totalContagens,
    isMultipleMode,
    productCacheReady,
    productCacheLoading,
    syncStatus,
    setActiveSetor,
    setIsMultipleMode,
    submitBarcode,
    clearScanned,
    loadExistingContagens,
    flushNow,
    retryFailed,
  };
}
