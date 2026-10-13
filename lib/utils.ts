import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { RATING_LABELS } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Linear scale of a quantity by a multiplier
export function scaleQuantity(quantity: number | null, scale: number): number | null {
  if (quantity === null) return null
  return quantity * scale
}

// Denominators shown as fractions, in order of preference (1/2 wins over 2/4, 10/20, …)
const FRACTION_DENOMINATORS = [2, 3, 4, 5, 6, 8, 10, 20]
// Absorbs float noise and lets typed approximations like 0.33 / 0.66 / 0.16 read as thirds and sixths
const FRACTION_TOLERANCE = 0.007

// Formats a quantity for display: values below 1 as "1/2", "3/4", "1/6" when a fraction fits; everything else as at most 2 decimals
export function formatQuantity(quantity: number): string {
  const decimal = String(Math.round(quantity * 100) / 100)
  if (quantity <= 0 || quantity >= 1 - FRACTION_TOLERANCE) return decimal

  for (const denominator of FRACTION_DENOMINATORS) {
    const numerator = Math.round(quantity * denominator)
    if (numerator > 0 && Math.abs(quantity - numerator / denominator) < FRACTION_TOLERANCE) {
      return `${numerator}/${denominator}`
    }
  }
  return decimal
}

// Capitalizes the first letter, leaving the rest untouched
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Format minutes into a human-readable string like "1h 30m"
export function formatTime(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return "—"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export { RATING_LABELS }
