import { LoaderCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { THEME_OPTIONS } from '@/lib/themes'
import type { AppTheme } from '@/types/models'

export function ThemePicker({
  value,
  onChange,
  saving,
}: {
  value: AppTheme
  onChange: (theme: AppTheme) => Promise<void>
  saving: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {THEME_OPTIONS.map((theme) => (
          <button
            key={theme.name}
            className={cn(
              'rounded-xl border p-3 text-left transition',
              value === theme.name
                ? 'border-foreground bg-muted'
                : 'border-border bg-card hover:bg-muted',
            )}
            disabled={saving}
            onClick={() => void onChange(theme.name)}
          >
            <div
              className="mb-3 flex h-14 items-end gap-1 rounded-lg border p-2"
              style={{
                backgroundColor: `hsl(${theme.preview.background})`,
                borderColor: `hsl(${theme.preview.border})`,
              }}
            >
              <span
                className="h-5 flex-1 rounded-full"
                style={{ backgroundColor: `hsl(${theme.preview.primary})` }}
              />
              <span
                className="h-9 flex-1 rounded-full"
                style={{ backgroundColor: `hsl(${theme.preview.accent})` }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{theme.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {theme.description}
                </p>
              </div>
              {saving && value === theme.name ? (
                <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
              ) : null}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
