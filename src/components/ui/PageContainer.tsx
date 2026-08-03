import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  dir?: 'rtl' | 'ltr';
}

export function PageContainer({ children, className = '', dir }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-slate-50/50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`} dir={dir}>
      {children}
    </div>
  );
}
