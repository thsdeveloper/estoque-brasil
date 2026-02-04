import { Suspense } from 'react';
import { ResetPasswordForm, AuthLayout } from '@/features/auth';

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="w-full animate-pulse bg-gray-100 h-96 rounded-xl" />}>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
