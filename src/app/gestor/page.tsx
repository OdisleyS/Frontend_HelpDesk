'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';

// Interface para os dados otimizados do dashboard
interface DashboardStats {
  totalChamados: number;
  chamadosAbertos: number;
  chamadosEmAnalise: number;
  chamadosEmAtendimento: number;
  chamadosAguardandoCliente: number;
  chamadosResolvidos: number;
  chamadosFechados: number;
  chamadosBaixa: number;
  chamadosMedia: number;
  chamadosAlta: number;
  slaConformidade: number;
  usuariosAtivos: number;
}

export default function GestorDashboard() {
  const { user, token } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  
  // Estado único para todos os dados do dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carregar dados do backend uma única vez
  useEffect(() => {
    if (!token) return;

    // Função para carregar dados do dashboard
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Apenas uma única chamada ao invés de múltiplas
        const dashboardStats = await api.statistics.getDashboardStats(token);
        setStats(dashboardStats);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [token]);

  // Definir mensagem de boas-vindas quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      setWelcomeMessage(`Bem-vindo(a), ${user.nome}!`);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{welcomeMessage}</h1>
      
      {error && (
        <Alert variant="destructive" title="Erro">
          {error}
        </Alert>
      )}
      
      <Alert variant="info" title="Área do Gestor">
        Bem-vindo à área de gestão. Aqui você pode monitorar estatísticas, gerenciar usuários e gerar relatórios.
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Total de Chamados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
                <p className="text-4xl font-bold text-blue-600">...</p>
              </div>
            ) : (
              <p className="text-4xl font-bold text-blue-600">{stats?.totalChamados || 0}</p>
            )}
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
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-green-600 rounded-full"></div>
                <p className="text-4xl font-bold text-green-600">...</p>
              </div>
            ) : (
              <p className="text-4xl font-bold text-green-600">{stats?.usuariosAtivos || 0}</p>
            )}
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
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-yellow-500 rounded-full"></div>
                <p className="text-4xl font-bold text-yellow-500">...</p>
              </div>
            ) : (
              <p className="text-4xl font-bold text-yellow-500">{Math.round(stats?.slaConformidade || 0)}%</p>
            )}
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