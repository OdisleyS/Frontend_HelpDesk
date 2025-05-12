// src/components/auth/verify-form.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function VerifyForm() {
  const { verify, error, clearError, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    codigo: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    codigo: '',
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
    
    // Para o campo de código, aceitar apenas números e limitar a 6 dígitos
    if (name === 'codigo') {
      const onlyNumbers = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyNumbers.slice(0, 6) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar o erro do campo quando o usuário começa a digitar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const errors = {
      email: '',
      codigo: '',
    };
    
    // Validar email
    if (!formData.email) {
      errors.email = 'O email é obrigatório';
    } else if (!formData.email.endsWith('@gmail.com')) {
      errors.email = 'Apenas emails @gmail.com são permitidos';
    }
    
    // Validar código
    if (!formData.codigo) {
      errors.codigo = 'O código é obrigatório';
    } else if (formData.codigo.length !== 6) {
      errors.codigo = 'O código deve ter 6 dígitos';
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
      await verify(formData);
      // O redirecionamento é feito pelo AuthContext
    } catch (error) {
      // O erro já é tratado pelo contexto de autenticação
      console.error('Erro ao verificar código:', error);
    }
  };

  const handleResendCode = () => {
    // Aqui você implementaria a lógica para reenviar o código
    // Como nosso backend não tem essa funcionalidade, podemos simular
    alert('Esta funcionalidade ainda não está implementada no backend.');
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verificar Conta</CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos enviado para seu email
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert 
              variant="destructive" 
              title="Erro na verificação"
              onClose={clearError}
            >
              {error.message}
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
              disabled={!!searchParams?.get('email')}
            />
          </FormField>
          
          <FormField
            id="codigo"
            label="Código de verificação"
            error={formErrors.codigo}
          >
            <Input
              id="codigo"
              name="codigo"
              type="text"
              placeholder="Digite o código de 6 dígitos"
              value={formData.codigo}
              onChange={handleChange}
              error={!!formErrors.codigo}
              autoFocus
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </FormField>
          
          <p className="text-sm text-center text-slate-600">
            Não recebeu o código?{' '}
            <button 
              type="button"
              onClick={handleResendCode}
              className="text-blue-600 hover:underline"
            >
              Reenviar código
            </button>
          </p>
        </CardContent>
        
        <CardFooter className="flex-col gap-4">
          <Button 
            type="submit" 
            fullWidth={true}
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Verificar'}
          </Button>
          
          <p className="text-sm text-center text-slate-600">
            Voltar para o{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}