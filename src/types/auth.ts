// src/types/auth.ts

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

export interface LoginResponse {
  token: string;
}

export interface UserData {
  id?: number;
  email: string;
  nome?: string;
  tipo: 'CLIENTE' | 'TECNICO' | 'GESTOR'; // Tipos de usuário conforme enum do backend
}

export interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface UsersApi {
  list: (token: string) => Promise<any>;
  create: (data: any, token: string) => Promise<any>; 
  getProfile: (token: string) => Promise<any>;
  updateProfile: (data: any, token: string) => Promise<any>;
  
  // Novas funções:
  updateName: (nome: string, token: string) => Promise<any>;
  updatePassword: (senhaAtual: string, novaSenha: string, token: string) => Promise<any>;
  getName: (token: string) => Promise<string>;
}