'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Ruler, Info } from 'lucide-react';
import type { TextareaEditedEvent } from '@/types/crowdin';
import { measureTextWidthWithCanvas } from '@/lib/text-measurement';
import '@/types/crowdin';

interface StringData {
  id: number;
  text: string;
  context: string;
  max_length: number;
  file: {
    id: number;
    name: string;
  };
  MaxWidthPixel?: number;
  [key: string]: unknown;
}

export default function LengthCheckerPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [textWidth, setTextWidth] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [maxWidthPixel, setMaxWidthPixel] = useState<number | null>(null);
  const [stringData, setStringData] = useState<StringData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const measureTextWidth = useCallback((text: string): number => {
    return measureTextWidthWithCanvas(text, canvasRef.current);
  }, []);

  const fetchStringData = useCallback(
    async (stringId: number) => {
      if (!jwtToken) {
        return;
      }

      try {
        const response = await fetch(`/api/strings/${stringId}?jwtToken=${jwtToken}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setStringData(data);
        setMaxWidthPixel(data.fields?.widthpx || data.MaxWidthPixel || null);
        setError(null);
      } catch (error) {
        console.error('Error fetching string data:', error);
        setError(
          `Failed to fetch string data: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    },
    [jwtToken]
  );

  const updateTranslation = useCallback(
    (text: string, stringId?: number) => {
      setTranslation(text);
      if (text.trim()) {
        const width = measureTextWidth(text);
        setTextWidth(width);
        setError(null);

        if (stringId) {
          fetchStringData(stringId);
        }
      } else {
        setTextWidth(null);
      }
    },
    [measureTextWidth, fetchStringData]
  );

  useEffect(() => {
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

  useEffect(() => {
    const handleTextareaEdited = (data: TextareaEditedEvent) => {
      updateTranslation(data.newText || '', data.id);
    };

    const setupEventListener = () => {
      if (window.AP && window.AP.events && typeof window.AP.events.on === 'function') {
        window.AP.events.on('textarea.edited', handleTextareaEdited);
        setIsListening(true);
        setError(null);
        return true;
      }
      return false;
    };

    const timer = setTimeout(() => {
      if (!setupEventListener()) {
        setError(
          'Crowdin events API not available. This feature only works within the Crowdin editor.'
        );
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (window.AP && window.AP.events && typeof window.AP.events.off === 'function') {
        window.AP.events.off('textarea.edited', handleTextareaEdited);
      }
    };
  }, [updateTranslation]);

  const handleClearMeasurement = () => {
    setTranslation(null);
    setTextWidth(null);
    setError(null);
  };

  const handleMeasureCustomText = (text: string) => {
    if (!text.trim()) {
      setError('Please enter some text to measure.');
      return;
    }

    setTranslation(text);
    const width = measureTextWidth(text);
    setTextWidth(width);
    setError(null);
  };

  return (
    <>
      <Script src={process.env.NEXT_PUBLIC_CROWDIN_IFRAME_SRC} strategy="lazyOnload" />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="bg-background text-foreground min-h-screen">
        <main className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Translation Length Checker
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-lg">
              Measure the pixel width of translations to ensure they fit your design constraints.
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

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-8 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Real-time Translation Tracking</CardTitle>
              <CardDescription>
                {isListening
                  ? 'Automatically measuring translations as you type in the Crowdin editor.'
                  : 'Waiting for connection to Crowdin editor...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4 pt-2">
              <div className="bg-muted flex items-center gap-2 rounded-md px-4 py-2">
                <div
                  className={`h-3 w-3 rounded-full ${isListening ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}
                ></div>
                <span className="text-sm font-medium">
                  {isListening ? 'Listening for changes' : 'Not connected'}
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  const text = prompt('Enter text to measure:');
                  if (text) handleMeasureCustomText(text);
                }}
              >
                <Ruler className="mr-2 h-4 w-4" /> Measure Custom Text
              </Button>
              {translation && (
                <Button variant="outline" onClick={handleClearMeasurement}>
                  Clear
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Info className="text-muted-foreground mr-2 h-5 w-5" />
                Measurement Results
              </CardTitle>
              <CardDescription>
                Translation text and its pixel width will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-muted flex min-h-[200px] flex-col items-center justify-center rounded-b-lg p-4">
              {translation && textWidth !== null && (
                <div className="w-full space-y-4">
                  {stringData && (
                    <div className="bg-background rounded-md border p-4">
                      <h3 className="mb-2 font-semibold">Source String Information:</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">ID:</span> {stringData.id}
                        </p>
                        <p>
                          <span className="font-medium">Text:</span> {stringData.text}
                        </p>
                        <p>
                          <span className="font-medium">Context:</span>{' '}
                          {stringData.context || 'None'}
                        </p>
                        <p>
                          <span className="font-medium">File:</span>{' '}
                          {stringData.file?.name || 'Unknown'}
                        </p>
                        {stringData.MaxWidthPixel && (
                          <p>
                            <span className="font-medium">Max Width Pixel:</span>{' '}
                            {stringData.MaxWidthPixel}px
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="bg-background rounded-md border p-4">
                    <h3 className="mb-4 font-semibold">Translation Text Preview:</h3>
                    <div className="space-y-4">
                      {maxWidthPixel && (
                        <div className="mb-2 text-xs text-gray-500">
                          Max width: {maxWidthPixel}px
                        </div>
                      )}
                      <div className="relative h-5">
                        {maxWidthPixel && (
                          <div
                            className="absolute top-0 left-0 h-5 bg-gray-200"
                            style={{ width: `${maxWidthPixel}px` }}
                          />
                        )}
                        <div
                          className={`absolute top-0 left-0 h-5 ${
                            maxWidthPixel && textWidth && textWidth > maxWidthPixel
                              ? 'bg-red-100'
                              : 'bg-green-100'
                          }`}
                          style={{
                            width: `${textWidth}px`,
                          }}
                        />
                        <span
                          className="absolute top-0 left-0"
                          style={{
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '16px',
                            lineHeight: '20px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {translation}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">Actual width: {textWidth}px</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-md border p-4 text-center">
                    <h3 className="mb-2 font-semibold">Measurement Summary:</h3>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-muted-foreground mb-1 text-sm">Actual Width</p>
                        <p
                          className={`text-2xl font-bold ${
                            maxWidthPixel && textWidth && textWidth > maxWidthPixel
                              ? 'text-red-500'
                              : 'text-green-600'
                          }`}
                        >
                          {textWidth}px
                        </p>
                      </div>
                      {maxWidthPixel && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-1 text-sm">Maximum Width</p>
                          <p className="text-2xl font-bold text-gray-600">{maxWidthPixel}px</p>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2 text-sm">
                      Font: 16px Arial (as used in measurement)
                    </p>
                    {maxWidthPixel && textWidth && textWidth > maxWidthPixel && (
                      <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                        <p className="mb-1 text-sm font-medium text-red-700">
                          ⚠️ Text exceeds maximum width
                        </p>
                        <p className="text-xs text-red-600">
                          Overflow: {textWidth - maxWidthPixel} pixels (
                          {(((textWidth - maxWidthPixel) / maxWidthPixel) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    )}
                    {maxWidthPixel && textWidth && textWidth <= maxWidthPixel && (
                      <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3">
                        <p className="mb-1 text-sm font-medium text-green-700">
                          ✅ Text fits within constraints
                        </p>
                        <p className="text-xs text-green-600">
                          Remaining space: {maxWidthPixel - textWidth} pixels (
                          {(((maxWidthPixel - textWidth) / maxWidthPixel) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!translation && !error && (
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">
                    {isListening
                      ? 'Start typing in the Crowdin editor to see real-time measurements.'
                      : 'No translation measured yet. Use the custom text option above.'}
                  </p>
                  {isListening && (
                    <p className="text-muted-foreground text-sm">
                      The width will update automatically as you type.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
