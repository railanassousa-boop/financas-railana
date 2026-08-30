import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import './App.css'

type Priority = 'Baixa' | 'Média' | 'Alta' | 'Urgente'
type TaskStatus = 'A fazer' | 'Em andamento' | 'Concluída' | 'Cancelada' | 'Adiada'
type RecurrenceType =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly'

type User = {
  id: string
  name: string
  email: string
  password: string
  avatar?: string
}

type ChecklistItem = { id: string; text: string; done: boolean }

type Recurrence = {
  type: RecurrenceType
  interval: number
}

type TaskHistory = { at: string; text: string }

type Task = {
  id: string
  title: string
  description: string
  createdAt: string
  dueDate: string
  time?: string
  status: TaskStatus
  priority: Priority
  folderId?: string
  subfolderId?: string
  tags: string[]
  favorite: boolean
  checklist: ChecklistItem[]
  attachments: string[]
  links: string[]
  comments: string[]
  history: TaskHistory[]
  recurrence: Recurrence
  completedAt?: string
  estimatedMinutes?: number
  spentMinutes?: number
  notes: string
  templateId?: string
}

type Folder = {
  id: string
  name: string
  parentId?: string
  color: string
  icon: string
  order: number
}

type Routine = {
  id: string
  name: string
  dueDate: string
  recurrence: RecurrenceType
  items: ChecklistItem[]
}

type Project = {
  id: string
  name: string
  description: string
  status: TaskStatus
  priority: Priority
  dueDate: string
  taskIds: string[]
  notes: string[]
}

type Note = {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  favorite: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
  linkedTaskId?: string
  linkedFolderId?: string
  linkedRoutineId?: string
  linkedProjectId?: string
}

type CalendarEvent = {
  id: string
  title: string
  date: string
  time?: string
  type: 'Compromisso' | 'Rotina' | 'Tarefa'
}

type AppNotification = {
  id: string
  text: string
  read: boolean
  createdAt: string
}

type UserSettings = {
  theme: 'Claro' | 'Escuro' | 'Automático'
  density: 'Compacta' | 'Confortável' | 'Espaçosa'
  fontSize: 'Pequena' | 'Normal' | 'Grande'
  primaryColor: string
  preserveSundays: boolean
  sundayStrategy: 'next_monday' | 'previous_saturday'
  onboarded: boolean
}

type AppData = {
  folders: Folder[]
  tasks: Task[]
  routines: Routine[]
  projects: Project[]
  notes: Note[]
  events: CalendarEvent[]
  notifications: AppNotification[]
  settings: UserSettings
}

type Page =
  | 'dashboard'
  | 'today'
  | 'tasks'
  | 'favorites'
  | 'overdue'
  | 'completed'
  | 'calendar'
  | 'folders'
  | 'routines'
  | 'projects'
  | 'notes'
  | 'reports'
  | 'ai'
  | 'files'
  | 'settings'

const USERS_KEY = 'financas.users'
const SESSION_KEY = 'financas.session'
const DATA_PREFIX = 'financas.data.'

const priorities: Priority[] = ['Baixa', 'Média', 'Alta', 'Urgente']
const statuses: TaskStatus[] = ['A fazer', 'Em andamento', 'Concluída', 'Cancelada', 'Adiada']

const nowIso = () => new Date().toISOString()
const toDateInput = (iso = new Date().toISOString()) => iso.slice(0, 10)

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

const shiftDate = (date: string, days: number) => {
  const value = new Date(`${date}T08:00:00`)
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

const isOverdue = (task: Task) =>
  task.status !== 'Concluída' && task.status !== 'Cancelada' && task.dueDate < toDateInput()

const getChecklistProgress = (items: ChecklistItem[]) => {
  if (!items.length) return 0
  return Math.round((items.filter((item) => item.done).length / items.length) * 100)
}

const getDefaultSettings = (): UserSettings => ({
  theme: 'Automático',
  density: 'Confortável',
  fontSize: 'Normal',
  primaryColor: '#7c3aed',
  preserveSundays: true,
  sundayStrategy: 'next_monday',
  onboarded: false,
})

const getDemoData = (): AppData => {
  const folders: Folder[] = [
    { id: uid(), name: 'Trabalho', color: '#2563eb', icon: '💼', order: 1 },
    { id: uid(), name: 'Estudos', color: '#059669', icon: '📘', order: 2 },
    { id: uid(), name: 'Finanças', color: '#7c3aed', icon: '💰', order: 3 },
    { id: uid(), name: 'Pessoal', color: '#e11d48', icon: '🏠', order: 4 },
  ]
  const taskId = uid()
  return {
    folders,
    tasks: [
      {
        id: taskId,
        title: 'Fechar relatório mensal',
        description: 'Consolidar dados e enviar versão final',
        createdAt: nowIso(),
        dueDate: toDateInput(),
        time: '16:00',
        status: 'Em andamento',
        priority: 'Alta',
        folderId: folders[2]?.id,
        tags: ['mensal', 'financeiro'],
        favorite: true,
        checklist: [
          { id: uid(), text: 'Conferir dados', done: true },
          { id: uid(), text: 'Atualizar planilha', done: true },
          { id: uid(), text: 'Gerar relatório', done: false },
        ],
        attachments: [],
        links: ['https://example.com'],
        comments: ['Dados de demonstração.'],
        history: [{ at: nowIso(), text: 'Tarefa criada (demo).' }],
        recurrence: { type: 'none', interval: 1 },
        notes: '',
      },
    ],
    routines: [
      {
        id: uid(),
        name: 'Rotina de fechamento diário',
        dueDate: toDateInput(),
        recurrence: 'daily',
        items: [
          { id: uid(), text: 'Conferir caixa', done: true },
          { id: uid(), text: 'Registrar despesas', done: false },
        ],
      },
    ],
    projects: [
      {
        id: uid(),
        name: 'Organização Financeira',
        description: 'Projeto inicial de demonstração',
        status: 'Em andamento',
        priority: 'Alta',
        dueDate: shiftDate(toDateInput(), 20),
        taskIds: [taskId],
        notes: ['Projeto com dados fictícios de demonstração.'],
      },
    ],
    notes: [
      {
        id: uid(),
        title: 'Nota de boas-vindas',
        content: 'Estes dados são fictícios e podem ser editados.',
        category: 'Demo',
        tags: ['demo'],
        favorite: false,
        archived: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    events: [{ id: uid(), title: 'Reunião de alinhamento', date: toDateInput(), type: 'Compromisso' }],
    notifications: [],
    settings: getDefaultSettings(),
  }
}

const loadUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as User[]
const saveUsers = (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users))
const dataKey = (userId: string) => `${DATA_PREFIX}${userId}`

const loadData = (userId: string): AppData => {
  const raw = localStorage.getItem(dataKey(userId))
  if (!raw) return getDemoData()
  const parsed = JSON.parse(raw) as Partial<AppData>
  return {
    folders: parsed.folders ?? [],
    tasks: parsed.tasks ?? [],
    routines: parsed.routines ?? [],
    projects: parsed.projects ?? [],
    notes: parsed.notes ?? [],
    events: parsed.events ?? [],
    notifications: parsed.notifications ?? [],
    settings: { ...getDefaultSettings(), ...(parsed.settings ?? {}) },
  }
}

const getNextRecurringDate = (
  date: string,
  recurrence: Recurrence,
  settings: UserSettings,
): string | undefined => {
  if (recurrence.type === 'none') return undefined
  const next = new Date(`${date}T08:00:00`)
  const interval = Math.max(1, recurrence.interval || 1)
  if (recurrence.type === 'daily') next.setDate(next.getDate() + interval)
  if (recurrence.type === 'weekdays') {
    next.setDate(next.getDate() + 1)
    while (next.getDay() === 0 || next.getDay() === 6) next.setDate(next.getDate() + 1)
  }
  if (recurrence.type === 'weekly') next.setDate(next.getDate() + 7 * interval)
  if (recurrence.type === 'biweekly') next.setDate(next.getDate() + 14 * interval)
  if (recurrence.type === 'monthly') next.setMonth(next.getMonth() + interval)
  if (recurrence.type === 'yearly') next.setFullYear(next.getFullYear() + interval)

  if (settings.preserveSundays && next.getDay() === 0) {
    next.setDate(next.getDate() + (settings.sundayStrategy === 'next_monday' ? 1 : -1))
  }
  return next.toISOString().slice(0, 10)
}

const parseQuickTaskInput = (text: string) => {
  const lower = text.toLowerCase()
  const dueDate = lower.includes('amanhã') ? shiftDate(toDateInput(), 1) : toDateInput()
  const timeMatch = lower.match(/\b(\d{1,2})h(?:(\d{2}))?\b|\b(\d{1,2}):(\d{2})\b/)
  const hour = timeMatch?.[1] ?? timeMatch?.[3]
  const minute = timeMatch?.[2] ?? timeMatch?.[4] ?? '00'
  const time = hour ? `${hour.padStart(2, '0')}:${minute}` : undefined
  const priority = lower.includes('urgente')
    ? 'Urgente'
    : lower.includes('alta')
      ? 'Alta'
      : lower.includes('média') || lower.includes('media')
        ? 'Média'
        : 'Baixa'

  const title = text
    .replace(/amanhã/gi, '')
    .replace(/às?\s*\d{1,2}(:\d{2})?/gi, '')
    .replace(/\d{1,2}h\d{0,2}/gi, '')
    .replace(/prioridade\s+(alta|média|media|baixa|urgente)/gi, '')
    .replace(/,/g, ' ')
    .trim()
  return { title: title || text.trim(), dueDate, time, priority: priority as Priority }
}

function App() {
  const [sessionUserId, setSessionUserId] = useState<string | null>(localStorage.getItem(SESSION_KEY))
  const [users, setUsers] = useState<User[]>(loadUsers)
  const [data, setData] = useState<AppData | null>(null)
  const [page, setPage] = useState<Page>('dashboard')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'Todos' | TaskStatus>('Todos')
  const [filterPriority, setFilterPriority] = useState<'Todas' | Priority>('Todas')
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: toDateInput(),
    time: '',
    priority: 'Média' as Priority,
    recurrence: 'none' as RecurrenceType,
    folderId: '',
    tags: '',
    checklist: '',
  })
  const [quickText, setQuickText] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiSteps, setAiSteps] = useState<string[]>([])
  const [onboardingUsage, setOnboardingUsage] = useState<'Pessoal' | 'Profissional' | 'Ambos'>('Ambos')
  const [onboardingAreas, setOnboardingAreas] = useState<string[]>([
    'Trabalho',
    'Estudos',
    'Finanças',
    'Casa',
    'Projetos',
    'Pessoal',
  ])

  const currentUser = useMemo(() => users.find((item) => item.id === sessionUserId), [sessionUserId, users])

  useEffect(() => {
    if (!sessionUserId) {
      setData(null)
      return
    }
    setData(loadData(sessionUserId))
  }, [sessionUserId])

  useEffect(() => {
    if (sessionUserId && data) localStorage.setItem(dataKey(sessionUserId), JSON.stringify(data))
  }, [data, sessionUserId])

  useEffect(() => {
    if (data?.settings.theme === 'Escuro') document.body.dataset.theme = 'dark'
    else if (data?.settings.theme === 'Claro') document.body.dataset.theme = 'light'
    else document.body.dataset.theme = ''
  }, [data?.settings.theme])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setShowSearch(false)
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowSearch(true)
      }
      const tag = (event.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (event.key.toLowerCase() === '/') setShowSearch(true)
      if (event.key.toLowerCase() === 'n') {
        setPage('tasks')
        ;(document.getElementById('title-input') as HTMLInputElement | null)?.focus()
      }
      if (event.key.toLowerCase() === 'c' && data) {
        const pending = data.tasks.find((task) => task.status !== 'Concluída')
        if (pending) completeTask(pending.id)
      }
      if (event.key.toLowerCase() === 'f' && data) {
        const target = data.tasks.find((task) => task.status !== 'Concluída')
        if (target) {
          setData({
            ...data,
            tasks: data.tasks.map((task) =>
              task.id === target.id ? { ...task, favorite: !task.favorite } : task,
            ),
          })
        }
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [data, completeTask])

  const update = (next: Partial<AppData>) => setData((prev) => (prev ? { ...prev, ...next } : prev))

  const addNotification = (text: string) => {
    if (!data) return
    update({ notifications: [{ id: uid(), text, read: false, createdAt: nowIso() }, ...data.notifications] })
  }

  function completeTask(taskId: string) {
    if (!data) return
    const task = data.tasks.find((item) => item.id === taskId)
    if (!task) return
    const completedAt = nowIso()
    const doneTask = {
      ...task,
      status: 'Concluída' as TaskStatus,
      completedAt,
      history: [...task.history, { at: completedAt, text: 'Tarefa concluída.' }],
    }

    const tasks = data.tasks.map((item) => (item.id === taskId ? doneTask : item))
    const nextDate = getNextRecurringDate(task.dueDate, task.recurrence, data.settings)
    if (nextDate && !tasks.some((item) => item.templateId === (task.templateId || task.id) && item.dueDate === nextDate)) {
      tasks.push({
        ...task,
        id: uid(),
        dueDate: nextDate,
        status: 'A fazer',
        completedAt: undefined,
        history: [...task.history, { at: nowIso(), text: `Nova recorrência criada para ${nextDate}.` }],
        templateId: task.templateId ?? task.id,
      })
      addNotification(`Recorrência criada: ${task.title} (${nextDate})`)
    }
    update({ tasks })
  }

  const createTask = (event: FormEvent) => {
    event.preventDefault()
    if (!data || !taskForm.title.trim()) return
    const created = nowIso()
    const task: Task = {
      id: uid(),
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      createdAt: created,
      dueDate: taskForm.dueDate,
      time: taskForm.time || undefined,
      status: 'A fazer',
      priority: taskForm.priority,
      folderId: taskForm.folderId || undefined,
      tags: taskForm.tags.split(',').map((item) => item.trim()).filter(Boolean),
      favorite: false,
      checklist: taskForm.checklist
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((text) => ({ id: uid(), text, done: false })),
      attachments: [],
      links: [],
      comments: [],
      history: [{ at: created, text: 'Tarefa criada.' }],
      recurrence: { type: taskForm.recurrence, interval: 1 },
      notes: '',
    }
    update({ tasks: [task, ...data.tasks] })
    if (task.priority === 'Urgente') addNotification(`Tarefa urgente criada: ${task.title}`)
    setTaskForm({
      title: '',
      description: '',
      dueDate: toDateInput(),
      time: '',
      priority: 'Média',
      recurrence: 'none',
      folderId: '',
      tags: '',
      checklist: '',
    })
  }

  const createQuickTask = (event: FormEvent) => {
    event.preventDefault()
    if (!quickText.trim() || !data) return
    const parsed = parseQuickTaskInput(quickText)
    const task: Task = {
      id: uid(),
      title: parsed.title,
      description: '',
      createdAt: nowIso(),
      dueDate: parsed.dueDate,
      time: parsed.time,
      status: 'A fazer',
      priority: parsed.priority,
      tags: [],
      favorite: false,
      checklist: [],
      attachments: [],
      links: [],
      comments: [],
      history: [{ at: nowIso(), text: 'Tarefa criada por ação rápida.' }],
      recurrence: { type: 'none', interval: 1 },
      notes: '',
    }
    update({ tasks: [task, ...data.tasks] })
    setQuickText('')
  }

  const exportBackup = () => {
    if (!data || !currentUser) return
    const backup = { exportedAt: nowIso(), user: { id: currentUser.id, email: currentUser.email }, data }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backup-${currentUser.email}-${toDateInput()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = async (file?: File) => {
    if (!file || !data) return
    const text = await file.text()
    const parsed = JSON.parse(text) as { data?: AppData }
    if (!parsed.data) return
    const incoming = parsed.data
    const ok = confirm(
      `Encontramos ${incoming.tasks?.length ?? 0} tarefas, ${incoming.notes?.length ?? 0} notas, ${incoming.projects?.length ?? 0} projetos e ${incoming.routines?.length ?? 0} rotinas. Importar dados?`,
    )
    if (!ok) return
    update({
      folders: incoming.folders ?? data.folders,
      tasks: incoming.tasks ?? data.tasks,
      routines: incoming.routines ?? data.routines,
      projects: incoming.projects ?? data.projects,
      notes: incoming.notes ?? data.notes,
      events: incoming.events ?? data.events,
      notifications: incoming.notifications ?? data.notifications,
      settings: { ...getDefaultSettings(), ...(incoming.settings ?? {}) },
    })
    addNotification('Backup importado com sucesso.')
  }

  if (!sessionUserId || !currentUser || !data) {
    return (
      <AuthScreen
        onLogin={(email, password) => {
          const found = users.find((user) => user.email === email && user.password === password)
          if (!found) {
            alert('Credenciais inválidas.')
            return
          }

          localStorage.setItem(SESSION_KEY, found.id)
          setSessionUserId(found.id)
        }}
        onRegister={(name, email, password) => {
          if (users.some((user) => user.email === email)) {
            alert('Este e-mail já está cadastrado.')
            return
          }
          const user = { id: uid(), name, email, password }
          const next = [...users, user]
          saveUsers(next)
          setUsers(next)
          localStorage.setItem(SESSION_KEY, user.id)
          setSessionUserId(user.id)
        }}
      />
    )
  }

  if (!data.settings.onboarded) {
    return (
      <main className="auth">
        <section className="card">
          <h2>Vamos organizar seu espaço</h2>
          <p>Defina como deseja usar o sistema no primeiro acesso.</p>
          <label>
            Como deseja utilizar?
            <select
              value={onboardingUsage}
              onChange={(event) =>
                setOnboardingUsage(event.target.value as 'Pessoal' | 'Profissional' | 'Ambos')
              }
            >
              <option>Pessoal</option>
              <option>Profissional</option>
              <option>Ambos</option>
            </select>
          </label>
          <div className="form-grid">
            {['Trabalho', 'Estudos', 'Finanças', 'Casa', 'Saúde', 'Projetos', 'Pessoal'].map((area) => (
              <label key={area}>
                <input
                  type="checkbox"
                  checked={onboardingAreas.includes(area)}
                  onChange={(event) =>
                    setOnboardingAreas((prev) =>
                      event.target.checked ? [...prev, area] : prev.filter((value) => value !== area),
                    )
                  }
                />
                {area}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              const existing = new Set(data.folders.map((folder) => folder.name.toLowerCase()))
              const newFolders = onboardingAreas
                .filter((area) => !existing.has(area.toLowerCase()))
                .map((area, index) => ({
                  id: uid(),
                  name: area,
                  color: '#4f46e5',
                  icon: '📁',
                  order: data.folders.length + index + 1,
                }))
              update({
                folders: [...data.folders, ...newFolders],
                settings: { ...data.settings, onboarded: true },
              })
              addNotification(`Onboarding concluído (${onboardingUsage}).`)
            }}
          >
            Concluir onboarding
          </button>
        </section>
      </main>
    )
  }

  const pendingTasks = data.tasks.filter((task) => task.status !== 'Concluída' && task.status !== 'Cancelada')
  const todayTasks = data.tasks.filter((task) => task.dueDate === toDateInput())
  const overdueTasks = data.tasks.filter(isOverdue)
  const completedTasks = data.tasks.filter((task) => task.status === 'Concluída')
  const urgentTasks = pendingTasks.filter((task) => task.priority === 'Urgente')

  const tasksByPage =
    page === 'today'
      ? data.tasks.filter((task) => task.dueDate === toDateInput() || isOverdue(task))
      : page === 'favorites'
        ? data.tasks.filter((task) => task.favorite)
        : page === 'overdue'
          ? overdueTasks
          : page === 'completed'
            ? completedTasks
            : data.tasks

  const searched = search.trim().toLowerCase()
  const shownTasks = tasksByPage
    .filter((task) => (filterStatus === 'Todos' ? true : task.status === filterStatus))
    .filter((task) => (filterPriority === 'Todas' ? true : task.priority === filterPriority))
    .filter((task) =>
      searched
        ? [task.title, task.description, task.tags.join(' '), task.comments.join(' ')].join(' ').toLowerCase().includes(searched)
        : true,
    )

  const completionRate = data.tasks.length
    ? Math.round((completedTasks.length / Math.max(1, data.tasks.length)) * 100)
    : 0

  const rootStyle: CSSProperties & Record<string, string> = {
    '--primary': data.settings.primaryColor,
    '--density': data.settings.density === 'Compacta' ? '6px' : data.settings.density === 'Espaçosa' ? '16px' : '10px',
    '--font-size': data.settings.fontSize === 'Pequena' ? '14px' : data.settings.fontSize === 'Grande' ? '18px' : '16px',
  }

  const searchResults = searched
    ? [
        ...data.tasks
          .filter((task) => task.title.toLowerCase().includes(searched))
          .map((task) => `Tarefa: ${task.title}`),
        ...data.notes
          .filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(searched))
          .map((note) => `Nota: ${note.title}`),
        ...data.projects
          .filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(searched))
          .map((project) => `Projeto: ${project.name}`),
      ].slice(0, 10)
    : []

  const projectProgress = (project: Project) => {
    if (!project.taskIds.length) return 0
    const projectTasks = data.tasks.filter((task) => project.taskIds.includes(task.id))
    if (!projectTasks.length) return 0
    return Math.round((projectTasks.filter((task) => task.status === 'Concluída').length / projectTasks.length) * 100)
  }

  const markNotificationRead = (id: string) =>
    update({
      notifications: data.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
    })

  const unreadNotifications = data.notifications.filter((item) => !item.read)

  return (
    <div className="app" style={rootStyle}>
      <aside className="sidebar">
        <h1>Organiza+</h1>
        <p className="muted">Olá, {currentUser.name}</p>
        <button
          type="button"
          className="create"
          onClick={() => {
            setPage('tasks')
            ;(document.getElementById('title-input') as HTMLInputElement | null)?.focus()
          }}
        >
          + Criar
        </button>
        <nav>
          {[
            ['dashboard', 'Dashboard'],
            ['today', 'Hoje'],
            ['tasks', 'Tarefas'],
            ['favorites', 'Favoritas'],
            ['overdue', 'Atrasadas'],
            ['completed', 'Concluídas'],
            ['calendar', 'Calendário'],
            ['folders', 'Pastas'],
            ['routines', 'Rotinas'],
            ['projects', 'Projetos'],
            ['notes', 'Notas'],
            ['reports', 'Relatórios'],
            ['ai', 'Assistente IA'],
            ['files', 'Arquivos'],
            ['settings', 'Configurações'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={page === key ? 'active' : ''}
              onClick={() => setPage(key as Page)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(SESSION_KEY)
            setSessionUserId(null)
          }}
        >
          Sair
        </button>
      </aside>

      <main>
        <header>
          <div>
            <strong>{pageTitle(page)}</strong>
            <p className="muted">Ctrl+K para busca global</p>
          </div>
          <input
            placeholder="Pesquisar tarefas, notas, projetos..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </header>

        {showSearch && (
          <section className="card">
            <h3>Busca global</h3>
            <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ctrl+K" />
            <ul>
              {searchResults.length ? searchResults.map((item) => <li key={item}>{item}</li>) : <li>Nenhum resultado.</li>}
            </ul>
          </section>
        )}

        {page === 'dashboard' && (
          <section className="grid">
            <article className="card">
              <h3>Resumo do dia</h3>
              <p>Tarefas de hoje: {todayTasks.length}</p>
              <p>Atrasadas: {overdueTasks.length}</p>
              <p>Concluídas: {completedTasks.length}</p>
              <p>Prioritárias: {urgentTasks.length}</p>
            </article>
            <article className="card">
              <h3>Indicadores</h3>
              <p>Taxa de conclusão: {completionRate}%</p>
              <p>Urgentes: {urgentTasks.length}</p>
              <p>Próximos compromissos: {data.events.filter((e) => e.date >= toDateInput()).length}</p>
            </article>
            <article className="card">
              <h3>Progresso diário</h3>
              <ProgressBar value={completionRate} />
              <p>
                {completedTasks.length} de {data.tasks.length} tarefas concluídas
              </p>
            </article>
            <article className="card">
              <h3>Próximas atividades</h3>
              <p>Próxima tarefa: {pendingTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.title || '-'}</p>
              <p>Próximo compromisso: {data.events.sort((a, b) => a.date.localeCompare(b.date))[0]?.title || '-'}</p>
              <p>Próxima rotina: {data.routines.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.name || '-'}</p>
            </article>
          </section>
        )}

        {(page === 'tasks' || page === 'today' || page === 'favorites' || page === 'overdue' || page === 'completed') && (
          <>
            <section className="card">
              <h3>Nova tarefa</h3>
              <form className="form-grid" onSubmit={createTask}>
                <input
                  id="title-input"
                  placeholder="Título"
                  value={taskForm.title}
                  onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  required
                />
                <input
                  placeholder="Descrição"
                  value={taskForm.description}
                  onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                />
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
                />
                <input
                  type="time"
                  value={taskForm.time}
                  onChange={(event) => setTaskForm({ ...taskForm, time: event.target.value })}
                />
                <select
                  value={taskForm.priority}
                  onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value as Priority })}
                >
                  {priorities.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                <select
                  value={taskForm.recurrence}
                  onChange={(event) =>
                    setTaskForm({ ...taskForm, recurrence: event.target.value as RecurrenceType })
                  }
                >
                  <option value="none">Sem recorrência</option>
                  <option value="daily">Diariamente</option>
                  <option value="weekdays">Dias úteis</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="biweekly">Quinzenalmente</option>
                  <option value="monthly">Mensalmente</option>
                  <option value="yearly">Anualmente</option>
                </select>
                <select
                  value={taskForm.folderId}
                  onChange={(event) => setTaskForm({ ...taskForm, folderId: event.target.value })}
                >
                  <option value="">Sem pasta</option>
                  {data.folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.icon} {folder.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Tags separadas por vírgula"
                  value={taskForm.tags}
                  onChange={(event) => setTaskForm({ ...taskForm, tags: event.target.value })}
                />
                <input
                  placeholder="Checklist (item1, item2...)"
                  value={taskForm.checklist}
                  onChange={(event) => setTaskForm({ ...taskForm, checklist: event.target.value })}
                />
                <button type="submit">Salvar tarefa</button>
              </form>
            </section>

            <section className="card">
              <h3>Ação rápida</h3>
              <form onSubmit={createQuickTask} className="quick-row">
                <input
                  value={quickText}
                  onChange={(event) => setQuickText(event.target.value)}
                  placeholder="Enviar relatório amanhã às 14h, prioridade alta"
                />
                <button type="submit">Interpretar e criar</button>
              </form>
            </section>

            <section className="card">
              <h3>Filtros</h3>
              <div className="toolbar">
                <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)}>
                  <option>Todos</option>
                  {statuses.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                <select
                  value={filterPriority}
                  onChange={(event) => setFilterPriority(event.target.value as typeof filterPriority)}
                >
                  <option>Todas</option>
                  {priorities.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              <ul className="task-list">
                {shownTasks.map((task) => (
                  <li key={task.id} className={isOverdue(task) ? 'overdue' : ''}>
                    <div>
                      <strong>{task.title}</strong>
                      <p>
                        {task.dueDate} {task.time ? `• ${task.time}` : ''} • {task.priority} • {task.status}
                      </p>
                      <p>{task.description}</p>
                      <small>
                        Checklist: {task.checklist.filter((item) => item.done).length}/{task.checklist.length} ({getChecklistProgress(task.checklist)}%)
                      </small>
                    </div>
                    <div className="actions">
                      <button
                        type="button"
                        onClick={() =>
                          update({
                            tasks: data.tasks.map((item) =>
                              item.id === task.id ? { ...item, favorite: !item.favorite } : item,
                            ),
                          })
                        }
                      >
                        {task.favorite ? '★' : '☆'}
                      </button>
                      <button type="button" onClick={() => completeTask(task.id)}>
                        Concluir
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm('Excluir tarefa?')) return
                          update({ tasks: data.tasks.filter((item) => item.id !== task.id) })
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {page === 'calendar' && (
          <section className="card">
            <h3>Calendário (Mês)</h3>
            <CalendarMonth
              tasks={data.tasks}
              events={data.events}
              onCreate={(date) => {
                const title = prompt('Novo compromisso para esta data:')
                if (!title) return
                update({
                  events: [...data.events, { id: uid(), title: title.trim(), date, type: 'Compromisso' }],
                })
              }}
            />
          </section>
        )}

        {page === 'folders' && (
          <section className="card">
            <h3>Pastas e subpastas</h3>
            <form
              className="quick-row"
              onSubmit={(event) => {
                event.preventDefault()
                const target = event.currentTarget.elements.namedItem('folder-name') as HTMLInputElement
                if (!target.value.trim()) return
                update({
                  folders: [
                    ...data.folders,
                    {
                      id: uid(),
                      name: target.value.trim(),
                      color: '#4f46e5',
                      icon: '📁',
                      order: data.folders.length + 1,
                    },
                  ],
                })
                target.value = ''
              }}
            >
              <input name="folder-name" placeholder="Nova pasta" />
              <button type="submit">Criar</button>
            </form>
            <ul>
              {data.folders
                .sort((a, b) => a.order - b.order)
                .map((folder) => (
                  <li key={folder.id}>
                    {folder.icon} {folder.name} — {data.tasks.filter((task) => task.folderId === folder.id).length} tarefas
                  </li>
                ))}
            </ul>
          </section>
        )}

        {page === 'routines' && (
          <section className="card">
            <h3>Rotinas</h3>
            <form
              className="quick-row"
              onSubmit={(event) => {
                event.preventDefault()
                const target = event.currentTarget.elements.namedItem('routine-name') as HTMLInputElement
                if (!target.value.trim()) return
                update({
                  routines: [
                    ...data.routines,
                    {
                      id: uid(),
                      name: target.value.trim(),
                      dueDate: toDateInput(),
                      recurrence: 'daily',
                      items: [
                        { id: uid(), text: 'Etapa 1', done: false },
                        { id: uid(), text: 'Etapa 2', done: false },
                      ],
                    },
                  ],
                })
                target.value = ''
              }}
            >
              <input name="routine-name" placeholder="Nova rotina" />
              <button type="submit">Criar</button>
            </form>
            {data.routines.map((routine) => (
              <article key={routine.id} className="mini-card">
                <strong>{routine.name}</strong>
                <p>
                  {routine.items.filter((item) => item.done).length}/{routine.items.length} concluídas — {getChecklistProgress(routine.items)}%
                </p>
              </article>
            ))}
          </section>
        )}

        {page === 'projects' && (
          <section className="card">
            <h3>Projetos</h3>
            <form
              className="quick-row"
              onSubmit={(event) => {
                event.preventDefault()
                const target = event.currentTarget.elements.namedItem('project-name') as HTMLInputElement
                if (!target.value.trim()) return
                update({
                  projects: [
                    ...data.projects,
                    {
                      id: uid(),
                      name: target.value.trim(),
                      description: '',
                      dueDate: shiftDate(toDateInput(), 30),
                      priority: 'Média',
                      status: 'A fazer',
                      taskIds: [],
                      notes: [],
                    },
                  ],
                })
                target.value = ''
              }}
            >
              <input name="project-name" placeholder="Novo projeto" />
              <button type="submit">Criar</button>
            </form>
            {data.projects.map((project) => (
              <article key={project.id} className="mini-card">
                <strong>{project.name}</strong>
                <ProgressBar value={projectProgress(project)} />
                <p>Progresso: {projectProgress(project)}%</p>
              </article>
            ))}
          </section>
        )}

        {page === 'notes' && (
          <section className="card">
            <h3>Notas</h3>
            <form
              className="form-grid"
              onSubmit={(event) => {
                event.preventDefault()
                const title = (event.currentTarget.elements.namedItem('note-title') as HTMLInputElement).value
                const content = (event.currentTarget.elements.namedItem('note-content') as HTMLInputElement).value
                if (!title.trim()) return
                update({
                  notes: [
                    {
                      id: uid(),
                      title: title.trim(),
                      content: content.trim(),
                      category: 'Geral',
                      tags: [],
                      favorite: false,
                      archived: false,
                      createdAt: nowIso(),
                      updatedAt: nowIso(),
                    },
                    ...data.notes,
                  ],
                })
                event.currentTarget.reset()
              }}
            >
              <input name="note-title" placeholder="Título" required />
              <input name="note-content" placeholder="Conteúdo" />
              <button type="submit">Salvar nota</button>
            </form>
            <ul>
              {data.notes.map((note) => (
                <li key={note.id}>
                  <strong>{note.title}</strong> — {note.content}
                </li>
              ))}
            </ul>
          </section>
        )}

        {page === 'reports' && (
          <section className="card">
            <h3>Relatórios</h3>
            <p>Concluídas no prazo: {completedTasks.filter((task) => !task.completedAt || task.completedAt.slice(0, 10) <= task.dueDate).length}</p>
            <p>Concluídas atrasadas: {completedTasks.filter((task) => !!task.completedAt && task.completedAt.slice(0, 10) > task.dueDate).length}</p>
            <p>Pendentes: {pendingTasks.length}</p>
            <p>Atrasadas: {overdueTasks.length}</p>
            <h4>Distribuição por prioridade</h4>
            {priorities.map((value) => {
              const amount = data.tasks.filter((task) => task.priority === value).length
              const percentage = data.tasks.length ? Math.round((amount / data.tasks.length) * 100) : 0
              return (
                <div key={value}>
                  <span>{value}</span>
                  <ProgressBar value={percentage} />
                </div>
              )
            })}
          </section>
        )}

        {page === 'ai' && (
          <section className="card">
            <h3>Assistente de Produtividade IA</h3>
            <form
              className="quick-row"
              onSubmit={(event) => {
                event.preventDefault()
                const base = aiPrompt
                  .split(/[.,]/)
                  .map((item) => item.trim())
                  .filter(Boolean)
                const fallback = [
                  'Mapear entregas principais',
                  'Quebrar em tarefas menores',
                  'Definir prazos e prioridades',
                  'Executar e revisar progresso',
                ]
                setAiSteps(base.length ? base.map((item) => `Organizar: ${item}`) : fallback)
              }}
            >
              <input
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Preciso organizar o fechamento financeiro do mês"
              />
              <button type="submit">Gerar plano</button>
            </form>
            <ol>
              {aiSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => {
                if (!aiSteps.length) return
                update({
                  tasks: [
                    ...aiSteps.map((step) => ({
                      id: uid(),
                      title: step,
                      description: 'Gerado pelo assistente IA',
                      createdAt: nowIso(),
                      dueDate: toDateInput(),
                      status: 'A fazer' as TaskStatus,
                      priority: 'Média' as Priority,
                      tags: ['IA'],
                      favorite: false,
                      checklist: [],
                      attachments: [],
                      links: [],
                      comments: [],
                      history: [{ at: nowIso(), text: 'Gerado por IA.' }],
                      recurrence: { type: 'none' as RecurrenceType, interval: 1 },
                      notes: '',
                    })),
                    ...data.tasks,
                  ],
                })
              }}
            >
              Criar tarefas
            </button>
          </section>
        )}

        {page === 'files' && (
          <section className="card">
            <h3>Backup e arquivos</h3>
            <div className="quick-row">
              <button type="button" onClick={exportBackup}>
                Exportar Backup
              </button>
              <label className="button-like">
                Importar Backup
                <input
                  type="file"
                  accept="application/json"
                  onChange={(event) => importBackup(event.target.files?.[0])}
                />
              </label>
            </div>
          </section>
        )}

        {page === 'settings' && (
          <section className="card">
            <h3>Configurações → Aparência</h3>
            <div className="form-grid">
              <select
                value={data.settings.theme}
                onChange={(event) => update({ settings: { ...data.settings, theme: event.target.value as UserSettings['theme'] } })}
              >
                <option>Claro</option>
                <option>Escuro</option>
                <option>Automático</option>
              </select>
              <select
                value={data.settings.density}
                onChange={(event) => update({ settings: { ...data.settings, density: event.target.value as UserSettings['density'] } })}
              >
                <option>Compacta</option>
                <option>Confortável</option>
                <option>Espaçosa</option>
              </select>
              <select
                value={data.settings.fontSize}
                onChange={(event) => update({ settings: { ...data.settings, fontSize: event.target.value as UserSettings['fontSize'] } })}
              >
                <option>Pequena</option>
                <option>Normal</option>
                <option>Grande</option>
              </select>
              <label>
                Cor principal
                <input
                  type="color"
                  value={data.settings.primaryColor}
                  onChange={(event) => update({ settings: { ...data.settings, primaryColor: event.target.value } })}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={data.settings.preserveSundays}
                  onChange={(event) =>
                    update({ settings: { ...data.settings, preserveSundays: event.target.checked } })
                  }
                />
                Preservar domingos
              </label>
              <select
                value={data.settings.sundayStrategy}
                onChange={(event) =>
                  update({
                    settings: {
                      ...data.settings,
                      sundayStrategy: event.target.value as UserSettings['sundayStrategy'],
                    },
                  })
                }
              >
                <option value="next_monday">Mover para segunda útil</option>
                <option value="previous_saturday">Antecipar para sábado</option>
              </select>
            </div>
          </section>
        )}

        <section className="card">
          <h3>Central de notificações</h3>
          <p>Não lidas: {unreadNotifications.length}</p>
          <ul>
            {data.notifications.length ? (
              data.notifications.map((item) => (
                <li key={item.id}>
                  {item.text} <small>({item.createdAt.slice(0, 16).replace('T', ' ')})</small>{' '}
                  {!item.read && (
                    <button type="button" onClick={() => markNotificationRead(item.id)}>
                      Marcar como lida
                    </button>
                  )}
                </li>
              ))
            ) : (
              <li>Sem notificações.</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  )
}

function pageTitle(page: Page) {
  return {
    dashboard: 'Dashboard',
    today: 'Hoje',
    tasks: 'Todas as tarefas',
    favorites: 'Favoritas',
    overdue: 'Atrasadas',
    completed: 'Concluídas',
    calendar: 'Calendário',
    folders: 'Pastas',
    routines: 'Rotinas',
    projects: 'Projetos',
    notes: 'Notas',
    reports: 'Relatórios',
    ai: 'Assistente IA',
    files: 'Arquivos / Backup',
    settings: 'Configurações',
  }[page]
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress" aria-label={`Progresso ${value}%`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function CalendarMonth({
  tasks,
  events,
  onCreate,
}: {
  tasks: Task[]
  events: CalendarEvent[]
  onCreate: (date: string) => void
}) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const offset = first.getDay()
  const total = last.getDate()
  const slots = Array.from({ length: Math.ceil((offset + total) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1
    return day > 0 && day <= total ? new Date(year, month, day) : null
  })

  return (
    <div className="calendar-grid">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((label) => (
        <strong key={label}>{label}</strong>
      ))}
      {slots.map((date, index) => {
        if (!date) return <div key={`empty-${index}`} className="calendar-cell muted">-</div>
        const iso = date.toISOString().slice(0, 10)
        const taskCount = tasks.filter((item) => item.dueDate === iso).length
        const eventCount = events.filter((item) => item.date === iso).length
        return (
          <button key={iso} type="button" className="calendar-cell" onClick={() => onCreate(iso)}>
            <span>{date.getDate()}</span>
            <small>
              {taskCount} tarefas • {eventCount} eventos
            </small>
          </button>
        )
      })}
    </div>
  )
}

function AuthScreen({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, password: string) => void
  onRegister: (name: string, email: string, password: string) => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '').trim()
    if (mode === 'login') onLogin(email, password)
    else onRegister(String(form.get('name') ?? '').trim(), email, password)
  }

  return (
    <main className="auth">
      <section className="card">
        <h2>Organiza+ • produtividade pessoal e profissional</h2>
        <p>
          Sistema funcional com tarefas, rotinas, calendário, projetos, notas, relatórios, backup,
          assistente IA e personalização.
        </p>
        <form className="form-grid" onSubmit={submit}>
          {mode === 'register' && <input name="name" placeholder="Nome" required />}
          <input name="email" type="email" placeholder="E-mail" required />
          <input name="password" type="password" placeholder="Senha" required minLength={4} />
          <button type="submit">{mode === 'login' ? 'Entrar' : 'Cadastrar'}</button>
        </form>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
        </button>
      </section>
    </main>
  )
}

export default App
