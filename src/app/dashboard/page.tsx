// src/app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setWelcomeMessage(`Bem-vindo(a), ${user.nome}!`);
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 w-6 h-6"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 8v4l3 3" />
            </svg>
            <span className="text-xl font-bold text-slate-900">HelpDesk</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-slate-600">
                {user.email}
              </span>
            )}
            <Button 
              variant="outline"
              onClick={logout}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{welcomeMessage}</h1>
        
        <Alert variant="info" title="Sistema em Construção">
          O dashboard está em desenvolvimento. Em breve, você terá acesso a todas as funcionalidades do sistema HelpDesk.
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Chamados Abertos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">0</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" fullWidth={true}>Ver Chamados</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Em Atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-yellow-500">0</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" fullWidth={true}>Ver Detalhes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resolvidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">0</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" fullWidth={true}>Ver Histórico</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Abrir Novo Chamado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Preencha o formulário abaixo para abrir um novo chamado de suporte.
              </p>
              <p className="text-slate-600">
                Esta funcionalidade estará disponível em breve.
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled fullWidth={true}>Abrir Chamado</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}