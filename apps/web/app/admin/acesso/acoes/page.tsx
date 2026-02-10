import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ActionsTable } from "@/features/access/components/actions/ActionsTable"

export default function AcoesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ações</h1>
          <p className="text-gray-light">
            Gerencie as ações do sistema de controle de acesso
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/acesso/acoes/create">
            <Plus className="mr-2 h-4 w-4" />
            Nova Ação
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ActionsTable />
        </CardContent>
      </Card>
    </div>
  )
}
