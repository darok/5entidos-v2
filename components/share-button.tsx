"use client"

import { useState } from "react"
import { Share2, Check } from "lucide-react"

interface ShareButtonProps {
  title: string
}

// Floating action button — share sheet on mobile, clipboard copy on desktop
export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Compartir"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
    >
      {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
    </button>
  )
}
