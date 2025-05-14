// src/components/cliente/cliente-header.tsx

'use client';

import { useAuth } from '@/context/auth-context';

export default function ClienteHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">
          {/* Título dinâmico conforme a página atual */}
          {window.location.pathname === '/cliente' && 'Dashboard do Cliente'}
          {window.location.pathname === '/cliente/meus-chamados' && 'Meus Chamados'}
          {window.location.pathname === '/cliente/abrir-chamado' && 'Abrir Chamado'}
          {window.location.pathname === '/cliente/notificacoes' && 'Notificações'}
          {window.location.pathname === '/cliente/perfil' && 'Meu Perfil'}
        </h1>
        
        <div className="flex items-center gap-3">
          {/* Indicador de status do usuário */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-600">Online</span>
          </div>
          
          {/* Avatar do usuário */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-full py-1 px-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium">{user?.nome || user?.email?.split('@')[0]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}