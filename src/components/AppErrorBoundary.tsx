import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
  errorTraceId?: string;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || String(error) };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              !
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-100">حدث خطأ غير متوقع</h2>
              <p className="text-sm text-slate-400">
                عذراً، واجه التطبيق مشكلة أثناء تحميل هذه الصفحة.
              </p>
              {this.state.errorMessage && (
                <div className="text-xs text-rose-300 font-mono bg-slate-950 p-3 rounded-xl border border-rose-500/30 text-left overflow-x-auto max-h-32">
                  {this.state.errorMessage}
                </div>
              )}
              {this.state.errorTraceId && (
                <p className="text-xs text-slate-500 font-mono mt-2">
                  Trace ID: {this.state.errorTraceId}
                </p>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20"
              >
                إعادة المحاولة
              </button>
              <a
                href="/"
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl transition"
              >
                الرئيسية
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
