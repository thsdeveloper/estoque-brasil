"use server"

import type {
  User,
  Role,
  UsersQueryParams,
  UserPermissions,
  PaginatedUsers,
} from "@estoque-brasil/types"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

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
      ...authHeaders,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
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

export async function listUsers(
  params: UsersQueryParams = {}
): Promise<PaginatedUsers> {
  const query = buildQueryString({
    page: params.page,
    limit: params.limit,
    search: params.search,
    isActive: params.isActive,
    roleId: params.roleId,
  })
  return serverFetch<PaginatedUsers>(`/api/users${query}`)
}

export async function getUser(id: string): Promise<User> {
  return serverFetch<User>(`/api/users/${id}`)
}

export async function getMyPermissions(): Promise<UserPermissions> {
  return serverFetch<UserPermissions>("/api/users/me/permissions")
}

export async function listRoles(includePermissions = false): Promise<Role[]> {
  const query = buildQueryString({ includePermissions })
  return serverFetch<Role[]>(`/api/roles${query}`)
}
