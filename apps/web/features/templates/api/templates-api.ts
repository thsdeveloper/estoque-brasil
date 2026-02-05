import { createClient } from "@/lib/supabase/client"
import type { Template, TemplateQueryParams, PaginatedTemplates } from "../types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface ApiError {
  code: string
  message: string
  errors?: { field: string; message: string }[]
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
        throw { code: "UNAUTHORIZED", message: "Sessao expirada" }
      }

      if (response.status === 403) {
        throw { code: "FORBIDDEN", message: "Acesso negado" }
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

export const templatesApi = {
  list: (params: TemplateQueryParams = {}): Promise<PaginatedTemplates> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      tipo: params.tipo,
      ativo: params.ativo,
    })
    return apiClient.get<PaginatedTemplates>(`/api/templates${query}`)
  },

  get: (id: number): Promise<Template> => {
    return apiClient.get<Template>(`/api/templates/${id}`)
  },
}

export type { ApiError }
