import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        alt="DAIL logo"
        className="size-11 rounded-xl border border-border object-cover"
        src="/dail-logo.jpg"
      />
      <div>
        <p className="font-serif text-2xl leading-none tracking-[-0.05em]">DAIL</p>
        {/* <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
          Daily As I Live
        </p> */}
      </div>
    </div>
  )
}
