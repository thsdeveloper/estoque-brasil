import { AuditLogsTable } from "@/features/audit-logs/components/AuditLogsTable"

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Log de Auditoria</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Registros de todas as acoes realizadas no sistema
        </p>
      </div>
      <AuditLogsTable />
    </div>
  )
}
