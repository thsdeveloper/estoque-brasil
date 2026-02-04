import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ForgotPasswordForm, AuthLayout } from '@/features/auth';

export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/admin');
  }

  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
