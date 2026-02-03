import { UpdatePasswordForm } from '@/features/auth';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Configuracoes</h1>
        <p className="text-sm text-gray-light mt-1">
          Gerencie suas configuracoes de conta.
        </p>
      </div>

      <div className="max-w-xl">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
