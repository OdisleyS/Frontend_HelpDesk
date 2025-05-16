// src/utils/errorHandler.ts

export const handleApiError = (error: any, defaultMessage: string): string => {
  console.error('Erro detalhado:', error);
  
  // Se o erro for um objeto com message
  if (error && error.message) {
    // Erro de CORS
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      return 'Erro de conexão com o servidor. Verifique sua conexão de internet ou contate o suporte.';
    }
    
    // Erro de autenticação
    if (error.status === 401 || error.status ===  403) {
      // Redirecionar para login se for erro de autenticação
      localStorage.removeItem('token');
      setTimeout(() => {
        window.location.href = '/login?error=session_expired';
      }, 2000);
      return 'Sua sessão expirou. Redirecionando para a página de login...';
    }
    
    return error.message;
  }
  
  // Erro genérico
  return defaultMessage;
};