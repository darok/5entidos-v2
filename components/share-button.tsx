"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"

interface ShareButtonProps {
  title: string
}

// Share button: native share sheet on mobile, clipboard copy on desktop
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
    <Button variant="outline" size="sm" onClick={handleShare}>
      {copied
        ? <Check className="mr-1.5 h-4 w-4" />
        : <Share2 className="mr-1.5 h-4 w-4" />}
      {copied ? "¡Copiado!" : "Compartir"}
    </Button>
  )
}
