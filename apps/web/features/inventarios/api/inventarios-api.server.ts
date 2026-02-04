import "server-only"
import { createClient } from "@/lib/supabase/server"
import type {
  Inventario,
  InventarioQueryParams,
  Setor,
  InventarioProduto,
  InventarioProdutoQueryParams,
  InventarioContagem,
  InventarioContagemQueryParams,
} from "@estoque-brasil/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ApiError {
  code: string
  message: string
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` }
  }
  return {}
}

async function serverFetch<T>(endpoint: string): Promise<T> {
  const url = `${API_URL}${endpoint}`
  const authHeaders = await getAuthHeader()

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
    cache: "no-store",
  })

  if (!response.ok) {
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

  return response.json()
}

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

export const inventariosServerApi = {
  // ====== INVENTÁRIOS ======
  get: (id: number | string): Promise<Inventario> => {
    return serverFetch<Inventario>(`/api/inventarios/${id}`)
  },

  list: (params: InventarioQueryParams = {}): Promise<PaginatedResponse<Inventario>> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      idLoja: params.idLoja,
      idEmpresa: params.idEmpresa,
      ativo: params.ativo,
      dataInicio: params.dataInicio,
      dataTermino: params.dataTermino,
    })
    return serverFetch<PaginatedResponse<Inventario>>(`/api/inventarios${query}`)
  },

  // ====== SETORES ======
  listSetores: (idInventario: number): Promise<Setor[]> => {
    return serverFetch<Setor[]>(`/api/inventarios/${idInventario}/setores`)
  },

  getSetor: (id: number | string): Promise<Setor> => {
    return serverFetch<Setor>(`/api/setores/${id}`)
  },

  // ====== PRODUTOS ======
  listProdutos: (params: InventarioProdutoQueryParams): Promise<PaginatedResponse<InventarioProduto>> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      idInventario: params.idInventario,
      search: params.search,
      divergente: params.divergente,
      codigoBarras: params.codigoBarras,
      codigoInterno: params.codigoInterno,
    })
    return serverFetch<PaginatedResponse<InventarioProduto>>(`/api/produtos${query}`)
  },

  getProduto: (id: number | string): Promise<InventarioProduto> => {
    return serverFetch<InventarioProduto>(`/api/produtos/${id}`)
  },

  // ====== CONTAGENS ======
  listContagens: (params: InventarioContagemQueryParams = {}): Promise<PaginatedResponse<InventarioContagem>> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      idInventarioSetor: params.idInventarioSetor,
      idProduto: params.idProduto,
      divergente: params.divergente,
    })
    return serverFetch<PaginatedResponse<InventarioContagem>>(`/api/contagens${query}`)
  },

  getContagem: (id: number | string): Promise<InventarioContagem> => {
    return serverFetch<InventarioContagem>(`/api/contagens/${id}`)
  },
}
