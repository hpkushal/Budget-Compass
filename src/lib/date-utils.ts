import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export const DEFAULT_TIMEZONE = 'America/Halifax'

export function formatDateInTimezone(
  date: Date | string,
  formatString: string = 'PPP',
  timezone: string = DEFAULT_TIMEZONE
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const zonedDate = toZonedTime(dateObj, timezone)
  return format(zonedDate, formatString)
}

export function getCurrentDateInTimezone(timezone: string = DEFAULT_TIMEZONE): Date {
  return toZonedTime(new Date(), timezone)
}

export function convertToUserTimezone(date: Date | string, timezone: string = DEFAULT_TIMEZONE): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return toZonedTime(dateObj, timezone)
}

export function convertFromUserTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  return fromZonedTime(date, timezone)
}

export function getMonthBounds(date: Date, timezone: string = DEFAULT_TIMEZONE) {
  const zonedDate = toZonedTime(date, timezone)
  return {
    start: startOfMonth(zonedDate),
    end: endOfMonth(zonedDate)
  }
}

export function getWeekBounds(date: Date, timezone: string = DEFAULT_TIMEZONE) {
  const zonedDate = toZonedTime(date, timezone)
  return {
    start: startOfWeek(zonedDate, { weekStartsOn: 1 }), // Monday start
    end: endOfWeek(zonedDate, { weekStartsOn: 1 })
  }
}

export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

export function getMonthName(monthNumber: number): string {
  const date = new Date(2024, monthNumber - 1, 1) // monthNumber is 1-based
  return format(date, 'MMMM')
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1 // Convert to 1-based
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

