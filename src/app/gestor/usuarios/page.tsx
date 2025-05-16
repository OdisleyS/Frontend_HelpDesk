// src/app/gestor/usuarios/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';

// Enum para tipo de usuário
enum UserType {
  CLIENTE = 'CLIENTE',
  TECNICO = 'TECNICO',
  GESTOR = 'GESTOR'
}

// Interface para o usuário
interface User {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  tipo: UserType;
  ativo?: boolean;
}

export default function GestorUsuariosPage() {
  // Estado para a lista de usuários
  const [usuarios, setUsuarios] = useState<User[]>([]);
  
  // Estado para o formulário de novo usuário
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: UserType.TECNICO,
  });
  
  // Estados para filtro e paginação
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null);
  const [filtroBusca, setFiltroBusca] = useState('');
  
  // Estados para feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estados para validação
  const [formErrors, setFormErrors] = useState({
    nome: '',
    email: '',
    senha: '',
  });

  // Carregar usuários ao montar o componente
  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Função para carregar usuários da API
  const carregarUsuarios = async () => {
    try {
      setIsLoading(true);
      
      // Obter o token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }
      
      console.log('Buscando usuários do backend...');
      const data = await api.users.list(token);
      console.log('Usuários recebidos:', data);
      
      // O API geralmente retorna dados paginados
      setUsuarios(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para criar usuário
  const criarUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validação
    const errors = {
      nome: '',
      email: '',
      senha: '',
    };
    
    if (!novoUsuario.nome.trim()) {
      errors.nome = 'O nome é obrigatório';
    }
    
    if (!novoUsuario.email.trim()) {
      errors.email = 'O email é obrigatório';
    } else if (!novoUsuario.email.endsWith('@gmail.com')) {
      errors.email = 'O email deve ser um endereço Gmail';
    }
    
    if (!novoUsuario.senha.trim()) {
      errors.senha = 'A senha é obrigatória';
    } else if (novoUsuario.senha.length < 6) {
      errors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    setFormErrors(errors);
    
    // Se houver erros, não prosseguir
    if (Object.values(errors).some(error => error)) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Obter o token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Usuário não autenticado');
        setIsLoading(false);
        return;
      }
      
      console.log('Enviando novo usuário para o backend:', novoUsuario);
      const userData = {
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        senha: novoUsuario.senha,
        tipo: novoUsuario.tipo
      };
      
      const created = await api.users.create(userData, token);
      console.log('Usuário criado com sucesso:', created);
      
      // Atualizar a lista de usuários
      setUsuarios(prev => [...prev, created]);
      
      // Resetar formulário
      setNovoUsuario({
        nome: '',
        email: '',
        senha: '',
        tipo: UserType.TECNICO,
      });
      
      setSuccessMessage('Usuário criado com sucesso!');
      
      // Recarregar a lista para garantir dados atualizados
      carregarUsuarios();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setError('Erro ao criar usuário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alternar status do usuário
  const alternarStatus = async (usuario: User) => {
    try {
      if (!usuario.id) {
        setError('ID do usuário não encontrado');
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
      const novoStatus = !usuario.ativo;
      
      console.log(`${novoStatus ? 'Ativando' : 'Desativando'} usuário:`, usuario);
      await api.users.updateStatus(usuario.id, novoStatus, token);
      console.log(`Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso`);
      
      // Atualizar a lista de usuários
      setUsuarios(prev => prev.map(u => 
        u.id === usuario.id ? { ...u, ativo: novoStatus } : u
      ));
      
      setSuccessMessage(`Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
      
      // Recarregar a lista para garantir dados atualizados
      carregarUsuarios();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      setError('Erro ao atualizar status do usuário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    // Filtro por tipo
    if (filtroTipo !== 'TODOS' && usuario.tipo !== filtroTipo) {
      return false;
    }
    
    // Filtro por status
    if (filtroAtivo !== null && usuario.ativo !== filtroAtivo) {
      return false;
    }
    
    // Filtro por busca (nome ou email)
    if (filtroBusca && !usuario.nome.toLowerCase().includes(filtroBusca.toLowerCase()) && 
        !usuario.email.toLowerCase().includes(filtroBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Manipulador de entrada para o formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoUsuario({ ...novoUsuario, [name]: value });
    
    // Limpar erro do campo sendo editado
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Usuários</h2>
        <p className="text-slate-600 mt-1">Crie novos usuários técnicos e gerencie os usuários existentes.</p>
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
      
      {/* Formulário para criar usuário (principalmente técnicos) */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Usuário</CardTitle>
        </CardHeader>
        <form onSubmit={criarUsuario}>
          <CardContent className="space-y-4">
            <FormField
              id="nome"
              label="Nome"
              error={formErrors.nome}
            >
              <Input
                id="nome"
                name="nome"
                value={novoUsuario.nome}
                onChange={handleInputChange}
                placeholder="Nome completo"
                error={!!formErrors.nome}
              />
            </FormField>
            
            <FormField
              id="email"
              label="Email"
              error={formErrors.email}
            >
              <Input
                id="email"
                name="email"
                type="email"
                value={novoUsuario.email}
                onChange={handleInputChange}
                placeholder="email@gmail.com"
                error={!!formErrors.email}
              />
            </FormField>
            
            <FormField
              id="senha"
              label="Senha"
              error={formErrors.senha}
            >
              <Input
                id="senha"
                name="senha"
                type="password"
                value={novoUsuario.senha}
                onChange={handleInputChange}
                placeholder="Mínimo de 6 caracteres"
                error={!!formErrors.senha}
              />
            </FormField>
            
            <FormField
              id="tipo"
              label="Tipo de Usuário"
              error=""
            >
              <select
                id="tipo"
                name="tipo"
                value={novoUsuario.tipo}
                onChange={handleInputChange}
                className="flex w-full rounded-md border border-slate-300 bg-transparent p-2 text-sm"
              >
                <option value={UserType.TECNICO}>Técnico</option>
                <option value={UserType.GESTOR}>Gestor</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Nota: Usuários do tipo cliente são criados automaticamente ao se registrarem.
              </p>
            </FormField>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              fullWidth={true}
            >
              {isLoading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Buscar
              </label>
              <Input
                placeholder="Buscar por nome ou email"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="flex w-full rounded-md border border-slate-300 bg-transparent p-2 text-sm"
              >
                <option value="TODOS">Todos</option>
                <option value={UserType.CLIENTE}>Clientes</option>
                <option value={UserType.TECNICO}>Técnicos</option>
                <option value={UserType.GESTOR}>Gestores</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={filtroAtivo === null ? 'TODOS' : filtroAtivo ? 'ATIVO' : 'INATIVO'}
                onChange={(e) => {
                  if (e.target.value === 'TODOS') setFiltroAtivo(null);
                  else setFiltroAtivo(e.target.value === 'ATIVO');
                }}
                className="flex w-full rounded-md border border-slate-300 bg-transparent p-2 text-sm"
              >
                <option value="TODOS">Todos</option>
                <option value="ATIVO">Ativos</option>
                <option value="INATIVO">Inativos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({usuariosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !usuarios.length ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-500">Carregando usuários...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500">
                {usuarios.length === 0 
                  ? 'Nenhum usuário encontrado no sistema.' 
                  : 'Nenhum usuário corresponde aos filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{usuario.nome}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                        {usuario.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.tipo === UserType.GESTOR 
                            ? 'bg-purple-100 text-purple-800' 
                            : usuario.tipo === UserType.TECNICO 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {usuario.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant={usuario.ativo ? "destructive" : "default"}
                          size="sm"
                          onClick={() => alternarStatus(usuario)}
                          disabled={isLoading}
                        >
                          {usuario.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}