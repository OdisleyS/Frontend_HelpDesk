// src/lib/api.ts

// Configuração base da API
const API_BASE_URL =  process.env.NEXT_PUBLIC_API_URL;

// Interface para tratamento de erros
export interface ApiError {
  message: string;
  status: number;
}

// Função utilitária para fazer requisições HTTP
const fetchWithAuth = async (url: string, options: RequestInit = {}, token?: string) => {
  // Adicionar token de autenticação aos headers, se fornecido
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  try {
    // Log para debugging
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      credentials: 'include',
    });
    
    // Log para debugging
    console.log('Response status:', response.status);

    // Verificar se a resposta não é bem-sucedida
    if (!response.ok) {
      let errorMessage = 'Ocorreu um erro ao processar a requisição.';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('API Error Data:', errorData);
      } catch (e) {
        console.error('Não foi possível parsear o corpo da resposta de erro:', e);
      }
      
      throw {
        message: errorMessage,
        status: response.status
      };
    }

    // Verificar se a resposta tem conteúdo
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('API Response Data:', data);
      return data;
    }
    
    return await response.text();
  } catch (error) {
    console.error('API Error:', error);
    
    if ((error as ApiError).status) {
      throw error;
    }
    
    throw {
      message: 'Erro de conexão com o servidor. Verifique sua conexão de internet.',
      status: 0
    };
  }
};

// API para autenticação
const auth = {
  // Login
  login: async (data: { email: string; senha: string }) => {
    return await fetchWithAuth('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
  
  // Registro
  register: async (data: { email: string; senha: string }) => {
    return await fetchWithAuth('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
  
  // Verificação de código
  verifyCode: async (data: { email: string; codigo: string }) => {
    return await fetchWithAuth('/auth/verify-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
};

// API para categorias
const categories = {
  // Listar todas as categorias
  list: async (token: string) => {
    return await fetchWithAuth('/api/v1/categories', {}, token);
  },
  
  // Criar categoria
  create: async (data: { nome: string; ativo: boolean }, token: string) => {
    return await fetchWithAuth('/api/v1/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, token);
  },
  
  // Atualizar categoria
  update: async (id: number, data: { nome: string; ativo: boolean }, token: string) => {
    return await fetchWithAuth(`/api/v1/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, token);
  }
};

// API para departamentos
const departments = {
  // Listar todos os departamentos
  list: async (token: string) => {
    return await fetchWithAuth('/api/v1/departamentos', {}, token);
  },
  
  // Criar departamento
  create: async (data: { nome: string; ativo: boolean }, token: string) => {
    return await fetchWithAuth('/api/v1/departamentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, token);
  },
  
  // Atualizar departamento
  update: async (id: number, data: { nome: string; ativo: boolean }, token: string) => {
    return await fetchWithAuth(`/api/v1/departamentos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, token);
  }
};

// API para usuários
const users = {
  // Listar todos os usuários (paginados)
  list: async (token: string) => {
    return await fetchWithAuth('/api/v1/admin/users', {}, token);
  },
  
  // Criar usuário
  create: async (data: { nome: string; email: string; senha: string; tipo: string }, token: string) => {
    return await fetchWithAuth('/api/v1/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, token);
  },
  
  // Atualizar status de usuário (ativar/desativar)
  updateStatus: async (id: number, ativo: boolean, token: string) => {
    return await fetchWithAuth(`/api/v1/admin/users/${id}/status?ativo=${ativo}`, {
      method: 'PUT',
    }, token);
  }
};

// API para tickets (chamados)
const tickets = {
  // Listar tickets por status
  listByStatus: async (status: string, token: string) => {
    return await fetchWithAuth(`/api/v1/tickets?status=${status}`, {}, token);
  },
  
  // Criar ticket
  create: async (data: { 
    titulo: string; 
    descricao: string; 
    categoriaId: number; 
    departamentoId: number; 
    prioridade: string 
  }, token: string) => {
    return await fetchWithAuth('/api/v1/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, token);
  },
  
  // Obter detalhes de um chamado específico
  getById: async (id: number, token: string) => {
    return await fetchWithAuth(`/api/v1/tickets/${id}`, {}, token);
  },
  
  // Obter histórico de um chamado
  getHistory: async (id: number, token: string) => {
    return await fetchWithAuth(`/api/v1/tickets/${id}/history`, {}, token);
  },
  
  // Atualizar status do ticket
  updateStatus: async (id: number, novoStatus: string, token: string) => {
    return await fetchWithAuth(`/api/v1/tickets/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ novoStatus }),
    }, token);
  },
  
  // Atribuir técnico ao ticket
  assignTecnico: async (id: number, token: string) => {
    return await fetchWithAuth(`/api/v1/tickets/${id}/assign`, {
      method: 'PUT',
    }, token);
  },
  
  // Resolver ticket
  resolveTicket: async (id: number, token: string) => {
    return await fetchWithAuth(`/api/v1/tickets/${id}/resolve`, {
      method: 'PUT',
    }, token);
  },
  
  // Mudar categoria do ticket
  changeCategory: async (id: number, novaCategoriaId: number, token: string) => {
    return await fetchWithAuth(`/api/v1/tickets/${id}/categoria?novaCategoriaId=${novaCategoriaId}`, {
      method: 'PUT',
    }, token);
  },
  
  // Cancelar ticket (chamado específico para o cliente)
  cancelTicket: async (id: number, token: string) => {
    return await fetchWithAuth(`/api/v1/tickets/${id}/cancel`, {
      method: 'PUT',
    }, token);
  }
};

// Exportar todas as APIs
export const api = {
  auth,
  categories,
  departments,
  users,
  tickets
};