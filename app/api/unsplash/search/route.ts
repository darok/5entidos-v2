import { NextRequest, NextResponse } from "next/server"

interface UnsplashPhoto {
  id: string
  urls: { small: string; regular: string }
  alt_description: string | null
  links: { download_location: string }
}

// GET /api/unsplash/search?query=... — proxies Unsplash API, keeps key server-side
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")
  if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 })

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  )

  if (!res.ok) return NextResponse.json({ error: "Unsplash request failed" }, { status: 502 })

  const data = await res.json()
  const results = (data.results ?? []).map((p: UnsplashPhoto) => ({
    id: p.id,
    urls: { small: p.urls.small, regular: p.urls.regular },
    alt: p.alt_description ?? "",
    downloadUrl: p.links.download_location,
  }))

  return NextResponse.json(results)
}
