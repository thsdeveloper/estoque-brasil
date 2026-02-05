"use client"

import useSWR from "swr"
import type { Empresa, EmpresaQueryParams } from "@estoque-brasil/types"
import { empresasApi } from "../api/empresas-api"

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Custom hook for fetching empresas with SWR
 * Follows: client-swr-dedup - Use SWR for automatic request deduplication
 */
export function useEmpresas(params: EmpresaQueryParams = {}) {
  const { page = 1, limit = 100 } = params

  const key = ["empresas", page, limit]

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Empresa>>(
    key,
    () => empresasApi.list({ page, limit }),
    {
      revalidateOnFocus: false, // Empresas don't change frequently
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true,
    }
  )

  return {
    empresas: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : "Erro ao carregar empresas",
    mutate,
  }
}
