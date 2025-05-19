// src/tests/components/auth/login-form.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'
import { AuthProvider } from '@/context/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

// mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// mock da API
jest.mock('@/lib/api', () => ({
  api: { auth: { login: jest.fn() } }
}))

describe('LoginForm', () => {
  const mockedUseRouter       = useRouter as jest.Mock
  const mockedUseSearchParams = useSearchParams as jest.Mock

  beforeEach(() => {
    mockedUseRouter.mockReturnValue({ push: jest.fn() })
    mockedUseSearchParams.mockReturnValue(new URLSearchParams())
  })

  it('valida campos e chama login', async () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    )

    // validação de campos obrigatórios
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(await screen.findByText(/email é obrigatório/i)).toBeInTheDocument()
    expect(await screen.findByText(/senha é obrigatória/i)).toBeInTheDocument()

    // agora use um email @gmail.com válido
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@gmail.com' }
    })
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: '123456' }
    })

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    // espera que a chamada ocorra com os dados corretos
    await waitFor(() => {
      expect(api.auth.login).toHaveBeenCalledWith({
        email: 'user@gmail.com',
        senha: '123456'
      })
    })
  })
})
