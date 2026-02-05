"use client"

import { RefreshCcw, RotateCcw, AlertCircle } from "lucide-react"
import { MetricSection } from "./MetricSection"
import { MetricCard } from "./MetricCard"
import type { MonitorMetrics } from "../../hooks/useMonitorMetrics"

interface RecontagensSectionProps {
  metrics: MonitorMetrics
  loading?: boolean
}

export function RecontagensSection({ metrics, loading }: RecontagensSectionProps) {
  return (
    <MetricSection
      title="Recontagens"
      description="Controle de divergências e recontagens"
      icon={RefreshCcw}
      variant="amber"
    >
      <MetricCard
        title="Diverg. Aguard. Recont."
        value={metrics.divergenciasAguardandoRecontagem}
        icon={RotateCcw}
        variant="amber"
        subtitle="1 contagem divergente"
        loading={loading}
      />
      <MetricCard
        title="Recontados"
        value={metrics.recontados}
        icon={RefreshCcw}
        variant="amber"
        subtitle="2+ contagens realizadas"
        loading={loading}
      />
      <MetricCard
        title="Diverg. Confirmada"
        value={metrics.divergenciaConfirmada}
        icon={AlertCircle}
        variant="amber"
        subtitle="Recontado e divergente"
        loading={loading}
      />
    </MetricSection>
  )
}
