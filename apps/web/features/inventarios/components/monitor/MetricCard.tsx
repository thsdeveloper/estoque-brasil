"use client"

import { LucideIcon } from "lucide-react"

export type MetricVariant = "blue" | "green" | "amber" | "red"

interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  variant: MetricVariant
  subtitle?: string
  loading?: boolean
}

const variantStyles: Record<MetricVariant, {
  bg: string
  iconBg: string
  iconColor: string
  valueColor: string
}> = {
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-500",
    iconColor: "text-white",
    valueColor: "text-blue-700",
  },
  green: {
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
    valueColor: "text-emerald-700",
  },
  amber: {
    bg: "bg-amber-50",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    valueColor: "text-amber-700",
  },
  red: {
    bg: "bg-red-50",
    iconBg: "bg-red-500",
    iconColor: "text-white",
    valueColor: "text-red-700",
  },
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  variant,
  subtitle,
  loading = false,
}: MetricCardProps) {
  const styles = variantStyles[variant]

  if (loading) {
    return (
      <div className={`${styles.bg} rounded-xl p-5 border border-zinc-100 animate-pulse`}>
        <div className="flex items-center gap-3">
          <div className={`${styles.iconBg} rounded-lg p-2 opacity-50`}>
            <div className="h-5 w-5" />
          </div>
          <div className="h-4 bg-zinc-200 rounded w-24" />
        </div>
        <div className="mt-3 h-8 bg-zinc-200 rounded w-16" />
        {subtitle && <div className="mt-1 h-3 bg-zinc-200 rounded w-20" />}
      </div>
    )
  }

  const formattedValue = typeof value === "number"
    ? value.toLocaleString("pt-BR")
    : value

  return (
    <div className={`${styles.bg} rounded-xl p-5 border border-zinc-100 transition-all hover:shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`${styles.iconBg} rounded-lg p-2`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <span className="text-sm font-medium text-zinc-600">{title}</span>
      </div>
      <p className={`mt-3 text-2xl font-bold ${styles.valueColor}`}>
        {formattedValue}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
      )}
    </div>
  )
}
