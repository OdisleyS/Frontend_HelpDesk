// src/lib/services/userService.ts

import { api } from '@/lib/api';

export enum UserType {
  CLIENTE = 'CLIENTE',
  TECNICO = 'TECNICO',
  GESTOR = 'GESTOR'
}

export interface User {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  tipo: UserType;
  ativo?: boolean;
}

export interface UserPage {
  content: User[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const userService = {
  // Listar todos os usuários
  list: async (): Promise<UserPage> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    return api.users.list(token);
  },
  
  // Criar um novo usuário
  create: async (user: User): Promise<User> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    return api.users.create(user, token);
  },
  
  // Atualizar status de um usuário (ativar/desativar)
  updateStatus: async (id: number, active: boolean): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    await api.users.updateStatus(id, active, token);
  },
};