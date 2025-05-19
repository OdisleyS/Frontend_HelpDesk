// src/tests/components/tecnico/tecnico-header.test.tsx
import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { AuthProvider } from '@/context/auth-context'
import TecnicoHeader from '@/components/tecnico/tecnico-header'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

// Mocks necessários para next/navigation e api
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter:   jest.fn(),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  api: {
    users: {
      getName: jest.fn(),
    }
  }
}))

describe('TecnicoHeader', () => {
  const mockedUsePathname = usePathname as jest.Mock
  const mockedUseRouter   = useRouter   as jest.Mock

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()

    // localStorage vazio por padrão
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem:    jest.fn().mockReturnValue(null),
        setItem:    jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true
    })

    // evita erro no AuthProvider
    mockedUseRouter.mockReturnValue({ push: jest.fn() })
  })

  it('renderiza o título padrão do dashboard', () => {
    mockedUsePathname.mockReturnValue('/tecnico')
    render(
      <AuthProvider>
        <TecnicoHeader />
      </AuthProvider>
    )
    expect(
      screen.getByRole('heading', { name: /dashboard do técnico/i })
    ).toBeInTheDocument()
  })

  it('exibe a primeira letra do nome no avatar quando nome disponível', async () => {
    mockedUsePathname.mockReturnValue('/tecnico')
    window.localStorage.getItem = jest.fn().mockReturnValue('test-token')
    ;(api.users.getName as jest.Mock).mockResolvedValue('Técnico Teste')

    render(
      <AuthProvider>
        <TecnicoHeader />
      </AuthProvider>
    )

    const avatar = await screen.findByText('T')
    expect(avatar).toBeInTheDocument()
  })

  it('usa a primeira letra do email se o nome não estiver disponível', async () => {
    mockedUsePathname.mockReturnValue('/tecnico')
    window.localStorage.getItem = jest.fn().mockReturnValue('test-token')
    ;(api.users.getName as jest.Mock).mockResolvedValue(null)

    render(
      <AuthProvider>
        <TecnicoHeader />
      </AuthProvider>
    )

    const avatar = await screen.findByText('T')
    expect(avatar).toBeInTheDocument()
  })

  it('renderiza sem buscar API quando não há token', () => {
    mockedUsePathname.mockReturnValue('/tecnico')
    render(
      <AuthProvider>
        <TecnicoHeader />
      </AuthProvider>
    )
    expect(api.users.getName).not.toHaveBeenCalled()
  })
})
