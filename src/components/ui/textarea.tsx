import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-28 w-full rounded-2xl border border-border bg-background/75 px-4 py-3 text-sm transition placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-ring',
      className,
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
