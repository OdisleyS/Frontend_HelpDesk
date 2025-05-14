// src/app/gestor/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function GestorDashboard() {
  const { user } = useAuth();
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
      
      <Alert variant="info" title="Área do Gestor">
        Bem-vindo à área de gestão. Aqui você pode monitorar estatísticas, gerenciar usuários e gerar relatórios.
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Total de Chamados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">0</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" fullWidth={true} onClick={() => window.location.href = '/gestor/estatisticas'}>Ver Estatísticas</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">0</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" fullWidth={true} onClick={() => window.location.href = '/gestor/usuarios'}>Gerenciar Usuários</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>SLA Atingido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-500">0%</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" fullWidth={true} onClick={() => window.location.href = '/gestor/estatisticas'}>Ver Relatórios</Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Como gestor, você tem acesso aos relatórios de desempenho, estatísticas de chamados, 
            e gerenciamento de usuários, incluindo a capacidade de criar novos técnicos no sistema.
          </p>
        </CardContent>
        <CardFooter>
          <Button fullWidth={true} onClick={() => window.location.href = '/gestor/usuarios'}>
            Gerenciar Usuários
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}