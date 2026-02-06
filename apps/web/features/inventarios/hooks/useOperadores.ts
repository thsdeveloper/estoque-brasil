"use client"

import useSWR from "swr"
import type { InventarioOperador, OperadorQueryParams } from "@estoque-brasil/types"
import { inventariosApi, type PaginatedResponse } from "../api/inventarios-api"

export function useOperadores(params: OperadorQueryParams) {
  const { idInventario, page = 1, limit = 10, search } = params

  const key = ["operadores", idInventario, page, limit, search].filter(
    (v) => v !== undefined
  )

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<InventarioOperador>>(
    key,
    () =>
      inventariosApi.listOperadores({
        idInventario,
        page,
        limit,
        search,
      }),
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
      dedupingInterval: 2000,
    }
  )

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : "Erro ao carregar operadores",
    mutate,
  }
}
