import { z } from "zod"

// Re-export types from the shared package for convenience
export type {
  Inventario,
  CreateInventarioInput,
  UpdateInventarioInput,
  InventarioQueryParams,
  Setor,
  CreateSetorInput,
  UpdateSetorInput,
  InventarioProduto,
  CreateInventarioProdutoInput,
  UpdateInventarioProdutoInput,
  InventarioProdutoQueryParams,
  InventarioContagem,
  CreateInventarioContagemInput,
  UpdateInventarioContagemInput,
  InventarioContagemQueryParams,
} from "@estoque-brasil/types"

// Inventário Form Validation Schema
export const inventarioFormSchema = z.object({
  idLoja: z.number().min(1, "Selecione uma loja"),
  idEmpresa: z.number().min(1, "Selecione uma empresa"),
  idTemplate: z.number().nullable().optional(),
  idTemplateExportacao: z.number().nullable().optional(),
  dataInicio: z.string().min(1, "Data de inicio e obrigatoria"),
  dataTermino: z.string().nullable().optional(),
  minimoContagem: z.number().min(1, "Minimo de contagem deve ser pelo menos 1"),
  lote: z.boolean(),
  validade: z.boolean(),
  ativo: z.boolean(),
  lider: z.string().nullable().optional(),
  receberDadosOffline: z.boolean(),
})

export type InventarioFormData = z.infer<typeof inventarioFormSchema>

// Setor Form Validation Schema
export const setorFormSchema = z.object({
  idInventario: z.number().min(1, "Inventario e obrigatorio"),
  prefixo: z.string().max(10, "Prefixo muito longo").nullable(),
  inicio: z.number().min(0, "Inicio deve ser maior ou igual a 0"),
  termino: z.number().min(0, "Termino deve ser maior ou igual a 0"),
  descricao: z.string().max(255, "Descricao muito longa").nullable(),
}).refine((data) => data.termino >= data.inicio, {
  message: "Termino deve ser maior ou igual ao inicio",
  path: ["termino"],
})

export type SetorFormData = z.infer<typeof setorFormSchema>

// Produto Form Validation Schema
export const produtoFormSchema = z.object({
  idInventario: z.number().min(1, "Inventário é obrigatório"),
  codigoBarras: z.string().max(50, "Código de barras muito longo").nullable().optional(),
  codigoInterno: z.string().max(50, "Código interno muito longo").nullable().optional(),
  descricao: z.string().min(1, "Descrição é obrigatória").max(500, "Descrição muito longa"),
  lote: z.string().max(50, "Lote muito longo").nullable().optional(),
  validade: z.string().nullable().optional(),
  saldo: z.number().min(0, "Saldo deve ser maior ou igual a 0").default(0),
  custo: z.number().min(0, "Custo deve ser maior ou igual a 0").default(0),
  divergente: z.boolean().default(false),
})

export type ProdutoFormData = z.infer<typeof produtoFormSchema>

// Contagem Form Validation Schema
export const contagemFormSchema = z.object({
  idInventarioSetor: z.number().min(1, "Setor é obrigatório"),
  idProduto: z.number().min(1, "Produto é obrigatório"),
  lote: z.string().max(50, "Lote muito longo").nullable().optional(),
  validade: z.string().nullable().optional(),
  quantidade: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  divergente: z.boolean().default(false),
})

export type ContagemFormData = z.infer<typeof contagemFormSchema>

// Extended inventory type with relations for UI display
export interface InventarioWithRelations {
  id: number
  idLoja: number
  idEmpresa: number
  idTemplate: number | null
  idTemplateExportacao: number | null
  minimoContagem: number
  dataInicio: string
  dataTermino: string | null
  lote: boolean
  validade: boolean
  ativo: boolean
  loja?: {
    id: number
    nome: string
    cnpj: string | null
  }
  empresa?: {
    id: number
    nomeFantasia: string | null
    razaoSocial: string | null
  }
}
