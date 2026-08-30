import { format } from 'date-fns'
import { useState } from 'react'
import { Button, Card, Input, Select } from '../../components/ui'
import { useAppStore } from '../../store/app-store'
import type { CalendarEvent } from '../../types/domain'

export const CalendarPage = () => {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const addEvent = useAppStore((state) => state.addEvent)
  const user = useAppStore((state) => state.currentUser)
  const events = useAppStore((state) =>
    state.events
      .filter((event) => event.userId === user?.id)
      .sort((firstEvent, secondEvent) => firstEvent.date.localeCompare(secondEvent.date)),
  )

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-semibold">Calendário</h1>
        <div className="grid gap-2 md:grid-cols-4">
          <Input placeholder="Título do compromisso" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          <Select defaultValue="meeting" onChange={() => undefined}>
            <option value="meeting">Compromisso</option>
          </Select>
        </div>
        <Button
          onClick={() => {
            if (!title || !date) return
            addEvent({ title, date: new Date(date).toISOString(), time, type: 'meeting' })
            setTitle('')
            setDate('')
            setTime('')
          }}
        >
          Criar evento
        </Button>
      </Card>

      <div className="grid gap-2">
        {events.map((event: CalendarEvent) => (
          <Card key={event.id}>
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-slate-500">
              {format(new Date(event.date), 'dd/MM/yyyy')} {event.time ?? ''}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
