// src/app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se o usuário já estiver autenticado, redireciona para o dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
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
          
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => router.push('/login')}
            >
              Entrar
            </Button>
            <Button
              onClick={() => router.push('/register')}
            >
              Cadastrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-grow flex items-center bg-gradient-to-b from-blue-50 to-slate-100">
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Sistema de Suporte Simplificado
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Gerencie seus chamados de suporte de forma rápida e eficiente com nossa plataforma.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  onClick={() => router.push('/register')}
                >
                  Começar Agora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/login')}
                >
                  Já tenho uma conta
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Ilustração vetorial simplificada */}
                <svg
                  viewBox="0 0 500 500"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <circle cx="250" cy="250" r="200" fill="#EFF6FF" />
                  <rect x="150" y="150" width="200" height="200" rx="10" fill="white" stroke="#2563EB" strokeWidth="4" />
                  <rect x="170" y="180" width="160" height="20" rx="4" fill="#DBEAFE" />
                  <rect x="170" y="220" width="160" height="20" rx="4" fill="#DBEAFE" />
                  <rect x="170" y="260" width="160" height="20" rx="4" fill="#DBEAFE" />
                  <rect x="170" y="300" width="80" height="30" rx="4" fill="#2563EB" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Recurso 1 */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Gestão de Tickets</h3>
              <p className="text-slate-600">
                Crie, acompanhe e resolva tickets de suporte em uma interface intuitiva.
              </p>
            </div>

            {/* Recurso 2 */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">SLA Integrado</h3>
              <p className="text-slate-600">
                Gerenciamento automático de prazos baseado em prioridades e categorias.
              </p>
            </div>

            {/* Recurso 3 */}
            <div className="bg-slate-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Relatórios</h3>
              <p className="text-slate-600">
                Acompanhe métricas e desempenho com relatórios personalizados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Sobre</h3>
              <p className="text-slate-300">
                O HelpDesk é um sistema completo para gerenciamento de chamados de suporte técnico.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white">Início</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">Recursos</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contato</h3>
              <p className="text-slate-300">
                suporte@helpdesk.com<br />
                (00) 1234-5678
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-4 text-center text-slate-400">
            &copy; {new Date().getFullYear()} HelpDesk - Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}