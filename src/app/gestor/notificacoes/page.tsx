// src/app/gestor/notificacoes/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
const getNotificationType = (message: string): 'status_change' | 'comment' | 'assignment' | 'new_ticket' | 'report' | 'system' => {
  if (message.includes('novo chamado') || message.includes('ALTA prioridade')) {
    return 'new_ticket';
  } else if (message.includes('atribuído') || message.includes('assumiu')) {
    return 'assignment';
  } else if (message.includes('atualizado para') || message.includes('status')) {
    return 'status_change';
  } else if (message.includes('comentou') || message.includes('comentário')) {
    return 'comment';
  } else if (message.includes('relatório') || message.includes('estatística') || message.includes('SLA')) {
    return 'report';
  } else {
    return 'system';
  }
};

export default function GestorNotificacoesPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
        setNotifications(data);
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
      case 'report':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
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

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notificações</h2>
          <p className="text-slate-600 mt-1">Acompanhe as atividades do sistema e métricas importantes.</p>
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
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
              <Card key={notification.id} className={notification.lida ? 'bg-white' : 'bg-purple-50 border-purple-200'}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {getNotificationIcon(notificationType)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-slate-900">
                          {notificationType === 'status_change' && 'Alteração de Status'}
                          {notificationType === 'comment' && 'Novo Comentário'}
                          {notificationType === 'assignment' && 'Chamado Atribuído'}
                          {notificationType === 'new_ticket' && 'Novo Chamado'}
                          {notificationType === 'report' && 'Relatório/Métrica'}
                          {notificationType === 'system' && 'Notificação do Sistema'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{formatDate(notification.criadaEm)}</span>
                          {!notification.lida && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 px-2 text-xs"
                            >
                              Marcar como lida
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{notification.mensagem}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Alert variant="info" title="Configurações de notificações">
        Como gestor, você receberá notificações sobre todos os chamados novos, mudanças de status, atribuições a técnicos e relatórios de desempenho. Você pode personalizar suas preferências de notificação na página do seu perfil.
      </Alert>
    </div>
  );
}