import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import ErrorBoundary from '@/components/error-boundary';
import React from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * Global application metadata consumed by Next.js for `<head>` rendering.
 */
export const metadata: Metadata = {
  title: {
    default: 'Crowdin App - Quick Start Guide',
    template: '%s | Crowdin App',
  },
  description:
    'A sample Crowdin App demonstrating best practices for building localization platform integrations. Learn how to create custom file formats, API integrations, and more.',
  keywords: [
    'Crowdin',
    'localization',
    'translation',
    'i18n',
    'internationalization',
    'app development',
    'API integration',
  ],
  authors: [{ name: 'Crowdin' }],
  creator: 'Crowdin',
  publisher: 'Crowdin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Crowdin App',
    title: 'Crowdin App - Quick Start Guide',
    description: 'Learn to build powerful localization apps with Crowdin platform',
    images: [
      {
        url: '/logo.svg',
        width: 180,
        height: 54,
        alt: 'Crowdin Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crowdin App - Quick Start Guide',
    description: 'Learn to build powerful localization apps with Crowdin platform',
    images: ['/logo.svg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    // Add your verification codes here when ready
    // google: 'verification_code',
    // yandex: 'verification_code',
    // yahoo: 'verification_code',
  },
};

/**
 * The root layout wraps **every** route in the application. Here we register
 * global providers (e.g. theme provider), fonts and top-level HTML structure.
 * Error boundary is added for global error catching.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <div className="absolute top-6 right-6 z-50">
              <ThemeToggle />
            </div>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
