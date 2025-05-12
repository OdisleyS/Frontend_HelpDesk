// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';

// Configuração da fonte Inter
const inter = Inter({ subsets: ['latin'] });

// Metadados da aplicação
export const metadata: Metadata = {
  title: 'HelpDesk - Sistema de Suporte',
  description: 'Sistema de gerenciamento de chamados e suporte técnico',
};

// Layout raiz da aplicação
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}