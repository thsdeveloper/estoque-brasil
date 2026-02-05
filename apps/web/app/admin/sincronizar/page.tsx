import { UnderDevelopment } from "@/shared/components/UnderDevelopment"

export default function SincronizarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Sincronizar Dados</h1>
        <p className="text-sm text-gray-light mt-1">
          Sincronize dados com sistemas externos.
        </p>
      </div>
      <UnderDevelopment
        title="Funcionalidade em Desenvolvimento"
        description="O módulo de sincronização está sendo desenvolvido. Em breve você poderá sincronizar dados entre o sistema de inventário e seus ERPs e outros sistemas."
      />
    </div>
  )
}
