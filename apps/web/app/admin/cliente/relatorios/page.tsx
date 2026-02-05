import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function RelatoriosClientePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Relatórios do Cliente</h1>
        <p className="text-sm text-gray-light mt-1">
          Acesse relatórios personalizados para seu perfil.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de relatórios do cliente está sendo desenvolvido. Em breve você terá acesso a dashboards e relatórios personalizados para sua empresa."
      />
    </div>
  )
}
