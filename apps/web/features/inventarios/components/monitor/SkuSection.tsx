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
        subtitle="Códigos de barras com saldo positivo"
        loading={loading}
      />
      <MetricCard
        title="SKUs Pendentes"
        value={metrics.skusPendentes}
        icon={Clock}
        variant="green"
        subtitle="Barcodes sem contagem"
        loading={loading}
      />
      <MetricCard
        title="SKUs sem Divergência"
        value={metrics.skusSemDivergencia}
        icon={CheckCircle}
        variant="green"
        subtitle="Barcodes: contado = saldo"
        loading={loading}
      />
    </MetricSection>
  )
}
