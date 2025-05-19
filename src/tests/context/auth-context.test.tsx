import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { cleanup } from '@testing-library/react'  // ← importe o cleanup
import { AuthProvider, useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { jwtDecode } from 'jwt-decode'

// next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

// jwt-decode (export default)
jest.mock('jwt-decode', () => ({
    __esModule: true,
    jwtDecode: jest.fn(),
}))

// lib/api — garante que `api.auth` e `api.users` existam
jest.mock('@/lib/api', () => ({
    __esModule: true,
    api: {
        auth: {
            login: jest.fn(),
            register: jest.fn(),
            verifyCode: jest.fn(),
        },
        users: {
            updateName: jest.fn(),
            updatePassword: jest.fn(),
            getName: jest.fn(),
        },
    },
}))


function TestComponent({ testCase }: { testCase: string }) {
    const auth = useAuth()

    const handleAction = async () => {
        if (testCase === 'login') await auth.login({ email: 'test@gmail.com', senha: 'password123' })
        else if (testCase === 'register') await auth.register({ email: 'test@gmail.com', senha: 'password123' })
        else if (testCase === 'verify') await auth.verify({ email: 'test@gmail.com', codigo: '123456' })
        else if (testCase === 'logout') auth.logout()
        else if (testCase === 'updateName') await auth.updateUserName('Novo Nome')
        else if (testCase === 'updatePassword') await auth.updateUserPassword('oldPass', 'newPass')
    }

    return (
        <div>
            <div data-testid="auth-state">
                {JSON.stringify({
                    isAuthenticated: auth.isAuthenticated,
                    isLoading: auth.isLoading,
                    user: auth.user,
                })}
            </div>
            <div data-testid="error">{auth.error?.message || ''}</div>
            <div data-testid="success">{auth.successMessage || ''}</div>
            <button onClick={handleAction}>Executar Ação</button>
            <button onClick={auth.clearError}>Limpar Erro</button>
            <button onClick={auth.clearSuccess}>Limpar Sucesso</button>
        </div>
    )
};

describe('AuthContext', () => {
    const renderWithAuth = (testCase: string) => {
        const routerMock = { push: jest.fn() }
            ; (useRouter as jest.Mock).mockReturnValue(routerMock)

        // NÃO é preciso desmontar aqui — já fazemos no beforeEach
        render(
            <AuthProvider>
                <TestComponent testCase={testCase} />
            </AuthProvider>
        )

        return { routerMock }
    }

    beforeEach(() => {
        cleanup()            // ← desmonta qualquer renderização anterior
        jest.clearAllMocks() // ← reseta todos os jest.fn() e spies

        // redefine um localStorage limpo
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn().mockReturnValue(null),
                setItem: jest.fn(),
                removeItem: jest.fn(),
            },
            writable: true
        })
    })


    it('inicializa com estado não autenticado', () => {
        renderWithAuth('none');

        const state = JSON.parse(screen.getByTestId('auth-state').textContent || '{}');
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
    });

    it('processa login com sucesso', async () => {
        const { routerMock } = renderWithAuth('login');

        // Configurar mock de login para retornar token
        (api.auth.login as jest.Mock).mockResolvedValue({ token: 'test-token' });

        // Configurar mock do jwtDecode para simular um token de técnico
        (jwtDecode as jest.Mock).mockReturnValue({
            sub: 'tecnico@gmail.com',
            role: 'TECNICO',
            exp: Math.floor(Date.now() / 1000) + 3600
        });

        // Executar login
        const [execBtn] = screen.getAllByText('Executar Ação');
        fireEvent.click(execBtn);

        // Verificar se o método correto foi chamado
        expect(api.auth.login).toHaveBeenCalledWith({
            email: 'test@gmail.com',
            senha: 'password123'
        });

        // Aguardar atualização do estado
        await waitFor(() => {
            const state = JSON.parse(screen.getByTestId('auth-state').textContent || '{}');
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toMatchObject({
                email: 'tecnico@gmail.com',
                tipo: 'TECNICO'
            });
        });

        // Verificar se o roteamento foi chamado
        expect(routerMock.push).toHaveBeenCalledWith('/tecnico');

        // Verificar se o token foi armazenado no localStorage
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    });

    it('processa login com erro', async () => {
        renderWithAuth('login');

        // Configurar mock para simular erro
        const errorMessage = 'Credenciais inválidas';
        (api.auth.login as jest.Mock).mockRejectedValue({
            message: errorMessage,
            status: 401
        });

        // Executar login
        const [execBtn] = screen.getAllByText('Executar Ação');
        fireEvent.click(execBtn);

        // Verificar se o erro foi capturado corretamente
        await waitFor(() => {
            expect(screen.getByTestId('error').textContent).toBe(errorMessage);
        });

        // Verificar se o estado continua não autenticado
        const state = JSON.parse(screen.getByTestId('auth-state').textContent || '{}');
        expect(state.isAuthenticated).toBe(false);
    });

    it.each([
        ['CLIENTE', '/cliente/meus-chamados'],
        ['TECNICO', '/tecnico'],
        ['GESTOR', '/gestor']
    ])('redireciona para %s', async (tipo, rota) => {
        // mock do login + decode já antes de render
        (api.auth.login as jest.Mock).mockResolvedValue({ token: 'test-token' });
        (jwtDecode as jest.Mock).mockReturnValue({
            sub: `${tipo.toLowerCase()}@gmail.com`,
            role: tipo,
            exp: Math.floor(Date.now() / 1000) + 3600
        });

        const { routerMock } = renderWithAuth('login');
        const [execBtn] = screen.getAllByText('Executar Ação');
        fireEvent.click(execBtn);

        await waitFor(() => {
            expect(routerMock.push).toHaveBeenCalledWith(rota);
        });
    });

    it('processa registro com sucesso', async () => {
        const { routerMock } = renderWithAuth('register');

        // Configurar mock de registro
        (api.auth.register as jest.Mock).mockResolvedValue('Registro realizado com sucesso');

        // Executar registro
        const [execBtn] = screen.getAllByText('Executar Ação');
        fireEvent.click(execBtn);

        // Verificar se o método foi chamado corretamente
        expect(api.auth.register).toHaveBeenCalledWith({
            email: 'test@gmail.com',
            senha: 'password123'
        });

        // Verificar mensagem de sucesso
        await waitFor(() => {
            expect(screen.getByTestId('success').textContent).toContain('Código enviado');
        });

        // Verificar redirecionamento para verificação
        expect(routerMock.push).toHaveBeenCalledWith('/verify?email=test%40gmail.com');
    });

    it('processa verificação com sucesso', async () => {
        const { routerMock } = renderWithAuth('verify');

        // Configurar mock de verificação
        (api.auth.verifyCode as jest.Mock).mockResolvedValue('Verificação realizada com sucesso');

        // Executar verificação
        const [execBtn] = screen.getAllByText('Executar Ação');
        fireEvent.click(execBtn);

        // Verificar se o método foi chamado corretamente
        expect(api.auth.verifyCode).toHaveBeenCalledWith({
            email: 'test@gmail.com',
            codigo: '123456'
        });

        // Verificar mensagem de sucesso
        await waitFor(() => {
            expect(screen.getByTestId('success').textContent).toContain('Conta verificada');
        });

        // Verificar redirecionamento para login
        expect(routerMock.push).toHaveBeenCalledWith('/login');
    });

    it('processa logout corretamente', () => {
        const { routerMock } = renderWithAuth('logout');

        // Configurar estado inicial como autenticado
        window.localStorage.getItem = jest.fn().mockReturnValue('test-token');
        (jwtDecode as jest.Mock).mockReturnValue({
            sub: 'user@gmail.com',
            role: 'CLIENTE',
            exp: Math.floor(Date.now() / 1000) + 3600
        });

        // Executar logout
        const [execBtn] = screen.getAllByText('Executar Ação');
        fireEvent.click(execBtn);

        // Verificar se o token foi removido do localStorage
        expect(localStorage.removeItem).toHaveBeenCalledWith('token');

        // Verificar redirecionamento para login
        expect(routerMock.push).toHaveBeenCalledWith('/login');

        // Verificar se o estado foi atualizado
        const state = JSON.parse(screen.getByTestId('auth-state').textContent || '{}');
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBe(null);
    });

    it('atualiza nome do usuário com sucesso', async () => {
        // 1) Mocka token antes de montar
        window.localStorage.getItem = jest.fn().mockReturnValue('test-token');
        (jwtDecode as jest.Mock).mockReturnValue({
            sub: 'user@gmail.com',
            role: 'CLIENTE',
            exp: Math.floor(Date.now() / 1000) + 3600
        });
        (api.users.updateName as jest.Mock).mockResolvedValue('Nome atualizado com sucesso');

        // 2) Monta o TestComponent em modo updateName
        renderWithAuth('updateName');

        // 3) Dispara o handleAction
        const [execBtn] = screen.getAllByText('Executar Ação');
        fireEvent.click(execBtn);

        // 4) Verifica chamada e mensagem
        await waitFor(() => {
            expect(api.users.updateName).toHaveBeenCalledWith(
                'Novo Nome',
                'test-token'
            );
            expect(screen.getByTestId('success').textContent).toContain('Nome atualizado');
        });
    });

    it('atualiza senha com sucesso', async () => {
        // 1) Mocka token e jwtDecode antes
        window.localStorage.getItem = jest.fn().mockReturnValue('test-token');
        (jwtDecode as jest.Mock).mockReturnValue({
            sub: 'user@gmail.com',
            role: 'CLIENTE',
            exp: Math.floor(Date.now() / 1000) + 3600
        });
        (api.users.updatePassword as jest.Mock).mockResolvedValue('Senha atualizada com sucesso');

        // 2) Monta em modo updatePassword
        renderWithAuth('updatePassword');

        // 3) Dispara ação
        const [execBtn] = screen.getAllByText('Executar Ação');
        fireEvent.click(execBtn);

        // 4) Verifica chamada e mensagem
        await waitFor(() => {
            expect(api.users.updatePassword).toHaveBeenCalledWith(
                'oldPass',
                'newPass',
                'test-token'
            );
            expect(screen.getByTestId('success').textContent).toContain('Senha atualizada');
        });
    });


    it('limpa mensagens de erro e sucesso', async () => {
        renderWithAuth('login');

        // Configurar mock para gerar erro
        (api.auth.login as jest.Mock).mockRejectedValue({
            message: 'Erro de teste',
            status: 400
        });

        // Executar login para gerar erro
        const [execBtn] = screen.getAllByText('Executar Ação');
        fireEvent.click(execBtn);

        // Verificar se o erro foi exibido
        await waitFor(() => {
            expect(screen.getByTestId('error').textContent).toBe('Erro de teste');
        });

        // Limpar erro
        fireEvent.click(screen.getByText('Limpar Erro'));

        // Verificar se o erro foi limpo
        expect(screen.getByTestId('error').textContent).toBe('');

        // Para testar limpeza de sucesso, poderíamos fazer algo similar
        // mas com um mock que retorna sucesso
    });
});
