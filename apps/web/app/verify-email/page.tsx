import Link from 'next/link';
import { AuthCard, AuthLayout } from '@/features/auth';
import { Button } from '@/shared/components/ui/button';
import { Mail } from 'lucide-react';

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const email = params.email;

  return (
    <AuthLayout>
      <AuthCard
        title="Verifique seu email"
        description="Enviamos um link de verificacao para ativar sua conta."
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          {email && (
            <p className="text-sm text-gray-light">
              Email enviado para: <span className="font-medium text-foreground">{email}</span>
            </p>
          )}
          <p className="text-sm text-gray-light">
            Clique no link enviado para seu email para verificar sua conta.
            Verifique tambem a pasta de spam.
          </p>
          <div className="pt-4">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Voltar ao login
              </Button>
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
