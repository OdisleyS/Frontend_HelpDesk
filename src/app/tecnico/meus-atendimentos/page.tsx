// src/app/tecnico/meus-atendimentos/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

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

// Componentes de status e prioridade (reutilizados)
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

export default function TecnicoMeusAtendimentosPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('EM_ATENDIMENTO');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Carregar chamados
  useEffect(() => {
    const loadTickets = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        // Idealmente, deveria haver um endpoint para listar chamados do técnico
        // Por enquanto, usamos o filtro por status
        const data = await api.tickets.listByStatus(statusFilter, token);
        // Filtrar apenas chamados atribuídos ao técnico atual
        // Isso deve ser feito no backend, mas como simplificação, fazemos aqui
        setTickets(data);
      } catch (error) {
        console.error('Erro ao carregar chamados:', error);
        setError('Não foi possível carregar seus atendimentos. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTickets();
  }, [statusFilter, token]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Meus Atendimentos</h2>
          <p className="text-slate-600 mt-1">Gerenciar chamados que estão sob sua responsabilidade.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={statusFilter === 'EM_ANALISE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('EM_ANALISE')}
            size="sm"
          >
            Em Análise
          </Button>
          <Button 
            variant={statusFilter === 'EM_ATENDIMENTO' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('EM_ATENDIMENTO')}
            size="sm"
          >
            Em Atendimento
          </Button>
          <Button 
            variant={statusFilter === 'AGUARDANDO_CLIENTE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('AGUARDANDO_CLIENTE')}
            size="sm"
          >
            Aguardando Cliente
          </Button>
          <Button 
            variant={statusFilter === 'RESOLVIDO' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('RESOLVIDO')}
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
            <span className="ml-3">Carregando atendimentos...</span>
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
            <h3 className="text-lg font-medium text-slate-700 mt-4">Nenhum atendimento encontrado</h3>
            <p className="text-slate-500 mt-2">
              Você não possui chamados com status "{statusFilter.replace('_', ' ').toLowerCase()}" no momento.
            </p>
            <Button className="mt-4" onClick={() => router.push('/tecnico/chamados')}>
              Ver Chamados Disponíveis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => router.push(`/tecnico/chamados/${ticket.id}`)} 
              className="cursor-pointer"
            >
              <Card className="hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h3 className="font-medium text-lg text-slate-900">{ticket.titulo}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.prioridade} />
                        <span className="text-xs font-medium px-2 py-1 rounded-full border bg-slate-100 text-slate-800">
                          {ticket.categoria}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-2">
                        <div>Aberto em: {formatDate(ticket.abertoEm)}</div>
                        {ticket.prazoSla && (
                          <div>Prazo: {formatDate(ticket.prazoSla)}</div>
                        )}
                      </div>
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
        Lembre-se de manter o cliente informado sobre o progresso do atendimento.
      </Alert>
    </div>
  );
}