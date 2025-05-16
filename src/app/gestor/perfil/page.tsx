// src/app/gestor/perfil/page.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function GestorPerfilPage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    nome: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
                {formData.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'G'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{formData.nome || user?.email?.split('@')[0]}</h3>
                <p className="text-slate-500">{user?.email}</p>
                <p className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full inline-block mt-1">
                  {user?.tipo || 'Gestor'}
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
      
      {/* Configurações adicionais para gestores */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Gestor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notificações de novos chamados</h4>
                <p className="text-sm text-slate-500">Receba alertas quando novos chamados forem abertos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Relatórios semanais</h4>
                <p className="text-sm text-slate-500">Receba relatórios resumidos do sistema por email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Alertas de SLA</h4>
                <p className="text-sm text-slate-500">Receba alertas quando chamados estiverem próximos de estourar o SLA</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
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