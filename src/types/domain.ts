export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled' | 'postponed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type RecurrencePattern =
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly'
  | 'custom'

export type SundayRule = 'next_monday' | 'previous_saturday'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  preserveSundays: boolean
  sundayRule: SundayRule
  theme: 'light' | 'dark' | 'system'
}

export interface Folder {
  id: string
  userId: string
  name: string
  color: string
  icon: string
  parentId?: string
}

export interface ChecklistItem {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  dueTime?: string
  folderId?: string
  tags: string[]
  favorite: boolean
  checklist: ChecklistItem[]
  links: string[]
  recurrence?: {
    pattern: RecurrencePattern
    interval?: number
    daysOfWeek?: number[]
    dayOfMonth?: number
    startDate: string
    endDate?: string
  }
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface RoutineItem {
  id: string
  title: string
  done: boolean
}

export interface Routine {
  id: string
  userId: string
  name: string
  recurrence: RecurrencePattern
  time?: string
  items: RoutineItem[]
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string
  status: 'active' | 'paused' | 'done'
  priority: TaskPriority
  taskIds: string[]
}

export interface Note {
  id: string
  userId: string
  title: string
  content: string
  tags: string[]
  favorite: boolean
  archived: boolean
  linkedTaskId?: string
  linkedRoutineId?: string
  linkedProjectId?: string
}

export interface CalendarEvent {
  id: string
  userId: string
  title: string
  date: string
  time?: string
  type: 'task' | 'routine' | 'meeting'
  relatedId?: string
}

export interface NotificationItem {
  id: string
  userId: string
  message: string
  read: boolean
  createdAt: string
}
