"use client"

import useSWR from "swr"
import type { Inventario, InventarioQueryParams } from "@estoque-brasil/types"
import { inventariosApi, type PaginatedResponse } from "../api/inventarios-api"

/**
 * Custom hook for fetching inventarios with SWR
 * Follows: client-swr-dedup - Use SWR for automatic request deduplication
 */
export function useInventarios(params: InventarioQueryParams = {}) {
  const { page = 1, limit = 10, idLoja, idEmpresa, ativo, search } = params

  // Create a stable cache key based on params
  const key = ["inventarios", page, limit, idLoja, idEmpresa, ativo, search].filter(
    (v) => v !== undefined
  )

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Inventario>>(
    key,
    () =>
      inventariosApi.list({
        page,
        limit,
        idLoja,
        idEmpresa,
        ativo,
        search,
      }),
    {
      // Revalidate on focus for fresh data
      revalidateOnFocus: true,
      // Keep previous data while revalidating
      keepPreviousData: true,
      // Deduplicate requests within 2 seconds
      dedupingInterval: 2000,
    }
  )

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : "Erro ao carregar inventarios",
    mutate,
  }
}
