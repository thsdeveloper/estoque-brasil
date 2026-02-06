"use client"

import React, { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { TimelinePoint } from "../../hooks/useContagemRealtime"

interface ContagemChartProps {
  timeline: TimelinePoint[]
}

export const ContagemChart = React.memo(function ContagemChart({
  timeline,
}: ContagemChartProps) {
  const chartData = useMemo(
    () =>
      timeline.map((p) => ({
        time: new Date(p.minuto).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        contagens: p.contagens_no_minuto,
        quantidade: p.quantidade_no_minuto,
      })),
    [timeline]
  )

  // Show a tick every ~30 minutes for readability
  const tickInterval = useMemo(() => {
    if (chartData.length <= 60) return undefined // let Recharts decide
    return Math.max(1, Math.floor(chartData.length / 20))
  }, [chartData.length])

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-100 p-6">
        <h3 className="text-sm font-semibold text-zinc-700 mb-4">
          Contagens por Minuto
        </h3>
        <div className="flex items-center justify-center h-[250px] text-zinc-400 text-sm">
          Aguardando dados de contagem...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-6">
      <h3 className="text-sm font-semibold text-zinc-700 mb-4">
        Contagens por Minuto
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorContagens" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorQuantidade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#999" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e5e5" }}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#999" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e5e5",
              fontSize: "12px",
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="contagens"
            name="Registros"
            stroke="#3b82f6"
            fill="url(#colorContagens)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="quantidade"
            name="Quantidade"
            stroke="#10b981"
            fill="url(#colorQuantidade)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})
