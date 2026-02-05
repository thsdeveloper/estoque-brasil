import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function ExportacaoTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Templates de Exportação</h1>
        <p className="text-sm text-gray-light mt-1">
          Configure templates para exportação de dados.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de templates de exportação está sendo desenvolvido. Em breve você poderá criar e personalizar templates para exportar dados em diferentes formatos."
      />
    </div>
  )
}
