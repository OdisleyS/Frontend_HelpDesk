// Modificações para src/app/cliente/perfil/page.tsx
// Adicionando a parte de preferências de notificação

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';

export default function PerfilPage() {
  const { user, token } = useAuth();

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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [prefsSuccessMessage, setPrefsSuccessMessage] = useState('');
  const [prefsErrorMessage, setPrefsErrorMessage] = useState('');

  // Carregar preferências do usuário
  useEffect(() => {
    const loadPreferences = async () => {
      if (!token) return;

      setIsLoadingPrefs(true);

      try {
        const data = await api.notifications.getPreferences(token);
        setNotificationPreferences({
          notificarAtualizacao: data.notificarAtualizacao,
          notificarFechamento: data.notificarFechamento,
          notificarPorEmail: data.notificarPorEmail,
        });
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
        setPrefsErrorMessage('Não foi possível carregar suas preferências de notificação.');
      } finally {
        setIsLoadingPrefs(false);
      }
    };

    loadPreferences();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpar erro ao editar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Simulação de atualização de perfil
      // Em um ambiente real, usaríamos algo como:
      // await api.users.updateProfile(formData);

      // Simulação de tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Perfil atualizado com sucesso!');

      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      }));
    } catch (error) {
      setErrorMessage('Erro ao atualizar perfil. Verifique suas informações e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com mudanças nas preferências de notificação
  const handlePreferenceChange = (preference: string) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference as keyof typeof prev],
    }));
  };

  // Função para salvar preferências de notificação
  const handleSavePreferences = async () => {
    if (!token) return;

    setIsLoadingPrefs(true);
    setPrefsErrorMessage('');
    setPrefsSuccessMessage('');

    try {
      await api.notifications.updatePreferences(notificationPreferences, token);
      setPrefsSuccessMessage('Preferências de notificação atualizadas com sucesso!');

      // Limpar mensagem após alguns segundos
      setTimeout(() => {
        setPrefsSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      setPrefsErrorMessage('Não foi possível atualizar suas preferências de notificação. Tente novamente mais tarde.');
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

            {successMessage && (
              <Alert
                variant="success"
                title="Sucesso"
                onClose={() => setSuccessMessage('')}
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
                  // Continuação do src/app/cliente/perfil/page.tsx
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

      {/* Configurações de notificações */}
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

          {isLoadingPrefs ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando preferências...</span>
            </div>
          ) : (
            <div className="space-y-4">
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
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            onClick={handleSavePreferences}
            disabled={isLoadingPrefs}
          >
            {isLoadingPrefs ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
        </CardFooter>
      </Card>

      <Alert variant="info" title="Segurança da Conta">
        Recomendamos alterar sua senha regularmente para manter sua conta segura. Nunca compartilhe suas credenciais com terceiros.
      </Alert>
    </div>
  );
}