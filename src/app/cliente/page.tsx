// src/app/cliente/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function ClienteRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirecionar para meus chamados automaticamente
    router.push('/cliente/meus-chamados');
  }, [router]);
  
  // Enquanto redireciona, mostra um spinner
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <span className="ml-3">Redirecionando...</span>
    </div>
  );
}