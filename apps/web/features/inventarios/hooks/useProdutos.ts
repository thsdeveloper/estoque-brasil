"use client"

import useSWR from "swr"
import type { InventarioProduto, InventarioProdutoQueryParams } from "@estoque-brasil/types"
import { inventariosApi, type PaginatedResponse } from "../api/inventarios-api"

export function useProdutos(params: InventarioProdutoQueryParams) {
  const { idInventario, page = 1, limit = 10, search, divergente } = params

  const key = ["produtos", idInventario, page, limit, search, divergente].filter(
    (v) => v !== undefined
  )

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<InventarioProduto>>(
    key,
    () =>
      inventariosApi.listProdutos({
        idInventario,
        page,
        limit,
        search,
        divergente,
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
    error: error instanceof Error ? error.message : "Erro ao carregar produtos",
    mutate,
  }
}
