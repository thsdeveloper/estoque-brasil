import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { PoliciesTable } from "@/features/access/components/policies/PoliciesTable"

export default function PoliticasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Políticas de Acesso</h1>
          <p className="text-gray-light">
            Gerencie as políticas de acesso do sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/acesso/politicas/create">
            <Plus className="mr-2 h-4 w-4" />
            Nova Política
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PoliciesTable />
        </CardContent>
      </Card>
    </div>
  )
}
