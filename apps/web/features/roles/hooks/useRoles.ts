"use client"

import useSWR from "swr"
import type { Role } from "../types"
import { rolesApi } from "../api/roles-api"

/**
 * Custom hook for fetching roles with SWR
 * Follows: client-swr-dedup - Use SWR for automatic request deduplication
 */
export function useRoles(includePermissions = false) {
  const key = ["roles", includePermissions]

  const { data, error, isLoading, mutate } = useSWR<Role[]>(
    key,
    () => rolesApi.list(includePermissions),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true,
    }
  )

  return {
    roles: data ?? [],
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : "Erro ao carregar roles",
    mutate,
  }
}
