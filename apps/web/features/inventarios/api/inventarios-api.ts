import type {
  Inventario,
  CreateInventarioInput,
  UpdateInventarioInput,
  InventarioQueryParams,
  Setor,
  CreateSetorInput,
  UpdateSetorInput,
  SetorContagemStats,
  InventarioProduto,
  CreateInventarioProdutoInput,
  UpdateInventarioProdutoInput,
  InventarioProdutoQueryParams,
  InventarioContagem,
  CreateInventarioContagemInput,
  UpdateInventarioContagemInput,
  InventarioContagemQueryParams,
  InventarioOperador,
  CreateInventarioOperadorInput,
  BatchAddOperadoresInput,
  BatchAddOperadoresResult,
  BatchRemoveOperadoresInput,
  BatchRemoveOperadoresResult,
  OperadorQueryParams,
} from "@estoque-brasil/types"
import { createClient } from "@/lib/supabase/client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  code: string
  message: string
  errors?: { field: string; message: string }[]
}

export interface MonitorMetrics {
  estimativa: number
  totalContado: number
  diferenca: number
  quantidadeSkus: number
  skusPendentes: number
  skusSemDivergencia: number
  divergenciasAguardandoRecontagem: number
  recontados: number
  divergenciaConfirmada: number
  rupturaCritica: number
  entradaNaoPrevista: number
  impactoCritico: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` }
    }
    return {}
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const authHeaders = await this.getAuthHeader()

    const headers: Record<string, string> = {
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    }

    if (options.body) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        window.location.href = "/login"
        throw { code: "UNAUTHORIZED", message: "Sessão expirada" }
      }

      let error: ApiError
      try {
        error = await response.json()
      } catch {
        error = {
          code: "UNKNOWN_ERROR",
          message: `Request failed with status ${response.status}`,
        }
      }
      throw error
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      ...(data !== undefined && { body: JSON.stringify(data) }),
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

const apiClient = new ApiClient(API_URL)

function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

function cleanData<T extends Record<string, unknown>>(data: T): T {
  const cleaned: Record<string, unknown> = { ...data }

  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key]
    if (value === "" || value === undefined) {
      cleaned[key] = null
    }
  })

  return cleaned as T
}

export const inventariosApi = {
  // ====== INVENTÁRIOS ======
  list: (
    params: InventarioQueryParams = {}
  ): Promise<PaginatedResponse<Inventario>> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      idLoja: params.idLoja,
      idEmpresa: params.idEmpresa,
      ativo: params.ativo,
      dataInicio: params.dataInicio,
      dataTermino: params.dataTermino,
      search: params.search,
    })
    return apiClient.get<PaginatedResponse<Inventario>>(`/api/inventarios${query}`)
  },

  get: (id: number | string): Promise<Inventario> => {
    return apiClient.get<Inventario>(`/api/inventarios/${id}`)
  },

  create: (data: CreateInventarioInput): Promise<Inventario> => {
    const cleanedData = cleanData(data as Record<string, unknown>)
    return apiClient.post<Inventario>("/api/inventarios", cleanedData)
  },

  update: (id: number | string, data: UpdateInventarioInput): Promise<Inventario> => {
    const cleanedData = cleanData(data as Record<string, unknown>)
    return apiClient.put<Inventario>(`/api/inventarios/${id}`, cleanedData)
  },

  delete: (id: number | string): Promise<void> => {
    return apiClient.delete<void>(`/api/inventarios/${id}`)
  },

  finalizar: (id: number | string, options?: { forcado?: boolean }): Promise<Inventario> => {
    return apiClient.post<Inventario>(`/api/inventarios/${id}/finalizar`, options || {})
  },

  getMonitorMetrics: (idInventario: number | string): Promise<MonitorMetrics> => {
    return apiClient.get<MonitorMetrics>(`/api/inventarios/${idInventario}/monitor-metrics`)
  },

  // ====== SETORES ======
  listSetores: (idInventario: number): Promise<Setor[]> => {
    return apiClient.get<Setor[]>(`/api/inventarios/${idInventario}/setores`)
  },

  getSetorStats: (idInventario: number | string): Promise<SetorContagemStats[]> => {
    return apiClient.get<SetorContagemStats[]>(`/api/inventarios/${idInventario}/sector-stats`)
  },

  getSetor: (id: number | string): Promise<Setor> => {
    return apiClient.get<Setor>(`/api/setores/${id}`)
  },

  createSetor: (data: CreateSetorInput): Promise<Setor> => {
    const cleanedData = cleanData(data as Record<string, unknown>)
    return apiClient.post<Setor>("/api/setores", cleanedData)
  },

  updateSetor: (id: number | string, data: UpdateSetorInput): Promise<Setor> => {
    const cleanedData = cleanData(data as Record<string, unknown>)
    return apiClient.put<Setor>(`/api/setores/${id}`, cleanedData)
  },

  deleteSetor: (id: number | string): Promise<void> => {
    return apiClient.delete<void>(`/api/setores/${id}`)
  },

  // ====== PRODUTOS ======
  listProdutos: (
    params: InventarioProdutoQueryParams
  ): Promise<PaginatedResponse<InventarioProduto>> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      idInventario: params.idInventario,
      search: params.search,
      divergente: params.divergente,
      codigoBarras: params.codigoBarras,
      codigoInterno: params.codigoInterno,
    })
    return apiClient.get<PaginatedResponse<InventarioProduto>>(`/api/produtos${query}`)
  },

  getProduto: (id: number | string): Promise<InventarioProduto> => {
    return apiClient.get<InventarioProduto>(`/api/produtos/${id}`)
  },

  createProduto: (data: CreateInventarioProdutoInput): Promise<InventarioProduto> => {
    const cleanedData = cleanData(data as Record<string, unknown>)
    return apiClient.post<InventarioProduto>("/api/produtos", cleanedData)
  },

  updateProduto: (id: number | string, data: UpdateInventarioProdutoInput): Promise<InventarioProduto> => {
    const cleanedData = cleanData(data as Record<string, unknown>)
    return apiClient.put<InventarioProduto>(`/api/produtos/${id}`, cleanedData)
  },

  deleteProduto: (id: number | string): Promise<void> => {
    return apiClient.delete<void>(`/api/produtos/${id}`)
  },

  // ====== CONTAGENS ======
  listContagens: (
    params: InventarioContagemQueryParams = {}
  ): Promise<PaginatedResponse<InventarioContagem>> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      idInventarioSetor: params.idInventarioSetor,
      idProduto: params.idProduto,
      divergente: params.divergente,
    })
    return apiClient.get<PaginatedResponse<InventarioContagem>>(`/api/contagens${query}`)
  },

  getContagem: (id: number | string): Promise<InventarioContagem> => {
    return apiClient.get<InventarioContagem>(`/api/contagens/${id}`)
  },

  createContagem: (data: CreateInventarioContagemInput): Promise<InventarioContagem> => {
    const cleanedData = cleanData(data as Record<string, unknown>)
    return apiClient.post<InventarioContagem>("/api/contagens", cleanedData)
  },

  updateContagem: (id: number | string, data: UpdateInventarioContagemInput): Promise<InventarioContagem> => {
    const cleanedData = cleanData(data as Record<string, unknown>)
    return apiClient.put<InventarioContagem>(`/api/contagens/${id}`, cleanedData)
  },

  deleteContagem: (id: number | string): Promise<void> => {
    return apiClient.delete<void>(`/api/contagens/${id}`)
  },

  // ====== OPERADORES ======
  listOperadores: (params: OperadorQueryParams): Promise<PaginatedResponse<InventarioOperador>> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      search: params.search,
    })
    return apiClient.get<PaginatedResponse<InventarioOperador>>(`/api/inventarios/${params.idInventario}/operadores${query}`)
  },

  addOperador: (idInventario: number, data: CreateInventarioOperadorInput): Promise<InventarioOperador> => {
    return apiClient.post<InventarioOperador>(`/api/inventarios/${idInventario}/operadores`, data)
  },

  addOperadoresBatch: (idInventario: number, data: BatchAddOperadoresInput): Promise<BatchAddOperadoresResult> => {
    return apiClient.post<BatchAddOperadoresResult>(`/api/inventarios/${idInventario}/operadores/batch`, data)
  },

  removeOperador: (idInventario: number, userId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/inventarios/${idInventario}/operadores/${userId}`)
  },

  removeOperadoresBatch: (idInventario: number, data: BatchRemoveOperadoresInput): Promise<BatchRemoveOperadoresResult> => {
    return apiClient.post<BatchRemoveOperadoresResult>(`/api/inventarios/${idInventario}/operadores/batch-remove`, data)
  },

  // ====== ACOES DE INVENTARIO ======
  reabrirInventario: async (id: number) => {
    return apiClient.post(`/api/inventarios/${id}/reabrir`, {})
  },

  listDivergencias: async (inventarioId: number, params?: { idSetor?: number; status?: string; page?: number; limit?: number }) => {
    const qs = buildQueryString(params || {})
    return apiClient.get(`/api/inventarios/${inventarioId}/divergencias${qs}`)
  },

  // ====== ACOES DE SETOR ======
  finalizarSetor: async (id: number) => {
    return apiClient.patch(`/api/setores/${id}/finalizar`)
  },

  reabrirSetor: async (id: number) => {
    return apiClient.post(`/api/setores/${id}/reabrir`, {})
  },
}
