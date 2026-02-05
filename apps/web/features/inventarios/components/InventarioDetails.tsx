"use client"

import Link from "next/link"
import {
  Building2,
  Store,
  Calendar,
  Hash,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  FileText,
  FileOutput,
} from "lucide-react"
import type { Inventario } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { useLojas } from "@/features/lojas/hooks/useLojas"
import { useEmpresas } from "@/features/empresas/hooks/useEmpresas"

interface InventarioDetailsProps {
  inventario: Inventario
}

// Format date helper
function formatDate(dateString: string | null): string {
  if (!dateString) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(dateString))
}

// Status badge component
function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
      <CheckCircle2 className="h-3 w-3" />
      Ativo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-300/50">
      <XCircle className="h-3 w-3" />
      Finalizado
    </span>
  )
}

// Boolean indicator
function BooleanIndicator({ value, label }: { value: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {value ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      ) : (
        <XCircle className="h-4 w-4 text-neutral-400" />
      )}
      <span className={value ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  )
}

// Data row component
function DataRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
          {value}
        </span>
      </div>
    </div>
  )
}

export function InventarioDetails({ inventario }: InventarioDetailsProps) {
  // Fetch related data
  const { lojas } = useLojas({ limit: 100 })
  const { empresas } = useEmpresas({ limit: 100 })

  // Find related entities
  const empresa = empresas.find((e) => e.id === inventario.idEmpresa)
  const loja = lojas.find((l) => l.id === inventario.idLoja)

  return (
    <div className="space-y-6">
      {/* Header with edit button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Detalhes do Inventário
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Informações cadastrais e configurações
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/inventarios/${inventario.id}/edit`}>
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Basic info */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-medium text-foreground">
              Informações Básicas
            </h3>
          </div>
          <div className="divide-y divide-border px-5">
            <DataRow
              icon={Building2}
              label="Empresa"
              value={
                empresa
                  ? empresa.nomeFantasia || empresa.razaoSocial
                  : `Empresa #${inventario.idEmpresa}`
              }
            />
            <DataRow
              icon={Store}
              label="Loja"
              value={
                loja
                  ? `${loja.nome}${loja.cnpj ? ` • ${loja.cnpj}` : ""}`
                  : `Loja #${inventario.idLoja}`
              }
            />
            <DataRow
              icon={Calendar}
              label="Previsão de Início"
              value={formatDate(inventario.dataInicio)}
            />
            <DataRow
              icon={Clock}
              label="Previsão de Término"
              value={formatDate(inventario.dataTermino)}
            />
            <DataRow
              icon={Hash}
              label="Mínimo de Contagens"
              value={`${inventario.minimoContagem} contagem${inventario.minimoContagem > 1 ? "s" : ""} por produto`}
              mono
            />
          </div>
        </div>

        {/* Right column - Status and options */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-medium text-foreground">Status</h3>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <StatusBadge active={inventario.ativo} />
                <span className="text-sm text-muted-foreground">
                  {inventario.ativo
                    ? "Este inventário está ativo e aceitando contagens"
                    : "Este inventário foi finalizado"}
                </span>
              </div>
            </div>
          </div>

          {/* Options card */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-medium text-foreground">
                Opções de Contagem
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <BooleanIndicator
                value={inventario.lote}
                label="Informar número do lote"
              />
              <BooleanIndicator
                value={inventario.validade}
                label="Informar data de validade"
              />
            </div>
          </div>

          {/* Templates card */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-medium text-foreground">Templates</h3>
            </div>
            <div className="divide-y divide-border px-5">
              <DataRow
                icon={FileText}
                label="Template de Importação"
                value={
                  inventario.idTemplate
                    ? `Template #${inventario.idTemplate}`
                    : "Nenhum template configurado"
                }
                mono={!!inventario.idTemplate}
              />
              <DataRow
                icon={FileOutput}
                label="Template de Exportação"
                value={
                  inventario.idTemplateExportacao
                    ? `Template #${inventario.idTemplateExportacao}`
                    : "Nenhum template configurado"
                }
                mono={!!inventario.idTemplateExportacao}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
