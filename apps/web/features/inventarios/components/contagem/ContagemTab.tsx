"use client"

import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { useContagemRealtime } from "../../hooks/useContagemRealtime"
import { ContagemMetrics } from "./ContagemMetrics"
import { ContagemChart } from "./ContagemChart"
import { SetorCard } from "./SetorCard"

interface ContagemTabProps {
  inventarioId: number
}

export function ContagemTab({ inventarioId }: ContagemTabProps) {
  const {
    sectors,
    timeline,
    totalContagens,
    totalQuantidade,
    setoresAtivos,
    isConnected,
    error,
  } = useContagemRealtime(inventarioId)

  return (
    <div className="space-y-6">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-800">
          Dashboard de Contagem
        </h2>
        {isConnected ? (
          <Badge variant="success" className="flex items-center gap-1.5">
            <Wifi className="h-3 w-3" />
            Conectado
          </Badge>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-1.5">
            <WifiOff className="h-3 w-3" />
            {error || "Desconectado"}
          </Badge>
        )}
      </div>

      {/* Summary metrics */}
      <ContagemMetrics
        totalContagens={totalContagens}
        totalQuantidade={totalQuantidade}
        setoresAtivos={setoresAtivos}
        totalSetores={sectors.length}
      />

      {/* Timeline chart */}
      <ContagemChart timeline={timeline} />

      {/* Sector cards grid */}
      {sectors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">
            Setores
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sectors.map((setor) => (
              <SetorCard key={setor.id} setor={setor} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
