"use client"

import { useState } from "react"
import { RefreshCcw, AlertTriangle, ClipboardList } from "lucide-react"
import { InventorySelector } from "./InventorySelector"
import { MonitorSkeleton } from "./MonitorSkeleton"
import { EstimativasSection } from "./EstimativasSection"
import { SkuSection } from "./SkuSection"
import { RecontagensSection } from "./RecontagensSection"
import { RupturaCriticaSection } from "./RupturaCriticaSection"
import { useMonitorMetrics } from "../../hooks/useMonitorMetrics"

export function MonitorDashboard() {
  const [selectedInventario, setSelectedInventario] = useState<number | null>(null)
  const { metrics, loading, error, lastUpdate, refresh } = useMonitorMetrics(selectedInventario)

  return (
    <div className="space-y-6">
      {/* Header com seletor e controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <InventorySelector
          value={selectedInventario}
          onChange={setSelectedInventario}
        />

        <div className="flex items-center gap-4">
          {lastUpdate && (
            <span className="text-xs text-zinc-500">
              Atualizado em {lastUpdate.toLocaleTimeString("pt-BR")}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={loading || !selectedInventario}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCcw className={`h-4 w-4 text-zinc-600 ${loading ? "animate-spin" : ""}`} />
            <span className="text-sm font-medium text-zinc-700">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Estado: Sem inventário selecionado */}
      {!selectedInventario && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-zinc-200">
          <ClipboardList className="h-12 w-12 text-zinc-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-700">Selecione um inventário</h3>
          <p className="text-sm text-zinc-500 mt-1">
            Escolha um inventário ativo para visualizar as métricas
          </p>
        </div>
      )}

      {/* Estado: Loading */}
      {selectedInventario && loading && !metrics && (
        <MonitorSkeleton />
      )}

      {/* Estado: Erro */}
      {selectedInventario && error && (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-xl border border-red-200">
          <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-red-700">Erro ao carregar métricas</h3>
          <p className="text-sm text-red-600 mt-1 mb-4">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Estado: Sucesso com métricas */}
      {selectedInventario && metrics && (
        <div className="space-y-8">
          <EstimativasSection metrics={metrics} loading={loading} />
          <SkuSection metrics={metrics} loading={loading} />
          <RecontagensSection metrics={metrics} loading={loading} />
          <RupturaCriticaSection metrics={metrics} loading={loading} />
        </div>
      )}
    </div>
  )
}
