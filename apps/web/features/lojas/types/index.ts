import { z } from "zod"

// Re-export types from the shared package for convenience
export type {
  Loja,
  CreateLojaInput,
  UpdateLojaInput,
  LojaQueryParams,
} from "@estoque-brasil/types"

// Loja Form Validation Schema
export const lojaFormSchema = z.object({
  idCliente: z
    .string({ required_error: "Cliente é obrigatório" })
    .uuid("ID do cliente inválido"),
  nome: z
    .string({ required_error: "Nome é obrigatório" })
    .min(1, "Nome é obrigatório")
    .max(255, "Nome muito longo"),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos numéricos")
    .optional()
    .nullable()
    .or(z.literal("")),
  cep: z.string().max(8).optional().nullable().or(z.literal("")),
  endereco: z.string().max(255).optional().nullable().or(z.literal("")),
  numero: z.string().max(20).optional().nullable().or(z.literal("")),
  bairro: z.string().max(100).optional().nullable().or(z.literal("")),
  uf: z.string().max(2).optional().nullable().or(z.literal("")),
  municipio: z.string().max(100).optional().nullable().or(z.literal("")),
})

export type LojaFormData = z.infer<typeof lojaFormSchema>
