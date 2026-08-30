import { useState } from 'react'
import { Button, Card, Input } from '../../components/ui'
import { useAppStore } from '../../store/app-store'

const generatePlan = (prompt: string) => {
  if (!prompt.trim()) return []
  return [
    `Mapear objetivo: ${prompt}`,
    'Quebrar em tarefas menores com prioridade',
    'Agendar prazos realistas no calendário',
    'Criar checklist de execução',
    'Revisar progresso ao final do dia',
  ]
}

export const AIAssistantPage = () => {
  const [prompt, setPrompt] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const addTask = useAppStore((state) => state.addTask)

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-semibold">Assistente de Produtividade IA</h1>
        <Input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Preciso organizar o fechamento financeiro do mês"
        />
        <Button onClick={() => setSuggestions(generatePlan(prompt))}>Gerar planejamento</Button>
      </Card>

      {suggestions.length > 0 && (
        <Card className="space-y-2">
          <h2 className="font-medium">Sugestões</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
          <Button
            onClick={() => {
              suggestions.forEach((title) => {
                addTask({
                  title,
                  description: 'Gerada pelo Assistente IA (template local)',
                  status: 'todo',
                  priority: 'medium',
                  tags: ['ia'],
                  favorite: false,
                  checklist: [],
                  links: [],
                })
              })
            }}
          >
            Criar tarefas
          </Button>
        </Card>
      )}
    </div>
  )
}
