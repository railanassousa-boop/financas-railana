import { useState } from 'react'
import { Button, Card, Input, Select } from '../components/ui'
import { useAppStore } from '../store/app-store'
import type { RecurrencePattern, Routine } from '../types/domain'

const recurrences: RecurrencePattern[] = ['daily', 'weekdays', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom']

export const RoutinesPage = () => {
  const [name, setName] = useState('')
  const [time, setTime] = useState('08:00')
  const [recurrence, setRecurrence] = useState<RecurrencePattern>('daily')
  const addRoutine = useAppStore((state) => state.addRoutine)
  const user = useAppStore((state) => state.currentUser)
  const routines = useAppStore((state) =>
    state.routines.filter((routine) => routine.userId === user?.id),
  )

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-semibold">Rotinas</h1>
        <div className="grid gap-2 md:grid-cols-4">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome da rotina" />
          <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          <Select value={recurrence} onChange={(event) => setRecurrence(event.target.value as RecurrencePattern)}>
            {recurrences.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
          <Button
            onClick={() => {
              if (!name) return
              addRoutine({ name, time, recurrence, items: [] })
              setName('')
            }}
          >
            Criar rotina
          </Button>
        </div>
      </Card>

      <div className="grid gap-2">
        {routines.map((routine: Routine) => (
          <Card key={routine.id}>
            <p className="font-medium">{routine.name}</p>
            <p className="text-sm text-slate-500">
              {routine.recurrence} • {routine.time}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
