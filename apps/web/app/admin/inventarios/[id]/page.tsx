import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Store, Building2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
// Direct imports instead of barrel file (bundle-barrel-imports)
import { inventariosServerApi } from "@/features/inventarios/api/inventarios-api.server"
import { InventarioTabs } from "@/features/inventarios/components/InventarioTabs"
import { InventarioActions } from "@/features/inventarios/components/InventarioActions"

interface PageProps {
  params: Promise<{ id: string }>
}

// Hoist static function outside component (rendering-hoist-jsx)
function formatDate(dateString: string | null) {
  if (!dateString) return "-"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateString))
}

// Tabs loading skeleton
function TabsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  )
}

export default async function ViewInventarioPage({ params }: PageProps) {
  const { id } = await params

  let inventario
  try {
    inventario = await inventariosServerApi.get(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/admin/inventarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Inventario
            </h1>
            <span className="font-mono text-sm text-muted-foreground">#{inventario.id}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                inventario.ativo
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                  : "bg-muted text-muted-foreground ring-1 ring-inset ring-border"
              }`}
            >
              {inventario.ativo ? "Ativo" : "Finalizado"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Inicio: <span className="font-mono text-foreground">{formatDate(inventario.dataInicio)}</span></span>
            </div>
            {inventario.dataTermino && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Termino: <span className="font-mono text-foreground">{formatDate(inventario.dataTermino)}</span></span>
              </div>
            )}
            {inventario.idLoja && (
              <div className="flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" />
                <span>Loja: <span className="font-mono text-foreground">#{inventario.idLoja}</span></span>
              </div>
            )}
            {inventario.idEmpresa && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span>Empresa: <span className="font-mono text-foreground">#{inventario.idEmpresa}</span></span>
              </div>
            )}
          </div>

          {/* Actions */}
          <InventarioActions inventario={inventario} />
        </div>
      </div>

      {/* Tabs with Suspense for streaming (async-suspense-boundaries) */}
      <Suspense fallback={<TabsSkeleton />}>
        <InventarioTabs inventario={inventario} />
      </Suspense>
    </div>
  )
}
