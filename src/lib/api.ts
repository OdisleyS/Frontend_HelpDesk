// src/lib/api.ts

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
    const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter histórico do chamado #${id}`);
    }

    return response.json();
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
    } catch (error) {
      console.error('Erro ao assumir chamado:', error);
      throw error; 
    }
  },

  resolveTicket: async (id: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/resolve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao resolver chamado #${id}`);
    }

    return response.json();
  },

  cancelTicket: async (id: number, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao cancelar chamado #${id}`);
    }

    return response.json();
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

  addComment: async (id: number, comment: string, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      throw new Error(`Falha ao adicionar comentário ao chamado #${id}`);
    }

    return response.json();
  },
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

    return response.json();
  },
};

export const api = {
  auth,
  categories,
  departments,
  tickets,
  users,
};
