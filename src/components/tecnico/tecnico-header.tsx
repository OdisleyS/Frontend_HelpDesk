// src/components/tecnico/tecnico-header.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export default function TecnicoHeader() {
  const { user, token } = useAuth();
  const [userName, setUserName] = useState(user?.nome || '');
  const pathname = usePathname();
  
  // Buscar o nome diretamente da API quando o componente montar ou token mudar
  useEffect(() => {
    const fetchUserName = async () => {
      if (!token) return;
      
      try {
        const name = await api.users.getName(token);
        setUserName(name);
      } catch (error) {
        console.error('Erro ao buscar nome do usuário:', error);
      }
    };
    
    fetchUserName();
  }, [token]); // Adicionando token como dependência para refazer a busca quando o token mudar
  
  // Atualizar userName quando o user.nome mudar no contexto de autenticação
  useEffect(() => {
    if (user?.nome) {
      setUserName(user.nome);
    }
  }, [user?.nome]);

  // Determinando título baseado no pathname (path atual)
  const getPageTitle = () => {
    if (pathname === '/tecnico') return 'Dashboard do Técnico';
    if (pathname === '/tecnico/chamados') return 'Gerenciamento de Chamados';
    if (pathname === '/tecnico/meus-atendimentos') return 'Meus Atendimentos';
    if (pathname === '/tecnico/categorias') return 'Gerenciamento de Categorias';
    if (pathname === '/tecnico/notificacoes') return 'Notificações';
    if (pathname === '/tecnico/perfil') return 'Meu Perfil';
    
    // Se acessar uma página específica de chamado
    if (pathname.startsWith('/tecnico/chamados/')) return 'Detalhes do Chamado';
    
    return 'Help Desk - Área do Técnico';
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
          
          {/* Avatar do usuário com o nome atualizado */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-full py-1 px-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
              {userName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'T'}
            </div>
            <span className="text-sm font-medium">{userName || user?.email?.split('@')[0]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}