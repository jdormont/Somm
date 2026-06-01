import { Component, ErrorInfo, ReactNode } from 'react';
import { Wine } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryFallbackProps {
  title?: string;
  message?: string;
}

export function ErrorBoundaryFallback({
  title = "Something went wrong",
  message = "We encountered an unexpected error, but don't worry, your cellar history is safe."
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6 bg-black">
      <div className="relative overflow-hidden rounded-2xl bg-wine-slate-900/80 backdrop-blur-md border border-champagne-400/20 max-w-md w-full text-center p-8 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-somm-red-900/20 via-transparent to-champagne-400/5 pointer-events-none" />

        <div className="relative flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full border border-champagne-400/30 bg-wine-slate-950/80 text-champagne-400 shadow-inner shadow-black/50 mb-6">
            <Wine className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-3xl text-champagne-100 font-light mb-4 leading-tight">
            {title}
          </h2>

          <p className="font-sans text-sm text-champagne-100/70 tracking-wide mb-8 leading-relaxed">
            {message}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-somm-red-900 border border-somm-red-500/30 text-champagne-100 text-sm font-medium hover:bg-somm-red-500 hover:text-white hover:border-somm-red-500/50 transition-all duration-300 shadow-lg shadow-black/20"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorBoundaryFallback />;
    }

    return this.props.children;
  }
}
