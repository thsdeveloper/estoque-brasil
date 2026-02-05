import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function RetriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Recontagens</h1>
        <p className="text-sm text-gray-light mt-1">
          Gerencie as configurações de recontagem.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de configuração de recontagens está sendo desenvolvido. Em breve você poderá definir regras e limites para recontagens automáticas."
      />
    </div>
  )
}
