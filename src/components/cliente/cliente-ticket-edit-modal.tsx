// src/components/cliente/cliente-ticket-edit-modal.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { FormField } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

interface TicketEditModalProps {
  ticketId: number;
  currentData: {
    titulo: string;
    descricao: string;
    categoriaId: number;
    departamentoId: number;
    prioridade: string;
  };
  onClose: () => void;
  onSave: () => void;
}

export default function TicketEditModal({
  ticketId,
  currentData,
  onClose,
  onSave
}: TicketEditModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState(currentData);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  
  // Adicionar constante para o limite máximo de caracteres
  const DESCRICAO_MAX_LENGTH = 500;

  // Carregar categorias e departamentos quando o modal abrir
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      
      setIsLoadingData(true);
      try {
        // Carregar categorias e departamentos em paralelo
        const [categoriasData, departamentosData] = await Promise.all([
          api.categories.list(token),
          api.departments.list(token)
        ]);
        
        // Filtrar apenas itens ativos
        setCategorias(categoriasData.filter((cat: any) => cat.ativo));
        setDepartamentos(departamentosData.filter((dep: any) => dep.ativo));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar categorias e departamentos. Tente novamente mais tarde.');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [token]);

  // Atualizar formData quando currentData mudar
  useEffect(() => {
    setFormData(currentData);
  }, [currentData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Se for o campo de descrição, verificar o limite
    if (name === 'descricao' && value.length > DESCRICAO_MAX_LENGTH) {
      return; // Não atualiza se exceder o limite
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoriaId' || name === 'departamentoId' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      await api.tickets.updateTicket(ticketId, formData, token);
      onSave();
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
      setError('Ocorreu um erro ao atualizar o chamado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Editar Chamado #{ticketId}</h2>

        {error && (
          <Alert
            variant="destructive"
            title="Erro"
            onClose={() => setError('')}
            className="mb-4"
          >
            {error}
          </Alert>
        )}

        {isLoadingData ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando dados...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField id="titulo" label="Título">
              <input
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="flex w-full rounded-md border border-slate-300 bg-transparent p-2 text-sm"
                required
              />
            </FormField>

            <FormField id="categoriaId" label="Categoria">
              <select
                id="categoriaId"
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                className="flex w-full rounded-md border border-slate-300 bg-transparent p-2 text-sm"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </FormField>

            <FormField id="departamentoId" label="Departamento">
              <select
                id="departamentoId"
                name="departamentoId"
                value={formData.departamentoId}
                onChange={handleChange}
                className="flex w-full rounded-md border border-slate-300 bg-transparent p-2 text-sm"
                required
              >
                <option value="">Selecione um departamento</option>
                {departamentos.map(dep => (
                  <option key={dep.id} value={dep.id}>{dep.nome}</option>
                ))}
              </select>
            </FormField>

            <FormField id="prioridade" label="Prioridade">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="prioridade"
                    value="BAIXA"
                    checked={formData.prioridade === 'BAIXA'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Baixa</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="prioridade"
                    value="MEDIA"
                    checked={formData.prioridade === 'MEDIA'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Média</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="prioridade"
                    value="ALTA"
                    checked={formData.prioridade === 'ALTA'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Alta</span>
                </label>
              </div>
            </FormField>

            <FormField id="descricao" label="Descrição">
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="flex w-full rounded-md border border-slate-300 bg-transparent p-2 text-sm min-h-[150px]"
                maxLength={DESCRICAO_MAX_LENGTH}
                required
              />
              {/* Contador de caracteres */}
              <div className={`text-xs mt-1 text-right ${
                formData.descricao.length > DESCRICAO_MAX_LENGTH * 0.9 ? 'text-orange-500' :
                formData.descricao.length > DESCRICAO_MAX_LENGTH * 0.8 ? 'text-yellow-500' : 'text-slate-500'
              }`}>
                {formData.descricao.length}/{DESCRICAO_MAX_LENGTH} caracteres
              </div>
            </FormField>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}