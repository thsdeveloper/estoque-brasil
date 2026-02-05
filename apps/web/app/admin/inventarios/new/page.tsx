import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
// Direct import instead of barrel file (bundle-barrel-imports)
import { InventarioForm } from "@/features/inventarios/components/InventarioForm"

export default function NewInventarioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/inventarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Inventario</h1>
          <p className="text-muted-foreground">Cadastre um novo inventario de estoque</p>
        </div>
      </div>

      <InventarioForm mode="create" />
    </div>
  )
}
