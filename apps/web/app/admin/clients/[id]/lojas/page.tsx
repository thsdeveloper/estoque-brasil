import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { PermissionGate } from "@/shared/components/PermissionGate"
import { LojasTable, LojasTableSkeleton } from "@/features/lojas"
import { clientsServerApi } from "@/features/clients/api/clients-api.server"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    page?: string
    search?: string
  }>
}

export default async function ClientLojasPage({ params, searchParams }: PageProps) {
  const { id: clientId } = await params
  const searchParamsData = await searchParams

  let client
  try {
    client = await clientsServerApi.get(clientId)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/clients/${clientId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Lojas de {client.nome}
            </h1>
            <p className="text-gray-light">
              Gerencie as lojas deste cliente
            </p>
          </div>
        </div>
        <PermissionGate resource="lojas" action="create">
          <Button asChild>
            <Link href={`/admin/clients/${clientId}/lojas/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Loja
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<LojasTableSkeleton />}>
            <LojasTable
              clientId={clientId}
              page={searchParamsData.page ? parseInt(searchParamsData.page, 10) : 1}
              search={searchParamsData.search}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
