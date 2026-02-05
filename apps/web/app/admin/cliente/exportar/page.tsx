import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function ExportarClientePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Exportar Dados</h1>
        <p className="text-sm text-gray-light mt-1">
          Exporte os dados do seu inventário.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de exportação de dados está sendo desenvolvido. Em breve você poderá exportar todos os dados do seu inventário em diversos formatos."
      />
    </div>
  )
}
