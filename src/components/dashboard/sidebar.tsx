// src/components/dashboard/sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

// Ícones para o menu
const HomeIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const TicketsIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function Sidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  // Menu dinâmico baseado no tipo de usuário
  const getMenuItems = () => {
    const baseItems = [
      { icon: HomeIcon, name: 'Dashboard', path: '/dashboard' }
    ];

    // Redireciona para a área específica do usuário baseado no tipo
    if (user?.tipo === 'CLIENTE') {
      baseItems[0].path = '/cliente';
      baseItems.push(
        { icon: TicketsIcon, name: 'Meus Chamados', path: '/cliente/meus-chamados' },
        { icon: ProfileIcon, name: 'Meu Perfil', path: '/cliente/perfil' }
      );
    } else if (user?.tipo === 'TECNICO') {
      baseItems[0].path = '/tecnico';
      baseItems.push(
        { icon: TicketsIcon, name: 'Chamados', path: '/tecnico/chamados' },
        { icon: ProfileIcon, name: 'Meu Perfil', path: '/tecnico/perfil' }
      );
    } else if (user?.tipo === 'GESTOR') {
      baseItems[0].path = '/gestor';
      baseItems.push(
        { icon: TicketsIcon, name: 'Estatísticas', path: '/gestor/estatisticas' },
        { icon: ProfileIcon, name: 'Meu Perfil', path: '/gestor/perfil' }
      );
    } else {
      // Menu padrão se o tipo não for reconhecido
      baseItems.push(
        { icon: ProfileIcon, name: 'Perfil', path: '/dashboard/perfil' }
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600 w-6 h-6"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 8v4l3 3" />
          </svg>
          <span className="text-xl font-bold text-slate-900">HelpDesk</span>
        </div>
      </div>

      {/* Informações do usuário */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-2">
            {user?.nome?.charAt(0).toUpperCase() || (user?.email?.charAt(0).toUpperCase() || 'U')}
          </div>
          <h3 className="font-medium">{user?.nome || (user?.email?.split('@')[0] || 'Usuário')}</h3>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1">
            {user?.tipo || 'Usuário'}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="flex items-center w-full gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          <LogoutIcon />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}