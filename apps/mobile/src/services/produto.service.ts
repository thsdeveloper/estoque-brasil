import api from './api';
import type { Produto, PaginatedResponse } from '@/types/api';

export const produtoService = {
  async buscarPorBarcode(
    idInventario: number,
    codigoBarras: string,
  ): Promise<Produto | null> {
    const { data } = await api.get<PaginatedResponse<Produto>>('/produtos', {
      params: { idInventario, codigoBarras, limit: 1 },
    });
    return data.data.length > 0 ? data.data[0] : null;
  },

  async buscarPorCodigoInterno(
    idInventario: number,
    codigoInterno: string,
  ): Promise<Produto | null> {
    const { data } = await api.get<PaginatedResponse<Produto>>('/produtos', {
      params: { idInventario, codigoInterno, limit: 1 },
    });
    return data.data.length > 0 ? data.data[0] : null;
  },

  async buscarDivergentes(idInventario: number): Promise<Produto[]> {
    const { data } = await api.get<PaginatedResponse<Produto>>('/produtos', {
      params: { idInventario, divergente: true, limit: 1000 },
    });
    return data.data;
  },
};
