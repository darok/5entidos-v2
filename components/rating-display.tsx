interface RatingDisplayProps {
  rating: number | null
}

// Renders filled/hollow stars for a 1–4 rating
export function RatingDisplay({ rating }: RatingDisplayProps) {
  if (!rating) return null
  return (
    <span className="text-amber-400 text-sm tracking-tight" aria-label={`${rating} de 4`}>
      {"★".repeat(rating)}{"☆".repeat(4 - rating)}
    </span>
  )
}
