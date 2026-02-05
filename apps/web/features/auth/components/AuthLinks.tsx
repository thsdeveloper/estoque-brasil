import Link from 'next/link';

type AuthLinkType = 'login' | 'register' | 'forgot-password';

interface AuthLinksProps {
  type: AuthLinkType;
}

export function AuthLinks({ type }: AuthLinksProps) {
  return (
    <div className="text-center text-sm text-gray-light">
      {type === 'login' && (
        <>
          <p>
            Nao tem uma conta?{' '}
            <Link href="/register" className="text-brand-orange hover:underline font-medium">
              Criar conta
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/forgot-password" className="text-brand-orange hover:underline">
              Esqueceu sua senha?
            </Link>
          </p>
        </>
      )}
      {type === 'register' && (
        <p>
          Ja tem uma conta?{' '}
          <Link href="/login" className="text-brand-orange hover:underline font-medium">
            Entrar
          </Link>
        </p>
      )}
      {type === 'forgot-password' && (
        <p>
          Lembrou sua senha?{' '}
          <Link href="/login" className="text-brand-orange hover:underline font-medium">
            Voltar ao login
          </Link>
        </p>
      )}
    </div>
  );
}
