'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error page for Next.js App Router.
 * This page will be displayed when an error occurs in any route.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  React.useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error page:', error);
    }

    // Here you can log to your error reporting service
    // e.g., Sentry, LogRocket, etc.
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-4">
          <AlertTriangle className="text-destructive mx-auto h-20 w-20" />
          <div className="space-y-2">
            <h1 className="text-foreground text-3xl font-bold">Oops! Something went wrong</h1>
            <p className="text-muted-foreground text-lg">
              We encountered an unexpected error while loading this page.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="bg-muted rounded-lg border p-4 text-left text-sm">
              <summary className="text-foreground hover:text-primary cursor-pointer font-medium">
                🐛 Development Error Details
              </summary>
              <div className="mt-3 space-y-2">
                <div>
                  <strong>Error:</strong>
                  <pre className="bg-background mt-1 rounded border p-2 text-xs break-all whitespace-pre-wrap">
                    {error.message}
                  </pre>
                </div>
                {error.digest && (
                  <div>
                    <strong>Error Digest:</strong>
                    <code className="bg-background ml-2 rounded px-2 py-1 text-xs">
                      {error.digest}
                    </code>
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="bg-background mt-1 max-h-40 overflow-auto rounded border p-2 text-xs break-all whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        <div className="space-y-3">
          <Button onClick={reset} size="lg" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground text-xs">
          If this problem persists, please contact our support team.
        </div>
      </div>
    </div>
  );
}
