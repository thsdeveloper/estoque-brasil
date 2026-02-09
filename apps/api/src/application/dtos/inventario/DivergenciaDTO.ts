import { z } from 'zod';

export const listDivergenciasQuerySchema = z.object({
  idSetor: z.coerce.number().int().positive().optional(),
  status: z.enum(['pendente', 'reconferido', 'todos']).default('todos'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListDivergenciasQuery = z.infer<typeof listDivergenciasQuerySchema>;

export interface DivergenciaResponseDTO {
  idProduto: number;
  codigoBarras: string | null;
  descricao: string;
  idSetor: number;
  descricaoSetor: string | null;
  qtdEsperada: number;
  qtdContada: number;
  diferenca: number;
  reconferido: boolean;
}

export interface PaginatedDivergenciaResponseDTO {
  data: DivergenciaResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
