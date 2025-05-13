// src/app/(auth)/layout.tsx

import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-slate-100">
      {/* Header simples */}
      <header className="py-4 border-b bg-white">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
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
          </Link>
        </div>
      </header>

      {/* Conteúdo principal com formulário centralizado */}
      <main className="flex-grow flex items-center justify-center p-4 py-8">
        {children}
      </main>

      {/* Footer simples */}
      <footer className="py-4 text-center text-sm text-slate-500 border-t bg-white">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} HelpDesk - Sistema de Suporte
        </div>
      </footer>
    </div>
  );
}