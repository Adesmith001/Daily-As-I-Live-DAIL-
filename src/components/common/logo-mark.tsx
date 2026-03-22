import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
        D
      </div>
      <div>
        <p className="font-serif text-2xl leading-none">DAIL</p>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Daily As I Live
        </p>
      </div>
    </div>
  )
}
