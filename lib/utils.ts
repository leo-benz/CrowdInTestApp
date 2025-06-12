import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Concatenate class names conditionally while ensuring Tailwind CSS classes are
 * merged correctly (thanks to `tailwind-merge`).
 *
 * This helper is a thin wrapper around `clsx` + `tailwind-merge` that we use
 * across the project to build predictable `className` strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
