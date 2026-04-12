import { ExternalLink, PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface ExerciseVideoEmbedProps {
  title: string
  videoUrl: string
  videoSearchQuery: string
}

function toSearchUrl(query: string) {
  if (!query.trim()) {
    return ''
  }

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`
}

function toSearchEmbedUrl(query: string) {
  if (!query.trim()) {
    return ''
  }

  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query.trim())}`
}

function toVideoEmbedUrl(videoId: string) {
  if (!videoId) {
    return ''
  }

  return `https://www.youtube.com/embed/${videoId}`
}

function getYouTubeEmbedUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) {
    return ''
  }

  try {
    const parsed = new URL(trimmed)
    const hostname = parsed.hostname.replace('www.', '').replace('m.', '')
    const pathSegments = parsed.pathname.split('/').filter(Boolean)

    if (hostname === 'youtu.be') {
      const videoId = pathSegments[0] ?? ''
      return toVideoEmbedUrl(videoId)
    }

    if (hostname === 'youtube.com' || hostname === 'youtube-nocookie.com') {
      const videoId = parsed.searchParams.get('v')
      if (videoId) {
        return toVideoEmbedUrl(videoId)
      }

      if (pathSegments[0] === 'embed' && pathSegments[1]) {
        return toVideoEmbedUrl(pathSegments[1])
      }

      if (pathSegments[0] === 'shorts' && pathSegments[1]) {
        return toVideoEmbedUrl(pathSegments[1])
      }

      if (pathSegments[0] === 'live' && pathSegments[1]) {
        return toVideoEmbedUrl(pathSegments[1])
      }

      const playlistId = parsed.searchParams.get('list')
      if (playlistId) {
        return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}`
      }

      const searchQuery = parsed.searchParams.get('search_query')
      if (searchQuery) {
        return toSearchEmbedUrl(searchQuery)
      }
    }
  } catch {
    return ''
  }

  return ''
}

export function ExerciseVideoEmbed({
  title,
  videoUrl,
  videoSearchQuery,
}: ExerciseVideoEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl) || toSearchEmbedUrl(videoSearchQuery)
  const searchUrl = toSearchUrl(videoSearchQuery)
  const fallbackUrl = videoUrl.trim() || searchUrl

  return (
    <div className="theme-soft-panel space-y-3 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        <PlayCircle className="size-3.5" />
        Form reference
      </div>

      {embedUrl ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-black/5">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="aspect-video w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={embedUrl}
            title={`${title} video reference`}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-5 text-sm text-muted-foreground">
          Embed unavailable for this link. Use the quick open action below.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {fallbackUrl ? (
          <Button asChild size="sm" variant="outline">
            <a href={fallbackUrl} rel="noreferrer" target="_blank">
              Open reference
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : null}
        {searchUrl && searchUrl !== fallbackUrl ? (
          <Button asChild size="sm" variant="ghost">
            <a href={searchUrl} rel="noreferrer" target="_blank">
              Search tutorial
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
