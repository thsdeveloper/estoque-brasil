import type {
  User,
  Role,
  CreateUserInput,
  UpdateUserInput,
  UsersQueryParams,
  UserPermissions,
  PaginatedUsers,
} from "@estoque-brasil/types"
import { createClient } from "@/lib/supabase/client"

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

    // Only set Content-Type for requests with body
    if (options.body) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      // Handle 401 - redirect to login
      if (response.status === 401 && typeof window !== "undefined") {
        window.location.href = "/login"
        throw { code: "UNAUTHORIZED", message: "Sessão expirada" }
      }

      // Handle 403 - Forbidden
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

    // Handle 204 No Content
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

export const usuariosApi = {
  // Users CRUD
  list: (params: UsersQueryParams = {}): Promise<PaginatedUsers> => {
    const query = buildQueryString({
      page: params.page,
      limit: params.limit,
      search: params.search,
      isActive: params.isActive,
      roleId: params.roleId,
    })
    return apiClient.get<PaginatedUsers>(`/api/users${query}`)
  },

  get: (id: string): Promise<User> => {
    return apiClient.get<User>(`/api/users/${id}`)
  },

  create: (data: CreateUserInput): Promise<User> => {
    const cleanData = cleanUserData(data)
    return apiClient.post<User>("/api/users", cleanData)
  },

  update: (id: string, data: UpdateUserInput): Promise<User> => {
    const cleanData = cleanUserData(data)
    return apiClient.put<User>(`/api/users/${id}`, cleanData)
  },

  delete: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/users/${id}`)
  },

  // Current user permissions
  getMyPermissions: (): Promise<UserPermissions> => {
    return apiClient.get<UserPermissions>("/api/users/me/permissions")
  },

  // Roles
  listRoles: (includePermissions = false): Promise<Role[]> => {
    const query = buildQueryString({ includePermissions })
    return apiClient.get<Role[]>(`/api/roles${query}`)
  },
}

// Helper function to clean user data before sending to API
function cleanUserData<T extends object>(data: T): T {
  const cleaned = { ...data } as Record<string, unknown>

  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key]
    if (value === "" || value === undefined) {
      cleaned[key] = null
    }
  })

  return cleaned as T
}

export type { ApiError }
