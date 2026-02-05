'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PasswordInput } from './PasswordInput';
import { updatePassword } from '../actions/update-password-action';
import { updatePasswordSchema, type UpdatePasswordInput } from '../types';

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: UpdatePasswordInput) => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData();
    formData.append('newPassword', data.newPassword);
    formData.append('confirmPassword', data.confirmPassword);

    const result = await updatePassword(formData);

    if (result.error) {
      if (typeof result.error === 'string') {
        setError(result.error);
      } else {
        const firstError = Object.values(result.error).flat()[0];
        setError(firstError || 'Erro ao alterar senha');
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
        <CardDescription>
          Atualize sua senha de acesso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Minimo 8 caracteres"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nova senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Repita a nova senha"
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
            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md">
                Senha alterada com sucesso!
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Alterar senha'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
