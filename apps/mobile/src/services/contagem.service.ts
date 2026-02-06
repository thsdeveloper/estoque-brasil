import api from './api';
import type { Contagem, CreateContagemRequest, PaginatedResponse } from '@/types/api';

export const contagemService = {
  async criar(data: CreateContagemRequest): Promise<Contagem> {
    const { data: contagem } = await api.post<Contagem>('/contagens', data);
    return contagem;
  },

  async listarPorSetor(idInventarioSetor: number): Promise<Contagem[]> {
    const { data } = await api.get<PaginatedResponse<Contagem>>('/contagens', {
      params: { idInventarioSetor, limit: 1000 },
    });
    return data.data;
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/contagens/${id}`);
  },

  async atualizar(
    id: number,
    data: Partial<Pick<Contagem, 'quantidade' | 'lote' | 'validade' | 'divergente'>>,
  ): Promise<Contagem> {
    const { data: contagem } = await api.put<Contagem>(`/contagens/${id}`, data);
    return contagem;
  },
};
