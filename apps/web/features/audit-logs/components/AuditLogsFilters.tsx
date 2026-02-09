"use client"

import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Search, X } from "lucide-react"

interface AuditLogsFiltersProps {
  onFilter: (filters: { acao?: string; dataInicio?: string; dataFim?: string }) => void
  onClear: () => void
}

export function AuditLogsFilters({ onFilter, onClear }: AuditLogsFiltersProps) {
  const [acao, setAcao] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  const handleFilter = () => {
    onFilter({
      acao: acao || undefined,
      dataInicio: dataInicio ? new Date(dataInicio).toISOString() : undefined,
      dataFim: dataFim ? new Date(dataFim).toISOString() : undefined,
    })
  }

  const handleClear = () => {
    setAcao("")
    setDataInicio("")
    setDataFim("")
    onClear()
  }

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="acao" className="text-sm text-zinc-400">Acao</Label>
        <Input
          id="acao"
          value={acao}
          onChange={(e) => setAcao(e.target.value)}
          placeholder="Ex: ABERTURA_SETOR"
          className="w-48 bg-zinc-800 border-zinc-700"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dataInicio" className="text-sm text-zinc-400">Data Inicio</Label>
        <Input
          id="dataInicio"
          type="datetime-local"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="w-52 bg-zinc-800 border-zinc-700"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dataFim" className="text-sm text-zinc-400">Data Fim</Label>
        <Input
          id="dataFim"
          type="datetime-local"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="w-52 bg-zinc-800 border-zinc-700"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleFilter} size="sm">
          <Search className="h-4 w-4 mr-1" />
          Filtrar
        </Button>
        <Button onClick={handleClear} variant="outline" size="sm">
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>
    </div>
  )
}
