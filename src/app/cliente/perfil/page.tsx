// src/app/cliente/perfil/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';

export default function PerfilPage() {
  const { user, token, updateUserName, updateUserPassword, error, clearError, successMessage, clearSuccess } = useAuth();
  
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  
  const [notificationPreferences, setNotificationPreferences] = useState({
    notificarAtualizacao: true,
    notificarFechamento: true,
    notificarPorEmail: true,
  });
  
  const [formErrors, setFormErrors] = useState({
    nome: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [prefsSuccessMessage, setPrefsSuccessMessage] = useState('');
  const [prefsErrorMessage, setPrefsErrorMessage] = useState('');

  // Carregar nome atualizado e preferências do usuário
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!token) return;
      
      try {
        // Carregar nome atualizado
        const nome = await api.users.getName(token);
        setFormData(prev => ({ ...prev, nome }));
        
        // Carregar preferências
        const prefs = await api.notifications.getPreferences(token);
        setNotificationPreferences(prefs);
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
      }
    };
    
    loadUserProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro ao editar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Limpar mensagem de erro quando o usuário começa a editar o formulário novamente
    if (errorMessage) setErrorMessage('');
    if (error) clearError();
    if (successMessage) clearSuccess();
  };

  const validateForm = () => {
    const errors = {
      nome: '',
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    };
    
    // Validações
    if (!formData.nome.trim()) {
      errors.nome = 'O nome é obrigatório';
    }
    
    // Validações de senha apenas se o usuário estiver tentando alterá-la
    if (formData.novaSenha || formData.confirmarSenha) {
      if (!formData.senhaAtual) {
        errors.senhaAtual = 'A senha atual é necessária para confirmar a alteração';
      }
      
      if (formData.novaSenha.length < 6) {
        errors.novaSenha = 'A nova senha deve ter pelo menos 6 caracteres';
      }
      
      if (formData.novaSenha !== formData.confirmarSenha) {
        errors.confirmarSenha = 'As senhas não coincidem';
      }
    }
    
    setFormErrors(errors);
    
    // Retorna true se não houver erros
    return !Object.values(errors).some(error => error);
  };

  // Método para atualizar o nome do cliente
  const updateName = async () => {
    if (!token || !formData.nome.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Chama a API para atualizar o nome
      await api.users.updateName(formData.nome, token);
      
      // Atualiza o estado local do usuário (se estiver usando o contexto de autenticação)
      if (updateUserName) {
        await updateUserName(formData.nome);
      }
    
    } catch (err) {
      const apiError = err as any;
      setErrorMessage(apiError.message || 'Falha ao atualizar o nome. Tente novamente.');
      console.error('Erro ao atualizar nome:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Atualizar nome (caso tenha mudado)
      if (formData.nome !== user?.nome) {
        await updateName();
      }
      
      // Atualizar senha (caso tenha sido preenchida)
      if (formData.novaSenha && formData.senhaAtual) {
        await updateUserPassword(formData.senhaAtual, formData.novaSenha);
      }
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      }));
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para lidar com mudanças nas preferências de notificação (com salvamento automático)
  const handlePreferenceChange = async (preference: string) => {
    if (!token) return;
    
    // Cria um novo objeto com a preferência atualizada
    const newPrefs = {
      ...notificationPreferences,
      [preference]: !notificationPreferences[preference as keyof typeof notificationPreferences],
    };
    
    // Atualiza o estado local imediatamente para feedback visual instantâneo
    setNotificationPreferences(newPrefs);
    
    // Mostra indicador visual sutil que está salvando
    setIsLoadingPrefs(true);
    
    try {
      // Envia para o servidor em background
      await api.notifications.updatePreferences(newPrefs, token);
      
      // Exibe mensagem de sucesso temporária
      setPrefsSuccessMessage('Preferência atualizada com sucesso!');
      setTimeout(() => setPrefsSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Erro ao atualizar preferência:', error);
      
      // Em caso de erro, reverte a alteração no estado local
      setNotificationPreferences({
        ...notificationPreferences,
        [preference]: notificationPreferences[preference as keyof typeof notificationPreferences],
      });
      
      // Exibe mensagem de erro
      setPrefsErrorMessage('Não foi possível atualizar a preferência. Tente novamente.');
      setTimeout(() => setPrefsErrorMessage(''), 3000);
    } finally {
      setIsLoadingPrefs(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Meu Perfil</h2>
        <p className="text-slate-600 mt-1">Gerencie suas informações pessoais e preferências.</p>
      </div>
      
      {/* Cartão de informações do usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert 
                variant="destructive" 
                title="Erro"
                onClose={() => setErrorMessage('')}
              >
                {errorMessage}
              </Alert>
            )}
            
            {error && (
              <Alert 
                variant="destructive" 
                title="Erro"
                onClose={clearError}
              >
                {error.message}
              </Alert>
            )}
            
            {successMessage && (
              <Alert 
                variant="success" 
                title="Sucesso"
                onClose={clearSuccess}
              >
                {successMessage}
              </Alert>
            )}
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                {formData.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{formData.nome || user?.email?.split('@')[0]}</h3>
                <p className="text-slate-500">{user?.email}</p>
                <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block mt-1">
                  {user?.tipo || 'Cliente'}
                </p>
              </div>
            </div>
            
            <FormField
              id="nome"
              label="Nome completo"
              error={formErrors.nome}
            >
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                error={!!formErrors.nome}
                autoFocus
              />
            </FormField>
            
            <FormField
              id="email"
              label="Email"
              error=""
            >
              <Input
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">O email não pode ser alterado.</p>
            </FormField>
            
            <div className="border-t border-slate-200 my-6 pt-6">
              <h4 className="font-medium mb-4">Alterar Senha</h4>
              
              <FormField
                id="senhaAtual"
                label="Senha atual"
                error={formErrors.senhaAtual}
              >
                <Input
                  id="senhaAtual"
                  name="senhaAtual"
                  type="password"
                  value={formData.senhaAtual}
                  onChange={handleChange}
                  error={!!formErrors.senhaAtual}
                />
              </FormField>
              
              <FormField
                id="novaSenha"
                label="Nova senha"
                error={formErrors.novaSenha}
              >
                <Input
                  id="novaSenha"
                  name="novaSenha"
                  type="password"
                  value={formData.novaSenha}
                  onChange={handleChange}
                  error={!!formErrors.novaSenha}
                />
              </FormField>
              
              <FormField
                id="confirmarSenha"
                label="Confirmar nova senha"
                error={formErrors.confirmarSenha}
              >
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  error={!!formErrors.confirmarSenha}
                />
              </FormField>
            </div>
          </CardContent>
          
          <CardFooter className="justify-end">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Configurações de notificações com salvamento automático */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          {prefsErrorMessage && (
            <Alert
              variant="destructive"
              title="Erro"
              onClose={() => setPrefsErrorMessage('')}
              className="mb-4"
            >
              {prefsErrorMessage}
            </Alert>
          )}
          
          {prefsSuccessMessage && (
            <Alert
              variant="success"
              title="Sucesso"
              onClose={() => setPrefsSuccessMessage('')}
              className="mb-4"
            >
              {prefsSuccessMessage}
            </Alert>
          )}
          
          {isLoadingPrefs && (
            <div className="absolute top-2 right-2">
              <div className="w-4 h-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Atualizações de chamados</h4>
                <p className="text-sm text-slate-500">Receba notificações quando seus chamados forem atualizados</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationPreferences.notificarAtualizacao} 
                  onChange={() => handlePreferenceChange('notificarAtualizacao')} 
                  className="sr-only peer" 
                  disabled={isLoadingPrefs}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Fechamento de chamados</h4>
                <p className="text-sm text-slate-500">Receba notificações quando seus chamados forem concluídos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationPreferences.notificarFechamento} 
                  onChange={() => handlePreferenceChange('notificarFechamento')} 
                  className="sr-only peer" 
                  disabled={isLoadingPrefs}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notificações por email</h4>
                <p className="text-sm text-slate-500">Receba um email quando houver atualizações importantes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notificationPreferences.notificarPorEmail} 
                  onChange={() => handlePreferenceChange('notificarPorEmail')} 
                  className="sr-only peer" 
                  disabled={isLoadingPrefs}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="info" title="Segurança da Conta">
        Recomendamos alterar sua senha regularmente para manter sua conta segura. Nunca compartilhe suas credenciais com terceiros.
      </Alert>
    </div>
  );
}