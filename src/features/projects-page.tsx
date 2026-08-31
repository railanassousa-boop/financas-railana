import { useState } from 'react'
import { Button, Card, Input, Select } from '../components/ui'
import { useAppStore } from '../store/app-store'
import type { Project, TaskPriority } from '../types/domain'

export const ProjectsPage = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const addProject = useAppStore((state) => state.addProject)
  const user = useAppStore((state) => state.currentUser)
  const projects = useAppStore((state) => state.projects.filter((project) => project.userId === user?.id))

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-semibold">Projetos</h1>
        <div className="grid gap-2 md:grid-cols-4">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do projeto" />
          <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição" />
          <Select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </Select>
          <Button
            onClick={() => {
              if (!name) return
              addProject({ name, description, status: 'active', priority, taskIds: [] })
              setName('')
              setDescription('')
            }}
          >
            Criar projeto
          </Button>
        </div>
      </Card>
      <div className="grid gap-2">
        {projects.map((project: Project) => (
          <Card key={project.id}>
            <p className="font-medium">{project.name}</p>
            <p className="text-sm text-slate-500">{project.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
