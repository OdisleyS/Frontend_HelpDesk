// src/lib/api.ts

import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  VerifyRequest 
} from '@/types/auth';

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Cliente de API para comunicação com o backend
 */
class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Configuração básica para requisições
   */
  private async fetchJson<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se a resposta não for ok, lança um erro
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || 'Ocorreu um erro na requisição',
        status: response.status,
      };
    }

    // Se a resposta for 204 No Content, retorna null
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  }

  /**
   * Configura o token JWT para requisições autenticadas
   */
  private getAuthHeaders(token: string): HeadersInit {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * API de autenticação
   */
  auth = {
    /**
     * Realiza o login do usuário
     */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
      return this.fetchJson<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Registra um novo usuário
     */
    register: async (data: RegisterRequest): Promise<string> => {
      return this.fetchJson<string>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Verifica o código enviado por email
     */
    verifyCode: async (data: VerifyRequest): Promise<string> => {
      return this.fetchJson<string>('/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  /**
   * API protegida que requer autenticação
   */
  protected = {
    /**
     * Obtém os dados do usuário logado
     */
    getUserProfile: async (token: string) => {
      // Note: Precisamos implementar este endpoint no backend
      return this.fetchJson('/api/v1/user/profile', {
        headers: this.getAuthHeaders(token),
      });
    },
  };
}

// Exporta uma instância única do cliente de API
export const api = new ApiClient();