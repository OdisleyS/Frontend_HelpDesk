// src/components/dashboard/header.tsx

'use client';

import { useAuth } from '@/context/auth-context';

export default function Header() {
  const { user } = useAuth();

  // Função para obter o título da página com base no path
  const getPageTitle = () => {
    const path = window.location.pathname;
    
    // Páginas específicas de cada tipo de usuário
    if (path.startsWith('/cliente')) {
      if (path === '/cliente') return 'Dashboard do Cliente';
      if (path === '/cliente/meus-chamados') return 'Meus Chamados';
      if (path === '/cliente/abrir-chamado') return 'Abrir Chamado';
      if (path === '/cliente/notificacoes') return 'Notificações';
      if (path === '/cliente/perfil') return 'Meu Perfil';
    } 
    else if (path.startsWith('/tecnico')) {
      if (path === '/tecnico') return 'Dashboard do Técnico';
      if (path === '/tecnico/chamados') return 'Gerenciamento de Chamados';
      if (path === '/tecnico/categorias') return 'Gerenciamento de Categorias';
      if (path === '/tecnico/notificacoes') return 'Notificações';
      if (path === '/tecnico/perfil') return 'Meu Perfil';
    }
    else if (path.startsWith('/gestor')) {
      if (path === '/gestor') return 'Dashboard do Gestor';
      if (path === '/gestor/estatisticas') return 'Estatísticas e Relatórios';
      if (path === '/gestor/usuarios') return 'Gerenciamento de Usuários';
      if (path === '/gestor/notificacoes') return 'Notificações';
      if (path === '/gestor/perfil') return 'Meu Perfil';
    }
    
    // Páginas genéricas de dashboard
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/dashboard/perfil') return 'Perfil';
    
    return 'HelpDesk';
  };

  return (
    <header className="bg-white border-b border-slate-200 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">
          {getPageTitle()}
        </h1>
        
        <div className="flex items-center gap-3">
          {/* Indicador de status do usuário */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-600">Online</span>
          </div>
          
          {/* Avatar do usuário e informações */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-full py-1 px-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
              {user?.nome?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div>
              <span className="text-sm font-medium">{user?.nome || (user?.email?.split('@')[0] || 'Usuário')}</span>
              <span className="text-xs block text-slate-500">{user?.tipo || 'Usuário'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}