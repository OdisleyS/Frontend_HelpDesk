// src/components/auth/register-form.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function RegisterForm() {
  const { register, error, clearError, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar o erro do campo quando o usuário começa a digitar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Limpar mensagem de sucesso quando o usuário começa a editar o formulário novamente
    if (successMessage) {
      setSuccessMessage('');
    }
  };
  
  const validateForm = () => {
    const errors = {
      email: '',
      senha: '',
      confirmarSenha: '',
    };
    
    // Validar email
    if (!formData.email) {
      errors.email = 'O email é obrigatório';
    } else if (!formData.email.endsWith('@gmail.com')) {
      errors.email = 'Apenas emails @gmail.com são permitidos';
    }
    
    // Validar senha
    if (!formData.senha) {
      errors.senha = 'A senha é obrigatória';
    } else if (formData.senha.length < 6) {
      errors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    // Validar confirmação de senha
    if (!formData.confirmarSenha) {
      errors.confirmarSenha = 'Confirme sua senha';
    } else if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'As senhas não coincidem';
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
    
    try {
      const { email, senha } = formData;
      await register({ email, senha });
      
      // O redirecionamento é feito pelo AuthContext
    } catch (error) {
      // O erro já é tratado pelo contexto de autenticação
      console.error('Erro ao registrar:', error);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Cadastro</CardTitle>
        <CardDescription>
          Crie sua conta para acessar o sistema de HelpDesk
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert 
              variant="destructive" 
              title="Erro no cadastro"
              onClose={clearError}
            >
              {error.message}
            </Alert>
          )}
          
          {successMessage && (
            <Alert 
              variant="success" 
              title="Cadastro realizado com sucesso"
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          )}
          
          <FormField
            id="email"
            label="Email"
            error={formErrors.email}
          >
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seuemail@gmail.com"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              autoComplete="email"
              autoFocus
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
              placeholder="Crie uma senha"
              value={formData.senha}
              onChange={handleChange}
              error={!!formErrors.senha}
              autoComplete="new-password"
            />
          </FormField>
          
          <FormField
            id="confirmarSenha"
            label="Confirmar Senha"
            error={formErrors.confirmarSenha}
          >
            <Input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              placeholder="Confirme sua senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              error={!!formErrors.confirmarSenha}
              autoComplete="new-password"
            />
          </FormField>
        </CardContent>
        
        <CardFooter className="flex-col gap-4">
          <Button 
            type="submit" 
            fullWidth={true}
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
          
          <p className="text-sm text-center text-slate-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}