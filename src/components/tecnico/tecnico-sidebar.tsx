// src/components/tecnico/tecnico-sidebar.tsx
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

const CategoryIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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

// Definição de itens do menu
const menuItems = [
  { icon: HomeIcon, name: 'Dashboard', path: '/tecnico' },
  { icon: TicketsIcon, name: 'Chamados', path: '/tecnico/chamados' },
  { icon: TicketsIcon, name: 'Meus Atendimentos', path: '/tecnico/meus-atendimentos' },
  { icon: CategoryIcon, name: 'Categorias', path: '/tecnico/categorias' },
  { icon: NotificationIcon, name: 'Notificações', path: '/tecnico/notificacoes' },
  { icon: ProfileIcon, name: 'Meu Perfil', path: '/tecnico/perfil' },
];

export default function TecnicoSidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '16rem',  // 256px (w-64)
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        zIndex: 10,
      }}
    >
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

      {/* Menu Items */}
      <div
        style={{
          flex: '1 1 auto',
          overflowY: 'auto',
          paddingTop: '1rem',
          paddingBottom: '1rem',
        }}
      >
        <ul className="px-4 space-y-2">
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
      </div>

      {/* Logout */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '1rem',
          marginTop: 'auto',
          backgroundColor: 'white',
        }}
      >
        <button
          onClick={logout}
          className="flex items-center w-full gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          <LogoutIcon />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}