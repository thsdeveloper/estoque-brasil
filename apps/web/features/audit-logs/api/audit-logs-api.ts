import { createClient } from "@/lib/supabase/client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface AuditLog {
  id: string
  acao: string
  descricao: string | null
  idUsuario: string
  nomeUsuario: string | null
  idInventario: number | null
  idSetor: number | null
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface AuditLogQueryParams {
  page?: number
  limit?: number
  idInventario?: number
  idUsuario?: string
  acao?: string
  dataInicio?: string
  dataFim?: string
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` }
  }
  return {}
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value))
    }
  })
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

export const auditLogsApi = {
  list: async (params: AuditLogQueryParams = {}): Promise<PaginatedResponse<AuditLog>> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      idInventario: params.idInventario,
      idUsuario: params.idUsuario,
      acao: params.acao,
      dataInicio: params.dataInicio,
      dataFim: params.dataFim,
    })
    const authHeaders = await getAuthHeader()
    const response = await fetch(`${API_URL}/api/audit-logs${query}`, {
      headers: authHeaders,
    })
    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        window.location.href = "/login"
      }
      const error = await response.json().catch(() => ({ code: "UNKNOWN", message: "Erro ao buscar logs" }))
      throw error
    }
    return response.json()
  },
}

export type { AuditLog, AuditLogQueryParams }
