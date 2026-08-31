import { Card } from '../components/ui'
import { taskSelectors, useAppStore } from '../store/app-store'

export const DashboardPage = () => {
  const tasksToday = useAppStore((state) => taskSelectors.today(state))
  const overdue = useAppStore((state) => taskSelectors.overdue(state))
  const completed = useAppStore((state) => taskSelectors.completed(state))
  const all = useAppStore((state) => taskSelectors.byCurrentUser(state))

  const completionRate = all.length ? Math.round((completed.length / all.length) * 100) : 0

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Resumo do dia</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <Card>Total hoje: {tasksToday.length}</Card>
        <Card>Concluídas: {completed.length}</Card>
        <Card>Atrasadas: {overdue.length}</Card>
        <Card>Taxa de conclusão: {completionRate}%</Card>
      </div>
      <Card>
        <h2 className="mb-2 text-lg font-medium">Progresso diário</h2>
        <div className="h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-indigo-600" style={{ width: `${completionRate}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {completed.length} de {all.length} tarefas concluídas
        </p>
      </Card>
    </div>
  )
}
