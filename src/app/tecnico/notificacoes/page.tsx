// src/app/tecnico/notificacoes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

interface Notification {
  id: number;
  mensagem: string;
  lida: boolean;
  criadaEm: string;
}

// Interface estendida com propriedades adicionais
interface ExtendedNotification extends Notification {
  isExpanded: boolean;
  chamadoId?: number; // ID do chamado relacionado à notificação, se houver
  tecnicoNome?: string; // Nome do técnico que assumiu o chamado, se houver
  statusNovo?: string; // Novo status do chamado, se houver
  tituloChamado?: string; // Título do chamado, se houver
  prioridade?: string; // Prioridade do chamado, se houver
}

// Função para formatar a data
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Função para determinar o tipo de notificação baseado no conteúdo
const getNotificationType = (message: string): 'status_change' | 'comment' | 'assignment' | 'new_ticket' | 'system' => {
  if (message.includes('novo chamado') || message.includes('ALTA prioridade')) {
    return 'new_ticket';
  } else if (message.includes('atribuído') || message.includes('assumiu')) {
    return 'assignment';
  } else if (message.includes('atualizado para') || message.includes('status')) {
    return 'status_change';
  } else if (message.includes('comentou') || message.includes('comentário')) {
    return 'comment';
  } else {
    return 'system';
  }
};

// Função para extrair o ID do chamado da mensagem, se presente
const extractTicketId = (message: string): number | undefined => {
  const matches = message.match(/#(\d+)/);
  if (matches && matches.length > 1) {
    return parseInt(matches[1], 10);
  }
  return undefined;
};

// Função para extrair o nome do técnico da mensagem, se presente
const extractTechnicianName = (message: string): string | undefined => {
  // Padrões comuns para menção de técnicos
  const patterns = [
    /técnico\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s+assumiu|\s+atribuiu|\s+foi designado|$)/i,
    /([A-Za-zÀ-ÖØ-öø-ÿ\s]+?)(?:\s+assumiu o chamado|\s+atribuiu|\s+foi designado|$)/i
  ];
  
  for (const pattern of patterns) {
    const matches = message.match(pattern);
    if (matches && matches.length > 1) {
      // Limpar o nome (remover espaços extras)
      return matches[1].trim();
    }
  }
  
  return undefined;
};

// Função para extrair o status atual ou novo status, se presente
const extractStatus = (message: string): string | undefined => {
  const statusPattern = /(?:atualizado para|alterado para|mudado para|status:)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s_]+)/i;
  const matches = message.match(statusPattern);
  
  if (matches && matches.length > 1) {
    return matches[1].trim();
  }
  return undefined;
};

// Função para extrair qualquer título mencionado no chamado
const extractTicketTitle = (message: string): string | undefined => {
  const titlePattern = /[Cc]hamado\s+(?:[^'"]*['""])?(["'])(.*?)\1/;
  const matches = message.match(titlePattern);
  
  if (matches && matches.length > 2) {
    return matches[2].trim();
  }
  return undefined;
};

// Função para extrair a prioridade, se mencionada
const extractPriority = (message: string): string | undefined => {
  const priorityPattern = /prioridade\s+([A-Za-zÀ-ÖØ-öø-ÿ]+)/i;
  const matches = message.match(priorityPattern);
  
  if (matches && matches.length > 1) {
    return matches[1].trim().toUpperCase();
  }
  return undefined;
};

export default function TecnicoNotificacoesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Carregar notificações
  useEffect(() => {
    const loadNotifications = async () => {
      if (!token) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const data = await api.notifications.list(token);
        // Transformar para ExtendedNotification e extrair o ID do chamado da mensagem
        const extendedData = data.map((notification: Notification) => ({
          ...notification,
          isExpanded: false,
          chamadoId: extractTicketId(notification.mensagem),
          tecnicoNome: extractTechnicianName(notification.mensagem),
          statusNovo: extractStatus(notification.mensagem),
          tituloChamado: extractTicketTitle(notification.mensagem),
          prioridade: extractPriority(notification.mensagem)
        }));
        setNotifications(extendedData);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        setError('Não foi possível carregar suas notificações. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotifications();
  }, [token]);
  
  // Função para marcar todas como lidas
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const promises = notifications.filter(n => !n.lida).map(n => 
        api.notifications.markAsRead(n.id, token)
      );
      
      await Promise.all(promises);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, lida: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
      setError('Não foi possível marcar as notificações como lidas. Tente novamente mais tarde.');
    }
  };
  
  // Função para marcar uma notificação como lida
  const markAsRead = async (id: number) => {
    if (!token) return;
    
    try {
      await api.notifications.markAsRead(id, token);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, lida: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      setError('Não foi possível marcar a notificação como lida. Tente novamente mais tarde.');
    }
  };

  // Função para alternar o estado de expansão de uma notificação
  const toggleExpand = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isExpanded: !notification.isExpanded } 
          : notification
      )
    );
  };
  
  // Função para navegar para o chamado relacionado
  const navigateToTicket = (chamadoId: number) => {
    router.push(`/tecnico/chamados/${chamadoId}`);
  };
  
  // Função para obter o ícone da notificação com base no tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'assignment':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        );
      case 'new_ticket':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  // Função para renderizar os detalhes da notificação expandida
  const renderExpandedDetails = (notification: ExtendedNotification) => {
    const type = getNotificationType(notification.mensagem);
    
    // Inicializamos com algumas informações básicas que serão exibidas em todos os tipos
    const commonDetails = (
      <>
        {notification.chamadoId && (
          <p className="text-sm text-slate-700">
            <span className="font-medium">Chamado:</span> #{notification.chamadoId}
          </p>
        )}
        {notification.tituloChamado && (
          <p className="text-sm text-slate-700">
            <span className="font-medium">Título:</span> {notification.tituloChamado}
          </p>
        )}
        {notification.prioridade && (
          <p className="text-sm text-slate-700">
            <span className="font-medium">Prioridade:</span> {notification.prioridade === 'ALTA' 
              ? <span className="text-red-600 font-medium">Alta</span> 
              : notification.prioridade === 'MEDIA' 
                ? <span className="text-yellow-600 font-medium">Média</span>
                : <span className="text-green-600 font-medium">Baixa</span>
            }
          </p>
        )}
      </>
    );
    
    return (
      <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-200">
        <h4 className="text-sm font-bold mb-3 text-slate-900">Detalhes da Notificação</h4>
        
        <div className="space-y-2">
          {/* Informações específicas com base no tipo de notificação */}
          {type === 'status_change' && (
            <>
              <p className="text-sm text-slate-700">
                <span className="font-medium">Tipo:</span> Alteração de Status
              </p>
              {commonDetails}
              {notification.statusNovo && (
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Novo Status:</span>{' '}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    notification.statusNovo.includes('RESOLV') 
                      ? 'bg-green-100 text-green-800' 
                      : notification.statusNovo.includes('ANÁLISE') || notification.statusNovo.includes('ANALISE')
                        ? 'bg-purple-100 text-purple-800'
                        : notification.statusNovo.includes('AGUARDANDO')
                          ? 'bg-orange-100 text-orange-800'
                          : notification.statusNovo.includes('ATENDIMENTO')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                  }`}>
                    {notification.statusNovo}
                  </span>
                </p>
              )}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Detalhes:</span> O status do chamado foi atualizado.{' '}
                  {notification.statusNovo?.includes('AGUARDANDO') 
                    ? 'É necessária uma ação da parte do cliente.'
                    : notification.statusNovo?.includes('RESOLV')
                      ? 'O chamado foi marcado como resolvido.'
                      : 'O chamado está em processamento.'}
                </p>
              </div>
            </>
          )}
          
          {type === 'comment' && (
            <>
              <p className="text-sm text-slate-700">
                <span className="font-medium">Tipo:</span> Comentário
              </p>
              {commonDetails}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Detalhes:</span> Um comentário foi adicionado ao chamado.
                </p>
              </div>
            </>
          )}
          
          {type === 'assignment' && (
            <>
              <p className="text-sm text-slate-700">
                <span className="font-medium">Tipo:</span> Atribuição de Chamado
              </p>
              {commonDetails}
              {notification.tecnicoNome && (
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Técnico Responsável:</span>{' '}
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {notification.tecnicoNome}
                  </span>
                </p>
              )}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Detalhes:</span> 
                  {notification.tecnicoNome 
                    ? ` O técnico ${notification.tecnicoNome} assumiu o chamado.` 
                    : ' O chamado foi atribuído a um técnico.'}
                </p>
              </div>
            </>
          )}
          
          {type === 'new_ticket' && (
            <>
              <p className="text-sm text-slate-700">
                <span className="font-medium">Tipo:</span> Novo Chamado
              </p>
              {commonDetails}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Detalhes:</span> Um novo chamado foi aberto
                  {notification.prioridade === 'ALTA' ? ' com prioridade alta.' : '.'}
                </p>
              </div>
            </>
          )}
          
          {type === 'system' && (
            <>
              <p className="text-sm text-slate-700">
                <span className="font-medium">Tipo:</span> Notificação do Sistema
              </p>
              {commonDetails}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Detalhes:</span> Esta é uma notificação informativa do sistema.
                </p>
              </div>
            </>
          )}
        </div>
        
        {/* Botões de ação */}
        <div className="mt-4 flex gap-2">
          {notification.chamadoId && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Evita que o clique se propague para o componente pai
                navigateToTicket(notification.chamadoId!);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Ver Chamado
            </Button>
          )}
          
          {!notification.lida && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Evita que o clique se propague
                markAsRead(notification.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Marcar como Lida
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notificações</h2>
          <p className="text-slate-600 mt-1">Acompanhe as atualizações dos chamados atribuídos a você.</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={notifications.length === 0 || notifications.every(n => n.lida)}
          >
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive" title="Erro">
          {error}
        </Alert>
      )}

      {/* Lista de notificações */}
      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <span className="ml-3">Carregando notificações...</span>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h3 className="text-lg font-medium text-slate-700 mt-4">Nenhuma notificação</h3>
            <p className="text-slate-500 mt-2">Você não tem notificações no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => {
            const notificationType = getNotificationType(notification.mensagem);
            return (
              <Card 
                key={notification.id} 
                className={`
                  ${notification.lida ? 'bg-white' : 'bg-blue-50 border-blue-200'} 
                  transition-all duration-200 hover:border-blue-300 cursor-pointer
                `}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4" onClick={() => toggleExpand(notification.id)}>
                    {getNotificationIcon(notificationType)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-slate-900">
                          {notificationType === 'status_change' && 'Alteração de Status'}
                          {notificationType === 'comment' && 'Novo Comentário'}
                          {notificationType === 'assignment' && 'Chamado Atribuído'}
                          {notificationType === 'new_ticket' && 'Novo Chamado'}
                          {notificationType === 'system' && 'Notificação do Sistema'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{formatDate(notification.criadaEm)}</span>
                          {!notification.lida && (
                            <div className="inline-block w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{notification.mensagem}</p>
                      
                      {/* Área expandida com detalhes da notificação */}
                      {notification.isExpanded && renderExpandedDetails(notification)}
                      
                      {/* Indicador de expansão */}
                      <div className="mt-2 text-xs text-blue-600 flex items-center">
                        {notification.isExpanded ? (
                          <span>Clique para recolher</span>
                        ) : (
                          <span>Clique para ver mais detalhes</span>
                        )}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ml-1 transition-transform ${
                            notification.isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Alert variant="info" title="Configurações de notificações">
        Como técnico, você receberá notificações sobre chamados atribuídos a você, novos chamados de alta prioridade e quando clientes responderem aos seus comentários. Você pode personalizar suas preferências de notificação na página do seu perfil.
      </Alert>
    </div>
  );
}