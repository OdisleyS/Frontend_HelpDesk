// src/lib/api.ts

import { LoginRequest, LoginResponse, RegisterRequest, VerifyRequest } from '@/types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL; // Ajuste para o URL do seu backend

export const api = {
  auth: {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw { message: error.message || 'Erro ao fazer login', status: response.status };
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
        throw { message: error.message || 'Erro ao registrar', status: response.status };
      }

      const result = await response.text();
      return result;
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
        throw { message: error.message || 'Código inválido ou expirado', status: response.status };
      }

      const result = await response.text();
      return result;
    },
  },
  
  tickets: {
    listByStatus: async (status: string, token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/tickets?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar chamados');
      }
      
      return response.json();
    },
    
    create: async (ticketData: any, token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticketData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao criar chamado');
      }
      
      return response.json();
    },
    
    updateStatus: async (id: number, newStatus: string, token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ novoStatus: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar status do chamado');
      }
      
      return true;
    }
  },

  categories: {
    list: async (token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar categorias');
      }
      
      return response.json();
    },
    
    create: async (categoryData: any, token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao criar categoria');
      }
      
      return response.json();
    },
    
    update: async (id: number, categoryData: any, token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar categoria');
      }
      
      return response.json();
    }
  },

  users: {
    list: async (token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar usuários');
      }
      
      return response.json();
    },
    
    create: async (userData: any, token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao criar usuário');
      }
      
      return response.json();
    },
    
    updateStatus: async (id: number, active: boolean, token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/admin/users/${id}/status?ativo=${active}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar status do usuário');
      }
      
      return true;
    }
  },
  
  // Novo serviço para departamentos
  departments: {
    list: async (token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/departamentos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar departamentos');
      }
      
      return response.json();
    },
    
    create: async (departmentData: any, token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/departamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(departmentData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao criar departamento');
      }
      
      return response.json();
    },
    
    update: async (id: number, departmentData: any, token: string) => {
      const response = await fetch(`${BASE_URL}/api/v1/departamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(departmentData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar departamento');
      }
      
      return response.json();
    }
  }
};