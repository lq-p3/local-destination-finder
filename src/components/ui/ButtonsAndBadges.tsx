import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  isLoading?: boolean;
  variant?: 'emerald' | 'blue' | 'dark';
}

export function PrimaryButton({
  children,
  icon,
  isLoading = false,
  variant = 'emerald',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20',
    dark: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'slate' | 'rose';
  className?: string;
}

export function Badge({ children, variant = 'slate', className = '' }: BadgeProps) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
