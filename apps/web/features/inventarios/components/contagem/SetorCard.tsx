"use client"

import React from "react"
import { MapPin } from "lucide-react"
import type { SectorStats } from "../../hooks/useContagemRealtime"

interface SetorCardProps {
  setor: SectorStats
}

export const SetorCard = React.memo(function SetorCard({ setor }: SetorCardProps) {
  const isActive =
    setor.ultima_contagem != null &&
    new Date(setor.ultima_contagem) > new Date(Date.now() - 5 * 60 * 1000)

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dateStr))
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-4 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-700">
            {setor.descricao || `Setor ${setor.id}`}
          </span>
        </div>
        {isActive && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
      </div>

      {setor.prefixo && (
        <p className="text-xs text-zinc-400 mb-2">
          {setor.prefixo} ({setor.inicio}-{setor.termino})
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-zinc-500">Registros</p>
          <p className="text-lg font-bold text-zinc-800">
            {setor.total_contagens.toLocaleString("pt-BR")}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Quantidade</p>
          <p className="text-lg font-bold text-zinc-800">
            {setor.total_quantidade.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-50">
        <p className="text-xs text-zinc-400">
          Ultima: {formatDate(setor.ultima_contagem)}
        </p>
      </div>
    </div>
  )
})
