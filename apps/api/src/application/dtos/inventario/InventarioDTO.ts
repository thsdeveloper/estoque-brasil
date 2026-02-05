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
  idTemplate: z
    .number()
    .int('ID do template deve ser um número inteiro')
    .positive('ID do template deve ser positivo')
    .nullish(),
  idTemplateExportacao: z
    .number()
    .int('ID do template de exportação deve ser um número inteiro')
    .positive('ID do template de exportação deve ser positivo')
    .nullish(),
  minimoContagem: z
    .number()
    .int('Mínimo de contagem deve ser um número inteiro')
    .min(1, 'Mínimo de contagem deve ser pelo menos 1')
    .default(1),
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
  idTemplate: z
    .number()
    .int('ID do template deve ser um número inteiro')
    .positive('ID do template deve ser positivo')
    .nullish(),
  idTemplateExportacao: z
    .number()
    .int('ID do template de exportação deve ser um número inteiro')
    .positive('ID do template de exportação deve ser positivo')
    .nullish(),
  minimoContagem: z
    .number()
    .int('Mínimo de contagem deve ser um número inteiro')
    .min(1, 'Mínimo de contagem deve ser pelo menos 1')
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
});

export type CreateInventarioDTO = z.infer<typeof createInventarioSchema>;
export type UpdateInventarioDTO = z.infer<typeof updateInventarioSchema>;

export interface InventarioResponseDTO {
  id: number;
  idLoja: number;
  idEmpresa: number;
  idTemplate: number | null;
  idTemplateExportacao: number | null;
  minimoContagem: number;
  dataInicio: string;
  dataTermino: string | null;
  lote: boolean;
  validade: boolean;
  ativo: boolean;
}

export interface PaginatedInventarioResponseDTO {
  data: InventarioResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toInventarioResponseDTO(inventario: Inventario): InventarioResponseDTO {
  return {
    id: inventario.id!,
    idLoja: inventario.idLoja,
    idEmpresa: inventario.idEmpresa,
    idTemplate: inventario.idTemplate,
    idTemplateExportacao: inventario.idTemplateExportacao,
    minimoContagem: inventario.minimoContagem,
    dataInicio: inventario.dataInicio.toISOString(),
    dataTermino: inventario.dataTermino?.toISOString() ?? null,
    lote: inventario.lote,
    validade: inventario.validade,
    ativo: inventario.ativo,
  };
}
