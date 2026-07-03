import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { YoutubeTranscript } from "youtube-transcript"
import ytdl from "@distube/ytdl-core"
import OpenAI from "openai"

export const maxDuration = 60

// Extracts a video ID from any common YouTube URL format
function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("?")[0] || null
    }
    if (parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v")
    }
    const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/)
    if (shortsMatch) return shortsMatch[1]
    return null
  } catch {
    return null
  }
}

// Decodes common HTML entities
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
}

// Strips TTML/XML caption markup to plain text
function parseCaptionXml(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
}

// Resolves after `ms` milliseconds with null — used to race against hanging fetches
function timeout<T>(ms: number): Promise<T | null> {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms))
}

// ytdl.getInfo() — metadata + caption track URLs + audio formats in one call
async function fetchViaYtdl(videoUrl: string): Promise<{
  title: string | null
  description: string | null
  captionsText: string | null
  formats: ytdl.videoFormat[]
} | null> {
  try {
    const info = await ytdl.getInfo(videoUrl)
    const title = info.videoDetails.title || null
    const description = info.videoDetails.description || null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracks: any[] = (info.player_response as any)
      ?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []

    const track =
      tracks.find((t) => t.languageCode === "es" && t.kind !== "asr") ??
      tracks.find((t) => t.languageCode === "es") ??
      tracks.find((t) => t.kind === "asr") ??
      tracks[0] ?? null

    let captionsText: string | null = null
    if (track?.baseUrl) {
      try {
        const res = await fetch(track.baseUrl as string, { signal: AbortSignal.timeout(8000) })
        if (res.ok) captionsText = parseCaptionXml(await res.text()) || null
      } catch { /* caption fetch failed */ }
    }

    return { title, description, captionsText, formats: info.formats }
  } catch {
    return null
  }
}

// oEmbed — reliable public API for title, no auth required
async function fetchOEmbedTitle(videoUrl: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return (data.title as string) ?? null
  } catch {
    return null
  }
}

// youtube-transcript package — fetches auto-generated or manual captions
async function fetchCaptionsViaPackage(videoId: string): Promise<string | null> {
  try {
    let items
    try {
      items = await YoutubeTranscript.fetchTranscript(videoId, { lang: "es" })
    } catch {
      items = await YoutubeTranscript.fetchTranscript(videoId)
    }
    return items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim() || null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { url } = await request.json()
    if (!url?.trim()) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 })
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: "URL de YouTube inválida" }, { status: 400 })
    }

    // Run all three sources in parallel with independent timeouts.
    // ytdl.getInfo() can hang for 30-60s on datacenter IPs blocked by YouTube,
    // so it races against a 12s cutoff. oEmbed and captions run concurrently.
    const [ytdlData, oembedTitle, captionsFromPackage] = await Promise.all([
      Promise.race([fetchViaYtdl(url), timeout<Awaited<ReturnType<typeof fetchViaYtdl>>>(12_000)]),
      fetchOEmbedTitle(url),
      fetchCaptionsViaPackage(videoId),
    ])

    const title: string | null = ytdlData?.title ?? oembedTitle
    const description: string | null = ytdlData?.description ?? null
    let captionsText: string | null = ytdlData?.captionsText ?? captionsFromPackage
    const ytdlFormats: ytdl.videoFormat[] = ytdlData?.formats ?? []
    let source: "subtitles" | "audio" = captionsText ? "subtitles" : "audio"

    console.log(`[youtube-import] videoId=${videoId} title=${title} captions=${!!captionsText} ytdlOK=${!!ytdlData} oembedOK=${!!oembedTitle} pkgCaptions=${!!captionsFromPackage}`)

    // Audio fallback — only when no captions found at all
    if (!captionsText) {
      source = "audio"
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        let audioBuffer: Buffer

        if (ytdlFormats.length) {
          // Reuse format URLs already obtained from getInfo (same auth context)
          const audioFormats = ytdl.filterFormats(ytdlFormats, "audioonly")
          if (!audioFormats.length) throw new Error("No audio formats")
          audioFormats.sort((a, b) => (a.audioBitrate ?? 999) - (b.audioBitrate ?? 999))
          const res = await fetch(audioFormats[0].url, { signal: AbortSignal.timeout(40_000) })
          if (!res.ok) throw new Error(`Audio fetch ${res.status}`)
          const MAX = 24 * 1024 * 1024
          const reader = res.body!.getReader()
          const chunks: Uint8Array[] = []
          let total = 0
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
            total += value.length
            if (total >= MAX) break
          }
          audioBuffer = Buffer.concat(chunks)
        } else {
          // Fresh ytdl stream as last resort
          const MAX = 24 * 1024 * 1024
          const stream = ytdl(url, { filter: "audioonly", quality: "lowestaudio" })
          const chunks: Buffer[] = []
          let total = 0
          for await (const chunk of stream) {
            const buf = Buffer.from(chunk)
            total += buf.length
            chunks.push(buf)
            if (total >= MAX) break
          }
          audioBuffer = Buffer.concat(chunks)
        }

        const audioFile = new File([new Uint8Array(audioBuffer)], "audio.mp4", { type: "audio/mp4" })
        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-1",
          language: "es",
        })
        captionsText = transcription.text || null
      } catch (audioErr) {
        console.error("[youtube-import] audio fallback failed:", audioErr)
      }
    }

    const parts: string[] = []
    if (title) parts.push(`Título del video: ${title}`)
    if (description?.trim()) parts.push(`Descripción del video:\n${decodeEntities(description)}`)
    if (captionsText) parts.push(`Contenido hablado:\n${captionsText}`)

    if (!parts.length) {
      return NextResponse.json(
        { error: "No se pudo obtener contenido del video. Verificá que el link sea correcto y que el video sea público." },
        { status: 422 }
      )
    }

    return NextResponse.json({ transcript: parts.join("\n\n"), source })
  } catch (error) {
    console.error("[youtube-import] unexpected error:", error)
    return NextResponse.json({ error: "Error al procesar el video" }, { status: 500 })
  }
}
