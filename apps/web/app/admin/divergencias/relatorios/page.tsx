import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function RelatoriosDivergenciasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Relatórios de Divergências</h1>
        <p className="text-sm text-gray-light mt-1">
          Gere relatórios detalhados sobre divergências encontradas.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de relatórios de divergências está sendo desenvolvido. Em breve você poderá gerar relatórios completos com análises de divergências por período, loja e categoria."
      />
    </div>
  )
}
