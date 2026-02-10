"use client"

import { Building2, Check, ChevronsUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useEmpresa } from "../hooks/useEmpresaContext"
import type { Empresa } from "@estoque-brasil/types"

function getEmpresaLabel(empresa: Empresa): string {
  return empresa.nomeFantasia || empresa.razaoSocial || empresa.descricao || `Empresa ${empresa.id}`
}

function formatCnpj(cnpj: string): string {
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  )
}

export function EmpresaSelector() {
  const { empresas, selectedEmpresa, selectedEmpresaId, loading, selectEmpresa } = useEmpresa()

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    )
  }

  if (empresas.length === 0) {
    return null
  }

  // Single empresa - display as static label, no dropdown
  if (empresas.length === 1) {
    const empresa = empresas[0]
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10">
          <Building2 className="h-4 w-4 text-brand-orange" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight text-foreground truncate max-w-[180px]">
            {getEmpresaLabel(empresa)}
          </span>
          {empresa.cnpj && (
            <span className="text-[11px] leading-tight text-muted-foreground font-mono tabular-nums">
              {formatCnpj(empresa.cnpj)}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Multiple empresas - dropdown selector
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto px-2 py-1.5 gap-3 hover:bg-neutral focus-visible:ring-1 focus-visible:ring-brand-orange"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10">
            <Building2 className="h-4 w-4 text-brand-orange" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium leading-tight text-foreground truncate max-w-[160px]">
              {selectedEmpresa
                ? getEmpresaLabel(selectedEmpresa)
                : "Selecione empresa"}
            </span>
            {selectedEmpresa?.cnpj && (
              <span className="text-[11px] leading-tight text-muted-foreground font-mono tabular-nums">
                {formatCnpj(selectedEmpresa.cnpj)}
              </span>
            )}
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="start" sideOffset={8}>
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
          Empresa ativa
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {empresas.map((empresa) => {
          const isSelected = empresa.id === selectedEmpresaId
          return (
            <DropdownMenuItem
              key={empresa.id}
              className="cursor-pointer px-3 py-2.5 gap-3"
              onClick={() => selectEmpresa(empresa.id)}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isSelected
                  ? "bg-brand-orange text-white"
                  : "bg-zinc-100 text-zinc-500"
              }`}>
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium leading-tight truncate">
                  {getEmpresaLabel(empresa)}
                </span>
                {empresa.cnpj && (
                  <span className="text-[11px] leading-tight text-muted-foreground font-mono tabular-nums">
                    {formatCnpj(empresa.cnpj)}
                  </span>
                )}
              </div>
              {isSelected && (
                <Check className="h-4 w-4 shrink-0 text-brand-orange" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
