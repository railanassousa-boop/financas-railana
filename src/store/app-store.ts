import { isBefore, isSameDay, parseISO, startOfToday } from 'date-fns'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateRecurringTask } from '../lib/recurrence'
import type {
  CalendarEvent,
  Folder,
  Note,
  NotificationItem,
  Project,
  Routine,
  Task,
  TaskPriority,
  TaskStatus,
  UserProfile,
} from '../types/domain'

interface LoginInput {
  email: string
  password: string
}

interface AppState {
  currentUser: UserProfile | null
  users: UserProfile[]
  tasks: Task[]
  folders: Folder[]
  routines: Routine[]
  projects: Project[]
  notes: Note[]
  events: CalendarEvent[]
  notifications: NotificationItem[]
  onboardingDone: boolean
  login: (input: LoginInput) => boolean
  register: (name: string, email: string) => void
  logout: () => void
  finishOnboarding: (folders: string[]) => void
  updatePreferences: (changes: Partial<UserProfile>) => void
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, changes: Partial<Task>) => void
  completeTask: (id: string) => void
  removeTask: (id: string) => void
  addFolder: (name: string, color: string, icon: string, parentId?: string) => void
  addRoutine: (routine: Omit<Routine, 'id' | 'userId'>) => void
  addNote: (note: Omit<Note, 'id' | 'userId'>) => void
  addProject: (project: Omit<Project, 'id' | 'userId'>) => void
  addEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => void
  markNotificationRead: (id: string) => void
}

const nowIso = () => new Date().toISOString()

const demoUserId = crypto.randomUUID()

const demoUser: UserProfile = {
  id: demoUserId,
  email: 'demo@financas.app',
  name: 'Usuária Demo',
  preserveSundays: true,
  sundayRule: 'next_monday',
  theme: 'system',
}

const defaultTask = (title: string, dueOffsetDays: number, priority: TaskPriority): Task => {
  const date = new Date()
  date.setDate(date.getDate() + dueOffsetDays)
  return {
    id: crypto.randomUUID(),
    userId: demoUserId,
    title,
    description: 'Dado de demonstração',
    status: 'todo',
    priority,
    dueDate: date.toISOString(),
    tags: ['demo'],
    favorite: false,
    checklist: [],
    links: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

const createDemoState = () => ({
  currentUser: demoUser,
  users: [demoUser],
  tasks: [
    defaultTask('Conferir contas a pagar', 0, 'urgent'),
    defaultTask('Atualizar fluxo de caixa', 1, 'high'),
    defaultTask('Revisar relatório mensal', -1, 'medium'),
  ],
  folders: [
    { id: crypto.randomUUID(), userId: demoUserId, name: 'Trabalho', color: '#6366f1', icon: 'briefcase' },
    { id: crypto.randomUUID(), userId: demoUserId, name: 'Estudos', color: '#10b981', icon: 'book' },
    { id: crypto.randomUUID(), userId: demoUserId, name: 'Finanças', color: '#f59e0b', icon: 'wallet' },
    { id: crypto.randomUUID(), userId: demoUserId, name: 'Pessoal', color: '#ec4899', icon: 'heart' },
  ],
  routines: [],
  projects: [],
  notes: [],
  events: [],
  notifications: [],
  onboardingDone: false,
})

const userTasks = (tasks: Task[], userId: string) => tasks.filter((task) => task.userId === userId)

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createDemoState(),
      login: ({ email }) => {
        const user = get().users.find((existingUser) => existingUser.email === email)
        if (!user) return false
        set({ currentUser: user })
        return true
      },
      register: (name, email) => {
        const user: UserProfile = {
          id: crypto.randomUUID(),
          name,
          email,
          preserveSundays: true,
          sundayRule: 'next_monday',
          theme: 'system',
        }
        set((state) => ({
          users: [...state.users, user],
          currentUser: user,
          onboardingDone: false,
        }))
      },
      logout: () => set({ currentUser: null }),
      finishOnboarding: (folderNames) => {
        const user = get().currentUser
        if (!user) return
        const createdFolders = folderNames.map((name) => ({
          id: crypto.randomUUID(),
          userId: user.id,
          name,
          color: '#6366f1',
          icon: 'folder',
        }))
        set((state) => ({
          folders: [...state.folders, ...createdFolders],
          onboardingDone: true,
        }))
      },
      updatePreferences: (changes) => {
        const user = get().currentUser
        if (!user) return
        const updated = { ...user, ...changes }
        set((state) => ({
          currentUser: updated,
          users: state.users.map((u) => (u.id === user.id ? updated : u)),
        }))
      },
      addTask: (task) => {
        const user = get().currentUser
        if (!user) return
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          userId: user.id,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }))
      },
      updateTask: (id, changes) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...changes,
                  updatedAt: nowIso(),
                }
              : task,
          ),
        }))
      },
      completeTask: (id) => {
        const state = get()
        const user = state.currentUser
        if (!user) return

        const target = state.tasks.find((task) => task.id === id)
        if (!target) return

        const completedTask: Task = {
          ...target,
          status: 'done',
          completedAt: nowIso(),
          updatedAt: nowIso(),
        }

        const createdNotification: NotificationItem = {
          id: crypto.randomUUID(),
          userId: user.id,
          message: `Tarefa concluída: ${target.title}`,
          read: false,
          createdAt: nowIso(),
        }

        const generatedTask = generateRecurringTask(
          completedTask,
          user.preserveSundays,
          user.sundayRule,
        )

        set((previous) => {
          const updatedTasks = previous.tasks.map((task) => (task.id === id ? completedTask : task))
          const shouldAppendRecurring =
            generatedTask && !updatedTasks.some((task) => task.title === generatedTask.title && task.dueDate === generatedTask.dueDate)

          return {
            tasks: shouldAppendRecurring ? [...updatedTasks, generatedTask] : updatedTasks,
            notifications: [...previous.notifications, createdNotification],
          }
        })
      },
      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },
      addFolder: (name, color, icon, parentId) => {
        const user = get().currentUser
        if (!user) return
        set((state) => ({
          folders: [
            ...state.folders,
            { id: crypto.randomUUID(), userId: user.id, name, color, icon, parentId },
          ],
        }))
      },
      addRoutine: (routine) => {
        const user = get().currentUser
        if (!user) return
        set((state) => ({
          routines: [...state.routines, { ...routine, id: crypto.randomUUID(), userId: user.id }],
        }))
      },
      addNote: (note) => {
        const user = get().currentUser
        if (!user) return
        set((state) => ({
          notes: [...state.notes, { ...note, id: crypto.randomUUID(), userId: user.id }],
        }))
      },
      addProject: (project) => {
        const user = get().currentUser
        if (!user) return
        set((state) => ({
          projects: [...state.projects, { ...project, id: crypto.randomUUID(), userId: user.id }],
        }))
      },
      addEvent: (event) => {
        const user = get().currentUser
        if (!user) return
        set((state) => ({
          events: [...state.events, { ...event, id: crypto.randomUUID(), userId: user.id }],
        }))
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification,
          ),
        }))
      },
    }),
    {
      name: 'financas-railana-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        tasks: state.tasks,
        folders: state.folders,
        routines: state.routines,
        projects: state.projects,
        notes: state.notes,
        events: state.events,
        notifications: state.notifications,
        onboardingDone: state.onboardingDone,
      }),
    },
  ),
)

export const taskSelectors = {
  byCurrentUser: (state: AppState) => {
    if (!state.currentUser) return []
    return userTasks(state.tasks, state.currentUser.id)
  },
  today: (state: AppState) => {
    if (!state.currentUser) return []
    return userTasks(state.tasks, state.currentUser.id).filter((task) =>
      task.dueDate ? isSameDay(parseISO(task.dueDate), startOfToday()) : false,
    )
  },
  overdue: (state: AppState) => {
    if (!state.currentUser) return []
    return userTasks(state.tasks, state.currentUser.id).filter((task) =>
      task.dueDate
        ? isBefore(parseISO(task.dueDate), startOfToday()) && task.status !== 'done'
        : false,
    )
  },
  favorites: (state: AppState) => {
    if (!state.currentUser) return []
    return userTasks(state.tasks, state.currentUser.id).filter((task) => task.favorite)
  },
  completed: (state: AppState) => {
    if (!state.currentUser) return []
    return userTasks(state.tasks, state.currentUser.id).filter((task) => task.status === 'done')
  },
}

export const taskStatusOptions: { label: string; value: TaskStatus }[] = [
  { label: 'A fazer', value: 'todo' },
  { label: 'Em andamento', value: 'in_progress' },
  { label: 'Concluída', value: 'done' },
  { label: 'Cancelada', value: 'cancelled' },
  { label: 'Adiada', value: 'postponed' },
]

export const taskPriorityOptions: { label: string; value: TaskPriority }[] = [
  { label: 'Baixa', value: 'low' },
  { label: 'Média', value: 'medium' },
  { label: 'Alta', value: 'high' },
  { label: 'Urgente', value: 'urgent' },
]
