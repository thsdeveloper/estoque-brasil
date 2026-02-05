import { Metadata } from "next"
import { MonitorDashboard } from "@/features/inventarios/components/monitor"

export const metadata: Metadata = {
  title: "Monitor de Inventários | Estoque Brasil",
  description: "Monitoramento de métricas de inventário em tempo real",
}

export default function MonitorPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Monitor de Inventários</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Acompanhe as métricas de contagem em tempo real
        </p>
      </div>

      {/* Dashboard */}
      <MonitorDashboard />
    </div>
  )
}
