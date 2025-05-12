// src/app/(auth)/register/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { RegisterForm } from '@/components/auth/register-form';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirecionar para o dashboard se o usuário já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Exibir nada enquanto estiver verificando a autenticação
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto p-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </Card>
    );
  }
  
  // Se não estiver autenticado, exibir o formulário de registro
  return <RegisterForm />;
}