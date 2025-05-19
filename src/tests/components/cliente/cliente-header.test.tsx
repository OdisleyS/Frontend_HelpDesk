// src/tests/components/cliente/cliente-header.test.tsx
import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import ClienteHeader from '@/components/cliente/cliente-header'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

// mock do next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// mock do hook de auth
jest.mock('@/context/auth-context', () => ({
  __esModule: true,
  useAuth:    jest.fn(),
}))

describe('ClienteHeader', () => {
  const mockedUsePathname = usePathname as jest.Mock
  const mockedUseAuth     = useAuth     as jest.Mock

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('renderiza o componente corretamente (título padrão)', () => {
    mockedUsePathname.mockReturnValue('/cliente')
    mockedUseAuth.mockReturnValue({
      user:            { email: 'u@t.com', nome: 'User T' },
      isAuthenticated: true,
    })

    render(<ClienteHeader />)
    expect(
      screen.getByRole('heading', { name: /dashboard do cliente/i })
    ).toBeInTheDocument()
  })

  it('mostra "Detalhes do Chamado" quando a rota indicar um chamado', () => {
    mockedUsePathname.mockReturnValue('/cliente/chamado/123')
    mockedUseAuth.mockReturnValue({
      user:            { email: 'u@t.com', nome: 'User T' },
      isAuthenticated: true,
    })

    render(<ClienteHeader />)
    expect(
      screen.getByRole('heading', { name: /detalhes do chamado/i })
    ).toBeInTheDocument()
  })

  it('exibe a primeira letra do email se nome não estiver disponível', () => {
    mockedUsePathname.mockReturnValue('/cliente')
    mockedUseAuth.mockReturnValue({
      user:            { email: 'z@x.com', nome: '' },
      isAuthenticated: true,
    })

    render(<ClienteHeader />)
    expect(screen.getByText('Z')).toBeInTheDocument()
  })

  it('exibe fallback de título se não houver dados do usuário', () => {
    mockedUsePathname.mockReturnValue('/cliente')
    mockedUseAuth.mockReturnValue({
      user:            null,
      isAuthenticated: false,
    })

    render(<ClienteHeader />)
    expect(
      screen.getByRole('heading', { name: /dashboard do cliente/i })
    ).toBeInTheDocument()
  })
})
