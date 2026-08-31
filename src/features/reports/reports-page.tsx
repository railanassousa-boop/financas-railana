import { Card } from '../../components/ui'
import { taskSelectors, useAppStore } from '../../store/app-store'

export const ReportsPage = () => {
  const tasks = useAppStore((state) => taskSelectors.byCurrentUser(state))
  const completed = useAppStore((state) => taskSelectors.completed(state))
  const overdue = useAppStore((state) => taskSelectors.overdue(state))

  const grouped = tasks.reduce(
    (accumulator, task) => {
      accumulator[task.priority] += 1
      return accumulator
    },
    { low: 0, medium: 0, high: 0, urgent: 0 },
  )

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Relatórios</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Card>Taxa de conclusão: {tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0}%</Card>
        <Card>Pendentes: {tasks.length - completed.length}</Card>
        <Card>Atrasadas: {overdue.length}</Card>
      </div>
      <Card>
        <h2 className="mb-2 font-medium">Distribuição por prioridade</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>Baixa: {grouped.low}</li>
          <li>Média: {grouped.medium}</li>
          <li>Alta: {grouped.high}</li>
          <li>Urgente: {grouped.urgent}</li>
        </ul>
      </Card>
    </div>
  )
}
