import type { ExerciseWeekday } from '@/types/models'

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

const weekdayOrder: ExerciseWeekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getTodayKey() {
  return formatDateKey(new Date())
}

export function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateLabel(value: string) {
  return parseDateKey(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDateLabel(value: string) {
  return parseDateKey(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function formatFriendlyDay(value: string) {
  const today = getTodayKey()
  if (value === today) {
    return 'Today'
  }

  const yesterday = shiftDateKey(today, -1)
  if (value === yesterday) {
    return 'Yesterday'
  }

  return formatDateLabel(value)
}

export function shiftDateKey(value: string, amount: number) {
  const next = parseDateKey(value)
  next.setDate(next.getDate() + amount)
  return formatDateKey(next)
}

export function daysBetween(start: string, end: string) {
  const startDate = parseDateKey(start)
  const endDate = parseDateKey(end)
  const diff = endDate.getTime() - startDate.getTime()
  return Math.round(diff / 86400000)
}

export function isDateWithinDays(value: string, days: number, now = getTodayKey()) {
  return daysBetween(value, now) >= 0 && daysBetween(value, now) < days
}

export function getCurrentWeekDays(reference = new Date()) {
  const current = new Date(reference)
  const day = current.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day

  current.setDate(current.getDate() + mondayOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(current)
    date.setDate(current.getDate() + index)

    return {
      key: formatDateKey(date),
      weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: date.getDate(),
      weekdayKey: getExerciseWeekdayFromDateKey(formatDateKey(date)),
    }
  })
}

export function getExerciseWeekdayOrder(weekday: ExerciseWeekday) {
  return weekdayOrder.indexOf(weekday)
}

export function getExerciseWeekdayFromDateKey(value: string): ExerciseWeekday {
  const day = parseDateKey(value).getDay()
  if (day === 0) {
    return 'sunday'
  }

  return weekdayOrder[day - 1] ?? 'monday'
}

export function getExerciseWeekdayLabel(weekday: ExerciseWeekday) {
  return weekday[0].toUpperCase() + weekday.slice(1)
}

export function getExerciseWeekdayKeys() {
  return [...weekdayOrder]
}
