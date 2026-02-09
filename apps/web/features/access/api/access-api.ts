import { createClient } from "@/lib/supabase/client"
import type {
  AccessResource,
  AccessAction,
  AccessPolicy,
  CreateResourceInput,
  UpdateResourceInput,
  CreateActionInput,
  UpdateActionInput,
  CreatePolicyInput,
  UpdatePolicyInput,
  SetPolicyPermissionsInput,
} from "../types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface ApiError {
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

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

const apiClient = new ApiClient(API_URL)

// ============ Resources API ============

export const resourcesApi = {
  list: (): Promise<AccessResource[]> => {
    return apiClient.get<AccessResource[]>("/api/access/resources")
  },

  create: (data: CreateResourceInput): Promise<AccessResource> => {
    return apiClient.post<AccessResource>("/api/access/resources", data)
  },

  update: (id: string, data: UpdateResourceInput): Promise<AccessResource> => {
    return apiClient.put<AccessResource>(`/api/access/resources/${id}`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/access/resources/${id}`)
  },
}

// ============ Actions API ============

export const actionsApi = {
  list: (): Promise<AccessAction[]> => {
    return apiClient.get<AccessAction[]>("/api/access/actions")
  },

  create: (data: CreateActionInput): Promise<AccessAction> => {
    return apiClient.post<AccessAction>("/api/access/actions", data)
  },

  update: (id: string, data: UpdateActionInput): Promise<AccessAction> => {
    return apiClient.put<AccessAction>(`/api/access/actions/${id}`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/access/actions/${id}`)
  },
}

// ============ Policies API ============

export const policiesApi = {
  list: (): Promise<AccessPolicy[]> => {
    return apiClient.get<AccessPolicy[]>("/api/access/policies")
  },

  get: (id: string): Promise<AccessPolicy> => {
    return apiClient.get<AccessPolicy>(`/api/access/policies/${id}`)
  },

  create: (data: CreatePolicyInput): Promise<AccessPolicy> => {
    return apiClient.post<AccessPolicy>("/api/access/policies", data)
  },

  update: (id: string, data: UpdatePolicyInput): Promise<AccessPolicy> => {
    return apiClient.put<AccessPolicy>(`/api/access/policies/${id}`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/access/policies/${id}`)
  },

  setPermissions: (id: string, data: SetPolicyPermissionsInput): Promise<void> => {
    return apiClient.put<void>(`/api/access/policies/${id}/permissions`, data)
  },
}
