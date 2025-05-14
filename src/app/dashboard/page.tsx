// src/app/dashboard/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user) {
        // Redirecionar para a página específica do tipo de usuário
        switch (user.tipo) {
          case 'CLIENTE':
            router.push('/cliente');
            break;
          case 'TECNICO':
            router.push('/tecnico');
            break;
          case 'GESTOR':
            router.push('/gestor');
            break;
          default:
            // Caso não haja um tipo definido, apenas exibir o conteúdo padrão
            console.log('Tipo de usuário não reconhecido:', user.tipo);
            break;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Enquanto estiver carregando ou redirecionando, mostra um spinner
  if (isLoading || (isAuthenticated && user && ['CLIENTE', 'TECNICO', 'GESTOR'].includes(user.tipo))) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Conteúdo padrão do dashboard (caso chegue aqui)
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-slate-600">
            Bem-vindo ao sistema HelpDesk. Selecione uma opção no menu lateral para começar.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Usuário atual: {user?.email} (Tipo: {user?.tipo})
          </p>
        </CardContent>
      </Card>
    </div>
  );
}