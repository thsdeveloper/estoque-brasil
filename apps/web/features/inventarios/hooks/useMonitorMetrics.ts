"use client"

import { useState, useEffect, useCallback } from "react"
import { inventariosApi, PaginatedResponse } from "../api/inventarios-api"
import type { InventarioProduto, InventarioContagem, Setor } from "@estoque-brasil/types"

export interface MonitorMetrics {
  // Seção 1: Estimativas
  estimativa: number
  totalContado: number
  diferenca: number

  // Seção 2: SKU
  quantidadeSkus: number
  skusPendentes: number
  skusSemDivergencia: number

  // Seção 3: Recontagens
  divergenciasAguardandoRecontagem: number
  recontados: number
  divergenciaConfirmada: number

  // Seção 4: Ruptura Crítica
  rupturaCritica: number
  entradaNaoPrevista: number
  impactoCritico: number
}

export interface UseMonitorMetricsReturn {
  metrics: MonitorMetrics | null
  loading: boolean
  error: string | null
  lastUpdate: Date | null
  refresh: () => Promise<void>
}

const initialMetrics: MonitorMetrics = {
  estimativa: 0,
  totalContado: 0,
  diferenca: 0,
  quantidadeSkus: 0,
  skusPendentes: 0,
  skusSemDivergencia: 0,
  divergenciasAguardandoRecontagem: 0,
  recontados: 0,
  divergenciaConfirmada: 0,
  rupturaCritica: 0,
  entradaNaoPrevista: 0,
  impactoCritico: 0,
}

async function fetchAllProdutos(idInventario: number): Promise<InventarioProduto[]> {
  const allProdutos: InventarioProduto[] = []
  let page = 1
  const limit = 100
  let hasMore = true

  while (hasMore) {
    const response: PaginatedResponse<InventarioProduto> = await inventariosApi.listProdutos({
      idInventario,
      page,
      limit,
    })

    allProdutos.push(...response.data)
    hasMore = page < response.totalPages
    page++
  }

  return allProdutos
}

async function fetchAllContagens(idInventario: number): Promise<InventarioContagem[]> {
  // Primeiro buscar todos os setores do inventário
  const setores: Setor[] = await inventariosApi.listSetores(idInventario)

  if (setores.length === 0) {
    return []
  }

  // Buscar contagens de todos os setores
  const allContagens: InventarioContagem[] = []

  for (const setor of setores) {
    let page = 1
    const limit = 100
    let hasMore = true

    while (hasMore) {
      const response: PaginatedResponse<InventarioContagem> = await inventariosApi.listContagens({
        idInventarioSetor: setor.id,
        page,
        limit,
      })

      allContagens.push(...response.data)
      hasMore = page < response.totalPages
      page++
    }
  }

  return allContagens
}

function calculateMetrics(
  produtos: InventarioProduto[],
  contagens: InventarioContagem[]
): MonitorMetrics {
  // Criar mapa de contagens por produto
  const contagensPorProduto = new Map<number, InventarioContagem[]>()

  for (const contagem of contagens) {
    const list = contagensPorProduto.get(contagem.idProduto) || []
    list.push(contagem)
    contagensPorProduto.set(contagem.idProduto, list)
  }

  // Seção 1: Estimativas
  const estimativa = produtos.reduce((sum, p) => sum + (p.saldo || 0), 0)
  const totalContado = contagens.reduce((sum, c) => sum + (c.quantidade || 0), 0)
  const diferenca = totalContado - estimativa

  // Seção 2: SKU
  const produtosComSaldo = produtos.filter(p => (p.saldo || 0) >= 1)
  const quantidadeSkus = produtosComSaldo.length

  const produtosComContagem = new Set(contagens.map(c => c.idProduto))
  const skusPendentes = produtos.filter(p => !produtosComContagem.has(p.id)).length

  // SKUs sem divergência: produtos onde total contado == saldo
  let skusSemDivergencia = 0
  for (const produto of produtos) {
    const contagensDoProduto = contagensPorProduto.get(produto.id) || []
    const totalContadoProduto = contagensDoProduto.reduce((sum, c) => sum + (c.quantidade || 0), 0)
    if (contagensDoProduto.length > 0 && totalContadoProduto === produto.saldo) {
      skusSemDivergencia++
    }
  }

  // Seção 3: Recontagens
  // Divergências aguardando recontagem: divergente = true e apenas 1 contagem
  let divergenciasAguardandoRecontagem = 0
  let recontados = 0
  let divergenciaConfirmada = 0

  for (const produto of produtos) {
    const contagensDoProduto = contagensPorProduto.get(produto.id) || []
    const numContagens = contagensDoProduto.length
    const temDivergencia = contagensDoProduto.some(c => c.divergente)

    if (temDivergencia && numContagens === 1) {
      divergenciasAguardandoRecontagem++
    }

    if (numContagens >= 2) {
      recontados++
      // Divergência confirmada: recontados mas ainda divergentes
      const totalContadoProduto = contagensDoProduto.reduce((sum, c) => sum + (c.quantidade || 0), 0)
      if (totalContadoProduto !== produto.saldo) {
        divergenciaConfirmada++
      }
    }
  }

  // Seção 4: Ruptura Crítica
  let rupturaCritica = 0
  let entradaNaoPrevista = 0
  let impactoCritico = 0

  for (const produto of produtos) {
    const contagensDoProduto = contagensPorProduto.get(produto.id) || []
    const totalContadoProduto = contagensDoProduto.reduce((sum, c) => sum + (c.quantidade || 0), 0)

    // Ruptura crítica: saldo > 0 AND contado = 0
    if ((produto.saldo || 0) > 0 && totalContadoProduto === 0 && contagensDoProduto.length > 0) {
      rupturaCritica++
      // Impacto crítico: ruptura com custo > 200
      if ((produto.custo || 0) > 200) {
        impactoCritico++
      }
    }

    // Entrada não prevista: saldo = 0 AND contado > 0
    if ((produto.saldo || 0) === 0 && totalContadoProduto > 0) {
      entradaNaoPrevista++
    }
  }

  return {
    estimativa,
    totalContado,
    diferenca,
    quantidadeSkus,
    skusPendentes,
    skusSemDivergencia,
    divergenciasAguardandoRecontagem,
    recontados,
    divergenciaConfirmada,
    rupturaCritica,
    entradaNaoPrevista,
    impactoCritico,
  }
}

export function useMonitorMetrics(idInventario: number | null): UseMonitorMetricsReturn {
  const [metrics, setMetrics] = useState<MonitorMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    if (!idInventario) {
      setMetrics(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [produtos, contagens] = await Promise.all([
        fetchAllProdutos(idInventario),
        fetchAllContagens(idInventario),
      ])

      const calculatedMetrics = calculateMetrics(produtos, contagens)
      setMetrics(calculatedMetrics)
      setLastUpdate(new Date())
    } catch (err) {
      console.error("Erro ao buscar métricas:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar métricas")
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }, [idInventario])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    metrics,
    loading,
    error,
    lastUpdate,
    refresh: fetchData,
  }
}
