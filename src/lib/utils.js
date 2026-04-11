import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 

export function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

export const isIframe = window.self !== window.top;
