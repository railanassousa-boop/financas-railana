import { useRef } from 'react'
import { toast } from 'sonner'
import { Button, Card } from '../../components/ui'
import { useAppStore } from '../../store/app-store'

export const BackupPage = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const store = useAppStore((state) => state)

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-semibold">Backup</h1>
        <Button
          onClick={() => {
            const payload = JSON.stringify(
              {
                tasks: store.tasks,
                routines: store.routines,
                projects: store.projects,
                notes: store.notes,
                folders: store.folders,
                settings: store.currentUser,
              },
              null,
              2,
            )
            const blob = new Blob([payload], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = 'financas-backup.json'
            anchor.click()
            URL.revokeObjectURL(url)
          }}
        >
          Exportar Backup
        </Button>

        <input ref={inputRef} type="file" accept="application/json" className="hidden" />
        <Button className="bg-slate-700 hover:bg-slate-600" onClick={() => inputRef.current?.click()}>
          Importar backup
        </Button>
        <p className="text-sm text-slate-500">
          A importação mostra uma prévia e pede confirmação antes de aplicar.
        </p>
      </Card>

      <Card>
        <Button
          className="bg-amber-600 hover:bg-amber-500"
          onClick={() => toast.info('Importação completa será conectada ao backend no próximo passo.')}
        >
          Simular prévia de importação
        </Button>
      </Card>
    </div>
  )
}
