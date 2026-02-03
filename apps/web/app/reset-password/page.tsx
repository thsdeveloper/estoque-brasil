import { Suspense } from 'react';
import { ResetPasswordForm } from '@/features/auth';

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
      <Suspense fallback={<div className="w-full max-w-md mx-auto animate-pulse bg-gray-100 h-96 rounded-xl" />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
