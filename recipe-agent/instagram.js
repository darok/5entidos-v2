import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

// ── URL parsing ──────────────────────────────────────────────────

// Recognizes Instagram reel/post/tv URLs (not profiles, stories, or other paths).
export function isInstagramUrl(url) {
  try {
    const parsed = new URL(url)
    if (!/(^|\.)instagram\.com$/.test(parsed.hostname)) return false
    return /^\/(reel|reels|p|tv)\//.test(parsed.pathname)
  } catch {
    return false
  }
}

// ── Caption ──────────────────────────────────────────────────────

// Fetches the post's caption via yt-dlp's metadata extraction (no video download).
// For Instagram, yt-dlp's "description" field IS the post caption — usually where
// the ingredient list lives, unlike YouTube where description is a separate field
// from any spoken/captioned content.
export async function getInstagramCaption(url) {
  try {
    const { stdout } = await execFileAsync('yt-dlp', [
      '--dump-json', '--skip-download', '--no-warnings',
      url,
    ], { timeout: 40_000, maxBuffer: 10 * 1024 * 1024 })

    const info = JSON.parse(stdout)
    const caption = info.description || null
    console.log(`[ig] yt-dlp caption: ${caption?.length ?? 0} chars`)
    return caption
  } catch (err) {
    const msg = err.message?.slice(0, 300) ?? ''
    if (err.code === 'ENOENT') console.error('[ig] yt-dlp not installed')
    else console.error('[ig] yt-dlp caption error:', msg)
    return null
  }
}
