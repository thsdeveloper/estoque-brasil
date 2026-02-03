import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ForgotPasswordForm } from '@/features/auth';

export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
      <ForgotPasswordForm />
    </div>
  );
}
