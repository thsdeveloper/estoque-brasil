import React, { createContext, useCallback, useContext, useState } from 'react';
import { inventarioService } from '@/services/inventario.service';
import type { Inventario, Setor } from '@/types/api';
import { AuthContext } from './AuthContext';

interface InventarioState {
  inventario: Inventario | null;
  setores: Setor[];
  isLoading: boolean;
}

interface InventarioContextData extends InventarioState {
  loadInventario: () => Promise<void>;
  loadSetores: () => Promise<void>;
  setInventario: (inv: Inventario | null) => void;
  clear: () => void;
}

export const InventarioContext = createContext<InventarioContextData>(
  {} as InventarioContextData,
);

export function InventarioProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [state, setState] = useState<InventarioState>({
    inventario: null,
    setores: [],
    isLoading: false,
  });

  const loadInventario = useCallback(async () => {
    if (!isAuthenticated) return;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const inventarios = await inventarioService.listAtivos();
      const inv = inventarios.length > 0 ? inventarios[0] : null;
      setState((prev) => ({ ...prev, inventario: inv, isLoading: false }));
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated]);

  const loadSetores = useCallback(async () => {
    if (!state.inventario) return;
    try {
      const setores = await inventarioService.getSetores(state.inventario.id);
      setState((prev) => ({ ...prev, setores }));
    } catch {
      // silently fail
    }
  }, [state.inventario]);

  const setInventario = useCallback((inv: Inventario | null) => {
    setState((prev) => ({ ...prev, inventario: inv, setores: [] }));
  }, []);

  const clear = useCallback(() => {
    setState({ inventario: null, setores: [], isLoading: false });
  }, []);

  return (
    <InventarioContext.Provider
      value={{ ...state, loadInventario, loadSetores, setInventario, clear }}
    >
      {children}
    </InventarioContext.Provider>
  );
}
