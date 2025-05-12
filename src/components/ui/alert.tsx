// src/components/ui/alert.tsx

import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Configuração de variantes do alerta
const alertVariants = cva(
  // Base styles
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-slate-50 text-slate-900 border-slate-200",
        destructive: "border-red-500 text-red-900 bg-red-50",
        success: "border-green-500 text-green-900 bg-green-50",
        warning: "border-yellow-500 text-yellow-900 bg-yellow-50",
        info: "border-blue-500 text-blue-900 bg-blue-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Props do alerta
export interface AlertProps extends VariantProps<typeof alertVariants> {
  className?: string;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

// Componente de alerta
export function Alert({
  className,
  variant,
  title,
  children,
  onClose,
}: AlertProps) {
  return (
    <div className={alertVariants({ variant, className })}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-900"
          aria-label="Fechar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      
      <div className="flex gap-3">
        {variant === "destructive" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {variant === "success" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}

        <div className="space-y-1">
          {title && (
            <h5 className="font-medium leading-none tracking-tight">
              {title}
            </h5>
          )}
          <div className="text-sm text-slate-800">{children}</div>
        </div>
      </div>
    </div>
  );
}