// src/components/auth/login-form.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function LoginForm() {
  const { login, error, clearError, successMessage, clearSuccess, isLoading } = useAuth();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    senha: '',
  });
  
  // Pegar o email da URL, se disponível
  useEffect(() => {
    const emailFromUrl = searchParams?.get('email');
    if (emailFromUrl) {
      setFormData(prev => ({ ...prev, email: emailFromUrl }));
    }
  }, [searchParams]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar o erro do campo quando o usuário começa a digitar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Limpar mensagem de erro quando o usuário começa a editar o formulário novamente
    if (error) clearError();
  };
  
  const validateForm = () => {
    const errors = {
      email: '',
      senha: '',
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
      await login(formData);
    } catch (error) {
      // O erro já é tratado pelo contexto de autenticação
      console.error('Erro ao fazer login:', error);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Acesso ao Sistema</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o HelpDesk
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert 
              variant="destructive" 
              title="Erro de autenticação"
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
              autoFocus={!formData.email}
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
              placeholder="Sua senha"
              value={formData.senha}
              onChange={handleChange}
              error={!!formErrors.senha}
              autoComplete="current-password"
              autoFocus={!!formData.email}
            />
          </FormField>
        </CardContent>
        
        <CardFooter className="flex-col gap-4">
          <Button 
            type="submit" 
            fullWidth={true}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          <p className="text-sm text-center text-slate-600">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}