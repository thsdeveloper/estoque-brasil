import { z } from 'zod';
import { Empresa } from '../../../domain/entities/Empresa.js';

// Schema de validação para criação de empresa
export const createEmpresaSchema = z.object({
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter exatamente 14 dígitos'),
  razaoSocial: z.string().min(1, 'Razão social é obrigatória').max(255, 'Razão social deve ter no máximo 255 caracteres'),
  descricao: z.string().max(255, 'Descrição deve ter no máximo 255 caracteres').nullish(),
  nomeFantasia: z.string().max(255, 'Nome fantasia deve ter no máximo 255 caracteres').nullish(),
  cep: z
    .string()
    .regex(/^\d{8}$/, 'CEP deve conter exatamente 8 dígitos')
    .nullish(),
  endereco: z.string().max(255, 'Endereço deve ter no máximo 255 caracteres').nullish(),
  numero: z.string().max(20, 'Número deve ter no máximo 20 caracteres').nullish(),
  bairro: z.string().max(100, 'Bairro deve ter no máximo 100 caracteres').nullish(),
  codigoUf: z
    .string()
    .length(2, 'UF deve ter exatamente 2 caracteres')
    .toUpperCase()
    .nullish(),
  codigoMunicipio: z.string().max(10, 'Código do município deve ter no máximo 10 caracteres').nullish(),
  ativo: z.boolean().default(true),
});

// Schema de validação para atualização de empresa
export const updateEmpresaSchema = z.object({
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter exatamente 14 dígitos').optional(),
  razaoSocial: z.string().min(1, 'Razão social é obrigatória').max(255, 'Razão social deve ter no máximo 255 caracteres').optional(),
  descricao: z.string().max(255, 'Descrição deve ter no máximo 255 caracteres').nullish(),
  nomeFantasia: z.string().max(255, 'Nome fantasia deve ter no máximo 255 caracteres').nullish(),
  cep: z
    .string()
    .regex(/^\d{8}$/, 'CEP deve conter exatamente 8 dígitos')
    .nullish(),
  endereco: z.string().max(255, 'Endereço deve ter no máximo 255 caracteres').nullish(),
  numero: z.string().max(20, 'Número deve ter no máximo 20 caracteres').nullish(),
  bairro: z.string().max(100, 'Bairro deve ter no máximo 100 caracteres').nullish(),
  codigoUf: z
    .string()
    .length(2, 'UF deve ter exatamente 2 caracteres')
    .toUpperCase()
    .nullish(),
  codigoMunicipio: z.string().max(10, 'Código do município deve ter no máximo 10 caracteres').nullish(),
  ativo: z.boolean().optional(),
});

export type CreateEmpresaDTO = z.infer<typeof createEmpresaSchema>;
export type UpdateEmpresaDTO = z.infer<typeof updateEmpresaSchema>;

export interface EmpresaResponseDTO {
  id: number;
  descricao: string | null;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  codigoUf: string | null;
  codigoMunicipio: string | null;
  ativo: boolean;
}

export interface PaginatedEmpresaResponseDTO {
  data: EmpresaResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toEmpresaResponseDTO(empresa: Empresa): EmpresaResponseDTO {
  return {
    id: empresa.id!,
    descricao: empresa.descricao,
    cnpj: empresa.cnpj,
    razaoSocial: empresa.razaoSocial,
    nomeFantasia: empresa.nomeFantasia,
    cep: empresa.cep,
    endereco: empresa.endereco,
    numero: empresa.numero,
    bairro: empresa.bairro,
    codigoUf: empresa.codigoUf,
    codigoMunicipio: empresa.codigoMunicipio,
    ativo: empresa.ativo,
  };
}
