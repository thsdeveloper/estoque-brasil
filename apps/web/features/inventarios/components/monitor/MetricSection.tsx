"use client"

import { LucideIcon } from "lucide-react"
import type { MetricVariant } from "./MetricCard"

interface MetricSectionProps {
  title: string
  description?: string
  icon: LucideIcon
  variant: MetricVariant
  children: React.ReactNode
}

const variantStyles: Record<MetricVariant, {
  iconBg: string
  iconColor: string
  titleColor: string
  borderColor: string
}> = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-900",
    borderColor: "border-blue-200",
  },
  green: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-900",
    borderColor: "border-emerald-200",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    titleColor: "text-amber-900",
    borderColor: "border-amber-200",
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    titleColor: "text-red-900",
    borderColor: "border-red-200",
  },
}

export function MetricSection({
  title,
  description,
  icon: Icon,
  variant,
  children,
}: MetricSectionProps) {
  const styles = variantStyles[variant]

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-3 pb-2 border-b ${styles.borderColor}`}>
        <div className={`${styles.iconBg} rounded-lg p-2`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <div>
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${styles.titleColor}`}>
            {title}
          </h3>
          {description && (
            <p className="text-xs text-zinc-500">{description}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )
}
