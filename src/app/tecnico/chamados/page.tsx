// src/app/tecnico/chamados/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  tecnico: {
    id: number;
    nome: string;
    email: string;
  } | null;
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

export default function TecnicoChamadosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>(searchParams?.get('status') || 'ABERTO');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Carregar chamados
  useEffect(() => {
    const loadTickets = async () => {
      if (!token) return;

      setIsLoading(true);
      setError('');

      try {
        const data = await api.tickets.listByStatus(statusFilter, token);
        setTickets(data);
      } catch (error) {
        console.error('Erro ao carregar chamados:', error);
        setError('Não foi possível carregar os chamados. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, [statusFilter, token]);

  // Função para assumir um chamado
  const handleAssignTicket = async (id: number) => {
    if (!token) return;

    setAssigningId(id);
    setAssignError(null);

    try {
      await api.tickets.assignTecnico(id, token);

      // Atualizar a lista de chamados
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === id
            ? {
              ...ticket,
              status: 'EM_ATENDIMENTO',
              tecnico: {
                id: user?.id || 0,
                nome: user?.nome || user?.email?.split('@')[0] || '',
                email: user?.email || ''
              }
            }
            : ticket
        )
      );

      // Redirecionar para a página de detalhe do chamado
      router.push(`/tecnico/chamados/${id}`);
    } catch (error: any) {
      console.error('Erro ao assumir chamado:', error);

      // Verificar se o erro é que o chamado já está atribuído
      if (error.message && error.message.includes('já está sendo atendido')) {
        setAssignError(error.message);

        // Atualizar apenas o chamado que deu erro para mostrar o técnico atual
        const updatedTicket = await api.tickets.getById(id, token);
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === id ? { ...ticket, tecnico: updatedTicket.tecnico } : ticket
          )
        );
      } else {
        setError('Não foi possível assumir o chamado. Tente novamente mais tarde.');
      }

      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Chamados Disponíveis</h2>
          <p className="text-slate-600 mt-1">Visualize e assuma chamados pendentes de atendimento.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'ABERTO' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ABERTO')}
            size="sm"
          >
            Abertos
          </Button>
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

      {/* Mensagem de erro específica para atribuição */}
      {assignError && (
        <Alert variant="destructive" title="Erro ao atribuir chamado" onClose={() => setAssignError(null)}>
          {assignError}
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
              Não há chamados com status "{statusFilter.replace('_', ' ').toLowerCase()}" no momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <Card key={ticket.id} className="hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex-grow">
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
                      {/* Mostrar informação do técnico responsável se existir */}
                      {ticket.tecnico && (
                        <div className="mt-1 text-blue-600 font-medium">
                          Técnico: {ticket.tecnico.nome || ticket.tecnico.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* Mostrar botão "Assumir" apenas se não houver técnico */}
                    {!ticket.tecnico && ticket.status === 'ABERTO' ? (
                      <Button
                        onClick={() => handleAssignTicket(ticket.id)}
                        disabled={assigningId === ticket.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {assigningId === ticket.id ? 'Assumindo...' : 'Assumir Chamado'}
                      </Button>
                    ) : ticket.tecnico && ticket.tecnico.email !== user?.email ? (
                      <div className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200 text-center">
                        Atribuído a {ticket.tecnico.nome || ticket.tecnico.email}
                      </div>
                    ) : null}
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/tecnico/chamados/${ticket.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alerta informativo */}
      <Alert variant="info" title="Dica">
        Chamados com prioridade alta ou com prazo SLA próximo de vencer devem ser priorizados.
        Apenas chamados com status "Aberto" podem ser assumidos.
      </Alert>
    </div>
  );
}