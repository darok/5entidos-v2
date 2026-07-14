import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const execFileAsync = promisify(execFile)

// Spoofing the Android client historically dodges throttling that hits
// yt-dlp's default web client on cloud IPs. YouTube's anti-bot measures
// shift often — re-tune this against real logs if captions start failing again.
export const EXTRACTOR_ARGS = 'youtube:player_client=android,web'

// ── URL parsing ──────────────────────────────────────────────────

// Extracts a YouTube video ID from watch, youtu.be, or shorts URLs.
export function extractVideoId(url) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('?')[0] || null
    if (parsed.searchParams.has('v')) return parsed.searchParams.get('v')
    const shorts = parsed.pathname.match(/\/shorts\/([^/?]+)/)
    if (shorts) return shorts[1]
    return null
  } catch {
    return null
  }
}

// ── Captions ─────────────────────────────────────────────────────

// Parses a WebVTT string into plain text, stripping timestamps and tags.
export function parseVtt(vtt) {
  return vtt
    .split('\n')
    .filter(line => {
      const t = line.trim()
      if (!t || t === 'WEBVTT') return false
      if (/^(NOTE|STYLE|REGION|Kind:|Language:)/.test(t)) return false
      if (/^\d{2}:\d{2}/.test(t)) return false  // timestamp
      if (/^\d+$/.test(t)) return false           // cue index
      return true
    })
    .map(line => line.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Runs yt-dlp to get subtitle file(s), returns parsed text or null.
// yt-dlp uses YouTube's Innertube API (not page scraping) so it bypasses the 429.
export async function getYtCaptions(videoId) {
  const dir = await mkdtemp(join(tmpdir(), 'recipe-yt-'))
  try {
    await execFileAsync('yt-dlp', [
      '--write-auto-subs', '--write-subs',
      '--sub-langs', 'es,es-*,en',
      '--sub-format', 'vtt',
      '--skip-download',
      '--no-warnings',
      '--extractor-args', EXTRACTOR_ARGS,
      '--output', join(dir, 'video'),
      `https://www.youtube.com/watch?v=${videoId}`,
    ], { timeout: 40_000 })

    const files = await readdir(dir)
    const vttFile = files.find(f => f.endsWith('.vtt'))
    if (!vttFile) { console.log('[yt] yt-dlp: no VTT file produced'); return null }

    const text = parseVtt(await readFile(join(dir, vttFile), 'utf8'))
    console.log(`[yt] yt-dlp captions: ${text.length} chars (${vttFile})`)
    return text || null
  } catch (err) {
    const msg = err.message?.slice(0, 300) ?? ''
    if (err.code === 'ENOENT') console.error('[yt] yt-dlp not installed')
    else console.error('[yt] yt-dlp captions error:', msg)
    return null
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

// ── Metadata ─────────────────────────────────────────────────────

// Fetches title via YouTube's public oEmbed endpoint (no key, never rate-limited).
async function getOembedTitle(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`)
    if (!res.ok) return null
    const data = await res.json()
    return data.title ?? null
  } catch {
    return null
  }
}

// Fetches title + description via the official YouTube Data API v3 (never rate-limited
// like scraping/yt-dlp). Falls back to oEmbed (title only) if no key or the call fails —
// title-only is strictly better than nothing.
export async function getVideoMetadata(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.log('[yt] YOUTUBE_API_KEY not set, falling back to oEmbed for title only')
    return { title: await getOembedTitle(videoId), description: null }
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    )
    if (!res.ok) throw new Error(`Data API ${res.status}`)
    const data = await res.json()
    const snippet = data.items?.[0]?.snippet
    if (!snippet) throw new Error('no snippet in response')
    console.log(`[yt] Data API metadata: title=${!!snippet.title} description=${snippet.description?.length ?? 0} chars`)
    return { title: snippet.title ?? null, description: snippet.description || null }
  } catch (err) {
    console.error('[yt] Data API metadata error, falling back to oEmbed:', err.message)
    return { title: await getOembedTitle(videoId), description: null }
  }
}
