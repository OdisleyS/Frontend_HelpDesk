// src/api/lib/services/departmentService.ts

import { api } from '@/lib/api';

export interface Department {
  id?: number;
  nome: string;
  ativo?: boolean;
}

export const departmentService = {
  // Listar todos os departamentos
  list: async (): Promise<Department[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    return api.departments.list(token);
  },
  
  // Criar um novo departamento
  create: async (department: Department): Promise<Department> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    return api.departments.create(department, token);
  },
  
  // Atualizar um departamento existente
  update: async (id: number, department: Department): Promise<Department> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    return api.departments.update(id, department, token);
  },
};