import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from '@/features/auth';

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

function LoginFormWrapper({ redirectTo }: { redirectTo?: string }) {
  return <LoginForm redirectTo={redirectTo} />;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  if (user) {
    redirect(params.redirectTo || '/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
      <Suspense fallback={<div className="w-full max-w-md mx-auto animate-pulse bg-gray-100 h-96 rounded-xl" />}>
        <LoginFormWrapper redirectTo={params.redirectTo} />
      </Suspense>
    </div>
  );
}
