"use client"

import React from "react"
import { ClipboardList, Package, Radio, MapPin } from "lucide-react"

interface ContagemMetricsProps {
  totalContagens: number
  totalQuantidade: number
  setoresAtivos: number
  totalSetores: number
}

export const ContagemMetrics = React.memo(function ContagemMetrics({
  totalContagens,
  totalQuantidade,
  setoresAtivos,
  totalSetores,
}: ContagemMetricsProps) {
  const metrics = [
    {
      title: "Registros",
      value: totalContagens,
      icon: ClipboardList,
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
      valueColor: "text-blue-700",
    },
    {
      title: "Quantidade Total",
      value: totalQuantidade,
      icon: Package,
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      valueColor: "text-emerald-700",
    },
    {
      title: "Setores Ativos",
      value: `${setoresAtivos}/${totalSetores}`,
      icon: Radio,
      bg: "bg-amber-50",
      iconBg: "bg-amber-500",
      valueColor: "text-amber-700",
      subtitle: "ativos nos ultimos 5 min",
    },
    {
      title: "Total de Setores",
      value: totalSetores,
      icon: MapPin,
      bg: "bg-violet-50",
      iconBg: "bg-violet-500",
      valueColor: "text-violet-700",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon
        const formatted =
          typeof m.value === "number" ? m.value.toLocaleString("pt-BR") : m.value

        return (
          <div
            key={m.title}
            className={`${m.bg} rounded-xl p-5 border border-zinc-100 transition-all hover:shadow-sm`}
          >
            <div className="flex items-center gap-3">
              <div className={`${m.iconBg} rounded-lg p-2`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-600">{m.title}</span>
            </div>
            <p className={`mt-3 text-2xl font-bold ${m.valueColor}`}>{formatted}</p>
            {m.subtitle && (
              <p className="mt-1 text-xs text-zinc-500">{m.subtitle}</p>
            )}
          </div>
        )
      })}
    </div>
  )
})
