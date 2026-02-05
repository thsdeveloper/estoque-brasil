import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function PowerBIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Integração Power BI</h1>
        <p className="text-sm text-gray-light mt-1">
          Conecte seus dados ao Microsoft Power BI.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="A integração com Power BI está sendo desenvolvida. Em breve você poderá conectar seus dados de inventário diretamente ao Power BI para análises avançadas."
      />
    </div>
  )
}
