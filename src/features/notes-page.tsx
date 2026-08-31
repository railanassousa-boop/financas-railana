import { useState } from 'react'
import { Button, Card, Input } from '../components/ui'
import { useAppStore } from '../store/app-store'
import type { Note } from '../types/domain'

export const NotesPage = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const addNote = useAppStore((state) => state.addNote)
  const user = useAppStore((state) => state.currentUser)
  const notes = useAppStore((state) => state.notes.filter((note) => note.userId === user?.id))

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-semibold">Notas</h1>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Conteúdo"
        />
        <Button
          onClick={() => {
            if (!title) return
            addNote({ title, content, tags: [], favorite: false, archived: false })
            setTitle('')
            setContent('')
          }}
        >
          Nova nota
        </Button>
      </Card>
      <div className="grid gap-2">
        {notes.map((note: Note) => (
          <Card key={note.id}>
            <p className="font-medium">{note.title}</p>
            <p className="text-sm text-slate-500">{note.content}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
