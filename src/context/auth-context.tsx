// src/context/auth-context.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; 
import { api } from '@/lib/api';
import { AuthState, LoginRequest, RegisterRequest, VerifyRequest, UserData, ApiError } from '@/types/auth';

// Interface para o contexto de autenticação
interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<string>;
  verify: (data: VerifyRequest) => Promise<string>;
  logout: () => void;
  error: ApiError | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccess: () => void;
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Limpar erro
  const clearError = () => setError(null);
  
  // Limpar mensagem de sucesso
  const clearSuccess = () => setSuccessMessage(null);

  // Função auxiliar para determinar o tipo de usuário com base nas roles
  const determineUserType = (decoded: any): string => {
    let userType = 'CLIENTE'; // Valor padrão

    try {
      // Obter roles do token JWT
      let roles: string[] = [];
      
      // Verificar diferentes formatos possíveis de roles
      if (decoded.roles) {
        if (typeof decoded.roles === 'string') {
          // Se roles for uma string
          roles = [decoded.roles];
        } else if (Array.isArray(decoded.roles)) {
          // Se roles for um array
          roles = decoded.roles;
        }
      } else if (decoded.role) {
        // Caso "role" seja usado em vez de "roles"
        if (typeof decoded.role === 'string') {
          roles = [decoded.role];
        } else if (Array.isArray(decoded.role)) {
          roles = decoded.role;
        }
      } else if (decoded.authorities) {
        // Caso "authorities" seja usado (comum em Spring Security)
        if (Array.isArray(decoded.authorities)) {
          roles = decoded.authorities.map((auth: any) => {
            // Handle formato {authority: "ROLE_XYZ"} ou string simples
            return typeof auth === 'object' && auth.authority ? auth.authority : auth;
          });
        }
      } else if (decoded.scope) {
        // Caso "scope" seja usado
        if (typeof decoded.scope === 'string') {
          roles = decoded.scope.split(' ');
        } else if (Array.isArray(decoded.scope)) {
          roles = decoded.scope;
        }
      }

      console.log('Roles extraídos do token:', roles);

      // Determinar tipo com base nas roles
      if (roles.length > 0) {
        // Verificar GESTOR
        if (roles.some(role => {
          const roleStr = role.toString().toUpperCase();
          return roleStr.includes('GESTOR') || roleStr.includes('ADMIN');
        })) {
          userType = 'GESTOR';
        }
        // Verificar TECNICO
        else if (roles.some(role => {
          const roleStr = role.toString().toUpperCase();
          return roleStr.includes('TECNICO') || roleStr.includes('TECH');
        })) {
          userType = 'TECNICO';
        }
      }
    } catch (e) {
      console.error('Erro ao determinar tipo de usuário:', e);
    }
    
    console.log('Tipo de usuário identificado:', userType);
    return userType;
  };

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
        const decoded = jwtDecode(token);
        console.log('Token JWT decodificado:', decoded);
        
        // Verifica se o token expirou (exp está em segundos, Date.now() em milissegundos)
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.log('Token expirado');
          localStorage.removeItem('token');
          setState({ ...initialState, isLoading: false });
          return;
        }

        // Determinar tipo de usuário
        const userType = determineUserType(decoded);

        // Cria objeto de usuário
        const userData: UserData = {
          email: decoded.sub as string,
          tipo: userType as any,
          nome: (decoded.sub as string).split('@')[0] // Nome simplificado a partir do email
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
      clearSuccess();
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.auth.login(data);
      
      // Salva o token no localStorage
      localStorage.setItem('token', response.token);
      
      // Decodifica o token para obter os dados do usuário
      const decoded = jwtDecode(response.token);
      console.log('Token JWT após login:', decoded);
      
      // Determinar tipo de usuário
      const userType = determineUserType(decoded);
      
      // Cria objeto de usuário
      const userData: UserData = {
        email: decoded.sub as string,
        tipo: userType as any,
        nome: (decoded.sub as string).split('@')[0] // Nome simplificado a partir do email
      };
      
      setState({
        user: userData,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Navega para o dashboard apropriado com base na role
      switch (userType) {
        case 'CLIENTE':
          router.push('/cliente');
          break;
        case 'TECNICO':
          router.push('/tecnico');
          break;
        case 'GESTOR':
          router.push('/gestor');
          break;
        default:
          router.push('/cliente'); // Fallback para cliente
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError({
        message: apiError.message || 'Falha ao fazer login. Verifique suas credenciais.',
        status: apiError.status || 400
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Registro
  const register = async (data: RegisterRequest): Promise<string> => {
    try {
      clearError();
      clearSuccess();
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.auth.register(data);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Define a mensagem de sucesso
      setSuccessMessage('Código enviado para seu email. Verifique sua caixa de entrada.');
      
      // Navega para a página de verificação com o email como parâmetro
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError({
        message: apiError.message || 'Erro no registro. Tente novamente.',
        status: apiError.status || 400
      });
      setState(prev => ({ ...prev, isLoading: false }));
      throw apiError;
    }
  };

  // Verificação
  const verify = async (data: VerifyRequest): Promise<string> => {
    try {
      clearError();
      clearSuccess();
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await api.auth.verifyCode(data);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Define a mensagem de sucesso
      setSuccessMessage('Conta verificada com sucesso! Agora você pode fazer login.');
      
      // Navega para a página de login
      router.push('/login');
      
      return response;
    } catch (err) {
      const apiError = err as ApiError;
      setError({
        message: apiError.message || 'Código inválido ou expirado. Tente novamente.',
        status: apiError.status || 400
      });
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
        successMessage,
        clearError,
        clearSuccess,
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