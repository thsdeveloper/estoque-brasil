import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function HabilitarDivergenciasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Habilitar Divergências</h1>
        <p className="text-sm text-gray-light mt-1">
          Habilite o registro de divergências para inventários.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de habilitação de divergências está sendo desenvolvido. Em breve você poderá configurar quais inventários terão o registro de divergências ativo."
      />
    </div>
  )
}
