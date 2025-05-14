// src/app/cliente/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function ClienteDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Defina a mensagem de boas-vindas quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      setWelcomeMessage(`Bem-vindo(a), ${user.nome}!`);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{welcomeMessage}</h1>
      
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
            <Button variant="outline" fullWidth={true} onClick={() => window.location.href = '/cliente/meus-chamados'}>Ver Chamados</Button>
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
            <Button variant="outline" fullWidth={true} onClick={() => window.location.href = '/cliente/meus-chamados'}>Ver Detalhes</Button>
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
            <Button variant="outline" fullWidth={true} onClick={() => window.location.href = '/cliente/meus-chamados'}>Ver Histórico</Button>
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
              Preencha o formulário para abrir um novo chamado de suporte.
            </p>
          </CardContent>
          <CardFooter>
           // src/app/cliente/page.tsx (continuação)
            <Button onClick={() => window.location.href = '/cliente/abrir-chamado'} fullWidth={true}>Abrir Chamado</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}