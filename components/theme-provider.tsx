'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

/**
 * Thin wrapper around `next-themes` that exposes theme context to the rest of
 * the application. Doing this in one place keeps our tree clean and gives us a
 * single location to tweak default behaviour (e.g. CSS attribute name).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
