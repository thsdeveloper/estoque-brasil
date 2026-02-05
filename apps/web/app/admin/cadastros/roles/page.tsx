import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { RolesTable, CreateRoleButton } from "@/features/roles"

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfis e Permissões</h1>
          <p className="text-gray-light">
            Gerencie os perfis de acesso e suas permissões no sistema
          </p>
        </div>
        <CreateRoleButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perfis de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <RolesTable />
        </CardContent>
      </Card>
    </div>
  )
}
