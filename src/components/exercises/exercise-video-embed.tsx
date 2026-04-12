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

export function ExerciseVideoEmbed({
  videoUrl,
  videoSearchQuery,
}: ExerciseVideoEmbedProps) {
  const searchUrl = toSearchUrl(videoSearchQuery)
  const targetUrl = videoUrl.trim() || searchUrl

  return (
    <div className="theme-soft-panel space-y-3 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        <PlayCircle className="size-3.5" />
        Form reference
      </div>

      {targetUrl ? (
        <Button asChild size="sm" variant="outline">
          <a href={targetUrl} rel="noreferrer" target="_blank">
            Go to YouTube
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">No video reference yet.</p>
      )}
    </div>
  )
}
