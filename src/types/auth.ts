// src/types/auth.ts

// Tipos de requisição
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

// Tipos de resposta
export interface LoginResponse {
  token: string;
}

// Tipos de estado
export interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UserData {
  email: string;
  tipo: 'CLIENTE' | 'TECNICO';
  nome: string;
}

// Erro de API
export interface ApiError {
  message: string;
  status: number;
}