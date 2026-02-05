import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function CamposTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Campos de Template</h1>
        <p className="text-sm text-gray-light mt-1">
          Configure os campos disponíveis nos templates.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de configuração de campos está sendo desenvolvido. Em breve você poderá definir campos personalizados para seus templates de inventário."
      />
    </div>
  )
}
