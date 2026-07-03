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

// Decodes common HTML entities found in og: meta tag values
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
}

// Scrapes title and description from YouTube page og: meta tags
async function fetchVideoMetadata(videoId: string): Promise<{ title: string | null; description: string | null }> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; recipe-import/1.0)" },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { title: null, description: null }
    const html = await res.text()
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/)
    const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/)
    return {
      title: titleMatch ? decodeEntities(titleMatch[1]) : null,
      description: descMatch ? decodeEntities(descMatch[1]) : null,
    }
  } catch {
    return { title: null, description: null }
  }
}

// Downloads the lowest-quality audio stream from a YouTube video, up to Whisper's 25MB limit
async function downloadAudio(videoId: string): Promise<Buffer> {
  const MAX_BYTES = 24 * 1024 * 1024
  const stream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
    filter: "audioonly",
    quality: "lowestaudio",
  })
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of stream) {
    const buf = Buffer.from(chunk)
    total += buf.length
    chunks.push(buf)
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

    // Always fetch metadata — title and description often contain the recipe
    const metadata = await fetchVideoMetadata(videoId)

    // Try subtitles first, fall back to Whisper audio transcription
    let captionsText: string | null = null
    let source: "subtitles" | "audio" = "subtitles"

    try {
      let items
      try {
        items = await YoutubeTranscript.fetchTranscript(videoId, { lang: "es" })
      } catch {
        items = await YoutubeTranscript.fetchTranscript(videoId)
      }
      captionsText = items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim()
    } catch {
      // No subtitles — download audio and transcribe with Whisper
      source = "audio"
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const audioBuffer = await downloadAudio(videoId)
        const audioFile = new File([new Uint8Array(audioBuffer)], "audio.mp4", { type: "audio/mp4" })
        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-1",
          language: "es",
        })
        captionsText = transcription.text
      } catch (audioErr) {
        console.error("Audio fallback failed:", audioErr)
        // If both subtitle and audio fail, return whatever metadata we have
        if (!metadata.title && !metadata.description) {
          return NextResponse.json(
            { error: "No se pudieron obtener subtítulos ni audio de este video." },
            { status: 422 }
          )
        }
      }
    }

    // Build transcript: metadata first (context), then the actual speech content
    const parts: string[] = []
    if (metadata.title) parts.push(`Título del video: ${metadata.title}`)
    if (metadata.description?.trim()) parts.push(`Descripción del video:\n${metadata.description}`)
    if (captionsText) parts.push(`Contenido hablado:\n${captionsText}`)

    const transcript = parts.join("\n\n")
    return NextResponse.json({ transcript, source })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al procesar el video" }, { status: 500 })
  }
}
