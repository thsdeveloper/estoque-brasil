"use client"

import useSWR from "swr"
import type { Loja, LojaQueryParams } from "@estoque-brasil/types"
import { lojasApi } from "../api/lojas-api"

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Custom hook for fetching lojas with SWR
 * Follows: client-swr-dedup - Use SWR for automatic request deduplication
 */
export function useLojas(params: LojaQueryParams = {}) {
  const { page = 1, limit = 100 } = params

  const key = ["lojas", page, limit]

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Loja>>(
    key,
    () => lojasApi.list({ page, limit }),
    {
      revalidateOnFocus: false, // Lojas don't change frequently
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true,
    }
  )

  return {
    lojas: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : "Erro ao carregar lojas",
    mutate,
  }
}
