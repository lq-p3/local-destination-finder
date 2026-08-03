import React, { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, icon, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-secondary">{icon}</span>}
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
        </div>
        {subtitle && <p className="text-sm sm:text-base text-slate-500 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
