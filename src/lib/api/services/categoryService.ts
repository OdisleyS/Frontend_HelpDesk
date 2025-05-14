// src/lib/services/categoryService.ts

import { api } from '@/lib/api';

export interface Category {
  id?: number;
  nome: string;
  ativo?: boolean;
}

export const categoryService = {
  // Listar todas as categorias
  list: async (): Promise<Category[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    return api.categories.list(token);
  },
  
  // Criar uma nova categoria
  create: async (category: Category): Promise<Category> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    return api.categories.create(category, token);
  },
  
  // Atualizar uma categoria existente
  update: async (id: number, category: Category): Promise<Category> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    return api.categories.update(id, category, token);
  },
};