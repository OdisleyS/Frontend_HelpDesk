// src/app/tecnico/chamados/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';
import PriorityEditModal from '@/components/tecnico/priority-edit-modal';

// Interface para o ticket (chamado)
interface Ticket {
  id: number;
  titulo: string;
  descricao: string;
  prioridade: string;
  status: string;
  categoria: string;
  departamento: string;
  cliente: {
    id: number;
    nome: string;
    email: string;
  };
  tecnico: {
    id: number;
    nome: string;
    email: string;
  } | null;
  abertoEm: string;
  prazoSla: string;
  fechadoEm?: string;
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

export default function TecnicoChamadoDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token, user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);

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
        setSelectedStatus(ticketData.status);

        // Buscar histórico do chamado - sem tratamento de erro silencioso
        try {
          const historyData = await api.tickets.getHistory(Number(params.id), token);
          setHistory(historyData || []);
        } catch (historyError) {
          console.error('Erro ao carregar o histórico:', historyError);
          setError('Não foi possível carregar o histórico. Tente novamente mais tarde.');
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do chamado:', error);
        setError('Não foi possível carregar os detalhes do chamado. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTicketDetails();
  }, [params.id, token]);

  // Função para assumir o chamado
  const handleAssignTicket = async () => {
    if (!token || !ticket) return;

    setIsUpdating(true);

    try {
      await api.tickets.assignTecnico(ticket.id, token);

      // Atualizar o ticket localmente
      setTicket(prev => prev ? {
        ...prev,
        status: 'EM_ATENDIMENTO',
        tecnico: {
          id: user?.id || 0,
          nome: user?.nome || user?.email?.split('@')[0] || '',
          email: user?.email || ''
        }
      } : null);

      setSuccessMessage('Chamado assumido com sucesso!');

      // Recarregar o histórico
      try {
        const historyData = await api.tickets.getHistory(Number(params.id), token);
        setHistory(historyData);
      } catch (historyError) {
        console.error('Erro ao carregar histórico após assumir:', historyError);
      }
    } catch (error) {
      console.error('Erro ao assumir chamado:', error);
      setError('Não foi possível assumir o chamado. Tente novamente mais tarde.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para atualizar o status do chamado
  const handleStatusChange = async () => {
    if (!token || !ticket || selectedStatus === ticket.status) return;

    setIsUpdating(true);

    try {
      await api.tickets.updateStatus(ticket.id, selectedStatus, token);

      // Atualizar o ticket localmente
      setTicket(prev => prev ? { ...prev, status: selectedStatus } : null);

      setSuccessMessage(`Status atualizado para ${selectedStatus.replace('_', ' ').toLowerCase()}!`);

      // Recarregar o histórico
      try {
        const historyData = await api.tickets.getHistory(Number(params.id), token);
        setHistory(historyData);
      } catch (historyError) {
        console.error('Erro ao carregar histórico após atualizar status:', historyError);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Não foi possível atualizar o status do chamado. Tente novamente mais tarde.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para resolver o chamado
  const handleResolveTicket = async () => {
    if (!token || !ticket) return;

    setIsUpdating(true);
    setError('');

    try {
      await api.tickets.resolveTicket(ticket.id, token);

      // Atualizar o ticket localmente
      setTicket(prev => prev ? { ...prev, status: 'RESOLVIDO' } : null);

      setSuccessMessage('Chamado resolvido com sucesso!');

      // Recarregar o histórico
      try {
        const historyData = await api.tickets.getHistory(Number(params.id), token);
        setHistory(historyData);
      } catch (historyError) {
        console.error('Erro ao carregar histórico após resolver:', historyError);
      }
    } catch (error) {
      console.error('Erro ao resolver chamado:', error);
      setError('Ocorreu um erro ao resolver o chamado, mas a operação pode ter sido concluída. Atualize a página para verificar.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para adicionar comentário
  const handleAddComment = async () => {
    if (!token || !ticket || !comment.trim()) return;

    setIsUpdating(true);
    setError('');

    try {
      await api.tickets.addComment(ticket.id, comment, token);

      // Atualizar o histórico localmente
      setHistory(prev => [
        ...prev,
        {
          id: Math.floor(Math.random() * 10000),
          usuario: {
            nome: user?.nome || user?.email?.split('@')[0] || '',
            email: user?.email || ''
          },
          deStatus: null,
          paraStatus: null,
          acao: comment,
          criadoEm: new Date().toISOString()
        }
      ]);

      setComment('');
      setSuccessMessage('Comentário adicionado com sucesso!');

      // Recarregar o histórico para garantir dados atualizados
      const historyData = await api.tickets.getHistory(Number(params.id), token);
      setHistory(historyData);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      setError('Não foi possível adicionar o comentário. Tente novamente mais tarde.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Nova função para atualizar prioridade
  const handleUpdatePriority = async (newPriority: string, comment: string) => {
    if (!token || !ticket) return;

    setIsUpdating(true);
    setError('');

    try {
      await api.tickets.updatePriority(ticket.id, newPriority, comment, token);

      // Atualizar o ticket localmente
      setTicket(prev => prev ? { ...prev, prioridade: newPriority } : null);

      // Recarregar o histórico para incluir o comentário
      try {
        const historyData = await api.tickets.getHistory(Number(params.id), token);
        setHistory(historyData);
      } catch (historyError) {
        console.error('Erro ao carregar histórico após atualizar prioridade:', historyError);
      }

      setSuccessMessage('Prioridade atualizada com sucesso!');
      setShowPriorityModal(false);
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
      setError('Não foi possível atualizar a prioridade do chamado. Tente novamente mais tarde.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-3">Carregando detalhes do chamado...</span>
      </div>
    );
  }

  // Renderização em caso de erro
  if (error && !ticket) {
    return (
      <Alert variant="destructive" title="Erro">
        {error}
        <div className="mt-4">
          <Button onClick={() => router.back()}>
            Voltar
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
          <Button onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </Alert>
    );
  }

  // Verificar se é possível realizar ações no chamado
  const canAssign = ticket.status === 'ABERTO' && (!ticket.tecnico || ticket.tecnico.id !== user?.id);
  const canUpdateStatus = ticket.tecnico &&
    (ticket.tecnico.email === user?.email) &&
    ticket.status !== 'RESOLVIDO' &&
    ticket.status !== 'FECHADO';
  const canResolve = ticket.tecnico &&
    (ticket.tecnico.email === user?.email) &&
    ticket.status !== 'RESOLVIDO' &&
    ticket.status !== 'FECHADO';
  const canAddComment = ticket.status !== 'FECHADO';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho com botão de voltar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Chamado #{ticket.id}</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <Alert variant="success" title="Sucesso" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Mensagem de erro, se houver erro mas também houver ticket */}
      {error && ticket && (
        <Alert variant="destructive" title="Erro" onClose={() => setError('')}>
          {error}
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
              <h3 className="text-sm font-medium text-slate-500">Departamento</h3>
              <p className="text-slate-900">{ticket.departamento}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 flex items-center">
                Prioridade
                {/* Ícone de edição - apenas se o chamado estiver aberto e não tiver técnico atribuído */}
                {ticket.status === 'ABERTO' && !ticket.tecnico && (
                  <button 
                    onClick={() => setShowPriorityModal(true)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    title="Editar Prioridade"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </h3>
              <p><PriorityBadge priority={ticket.prioridade} /></p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Cliente</h3>
              <p className="text-slate-900">{ticket.cliente.nome || ticket.cliente.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Aberto em</h3>
              <p className="text-slate-900">{formatDate(ticket.abertoEm)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Prazo SLA</h3>
              <p className="text-slate-900">
                {formatDate(ticket.prazoSla)}
                <span className="block text-xs text-slate-600 mt-1">
                  (Prazo definido automaticamente pelo sistema com base na categoria e prioridade)
                </span>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Descrição</h3>
            <div className="bg-slate-50 p-4 rounded-md whitespace-pre-wrap">
              {ticket.descricao}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-slate-500">
              Status atual: <StatusBadge status={ticket.status} />
            </div>

            <div className="flex gap-2">
              {/* Botão para assumir chamado */}
              {canAssign && (
                <Button
                  onClick={handleAssignTicket}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Processando...' : 'Assumir Chamado'}
                </Button>
              )}

              {/* Botão para resolver chamado */}
              {canResolve && (
                <Button
                  variant="success"
                  onClick={handleResolveTicket}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUpdating ? 'Processando...' : 'Resolver Chamado'}
                </Button>
              )}
            </div>
          </div>

          {/* Seletor de Status */}
          {canUpdateStatus && (
            <div className="flex gap-4 items-center w-full border-t border-slate-200 pt-4">
              <div className="text-sm font-medium text-slate-700">Atualizar Status:</div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-grow p-2 border border-slate-300 rounded-md"
                disabled={isUpdating}
              >
                <option value="EM_ANALISE">Em Análise</option>
                <option value="EM_ATENDIMENTO">Em Atendimento</option>
                <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
              </select>
              <Button
                onClick={handleStatusChange}
                disabled={isUpdating || selectedStatus === ticket.status}
              >
                {isUpdating ? 'Atualizando...' : 'Atualizar Status'}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Área de comentários */}
      {canAddComment && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Comentário</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Digite um comentário ou instrução para o cliente..."
              className="w-full border border-slate-300 rounded-md p-3 min-h-[100px]"
              disabled={isUpdating}
            ></textarea>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAddComment}
              disabled={isUpdating || !comment.trim()}
              fullWidth={true}
            >
              {isUpdating ? 'Enviando...' : 'Adicionar Comentário'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Histórico do chamado - sempre mostrar para técnicos */}
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
                      <p className="font-medium">{item.usuario.nome || item.usuario.email}</p>
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

      {/* Informações adicionais sobre o SLA */}
      <Alert variant="info" title="Sobre o Prazo SLA">
        O prazo SLA (Service Level Agreement) é calculado automaticamente pelo sistema com base na categoria e prioridade do chamado.
        Este prazo representa o tempo máximo para a resolução do chamado de acordo com as políticas de atendimento.
        O técnico não precisa definir manualmente este prazo.
      </Alert>

      {/* Modal para edição de prioridade */}
      {showPriorityModal && (
        <PriorityEditModal
          ticketId={ticket.id}
          currentPriority={ticket.prioridade}
          onClose={() => setShowPriorityModal(false)}
          onSave={handleUpdatePriority}
        />
      )}
    </div>
  );
}