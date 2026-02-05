"use client"

import { AlertTriangle, PackageX, DollarSign } from "lucide-react"
import { MetricSection } from "./MetricSection"
import { MetricCard } from "./MetricCard"
import type { MonitorMetrics } from "../../hooks/useMonitorMetrics"

interface RupturaCriticaSectionProps {
  metrics: MonitorMetrics
  loading?: boolean
}

export function RupturaCriticaSection({ metrics, loading }: RupturaCriticaSectionProps) {
  return (
    <MetricSection
      title="Ruptura Crítica"
      description="Alertas de perda e inconsistências"
      icon={AlertTriangle}
      variant="red"
    >
      <MetricCard
        title="Ruptura Crítica"
        value={metrics.rupturaCritica}
        icon={PackageX}
        variant="red"
        subtitle="Saldo > 0, Contado = 0"
        loading={loading}
      />
      <MetricCard
        title="Entrada não Prevista"
        value={metrics.entradaNaoPrevista}
        icon={AlertTriangle}
        variant="red"
        subtitle="Saldo = 0, Contado > 0"
        loading={loading}
      />
      <MetricCard
        title="Impacto Crítico"
        value={metrics.impactoCritico}
        icon={DollarSign}
        variant="red"
        subtitle="Ruptura com custo > R$ 200"
        loading={loading}
      />
    </MetricSection>
  )
}
