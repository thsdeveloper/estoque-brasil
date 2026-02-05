import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  EmpresasTable,
  EmpresasTableSkeleton,
  EmpresaSearchFilters,
} from "@/features/empresas"

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    ativo?: string
  }>
}

export default async function EmpresasPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Parse ativo parameter
  let ativo: boolean | undefined
  if (params.ativo === "true") {
    ativo = true
  } else if (params.ativo === "false") {
    ativo = false
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
          <p className="text-gray-light">
            Gerencie as empresas cadastradas no sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/empresas/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Empresa
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <EmpresaSearchFilters placeholder="Buscar por razão social, nome fantasia ou CNPJ..." />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<EmpresasTableSkeleton />}>
            <EmpresasTable
              page={params.page ? parseInt(params.page, 10) : 1}
              search={params.search}
              ativo={ativo}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
