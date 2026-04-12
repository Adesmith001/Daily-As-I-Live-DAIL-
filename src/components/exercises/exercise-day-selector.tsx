import { cn } from '@/lib/utils'
import type { ExerciseWeekday } from '@/types/models'

interface ExerciseDayOption {
  key: string
  weekday: string
  dayNumber: number
  weekdayKey: ExerciseWeekday
}

export function ExerciseDaySelector({
  days,
  selectedWeekday,
  onSelect,
}: {
  days: ExerciseDayOption[]
  selectedWeekday: ExerciseWeekday
  onSelect: (weekday: ExerciseWeekday) => void
}) {
  return (
    <div className="theme-week-strip p-3">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isActive = day.weekdayKey === selectedWeekday

          return (
            <button
              key={day.key}
              className={cn(
                'flex flex-col items-center gap-1 rounded-[1.2rem] px-1 py-2 text-center transition',
                isActive ? 'theme-week-active' : 'hover:bg-muted/70',
              )}
              onClick={() => onSelect(day.weekdayKey)}
            >
              <span
                className={cn(
                  'text-[0.62rem] font-medium uppercase tracking-[0.16em]',
                  isActive ? 'text-white/70' : 'text-muted-foreground',
                )}
              >
                {day.weekday.slice(0, 3)}
              </span>
              <span className="text-sm font-semibold">{day.dayNumber}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
