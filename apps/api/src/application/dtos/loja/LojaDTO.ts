import { z } from 'zod';
import { Loja } from '../../../domain/entities/Loja.js';

// Schema de validação para CNPJ
const cnpjSchema = z
  .string()
  .regex(/^\d{14}$/, 'CNPJ deve conter exatamente 14 dígitos')
  .nullish();

// Schema de validação para criação de loja
export const createLojaSchema = z.object({
  idCliente: z
    .string({ required_error: 'ID do cliente é obrigatório' })
    .uuid('ID do cliente deve ser um UUID válido'),
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  cnpj: cnpjSchema,
});

// Schema de validação para atualização de loja
export const updateLojaSchema = z.object({
  idCliente: z
    .string()
    .uuid('ID do cliente deve ser um UUID válido')
    .optional(),
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional(),
  cnpj: cnpjSchema,
});

export type CreateLojaDTO = z.infer<typeof createLojaSchema>;
export type UpdateLojaDTO = z.infer<typeof updateLojaSchema>;

export interface LojaResponseDTO {
  id: number;
  idCliente: string; // UUID reference to clients
  nome: string;
  cnpj: string | null;
}

export interface PaginatedLojaResponseDTO {
  data: LojaResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toLojaResponseDTO(loja: Loja): LojaResponseDTO {
  return {
    id: loja.id!,
    idCliente: loja.idCliente,
    nome: loja.nome,
    cnpj: loja.cnpj,
  };
}
