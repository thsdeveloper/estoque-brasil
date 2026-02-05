import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function ExportarRelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Exportar Relatórios</h1>
        <p className="text-sm text-gray-light mt-1">
          Exporte relatórios em diversos formatos.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de exportação de relatórios está sendo desenvolvido. Em breve você poderá exportar seus relatórios em formatos como PDF, Excel e CSV."
      />
    </div>
  )
}
