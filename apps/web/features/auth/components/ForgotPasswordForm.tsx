'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { AuthCard } from './AuthCard';
import { AuthLinks } from './AuthLinks';
import { forgotPassword } from '../actions/forgot-password-action';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../types';

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData();
    formData.append('email', data.email);

    const result = await forgotPassword(formData);

    if (result.error) {
      if (typeof result.error === 'string') {
        setError(result.error);
      } else {
        const firstError = Object.values(result.error).flat()[0];
        setError(firstError || 'Erro ao enviar email');
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <AuthCard
        title="Email enviado!"
        description="Verifique sua caixa de entrada para redefinir sua senha."
        footer={<AuthLinks type="forgot-password" />}
      >
        <div className="p-4 text-sm text-green-700 bg-green-50 rounded-md text-center">
          Enviamos um link de recuperação para o email informado. Verifique também a pasta de spam.
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Esqueceu sua senha?"
      description="Informe seu email para receber um link de recuperação."
      footer={<AuthLinks type="forgot-password" />}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
