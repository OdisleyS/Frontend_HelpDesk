// src/app/gestor/departamentos/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';

// Interface para o departamento
interface Department {
  id?: number;
  nome: string;
  ativo?: boolean;
}

// Interface para a requisição ao atualizar/criar departamento
interface DepartmentRequest {
  nome: string;
  ativo: boolean;
}

export default function GestorDepartamentosPage() {
  // Estado para a lista de departamentos
  const [departamentos, setDepartamentos] = useState<Department[]>([]);

  // Estado para o formulário de novo departamento
  const [novoDepartamento, setNovoDepartamento] = useState<Department>({
    nome: '',
  });

  // Estado para o departamento sendo editado
  const [editando, setEditando] = useState<Department | null>(null);

  // Estados para feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  //Estado para para rastrear ordem original dos departamentos
  const [departamentoIdsOrdenados, setDepartamentoIdsOrdenados] = useState<number[]>([]);

  // Carregar departamentos ao montar o componente
  useEffect(() => {
    carregarDepartamentos();
  }, []);

  // Função para carregar departamentos da API
  const carregarDepartamentos = async () => {
    try {
      setIsLoading(true);

      // Obter o token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }

      console.log('Buscando departamentos do backend...');
      const data = await api.departments.list(token);
      console.log('Departamentos recebidos:', data);

      setDepartamentos(data);

      // Armazenar a ordem dos IDs (apenas se ainda não estiver definido ou se houver novos itens)
      if (departamentoIdsOrdenados.length === 0 || data.length !== departamentoIdsOrdenados.length) {
        setDepartamentoIdsOrdenados(data.map((dep: Department) => dep.id || 0));
      }
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      setError('Erro ao carregar departamentos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para adicionar departamento
  const adicionarDepartamento = async () => {
    try {
      if (!novoDepartamento.nome.trim()) {
        setError('O nome do departamento é obrigatório');
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

      console.log('Enviando novo departamento para o backend:', novoDepartamento);
      const departmentRequest = {
        nome: novoDepartamento.nome,
        ativo: true
      };

      const created = await api.departments.create(departmentRequest, token);
      console.log('Departamento criado com sucesso:', created);

      // Atualizar a lista de departamentos
      setDepartamentos(prev => [...prev, created]);

      // Adicionar o novo ID à ordem
      setDepartamentoIdsOrdenados(prev => [...prev, created.id]);

      setNovoDepartamento({ nome: '' });
      setSuccessMessage('Departamento criado com sucesso!');

      // Não recarregar completo para evitar reordenação
      // carregarDepartamentos(); <- Remover ou comentar esta linha

    } catch (error) {
      console.error('Erro ao criar departamento:', error);
      setError('Erro ao criar departamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar departamento
  const atualizarDepartamento = async () => {
    try {
      if (!editando || !editando.nome.trim()) {
        setError('O nome do departamento é obrigatório');
        return;
      }

      if (!editando.id) {
        setError('ID do departamento não encontrado');
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

      console.log('Atualizando departamento:', editando);

      const departmentRequest = {
        nome: editando.nome,
        ativo: editando.ativo !== undefined ? editando.ativo : true
      };

      const updated = await api.departments.update(editando.id, departmentRequest, token);
      console.log('Departamento atualizado com sucesso:', updated);

      // Atualizar a lista de departamentos mantendo a ordem
      setDepartamentos(prev => prev.map(d =>
        d.id === editando.id ? updated : d
      ));

      setEditando(null);
      setSuccessMessage('Departamento atualizado com sucesso!');

      // Não recarregar a lista completa para manter a ordem
      // carregarDepartamentos(); <- Remover ou comentar esta linha

    } catch (error) {
      console.error('Erro ao atualizar departamento:', error);
      setError('Erro ao atualizar departamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alternar status do departamento
  const alternarStatus = async (departamento: Department) => {
    try {
      if (!departamento.id) {
        setError('ID do departamento não encontrado');
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
      const novoStatus = !departamento.ativo;

      console.log(`${novoStatus ? 'Ativando' : 'Desativando'} departamento:`, departamento);

      // Prepare update data
      const departmentRequest = {
        nome: departamento.nome,
        ativo: novoStatus
      };

      await api.departments.update(departamento.id, departmentRequest, token);
      console.log(`Departamento ${novoStatus ? 'ativado' : 'desativado'} com sucesso`);

      // Atualizar apenas o item específico na lista atual, sem reordenar
      setDepartamentos(prev => prev.map(dep =>
        dep.id === departamento.id ? { ...dep, ativo: novoStatus } : dep
      ));

      setSuccessMessage(`Departamento ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);

      // Não recarregar a lista completa para evitar reordenação
      // carregarDepartamentos(); <- Remover ou comentar esta linha

    } catch (error) {
      console.error('Erro ao atualizar status do departamento:', error);
      setError('Erro ao atualizar status do departamento. Tente novamente.');
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
        <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Departamentos</h2>
        <p className="text-slate-600 mt-1">Crie e gerencie departamentos do sistema.</p>
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

      {/* Formulário para adicionar/editar departamento */}
      <Card>
        <CardHeader>
          <CardTitle>{editando ? 'Editar Departamento' : 'Novo Departamento'}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            id="nome"
            label="Nome do Departamento"
            error={error && (!editando ? !novoDepartamento.nome.trim() : !editando.nome.trim()) ? 'O nome é obrigatório' : ''}
          >
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: Suporte Técnico"
              value={editando ? editando.nome : novoDepartamento.nome}
              onChange={(e) => {
                if (editando) {
                  setEditando({ ...editando, nome: e.target.value });
                } else {
                  setNovoDepartamento({ ...novoDepartamento, nome: e.target.value });
                }
              }}
              error={error && (!editando ? !novoDepartamento.nome.trim() : !editando.nome.trim()) ? true : false}
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
                onClick={atualizarDepartamento}
                disabled={isLoading}
              >
                {isLoading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={adicionarDepartamento}
              disabled={isLoading}
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Departamento'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Lista de departamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Departamentos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !departamentos.length ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-500">Carregando departamentos...</p>
            </div>
          ) : departamentos.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500">Nenhum departamento cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Use a ordem dos IDs para mapear os departamentos */}
              {departamentoIdsOrdenados.map(id => {
                // Encontrar o departamento correspondente ao ID
                const departamento = departamentos.find(dep => dep.id === id);

                // Se o departamento não existir (caso raro), pular
                if (!departamento) return null;

                return (
                  <div
                    key={departamento.id}
                    className="p-4 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{departamento.nome}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${departamento.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {departamento.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditando(departamento)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={departamento.ativo ? "destructive" : "default"}
                        onClick={() => alternarStatus(departamento)}
                      >
                        {departamento.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}