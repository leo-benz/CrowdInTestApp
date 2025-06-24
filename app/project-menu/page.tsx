'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, KeyRound, UserRound, Info, Terminal } from 'lucide-react';

/**
 * Minimal subset of data returned by `window.AP.getContext()` when the app is
 * embedded inside Crowdin. We only declare the properties we actually use.
 */
interface CrowdinContext {
  project?: { id: number; name: string };
  user?: { id: number };
  [key: string]: unknown;
}

declare global {
  interface Window {
    AP?: {
      getContext: (callback: (context: CrowdinContext) => void) => void;
      getJwtToken: (callback: (token: string) => void) => void;
    };
  }
}

/**
 * React component rendered inside Crowdin's *Project Menu* iframe. Provides
 * diagnostic buttons to call the Crowdin JS API (`getContext`, `getJwtToken`)
 * and to test a backend endpoint (`/api/user`).
 */
export default function CrowdinPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  const showLoader = useCallback(() => {
    setLoading(true);
    setResult(null);
  }, []);

  /** Present the JSON result in the UI and hide the spinner. */
  const showResult = useCallback((res: unknown) => {
    setLoading(false);
    setResult(JSON.stringify(res, null, 2));
  }, []);

  useEffect(() => {
    /**
     * Check whether we are authorised inside Crowdin by attempting to fetch a
     * JWT token via the iframe bridge. Runs once on mount.
     */
    const checkAuthorization = () => {
      if (window.AP && typeof window.AP.getJwtToken === 'function') {
        window.AP.getJwtToken(token => {
          if (token) {
            setJwtToken(token);
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        });
      } else {
        setIsAuthorized(false);
      }
    };
    const timer = setTimeout(checkAuthorization, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleGetContext = () => {
    if (window.AP && typeof window.AP.getContext === 'function') {
      showLoader();
      window.AP.getContext(context => {
        showResult(context);
      });
    } else {
      showResult({ error: 'Crowdin AP object not available.' });
    }
  };

  const handleGetJwtToken = () => {
    if (window.AP && typeof window.AP.getJwtToken === 'function') {
      showLoader();
      window.AP.getJwtToken(token => {
        if (token) {
          setJwtToken(token);
          setIsAuthorized(true);
        }
        showResult({ token: token || 'No token received' });
      });
    } else {
      showResult({ error: 'Crowdin AP object not available.' });
    }
  };

  const handleShowUserDetails = () => {
    if (!jwtToken) {
      showResult({ error: 'JWT Token not available. Please get token first.' });
      return;
    }
    showLoader();
    fetch(`/api/user?jwtToken=${jwtToken}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.error?.message || `HTTP error! status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        showResult(data);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        showResult({ error: 'Failed to fetch user details', details: error.message });
      });
  };

  return (
    <>
      <Script src={process.env.NEXT_PUBLIC_CROWDIN_IFRAME_SRC} strategy="lazyOnload" />

      <div className="bg-background text-foreground min-h-screen">
        <main className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Crowdin App Demo Local 1123
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-lg">
              Interact with the Crowdin JS API and test your backend endpoints.
            </p>
          </div>

          {isAuthorized !== null && (
            <Alert variant={isAuthorized ? 'default' : 'destructive'} className="mb-8">
              {isAuthorized ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <AlertTitle>{isAuthorized ? 'Authorized' : 'Unauthorized'}</AlertTitle>
              <AlertDescription>
                {isAuthorized
                  ? 'Successfully authorized with Crowdin.'
                  : 'Could not get authorization token. Some actions may be unavailable.'}
              </AlertDescription>
            </Alert>
          )}
          {isAuthorized === null && (
            <div className="mb-8 flex justify-center">
              <Skeleton className="h-12 w-full max-w-md" />
            </div>
          )}

          <Card className="mb-8 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">API Actions</CardTitle>
              <CardDescription>
                Click buttons to interact with the Crowdin API or your backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4 pt-2">
              {isAuthorized && (
                <Button size="lg" onClick={handleShowUserDetails}>
                  <UserRound className="mr-2 h-4 w-4" /> Show User Details
                </Button>
              )}
              {!isAuthorized && (
                <Button size="lg" disabled>
                  <UserRound className="mr-2 h-4 w-4" /> Show User Details
                </Button>
              )}
              <Button variant="secondary" onClick={handleGetJwtToken}>
                <KeyRound className="mr-2 h-4 w-4" /> Get JWT Token
              </Button>
              <Button variant="secondary" onClick={handleGetContext}>
                <Info className="mr-2 h-4 w-4" /> Get Context
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Terminal className="text-muted-foreground mr-2 h-5 w-5" />
                API Response
              </CardTitle>
              <CardDescription>The response from the last action will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="bg-muted flex min-h-[200px] flex-col items-center justify-center rounded-b-lg p-4">
              {loading && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
                  <p className="text-muted-foreground text-sm">Fetching data...</p>
                  <Skeleton className="mt-2 h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              )}
              {!loading && result && (
                <pre className="bg-background w-full overflow-x-auto rounded-md border p-4 text-sm">
                  <code className="font-mono">{result}</code>
                </pre>
              )}
              {!loading && !result && (
                <p className="text-muted-foreground">
                  No results yet. Click an action button above.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
