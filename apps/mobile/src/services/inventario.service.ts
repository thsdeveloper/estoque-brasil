import api from './api';
import type { Inventario, Setor, PaginatedResponse } from '@/types/api';

export const inventarioService = {
  async listAtivos(): Promise<Inventario[]> {
    const { data } = await api.get<PaginatedResponse<Inventario>>('/inventarios', {
      params: { limit: 100 },
    });
    return data.data.filter((inv) => inv.ativo);
  },

  async getById(id: number): Promise<Inventario> {
    const { data } = await api.get<Inventario>(`/inventarios/${id}`);
    return data;
  },

  async getSetores(idInventario: number): Promise<Setor[]> {
    const { data } = await api.get<Setor[]>(`/inventarios/${idInventario}/setores`);
    return data;
  },
};
