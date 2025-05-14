// src/app/tecnico/layout.tsx

'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import TecnicoSidebar from '@/components/tecnico/tecnico-sidebar'; 
import TecnicoHeader from '@/components/tecnico/tecnico-header';

export default function TecnicoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirecionar para login se não estiver autenticado ou se não for técnico
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && user.tipo !== 'TECNICO') {
        // Se não for técnico, redirecionar para o dashboard apropriado
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Mostrar spinner enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não estiver autenticado ou não for técnico, não renderiza nada (será redirecionado)
  if (!isAuthenticated || (user && user.tipo !== 'TECNICO')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <TecnicoSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TecnicoHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}