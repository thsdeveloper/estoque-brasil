import { createClient } from "@/lib/supabase/client"
import type {
  Role,
  Permission,
  PermissionsByResource,
  CreateRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
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
        throw { code: "UNAUTHORIZED", message: "Sessão expirada" }
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

export const rolesApi = {
  // Roles CRUD
  list: (includePermissions = true): Promise<Role[]> => {
    const query = includePermissions ? "?includePermissions=true" : ""
    return apiClient.get<Role[]>(`/api/roles${query}`)
  },

  get: (id: string): Promise<Role> => {
    return apiClient.get<Role>(`/api/roles/${id}`)
  },

  create: (data: CreateRoleInput): Promise<Role> => {
    return apiClient.post<Role>("/api/roles", data)
  },

  update: (id: string, data: UpdateRoleInput): Promise<Role> => {
    return apiClient.put<Role>(`/api/roles/${id}`, data)
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/roles/${id}`)
  },

  // Permissions
  updatePermissions: (
    roleId: string,
    data: UpdateRolePermissionsInput
  ): Promise<Role> => {
    return apiClient.put<Role>(`/api/roles/${roleId}/permissions`, data)
  },

  listPermissions: (): Promise<Permission[]> => {
    return apiClient.get<Permission[]>("/api/roles/permissions/all")
  },

  listPermissionsGrouped: (): Promise<PermissionsByResource[]> => {
    return apiClient.get<PermissionsByResource[]>("/api/roles/permissions/grouped")
  },
}
