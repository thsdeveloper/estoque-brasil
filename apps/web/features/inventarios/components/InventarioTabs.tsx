"use client"

import dynamic from "next/dynamic"
import {
  Info,
  LayoutGrid,
  Package,
  Users,
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
  { value: "contagem-setores", label: "Contagem Setores", icon: ClipboardList },
  { value: "contagem", label: "Contagem", icon: Calculator },
  { value: "contagem-operador", label: "Contagem Operador", icon: UserCheck },
] as const

interface InventarioTabsProps {
  inventario: Inventario
}

export function InventarioTabs({ inventario }: InventarioTabsProps) {
  return (
    <Tabs defaultValue="cadastro">
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        {/* Tab navigation strip */}
        <div className="bg-muted/40 border-b border-border px-4 pt-3 pb-0">
          <TabsList className="flex flex-wrap h-auto w-full justify-start bg-transparent p-0 gap-0 rounded-none">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative rounded-none rounded-t-md border border-transparent bg-transparent px-4 py-2.5 -mb-px text-muted-foreground shadow-none data-[state=active]:bg-background data-[state=active]:text-brand-orange data-[state=active]:shadow-none data-[state=active]:border-border data-[state=active]:border-b-background data-[state=active]:z-10"
                >
                  <Icon />
                  <span>{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Tab content area */}
        <div className="p-6">
          <TabsContent value="cadastro" className="mt-0">
            <InventarioDetails inventario={inventario} />
          </TabsContent>

          <TabsContent value="setores" className="mt-0">
            <SetoresTab inventarioId={inventario.id} />
          </TabsContent>

          <TabsContent value="produtos" className="mt-0">
            <ProdutosTab inventarioId={inventario.id} />
          </TabsContent>

          <TabsContent value="operador" className="mt-0">
            <OperadoresTab inventarioId={inventario.id} />
          </TabsContent>

          <TabsContent value="contagem-setores" className="mt-0">
            <ContagemSetoresTab inventarioId={inventario.id} />
          </TabsContent>

          <TabsContent value="contagem" className="mt-0">
            <ContagemTab inventarioId={inventario.id} />
          </TabsContent>

          <TabsContent value="contagem-operador" className="mt-0">
            <ContagemOperadorTab inventarioId={inventario.id} />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  )
}
