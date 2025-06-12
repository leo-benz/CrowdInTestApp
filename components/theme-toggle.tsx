'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

/**
 * Button that toggles between light and dark themes using `next-themes`.
 *
 * The component only renders once it is **mounted** on the client to avoid
 * mismatches between SSR and CSR. Until then the button is disabled so that
 * there is no hydration flash.
 */
export function ThemeToggle() {
  // Obtain the current theme + setter from `next-themes` context.
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = React.useState(false);
  /**
   * Ensure that we only access `window.matchMedia` after the component is
   * mounted (this code never runs on the server).
   */
  React.useEffect(() => setMounted(true), []);

  const currentTheme =
    theme === 'system'
      ? mounted && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  /** Switch theme and persist preference via `next-themes`. */
  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {currentTheme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
