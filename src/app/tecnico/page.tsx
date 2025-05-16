// src/app/tecnico/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';

// Interface para estatísticas resumidas
interface TicketStats {
  abertos: number;
  emAtendimento: number;
  resolvidos: number;
  total: number;
}

export default function TecnicoDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [stats, setStats] = useState<TicketStats>({
    abertos: 0,
    emAtendimento: 0,
    resolvidos: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Definir mensagem de boas-vindas e carregar estatísticas
  useEffect(() => {
    if (user) {
      setWelcomeMessage(`Bem-vindo(a), ${user.nome || user.email?.split('@')[0]}!`);
      loadStats();
    }
  }, [user]);

  // Função para carregar estatísticas resumidas dos chamados
  const loadStats = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Usuário não autenticado');
        return;
      }
      
      // Contador de chamados em cada status (simulação)
      const abertos = await api.tickets.listByStatus('ABERTO', token);
      const emAnalise = await api.tickets.listByStatus('EM_ANALISE', token);
      const emAtendimento = await api.tickets.listByStatus('EM_ATENDIMENTO', token);
      const aguardandoCliente = await api.tickets.listByStatus('AGUARDANDO_CLIENTE', token);
      const resolvidos = await api.tickets.listByStatus('RESOLVIDO', token);

      setStats({
        abertos: abertos.length,
        emAtendimento: emAtendimento.length + emAnalise.length + aguardandoCliente.length,
        resolvidos: resolvidos.length,
        total: abertos.length + emAtendimento.length + emAnalise.length + aguardandoCliente.length + resolvidos.length
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Não foi possível carregar as estatísticas de chamados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{welcomeMessage}</h1>
      
      {error && (
        <Alert variant="destructive" title="Erro">
          {error}
        </Alert>
      )}
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{isLoading ? '...' : stats.abertos}</div>
            <p className="text-slate-500">Chamados Abertos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-500">{isLoading ? '...' : stats.emAtendimento}</div>
            <p className="text-slate-500">Em Atendimento</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{isLoading ? '...' : stats.resolvidos}</div>
            <p className="text-slate-500">Resolvidos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-slate-800">{isLoading ? '...' : stats.total}</div>
            <p className="text-slate-500">Total de Chamados</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chamados Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Visualize e assuma os chamados que estão aguardando atendimento.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/tecnico/chamados?status=ABERTO')} fullWidth={true}>
              Ver Chamados Pendentes
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Meus Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Gerencie os chamados que já estão sob sua responsabilidade.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/tecnico/meus-atendimentos')} fullWidth={true}>
              Ver Meus Atendimentos
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Alert variant="info" title="Dica">
        Para melhor produtividade, priorize chamados com base na SLA e na criticidade do problema.
      </Alert>
    </div>
  );
}