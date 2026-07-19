import React, { Component } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 text-4xl">{'\u26A0\uFE0F'}</div>
          <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight mb-2">Something went wrong</h2>
          <p className="text-[14px] text-zinc-500 font-medium mb-8 max-w-md">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={this.handleRetry} className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-[14px] hover:scale-105 transition-transform" aria-label="Try again">Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
