import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function ImportacaoTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Templates de Importação</h1>
        <p className="text-sm text-gray-light mt-1">
          Configure templates para importação de dados.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de templates de importação está sendo desenvolvido. Em breve você poderá criar templates para importar dados de planilhas e outros sistemas."
      />
    </div>
  )
}
