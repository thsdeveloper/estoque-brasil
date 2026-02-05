"use client"

import useSWR from "swr"
import type { PaginatedTemplates } from "../types"
import { templatesApi } from "../api/templates-api"

/**
 * Custom hook for fetching templates de importacao with SWR
 * Follows: client-swr-dedup - Use SWR for automatic request deduplication
 */
export function useTemplatesImportacao() {
  const key = ["templates", "importacao"]

  const { data, error, isLoading, mutate } = useSWR<PaginatedTemplates>(
    key,
    () => templatesApi.list({ tipo: "importacao", ativo: true, limit: 100 }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true,
    }
  )

  return {
    templates: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : "Erro ao carregar templates de importacao",
    mutate,
  }
}

/**
 * Custom hook for fetching templates de exportacao with SWR
 * Follows: client-swr-dedup - Use SWR for automatic request deduplication
 */
export function useTemplatesExportacao() {
  const key = ["templates", "exportacao"]

  const { data, error, isLoading, mutate } = useSWR<PaginatedTemplates>(
    key,
    () => templatesApi.list({ tipo: "exportacao", ativo: true, limit: 100 }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
      keepPreviousData: true,
    }
  )

  return {
    templates: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : "Erro ao carregar templates de exportacao",
    mutate,
  }
}
