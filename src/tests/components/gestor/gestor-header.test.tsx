import React from 'react';
import { render, screen } from '@testing-library/react';
import GestorHeader from '@/components/gestor/gestor-header';
import { useAuth } from '@/context/auth-context';

// Mock das dependências
jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn()
}));

describe('GestorHeader', () => {
  const mockUser = {
    email: 'gestor@gmail.com',
    nome: 'Gestor Teste',
    tipo: 'GESTOR'
  };
  
  // Configuração básica dos mocks
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    });
  });
  
  it('renderiza o componente corretamente', () => {
    render(<GestorHeader />);
    
    // Verifica se o indicador de status está presente
    expect(screen.getByText('Online')).toBeInTheDocument();
    
    // Verifica o avatar e o nome do usuário
    expect(screen.getByText('Gestor Teste')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
  });
  
  it('exibe a primeira letra do email se nome não estiver disponível', () => {
    // Mock sem nome
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: 'gestor@gmail.com', tipo: 'GESTOR' }
    });
    
    render(<GestorHeader />);
    
    // Verifica avatar com inicial do email
    expect(screen.getByText('G')).toBeInTheDocument();
    
    // Verifica nome exibido como parte do email
    expect(screen.getByText('gestor')).toBeInTheDocument();
  });
  
  it('exibe fallback se não houver dados do usuário', () => {
    // Mock sem usuário
    (useAuth as jest.Mock).mockReturnValue({
      user: null
    });
    
    render(<GestorHeader />);
    
    // Deve mostrar 'G' como fallback para avatar
    expect(screen.getByText('G')).toBeInTheDocument();
  });
});
