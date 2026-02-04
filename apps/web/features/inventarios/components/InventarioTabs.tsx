"use client"

import type { Inventario } from "@estoque-brasil/types"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs"
import { InventarioForm } from "./InventarioForm"
import { SetoresTab } from "./setores/SetoresTab"
import { ProdutosTab } from "./produtos/ProdutosTab"
import { OperadoresTab } from "./operadores/OperadoresTab"
import { RecontagemTab } from "./recontagem/RecontagemTab"
import { ContagemSetoresTab } from "./contagem/ContagemSetoresTab"
import { ContagemTab } from "./contagem/ContagemTab"
import { ContagemOperadorTab } from "./contagem/ContagemOperadorTab"

interface InventarioTabsProps {
  inventario: Inventario
}

export function InventarioTabs({ inventario }: InventarioTabsProps) {
  return (
    <Tabs defaultValue="cadastro" className="space-y-4">
      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
        <TabsTrigger value="setores">Setores</TabsTrigger>
        <TabsTrigger value="produtos">Produtos</TabsTrigger>
        <TabsTrigger value="operador">Operador</TabsTrigger>
        <TabsTrigger value="recontagem">Recontagem</TabsTrigger>
        <TabsTrigger value="contagem-setores">Contagem - Setores</TabsTrigger>
        <TabsTrigger value="contagem">Contagem</TabsTrigger>
        <TabsTrigger value="contagem-operador">Contagem Operador</TabsTrigger>
      </TabsList>

      <TabsContent value="cadastro">
        <InventarioForm inventario={inventario} mode="edit" />
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
