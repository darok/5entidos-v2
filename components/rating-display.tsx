import { Badge } from "@/components/ui/badge"
import { RATING_LABELS } from "@/types"

interface RatingDisplayProps {
  rating: number | null
}

// Renders a colored badge with the rating label
export function RatingDisplay({ rating }: RatingDisplayProps) {
  if (!rating) return null
  const label = RATING_LABELS[rating]
  if (!label) return null

  const variant =
    rating === 4 ? "default" :
    rating === 3 ? "secondary" :
    "outline"

  return <Badge variant={variant}>{label}</Badge>
}
