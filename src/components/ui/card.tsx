// src/components/ui/card.tsx

import { ReactNode } from 'react';

// Props do Card
export interface CardProps {
  className?: string;
  children: ReactNode;
}

// Componente Card
export function Card({ className, children }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Props do CardHeader
export interface CardHeaderProps {
  className?: string;
  children: ReactNode;
}

// Componente CardHeader
export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={`p-6 border-b border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

// Props do CardTitle
export interface CardTitleProps {
  className?: string;
  children: ReactNode;
}

// Componente CardTitle
export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>
      {children}
    </h3>
  );
}

// Props do CardDescription
export interface CardDescriptionProps {
  className?: string;
  children: ReactNode;
}

// Componente CardDescription
export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-slate-500 ${className}`}>
      {children}
    </p>
  );
}

// Props do CardContent
export interface CardContentProps {
  className?: string;
  children: ReactNode;
}

// Componente CardContent
export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

// Props do CardFooter
export interface CardFooterProps {
  className?: string;
  children: ReactNode;
}

// Componente CardFooter
export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={`p-6 pt-0 flex items-center ${className}`}>
      {children}
    </div>
  );
}