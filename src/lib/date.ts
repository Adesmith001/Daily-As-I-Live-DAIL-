function pad(value: number) {
  return value.toString().padStart(2, '0')
}

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
    }
  })
}
