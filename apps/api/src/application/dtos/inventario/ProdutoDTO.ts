import { z } from 'zod';
import { InventarioProduto } from '../../../domain/entities/InventarioProduto.js';

// Schema de validação para criação de produto
export const createProdutoSchema = z.object({
  idInventario: z
    .number({ required_error: 'ID do inventário é obrigatório' })
    .int('ID do inventário deve ser um número inteiro')
    .positive('ID do inventário deve ser positivo'),
  codigoBarras: z
    .string()
    .max(50, 'Código de barras deve ter no máximo 50 caracteres')
    .nullish(),
  codigoInterno: z
    .string()
    .max(50, 'Código interno deve ter no máximo 50 caracteres')
    .nullish(),
  descricao: z
    .string({ required_error: 'Descrição é obrigatória' })
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  lote: z.string().max(50, 'Lote deve ter no máximo 50 caracteres').nullish(),
  validade: z.string().date('Validade deve ser uma data válida (YYYY-MM-DD)').nullish(),
  saldo: z
    .number()
    .min(0, 'Saldo não pode ser negativo')
    .default(0),
  custo: z
    .number()
    .min(0, 'Custo não pode ser negativo')
    .default(0),
  divergente: z.boolean().default(false),
});

// Schema de validação para atualização de produto
export const updateProdutoSchema = z.object({
  codigoBarras: z
    .string()
    .max(50, 'Código de barras deve ter no máximo 50 caracteres')
    .nullish(),
  codigoInterno: z
    .string()
    .max(50, 'Código interno deve ter no máximo 50 caracteres')
    .nullish(),
  descricao: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  lote: z.string().max(50, 'Lote deve ter no máximo 50 caracteres').nullish(),
  validade: z.string().date('Validade deve ser uma data válida (YYYY-MM-DD)').nullish(),
  saldo: z
    .number()
    .min(0, 'Saldo não pode ser negativo')
    .optional(),
  custo: z
    .number()
    .min(0, 'Custo não pode ser negativo')
    .optional(),
  divergente: z.boolean().optional(),
});

export type CreateProdutoDTO = z.infer<typeof createProdutoSchema>;
export type UpdateProdutoDTO = z.infer<typeof updateProdutoSchema>;

export interface ProdutoResponseDTO {
  id: number;
  idInventario: number;
  codigoBarras: string | null;
  codigoInterno: string | null;
  descricao: string;
  lote: string | null;
  validade: string | null;
  saldo: number;
  custo: number;
  divergente: boolean;
}

export interface PaginatedProdutoResponseDTO {
  data: ProdutoResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toProdutoResponseDTO(produto: InventarioProduto): ProdutoResponseDTO {
  return {
    id: produto.id!,
    idInventario: produto.idInventario,
    codigoBarras: produto.codigoBarras,
    codigoInterno: produto.codigoInterno,
    descricao: produto.descricao,
    lote: produto.lote,
    validade: produto.validade?.toISOString().split('T')[0] ?? null,
    saldo: produto.saldo,
    custo: produto.custo,
    divergente: produto.divergente,
  };
}
