import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { Loja, LojaQueryParams } from "@estoque-brasil/types"

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

export const lojasServerApi = {
  get: (id: number | string): Promise<Loja> => {
    return serverFetch<Loja>(`/api/lojas/${id}`)
  },

  list: (params: LojaQueryParams = {}): Promise<PaginatedResponse<Loja>> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      search: params.search,
      idCliente: params.idCliente,
    })
    return serverFetch<PaginatedResponse<Loja>>(`/api/lojas${query}`)
  },
}
