import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { Empresa } from "@estoque-brasil/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

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

export const empresasServerApi = {
  get: (id: number | string): Promise<Empresa> => {
    return serverFetch<Empresa>(`/api/empresas/${id}`)
  },
}
