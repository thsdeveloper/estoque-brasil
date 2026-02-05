export interface Template {
  id: number
  nome: string
  descricao: string | null
  tipo: "importacao" | "exportacao"
  ativo: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TemplateQueryParams {
  page?: number
  limit?: number
  tipo?: "importacao" | "exportacao"
  ativo?: boolean
}

export interface PaginatedTemplates {
  data: Template[]
  total: number
  page: number
  limit: number
  totalPages: number
}
