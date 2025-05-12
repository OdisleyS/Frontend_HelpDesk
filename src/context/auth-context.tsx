// src/context/auth-context.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // Instalar pacote: npm install jwt-decode
import { api } from '@/lib/api';
import { AuthState, LoginRequest, RegisterRequest, VerifyRequest, UserData, ApiError } from '@/types/auth';

// Interface para o contexto de autenticação
interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<string>;
  verify: (data: VerifyRequest) => Promise<string>;
  logout: () => void;
  error: ApiError | null;
  clearError: () => void;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// Props do provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);
  const [error, setError] = useState<ApiError | null>(null);
  const router = useRouter();

  // Limpar erro
  const clearError = () => setError(null);

  // Efeito para verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Recupera o token do localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setState({ ...initialState, isLoading: false });
          return;
        }

        // Decodifica o token para obter os dados do usuário
        const decoded = jwtDecode(token) as { sub: string, exp: number };
        
        // Verifica se o token expirou
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setState({ ...initialState, isLoading: false });
          return;
        }

        // Simula obtenção do perfil do usuário a partir do token
        // No mundo real, você faria uma chamada para /api/v1/user/profile
        const userData: UserData = {
          email: decoded.sub,
          tipo: 'CLIENTE', // Tipo padrão, poderia vir do backend
          nome: decoded.sub.split('@')[0] // Nome simplificado a partir do email
        };

        setState({
          user: userData,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        setState({ ...initialState, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = async (data: LoginRequest) => {
    try {
      clearError();
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.auth.login(data);
      
      // Salva o token no localStorage
      localStorage.setItem('token', response.token);
      
      // Decodifica o token para obter os dados do usuário
      const decoded = jwtDecode(response.token) as { sub: string };
      
      // Simula dados do usuário
      const userData: UserData = {
        email: decoded.sub,
        tipo: 'CLIENTE', // Tipo padrão, poderia vir do backend
        nome: decoded.sub.split('@')[0] // Nome simplificado a partir do email
      };
      
      setState({
        user: userData,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Navega para o dashboard
      router.push('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Registro
  const register = async (data: RegisterRequest): Promise<string> => {
    try {
      clearError();
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.auth.register(data);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Navega para a página de verificação com o email como parâmetro
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setState(prev => ({ ...prev, isLoading: false }));
      throw apiError;
    }
  };

  // Verificação
  const verify = async (data: VerifyRequest): Promise<string> => {
    try {
      clearError();
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.auth.verifyCode(data);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Navega para a página de login
      router.push('/login');
      
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setState(prev => ({ ...prev, isLoading: false }));
      throw apiError;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setState({ ...initialState, isLoading: false });
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        verify,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}