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
const FRACTION_DENOMINATORS = [2, 3, 4, 5, 10, 20]
// Absorbs float noise and lets typed approximations like 0.33 / 0.67 read as thirds
const FRACTION_TOLERANCE = 0.005

// Formats a quantity for display: "1/2", "1 1/3", "3/4"; falls back to at most 2 decimals when no fraction fits
export function formatQuantity(quantity: number): string {
  const whole = Math.floor(quantity)
  const remainder = quantity - whole
  if (remainder < FRACTION_TOLERANCE) return String(whole)
  if (1 - remainder < FRACTION_TOLERANCE) return String(whole + 1)

  for (const denominator of FRACTION_DENOMINATORS) {
    const numerator = Math.round(remainder * denominator)
    if (numerator > 0 && Math.abs(remainder - numerator / denominator) < FRACTION_TOLERANCE) {
      const fraction = `${numerator}/${denominator}`
      return whole > 0 ? `${whole} ${fraction}` : fraction
    }
  }
  return String(Math.round(quantity * 100) / 100)
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
