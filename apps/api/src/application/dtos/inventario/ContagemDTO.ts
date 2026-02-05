import { z } from 'zod';
import { InventarioContagem } from '../../../domain/entities/InventarioContagem.js';

// Schema de validação para criação de contagem
export const createContagemSchema = z.object({
  idInventarioSetor: z
    .number({ required_error: 'ID do setor é obrigatório' })
    .int('ID do setor deve ser um número inteiro')
    .positive('ID do setor deve ser positivo'),
  idProduto: z
    .number({ required_error: 'ID do produto é obrigatório' })
    .int('ID do produto deve ser um número inteiro')
    .positive('ID do produto deve ser positivo'),
  lote: z.string().max(50, 'Lote deve ter no máximo 50 caracteres').nullish(),
  validade: z.string().date('Validade deve ser uma data válida (YYYY-MM-DD)').nullish(),
  quantidade: z
    .number({ required_error: 'Quantidade é obrigatória' })
    .min(0, 'Quantidade não pode ser negativa'),
  divergente: z.boolean().default(false),
});

// Schema de validação para atualização de contagem
export const updateContagemSchema = z.object({
  lote: z.string().max(50, 'Lote deve ter no máximo 50 caracteres').nullish(),
  validade: z.string().date('Validade deve ser uma data válida (YYYY-MM-DD)').nullish(),
  quantidade: z
    .number()
    .min(0, 'Quantidade não pode ser negativa')
    .optional(),
  divergente: z.boolean().optional(),
});

export type CreateContagemDTO = z.infer<typeof createContagemSchema>;
export type UpdateContagemDTO = z.infer<typeof updateContagemSchema>;

export interface ContagemResponseDTO {
  id: number;
  idInventarioSetor: number;
  idProduto: number;
  data: string;
  lote: string | null;
  validade: string | null;
  quantidade: number;
  divergente: boolean;
}

export interface PaginatedContagemResponseDTO {
  data: ContagemResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toContagemResponseDTO(contagem: InventarioContagem): ContagemResponseDTO {
  return {
    id: contagem.id!,
    idInventarioSetor: contagem.idInventarioSetor,
    idProduto: contagem.idProduto,
    data: contagem.data.toISOString(),
    lote: contagem.lote,
    validade: contagem.validade?.toISOString().split('T')[0] ?? null,
    quantidade: contagem.quantidade,
    divergente: contagem.divergente,
  };
}
