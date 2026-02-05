"use client"

import { Package, Clock, CheckCircle } from "lucide-react"
import { MetricSection } from "./MetricSection"
import { MetricCard } from "./MetricCard"
import type { MonitorMetrics } from "../../hooks/useMonitorMetrics"

interface SkuSectionProps {
  metrics: MonitorMetrics
  loading?: boolean
}

export function SkuSection({ metrics, loading }: SkuSectionProps) {
  return (
    <MetricSection
      title="SKU - Unidade de Controle"
      description="Status dos produtos no inventário"
      icon={Package}
      variant="green"
    >
      <MetricCard
        title="Quant. SKUs"
        value={metrics.quantidadeSkus}
        icon={Package}
        variant="green"
        subtitle="Produtos com saldo ≥ 1"
        loading={loading}
      />
      <MetricCard
        title="SKUs Pendentes"
        value={metrics.skusPendentes}
        icon={Clock}
        variant="green"
        subtitle="Aguardando contagem"
        loading={loading}
      />
      <MetricCard
        title="SKUs sem Divergência"
        value={metrics.skusSemDivergencia}
        icon={CheckCircle}
        variant="green"
        subtitle="Contado = Saldo"
        loading={loading}
      />
    </MetricSection>
  )
}
