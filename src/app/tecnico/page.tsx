// src/app/tecnico/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function TecnicoDashboard() {
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
      
      <Alert variant="info" title="Área do Técnico">
        Bem-vindo à área de técnicos. Aqui você pode gerenciar chamados e categorias.
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Chamados Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">0</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" fullWidth={true} onClick={() => window.location.href = '/tecnico/chamados'}>Ver Chamados</Button>
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
            <Button variant="outline" fullWidth={true} onClick={() => window.location.href = '/tecnico/chamados'}>Ver Detalhes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">0</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" fullWidth={true} onClick={() => window.location.href = '/tecnico/categorias'}>Gerenciar</Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Chamados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Como técnico, você pode acessar todos os chamados abertos, atribuir chamados a si mesmo, 
            atualizar o status dos chamados e responder aos clientes.
          </p>
        </CardContent>
        <CardFooter>
          <Button fullWidth={true} onClick={() => window.location.href = '/tecnico/chamados'}>
            Acessar Chamados
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}