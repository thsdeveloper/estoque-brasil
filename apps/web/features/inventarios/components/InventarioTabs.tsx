"use client"

import dynamic from "next/dynamic"
import {
  Info,
  LayoutGrid,
  Package,
  Users,
  RefreshCw,
  ClipboardList,
  Calculator,
  UserCheck,
} from "lucide-react"
import type { Inventario } from "@estoque-brasil/types"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs"
import { Skeleton } from "@/shared/components/ui/skeleton"

// Loading skeleton for tab content
function TabContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}

// Dynamic imports for tabs (bundle-dynamic-imports)
// Only loads the tab component when user switches to that tab
const InventarioDetails = dynamic(
  () => import("./InventarioDetails").then((mod) => ({ default: mod.InventarioDetails })),
  { loading: () => <TabContentSkeleton />, ssr: false }
)

const SetoresTab = dynamic(
  () => import("./setores/SetoresTab").then((mod) => ({ default: mod.SetoresTab })),
  { loading: () => <TabContentSkeleton />, ssr: false }
)

const ProdutosTab = dynamic(
  () => import("./produtos/ProdutosTab").then((mod) => ({ default: mod.ProdutosTab })),
  { loading: () => <TabContentSkeleton />, ssr: false }
)

const OperadoresTab = dynamic(
  () => import("./operadores/OperadoresTab").then((mod) => ({ default: mod.OperadoresTab })),
  { loading: () => <TabContentSkeleton />, ssr: false }
)

const RecontagemTab = dynamic(
  () => import("./recontagem/RecontagemTab").then((mod) => ({ default: mod.RecontagemTab })),
  { loading: () => <TabContentSkeleton />, ssr: false }
)

const ContagemSetoresTab = dynamic(
  () => import("./contagem/ContagemSetoresTab").then((mod) => ({ default: mod.ContagemSetoresTab })),
  { loading: () => <TabContentSkeleton />, ssr: false }
)

const ContagemTab = dynamic(
  () => import("./contagem/ContagemTab").then((mod) => ({ default: mod.ContagemTab })),
  { loading: () => <TabContentSkeleton />, ssr: false }
)

const ContagemOperadorTab = dynamic(
  () => import("./contagem/ContagemOperadorTab").then((mod) => ({ default: mod.ContagemOperadorTab })),
  { loading: () => <TabContentSkeleton />, ssr: false }
)

// Tab configuration with icons
const tabs = [
  { value: "cadastro", label: "Detalhes", icon: Info },
  { value: "setores", label: "Setores", icon: LayoutGrid },
  { value: "produtos", label: "Produtos", icon: Package },
  { value: "operador", label: "Operadores", icon: Users },
  { value: "recontagem", label: "Recontagem", icon: RefreshCw },
  { value: "contagem-setores", label: "Contagem Setores", icon: ClipboardList },
  { value: "contagem", label: "Contagem", icon: Calculator },
  { value: "contagem-operador", label: "Contagem Operador", icon: UserCheck },
] as const

interface InventarioTabsProps {
  inventario: Inventario
}

export function InventarioTabs({ inventario }: InventarioTabsProps) {
  return (
    <Tabs defaultValue="cadastro" className="space-y-6">
      <TabsList className="flex flex-wrap h-auto w-full justify-start">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger key={tab.value} value={tab.value}>
              <Icon />
              <span>{tab.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      <TabsContent value="cadastro">
        <InventarioDetails inventario={inventario} />
      </TabsContent>

      <TabsContent value="setores">
        <SetoresTab inventarioId={inventario.id} />
      </TabsContent>

      <TabsContent value="produtos">
        <ProdutosTab inventarioId={inventario.id} />
      </TabsContent>

      <TabsContent value="operador">
        <OperadoresTab inventarioId={inventario.id} />
      </TabsContent>

      <TabsContent value="recontagem">
        <RecontagemTab inventarioId={inventario.id} />
      </TabsContent>

      <TabsContent value="contagem-setores">
        <ContagemSetoresTab inventarioId={inventario.id} />
      </TabsContent>

      <TabsContent value="contagem">
        <ContagemTab inventarioId={inventario.id} />
      </TabsContent>

      <TabsContent value="contagem-operador">
        <ContagemOperadorTab inventarioId={inventario.id} />
      </TabsContent>
    </Tabs>
  )
}
