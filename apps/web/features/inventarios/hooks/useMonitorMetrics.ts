"use client"

import { useState, useEffect, useCallback } from "react"
import { inventariosApi, MonitorMetrics } from "../api/inventarios-api"

export type { MonitorMetrics }

export interface UseMonitorMetricsReturn {
  metrics: MonitorMetrics | null
  loading: boolean
  error: string | null
  lastUpdate: Date | null
  refresh: () => Promise<void>
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
      const data = await inventariosApi.getMonitorMetrics(idInventario)
      setMetrics(data)
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
