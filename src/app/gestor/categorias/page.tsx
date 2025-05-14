// src/app/gestor/categorias/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';

// Interface para a categoria
interface Category {
  id?: number;
  nome: string;
  ativo?: boolean;
}

export default function GestorCategoriasPage() {
  // Estado para a lista de categorias
  const [categorias, setCategorias] = useState<Category[]>([]);
  
  // Estado para o formulário de nova categoria
  const [novaCategoria, setNovaCategoria] = useState<Category>({
    nome: '',
  });
  
  // Estado para a categoria sendo editada
  const [editando, setEditando] = useState<Category | null>(null);
  
  // Estados para feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carregar categorias ao montar o componente
  useEffect(() => {
    carregarCategorias();
  }, []);

  // Função para carregar categorias da API
  const carregarCategorias = async () => {
    try {
      setIsLoading(true);
      
      // Obter o token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }
      
      console.log('Buscando categorias do backend...');
      const data = await api.categories.list(token);
      console.log('Categorias recebidas:', data);
      
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setError('Erro ao carregar categorias. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para adicionar categoria
  const adicionarCategoria = async () => {
    try {
      if (!novaCategoria.nome.trim()) {
        setError('O nome da categoria é obrigatório');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Obter o token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }
      
      console.log('Enviando nova categoria para o backend:', novaCategoria);
      const categoryRequest = {
        nome: novaCategoria.nome,
        ativo: true
      };
      
      const created = await api.categories.create(categoryRequest, token);
      console.log('Categoria criada com sucesso:', created);
      
      // Atualizar a lista de categorias
      setCategorias(prev => [...prev, created]);
      setNovaCategoria({ nome: '' });
      setSuccessMessage('Categoria criada com sucesso!');
      
      // Recarregar a lista para garantir dados atualizados
      carregarCategorias();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      setError('Erro ao criar categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar categoria
  const atualizarCategoria = async () => {
    try {
      if (!editando || !editando.nome.trim()) {
        setError('O nome da categoria é obrigatório');
        return;
      }
      
      if (!editando.id) {
        setError('ID da categoria não encontrado');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Obter o token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }
      
      console.log('Atualizando categoria:', editando);
      const categoryRequest = {
        nome: editando.nome,
        ativo: editando.ativo
      };
      
      const updated = await api.categories.update(editando.id, categoryRequest, token);
      console.log('Categoria atualizada com sucesso:', updated);
      
      // Atualizar a lista de categorias
      setCategorias(prev => prev.map(cat => cat.id === editando.id ? updated : cat));
      setEditando(null);
      setSuccessMessage('Categoria atualizada com sucesso!');
      
      // Recarregar a lista para garantir dados atualizados
      carregarCategorias();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      setError('Erro ao atualizar categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alternar status da categoria
  const alternarStatus = async (categoria: Category) => {
    try {
      if (!categoria.id) {
        setError('ID da categoria não encontrado');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Obter o token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }
      
      // Inverter o status atual
      const novoStatus = !categoria.ativo;
      
      console.log(`${novoStatus ? 'Ativando' : 'Desativando'} categoria:`, categoria);
      
      // Prepare update data
      const categoryRequest = {
        nome: categoria.nome,
        ativo: novoStatus
      };
      
      await api.categories.update(categoria.id, categoryRequest, token);
      console.log(`Categoria ${novoStatus ? 'ativada' : 'desativada'} com sucesso`);
      
      // Atualizar a lista de categorias
      setCategorias(prev => prev.map(cat => 
        cat.id === categoria.id ? { ...cat, ativo: novoStatus } : cat
      ));
      
      setSuccessMessage(`Categoria ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`);
      
      // Recarregar a lista para garantir dados atualizados
      carregarCategorias();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao atualizar status da categoria:', error);
      setError('Erro ao atualizar status da categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para cancelar edição
  const cancelarEdicao = () => {
    setEditando(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Categorias</h2>
        <p className="text-slate-600 mt-1">Crie e gerencie categorias para os chamados de suporte.</p>
      </div>
      
      {/* Mensagens de feedback */}
      {error && (
        <Alert 
          variant="destructive" 
          title="Erro"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert 
          variant="success" 
          title="Sucesso"
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      
      {/* Formulário para adicionar/editar categoria */}
      <Card>
        <CardHeader>
          <CardTitle>{editando ? 'Editar Categoria' : 'Nova Categoria'}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            id="nome"
            label="Nome da Categoria"
            error={error && (!editando ? !novaCategoria.nome.trim() : !editando.nome.trim()) ? 'O nome é obrigatório' : ''}
          >
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: Hardware"
              value={editando ? editando.nome : novaCategoria.nome}
              onChange={(e) => {
                if (editando) {
                  setEditando({ ...editando, nome: e.target.value });
                } else {
                  setNovaCategoria({ ...novaCategoria, nome: e.target.value });
                }
              }}
              error={error && (!editando ? !novaCategoria.nome.trim() : !editando.nome.trim()) ? true : false}
              autoFocus
            />
          </FormField>
          
          {editando && (
            <div className="flex items-center mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editando.ativo}
                  onChange={() => setEditando({ ...editando, ativo: !editando.ativo })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 relative"></div>
                <span className="ml-3 text-sm font-medium text-slate-700">
                  {editando.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </label>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {editando ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelarEdicao}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={atualizarCategoria}
                disabled={isLoading}
              >
                {isLoading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </>
          ) : (
            <Button 
              type="button" 
              onClick={adicionarCategoria}
              disabled={isLoading}
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Categoria'}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Lista de categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !categorias.length ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-500">Carregando categorias...</p>
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500">Nenhuma categoria cadastrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorias.map((categoria) => (
                <div 
                  key={categoria.id}
                  className="p-4 border rounded-md flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{categoria.nome}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      categoria.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {categoria.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditando(categoria)}
                    >
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant={categoria.ativo ? "destructive" : "default"}
                      onClick={() => alternarStatus(categoria)}
                    >
                      {categoria.ativo ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}