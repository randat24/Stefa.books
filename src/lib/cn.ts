import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge classnames with TailwindCSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}