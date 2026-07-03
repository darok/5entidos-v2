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

// Primary: ytdl.getInfo() — returns metadata + caption track baseUrls in one call
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

    // Caption tracks are in the raw player_response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tracks: any[] = (info.player_response as any)
      ?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []

    // Prefer manual ES, then auto ES, then any auto-generated, then first available
    const track =
      tracks.find((t) => t.languageCode === "es" && t.kind !== "asr") ??
      tracks.find((t) => t.languageCode === "es") ??
      tracks.find((t) => t.kind === "asr") ??
      tracks[0] ?? null

    let captionsText: string | null = null
    if (track?.baseUrl) {
      try {
        const res = await fetch(track.baseUrl as string, { signal: AbortSignal.timeout(8000) })
        if (res.ok) {
          captionsText = parseCaptionXml(await res.text()) || null
        }
      } catch {
        // captions fetch failed — continue without them
      }
    }

    return { title, description, captionsText, formats: info.formats }
  } catch {
    return null
  }
}

// Fallback title-only source: YouTube oEmbed (public API, no auth, datacenter-friendly)
async function fetchOEmbedTitle(videoUrl: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.title ?? null
  } catch {
    return null
  }
}

// Fallback captions: youtube-transcript package
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

// Audio fallback: use formats already obtained from ytdl.getInfo() to avoid a second info call
async function downloadAudio(formats: ytdl.videoFormat[]): Promise<Buffer> {
  const audioFormats = ytdl.filterFormats(formats, "audioonly")
  if (!audioFormats.length) throw new Error("No audio formats available")

  // Lowest bitrate = smallest download
  audioFormats.sort((a, b) => (a.audioBitrate ?? 999) - (b.audioBitrate ?? 999))
  const format = audioFormats[0]

  const res = await fetch(format.url, { signal: AbortSignal.timeout(45_000) })
  if (!res.ok) throw new Error(`Audio fetch failed: ${res.status}`)

  const MAX_BYTES = 24 * 1024 * 1024
  const reader = res.body!.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    total += value.length
    if (total >= MAX_BYTES) break
  }

  return Buffer.concat(chunks)
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

    let title: string | null = null
    let description: string | null = null
    let captionsText: string | null = null
    let ytdlFormats: ytdl.videoFormat[] = []
    let source: "subtitles" | "audio" = "subtitles"

    // ── Primary: ytdl.getInfo() ───────────────────────────────────
    const ytdlData = await fetchViaYtdl(url)
    if (ytdlData) {
      title = ytdlData.title
      description = ytdlData.description
      captionsText = ytdlData.captionsText
      ytdlFormats = ytdlData.formats
    }

    // ── Fallback: oEmbed for title if ytdl failed ─────────────────
    if (!title) {
      title = await fetchOEmbedTitle(url)
    }

    // ── Fallback: youtube-transcript for captions ─────────────────
    if (!captionsText) {
      captionsText = await fetchCaptionsViaPackage(videoId)
    }

    // ── Audio fallback when no captions at all ────────────────────
    if (!captionsText) {
      source = "audio"
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        // If ytdl.getInfo() succeeded, use those format URLs (no second auth round-trip)
        // Otherwise fall back to a fresh ytdl stream
        let audioBuffer: Buffer
        if (ytdlFormats.length) {
          audioBuffer = await downloadAudio(ytdlFormats)
        } else {
          const MAX_BYTES = 24 * 1024 * 1024
          const stream = ytdl(url, { filter: "audioonly", quality: "lowestaudio" })
          const chunks: Buffer[] = []
          let total = 0
          for await (const chunk of stream) {
            const buf = Buffer.from(chunk)
            total += buf.length
            chunks.push(buf)
            if (total >= MAX_BYTES) break
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
        console.error("Audio fallback failed:", audioErr)
      }
    }

    // Build transcript from whatever we managed to collect
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

    const transcript = parts.join("\n\n")
    return NextResponse.json({ transcript, source })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al procesar el video" }, { status: 500 })
  }
}
