import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function ReconferidosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Itens Reconferidos</h1>
        <p className="text-sm text-gray-light mt-1">
          Visualize e gerencie itens que foram reconferidos.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de itens reconferidos está sendo desenvolvido. Em breve você poderá visualizar o histórico de reconferências e seus resultados."
      />
    </div>
  )
}
