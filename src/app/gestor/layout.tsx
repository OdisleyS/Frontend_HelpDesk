// src/app/gestor/layout.tsx

'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import GestorSidebar from '@/components/gestor/gestor-sidebar';
import GestorHeader from '@/components/gestor/gestor-header';

export default function GestorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirecionar para login se não estiver autenticado ou se não for gestor
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && user.tipo !== 'GESTOR') {
        // Se não for gestor, redirecionar para o dashboard apropriado
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

  // Se não estiver autenticado ou não for gestor, não renderiza nada (será redirecionado)
  if (!isAuthenticated || (user && user.tipo !== 'GESTOR')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <GestorSidebar />

      {/* Main Content - Com margem-esquerda para não sobrepor o sidebar */}
      <div className="flex-1 ml-64">
        <GestorHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}