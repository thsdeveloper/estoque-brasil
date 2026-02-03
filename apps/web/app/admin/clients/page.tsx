import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { SearchFilters } from "@/features/admin-layout"
import { ClientsTable, ClientsTableSkeleton } from "@/features/clients"

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    uf?: string
  }>
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-gray-light">Gerencie os clientes cadastrados no sistema</p>
        </div>
        <Button asChild>
          <Link href="/admin/clients/create">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchFilters placeholder="Buscar por nome do cliente..." />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<ClientsTableSkeleton />}>
            <ClientsTable
              page={params.page ? parseInt(params.page, 10) : 1}
              search={params.search}
              uf={params.uf}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
