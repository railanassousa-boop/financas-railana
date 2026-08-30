import { addDays, addMonths, addWeeks, addYears, getDay, isSunday, parseISO } from 'date-fns'
import type { RecurrencePattern, SundayRule, Task } from '../types/domain'

const applySundayRule = (date: Date, enabled: boolean, rule: SundayRule): Date => {
  if (!enabled || !isSunday(date)) return date
  return rule === 'next_monday' ? addDays(date, 1) : addDays(date, -1)
}

export const nextOccurrenceFrom = (
  from: string,
  pattern: RecurrencePattern,
  interval = 1,
  preserveSundays = false,
  sundayRule: SundayRule = 'next_monday',
): string => {
  const parsed = parseISO(from)
  let nextDate = parsed

  switch (pattern) {
    case 'daily':
      nextDate = addDays(parsed, interval)
      break
    case 'weekdays': {
      let candidate = addDays(parsed, 1)
      while ([0, 6].includes(getDay(candidate))) {
        candidate = addDays(candidate, 1)
      }
      nextDate = candidate
      break
    }
    case 'weekly':
      nextDate = addWeeks(parsed, interval)
      break
    case 'biweekly':
      nextDate = addWeeks(parsed, interval * 2)
      break
    case 'monthly':
      nextDate = addMonths(parsed, interval)
      break
    case 'yearly':
      nextDate = addYears(parsed, interval)
      break
    case 'custom':
      nextDate = addDays(parsed, interval)
      break
    default:
      nextDate = addDays(parsed, 1)
      break
  }

  return applySundayRule(nextDate, preserveSundays, sundayRule).toISOString()
}

export const generateRecurringTask = (
  task: Task,
  preserveSundays: boolean,
  sundayRule: SundayRule,
): Task | null => {
  if (!task.recurrence || !task.dueDate) return null

  const nextDueDate = nextOccurrenceFrom(
    task.dueDate,
    task.recurrence.pattern,
    task.recurrence.interval,
    preserveSundays,
    sundayRule,
  )

  if (task.recurrence.endDate && nextDueDate > task.recurrence.endDate) {
    return null
  }

  return {
    ...task,
    id: crypto.randomUUID(),
    status: 'todo',
    favorite: false,
    checklist: task.checklist.map((item) => ({ ...item, done: false })),
    dueDate: nextDueDate,
    completedAt: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
