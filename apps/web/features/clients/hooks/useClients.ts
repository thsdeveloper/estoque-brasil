"use client"

import useSWR from "swr"
import type { Client, ClientsQueryParams } from "@estoque-brasil/types"
import { clientsApi } from "../api/clients-api"
import { useEmpresa } from "@/features/empresas"

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useClients(params: ClientsQueryParams = {}) {
  const { page = 1, limit = 100 } = params
  const { selectedEmpresaId } = useEmpresa()

  // Don't fetch if no empresa selected
  const key = selectedEmpresaId
    ? ["clients", page, limit, selectedEmpresaId]
    : null

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Client>>(
    key,
    () => clientsApi.list({ page, limit, idEmpresa: selectedEmpresaId! }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }
  )

  return {
    clients: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : "Erro ao carregar clientes",
    mutate,
  }
}
