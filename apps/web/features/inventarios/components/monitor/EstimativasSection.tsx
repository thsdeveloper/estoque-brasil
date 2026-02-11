"use client"

import { Calculator, Boxes, TrendingUp, TrendingDown, Equal } from "lucide-react"
import { MetricSection } from "./MetricSection"
import { MetricCard } from "./MetricCard"
import type { MonitorMetrics } from "../../hooks/useMonitorMetrics"

interface EstimativasSectionProps {
  metrics: MonitorMetrics
  loading?: boolean
}

export function EstimativasSection({ metrics, loading }: EstimativasSectionProps) {
  const getDiferencaIcon = () => {
    if (metrics.diferenca > 0) return TrendingUp
    if (metrics.diferenca < 0) return TrendingDown
    return Equal
  }

  const getDiferencaSubtitle = () => {
    if (metrics.diferenca > 0) return "Sobra no estoque"
    if (metrics.diferenca < 0) return "Falta no estoque"
    return "Estoque correto"
  }

  return (
    <MetricSection
      title="Estimativas para Contagem"
      description="Comparativo entre saldo do sistema e contagem física"
      icon={Calculator}
      variant="blue"
    >
      <MetricCard
        title="Estimativa"
        value={metrics.estimativa}
        icon={Boxes}
        variant="blue"
        subtitle="Saldo por código de barras"
        loading={loading}
      />
      <MetricCard
        title="Total Contado"
        value={metrics.totalContado}
        icon={Calculator}
        variant="blue"
        subtitle="Soma das contagens"
        loading={loading}
      />
      <MetricCard
        title="Diferença (+/-)"
        value={metrics.diferenca}
        icon={getDiferencaIcon()}
        variant="blue"
        subtitle={getDiferencaSubtitle()}
        loading={loading}
      />
    </MetricSection>
  )
}
