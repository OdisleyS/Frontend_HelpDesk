// src/components/ui/input.tsx

import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Configuração de variantes do input
const inputVariants = cva(
  // Base styles
  "flex w-full rounded-md border border-slate-300 bg-transparent p-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      error: {
        true: "border-red-500 focus-visible:ring-red-600",
        false: "",
      },
    },
    defaultVariants: {
      error: false,
    },
  }
);

// Props do input
export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

// Componente de input
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        className={inputVariants({ error, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

// Componente de campo de formulário com label e mensagem de erro
export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}