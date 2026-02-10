import { Suspense } from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { UsersTable, UsersTableSkeleton, CreateUserButton } from "@/features/usuarios"

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    isActive?: string
    roleId?: string
  }>
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
          <p className="text-gray-light">
            Gerencie os usuários e suas permissões no sistema
          </p>
        </div>
        <CreateUserButton />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<UsersTableSkeleton />}>
            <UsersTable
              page={params.page ? parseInt(params.page, 10) : 1}
              search={params.search}
              isActive={params.isActive === "true" ? true : params.isActive === "false" ? false : undefined}
              roleId={params.roleId}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
