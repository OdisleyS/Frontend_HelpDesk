'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
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

// Componentes de status e prioridade
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
        
        // Tentar buscar histórico, mas não falhar se der erro
        try {
          const historyData = await api.tickets.getHistory(Number(params.id), token);
          setHistory(historyData);
        } catch (historyError) {
          console.error('Erro ao obter histórico:', historyError);
          // Não falha o carregamento principal se o histórico falhar
          setHistory([]);
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do chamado:', error);
        // Se o erro for aqui, é mais grave
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
    setError('');
    
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
      
      // Tentar recarregar o histórico
      try {
        const historyData = await api.tickets.getHistory(Number(params.id), token);
        setHistory(historyData);
      } catch (historyError) {
        console.error('Erro ao carregar histórico após assumir:', historyError);
      }
    } catch (error: any) {
      console.error('Erro ao assumir chamado:', error);
      
      if (error.message && error.message.includes('já está sendo atendido')) {
        setError(error.message);
        
        // Recarregar os dados do chamado
        try {
          const ticketData = await api.tickets.getById(Number(params.id), token);
          setTicket(ticketData);
        } catch (refreshError) {
          console.error('Erro ao atualizar dados do ticket:', refreshError);
        }
      } else {
        setError('Não foi possível assumir o chamado. Tente novamente mais tarde.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para atualizar o status do chamado
  const handleStatusChange = async () => {
    if (!token || !ticket || selectedStatus === ticket.status) return;
    
    setIsUpdating(true);
    setError('');
    
    try {
      await api.tickets.updateStatus(ticket.id, selectedStatus, token);
      
      // Atualizar o ticket localmente
      setTicket(prev => prev ? { ...prev, status: selectedStatus } : null);
      
      setSuccessMessage(`Status atualizado para ${selectedStatus.replace('_', ' ').toLowerCase()}!`);
      
      // Tentar recarregar o histórico
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
      
      // Tentar recarregar o histórico
      try {
        const historyData = await api.tickets.getHistory(Number(params.id), token);
        setHistory(historyData);
      } catch (historyError) {
        console.error('Erro ao carregar histórico após resolver:', historyError);
      }
    } catch (error) {
      console.error('Erro ao resolver chamado:', error);
      setError('Não foi possível resolver o chamado. Tente novamente mais tarde.');
    } finally {
      setIsUpdating(false);
    }
  };

const handleAddComment = async () => {
  if (!token || !ticket || !comment.trim()) return;
  
  setIsUpdating(true);
  setError('');
  
  try {
    // Verificar a URL e o formato do corpo da requisição
    console.log(`Enviando comentário para o chamado #${ticket.id}:`, comment);
    
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
    
    // Tentar recarregar o histórico
    try {
      const historyData = await api.tickets.getHistory(Number(params.id), token);
      setHistory(historyData);
    } catch (historyError) {
      console.error('Erro ao carregar histórico após comentar:', historyError);
    }
  } catch (error: any) {
    console.error('Erro ao adicionar comentário:', error);
    // Mensagem de erro mais específica
    setError(error.message || 'Não foi possível adicionar o comentário. Tente novamente mais tarde.');
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

  // Renderização em caso de erro total (sem ticket)
  if (error && !ticket) {
    return (
      <Alert variant="destructive" title="Erro">
        {error}
        <div className="mt-4">
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </button>
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
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </button>
        </div>
      </Alert>
    );
  }

  // Verificar se é possível realizar ações no chamado
  const canAssign = ticket.status === 'ABERTO' && !ticket.tecnico;
  const canUpdateStatus = (ticket.tecnico && ticket.tecnico.email === user?.email && 
                         ticket.status !== 'RESOLVIDO' && ticket.status !== 'FECHADO') ||
                         (!ticket.tecnico && user?.tipo === 'TECNICO');
  const canResolve = (ticket.tecnico && ticket.tecnico.email === user?.email && 
                    ticket.status !== 'RESOLVIDO' && ticket.status !== 'FECHADO') ||
                    (!ticket.tecnico && user?.tipo === 'TECNICO');
  const canAddComment = ticket.status !== 'FECHADO';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho com botão de voltar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Chamado #{ticket.id}</h2>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
        >
          Voltar
        </button>
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <Alert variant="success" title="Sucesso" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Mensagem de erro (se houver erro mas também tivermos ticket) */}
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
              <h3 className="text-sm font-medium text-slate-500">Prioridade</h3>
              <p><PriorityBadge priority={ticket.prioridade} /></p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Cliente</h3>
              <p className="text-slate-900">{ticket.cliente.nome || ticket.cliente.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Técnico responsável</h3>
              <p className="text-slate-900">
                {ticket.tecnico 
                  ? (ticket.tecnico.nome || ticket.tecnico.email) 
                  : <span className="text-slate-400">Não atribuído</span>}
              </p>
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
              {/* Botão para assumir chamado - Usando o estilo exato da screenshot */}
              {canAssign && (
                <button 
                  onClick={handleAssignTicket}
                  disabled={isUpdating}
                  className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Processando...' : 'Assumir Chamado'}
                </button>
              )}
              
              {/* Botão para resolver chamado - Usando o estilo exato da screenshot */}
              {canResolve && (
                <button 
                  onClick={handleResolveTicket}
                  disabled={isUpdating}
                  className="px-4 py-2 font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Processando...' : 'Resolver Chamado'}
                </button>
              )}
            </div>
          </div>
          
          {/* Seletor de Status - Usando o estilo exato da screenshot */}
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
              <button 
                onClick={handleStatusChange}
                disabled={isUpdating || selectedStatus === ticket.status}
                className="px-4 py-2 font-medium text-white bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Mensagem informativa quando o chamado já está atribuído a outro técnico */}
      {ticket.tecnico && ticket.tecnico.email !== user?.email && (
        <Alert 
          variant="info" 
          title="Chamado já atribuído"
        >
          Este chamado já está sendo atendido por {ticket.tecnico.nome || ticket.tecnico.email}.
          Apenas o técnico responsável pode modificar o status ou resolver este chamado.
        </Alert>
      )}

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
            <button 
              onClick={handleAddComment}
              disabled={isUpdating || !comment.trim()}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Enviando...' : 'Adicionar Comentário'}
            </button>
          </CardFooter>
        </Card>
      )}

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
      </Alert>
    </div>
  );
}