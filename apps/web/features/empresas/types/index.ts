import { z } from "zod"

// Re-export types from the shared package for convenience
export type {
  Empresa,
  CreateEmpresaInput,
  UpdateEmpresaInput,
  EmpresaQueryParams,
} from "@estoque-brasil/types"

// Empresa Form Validation Schema
export const empresaFormSchema = z.object({
  cnpj: z
    .string()
    .min(14, "CNPJ é obrigatório")
    .regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos numéricos"),
  razaoSocial: z
    .string()
    .min(1, "Razão social é obrigatória")
    .max(255, "Razão social muito longa"),
  descricao: z.string().max(255, "Descrição muito longa").optional().nullable(),
  nomeFantasia: z
    .string()
    .max(255, "Nome fantasia muito longo")
    .optional()
    .nullable(),
  cep: z
    .string()
    .regex(/^\d{8}$/, "CEP deve ter 8 dígitos")
    .optional()
    .nullable()
    .or(z.literal("")),
  endereco: z.string().max(255, "Endereço muito longo").optional().nullable(),
  numero: z.string().max(20, "Número muito longo").optional().nullable(),
  bairro: z.string().max(100, "Bairro muito longo").optional().nullable(),
  codigoUf: z
    .string()
    .length(2, "UF deve ter 2 letras")
    .optional()
    .nullable()
    .or(z.literal("")),
  codigoMunicipio: z
    .string()
    .max(100, "Código município muito longo")
    .optional()
    .nullable(),
  ativo: z.boolean(),
})

export type EmpresaFormData = z.infer<typeof empresaFormSchema>
