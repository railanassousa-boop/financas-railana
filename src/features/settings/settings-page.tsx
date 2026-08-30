import { useEffect } from 'react'
import { Button, Card, Input, Select } from '../../components/ui'
import { useAppStore } from '../../store/app-store'
import type { SundayRule } from '../../types/domain'

export const SettingsPage = () => {
  const user = useAppStore((state) => state.currentUser)
  const updatePreferences = useAppStore((state) => state.updatePreferences)
  const addFolder = useAppStore((state) => state.addFolder)

  useEffect(() => {
    const root = document.documentElement
    const mode = user?.theme ?? 'system'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = mode === 'dark' || (mode === 'system' && prefersDark)
    root.classList.toggle('dark', shouldUseDark)
  }, [user?.theme])

  if (!user) return null

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-semibold">Configurações</h1>
        <label className="text-sm">Tema</label>
        <Select
          value={user.theme}
          onChange={(event) =>
            updatePreferences({ theme: event.target.value as 'light' | 'dark' | 'system' })
          }
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="system">Automático</option>
        </Select>

        <label className="text-sm">Preservar domingos</label>
        <Select
          value={String(user.preserveSundays)}
          onChange={(event) => updatePreferences({ preserveSundays: event.target.value === 'true' })}
        >
          <option value="true">Ativado</option>
          <option value="false">Desativado</option>
        </Select>

        <label className="text-sm">Regra para domingos</label>
        <Select
          value={user.sundayRule}
          onChange={(event) => updatePreferences({ sundayRule: event.target.value as SundayRule })}
        >
          <option value="next_monday">Mover para segunda-feira</option>
          <option value="previous_saturday">Antecipar para sábado</option>
        </Select>
      </Card>

      <Card className="space-y-2">
        <h2 className="font-medium">Pastas e subpastas</h2>
        <Button onClick={() => addFolder('Nova pasta', '#6366f1', 'folder')}>Criar pasta rápida</Button>
        <Input disabled value="CRUD completo de pastas preparado no estado global" />
      </Card>
    </div>
  )
}
