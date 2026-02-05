"use client"

import useSWR from "swr"
import type { User, UsersQueryParams, PaginatedUsers } from "@estoque-brasil/types"
import { usuariosApi } from "../api/usuarios-api"

/**
 * Custom hook for fetching usuarios with SWR
 * Follows: client-swr-dedup - Use SWR for automatic request deduplication
 */
export function useUsuarios(params: UsersQueryParams = {}) {
  const { page = 1, limit = 100, roleId, isActive, search } = params

  const key = ["usuarios", page, limit, roleId, isActive, search]

  const { data, error, isLoading, mutate } = useSWR<PaginatedUsers>(
    key,
    () => usuariosApi.list({ page, limit, roleId, isActive, search }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true,
    }
  )

  return {
    usuarios: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : "Erro ao carregar usuarios",
    mutate,
  }
}
