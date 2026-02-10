import { useCallback, useEffect, useRef, useState } from 'react';
import { produtoService } from '@/services/produto.service';
import type { Produto } from '@/types/api';

// Module-level maps - persist across re-renders, no React state overhead
let barcodeIndex: Map<string, Produto> = new Map();
let codigoInternoIndex: Map<string, Produto> = new Map();
let cachedInventarioId: number | null = null;

function buildIndexes(produtos: Produto[]) {
  barcodeIndex = new Map();
  codigoInternoIndex = new Map();

  for (const p of produtos) {
    if (p.codigoBarras) {
      barcodeIndex.set(p.codigoBarras, p);
    }
    if (p.codigoInterno) {
      codigoInternoIndex.set(p.codigoInterno, p);
    }
  }
}

export function useProductCache(idInventario: number | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [totalCached, setTotalCached] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadCache = useCallback(async (inventarioId: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const produtos = await produtoService.buscarTodos(inventarioId);
      buildIndexes(produtos);
      cachedInventarioId = inventarioId;
      setTotalCached(produtos.length);
      setIsReady(true);
      console.log(`[ProductCache] ${produtos.length} produtos carregados para inventario ${inventarioId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar cache';
      setError(message);
      console.error('[ProductCache] Erro:', message);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (idInventario && idInventario !== cachedInventarioId) {
      loadCache(idInventario);
    } else if (idInventario && idInventario === cachedInventarioId) {
      setIsReady(true);
      setTotalCached(barcodeIndex.size + codigoInternoIndex.size);
    }
  }, [idInventario, loadCache]);

  const lookupByBarcode = useCallback((code: string): Produto | null => {
    return barcodeIndex.get(code) ?? null;
  }, []);

  const lookupByCodigoInterno = useCallback((code: string): Produto | null => {
    return codigoInternoIndex.get(code) ?? null;
  }, []);

  const reloadCache = useCallback(() => {
    if (idInventario) {
      cachedInventarioId = null;
      loadCache(idInventario);
    }
  }, [idInventario, loadCache]);

  return {
    isLoading,
    isReady,
    totalCached,
    error,
    lookupByBarcode,
    lookupByCodigoInterno,
    reloadCache,
  };
}
