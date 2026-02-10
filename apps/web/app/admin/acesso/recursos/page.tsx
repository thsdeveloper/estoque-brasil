import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ResourcesTable } from "@/features/access/components/resources/ResourcesTable"

export default function RecursosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recursos</h1>
          <p className="text-gray-light">
            Gerencie os recursos do sistema de controle de acesso
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/acesso/recursos/create">
            <Plus className="mr-2 h-4 w-4" />
            Novo Recurso
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ResourcesTable />
        </CardContent>
      </Card>
    </div>
  )
}
