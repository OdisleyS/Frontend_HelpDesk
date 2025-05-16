// src/app/cliente/chamado/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';

// Interface para o ticket (chamado)
interface Ticket {
  id: number;
  titulo: string;
  descricao: string;
  prioridade: string;
  status: string;
  categoria: string;
  abertoEm: string;
  prazoSla: string;
}

// Interface para histórico do ticket
interface TicketHistory {
  id: number;
  usuario: {
    nome: string;
    email: string;
  };
  deStatus: string | null;
  paraStatus: string | null;
  acao: string;
  criadoEm: string;
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
// src/app/cliente/chamado/[id]/page.tsx (continuação)

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

export default function ChamadoDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Carregar detalhes do chamado
  useEffect(() => {
    const loadTicketDetails = async () => {
      if (!token) return;

      setIsLoading(true);
      setError('');

      try {
        // Buscar detalhes do chamado
        const ticketData = await api.tickets.getById(Number(params.id), token);
        setTicket(ticketData);

        // Buscar histórico do chamado
        const historyData = await api.tickets.getHistory(Number(params.id), token);
        setHistory(historyData);
      } catch (error) {
        console.error('Erro ao carregar detalhes do chamado:', error);
        setError('Não foi possível carregar os detalhes do chamado. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTicketDetails();
  }, [params.id, token]);

  // Função para cancelar chamado
  const handleCancelTicket = async () => {
    if (!token || !ticket) return;

    const confirmCancel = window.confirm('Tem certeza que deseja cancelar este chamado?');
    if (!confirmCancel) return;

    setIsCancelling(true);
    setError('');
    setSuccessMessage('');

    try {
      await api.tickets.cancelTicket(ticket.id, token);
      setSuccessMessage('Chamado cancelado com sucesso!');

      // Atualizar o ticket para mostrar o novo status
      setTicket(prev => prev ? { ...prev, status: 'FECHADO' } : null);

      // Buscar o histórico atualizado - com tratamento de erro silencioso
      try {
        const historyData = await api.tickets.getHistory(Number(params.id), token);
        setHistory(historyData || []);
      } catch (historyError) {
        console.warn('Não foi possível atualizar o histórico após cancelamento:', historyError);
      }

      // Após 2 segundos, redirecionar para a lista de chamados
      setTimeout(() => {
        router.push('/cliente/meus-chamados');
      }, 2000);
    } catch (error) {
      console.error('Erro ao cancelar chamado:', error);
      setError('Não foi possível cancelar o chamado. Tente novamente mais tarde.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Renderização condicional baseada no estado de carregamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-3">Carregando detalhes do chamado...</span>
      </div>
    );
  }

  // Renderização em caso de erro
  if (error) {
    return (
      <Alert variant="destructive" title="Erro">
        {error}
        <div className="mt-4">
          <Button onClick={() => router.push('/cliente/meus-chamados')}>
            Voltar para Meus Chamados
          </Button>
        </div>
      </Alert>
    );
  }

  // Renderização se o ticket não for encontrado
  if (!ticket) {
    return (
      <Alert variant="destructive" title="Chamado não encontrado">
        O chamado solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
        <div className="mt-4">
          <Button onClick={() => router.push('/cliente/meus-chamados')}>
            Voltar para Meus Chamados
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho com botão de voltar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Detalhes do Chamado #{ticket.id}</h2>
        <Button variant="outline" onClick={() => router.push('/cliente/meus-chamados')}>
          Voltar
        </Button>
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <Alert variant="success" title="Sucesso" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Detalhes do chamado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{ticket.titulo}</span>
            <StatusBadge status={ticket.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Categoria</h3>
              <p className="text-slate-900">{ticket.categoria}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Prioridade</h3>
              <p><PriorityBadge priority={ticket.prioridade} /></p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Aberto em</h3>
              <p className="text-slate-900">{formatDate(ticket.abertoEm)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Prazo SLA</h3>
              <p className="text-slate-900">{formatDate(ticket.prazoSla)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Descrição</h3>
            <div className="bg-slate-50 p-4 rounded-md whitespace-pre-wrap">
              {ticket.descricao}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t border-slate-200 pt-4">
          <div className="text-sm text-slate-500">
            Status atual: <StatusBadge status={ticket.status} />
          </div>
          {/* Mostrar botão de cancelar apenas se o chamado estiver aberto */}
          {ticket.status === 'ABERTO' && (
            <Button
              variant="destructive"
              onClick={handleCancelTicket}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelando...' : 'Cancelar Chamado'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Histórico do chamado */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico do Chamado</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-4 text-slate-500">
              Nenhum histórico disponível para este chamado.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.usuario.nome}</p>
                      <p className="text-sm text-slate-500">{item.usuario.email}</p>
                    </div>
                    <p className="text-sm text-slate-500">{formatDate(item.criadoEm)}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-slate-700">{item.acao}</p>
                    {item.deStatus && item.paraStatus && (
                      <p className="text-sm text-slate-500 mt-1">
                        Status alterado de <StatusBadge status={item.deStatus} /> para <StatusBadge status={item.paraStatus} />
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}