// src/app/cliente/meus-chamados/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

// Enum para filtro de status
enum StatusFilter {
  TODOS = 'TODOS',
  ABERTO = 'ABERTO',
  EM_ANALISE = 'EM_ANALISE',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  AGUARDANDO_CLIENTE = 'AGUARDANDO_CLIENTE',
  RESOLVIDO = 'RESOLVIDO',
  FECHADO = 'FECHADO'
}

// Interface para o ticket (chamado)
interface Ticket {
  id: number;
  titulo: string;
  prioridade: string;
  status: string;
  categoria: string;
  abertoEm: string;
  prazoSla: string;
}

// Componente de status visuais
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColorClasses = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EM_ANALISE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EM_ATENDIMENTO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'AGUARDANDO_CLIENTE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RESOLVIDO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FECHADO':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'Aberto';
      case 'EM_ANALISE':
        return 'Em Análise';
      case 'EM_ATENDIMENTO':
        return 'Em Atendimento';
      case 'AGUARDANDO_CLIENTE':
        return 'Aguardando Cliente';
      case 'RESOLVIDO':
        return 'Resolvido';
      case 'FECHADO':
        return 'Fechado';
      default:
        return status;
    }
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColorClasses(status)}`}>
      {getStatusDisplayName(status)}
    </span>
  );
};

// Componente para exibir a prioridade
const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityColorClasses = (priority: string) => {
    switch (priority) {
      case 'BAIXA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ALTA':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityDisplayName = (priority: string) => {
    switch (priority) {
      case 'BAIXA':
        return 'Baixa';
      case 'MEDIA':
        return 'Média';
      case 'ALTA':
        return 'Alta';
      default:
        return priority;
    }
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColorClasses(priority)}`}>
      {getPriorityDisplayName(priority)}
    </span>
  );
};

// Função para formatar data
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default function MeusChamadosPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(StatusFilter.TODOS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  
  useEffect(() => {
    const loadTickets = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        // Se o filtro for TODOS, precisamos fazer múltiplas chamadas para cada status
        if (statusFilter === StatusFilter.TODOS) {
          // Array de todos os status que queremos buscar
          const statusesToFetch = [
            'ABERTO', 'EM_ANALISE', 'EM_ATENDIMENTO', 
            'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO'
          ];
          
          // Buscar todos os status em paralelo
          const allTicketsPromises = statusesToFetch.map(status => 
            api.tickets.listByStatus(status, token));
          
          const results = await Promise.all(allTicketsPromises);
          
          // Combinar todos os resultados em um único array
          const allTickets = results.flat();
          setTickets(allTickets);
        } else {
          // Buscar apenas o status selecionado
          const data = await api.tickets.listByStatus(statusFilter, token);
          setTickets(data);
        }
      } catch (error) {
        console.error('Erro ao carregar chamados:', error);
        setError('Não foi possível carregar seus chamados. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTickets();
  }, [statusFilter, token]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho com mensagem de boas-vindas */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{welcomeMessage}</h1>
      </div>
      {/* Cabeçalho da página de chamados */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Meus Chamados</h2>
          <p className="text-slate-600 mt-1">Visualize e gerencie seus chamados de suporte.</p>
        </div>
        <Button onClick={() => router.push('/cliente/abrir-chamado')}>
          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Chamado
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={statusFilter === StatusFilter.TODOS ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.TODOS)}
            size="sm"
          >
            Todos
          </Button>
          <Button 
            variant={statusFilter === StatusFilter.ABERTO ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.ABERTO)}
            size="sm"
          >
            Abertos
          </Button>
          <Button 
            variant={statusFilter === StatusFilter.EM_ATENDIMENTO ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.EM_ATENDIMENTO)}
            size="sm"
          >
            Em Atendimento
          </Button>
          <Button 
            variant={statusFilter === StatusFilter.AGUARDANDO_CLIENTE ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.AGUARDANDO_CLIENTE)}
            size="sm"
          >
            Aguardando Você
          </Button>
          <Button 
            variant={statusFilter === StatusFilter.RESOLVIDO ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.RESOLVIDO)}
            size="sm"
          >
            Resolvidos
          </Button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive" title="Erro">
          {error}
        </Alert>
      )}

      {/* Lista de chamados */}
      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <span className="ml-3">Carregando chamados...</span>
          </CardContent>
        </Card>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-slate-700 mt-4">Nenhum chamado encontrado</h3>
            <p className="text-slate-500 mt-2">
              {statusFilter === StatusFilter.TODOS 
                ? 'Você ainda não possui chamados registrados.' 
                : `Você não possui chamados com status "${StatusFilter[statusFilter].replace('_', ' ').toLowerCase()}".`}
            </p>
            <Button className="mt-4" onClick={() => router.push('/cliente/abrir-chamado')}>
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Abrir Novo Chamado
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => router.push(`/cliente/chamado/${ticket.id}`)} 
              className="cursor-pointer"
            >
              <Card className="hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <h3 className="font-medium text-lg text-slate-900">{ticket.titulo}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.prioridade} />
                        <span className="text-xs font-medium px-2 py-1 rounded-full border bg-slate-100 text-slate-800">
                          {ticket.categoria}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      <div>Aberto em: {formatDate(ticket.abertoEm)}</div>
                      {ticket.prazoSla && (
                        <div>Prazo: {formatDate(ticket.prazoSla)}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Alerta informativo */}
      <Alert variant="info" title="Dica">
        Para mais detalhes sobre um chamado específico, clique nele para ver seu histórico completo.
      </Alert>
    </div>
  );
}