import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button, Card, Input, Select } from '../../components/ui'
import {
  taskPriorityOptions,
  taskSelectors,
  taskStatusOptions,
  useAppStore,
} from '../../store/app-store'
import type { Task, TaskPriority, TaskStatus } from '../../types/domain'

type TaskView = 'all' | 'today' | 'favorites' | 'overdue' | 'completed'

const priorityClassName: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-rose-100 text-rose-700',
}

const statusLabel = (status: TaskStatus) => taskStatusOptions.find((item) => item.value === status)?.label ?? status
const priorityLabel = (priority: TaskPriority) => taskPriorityOptions.find((item) => item.value === priority)?.label ?? priority

const getTasksByView = (view: TaskView) => {
  const state = useAppStore.getState()
  switch (view) {
    case 'today':
      return taskSelectors.today(state)
    case 'favorites':
      return taskSelectors.favorites(state)
    case 'overdue':
      return taskSelectors.overdue(state)
    case 'completed':
      return taskSelectors.completed(state)
    default:
      return taskSelectors.byCurrentUser(state)
  }
}

const TaskRow = ({ task }: { task: Task }) => {
  const updateTask = useAppStore((state) => state.updateTask)
  const completeTask = useAppStore((state) => state.completeTask)
  const removeTask = useAppStore((state) => state.removeTask)

  const checklistProgress = task.checklist.length
    ? `${task.checklist.filter((item) => item.done).length}/${task.checklist.length}`
    : '0/0'

  return (
    <Card className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium">{task.title}</h3>
          <p className="text-sm text-slate-500">{task.description || 'Sem descrição'}</p>
          <p className="text-xs text-slate-500">
            {task.dueDate ? `Prazo: ${format(new Date(task.dueDate), 'dd/MM/yyyy')}` : 'Sem prazo'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2 py-1 text-xs ${priorityClassName[task.priority]}`}>
            {priorityLabel(task.priority)}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
            {statusLabel(task.status)}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-500">Checklist: {checklistProgress}</p>
      <div className="flex flex-wrap gap-2">
        <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => completeTask(task.id)}>
          Concluir
        </Button>
        <Button
          className="bg-amber-600 hover:bg-amber-500"
          onClick={() => updateTask(task.id, { favorite: !task.favorite })}
        >
          {task.favorite ? 'Desfavoritar' : 'Favoritar'}
        </Button>
        <Button className="bg-rose-600 hover:bg-rose-500" onClick={() => removeTask(task.id)}>
          Excluir
        </Button>
      </div>
    </Card>
  )
}

export const TasksPage = ({ view = 'all' }: { view?: TaskView }) => {
  const addTask = useAppStore((state) => state.addTask)
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')

  const tasks = useAppStore(() => getTasksByView(view))

  const filtered = useMemo(() => {
    return tasks
      .filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((task) => (statusFilter === 'all' ? true : task.status === statusFilter))
      .sort((firstTask, secondTask) => firstTask.createdAt.localeCompare(secondTask.createdAt))
  }, [search, statusFilter, tasks])

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Gestão de tarefas</h1>
        <div className="grid gap-2 md:grid-cols-4">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nova tarefa" />
          <Select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
            {taskPriorityOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Input type="date" onChange={() => undefined} />
          <Button
            onClick={() => {
              if (!title.trim()) {
                toast.error('Digite um título para a tarefa')
                return
              }
              addTask({
                title,
                description: '',
                status: 'todo',
                priority,
                tags: [],
                favorite: false,
                checklist: [],
                links: [],
              })
              setTitle('')
              toast.success('Tarefa criada')
            }}
          >
            Nova tarefa
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tarefa" />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'all')}>
            <option value="all">Todos os status</option>
            {taskStatusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
            {filtered.length} resultado(s)
          </p>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">Nenhuma tarefa encontrada.</p>
        </Card>
      ) : (
        <div className="grid gap-3">{filtered.map((task) => <TaskRow key={task.id} task={task} />)}</div>
      )}
    </div>
  )
}
