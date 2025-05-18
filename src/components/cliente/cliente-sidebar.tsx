// src/components/cliente/cliente-sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// Ícones para o menu
const HomeIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const AddIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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

export default function ClienteSidebar() {
  const { logout, token } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Carregar contagem de notificações não lidas
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!token) return;

      try {
        const notifications = await api.notifications.list(token);
        const unreadNotifications = notifications.filter((n: { lida: any; }) => !n.lida);
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error('Erro ao carregar notificações não lidas:', error);
      }
    };

    fetchUnreadNotifications();

    // Definir um intervalo para verificar novas notificações a cada 1 minuto
    const interval = setInterval(fetchUnreadNotifications, 60000);

    return () => clearInterval(interval);
  }, [token]);

  return (
    // Sidebar container
    <div className="fixed top-0 left-0 w-64 h-full bg-white border-r border-slate-200 flex flex-col overflow-hidden">
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
      <nav className="flex-grow overflow-y-auto">
        <ul className="p-4 space-y-2">
          {/* Meus Chamados */}
          <li>
            <Link
              href="/cliente/meus-chamados"
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === '/cliente/meus-chamados'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <HomeIcon />
              <span>Meus Chamados</span>
            </Link>
          </li>

                    {/* Abrir Chamado */}
          <li>
            <Link
              href="/cliente/abrir-chamado"
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === '/cliente/abrir-chamado'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <AddIcon />
              <span>Abrir Chamado</span>
            </Link>
          </li>

          {/* Notificações com contador */}
          <li>
            <Link
              href="/cliente/notificacoes"
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === '/cliente/notificacoes'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <div className="relative">
                <NotificationIcon />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>Notificações</span>
            </Link>
          </li>

          {/* Meu Perfil */}
          <li>
            <Link
              href="/cliente/perfil"
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${pathname === '/cliente/perfil'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <ProfileIcon />
              <span>Meu Perfil</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout - sticky na parte inferior */}
      <div className="sticky bottom-0 w-full border-t border-slate-200 bg-white p-4">
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