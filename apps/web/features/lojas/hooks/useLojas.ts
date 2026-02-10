"use client"

import useSWR from "swr"
import type { Loja, LojaQueryParams } from "@estoque-brasil/types"
import { lojasApi } from "../api/lojas-api"
import { useEmpresa } from "@/features/empresas"

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
  const { page = 1, limit = 100, idCliente } = params
  const { selectedEmpresaId } = useEmpresa()

  // Don't fetch if no empresa selected
  const key = selectedEmpresaId
    ? ["lojas", page, limit, idCliente, selectedEmpresaId]
    : null

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Loja>>(
    key,
    () => lojasApi.list({ page, limit, idCliente, idEmpresa: selectedEmpresaId! }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
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
