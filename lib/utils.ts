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
