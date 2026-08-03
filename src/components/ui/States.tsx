import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />;
}

export function DestinationCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3 space-y-3 shadow-sm">
      <Skeleton className="w-full h-48 rounded-xl" />
      <div className="space-y-2 px-1">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto my-8 space-y-4 shadow-sm">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
        {icon || <Sparkles className="w-8 h-8 text-slate-400" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  traceId?: string;
}

export function ErrorState({
  title = 'تعذر تحميل البيانات',
  message = 'حدث خطأ أثناء الاتصال بالخادم. يرجى إعادة المحاولة.',
  onRetry,
  traceId
}: ErrorStateProps) {
  return (
    <div className="bg-rose-50/60 border border-rose-200/80 rounded-3xl p-8 text-center max-w-md mx-auto my-8 space-y-4">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-rose-900">{title}</h3>
        <p className="text-xs text-rose-700">{message}</p>
        {traceId && <p className="text-[10px] text-rose-400 font-mono pt-1">Ref: {traceId}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
