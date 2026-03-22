import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="theme-brand-tile flex size-11 items-center justify-center rounded-[1.35rem] text-lg font-semibold">
        D
      </div>
      <div>
        <p className="font-serif text-2xl leading-none tracking-[-0.05em]">DAIL</p>
        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
          Daily As I Live
        </p>
      </div>
    </div>
  )
}
