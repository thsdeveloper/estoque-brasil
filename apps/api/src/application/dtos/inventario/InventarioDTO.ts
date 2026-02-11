import { z } from 'zod';
import { Inventario } from '../../../domain/entities/Inventario.js';

// Schema de validação para criação de inventário
export const createInventarioSchema = z.object({
  idLoja: z
    .number({ required_error: 'ID da loja é obrigatório' })
    .int('ID da loja deve ser um número inteiro')
    .positive('ID da loja deve ser positivo'),
  idEmpresa: z
    .number({ required_error: 'ID da empresa é obrigatório' })
    .int('ID da empresa deve ser um número inteiro')
    .positive('ID da empresa deve ser positivo'),
  minimoContagem: z
    .number()
    .int('Mínimo de contagem deve ser um número inteiro')
    .min(0, 'Mínimo de contagem não pode ser negativo')
    .default(0),
  dataInicio: z
    .string({ required_error: 'Data de início é obrigatória' })
    .datetime('Data de início deve ser uma data válida'),
  dataTermino: z
    .string()
    .datetime('Data de término deve ser uma data válida')
    .nullish(),
  lote: z.boolean().default(false),
  validade: z.boolean().default(false),
  ativo: z.boolean().default(true),
  lider: z.string().uuid('Líder deve ser um UUID válido').nullish(),
}).refine(
  (data) => {
    if (data.dataTermino) {
      return new Date(data.dataTermino) >= new Date(data.dataInicio);
    }
    return true;
  },
  { message: 'Data de término não pode ser anterior à data de início', path: ['dataTermino'] }
);

// Schema de validação para atualização de inventário
export const updateInventarioSchema = z.object({
  idLoja: z
    .number()
    .int('ID da loja deve ser um número inteiro')
    .positive('ID da loja deve ser positivo')
    .optional(),
  idEmpresa: z
    .number()
    .int('ID da empresa deve ser um número inteiro')
    .positive('ID da empresa deve ser positivo')
    .optional(),
  minimoContagem: z
    .number()
    .int('Mínimo de contagem deve ser um número inteiro')
    .min(0, 'Mínimo de contagem não pode ser negativo')
    .optional(),
  dataInicio: z
    .string()
    .datetime('Data de início deve ser uma data válida')
    .optional(),
  dataTermino: z
    .string()
    .datetime('Data de término deve ser uma data válida')
    .nullish(),
  lote: z.boolean().optional(),
  validade: z.boolean().optional(),
  ativo: z.boolean().optional(),
  lider: z.string().uuid('Líder deve ser um UUID válido').nullish(),
});

// Schema de validação para fechamento de inventário
export const fecharInventarioBodySchema = z.object({
  justificativa: z
    .string()
    .min(10, 'Justificativa deve ter no mínimo 10 caracteres')
    .optional(),
});

export type CreateInventarioDTO = z.infer<typeof createInventarioSchema>;
export type UpdateInventarioDTO = z.infer<typeof updateInventarioSchema>;
export type FecharInventarioDTO = z.infer<typeof fecharInventarioBodySchema>;

export interface InventarioResponseDTO {
  id: number;
  idLoja: number;
  idEmpresa: number;
  minimoContagem: number;
  dataInicio: string;
  dataTermino: string | null;
  lote: boolean;
  validade: boolean;
  ativo: boolean;
  lider: string | null;
  fechadoEm: string | null;
  fechadoPor: string | null;
  justificativaFechamento: string | null;
  nomeLoja: string | null;
  cnpjLoja: string | null;
  nomeCliente: string | null;
  liderNome: string | null;
  temContagens: boolean;
}

export interface PaginatedInventarioResponseDTO {
  data: InventarioResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toInventarioResponseDTO(inventario: Inventario, temContagens = false): InventarioResponseDTO {
  return {
    id: inventario.id!,
    idLoja: inventario.idLoja,
    idEmpresa: inventario.idEmpresa,
    minimoContagem: inventario.minimoContagem,
    dataInicio: inventario.dataInicio.toISOString(),
    dataTermino: inventario.dataTermino?.toISOString() ?? null,
    lote: inventario.lote,
    validade: inventario.validade,
    ativo: inventario.ativo,
    lider: inventario.lider,
    fechadoEm: inventario.fechadoEm?.toISOString() ?? null,
    fechadoPor: inventario.fechadoPor,
    justificativaFechamento: inventario.justificativaFechamento,
    nomeLoja: inventario.nomeLoja,
    cnpjLoja: inventario.cnpjLoja,
    nomeCliente: inventario.nomeCliente,
    liderNome: inventario.liderNome,
    temContagens,
  };
}

export interface FecharInventarioResponseDTO {
  id: number;
  status: 'fechado';
  fechadoEm: string;
  fechadoPor: string;
  justificativaFechamento: string | null;
}

export function toFecharInventarioResponseDTO(inventario: Inventario): FecharInventarioResponseDTO {
  return {
    id: inventario.id!,
    status: 'fechado',
    fechadoEm: inventario.fechadoEm!.toISOString(),
    fechadoPor: inventario.fechadoPor!,
    justificativaFechamento: inventario.justificativaFechamento,
  };
}

export interface StatusFechamentoResponseDTO {
  podeFechar: boolean;
  bloqueios: {
    setoresNaoAbertos: string[];
    setoresNaoFechados: string[];
    divergenciasPendentes: number;
  };
}
