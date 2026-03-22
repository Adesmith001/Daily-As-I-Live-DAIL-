import { getCurrentWeekDays, getTodayKey } from '@/lib/date'
import { cn } from '@/lib/utils'

export function WeekStrip() {
  const today = getTodayKey()
  const days = getCurrentWeekDays()

  return (
    <div className="theme-week-strip p-3">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isToday = day.key === today

          return (
            <div
              key={day.key}
              className={cn(
                'flex flex-col items-center gap-1 rounded-[1.2rem] px-1 py-2 text-center transition',
                isToday && 'theme-week-active',
              )}
            >
              <span
                className={cn(
                  'text-[0.62rem] font-medium uppercase tracking-[0.16em]',
                  isToday ? 'text-white/70' : 'text-muted-foreground',
                )}
              >
                {day.weekday.slice(0, 3)}
              </span>
              <span className="text-sm font-semibold">{day.dayNumber}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
