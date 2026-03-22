import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value)
}

export function clampRangeValue(value: number) {
  return Math.max(0, Math.min(10, Math.round(value)))
}
