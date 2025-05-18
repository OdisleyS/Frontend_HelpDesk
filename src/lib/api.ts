// src/lib/api.ts

// Cache de estatísticas para reduzir chamadas ao servidor
interface StatsCache {
  dashboardStats: any | null;
  resolutionTime: any[] | null;
  technicianPerformance: any[] | null;
  categoryDistribution: any[] | null;
  lastUpdated: number | null;
  ttl: number; // Time to live em millisegundos
}

const statsCache: StatsCache = {
  dashboardStats: null,
  resolutionTime: null,
  technicianPerformance: null,
  categoryDistribution: null,
  lastUpdated: null,
  ttl: 2 * 60 * 1000 // 2 minutos em millisegundos
};

// Função para verificar se o cache é válido
const isCacheValid = (): boolean => {
  if (!statsCache.lastUpdated) return false;
  
  const now = Date.now();
  return (now - statsCache.lastUpdated) < statsCache.ttl;
};

// Função para invalidar o cache (útil quando o usuário faz alguma ação que altera os dados)
const invalidateCache = (): void => {
  statsCache.lastUpdated = null;
};

// Vamos ampliar a API para incluir as funções necessárias para técnicos
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Tipos de requisição para autenticação
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  email: string;
  senha: string;
}

export interface VerifyRequest {
  email: string;
  codigo: string;
}

// Tipos para as estatísticas
export interface EstatisticaItemDTO {
  nome: string;
  valor: number;
}

export interface DesempenhoTecnicoDTO {
  nome: string;
  atribuídos: number;
  resolvidos: number;
  taxaResolucao: string;
  mediaHoras: number;
  classificacao: string;
}

interface User {
  id: number;
  nome: string;
  email: string;
  tipo: string;
  ativo: boolean;
}

// Funções de autenticação
const auth = {
  login: async (data: LoginRequest): Promise<{ token: string }> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        message: error.message || 'Falha no login',
        status: response.status,
      };
    }

    return response.json();
  },

  register: async (data: RegisterRequest): Promise<string> => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        message: error.message || 'Falha no registro',
        status: response.status,
      };
    }

    return response.text();
  },

  verifyCode: async (data: VerifyRequest): Promise<string> => {
    const response = await fetch(`${BASE_URL}/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        message: error.message || 'Falha na verificação',
        status: response.status,
      };
    }

    return response.text();
  },
};

// Funções de categorias
const categories = {
  list: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao listar categorias');
    }

    return response.json();
  },

  create: async (data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar categoria');
    }

    // Invalidar cache de estatísticas após criar categoria
    invalidateCache();
    
    return response.json();
  },

  update: async (id: number, data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar categoria');
    }

    // Invalidar cache de estatísticas após atualizar categoria
    invalidateCache();
    
    return response.json();
  },
};

// Funções de departamentos
const departments = {
  list: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/departamentos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao listar departamentos');
    }

    return response.json();
  },

  create: async (data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/departamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar departamento');
    }

    return response.json();
  },

  update: async (id: number, data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/departamentos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar departamento');
    }

    return response.json();
  },
};

// Funções de tickets (chamados)
const tickets = {
  listByStatus: async (status: string, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/tickets?status=${status}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao listar chamados com status ${status}`);
    }

    return response.json();
  },

  getById: async (id: number, token: string): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar detalhes do chamado');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar detalhes do chamado:', error);
      throw error;
    }
  },

  getHistory: async (id: number, token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Se receber um erro 403, significa que o usuário não tem permissão
        if (response.status === 403) {
          return []; // Retorna array vazio em vez de lançar erro
        }
        throw new Error(`Falha ao obter histórico do chamado #${id}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar histórico do chamado:', error);
      return []; // Retorna array vazio em caso de erro
    }
  },

  create: async (data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar chamado');
    }

    // Invalidar cache de estatísticas após criar chamado
    invalidateCache();
    
    return response.json();
  },

  updateStatus: async (id: number, status: string, token: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ novoStatus: status })
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status do chamado');
      }
      
      // Invalidar cache de estatísticas após atualizar status
      invalidateCache();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  assignTecnico: async (id: number, token: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message ||
          (response.status === 400
            ? 'Este chamado não pode ser assumido no momento.'
            : 'Não foi possível assumir o chamado.');

        throw new Error(message);
      }
      
      // Invalidar cache de estatísticas após atribuir técnico
      invalidateCache();
    } catch (error) {
      console.error('Erro ao assumir chamado:', error);
      throw error;
    }
  },

  // Nova função para atualizar prioridade
  updatePriority: async (id: number, priority: string, comment: string, token: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/prioridade?novaPrioridade=${priority}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao atualizar prioridade do chamado');
      }
      
      // Invalidar cache de estatísticas após atualizar prioridade
      invalidateCache();
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
      throw error;
    }
  },

  resolveTicket: async (id: number, token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Falha ao resolver chamado #${id}`);
      }

      // Invalidar cache de estatísticas após resolver chamado
      invalidateCache();
      
      // Não tentar fazer .json() se não houver corpo na resposta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return null;
    } catch (error) {
      console.error('Erro ao resolver chamado:', error);
      throw error;
    }
  },

  cancelTicket: async (id: number, token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Falha ao cancelar chamado #${id}`);
      }

      // Invalidar cache de estatísticas após cancelar chamado
      invalidateCache();
      
      // Não tentar fazer .json() se não houver corpo na resposta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return null;
    } catch (error) {
      console.error('Erro ao cancelar chamado:', error);
      throw error;
    }
  },

  getMyTickets: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/my-tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar seus chamados.');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar chamados do técnico:', error);
      throw error;
    }
  },

  addComment: async (id: number, comment: string, token: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment }) // Certifique-se de que o nome do campo está correto
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao adicionar comentário');
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  },

  // Get SLA compliance percentage
  getSlaConformidade: async (token: string): Promise<number> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/sla/conformidade`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao obter conformidade de SLA');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter conformidade de SLA:', error);
      throw error;
    }
  },

  // Get average resolution time per category
  getTempoMedioPorCategoria: async (token: string): Promise<EstatisticaItemDTO[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/tempo-medio/categoria`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao obter tempo médio por categoria');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter tempo médio por categoria:', error);
      throw error;
    }
  },

  // Get technician performance metrics
  getDesempenhoTecnicos: async (token: string): Promise<DesempenhoTecnicoDTO[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/estatisticas/desempenho-tecnicos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao obter desempenho dos técnicos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter desempenho dos técnicos:', error);
      throw error;
    }
  }
};

// Para estatísticas
const statistics = {
  // Obter dados completos do dashboard com cache
  getDashboardStats: async (token: string) => {
    try {
      // Verificar se o cache é válido
      if (isCacheValid() && statsCache.dashboardStats) {
        console.log('Usando cache para dashboard stats');
        return statsCache.dashboardStats;
      }
      
      const response = await fetch(`${BASE_URL}/api/v1/statistics/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar estatísticas do dashboard');
      }

      const data = await response.json();
      
      // Atualizar o cache
      statsCache.dashboardStats = data;
      statsCache.lastUpdated = Date.now();
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      throw error;
    }
  },

  // Obter distribuição por categoria com cache
  getCategoryDistribution: async (token: string) => {
    try {
      // Verificar se o cache é válido
      if (isCacheValid() && statsCache.categoryDistribution) {
        console.log('Usando cache para category distribution');
        return statsCache.categoryDistribution;
      }
      
      const response = await fetch(`${BASE_URL}/api/v1/statistics/category-distribution`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar distribuição de categorias');
      }

      const data = await response.json();
      
      // Atualizar o cache
      statsCache.categoryDistribution = data;
      if (!statsCache.lastUpdated) statsCache.lastUpdated = Date.now();
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar distribuição de categorias:', error);
      throw error;
    }
  },

  // Obter contagem de tickets
  getTicketCounts: async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/statistics/ticket-counts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar contagem de tickets');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar contagem de tickets:', error);
      throw error;
    }
  },

  // Obter clientes ativos
  getActiveClients: async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/statistics/active-clients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar clientes ativos');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar clientes ativos:', error);
      throw error;
    }
  },

  // Obter conformidade com SLA
  getSlaCompliance: async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/statistics/sla-compliance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar conformidade com SLA');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar conformidade com SLA:', error);
      throw error;
    }
  },

  // Obter tempo médio de resolução por categoria com cache
  getResolutionTime: async (token: string) => {
    try {
      // Verificar se o cache é válido
      if (isCacheValid() && statsCache.resolutionTime) {
        console.log('Usando cache para resolution time');
        return statsCache.resolutionTime;
      }
      
      const response = await fetch(`${BASE_URL}/api/v1/statistics/resolution-time`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar tempo médio de resolução');
      }

      const data = await response.json();
      
      // Atualizar o cache
      statsCache.resolutionTime = data;
      if (!statsCache.lastUpdated) statsCache.lastUpdated = Date.now();
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar tempo médio de resolução:', error);
      throw error;
    }
  },

  // Obter desempenho dos técnicos com cache
  getTechnicianPerformance: async (token: string) => {
    try {
      // Verificar se o cache é válido
      if (isCacheValid() && statsCache.technicianPerformance) {
        console.log('Usando cache para technician performance');
        return statsCache.technicianPerformance;
      }
      
      const response = await fetch(`${BASE_URL}/api/v1/statistics/technician-performance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar desempenho dos técnicos');
      }

      const data = await response.json();
      
      // Atualizar o cache
      statsCache.technicianPerformance = data;
      if (!statsCache.lastUpdated) statsCache.lastUpdated = Date.now();
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar desempenho dos técnicos:', error);
      throw error;
    }
  },
  
  // Método para forçar a invalidação do cache
  invalidateStatsCache: () => {
    invalidateCache();
    console.log('Cache de estatísticas invalidado');
  }
};

// Funções de usuários
const users = {
  list: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao listar usuários');
    }

    return response.json();
  },

  create: async (data: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar usuário');
    }

    // Invalidar cache após criar usuário
    invalidateCache();
    
    return response.json();
  },

  updateStatus: async (id: number, ativo: boolean, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/admin/users/${id}/status?ativo=${ativo}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao atualizar status do usuário #${id}`);
    }

    // Invalidar cache após atualizar usuário
    invalidateCache();
    
    return response.json();
  },
};

// Funções de SLA
const sla = {
  // Salvar 1 item
  create: async (
    categoriaId: number,
    prioridade: 'BAIXA' | 'MEDIA' | 'ALTA',
    minutosResolucao: number,
    token: string
  ) => {
    const response = await fetch(`${BASE_URL}/api/v1/sla`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoriaId, prioridade, minutosResolucao }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao salvar SLA (cat: ${categoriaId}, prioridade: ${prioridade})`);
    }

    // Invalidar cache após criar SLA
    invalidateCache();
    
    return await response.json();
  },

  // Buscar todos os SLAs salvos
  listAll: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/sla`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar SLAs salvos');
    }

    return response.json(); // Array de { categoriaId, prioridade, minutosResolucao }
  },

  // Enviar todos de uma vez (POST /api/v1/sla/batch)
  batchSave: async (
    slas: {
      categoriaId: number;
      prioridade: 'BAIXA' | 'MEDIA' | 'ALTA';
      minutosResolucao: number;
    }[],
    token: string
  ) => {
    const response = await fetch(`${BASE_URL}/api/v1/sla/batch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slas }),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar SLAs em lote');
    }

    // Invalidar cache após criar SLAs em lote
    invalidateCache();
    
    return response.text();
  },
};

// Funções de notificações
const notifications = {
  list: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/notificacoes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao listar notificações');
    }

    return response.json();
  },

  markAsRead: async (id: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/notificacoes/${id}/lida`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao marcar notificação como lida');
    }

    return;
  },

  getPreferences: async (token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/usuarios/preferencias`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar preferências de notificação');
    }

    return response.json();
  },

  updatePreferences: async (prefs: any, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/usuarios/preferencias`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prefs),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar preferências de notificação');
    }

    return;
  },
};

export const api = {
  auth,
  categories,
  departments,
  tickets,
  users,
  sla,
  notifications,
  statistics,
};