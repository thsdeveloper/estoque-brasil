import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function GerarRelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Gerar Relatórios</h1>
        <p className="text-sm text-gray-light mt-1">
          Crie relatórios personalizados para análise.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de geração de relatórios está sendo desenvolvido. Em breve você poderá criar relatórios personalizados com filtros avançados e visualizações gráficas."
      />
    </div>
  )
}
