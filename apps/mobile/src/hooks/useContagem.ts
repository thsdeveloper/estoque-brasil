import { useCallback, useContext, useState } from 'react';
import { InventarioContext } from '@/contexts/InventarioContext';
import { inventarioService } from '@/services/inventario.service';
import { produtoService } from '@/services/produto.service';
import { contagemService } from '@/services/contagem.service';
import { useSound } from './useSound';
import type { Contagem, Produto, Setor } from '@/types/api';

export interface ScannedProduct {
  produto: Produto;
  contagem: Contagem;
  timestamp: number;
}

interface UseContagemReturn {
  activeSetor: Setor | null;
  scannedProducts: ScannedProduct[];
  totalContagens: number;
  searchMode: 'ean' | 'interno';
  isMultipleMode: boolean;
  setActiveSetor: (setor: Setor | null) => void;
  setSearchMode: (mode: 'ean' | 'interno') => void;
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
}

export function useContagem(): UseContagemReturn {
  const { inventario } = useContext(InventarioContext);
  const { playSuccess, playError, playAttention } = useSound();

  const [activeSetor, setActiveSectorState] = useState<Setor | null>(null);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [totalContagens, setTotalContagens] = useState(0);
  const [searchMode, setSearchMode] = useState<'ean' | 'interno'>('ean');
  const [isMultipleMode, setIsMultipleMode] = useState(false);

  const setActiveSetor = useCallback(async (setor: Setor | null) => {
    if (setor) {
      try {
        const updated = await inventarioService.abrirSetor(setor.id);
        setActiveSectorState({ ...setor, abertoEm: updated.abertoEm });
      } catch {
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
        // Search product
        const produto =
          searchMode === 'ean'
            ? await produtoService.buscarPorBarcode(inventario.id, code)
            : await produtoService.buscarPorCodigoInterno(inventario.id, code);

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

        // Check if already scanned and not in multiple mode
        if (!isMultipleMode) {
          const alreadyScanned = scannedProducts.find(
            (sp) => sp.produto.id === produto.id,
          );
          if (alreadyScanned) {
            playAttention();
            return { success: false, produto, needsExtra: 'quantity' as const };
          }
        }

        // Create contagem
        const contagem = await contagemService.criar({
          idInventarioSetor: activeSetor.id,
          idProduto: produto.id,
          quantidade: extraData?.quantidade ?? 1,
          lote: extraData?.lote,
          validade: extraData?.validade,
        });

        const newItem: ScannedProduct = {
          produto,
          contagem,
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
      searchMode,
      isMultipleMode,
      scannedProducts,
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
    searchMode,
    isMultipleMode,
    setActiveSetor,
    setSearchMode,
    setIsMultipleMode,
    submitBarcode,
    clearScanned,
    loadExistingContagens,
  };
}
