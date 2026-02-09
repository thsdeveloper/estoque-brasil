import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { PermissionGate } from "@/shared/components/PermissionGate"
// Direct imports instead of barrel file (bundle-barrel-imports)
import { InventariosTable } from "@/features/inventarios/components/InventariosTable"
import { InventarioSearchFilters } from "@/features/inventarios/components/InventarioSearchFilters"
import { InventariosTableSkeleton } from "@/features/inventarios/components/InventariosTableSkeleton"

interface PageProps {
  searchParams: Promise<{
    page?: string
    ativo?: string
    search?: string
  }>
}

export default async function InventariosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const ativo = params.ativo === "true" ? true : params.ativo === "false" ? false : undefined
  const search = params.search || undefined

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Inventarios
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie e acompanhe os inventarios de estoque
          </p>
        </div>
        <PermissionGate resource="inventarios" action="create">
          <Button asChild size="sm" className="w-fit">
            <Link href="/admin/inventarios/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Novo Inventario
            </Link>
          </Button>
        </PermissionGate>
      </div>

      {/* Filters + Table Container */}
      <div className="space-y-4">
        <InventarioSearchFilters currentFilter={params.ativo} currentSearch={params.search} />

        {/* Suspense boundary for streaming (async-suspense-boundaries) */}
        <Suspense fallback={<InventariosTableSkeleton />}>
          <InventariosTable
            page={page}
            ativo={ativo}
            search={search}
          />
        </Suspense>
      </div>
    </div>
  )
}
