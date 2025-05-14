// src/app/cliente/abrir-chamado/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

// Enum para prioridade
enum Priority {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA'
}

// Lista simulada de categorias
const categorias = [
  { id: 1, nome: 'Hardware' },
  { id: 2, nome: 'Software' },
  { id: 3, nome: 'Rede' },
  { id: 4, nome: 'Impressoras' },
  { id: 5, nome: 'Outros' },
];

export default function AbrirChamadoPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoriaId: '',
    prioridade: Priority.MEDIA,
  });
  
  const [formErrors, setFormErrors] = useState({
    titulo: '',
    descricao: '',
    categoriaId: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro ao editar
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {
      titulo: '',
      descricao: '',
      categoriaId: '',
    };
    
    // Validações
    if (!formData.titulo.trim()) {
      errors.titulo = 'O título é obrigatório';
    }
    
    if (!formData.descricao.trim()) {
      errors.descricao = 'A descrição é obrigatória';
    }
    
    if (!formData.categoriaId) {
      errors.categoriaId = 'Selecione uma categoria';
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
      // Simulação de envio para API
      // Em um ambiente real, usaríamos algo como:
      // await api.tickets.create(formData);
      
      // Simulação de tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Chamado aberto com sucesso! Você será redirecionado para a lista de chamados.');
      
      // Após 2 segundos, redirecionar para a lista de chamados
      setTimeout(() => {
        router.push('/cliente/meus-chamados');
      }, 2000);
    } catch (error) {
      setErrorMessage('Erro ao abrir chamado. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Abrir Novo Chamado</h2>
        <p className="text-slate-600 mt-1">Preencha os campos abaixo para registrar um novo chamado de suporte.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Formulário de Chamado</CardTitle>
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
            
            <FormField
              id="titulo"
              label="Título"
              error={formErrors.titulo}
            >
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ex: Problema com impressora"
                value={formData.titulo}
                onChange={handleChange}
                error={!!formErrors.titulo}
                autoFocus
              />
            </FormField>
            
            <FormField
              id="categoriaId"
              label="Categoria"
              error={formErrors.categoriaId}
            >
              <select
                id="categoriaId"
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                className={`flex w-full rounded-md border ${formErrors.categoriaId ? 'border-red-500' : 'border-slate-300'} bg-transparent p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </FormField>
            
            <FormField
              id="prioridade"
              label="Prioridade"
              error=""
            >
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="prioridade"
                    value={Priority.BAIXA}
                    checked={formData.prioridade === Priority.BAIXA}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Baixa</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="prioridade"
                    value={Priority.MEDIA}
                    checked={formData.prioridade === Priority.MEDIA}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Média</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="prioridade"
                    value={Priority.ALTA}
                    checked={formData.prioridade === Priority.ALTA}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Alta</span>
                </label>
              </div>
            </FormField>
            
            <FormField
              id="descricao"
              label="Descrição"
              error={formErrors.descricao}
            >
              <textarea
                id="descricao"
                name="descricao"
                rows={5}
                placeholder="Descreva o problema detalhadamente..."
                value={formData.descricao}
                onChange={handleChange}
                className={`flex w-full rounded-md border ${formErrors.descricao ? 'border-red-500' : 'border-slate-300'} bg-transparent p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`}
              />
            </FormField>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/cliente/meus-chamados')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Abrir Chamado'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Alert variant="info" title="Dica">
        Forneça o máximo de detalhes possível na descrição para que nossa equipe possa ajudá-lo mais rapidamente.
      </Alert>
    </div>
  );
}