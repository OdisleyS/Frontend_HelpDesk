// src/app/cliente/layout.tsx

'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import ClienteSidebar from '@/components/cliente/cliente-sidebar';
import ClienteHeader from '@/components/cliente/cliente-header';

export default function ClienteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirecionar para login se não estiver autenticado ou se não for cliente
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && user.tipo !== 'CLIENTE') {
        // Se não for cliente, redirecionar para o dashboard apropriado
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

  // Se não estiver autenticado ou não for cliente, não renderiza nada (será redirecionado)
  if (!isAuthenticated || (user && user.tipo !== 'CLIENTE')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <ClienteSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ClienteHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}