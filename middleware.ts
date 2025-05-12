// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/register', '/verify'];

// Middleware para verificar autenticação
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Se for uma rota pública, permite o acesso
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Verifica se o usuário está autenticado
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    // Redireciona para o login se não estiver autenticado
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verifica se o token é válido
    const decoded = jwtDecode<{ exp: number }>(token);
    
    if (decoded.exp * 1000 < Date.now()) {
      // Redireciona para o login se o token expirou
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // O usuário está autenticado, permite o acesso
    return NextResponse.next();
  } catch (error) {
    // Se o token for inválido, redireciona para o login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configuração para aplicar o middleware apenas nas rotas protegidas
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api routes
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - /login, /register, /verify (public routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|verify).*)',
  ],
};