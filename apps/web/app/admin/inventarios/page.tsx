import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { InventariosTable, InventarioSearchFilters } from "@/features/inventarios"

interface PageProps {
  searchParams: Promise<{
    page?: string
    ativo?: string
  }>
}

export default async function InventariosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const ativo = params.ativo === "true" ? true : params.ativo === "false" ? false : undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventarios</h1>
          <p className="text-gray-light">
            Gerencie os inventarios de estoque
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/inventarios/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Inventario
          </Link>
        </Button>
      </div>

      <InventarioSearchFilters />

      <InventariosTable
        page={page}
        ativo={ativo}
      />
    </div>
  )
}
